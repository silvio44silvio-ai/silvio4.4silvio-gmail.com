
import { GoogleGenAI } from "@google/genai";

export interface LocationResult {
  lat: number;
  lng: number;
  name: string;
}

export const searchAddress = async (query: string): Promise<LocationResult | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prompt otimizado para extração de dados brutos
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `LOCALIZE O ENDEREÇO OU PONTO NÁUTICO: "${query}". 
      REGRAS DE RESPOSTA:
      1. Forneça o nome oficial.
      2. Forneça latitude e longitude decimais exatas.
      3. Responda APENAS seguindo este padrão estrito:
      DESTINO: [Nome Completo]
      COORDENADAS: [Latitude], [Longitude]`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || "";
    console.debug("Resposta da Busca IA:", text);

    // Regex flexível para capturar coordenadas em diversos formatos decimais
    const coordsMatch = text.match(/COORDENADAS:\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/i);
    const nameMatch = text.match(/DESTINO:\s*(.*)/i);

    if (coordsMatch && coordsMatch[1] && coordsMatch[2]) {
      const result = {
        lat: parseFloat(coordsMatch[1]),
        lng: parseFloat(coordsMatch[2]),
        name: nameMatch ? nameMatch[1].trim() : query
      };
      console.log("Localização encontrada:", result);
      return result;
    }
    
    // Fallback: Tentativa de extração agressiva de números se o padrão falhar
    const genericCoords = text.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (genericCoords) {
      return {
        lat: parseFloat(genericCoords[1]),
        lng: parseFloat(genericCoords[2]),
        name: query
      };
    }

    return null;
  } catch (error) {
    console.error("Erro crítico na busca de endereço:", error);
    return null;
  }
};
