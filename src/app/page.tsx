'use client';

import { useState, useCallback, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import CurrentWeather from '@/components/CurrentWeather';
import ForecastSection from '@/components/ForecastSection';
import WeatherRecords from '@/components/WeatherRecords';
import CreateRecordForm from '@/components/CreateRecordForm';
import ExportPanel from '@/components/ExportPanel';
import AboutSection from '@/components/AboutSection';
import type { CurrentWeatherData, ForecastDay, WeatherRecord } from '@/types';
import WeatherBackground, { getWeatherTheme } from '@/components/WeatherBackground';

type Tab = 'weather' | 'records' | 'export' | 'about';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'weather',  label: 'Weather',  icon: '🌤️' },
  { id: 'records',  label: 'Records',  icon: '📊' },
  { id: 'export',   label: 'Export',   icon: '📤' },
  { id: 'about',    label: 'About',    icon: 'ℹ️'  },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('weather');

  // Weather tab state
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [weatherError, setWeatherError] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<{ videoId: string; title: string; thumbnail: string }[]>([]);
  const [ytDisabled, setYtDisabled] = useState(false);

  // Records tab state
  const [records, setRecords] = useState<WeatherRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const fetchWeather = useCallback(async (params: string) => {
    setWeatherLoading(true);
    setWeatherError('');
    setWeather(null);
    setForecast([]);
    setYoutubeVideos([]);
    try {
      const [wRes, fRes] = await Promise.all([
        fetch(`/api/weather?${params}`),
        fetch(`/api/forecast?${params}`),
      ]);

      if (!wRes.ok) {
        const err = await wRes.json();
        setWeatherError(err.error ?? 'Failed to fetch weather data');
        return;
      }

      const wData: CurrentWeatherData = await wRes.json();
      setWeather(wData);
      setLastCoords({ lat: wData.lat, lon: wData.lon });

      if (fRes.ok) {
        const fData: ForecastDay[] = await fRes.json();
        setForecast(fData);
      }

      // Fetch YouTube videos (optional)
      const ytRes = await fetch(`/api/youtube?q=${encodeURIComponent(wData.location_name)}`);
      if (ytRes.ok) {
        const ytData = await ytRes.json();
        if (ytData.disabled) {
          setYtDisabled(true);
        } else {
          setYoutubeVideos(ytData.videos ?? []);
        }
      }
    } catch {
      setWeatherError('Network error — please check your connection and try again.');
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    // Check if it looks like coordinates (e.g. "40.7128,-74.006")
    const coordMatch = query.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      fetchWeather(`lat=${coordMatch[1]}&lon=${coordMatch[2]}`);
    } else {
      fetchWeather(`q=${encodeURIComponent(query)}`);
    }
  }, [fetchWeather]);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setWeatherError('Geolocation is not supported by your browser.');
      return;
    }
    setWeatherLoading(true);
    setWeatherError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
      },
      (err) => {
        setWeatherLoading(false);
        setWeatherError(`Location access denied: ${err.message}`);
      }
    );
  }, [fetchWeather]);

  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  // Fetch records when switching to records/export tab
  useEffect(() => {
    if (tab === 'records' || tab === 'export') {
      fetchRecords();
    }
  }, [tab, fetchRecords]);

  const mapSrc = lastCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lastCoords.lon - 0.08},${lastCoords.lat - 0.08},${lastCoords.lon + 0.08},${lastCoords.lat + 0.08}&layer=mapnik&marker=${lastCoords.lat},${lastCoords.lon}`
    : null;

  const theme = getWeatherTheme(weather?.icon);
  const isDark = ['clear-night', 'rainy', 'storm', 'cloudy'].includes(theme);
  const headingCls = isDark ? 'text-white drop-shadow-md' : 'text-gray-800';
  const subCls     = isDark ? 'text-white/70' : 'text-gray-500';

  return (
    <div className="min-h-screen">
      <WeatherBackground icon={weather?.icon} />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/30 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h1 className="text-xl font-bold text-blue-700">WeatherScope</h1>
            <p className="text-xs text-gray-400">by Zhiliang Wang · PM Accelerator Technical Assessment</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── WEATHER TAB ── */}
        {tab === 'weather' && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className={`text-2xl font-bold ${headingCls}`}>Real-Time Weather</h2>
              <p className={`text-sm mt-1 ${subCls}`}>Search by city, zip code, coordinates, or landmark</p>
            </div>

            <SearchBar
              onSearch={handleSearch}
              onGeolocate={handleGeolocate}
              loading={weatherLoading}
            />

            {weatherLoading && (
              <div className="text-center py-10">
                <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 mt-3">Fetching weather data…</p>
              </div>
            )}

            {weatherError && !weatherLoading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm mt-0.5">{weatherError}</p>
                </div>
              </div>
            )}

            {weather && !weatherLoading && (
              <>
                <CurrentWeather data={weather} />
                <ForecastSection forecast={forecast} />

                {/* Map */}
                {mapSrc && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="bg-white px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-700">
                        🗺️ Map — {weather.location_name}, {weather.country}
                      </p>
                    </div>
                    <iframe
                      src={mapSrc}
                      title="Location Map"
                      width="100%"
                      height="300"
                      className="block"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* YouTube Videos */}
                {!ytDisabled && youtubeVideos.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      ▶️ Videos about {weather.location_name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {youtubeVideos.map(v => (
                        <a
                          key={v.videoId}
                          href={`https://www.youtube.com/watch?v=${v.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                        >
                          {v.thumbnail && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={v.thumbnail} alt={v.title} className="w-full aspect-video object-cover" />
                          )}
                          <div className="p-3">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 line-clamp-2">
                              {v.title}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!weather && !weatherLoading && !weatherError && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-6xl mb-4">🌤️</p>
                <p className="text-xl font-medium text-gray-500">Search for a location to get started</p>
                <p className="text-sm mt-2">Try &quot;New York&quot;, &quot;London&quot;, &quot;10001&quot;, or click &quot;My Location&quot;</p>
              </div>
            )}
          </div>
        )}

        {/* ── RECORDS TAB ── */}
        {tab === 'records' && (
          <div className="space-y-5 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Weather Records</h2>
              <p className="text-sm text-gray-500 mt-1">Store, view, update, and delete weather data by location and date range</p>
            </div>

            <CreateRecordForm onCreated={fetchRecords} />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  Stored Records {records.length > 0 && <span className="text-gray-400 font-normal">({records.length})</span>}
                </h3>
                <button
                  onClick={fetchRecords}
                  disabled={recordsLoading}
                  className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                >
                  {recordsLoading ? 'Loading…' : '↻ Refresh'}
                </button>
              </div>
              <WeatherRecords records={records} onRefresh={fetchRecords} />
            </div>
          </div>
        )}

        {/* ── EXPORT TAB ── */}
        {tab === 'export' && (
          <div className="space-y-5 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Export Data</h2>
              <p className="text-sm text-gray-500 mt-1">
                Download all {records.length} stored record{records.length !== 1 ? 's' : ''} in multiple formats
              </p>
            </div>
            <ExportPanel />
            {records.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700 text-sm">
                💡 No records to export yet. Head to the Records tab to create some first.
              </div>
            )}
          </div>
        )}

        {/* ── ABOUT TAB ── */}
        {tab === 'about' && (
          <div className="space-y-5 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">About</h2>
              <p className="text-sm text-gray-500 mt-1">Developer info and project details</p>
            </div>
            <AboutSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-white/30 bg-white/70 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>WeatherScope · Built by <strong className="text-gray-600">Zhiliang Wang</strong> for PM Accelerator Technical Assessment</p>
          <p>Powered by OpenWeatherMap · Open-Meteo · OpenStreetMap</p>
        </div>
      </footer>
    </div>
  );
}
