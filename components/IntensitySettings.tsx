
import React from 'react';
import { IntensityZone } from '../types';
import { Sliders, Zap, Timer, Gauge } from 'lucide-react';

interface IntensitySettingsProps {
  zones: IntensityZone[];
  onUpdateZones: (zones: IntensityZone[]) => void;
  activeZoneId: number;
  onSelectZone: (id: number) => void;
}

export const IntensitySettings: React.FC<IntensitySettingsProps> = ({ 
  zones, onUpdateZones, activeZoneId, onSelectZone 
}) => {
  const handleUpdate = (id: number, field: 'speedKmh' | 'spm', value: number) => {
    const newZones = zones.map(z => z.id === id ? { ...z, [field]: value } : z);
    onUpdateZones(newZones);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-3 px-2">
        <Sliders size={18} className="text-cyan-400" />
        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Zonas de Intensidade</h3>
      </div>

      <div className="space-y-4">
        {zones.map((zone) => (
          <div 
            key={zone.id}
            onClick={(e) => { e.stopPropagation(); onSelectZone(zone.id); }}
            className={`p-5 rounded-[2rem] border transition-all cursor-pointer active:scale-[0.98] ${
              activeZoneId === zone.id 
                ? 'bg-slate-900 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
                : 'bg-slate-950/50 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${zone.color.replace('text-', 'bg-')}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${zone.color}`}>{zone.label}</span>
              </div>
              {activeZoneId === zone.id && (
                <div className="px-3 py-1 bg-cyan-500 rounded-full text-[8px] font-black text-white uppercase animate-in zoom-in-50">ATIVO</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 opacity-40">
                    <Gauge size={12} />
                    <span className="text-[8px] font-black uppercase">KM/H</span>
                  </div>
                  <span className="text-xs font-black italic text-white">{zone.speedKmh.toFixed(1)}</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={zone.speedKmh}
                  onChange={(e) => handleUpdate(zone.id, 'speedKmh', parseFloat(e.target.value))}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 opacity-40">
                    <Zap size={12} />
                    <span className="text-[8px] font-black uppercase">SPM</span>
                  </div>
                  <span className="text-xs font-black italic text-white">{zone.spm}</span>
                </div>
                <input 
                  type="range"
                  min="40"
                  max="110"
                  step="1"
                  value={zone.spm}
                  onChange={(e) => handleUpdate(zone.id, 'spm', parseInt(e.target.value))}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
        <Timer size={16} className="text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-[9px] leading-relaxed text-yellow-500/80 font-bold uppercase">
          DICA TÉCNICA: Ajuste as zonas de acordo com seu último teste de limiar para garantir que o simulador tático reflita seu esforço real.
        </p>
      </div>
    </div>
  );
};
