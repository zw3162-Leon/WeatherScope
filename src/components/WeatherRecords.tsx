'use client';

import { useState } from 'react';
import type { WeatherRecord, DailyWeather } from '@/types';

interface Props {
  records: WeatherRecord[];
  onRefresh: () => void;
}

export default function WeatherRecords({ records, onRefresh }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleEdit = (r: WeatherRecord) => {
    setEditId(r.id);
    setEditNotes(r.notes ?? '');
    setEditDesc(r.description ?? '');
    setError('');
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes, description: editDesc }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Update failed');
      } else {
        setEditId(null);
        onRefresh();
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
        if (expanded === id) setExpanded(null);
      }
    } finally {
      setDeleting(null);
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-5xl mb-3">📭</p>
        <p>No records yet. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          ❌ {error}
        </div>
      )}
      {records.map(r => {
        const isExpanded = expanded === r.id;
        const isEditing = editId === r.id;
        const daily: DailyWeather[] = (() => {
          try { return JSON.parse(r.daily_data) as DailyWeather[]; } catch { return []; }
        })();

        return (
          <div key={r.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-2 p-4">
              <span className="text-2xl">{r.weather_icon || '🌡️'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{r.location}</p>
                <p className="text-xs text-gray-500">{r.date_from} → {r.date_to}</p>
              </div>
              <div className="flex gap-2 items-center text-sm text-gray-600 flex-wrap">
                {r.temperature_min !== null && (
                  <span>🔵 {r.temperature_min}°C</span>
                )}
                {r.temperature_max !== null && (
                  <span>🔴 {r.temperature_max}°C</span>
                )}
                {r.temperature_avg !== null && (
                  <span className="text-gray-400">avg {r.temperature_avg}°C</span>
                )}
              </div>
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => setExpanded(isExpanded ? null : r.id)}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {isExpanded ? '▲ Hide' : '▼ Details'}
                </button>
                <button
                  onClick={() => handleEdit(r)}
                  className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting === r.id ? '…' : '🗑️ Delete'}
                </button>
              </div>
            </div>

            {/* Edit panel */}
            {isEditing && (
              <div className="border-t border-gray-100 bg-blue-50 px-4 py-3 space-y-2">
                <p className="text-xs font-semibold text-blue-700">Update Record #{r.id}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">Description</label>
                    <input
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Notes</label>
                    <input
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(r.id)}
                    disabled={saving}
                    className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : '✅ Save'}
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="px-4 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Expanded daily data */}
            {isExpanded && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                {r.notes && <p className="text-xs text-gray-500 mb-2">📌 Notes: {r.notes}</p>}
                <p className="text-xs text-gray-400 mb-2">
                  📍 Coords: {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)} ·
                  Added: {r.created_at.split('.')[0]}
                </p>
                {daily.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Daily Breakdown:</p>
                    <div className="overflow-x-auto">
                      <table className="text-xs w-full min-w-[480px]">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-200">
                            <th className="text-left py-1 pr-3">Date</th>
                            <th className="text-right pr-3">Min</th>
                            <th className="text-right pr-3">Max</th>
                            <th className="text-right pr-3">Avg</th>
                            <th className="text-left">Conditions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {daily.map(d => (
                            <tr key={d.date} className="border-b border-gray-100 hover:bg-white">
                              <td className="py-1 pr-3 font-medium">{d.date}</td>
                              <td className="text-right pr-3 text-blue-600">{d.temp_min}°C</td>
                              <td className="text-right pr-3 text-red-500">{d.temp_max}°C</td>
                              <td className="text-right pr-3 text-gray-600">{d.temp_mean}°C</td>
                              <td>{d.icon} {d.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No daily breakdown available.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
