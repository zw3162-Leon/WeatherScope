# WeatherScope

A full-stack weather intelligence application built with Next.js 14, TypeScript, and SQLite. WeatherScope delivers real-time weather data, historical records management, multi-format data export, and a dynamic user experience that adapts its visual presentation to live weather conditions — submitted as part of the PM Accelerator AI Engineer Intern Technical Assessment.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Goals and Scope](#goals-and-scope)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [API Integrations](#api-integrations)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage Guide](#usage-guide)
- [Data Model](#data-model)
- [Export Formats](#export-formats)
- [Dynamic UI System](#dynamic-ui-system)
- [Tech Stack](#tech-stack)

---

## Project Overview

WeatherScope is a production-ready weather application that addresses both the frontend and backend requirements of the PM Accelerator AI Engineer Intern assessment. It allows users to search any location worldwide, retrieve current and forecasted weather conditions, persist historical weather records with flexible date ranges, and export the data in five different formats.

The application is designed with attention to real-world concerns: graceful error handling, database persistence, location fallback logic, and a responsive interface that adapts its visual presentation to the actual weather conditions of the searched location.

---

## Goals and Scope

Assessment Requirement 1 — Frontend:
- Build a weather display interface that accepts city name, zip code, GPS coordinates, or landmark input
- Show current conditions including temperature, humidity, wind speed, pressure, visibility, sunrise and sunset
- Display a 5-day forecast
- Support browser geolocation

Assessment Requirement 2 — Backend:
- Expose a RESTful API for weather record management (Create, Read, Update, Delete)
- Persist records in a local SQLite database
- Fetch historical and forecast data from open data sources
- Validate location, date ranges, and input formats
- Support multi-format data export (JSON, CSV, XML, Markdown, PDF)

Extended Features:
- Dynamic animated weather backgrounds that react to live conditions
- Local landmark photography pulled from Wikipedia for the weather display card
- Interactive map centered on the searched location
- YouTube travel video discovery for the searched city
- Location-aware fallback: if a small district has no landmark imagery, the system searches upward to the city or country level

---

## Architecture

```
Client (Browser)
    |
    | HTTP requests
    v
Next.js App Router (Port 3000)
    |
    +-- /app/page.tsx              (main SPA shell, tab routing, state management)
    |
    +-- /app/api/weather           (current weather from OpenWeatherMap)
    +-- /app/api/forecast          (5-day forecast from OpenWeatherMap)
    +-- /app/api/records           (CRUD operations backed by SQLite)
    +-- /app/api/records/[id]      (single record get, update, delete)
    +-- /app/api/export            (multi-format file generation)
    +-- /app/api/youtube           (YouTube Data API v3 proxy)
    +-- /app/api/landmark          (Wikipedia pageimages API with fallback)
    |
    +-- /components
         +-- WeatherBackground     (CSS particle animation layer)
         +-- CurrentWeather        (live conditions card with landmark background)
         +-- ForecastSection       (5-day forecast grid)
         +-- SearchBar             (unified location input)
         +-- WeatherRecords        (record list with inline edit and delete)
         +-- CreateRecordForm      (date-range record creation)
         +-- ExportPanel           (one-click format download)
         +-- AboutSection          (developer and project information)
```

Data flows in one direction: the client triggers searches or form submissions, the Next.js API routes handle external API calls and database operations, and results are returned as JSON to the React state layer. There is no dedicated backend server — all server logic runs inside Next.js Route Handlers, which keeps deployment simple and the codebase unified.

---

## Key Features

### Real-Time Weather Search

Users can enter a city name, country, US zip code, coordinate pair (e.g., `40.7128,-74.006`), or a landmark name. The application performs geocoding to resolve ambiguous input and returns current conditions from OpenWeatherMap.

Displayed metrics:
- Temperature and "feels like" temperature
- Weather description
- Humidity percentage
- Wind speed and compass direction
- Barometric pressure
- Visibility in kilometers
- Daily high and low temperatures
- Sunrise and sunset times (local time)

### 5-Day Forecast

The forecast section displays daily summaries for the next five days including min/max temperatures, precipitation probability, wind speed, humidity, and weather condition icons.

### Weather Records (CRUD)

Users can store weather records for any location and date range. The backend automatically fetches historical data or forecast data from Open-Meteo depending on whether the dates are in the past or future. Each record stores:
- Location name and resolved coordinates
- Date range (from/to)
- Temperature statistics (min, max, average across the range)
- Dominant weather description
- A day-by-day breakdown stored as a JSON array
- Optional user-supplied notes

Records can be viewed, edited (location, dates, notes), and deleted from the Records tab. All operations go through the `/api/records` REST endpoint.

### Multi-Format Export

All stored records can be exported in a single click from the Export tab. Supported formats: JSON, CSV, XML, Markdown, and PDF.

### Dynamic Weather Background

The page background animates based on the current weather condition of the searched location:

- Clear day: sky-blue-to-warm-yellow gradient, pulsing sun with rotating rays
- Clear night: deep navy gradient, 90 twinkling stars, moon glow
- Partly cloudy: blue-gray gradient, drifting cloud shapes
- Cloudy: gray gradient, heavier drifting cloud layer
- Rain: dark slate gradient, 50 animated rain streaks
- Thunderstorm: near-black gradient, 80 rain streaks, periodic lightning flash overlay
- Snow: pale blue gradient, 45 falling snowflakes with lateral sway motion
- Mist / Fog: light gray gradient, three horizontal drifting haze bands

Transitions between states use a 1.5-second CSS ease.

### Landmark Photography

The weather display card fetches a representative photograph of the searched location using the Wikipedia Pageimages API (no API key required). The image appears as the card background behind a semi-transparent blue overlay.

Fallback chain for small or obscure locations:
1. Exact location name as a Wikipedia article title
2. "Location, Country" article lookup
3. Full-text Wikipedia search for the location
4. Country-level Wikipedia article as a last resort

---

## API Integrations

| Service | Purpose | Authentication |
|---|---|---|
| OpenWeatherMap | Current weather, 5-day forecast, geocoding | API key (free tier) |
| Open-Meteo | Historical and extended forecast weather data | None required |
| Open-Meteo Geocoding | Fallback location resolution | None required |
| Wikipedia Pageimages | Landmark and scenery photography | None required |
| OpenStreetMap | Interactive map embed | None required |
| YouTube Data API v3 | Travel video discovery for searched city | API key (optional) |

---

## Project Structure

```
weather-app/
  src/
    app/
      api/
        export/route.ts         multi-format file generation endpoint
        forecast/route.ts       5-day forecast proxy
        landmark/route.ts       Wikipedia image lookup with fallback logic
        records/
          route.ts              list all records, create new record
          [id]/route.ts         get single record, update, delete
        weather/route.ts        current weather proxy
        youtube/route.ts        YouTube search proxy
      globals.css               Tailwind base styles and weather animation keyframes
      layout.tsx                root HTML document shell
      page.tsx                  main application shell (tab routing, shared state)
    components/
      AboutSection.tsx          developer information and project details
      CreateRecordForm.tsx      form for creating date-range weather records
      CurrentWeather.tsx        current conditions card with landmark background
      ExportPanel.tsx           export format selection buttons
      ForecastSection.tsx       5-day forecast grid component
      SearchBar.tsx             unified location search input
      WeatherBackground.tsx     full-viewport animated weather background layer
      WeatherRecords.tsx        stored records list with edit and delete actions
    lib/
      db.ts                     SQLite connection, schema initialization
    types/
      index.ts                  shared TypeScript interfaces
  data/                         SQLite database directory (gitignored)
  .env.example                  environment variable template
  next.config.mjs               Next.js configuration
  tailwind.config.ts            Tailwind CSS configuration
  tsconfig.json                 TypeScript configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
git clone https://github.com/zw3162-Leon/WeatherScope.git
cd WeatherScope
npm install
```

### Configuration

Copy the example environment file and add your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
OPENWEATHER_API_KEY=your_openweathermap_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

An OpenWeatherMap API key is required. You can register for a free account at https://openweathermap.org/api — the free tier covers all features used in this application.

The YouTube API key is optional. If omitted, the video discovery section is automatically hidden.

### Running the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENWEATHER_API_KEY` | Yes | OpenWeatherMap API key for weather data and geocoding |
| `YOUTUBE_API_KEY` | No | YouTube Data API v3 key for travel video discovery |

---

## Usage Guide

### Searching for Weather

Enter any of the following into the search bar and press Enter or click Search:

- City name: `Tokyo`, `London`, `Nairobi`
- City with country: `Paris, France`
- US zip code: `90210`, `10001`
- Coordinate pair: `51.5074,-0.1278`
- Landmark name: `Eiffel Tower`, `Central Park`

Click "My Location" to use browser geolocation (requires the user to grant location permission).

After a successful search, the page background transitions to an animated scene matching the current weather, and the weather card displays a photograph of the location's landmark or scenery.

### Creating a Weather Record

1. Navigate to the Records tab
2. Enter a location in the Location field (resolved via geocoding)
3. Set the start and end dates (historical dates pull archived data; future dates pull forecast data)
4. Add optional notes
5. Click Create Record

Date ranges are limited to 365 days. The system validates the location before saving.

### Editing or Deleting a Record

In the Records tab, each stored record shows an Edit button and a Delete button. Editing allows updating the location, date range, or notes. Both operations apply immediately to the SQLite database.

### Exporting Records

Navigate to the Export tab and click the button for your desired format. The file is generated server-side and downloaded directly to your browser. All records currently in the database are included.

---

## Data Model

The SQLite database contains a single `weather_records` table:

```sql
CREATE TABLE weather_records (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  location         TEXT    NOT NULL,
  latitude         REAL,
  longitude        REAL,
  date_from        TEXT    NOT NULL,
  date_to          TEXT    NOT NULL,
  temperature_min  REAL,
  temperature_max  REAL,
  temperature_avg  REAL,
  description      TEXT,
  humidity         REAL,
  wind_speed       REAL,
  weather_icon     TEXT,
  daily_data       TEXT,
  notes            TEXT,
  created_at       TEXT,
  updated_at       TEXT
);
```

The `daily_data` column stores a JSON array. Each element contains `date`, `temp_min`, `temp_max`, `temp_mean`, `description`, and `icon` for a single day in the requested range.

---

## Export Formats

### JSON

A JSON array where each element is a flat object containing all record fields. The `daily_data` field is included as a parsed array rather than a raw JSON string.

### CSV

Flat CSV with one row per record and column headers matching database field names. The `daily_data` column is excluded from CSV output to keep the spreadsheet readable.

### XML

A `<records>` root element containing one `<record>` child element per stored record. Each database field maps to a named child element.

### Markdown

A GitHub-flavored Markdown table with one row per record. Suitable for pasting into documentation, reports, or GitHub issues.

### PDF

A formatted PDF report generated server-side using PDFKit. Includes a title header, generation timestamp, summary statistics, and a table listing all records with key fields.

---

## Dynamic UI System

### Weather Background Animation

`WeatherBackground.tsx` is a fixed, full-viewport React component positioned at `z-index: -1` behind all page content. It reads the OpenWeatherMap weather icon code returned by the current weather API (e.g., `10d` for daytime rain) and maps it to a visual theme.

Particle positions use a seeded deterministic pseudo-random function (`sin`-based) to ensure identical output on both the server and the client, preventing React hydration mismatches while avoiding a `useEffect`-only render path.

The header uses `backdrop-blur` with a semi-transparent white background so it remains legible over any weather background color.

### Landmark Photography

`CurrentWeather.tsx` fires a `useEffect` on each new location to call `/api/landmark`, which queries the Wikipedia Pageimages API. On success, the returned URL is applied as a CSS `background-image` on the weather card container. A semi-transparent blue gradient overlay is layered on top to maintain text contrast at all times. If no image is found through any fallback step, the card displays the default solid blue gradient.

---

## Tech Stack

- Next.js 14 (App Router, Route Handlers, Server Components)
- React 18
- TypeScript 5
- Tailwind CSS 3
- better-sqlite3 (synchronous SQLite bindings for Node.js)
- PDFKit (server-side PDF generation)
- OpenWeatherMap REST API
- Open-Meteo REST API (historical archive and forecast)
- Wikipedia Pageimages REST API
- OpenStreetMap iframe embed
- YouTube Data API v3 (optional)

---

## Author

Zhiliang Wang  
zw3162@columbia.edu  
GitHub: https://github.com/zw3162-Leon
