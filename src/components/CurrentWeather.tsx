'use client';

import { useState, useEffect } from 'react';
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
  const [landmarkUrl, setLandmarkUrl] = useState<string | null>(null);

  useEffect(() => {
    setLandmarkUrl(null);
    const params = new URLSearchParams({
      location: data.location_name,
      country: data.country,
    });
    fetch(`/api/landmark?${params}`)
      .then(r => r.json())
      .then(d => setLandmarkUrl(d.url ?? null))
      .catch(() => {});
  }, [data.location_name, data.country]);

  return (
    <div
      className="relative text-white rounded-2xl p-6 shadow-xl overflow-hidden"
      style={{
        backgroundImage: landmarkUrl ? `url(${landmarkUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.6s ease',
      }}
    >
      {/* Gradient overlay — darker when landmark image is present */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: landmarkUrl
            ? 'linear-gradient(135deg,rgba(29,78,216,0.72) 0%,rgba(30,64,175,0.82) 100%)'
            : 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)',
          transition: 'background 0.8s ease',
        }}
      />

      {/* Landmark credit badge */}
      {landmarkUrl && (
        <div className="absolute top-2 right-2 z-10 bg-black/30 backdrop-blur-sm rounded px-2 py-0.5 text-[10px] text-white/70">
          📍 {data.location_name}
        </div>
      )}

      {/* All content above the overlay */}
      <div className="relative z-10">
        {/* Location & Description */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h2 className="text-3xl font-bold drop-shadow">
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
              <p className="text-6xl font-bold drop-shadow">{Math.round(data.temp)}°C</p>
              <p className="text-blue-200 text-sm">Feels like {Math.round(data.feels_like)}°C</p>
            </div>
          </div>
        </div>

        {/* Detail Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatCard label="Humidity"   value={`${data.humidity}%`}                              icon="💧" />
          <StatCard label="Wind"       value={`${data.wind_speed} m/s ${windDirection(data.wind_deg)}`} icon="💨" />
          <StatCard label="Pressure"   value={`${data.pressure} hPa`}                           icon="🌡️" />
          <StatCard label="Visibility" value={`${(data.visibility / 1000).toFixed(1)} km`}      icon="👁️" />
          <StatCard label="High"       value={`${Math.round(data.temp_max)}°C`}                 icon="🔴" />
          <StatCard label="Low"        value={`${Math.round(data.temp_min)}°C`}                 icon="🔵" />
          <StatCard label="Sunrise"    value={formatTime(data.sunrise)}                         icon="🌅" />
          <StatCard label="Sunset"     value={formatTime(data.sunset)}                          icon="🌇" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
      <p className="text-xs text-blue-200 font-medium">{icon} {label}</p>
      <p className="text-sm font-bold mt-0.5 drop-shadow">{value}</p>
    </div>
  );
}
