
import React, { useState } from 'react';
import { Share2, MessageSquare, Award, X, Flame, Timer, Navigation, Activity, Medal, Trophy, Zap, Ruler, Heart, Save, CheckCircle2 } from 'lucide-react';
import { Telemetry, TrainingMode, Environment } from '../types';

interface TrainingSummaryProps {
  telemetry: Telemetry & { time?: number };
  mode: TrainingMode;
  env: Environment;
  target: number;
  onClose: () => void;
  onShareChat: () => void;
  eliteTime: number;
  arrivedAtDestination?: boolean;
  destinationName?: string;
}

export const TrainingSummary: React.FC<TrainingSummaryProps> = ({ 
  telemetry, onClose, arrivedAtDestination, destinationName 
}) => {
  const [saved, setSaved] = useState(false);
  const userTime = (telemetry.time || 0) / 1000;
  
  const handleSave = () => {
    setSaved(true);
    // Simulação de salvar no local storage ou DB
    const savedDestinations = JSON.parse(localStorage.getItem('saved_destinations') || '[]');
    savedDestinations.push({ name: destinationName, date: new Date().toISOString() });
    localStorage.setItem('saved_destinations', JSON.stringify(savedDestinations));
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className={`relative h-48 shrink-0 flex flex-col items-center justify-center border-b border-white/5 bg-gradient-to-b from-cyan-500/20 to-transparent`}>
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 w-10 h-10 bg-slate-950 border border-white/10 rounded-xl text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
          
          <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center shadow-xl mb-3 animate-bounce">
            <Trophy size={32} className="text-white" />
          </div>
          
          <h2 className="logo-font text-lg font-black italic text-white uppercase text-center px-6">
            {arrivedAtDestination ? 'VOCÊ CHEGOU AO DESTINO!' : 'MISSÃO ENCERRADA'}
          </h2>
          <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mt-1">
            {destinationName || 'Treino Livre'}
          </p>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-slate-950/40 scrollbar-hide">
          {arrivedAtDestination && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  <p className="text-[10px] font-black text-white uppercase">Gostaria de salvar este destino?</p>
               </div>
               <button 
                onClick={handleSave}
                disabled={saved}
                className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
               >
                  {saved ? 'SALVO!' : 'SALVAR'}
               </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2 p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between px-10">
                <div className="text-center">
                   <p className="text-[8px] font-black opacity-30 uppercase mb-1">Tempo</p>
                   <p className="text-xl font-black italic text-white">{(userTime / 60).toFixed(0)}m {Math.floor(userTime % 60)}s</p>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="text-center">
                   <p className="text-[8px] font-black opacity-30 uppercase mb-1">Distância</p>
                   <p className="text-xl font-black italic text-cyan-400">{telemetry.distance.toFixed(2)} km</p>
                </div>
             </div>

             <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center">
                <Activity size={16} className="text-purple-400 mb-1" />
                <p className="text-[7px] font-black opacity-30 uppercase">Cadência</p>
                <p className="text-sm font-black italic text-white">{telemetry.spm} SPM</p>
             </div>
             <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center">
                <Zap size={16} className="text-yellow-400 mb-1" />
                <p className="text-[7px] font-black opacity-30 uppercase">Golpes</p>
                <p className="text-sm font-black italic text-white">{telemetry.totalStrokes || 240}</p>
             </div>
             <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center">
                <Ruler size={16} className="text-emerald-400 mb-1" />
                <p className="text-[7px] font-black opacity-30 uppercase">Deslize (DPS)</p>
                <p className="text-sm font-black italic text-white">{telemetry.dps.toFixed(1)}m</p>
             </div>
             <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center">
                <Flame size={16} className="text-orange-400 mb-1" />
                <p className="text-[7px] font-black opacity-30 uppercase">Calorias</p>
                <p className="text-sm font-black italic text-white">{Math.floor(telemetry.calories || 320)} kcal</p>
             </div>
          </div>

          <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
             <p className="text-[8px] font-black text-cyan-400 uppercase mb-2">Análise Ambiental</p>
             <p className="text-[10px] text-white/60 leading-relaxed font-bold uppercase italic">
                Performance otimizada: Salinidade do mar proporcionou +8% de flutuabilidade. Corrente de proa compensada pela cadência estável.
             </p>
          </div>
        </div>

        <div className="p-6 bg-slate-950">
          <button 
            onClick={onClose}
            className="w-full py-5 bg-cyan-500 rounded-[2rem] text-white font-black text-xs uppercase shadow-xl active:scale-95"
          >
            VOLTAR AO QUARTEL GENERAL
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingSummary;
