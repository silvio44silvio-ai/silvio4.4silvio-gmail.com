
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RouteData, StrokeAnalysis } from "../types";

export const analyzeRouteSafety = async (
  route: RouteData,
  location: { lat: number, lng: number }
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analise a segurança para um remador nas seguintes coordenadas:
    Localização Atual: Lat ${location.lat}, Lng ${location.lng}
    Distância da Rota: ${route.distance.toFixed(2)}km
    Waypoints: ${JSON.stringify(route.waypoints)}

    Se for mar aberto, foque em: Navios grandes, Correntes e Swell.
    Se for em LAGOAS ou REPRESAS, foque em: Áreas de pesca, bancos de areia e vegetação.
    
    Retorne JSON:
    1. Score de segurança (0-100).
    2. Recomendações específicas para o tipo de água (Mar vs Interna).
    3. Perigos.
    4. marineLife [].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safetyScore: { type: Type.NUMBER },
            recommendations: { type: Type.STRING },
            hazards: { type: Type.ARRAY, items: { type: Type.STRING } },
            marineLife: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  date: { type: Type.STRING },
                  severity: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    
    // Extract grounding chunks as sources per Google GenAI guidelines
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      web: chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : undefined
    })).filter((s: any) => s.web) || [];

    return { 
      safetyScore: result.safetyScore ?? 50,
      recommendations: result.recommendations ?? "Mantenha vigilância visual.",
      hazards: result.hazards ?? ["Dados indisponíveis"],
      marineLife: result.marineLife ?? [],
      sources: sources
    };
  } catch (error) {
    return { safetyScore: 50, recommendations: "Mantenha vigilância visual.", hazards: ["Dados indisponíveis"], sources: [], marineLife: [] };
  }
};

export const getTechnicalPaddlingAdvice = async (
  stats: { spm: number, speed: number, dps: number, canoeType: string }
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Aja como um treinador de elite de ${stats.canoeType}. 
  Dados do atleta: Cadência ${stats.spm} SPM, Velocidade ${stats.speed} km/h, Distância por remada ${stats.dps}m.
  Forneça 3 dicas técnicas curtas e acionáveis para melhorar a eficiência. Retorne um JSON array de strings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    // Ensure we handle potentially undefined text property correctly
    return JSON.parse(response.text || "[]");
  } catch {
    return ["Mantenha o tronco inclinado.", "Melhore a entrada do remo (Catch).", "Use o core na tração."];
  }
};

export const processVoiceIntent = async (text: string): Promise<{ intent: string, params?: any }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Interprete o comando de um remador: "${text}". 
  Intenções possíveis: START_TRAINING, STOP_TRAINING, ANALYZE_SAFETY, GET_STATS, SET_ROUTE.
  Retorne JSON { intent: string, params: object }.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch {
    return { intent: "UNKNOWN" };
  }
};
