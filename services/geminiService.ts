
import { GoogleGenAI, Type } from "@google/genai";
import { SafetyAnalysis } from "../types";

const CACHE_KEY = 'bussulvaa_safety_cache';
const MIN_DISTANCE_METERS = 500;
const MIN_TIME_MS = 15 * 60 * 1000; // 15 minutos

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const getSafetyUpdate = async (lat: number, lng: number): Promise<SafetyAnalysis> => {
  // Verificar Cache para economizar API
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp, coords } = JSON.parse(cached);
    const dist = calculateDistance(lat, lng, coords.lat, coords.lng);
    const timePassed = Date.now() - timestamp;

    if (dist < MIN_DISTANCE_METERS && timePassed < MIN_TIME_MS) {
      console.log("Using cached safety data (Eco Mode)");
      return { ...data, lastUpdate: new Date(timestamp).toLocaleTimeString() };
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise segurança e fauna marinha para remadores em: Lat ${lat}, Lng ${lng}. 
      VERIFIQUE RIGOROSAMENTE: 
      1. Presença de Tubarões, Golfinhos ou Baleias.
      2. Riscos de correntes.
      Responda em JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            hazards: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.STRING },
            tsunamiAlert: { type: Type.BOOLEAN },
            marineDetections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  label: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["type", "label", "riskLevel", "description"]
              }
            }
          },
          required: ["score", "hazards", "recommendations", "tsunamiAlert", "marineDetections"]
        }
      }
    });

    const result = JSON.parse(response.text) as SafetyAnalysis;
    
    // Salvar no Cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: result,
      timestamp: Date.now(),
      coords: { lat, lng }
    }));

    return result;
  } catch (e) {
    console.error("AI Safety Error:", e);
    // Se falhar (Rate limit), tenta retornar o cache mesmo que antigo
    if (cached) return JSON.parse(cached).data;
    return fallbackSafety();
  }
};

const fallbackSafety = (): SafetyAnalysis => ({ 
  score: 50, 
  hazards: ["Sistemas de IA em alta carga. Use cautela visual."], 
  recommendations: "Mantenha atenção visual constante e use sempre colete salva-vidas.", 
  tsunamiAlert: false,
  marineDetections: []
});
