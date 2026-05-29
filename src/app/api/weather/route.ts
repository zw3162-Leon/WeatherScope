import { NextRequest, NextResponse } from 'next/server';
import type { CurrentWeatherData } from '@/types';

const OWM_KEY = process.env.OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';
const GEO = 'https://api.openweathermap.org/geo/1.0';

async function geocodeByZip(zip: string): Promise<{ lat: number; lon: number; name: string; country: string } | null> {
  const res = await fetch(`${GEO}/zip?zip=${encodeURIComponent(zip)}&appid=${OWM_KEY}`);
  if (!res.ok) return null;
  const data = await res.json();
  return { lat: data.lat, lon: data.lon, name: data.name, country: data.country };
}

async function geocodeByName(q: string): Promise<{ lat: number; lon: number; name: string; country: string } | null> {
  const res = await fetch(`${GEO}/direct?q=${encodeURIComponent(q)}&limit=1&appid=${OWM_KEY}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name, country: data[0].country };
}

export async function GET(req: NextRequest) {
  if (!OWM_KEY) {
    return NextResponse.json({ error: 'OPENWEATHER_API_KEY not configured' }, { status: 500 });
  }

  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  let coords: { lat: number; lon: number } | null = null;
  let locationName = '';
  let country = '';

  if (lat && lon) {
    coords = { lat: parseFloat(lat), lon: parseFloat(lon) };
    // Reverse geocode to get name
    const rev = await fetch(`${GEO}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OWM_KEY}`);
    if (rev.ok) {
      const revData = await rev.json();
      if (revData && revData.length > 0) {
        locationName = revData[0].name;
        country = revData[0].country;
      }
    }
  } else if (q) {
    // Try zip code first (5-digit or with country code like "10001,US")
    const isZip = /^\d{4,6}(,\w{2})?$/.test(q.trim());
    const geo = isZip ? await geocodeByZip(q) : await geocodeByName(q);
    if (!geo) {
      return NextResponse.json({ error: `Location "${q}" not found. Try a different city name or zip code.` }, { status: 404 });
    }
    coords = { lat: geo.lat, lon: geo.lon };
    locationName = geo.name;
    country = geo.country;
  } else {
    return NextResponse.json({ error: 'Provide q= (location) or lat= & lon= parameters' }, { status: 400 });
  }

  const res = await fetch(
    `${BASE}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${OWM_KEY}&units=metric`
  );

  if (!res.ok) {
    if (res.status === 401) return NextResponse.json({ error: 'Invalid API key. Check your OPENWEATHER_API_KEY.' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: res.status });
  }

  const raw = await res.json();

  const weather: CurrentWeatherData = {
    location_name: locationName || raw.name,
    country: country || raw.sys?.country || '',
    lat: coords.lat,
    lon: coords.lon,
    temp: raw.main.temp,
    feels_like: raw.main.feels_like,
    temp_min: raw.main.temp_min,
    temp_max: raw.main.temp_max,
    humidity: raw.main.humidity,
    wind_speed: raw.wind?.speed ?? 0,
    wind_deg: raw.wind?.deg ?? 0,
    description: raw.weather[0]?.description ?? '',
    icon: raw.weather[0]?.icon ?? '01d',
    pressure: raw.main.pressure,
    visibility: raw.visibility ?? 0,
    sunrise: raw.sys?.sunrise ?? 0,
    sunset: raw.sys?.sunset ?? 0,
  };

  return NextResponse.json(weather);
}
