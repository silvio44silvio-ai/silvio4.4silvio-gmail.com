
import { GoogleGenAI } from "@google/genai";

export interface LocationResult {
  lat: number;
  lng: number;
  name: string;
}

export const searchAddress = async (query: string): Promise<LocationResult | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Usamos o Gemini 2.5 Flash para converter texto em coordenadas reais via Maps Grounding
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Encontre as coordenadas geográficas (latitude e longitude) e o nome oficial para o local: "${query}". Responda apenas com os dados no formato: NOME: [nome], LAT: [valor], LNG: [valor].`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text;
    const latMatch = text.match(/LAT:\s*(-?\d+\.\d+)/i);
    const lngMatch = text.match(/LNG:\s*(-?\d+\.\d+)/i);
    const nameMatch = text.match(/NOME:\s*(.*?),/i) || text.match(/NOME:\s*(.*)/i);

    if (latMatch && lngMatch) {
      return {
        lat: parseFloat(latMatch[1]),
        lng: parseFloat(lngMatch[1]),
        name: nameMatch ? nameMatch[1].trim() : query
      };
    }
    
    // Fallback: Tentar extrair do Grounding Metadata se o texto falhar
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      // Se houver chunks, poderíamos tentar extrair mais info, 
      // mas o regex acima costuma ser suficiente com o prompt correto.
    }

    return null;
  } catch (error) {
    console.error("Erro na busca de endereço:", error);
    return null;
  }
};
