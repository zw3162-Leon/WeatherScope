'use client';

import Image from 'next/image';
import type { CurrentWeatherData } from '@/types';

interface Props {
  data: CurrentWeatherData;
}

function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function CurrentWeather({ data }: Props) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-6 shadow-xl">
      {/* Location & Description */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h2 className="text-3xl font-bold">
            {data.location_name}{data.country ? `, ${data.country}` : ''}
          </h2>
          <p className="capitalize text-blue-100 mt-0.5">{data.description}</p>
          <p className="text-xs text-blue-200 mt-0.5">
            {data.lat.toFixed(4)}°, {data.lon.toFixed(4)}°
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Image
            src={iconUrl}
            alt={data.description}
            width={80}
            height={80}
            unoptimized
          />
          <div className="text-right">
            <p className="text-6xl font-bold">{Math.round(data.temp)}°C</p>
            <p className="text-blue-200 text-sm">Feels like {Math.round(data.feels_like)}°C</p>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <StatCard label="Humidity" value={`${data.humidity}%`} icon="💧" />
        <StatCard label="Wind" value={`${data.wind_speed} m/s ${windDirection(data.wind_deg)}`} icon="💨" />
        <StatCard label="Pressure" value={`${data.pressure} hPa`} icon="🌡️" />
        <StatCard label="Visibility" value={`${(data.visibility / 1000).toFixed(1)} km`} icon="👁️" />
        <StatCard label="High" value={`${Math.round(data.temp_max)}°C`} icon="🔴" />
        <StatCard label="Low" value={`${Math.round(data.temp_min)}°C`} icon="🔵" />
        <StatCard label="Sunrise" value={formatTime(data.sunrise)} icon="🌅" />
        <StatCard label="Sunset" value={formatTime(data.sunset)} icon="🌇" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
      <p className="text-xs text-blue-200 font-medium">{icon} {label}</p>
      <p className="text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}
