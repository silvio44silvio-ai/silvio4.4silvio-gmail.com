
import { GoogleGenAI, Type } from "@google/genai";
import { Professional, JobVacancy } from "../types";

export const searchProfessionals = async (query: string, lat?: number, lng?: number): Promise<Professional[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Aja como um headhunter especializado no mundo Va'a. 
      Busque por profissionais: treinadores, salva-vidas, gestores.
      Consulta: "${query}" ${lat ? `perto de ${lat}, ${lng}` : ''}.
      
      Retorne JSON com array "professionals":
      - name, role, location, specialty, contact, description, image, certifications (array), verified (bool), available (bool), yearsExperience (num)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            professionals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  location: { type: Type.STRING },
                  specialty: { type: Type.STRING },
                  contact: { type: Type.STRING },
                  description: { type: Type.STRING },
                  image: { type: Type.STRING },
                  certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  verified: { type: Type.BOOLEAN },
                  available: { type: Type.BOOLEAN },
                  yearsExperience: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{"professionals":[]}');
    return data.professionals.map((p: any, i: number) => ({ ...p, id: `pro-${i}-${Date.now()}` }));
  } catch (error) {
    return [];
  }
};

export const searchJobs = async (lat?: number, lng?: number): Promise<JobVacancy[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Gere 3 vagas de emprego fictícias mas realistas para o setor de canoagem va'a e esportes de remo ${lat ? `perto de lat ${lat}, lng ${lng}` : ''}. Retorne JSON array "jobs" com fields: id, baseName, title, type (CLT/Freelance/Sócio), description, location, salaryRange, requirements (array).`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const data = JSON.parse(response.text || '{"jobs":[]}');
    return data.jobs;
  } catch (e) {
    return [];
  }
};
