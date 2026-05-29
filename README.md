# WeatherScope 🌍

**Full-Stack Weather Application** | PM Accelerator AI Engineer Intern Technical Assessment  
**Developer:** Zhiliang Wang  
**Assessment Completed:** Tech Assessment #1 (Frontend) + Tech Assessment #2 (Backend) — Full Stack

---

## Overview

WeatherScope is a full-stack weather application built with Next.js 14, providing real-time weather data, a 5-day forecast, historical weather records with full CRUD operations, multi-format data export, YouTube travel videos, and an interactive map.

## Tech Stack

| Layer      | Technology                              |
|------------|----------------------------------------|
| Frontend   | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend    | Next.js API Route Handlers (RESTful)   |
| Database   | SQLite via `better-sqlite3`            |
| Weather    | OpenWeatherMap API                     |
| Historical | Open-Meteo Archive & Forecast API (free, no key) |
| Maps       | OpenStreetMap embed (free)             |
| Videos     | YouTube Data API v3 (optional)         |
| PDF Export | PDFKit (server-side)                   |

---

## Prerequisites

- **Node.js** 18+ (check: `node -v`)
- **npm** 9+ (check: `npm -v`)
- On Windows, if `better-sqlite3` native build fails, install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/) or run:
  ```
  npm install --global windows-build-tools
  ```

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/weather-app.git
cd weather-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required: Get free at https://openweathermap.org/api (free tier)
OPENWEATHER_API_KEY=your_key_here

# Optional: Get at https://console.cloud.google.com → YouTube Data API v3
YOUTUBE_API_KEY=your_yt_key_here
```

> **Note:** The app works without `YOUTUBE_API_KEY` — the YouTube section is simply hidden.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

---

## Features

### Assessment #1 — Frontend

- **Location search** — supports city names, zip codes (e.g. `10001,US`), GPS coordinates (`40.71,-74.01`), and landmarks
- **Current weather** — temperature, feels like, humidity, wind speed & direction, pressure, visibility, sunrise/sunset
- **Weather icons** — OpenWeatherMap icon CDN with emoji fallbacks
- **Geolocation** — "My Location" button uses browser GPS
- **5-day forecast** — daily grid with high/low temps, icons, and precipitation probability
- **Interactive map** — OpenStreetMap embed centered on searched location
- **YouTube videos** — travel videos for the location (requires YouTube API key)
- **Responsive design** — mobile, tablet, and desktop layouts via Tailwind CSS breakpoints
- **Error handling** — city not found, invalid API key, geolocation denied, network failures

### Assessment #2 — Backend

- **RESTful API** endpoints built with Next.js Route Handlers
- **SQLite database** with full CRUD:
  - **CREATE** — save location + date range, validates dates (format, order, max 365 days), validates location via geocoding, fetches historical/forecast temperature data from Open-Meteo
  - **READ** — list all stored records with daily breakdown expandable in UI
  - **UPDATE** — edit description and notes per record
  - **DELETE** — remove records with confirmation
- **Historical data** — Open-Meteo Archive API for past data (back to 1940), Forecast API for future dates
- **Data export** — JSON, CSV, XML, Markdown, PDF (server-side via PDFKit)
- **YouTube integration** — YouTube Data API v3 search (2.2 API Integration)
- **Map integration** — OpenStreetMap embed (2.2 API Integration)

---

## API Endpoints

| Method | Endpoint                  | Description                              |
|--------|---------------------------|------------------------------------------|
| GET    | `/api/weather?q={loc}`    | Current weather (also accepts lat/lon)   |
| GET    | `/api/forecast?q={loc}`   | 5-day forecast                           |
| GET    | `/api/records`            | List all stored records                  |
| POST   | `/api/records`            | Create record (location + date range)    |
| PUT    | `/api/records/[id]`       | Update record (notes, description)       |
| DELETE | `/api/records/[id]`       | Delete a record                          |
| GET    | `/api/export?format=json` | Export records (json/csv/xml/markdown/pdf) |
| GET    | `/api/youtube?q={loc}`    | YouTube video search for location        |

### POST /api/records — Request Body

```json
{
  "location": "Tokyo",
  "date_from": "2024-01-01",
  "date_to": "2024-01-07",
  "notes": "Planning a trip"
}
```

---

## Database Schema

```sql
CREATE TABLE weather_records (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  location        TEXT    NOT NULL,
  latitude        REAL,
  longitude       REAL,
  date_from       TEXT    NOT NULL,
  date_to         TEXT    NOT NULL,
  temperature_min REAL,
  temperature_max REAL,
  temperature_avg REAL,
  description     TEXT    DEFAULT '',
  humidity        INTEGER DEFAULT 0,
  wind_speed      REAL    DEFAULT 0,
  weather_icon    TEXT    DEFAULT '',
  daily_data      TEXT    DEFAULT '[]',  -- JSON array of daily temps
  notes           TEXT    DEFAULT '',
  created_at      TEXT    DEFAULT (datetime('now')),
  updated_at      TEXT    DEFAULT (datetime('now'))
);
```

The database file is stored at `data/weather.db` (auto-created on first run).

---

## Project Structure

```
weather-app/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main page (tabbed UI)
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Tailwind base styles
│   │   └── api/
│   │       ├── weather/route.ts   # GET current weather
│   │       ├── forecast/route.ts  # GET 5-day forecast
│   │       ├── records/
│   │       │   ├── route.ts       # GET all / POST create
│   │       │   └── [id]/route.ts  # PUT update / DELETE
│   │       ├── export/route.ts    # GET export (5 formats)
│   │       └── youtube/route.ts   # GET YouTube videos
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── CurrentWeather.tsx
│   │   ├── ForecastSection.tsx
│   │   ├── WeatherRecords.tsx     # CRUD table UI
│   │   ├── CreateRecordForm.tsx
│   │   ├── ExportPanel.tsx
│   │   └── AboutSection.tsx
│   ├── lib/
│   │   └── db.ts                  # SQLite connection + queries
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── data/                          # SQLite DB (auto-created)
├── .env.example                   # Environment variable template
├── .env.local                     # Your API keys (not committed)
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── README.md
```

---

## Responsive Design

| Breakpoint | Behavior                                      |
|------------|-----------------------------------------------|
| Mobile (<640px) | Single column, stacked layout, touch-friendly buttons |
| Tablet (640–1024px) | 2-column grids, horizontal nav             |
| Desktop (>1024px) | Full 5-column forecast grid, wide cards   |

Tailwind CSS utilities used: `flex`, `grid`, `grid-cols-*`, `sm:`, `md:`, `lg:` breakpoints, `overflow-x-auto` for tables, `whitespace-nowrap` for nav.

---

## Free API Keys

| API | Free Tier | Link |
|-----|-----------|------|
| OpenWeatherMap | 1,000 calls/day | https://openweathermap.org/api |
| Open-Meteo | Unlimited (no key needed) | https://open-meteo.com |
| YouTube Data API v3 | 10,000 units/day | https://console.cloud.google.com |
| OpenStreetMap | Free (no key) | https://www.openstreetmap.org |
