
import { WeatherData } from "../types";

const WEATHER_CACHE_KEY = 'bussulvaa_weather_cache';
const WEATHER_EXPIRY = 30 * 60 * 1000; // 30 minutos

export const fetchRealTimeWeather = async (lat: number, lng: number): Promise<WeatherData> => {
  const cached = localStorage.getItem(WEATHER_CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < WEATHER_EXPIRY) {
      return data;
    }
  }

  try {
    const response = await fetch(`https://wttr.in/${lat},${lng}?format=j1`);
    if (!response.ok) throw new Error("Weather API failed");
    
    const data = await response.json();
    const current = data.current_condition[0];
    const windKmph = parseInt(current.windspeedKmph);
    const airTemp = parseInt(current.temp_C);
    
    const waveBase = windKmph * 0.07;
    const weatherResult: WeatherData = {
      temp: airTemp,
      waterTemp: airTemp > 20 ? airTemp - 2 : airTemp + 2,
      uvIndex: parseInt(current.uvIndex),
      windSpeed: windKmph,
      windDirection: current.winddir16Point,
      condition: current.lang_pt ? current.lang_pt[0].value : current.weatherDesc[0].value,
      humidity: parseInt(current.humidity),
      feelsLike: parseInt(current.FeelsLikeC),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      waveHeight: Math.max(0.2, parseFloat(waveBase.toFixed(1))),
      wavePeriod: Math.max(4, Math.floor(windKmph * 0.3) + 3),
      currentSpeed: parseFloat((windKmph * 0.12).toFixed(1)),
      currentDirection: current.winddir16Point,
      marineLife: []
    };

    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
      data: weatherResult,
      timestamp: Date.now()
    }));

    return weatherResult;
  } catch (error) {
    if (cached) return JSON.parse(cached).data;
    throw error;
  }
};
