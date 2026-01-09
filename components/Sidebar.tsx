
import React, { useState } from 'react';
import { UserProfile, WeatherData, Telemetry, NewsItem, CanoeLocation, TrainingMode, Environment, MapStyle, Language, IntensityZone, SafetyAnalysis } from '../types';
import { 
  Activity, MapPin, AlertOctagon, Flame, Timer, Target, Medal, Globe, Users, Sliders, ShieldCheck, Crown, Zap, Music, Search, X, ShoppingBag, Home, Mic, MicOff, UserMinus, Sparkles, Square, Play, Pause, Ruler, ChevronRight, Waves, Heart, Layers, Map as MapIcon, Navigation
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { VaaDictionary } from './VaaDictionary';
import { ProfessionalSearch } from './ProfessionalSearch';
import { IntensitySettings } from './IntensitySettings';
import { ShopDisplay } from './ShopDisplay';
import { AITechnique } from './AITechnique';
import { translations } from '../services/translations';

interface SidebarProps {
  analysis: SafetyAnalysis | null;
  userLocation: { lat: number; lng: number } | null;
  weather: WeatherData | null;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  sessionStatus: 'IDLE' | 'ACTIVE' | 'PAUSED';
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onStopTimer: () => void;
  telemetry: Telemetry;
  news: NewsItem[];
  locations: CanoeLocation[];
  onSOS: () => void;
  isSOSActive: boolean;
  trainingMode: TrainingMode;
  setTrainingMode: (mode: TrainingMode) => void;
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  targetDistance: number;
  setTargetDistance: (dist: number) => void;
  mapStyle: MapStyle;
  setMapStyle: (style: MapStyle) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  intensityZones: IntensityZone[];
  setIntensityZones: (zones: IntensityZone[]) => void;
  activeZoneId: number;
  setActiveZoneId: (id: number) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  userProfile, setUserProfile, onToggleTimer, onStopTimer, sessionStatus, isTimerRunning, telemetry, weather, userLocation, analysis,
  news, locations, onSOS, isSOSActive, trainingMode, setTrainingMode, environment, setEnvironment,
  targetDistance, setTargetDistance, mapStyle, setMapStyle, language, setLanguage,
  intensityZones, setIntensityZones, activeZoneId, setActiveZoneId, onClose
}) => {
  const [activeTab, setActiveTab] = useState<'treino' | 'radar' | 'shop' | 'team' | 'zones' | 'lab'>('treino');
  const t = translations[language];

  const progress = Math.min(100, (telemetry.distance * 1000 / targetDistance) * 100);

  return (
    <div className={`relative w-full h-full flex flex-col border-r border-white/5 transition-all duration-500 shadow-[20px_0_50px_rgba(0,0,0,0.5)] ${userProfile.sunlightMode ? 'bg-white' : 'bg-slate-950 text-white'}`}>
      
      {/* HEADER */}
      <div className="px-6 py-3 flex items-center justify-between border-b bg-slate-900 border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all bg-slate-800 border-white/10`}>
              <ShieldCheck size={12} className="text-cyan-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">STATUS: ONLINE</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"><X size={18} /></button>
          </div>
      </div>

      <div className="px-6 py-6 border-b flex items-center justify-between bg-slate-900/20 shrink-0">
         <BrandLogo size="md" />
         <button onClick={onSOS} className={`w-12 h-12 rounded-2xl border transition-all flex items-center justify-center shadow-lg active:scale-90 ${isSOSActive ? 'bg-red-600 border-red-500 animate-pulse text-white' : 'bg-red-950/30 border-red-500/30 text-red-500'}`}><AlertOctagon size={22} /></button>
      </div>

      {/* ABAS */}
      <div className="grid grid-cols-6 p-2 gap-1.5 border-b bg-slate-950 sticky top-0 z-20 shrink-0">
        {[
          {id: 'treino', icon: <Activity size={16}/>, label: 'MISS.'}, 
          {id: 'radar', icon: <MapIcon size={16}/>, label: 'MAPA'}, 
          {id: 'shop', icon: <ShoppingBag size={16}/>, label: 'SHOP'}, 
          {id: 'team', icon: <Users size={16}/>, label: 'PROS'}, 
          {id: 'zones', icon: <Sliders size={16}/>, label: 'ZONES'}, 
          {id: 'lab', icon: <Medal size={16}/>, label: 'LAB'}
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`py-3 rounded-xl text-[6px] font-black uppercase flex flex-col items-center gap-1.5 transition-all active:scale-95 ${activeTab === tab.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-950/20">
        {activeTab === 'treino' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-5 rounded-[2.5rem] bg-slate-900/40 border border-white/5 flex flex-col items-center">
                    <Timer size={18} className="text-purple-400 mb-2" />
                    <p className="text-[8px] font-black text-white/40 uppercase mb-1">Duração</p>
                    <p className="text-2xl font-black italic logo-font text-white">{Math.floor((telemetry.time || 0) / 60000)}m</p>
                 </div>
                 <div className="p-5 rounded-[2.5rem] bg-slate-900/40 border border-white/5 flex flex-col items-center">
                    {/* Fixed: Added Navigation to lucide-react imports */}
                    <Navigation size={18} className="text-cyan-400 mb-2" />
                    <p className="text-[8px] font-black text-white/40 uppercase mb-1">Distância</p>
                    <p className="text-2xl font-black italic logo-font text-white">{telemetry.distance.toFixed(1)}<span className="text-[10px] ml-1">km</span></p>
                 </div>
              </div>
              <div className="p-8 rounded-[3rem] bg-slate-900 border border-white/10 flex flex-col items-center">
                 <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Velocidade Atual</p>
                 <h2 className="text-7xl font-black italic logo-font text-white">{telemetry.speed.toFixed(1)}</h2>
                 <p className="text-xs font-black text-white/30 uppercase mt-2">quilômetros por hora</p>
              </div>
           </div>
        )}

        {activeTab === 'radar' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <h3 className="text-xs font-black text-white uppercase tracking-widest px-2">Configurações de Mapa</h3>
             <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'TACTICAL', label: 'Náutico / Tático', icon: <Waves size={18}/> },
                  { id: 'STREETS', label: 'Ruas / Urbano', icon: <Home size={18}/> },
                  { id: 'HYBRID', label: 'Satélite / Híbrido', icon: <Globe size={18}/> }
                ].map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => setMapStyle(s.id as MapStyle)}
                    className={`w-full p-6 rounded-[2rem] border flex items-center justify-between transition-all ${mapStyle === s.id ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-4">
                      {s.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                    </div>
                    {mapStyle === s.id && <Zap size={14} className="animate-pulse" />}
                  </button>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'lab' && <div className="space-y-6 animate-in fade-in duration-300"><AITechnique /><VaaDictionary /></div>}
        {activeTab === 'zones' && <IntensitySettings zones={intensityZones} onUpdateZones={setIntensityZones} activeZoneId={activeZoneId} onSelectZone={setActiveZoneId} />}
        {activeTab === 'team' && <ProfessionalSearch userLocation={userLocation} />}
        {activeTab === 'shop' && <ShopDisplay role={userProfile.role} products={[]} onProductClick={() => {}} onLeadAction={() => {}} analytics={{ balance: 0, totalClicks: 0, totalLeads: 0 }} onRecharge={() => {}} />}
      </div>

      {/* CONTROLES DE MISSÃO */}
      <div className="p-6 border-t border-white/5 bg-slate-950 shrink-0">
        <div className="flex gap-3">
          <button 
            onClick={onToggleTimer} 
            className={`flex-1 py-6 rounded-3xl font-black uppercase text-sm flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl border-b-4 ${isTimerRunning ? 'bg-slate-800 border-slate-900 text-white' : 'bg-cyan-500 border-cyan-700 text-white'}`}
          >
            {sessionStatus === 'IDLE' ? <Play size={20} fill="white" /> : (isTimerRunning ? <Pause size={20} /> : <Play size={20} fill="white" />)}
            <span>{sessionStatus === 'IDLE' ? 'INICIAR' : (isTimerRunning ? 'PAUSAR' : 'RETOMAR')}</span>
          </button>
          
          {(sessionStatus !== 'IDLE') && (
            <button 
              onClick={onStopTimer} 
              className="w-20 py-6 rounded-3xl bg-red-600 border-b-4 border-red-800 text-white flex items-center justify-center shadow-2xl active:scale-95"
            >
              <Square size={20} fill="white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
