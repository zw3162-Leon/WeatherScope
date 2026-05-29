'use client';

const FORMATS = [
  { key: 'json',     label: 'JSON',     icon: '{ }', desc: 'Machine-readable JSON array',   color: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100' },
  { key: 'csv',      label: 'CSV',      icon: '⊞',   desc: 'Comma-separated spreadsheet',   color: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100' },
  { key: 'xml',      label: 'XML',      icon: '</>',  desc: 'Structured XML document',        color: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100' },
  { key: 'markdown', label: 'Markdown', icon: '#',   desc: 'Markdown table format',           color: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100' },
  { key: 'pdf',      label: 'PDF',      icon: '📄',   desc: 'Formatted PDF document',         color: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100' },
] as const;

export default function ExportPanel() {
  const handleExport = (format: string) => {
    window.open(`/api/export?format=${format}`, '_blank');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">📤 Export Records</h3>
      <p className="text-sm text-gray-500 mb-5">Download all stored weather records in your preferred format.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FORMATS.map(fmt => (
          <button
            key={fmt.key}
            onClick={() => handleExport(fmt.key)}
            className={`border rounded-xl p-4 text-left transition-all ${fmt.color}`}
          >
            <div className="text-2xl font-mono font-bold mb-1">{fmt.icon}</div>
            <p className="font-semibold text-sm">{fmt.label}</p>
            <p className="text-xs opacity-75 mt-0.5">{fmt.desc}</p>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Exports all records from the SQLite database. Click any format to download.
      </p>
    </div>
  );
}
