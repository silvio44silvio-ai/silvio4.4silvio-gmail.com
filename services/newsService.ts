import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, CompetitionEvent } from "../types";

export const fetchCanoeNews = async (): Promise<{ news: NewsItem[], events: CompetitionEvent[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Aja como um especialista em esportes de remo. Forneça as últimas notícias e calendários de competições de 2024 e 2025 sobre:
      Canoa Havaiana (Va'a), Polinésia, Taitiana, Dragon Boat, OC1, OC6, V1, V6, SUP (Stand Up Paddle) e Surfski no Brasil e no mundo.
      
      Retorne um JSON com dois arrays:
      1. "news": últimas notícias (título, data formatada, resumo curto, categoria, url).
      2. "events": próximas competições (nome do evento, data, local, categoria, url).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            news: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  date: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  category: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["title", "date", "summary", "category", "url"]
              }
            },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  date: { type: Type.STRING },
                  location: { type: Type.STRING },
                  category: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["title", "date", "location", "category", "url"]
              }
            }
          },
          required: ["news", "events"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");

    const data = JSON.parse(text);
    
    const news = (data.news || []).map((n: any, i: number) => ({ ...n, id: n.id || `news-${i}` }));
    const events = (data.events || []).map((e: any, i: number) => ({ ...e, id: e.id || `event-${i}` }));

    return { news, events };
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return { news: [], events: [] };
  }
};