export interface WeatherRecord {
  id: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  date_from: string;
  date_to: string;
  temperature_min: number | null;
  temperature_max: number | null;
  temperature_avg: number | null;
  description: string;
  humidity: number;
  wind_speed: number;
  weather_icon: string;
  daily_data: string; // JSON string: DailyWeather[]
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DailyWeather {
  date: string;
  temp_min: number;
  temp_max: number;
  temp_mean: number;
  description: string;
  icon: string;
}

export interface CurrentWeatherData {
  location_name: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  description: string;
  icon: string;
  pressure: number;
  visibility: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastDay {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  pop: number; // probability of precipitation
}

export interface GeoResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
