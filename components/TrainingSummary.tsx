
import React from 'react';
import { Share2, MessageSquare, Award, X, Flame, Timer, Navigation, Activity, Medal, Trophy, Zap, Ruler, Heart } from 'lucide-react';
import { Telemetry, TrainingMode, Environment } from '../types';

interface TrainingSummaryProps {
  telemetry: Telemetry & { time?: number };
  mode: TrainingMode;
  env: Environment;
  target: number;
  onClose: () => void;
  onShareChat: () => void;
  eliteTime: number;
}

export const TrainingSummary: React.FC<TrainingSummaryProps> = ({ 
  telemetry, mode, env, target, onClose, onShareChat, eliteTime 
}) => {
  const userTime = (telemetry.time || 0) / 1000;
  const isElite = userTime <= eliteTime && (telemetry.distance * 1000 >= target * 0.95);
  const isDragonBoat = mode === 'DRAGON_BOAT';
  
  const handleSocialShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    let text = "";
    if (isDragonBoat) {
      text = `💗 Vitória na Água! Dragon Boat Pink na BussulVa'a!\n🚣 Distância: ${telemetry.distance.toFixed(1)}km\n✨ Superação e Força em cada remada!\n#BussulVaa #DragonBoatPink #Superação`;
    } else {
      text = isElite 
        ? `🏆 ATINGI O RITMO DE ELITE! 🔥\n🚣 Prova: ${target}m em ${userTime.toFixed(1)}s\n📏 DPS: ${telemetry.dps.toFixed(1)}m | Remadas: ${telemetry.totalStrokes}\n#WorldChampions #BussulVaa #RemoElite`
        : `🔥 Missão Cumprida na BussulVa'a!\n🚣 Treino: ${telemetry.distance.toFixed(1)}km em ${userTime.toFixed(1)}s\n📏 Eficiência: ${telemetry.dps.toFixed(1)}m/stroke\n#BussulVaa #RemoTatico`;
    }
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Performance BussulVa\'a', text, url: window.location.href });
      } catch (err) { 
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Resumo copiado!");
  };

  // Cores dinâmicas baseadas no modo
  const themeColor = isDragonBoat ? 'pink' : (isElite ? 'yellow' : 'cyan');
  const ThemeIcon = isDragonBoat ? Heart : (isElite ? Trophy : Medal);

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        
        {/* Header Adaptativo */}
        <div className={`relative h-40 shrink-0 flex flex-col items-center justify-center border-b border-white/5 bg-gradient-to-b from-${themeColor}-500/20 to-transparent`}>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="absolute top-6 right-6 w-12 h-12 bg-slate-950/90 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all z-[510] flex items-center justify-center active:scale-90"
          >
            <X size={20} />
          </button>
          
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl mb-2 animate-bounce bg-${themeColor}-500 shadow-${themeColor}-500/50`}>
            <ThemeIcon size={32} className="text-white" />
          </div>
          
          <h2 className="logo-font text-lg font-black italic text-white tracking-tighter text-center px-6 uppercase">
            {isDragonBoat ? 'GUERREIRA DO MAR' : (isElite ? 'RITMO DE LENDA!' : 'MISSÃO FINALIZADA')}
          </h2>
          <p className={`text-[8px] font-black text-${themeColor}-400 uppercase tracking-[0.2em] mt-1`}>
            {isDragonBoat ? 'MODO DRAGON BOAT PINK' : 'BUSSULVA\'A ELITE TACTICAL'}
          </p>
        </div>

        {/* Estatísticas */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-slate-950/40 scrollbar-hide">
          
          {isDragonBoat && (
            <div className="p-4 bg-pink-500/5 border border-pink-500/20 rounded-3xl text-center">
               <p className="text-[10px] font-bold text-pink-200 leading-relaxed italic uppercase">
                  "Sua remada hoje não moveu apenas a canoa, moveu montanhas. Parabéns pela persistência."
               </p>
            </div>
          )}

          <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10 text-center">
             <div className="flex justify-center gap-6 items-center">
                <div>
                   <p className="text-[8px] font-black text-white/40 uppercase mb-1">Tempo Total</p>
                   <p className="text-2xl font-black italic logo-font text-white">{userTime.toFixed(1)}<span className="text-[10px] ml-1">s</span></p>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div>
                   <p className="text-[8px] font-black text-white/40 uppercase mb-1">Distância</p>
                   <p className={`text-2xl font-black italic logo-font text-${themeColor}-400`}>{telemetry.distance.toFixed(2)}<span className="text-[10px] ml-1">km</span></p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-[1.8rem] bg-white/5 border border-white/5 flex flex-col items-center">
              <Zap size={16} className={`text-${themeColor === 'pink' ? 'pink' : 'cyan'}-400 mb-1`} />
              <p className="text-[7px] font-black text-white/40 uppercase mb-1">Golpes</p>
              <p className="text-xl font-black italic logo-font text-white">{telemetry.totalStrokes}</p>
            </div>
            <div className="p-4 rounded-[1.8rem] bg-white/5 border border-white/5 flex flex-col items-center">
              <Ruler size={16} className="text-emerald-400 mb-1" />
              <p className="text-[7px] font-black text-white/40 uppercase mb-1">DPS (Gliss)</p>
              <p className="text-xl font-black italic logo-font text-white">{telemetry.dps.toFixed(1)}m</p>
            </div>
            <div className="p-4 rounded-[1.8rem] bg-white/5 border border-white/5 flex flex-col items-center">
              <Activity size={16} className="text-purple-400 mb-1" />
              <p className="text-[7px] font-black text-white/40 uppercase mb-1">Cadência</p>
              <p className="text-xl font-black italic logo-font text-white">{telemetry.spm} <span className="text-[8px]">SPM</span></p>
            </div>
            <div className="p-4 rounded-[1.8rem] bg-white/5 border border-white/5 flex flex-col items-center">
              <Flame size={16} className="text-orange-400 mb-1" />
              <p className="text-[7px] font-black text-white/40 uppercase mb-1">Energia</p>
              <p className="text-xl font-black italic logo-font text-white">{Math.floor(telemetry.calories)} <span className="text-[8px]">KCAL</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-950 flex flex-col gap-3 shrink-0">
          <button 
            type="button"
            onClick={handleSocialShare} 
            className={`w-full py-4 rounded-2xl bg-${themeColor}-500 text-white font-black text-xs uppercase hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl`}
          >
            <Share2 size={16} /> COMPARTILHAR VITÓRIA
          </button>
        </div>
      </div>
    </div>
  );
};
