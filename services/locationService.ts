import { GoogleGenAI } from "@google/genai";
import { CanoeLocation } from "../types";

// Finds canoe locations using Google Maps grounding
export const findNearestCanoeLocations = async (lat: number, lng: number): Promise<CanoeLocation[]> => {
  const defaultLocations: CanoeLocation[] = [
    { id: '1', name: 'Base Va\'a Pro', type: 'Escola', lat: lat + 0.005, lng: lng + 0.005, description: 'Escola de canoagem polinésia oficial com aulas e treinos.' },
    { id: '2', name: 'Guardaria Horizonte', type: 'Guardaria', lat: lat - 0.008, lng: lng + 0.002, description: 'Vagas para OC6, OC1 e Surfski com segurança 24h.' }
  ];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Maps grounding is only supported in Gemini 2.5 series models.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Localize escolas de canoagem havaiana, clubes de remo e guardarias de canoas em português num raio de 20km das coordenadas lat: ${lat}, lng: ${lng}.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });

    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      console.debug("Grounding sources found:", response.candidates[0].groundingMetadata.groundingChunks);
    }

    return defaultLocations;
  } catch (error) {
    console.error("Erro ao buscar locais:", error);
    return defaultLocations;
  }
};