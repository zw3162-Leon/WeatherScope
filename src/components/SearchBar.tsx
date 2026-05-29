'use client';

import { useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
  onGeolocate: () => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, onGeolocate, loading }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="City, zip code, landmark, or coordinates (e.g. 40.7128,-74.006)"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 bg-white shadow-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
        <button
          type="button"
          onClick={onGeolocate}
          disabled={loading}
          title="Use my current location"
          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          📍 My Location
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1.5 ml-1">
        Accepts city names, zip codes (e.g. 90210, 10001,US), GPS coordinates, or landmarks
      </p>
    </form>
  );
}
