
import React, { useRef, useState } from 'react';
import { Camera, Zap, Activity, RefreshCcw, Video } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const AITechnique: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setAnalyzing(true);
      }
    } catch (err) {
      alert("Permissão de câmera negada.");
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setAnalyzing(true);
    setFeedback("IA analisando sua biomecânica...");

    const ctx = canvasRef.current.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, 640, 480);
    const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analise a técnica de remada deste atleta de Va'a. Verifique o ângulo do tronco, a extensão dos braços e o 'catch' (entrada na água). Forneça 3 dicas táticas curtas em português."
          }
        ]
      });

      setFeedback(response.text || "Análise concluída.");
    } catch (e) {
      setFeedback("Erro na conexão com a base de dados central.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-white/5 rounded-[2.5rem] space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-600 rounded-xl">
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">IA Stroke Analysis</h4>
          <p className="text-[8px] font-bold text-purple-400 uppercase">Biomecânica em Tempo Real</p>
        </div>
      </div>

      {!analyzing && !feedback ? (
        <button 
          onClick={startAnalysis}
          className="w-full py-10 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 text-white/20 hover:text-cyan-400 hover:border-cyan-400/30 transition-all"
        >
          <Camera size={32} />
          <span className="text-[10px] font-black uppercase tracking-widest">Posicionar Câmera Lateralmente</span>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-black border border-white/10 aspect-video">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" width="640" height="480" />
            <div className="absolute top-4 left-4 flex gap-2">
               <div className="px-2 py-1 bg-red-600 text-white text-[8px] font-black rounded uppercase animate-pulse">Live Feed</div>
            </div>
          </div>
          
          {feedback ? (
            <div className="p-4 bg-purple-600/10 border border-purple-600/30 rounded-2xl">
               <p className="text-[10px] text-purple-200 leading-relaxed italic uppercase font-bold">
                 {feedback}
               </p>
               <button onClick={() => { setFeedback(null); startAnalysis(); }} className="mt-4 flex items-center gap-2 text-[8px] font-black text-white uppercase opacity-40 hover:opacity-100 transition-opacity">
                 <RefreshCcw size={10} /> Reiniciar Laboratório
               </button>
            </div>
          ) : (
            <button 
              onClick={captureAndAnalyze}
              className="w-full py-4 bg-purple-600 rounded-2xl text-white font-black text-[10px] uppercase shadow-xl shadow-purple-600/20 active:scale-95 transition-all"
            >
              Capturar Frame de Performance
            </button>
          )}
        </div>
      )}
    </div>
  );
};
