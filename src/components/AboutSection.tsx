'use client';

export default function AboutSection() {
  return (
    <div className="space-y-6">
      {/* Developer Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">👨‍💻 Developer</h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            ZW
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">Zhiliang Wang</p>
            <p className="text-sm text-gray-500">Full Stack Engineer · AI Engineer Intern Applicant</p>
            <p className="text-xs text-gray-400 mt-0.5">Built with Next.js 14, TypeScript, Tailwind CSS, SQLite</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { label: 'Frontend', value: 'Next.js + React' },
            { label: 'Backend', value: 'Next.js API Routes' },
            { label: 'Database', value: 'SQLite' },
            { label: 'Styling', value: 'Tailwind CSS' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-sm font-semibold text-gray-700">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PM Accelerator Card */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🚀</div>
          <div>
            <h3 className="text-xl font-bold">Product Manager Accelerator</h3>
            <p className="text-blue-200 text-sm">Empowering the Next Generation of Product Leaders</p>
          </div>
        </div>

        <p className="text-blue-100 text-sm leading-relaxed mb-4">
          Product Manager Accelerator (PMA) is the #1 PM coaching program that helps aspiring and
          experienced product managers land their dream jobs at top tech companies including FAANG,
          unicorn startups, and Fortune 500 companies.
        </p>

        <p className="text-blue-100 text-sm leading-relaxed mb-4">
          PMA provides end-to-end support — from resume and portfolio coaching to interview prep,
          mock interviews with senior PMs, and a vast network of alumni across the tech industry.
          With a proven track record of helping hundreds of PMs break into top companies, PMA stands
          as the most comprehensive and results-driven PM career accelerator available today.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {[
            { icon: '🎯', label: 'Job Placement', value: 'FAANG & Top Companies' },
            { icon: '🤝', label: 'Network', value: 'Global PM Community' },
            { icon: '📚', label: 'Resources', value: '500+ PM Resources' },
            { icon: '🏆', label: 'Track Record', value: 'Hundreds Placed' },
            { icon: '🌐', label: 'Scope', value: 'AI/ML Focused' },
            { icon: '💼', label: 'Programs', value: 'Intern → Senior PM' },
          ].map(item => (
            <div key={item.label} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-xs text-blue-200">{item.icon} {item.label}</p>
              <p className="text-sm font-semibold mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <a
            href="https://www.linkedin.com/company/product-manager-accelerator/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
          >
            🔗 Product Manager Accelerator on LinkedIn
          </a>
        </div>
      </div>

      {/* App Features Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🌤️ App Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureBlock title="Frontend (Assessment #1)" items={[
            'Location search: city, zip, GPS coords, landmarks',
            'Real-time current weather with icons',
            'Browser geolocation support',
            '5-day forecast display',
            'Fully responsive (mobile/tablet/desktop)',
            'Graceful error handling',
          ]} color="blue" />
          <FeatureBlock title="Backend (Assessment #2)" items={[
            'RESTful API with Next.js Route Handlers',
            'SQLite database with full CRUD operations',
            'Historical & forecast data (Open-Meteo)',
            'Location validation with fuzzy geocoding',
            'Date range validation',
            'Multi-format export: JSON, CSV, XML, PDF, Markdown',
          ]} color="indigo" />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureBlock title="API Integrations" items={[
            'OpenWeatherMap — current weather & forecasts',
            'Open-Meteo — free historical temperature data',
            'YouTube Data API v3 — location travel videos',
            'OpenStreetMap — interactive map embed',
            'OWM Geocoding — zip codes & city validation',
            'Open-Meteo Geocoding — fallback location search',
          ]} color="green" />
          <FeatureBlock title="Tech Stack" items={[
            'Next.js 14 (App Router) + TypeScript',
            'Tailwind CSS for responsive design',
            'better-sqlite3 for SQLite persistence',
            'PDFKit for server-side PDF generation',
            'Open-Meteo Archive + Forecast APIs',
            'Deployed-ready with .env configuration',
          ]} color="purple" />
        </div>
      </div>
    </div>
  );
}

function FeatureBlock({
  title, items, color,
}: {
  title: string;
  items: string[];
  color: 'blue' | 'indigo' | 'green' | 'purple';
}) {
  const bg: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  };
  const text: Record<string, string> = {
    blue: 'text-blue-800',
    indigo: 'text-indigo-800',
    green: 'text-green-800',
    purple: 'text-purple-800',
  };
  return (
    <div className={`border rounded-xl p-4 ${bg[color]}`}>
      <p className={`text-sm font-semibold mb-2 ${text[color]}`}>{title}</p>
      <ul className="text-xs text-gray-600 space-y-1">
        {items.map(i => <li key={i}>✓ {i}</li>)}
      </ul>
    </div>
  );
}
