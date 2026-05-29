import { NextRequest, NextResponse } from 'next/server';
import type { ForecastDay } from '@/types';

const OWM_KEY = process.env.OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';
const GEO = 'https://api.openweathermap.org/geo/1.0';

export async function GET(req: NextRequest) {
  if (!OWM_KEY) {
    return NextResponse.json({ error: 'OPENWEATHER_API_KEY not configured' }, { status: 500 });
  }

  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  let coordLat: number;
  let coordLon: number;

  if (lat && lon) {
    coordLat = parseFloat(lat);
    coordLon = parseFloat(lon);
  } else if (q) {
    const isZip = /^\d{4,6}(,\w{2})?$/.test(q.trim());
    const geoUrl = isZip
      ? `${GEO}/zip?zip=${encodeURIComponent(q)}&appid=${OWM_KEY}`
      : `${GEO}/direct?q=${encodeURIComponent(q)}&limit=1&appid=${OWM_KEY}`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    const geoData = await geoRes.json();
    const point = isZip ? geoData : geoData[0];
    if (!point) return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    coordLat = point.lat;
    coordLon = point.lon;
  } else {
    return NextResponse.json({ error: 'Provide q= or lat= & lon= parameters' }, { status: 400 });
  }

  const res = await fetch(
    `${BASE}/forecast?lat=${coordLat}&lon=${coordLon}&appid=${OWM_KEY}&units=metric&cnt=40`
  );
  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch forecast' }, { status: res.status });

  const raw = await res.json();

  // Aggregate 3-hourly data into daily forecasts
  const dailyMap = new Map<string, {
    temps: number[];
    temp_min: number[];
    temp_max: number[];
    descriptions: string[];
    icons: string[];
    humidity: number[];
    wind: number[];
    pop: number[];
  }>();

  for (const item of raw.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { temps: [], temp_min: [], temp_max: [], descriptions: [], icons: [], humidity: [], wind: [], pop: [] });
    }
    const d = dailyMap.get(date)!;
    d.temps.push(item.main.temp);
    d.temp_min.push(item.main.temp_min);
    d.temp_max.push(item.main.temp_max);
    d.descriptions.push(item.weather[0]?.description ?? '');
    d.icons.push(item.weather[0]?.icon ?? '01d');
    d.humidity.push(item.main.humidity);
    d.wind.push(item.wind?.speed ?? 0);
    d.pop.push(item.pop ?? 0);
  }

  const forecast: ForecastDay[] = [];
  // Skip today (index 0), take next 5 days
  const dates = Array.from(dailyMap.keys()).slice(0, 6);

  for (const date of dates) {
    const d = dailyMap.get(date)!;
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    // Pick the most common icon (noon time preferred)
    const noonIcon = d.icons[Math.floor(d.icons.length / 2)] ?? d.icons[0];
    const noonDesc = d.descriptions[Math.floor(d.descriptions.length / 2)] ?? d.descriptions[0];
    forecast.push({
      date,
      temp_min: Math.round(Math.min(...d.temp_min) * 10) / 10,
      temp_max: Math.round(Math.max(...d.temp_max) * 10) / 10,
      description: noonDesc,
      icon: noonIcon,
      humidity: Math.round(avg(d.humidity)),
      wind_speed: Math.round(avg(d.wind) * 10) / 10,
      pop: Math.round(Math.max(...d.pop) * 100),
    });
  }

  return NextResponse.json(forecast.slice(0, 6));
}
