
import React, { useState } from 'react';
import { UserProfile, WeatherData, Telemetry, NewsItem, CanoeLocation, TrainingMode, Environment, MapStyle, Language, IntensityZone, SafetyAnalysis } from '../types';
import { 
  Activity, MapPin, AlertOctagon, Flame, Timer, Target, Medal, Globe, Users, Sliders, ShieldCheck, Crown, Zap, Music, Search, X, ShoppingBag, Home, Mic, MicOff, UserMinus, Sparkles, Square, Play, Pause, Ruler, ChevronRight, Waves, Heart, Layers, Map as MapIcon, Navigation, Compass, Info, Anchor
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { translations } from '../services/translations';

interface SidebarProps {
  analysis: SafetyAnalysis | null;
  userLocation: { lat: number; lng: number } | null;
  userProfile: UserProfile;
  sessionStatus: 'IDLE' | 'ACTIVE' | 'PAUSED';
  onToggleTimer: () => void;
  onStopTimer: () => void;
  telemetry: Telemetry;
  // onStartNav now uses the MapStyle type to avoid assignment errors in App.tsx
  onStartNav: (style: MapStyle) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  userProfile, onToggleTimer, onStopTimer, sessionStatus, telemetry, userLocation, analysis,
  onStartNav, onClose
}) => {
  const [activeTab, setActiveTab] = useState<'missao' | 'map' | 'shop' | 'pros' | 'zones' | 'lab'>('missao');
  
  return (
    <div className={`relative w-full h-full flex flex-col transition-all duration-500 bg-slate-950 text-white`}>
      
      {/* HEADER CONFORME ESBOÇO */}
      <div className="px-6 py-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 p-2 bg-slate-900 border border-white/10 rounded-lg">
            <span className="text-[10px] font-black uppercase tracking-tighter text-white">STATUS: ONLINE</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-center text-white"><X size={20} /></button>
      </div>

      {/* LOGO E BOTÕES DE ATALHO DO ESBOÇO */}
      <div className="px-6 py-4 flex items-center justify-between shrink-0 mb-6">
         <button className="w-12 h-12 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center"><Search size={22} className="text-cyan-400" /></button>
         <h1 className="logo-font text-xl italic font-black text-white">BUSSULVA'A</h1>
         <button className="w-12 h-12 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center"><ShoppingBag size={22} className="text-cyan-400" /></button>
      </div>

      {/* ABAS DO ESBOÇO */}
      <div className="grid grid-cols-6 px-4 gap-1 mb-6 shrink-0">
        {[
          {id: 'missao', label: 'MISSÃO'}, 
          {id: 'map', label: 'MAP'}, 
          {id: 'shop', label: 'SHOP'}, 
          {id: 'pros', label: 'PROS'}, 
          {id: 'zones', label: 'ZONES'}, 
          {id: 'lab', label: 'LAB'}
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`py-2 rounded-lg text-[7px] font-black border transition-all ${activeTab === tab.id ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-900 border-white/5 text-slate-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DINÂMICO */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {activeTab === 'map' && (
           <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-center logo-font text-sm font-black italic text-cyan-400 uppercase">Para onde vamos?</h2>
              <div className="grid grid-cols-1 gap-4">
                 <button 
                   onClick={() => onStartNav('STREETS')}
                   className="group p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-cyan-500 transition-all"
                 >
                    <Home size={32} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Navegar Ruas</span>
                 </button>
                 <button 
                   // Aligning 'WATER' navigation with 'TACTICAL' style
                   onClick={() => onStartNav('TACTICAL')}
                   className="group p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-blue-500 transition-all"
                 >
                    <Waves size={32} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Navegar Mar, Lago, Represa</span>
                 </button>
              </div>
           </div>
        )}

        {activeTab === 'missao' && (
          <div className="space-y-4">
             {sessionStatus === 'IDLE' ? (
                <div className="p-8 text-center opacity-40">
                   <Compass size={48} className="mx-auto mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Aguardando definição de rota no mapa...</p>
                </div>
             ) : (
                <div className="space-y-4">
                   <div className="p-6 rounded-[2.5rem] bg-slate-900 border border-white/10 text-center">
                      <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-2">Velocidade</p>
                      <h3 className="text-5xl font-black italic logo-font text-white">{telemetry.speed.toFixed(1)}</h3>
                      <p className="text-[8px] font-bold text-white/30 uppercase mt-2">KM/H</p>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-5 rounded-[2rem] bg-slate-900 border border-white/5 flex flex-col items-center">
                         <Timer size={18} className="text-purple-400 mb-2" />
                         <p className="text-[20px] font-black italic logo-font">{Math.floor((telemetry.time || 0) / 60000)}m</p>
                      </div>
                      <div className="p-5 rounded-[2rem] bg-slate-900 border border-white/5 flex flex-col items-center">
                         <Navigation size={18} className="text-emerald-400 mb-2" />
                         <p className="text-[20px] font-black italic logo-font">{telemetry.distance.toFixed(1)}k</p>
                      </div>
                   </div>
                </div>
             )}
          </div>
        )}

        {/* OUTRAS ABAS MANTIDAS PARA FUNCIONALIDADE */}
        {activeTab === 'lab' && <div className="p-10 text-center text-[10px] opacity-20 uppercase font-black">Performance Lab Desativado</div>}
      </div>

      {/* RODAPÉ DE MISSÃO */}
      <div className="p-6 border-t border-white/5 bg-slate-950">
        <button 
          onClick={onToggleTimer}
          className={`w-full py-6 rounded-[2rem] font-black uppercase text-sm flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl border-b-4 ${sessionStatus === 'ACTIVE' ? 'bg-slate-800 border-slate-950 text-white' : 'bg-cyan-500 border-cyan-700 text-white'}`}
        >
          {sessionStatus === 'ACTIVE' ? <Pause size={20} /> : <Play size={20} fill="white" />}
          <span>{sessionStatus === 'IDLE' ? 'INICIAR JORNADA' : (sessionStatus === 'ACTIVE' ? 'PAUSAR' : 'RETOMAR')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
