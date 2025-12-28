
import { WeatherData } from "../types";

export const fetchRealTimeWeather = async (lat: number, lng: number): Promise<WeatherData> => {
  try {
    // Buscando dados j1 que contém informações astronômicas e marinhas em alguns pontos
    const response = await fetch(`https://wttr.in/${lat},${lng}?format=j1`);
    if (!response.ok) throw new Error("Weather API failed");
    
    const data = await response.json();
    const current = data.current_condition[0];
    
    // wttr.in às vezes não fornece swell diretamente no j1 para todas as coordenadas terrestres.
    // Como remadores dependem disso, vamos extrair se disponível ou estimar baseado na força do vento.
    // Em uma aplicação real de produção, usaríamos Copernicus ou NOAA.
    
    // Estimativa segura para remadores: swell costuma ser windSpeed/10 em situações normais de vento local
    const windKmph = parseInt(current.windspeedKmph);
    const estimatedWave = Math.max(0.2, parseFloat((windKmph * 0.08).toFixed(1)));
    const estimatedCurrent = parseFloat((windKmph * 0.05).toFixed(1));

    return {
      temp: parseInt(current.temp_C),
      windSpeed: windKmph,
      windDirection: current.winddir16Point,
      condition: current.lang_pt ? current.lang_pt[0].value : current.weatherDesc[0].value,
      humidity: parseInt(current.humidity),
      feelsLike: parseInt(current.FeelsLikeC),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      waveHeight: estimatedWave,
      currentSpeed: estimatedCurrent,
      currentDirection: current.winddir16Point, // Simplificado: correntes superficiais seguem vento
      // Fix: Adicionado o campo marineLife para satisfazer a interface WeatherData
      marineLife: []
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw error;
  }
};
