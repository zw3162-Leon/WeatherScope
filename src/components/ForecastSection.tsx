'use client';

import Image from 'next/image';
import type { ForecastDay } from '@/types';

interface Props {
  forecast: ForecastDay[];
}

export default function ForecastSection({ forecast }: Props) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">5-Day Forecast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {forecast.map(day => (
          <ForecastCard key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}

function ForecastCard({ day }: { day: ForecastDay }) {
  const dateObj = new Date(day.date + 'T12:00:00');
  const isToday = day.date === new Date().toISOString().split('T')[0];
  const label = isToday
    ? 'Today'
    : dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-center hover:shadow-md transition-shadow">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <Image
        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
        alt={day.description}
        width={50}
        height={50}
        className="mx-auto"
        unoptimized
      />
      <p className="capitalize text-xs text-gray-500 mt-0.5 leading-tight">{day.description}</p>
      <div className="flex justify-between mt-2 text-sm font-bold">
        <span className="text-blue-600">{Math.round(day.temp_min)}°</span>
        <span className="text-red-500">{Math.round(day.temp_max)}°</span>
      </div>
      {day.pop > 0 && (
        <p className="text-xs text-sky-600 mt-1">🌧 {day.pop}%</p>
      )}
    </div>
  );
}
