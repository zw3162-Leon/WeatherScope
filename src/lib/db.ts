import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import type { WeatherRecord } from '@/types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'weather.db');

declare global {
  // eslint-disable-next-line no-var
  var __weatherDb: DatabaseSync | undefined;
}

function initDatabase(): DatabaseSync {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const conn = new DatabaseSync(DB_PATH);
  conn.exec(`PRAGMA journal_mode = WAL`);
  conn.exec(`
    CREATE TABLE IF NOT EXISTS weather_records (
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
      daily_data      TEXT    DEFAULT '[]',
      notes           TEXT    DEFAULT '',
      created_at      TEXT    DEFAULT (datetime('now')),
      updated_at      TEXT    DEFAULT (datetime('now'))
    )
  `);
  return conn;
}

function getConn(): DatabaseSync {
  if (process.env.NODE_ENV === 'development') {
    if (!global.__weatherDb) {
      global.__weatherDb = initDatabase();
    }
    return global.__weatherDb;
  }
  return initDatabase();
}

export const db = {
  getAll(): WeatherRecord[] {
    return getConn()
      .prepare('SELECT * FROM weather_records ORDER BY created_at DESC')
      .all() as unknown as WeatherRecord[];
  },

  getById(id: number): WeatherRecord | undefined {
    return getConn()
      .prepare('SELECT * FROM weather_records WHERE id = ?')
      .get(id) as unknown as WeatherRecord | undefined;
  },

  insert(r: Omit<WeatherRecord, 'id' | 'created_at' | 'updated_at'>): number {
    const result = getConn().prepare(`
      INSERT INTO weather_records
        (location, latitude, longitude, date_from, date_to,
         temperature_min, temperature_max, temperature_avg,
         description, humidity, wind_speed, weather_icon, daily_data, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      r.location,
      r.latitude ?? null,
      r.longitude ?? null,
      r.date_from,
      r.date_to,
      r.temperature_min ?? null,
      r.temperature_max ?? null,
      r.temperature_avg ?? null,
      r.description,
      r.humidity,
      r.wind_speed,
      r.weather_icon,
      r.daily_data,
      r.notes
    );
    return Number(result.lastInsertRowid);
  },

  update(
    id: number,
    fields: Partial<Pick<WeatherRecord,
      'notes' | 'description' | 'location' | 'latitude' | 'longitude' |
      'temperature_min' | 'temperature_max' | 'temperature_avg' |
      'humidity' | 'wind_speed' | 'weather_icon' | 'daily_data' | 'date_from' | 'date_to'
    >>
  ): boolean {
    const keys = Object.keys(fields);
    if (keys.length === 0) return false;
    const setClauses = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => (fields as Record<string, unknown>)[k]);
    const result = getConn().prepare(
      `UPDATE weather_records SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`
    ).run(...values as Parameters<ReturnType<DatabaseSync['prepare']>['run']>, id);
    return result.changes > 0;
  },

  delete(id: number): boolean {
    const result = getConn().prepare('DELETE FROM weather_records WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
