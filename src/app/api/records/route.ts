import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { DailyWeather } from '@/types';

const OWM_KEY = process.env.OPENWEATHER_API_KEY;
const GEO = 'https://api.openweathermap.org/geo/1.0';

// WMO weather code to description + icon emoji
function wmoToDescription(code: number): { description: string; icon: string } {
  if (code === 0) return { description: 'Clear sky', icon: '☀️' };
  if (code <= 3) return { description: 'Partly cloudy', icon: '⛅' };
  if (code <= 48) return { description: 'Foggy', icon: '🌫️' };
  if (code <= 57) return { description: 'Drizzle', icon: '🌦️' };
  if (code <= 67) return { description: 'Rain', icon: '🌧️' };
  if (code <= 77) return { description: 'Snow', icon: '❄️' };
  if (code <= 82) return { description: 'Rain showers', icon: '🌦️' };
  if (code <= 86) return { description: 'Snow showers', icon: '🌨️' };
  if (code >= 95) return { description: 'Thunderstorm', icon: '⛈️' };
  return { description: 'Unknown', icon: '🌡️' };
}

async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; name: string } | null> {
  if (!OWM_KEY) {
    // Fallback to Open-Meteo geocoding (no API key needed)
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;
    return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name };
  }

  const isZip = /^\d{4,6}(,\w{2})?$/.test(location.trim());
  const url = isZip
    ? `${GEO}/zip?zip=${encodeURIComponent(location)}&appid=${OWM_KEY}`
    : `${GEO}/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OWM_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    // Fallback to Open-Meteo
    const fallback = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );
    if (!fallback.ok) return null;
    const fData = await fallback.json();
    if (!fData.results || fData.results.length === 0) return null;
    return { lat: fData.results[0].latitude, lon: fData.results[0].longitude, name: fData.results[0].name };
  }

  const data = await res.json();
  const point = isZip ? data : data[0];
  if (!point) return null;
  return { lat: point.lat, lon: point.lon, name: point.name };
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

async function fetchFromMeteo(url: string): Promise<DailyWeather[]> {
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.daily || !data.daily.time) return [];
  return data.daily.time.map((date: string, i: number) => {
    const code = data.daily.weathercode?.[i] ?? 0;
    const { description, icon } = wmoToDescription(code);
    return {
      date,
      temp_min: Math.round((data.daily.temperature_2m_min?.[i] ?? 0) * 10) / 10,
      temp_max: Math.round((data.daily.temperature_2m_max?.[i] ?? 0) * 10) / 10,
      temp_mean: Math.round((data.daily.temperature_2m_mean?.[i] ?? 0) * 10) / 10,
      description,
      icon,
    };
  });
}

async function fetchWeatherForRange(
  lat: number,
  lon: number,
  dateFrom: string,
  dateTo: string
): Promise<DailyWeather[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  const archiveCutoff = new Date(today);
  archiveCutoff.setDate(archiveCutoff.getDate() - 5);

  const DAILY = 'daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,weathercode&timezone=auto';

  if (toDate < archiveCutoff) {
    // Entirely in the past — archive API only
    return fetchFromMeteo(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateFrom}&end_date=${dateTo}&${DAILY}`
    );
  }

  if (fromDate >= today) {
    // Entirely in the future — forecast API only
    return fetchFromMeteo(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${dateFrom}&end_date=${dateTo}&${DAILY}`
    );
  }

  // Mixed range: split into archive (past) + forecast (recent/future)
  const results: DailyWeather[][] = [];

  if (fromDate < archiveCutoff) {
    const archiveEnd = toDate < archiveCutoff ? dateTo : formatDate(new Date(archiveCutoff.getTime() - 86400000));
    results.push(await fetchFromMeteo(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateFrom}&end_date=${archiveEnd}&${DAILY}`
    ));
  }

  const forecastStart = fromDate >= archiveCutoff ? dateFrom : formatDate(archiveCutoff);
  results.push(await fetchFromMeteo(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${forecastStart}&end_date=${dateTo}&${DAILY}`
  ));

  return results.flat();
}

// GET /api/records — list all records
export async function GET() {
  try {
    const records = db.getAll();
    return NextResponse.json(records);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/records — create a record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { location, date_from, date_to, notes = '' } = body;

    if (!location || !date_from || !date_to) {
      return NextResponse.json({ error: 'location, date_from, and date_to are required' }, { status: 400 });
    }

    // Validate dates
    const from = new Date(date_from);
    const to = new Date(date_to);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
    }
    if (from > to) {
      return NextResponse.json({ error: 'date_from must be before or equal to date_to' }, { status: 400 });
    }
    const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 365) {
      return NextResponse.json({ error: 'Date range cannot exceed 365 days' }, { status: 400 });
    }

    // Validate and geocode location
    const geo = await geocodeLocation(location);
    if (!geo) {
      return NextResponse.json({
        error: `Location "${location}" not found. Try a different city name, zip code, or coordinates.`
      }, { status: 400 });
    }

    // Fetch historical/forecast weather
    const dailyData = await fetchWeatherForRange(geo.lat, geo.lon, date_from, date_to);

    const temps = dailyData.map(d => d.temp_mean);
    const tempMins = dailyData.map(d => d.temp_min);
    const tempMaxs = dailyData.map(d => d.temp_max);

    const temperature_avg = temps.length > 0 ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length * 10) / 10 : null;
    const temperature_min = tempMins.length > 0 ? Math.min(...tempMins) : null;
    const temperature_max = tempMaxs.length > 0 ? Math.max(...tempMaxs) : null;

    const description = dailyData.length > 0
      ? dailyData[Math.floor(dailyData.length / 2)].description
      : '';
    const weather_icon = dailyData.length > 0
      ? dailyData[Math.floor(dailyData.length / 2)].icon
      : '🌡️';

    const id = db.insert({
      location: geo.name || location,
      latitude: geo.lat,
      longitude: geo.lon,
      date_from,
      date_to,
      temperature_min,
      temperature_max,
      temperature_avg,
      description,
      humidity: 0,
      wind_speed: 0,
      weather_icon,
      daily_data: JSON.stringify(dailyData),
      notes,
    });

    const created = db.getById(id);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
