
import React, { useState, useEffect, useRef } from 'react';
import { Zap, Volume2, VolumeX, Play, Pause } from 'lucide-react';

export const Metronome: React.FC<{ spm: number }> = ({ spm }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const playClick = () => {
    if (isMuted || !audioContextRef.current) return;
    try {
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime);
      gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      
      osc.start();
      osc.stop(audioContextRef.current.currentTime + 0.1);
    } catch (e) {
      console.warn("AudioContext interaction blocked");
    }
  };

  useEffect(() => {
    if (isActive && spm > 0) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const interval = (60 / spm) * 1000;
      timerRef.current = window.setInterval(playClick, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, spm, isMuted]);

  return (
    <div className="p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-[2.5rem] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-yellow-500 animate-pulse' : 'bg-slate-800'}`}>
          <Zap size={16} className={isActive ? 'text-black' : 'text-slate-500'} />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Tactical Pacer</h4>
          <p className="text-[8px] font-bold text-yellow-500 uppercase">Ritmo: {spm > 0 ? `${spm} SPM` : 'Aguardando'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className={`p-3 rounded-xl transition-all ${isMuted ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsActive(!isActive); }}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'}`}
        >
          {isActive ? <Pause size={20} /> : <Play size={20} fill="black" className="ml-1" />}
        </button>
      </div>
    </div>
  );
};
