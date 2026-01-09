
import React, { useState } from 'react';
import { UserProfile, WeatherData, Telemetry, NewsItem, CanoeLocation, TrainingMode, Environment, MapStyle, Language, IntensityZone, SafetyAnalysis } from '../types';
import { 
  Activity, MapPin, AlertOctagon, Flame, Timer, Target, Medal, Globe, Users, Sliders, ShieldCheck, Crown, Zap, Music, Search, X, ShoppingBag, Home, Mic, MicOff, UserMinus, Sparkles, Square, Play, Pause, Ruler, ChevronRight, Waves, Heart
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { VaaDictionary } from './VaaDictionary';
import { ProfessionalSearch } from './ProfessionalSearch';
import { IntensitySettings } from './IntensitySettings';
import { ShopDisplay } from './ShopDisplay';
import { AITechnique } from './AITechnique';
import { Metronome } from './Metronome';
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
  onReturnHome?: () => void;
  isVoiceActive?: boolean;
  setIsVoiceActive?: (active: boolean) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  userProfile, setUserProfile, onToggleTimer, onStopTimer, sessionStatus, isTimerRunning, telemetry, weather, userLocation, analysis,
  news, locations, onSOS, isSOSActive, trainingMode, setTrainingMode, environment, setEnvironment,
  targetDistance, setTargetDistance, mapStyle, setMapStyle, language, setLanguage,
  intensityZones, setIntensityZones, activeZoneId, setActiveZoneId, onReturnHome,
  isVoiceActive, setIsVoiceActive, onClose
}) => {
  const [activeTab, setActiveTab] = useState<'treino' | 'radar' | 'shop' | 'team' | 'zones' | 'lab'>('treino');
  const [isPro, setIsPro] = useState(false); 
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const t = translations[language];

  const progress = Math.min(100, (telemetry.distance * 1000 / targetDistance) * 100);

  return (
    <div className={`relative w-full h-full flex flex-col border-r border-white/5 transition-all duration-500 shadow-[20px_0_50px_rgba(0,0,0,0.5)] ${userProfile.sunlightMode ? 'bg-white' : 'bg-slate-950 text-white'}`}>
      
      {/* HEADER UTILITÁRIO */}
      <div className="px-6 py-3 flex items-center justify-between border-b bg-slate-900 border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPlanDetails(!showPlanDetails)} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-95 ${isPro ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-slate-800 border-white/10'}`}
            >
              {isPro ? <Crown size={12} className="text-yellow-500" /> : <ShieldCheck size={12} className="text-slate-500" />}
              <span className={`text-[9px] font-black uppercase tracking-widest ${isPro ? 'text-yellow-500' : 'text-slate-400'}`}>
                {isPro ? t.pro_plan : t.free_plan}
              </span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-[10px] font-black text-white/40 uppercase hover:text-white transition-all">{language}</button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"><X size={18} /></button>
          </div>
      </div>

      {/* BRAND & SOS */}
      <div className="px-6 py-6 border-b flex items-center justify-between bg-slate-900/20 shrink-0">
         <BrandLogo size="md" />
         <button onClick={onSOS} className={`w-12 h-12 rounded-2xl border transition-all flex items-center justify-center shadow-lg active:scale-90 ${isSOSActive ? 'bg-red-600 border-red-500 animate-pulse text-white' : 'bg-red-950/30 border-red-500/30 text-red-500'}`}><AlertOctagon size={22} /></button>
      </div>

      {/* NAVEGAÇÃO DE ABAS */}
      <div className="grid grid-cols-6 p-2 gap-1.5 border-b bg-slate-950 sticky top-0 z-20 shrink-0">
        {[
          {id: 'treino', icon: <Activity size={16}/>, label: 'MISS.'}, 
          {id: 'radar', icon: <MapPin size={16}/>, label: 'RADAR'}, 
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

      {/* CONTEÚDO SCROLLÁVEL */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-950/20">
        {activeTab === 'treino' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* SELETOR DE MODO DE MISSÃO MELHORADO */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setTrainingMode('WATER')}
                  className={`flex-1 py-3 rounded-2xl border text-[8px] font-black uppercase flex flex-col items-center gap-2 transition-all shadow-lg ${trainingMode === 'WATER' ? 'bg-cyan-600 border-cyan-400 text-white shadow-cyan-500/20' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-cyan-500/30'}`}
                >
                  <Waves size={14} /> WATER PRO
                </button>
                <button 
                  onClick={() => setTrainingMode('DRAGON_BOAT')}
                  className={`flex-1 py-3 rounded-2xl border text-[8px] font-black uppercase flex flex-col items-center gap-2 transition-all shadow-lg ${trainingMode === 'DRAGON_BOAT' ? 'bg-pink-600 border-pink-400 text-white shadow-pink-500/30' : 'bg-pink-900/10 border-pink-500/20 text-pink-500/40 hover:border-pink-500/40'}`}
                >
                  <Heart size={14} fill={trainingMode === 'DRAGON_BOAT' ? 'white' : 'none'} /> DRAGON PINK
                </button>
              </div>

              {/* TARGET DISTANCE */}
              <div className={`p-5 rounded-[2.5rem] border relative overflow-hidden transition-all ${trainingMode === 'DRAGON_BOAT' ? 'bg-pink-900/20 border-pink-500/30' : 'bg-slate-900/60 border-white/5'}`}>
                 <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                       <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${trainingMode === 'DRAGON_BOAT' ? 'text-pink-400' : 'text-cyan-400'}`}>Objetivo</p>
                       <h3 className="text-2xl font-black italic logo-font text-white">{targetDistance}<span className="text-[10px] ml-1 uppercase">Metros</span></h3>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black text-white/40 uppercase mb-1">Status</p>
                       <p className={`text-lg font-black italic ${trainingMode === 'DRAGON_BOAT' ? 'text-pink-400' : 'text-cyan-400'}`}>{(telemetry.distance * 1000).toFixed(0)}m</p>
                    </div>
                 </div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                    <div className={`h-full transition-all duration-500 ${trainingMode === 'DRAGON_BOAT' ? 'bg-pink-500 shadow-[0_0_10px_#ec4899]' : 'bg-cyan-500 shadow-[0_0_10px_#22d3ee]'}`} style={{ width: `${progress}%` }} />
                 </div>
              </div>

              {/* COCKPIT */}
              <div className="grid grid-cols-2 gap-3">
                 <div className={`col-span-2 p-6 rounded-[2.5rem] bg-slate-900/40 border flex flex-col items-center justify-center transition-all ${trainingMode === 'DRAGON_BOAT' ? 'border-pink-500/30' : (telemetry.speed > 14 ? 'border-yellow-500' : 'border-white/5')}`}>
                    <div className="flex items-center gap-2 mb-1">
                       <Zap size={14} className={trainingMode === 'DRAGON_BOAT' ? 'text-pink-400' : (telemetry.speed > 14 ? 'text-yellow-500 animate-pulse' : 'text-cyan-400')} />
                       <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Velocidade Atual</p>
                    </div>
                    <p className="text-6xl font-black italic logo-font text-white leading-none">{telemetry.speed.toFixed(1)}</p>
                    <p className={`text-[10px] font-black mt-2 tracking-[0.4em] ${trainingMode === 'DRAGON_BOAT' ? 'text-pink-400' : 'text-cyan-400'}`}>KM/H</p>
                 </div>
                 <div className="p-5 rounded-[2.5rem] bg-slate-900/40 border border-white/5 flex flex-col items-center">
                    <Activity size={18} className="text-emerald-400 mb-2" />
                    <p className="text-[8px] font-black text-white/40 uppercase mb-1">Golpes</p>
                    <p className="text-2xl font-black italic logo-font text-white">{telemetry.totalStrokes}</p>
                 </div>
                 <div className="p-5 rounded-[2.5rem] bg-slate-900/40 border border-white/5 flex flex-col items-center">
                    <Timer size={18} className="text-purple-400 mb-2" />
                    <p className="text-[8px] font-black text-white/40 uppercase mb-1">Cadência</p>
                    <p className="text-2xl font-black italic logo-font text-white">{telemetry.spm}<span className="text-[10px] ml-1">SPM</span></p>
                 </div>
              </div>
           </div>
        )}

        {/* OUTRAS ABAS */}
        {activeTab === 'lab' && <div className="space-y-6 animate-in fade-in duration-300"><AITechnique /><VaaDictionary /></div>}
        {activeTab === 'zones' && <IntensitySettings zones={intensityZones} onUpdateZones={setIntensityZones} activeZoneId={activeZoneId} onSelectZone={setActiveZoneId} />}
        {activeTab === 'team' && <ProfessionalSearch userLocation={userLocation} />}
        {activeTab === 'shop' && <ShopDisplay role={userProfile.role} products={[]} onProductClick={() => {}} onLeadAction={() => {}} analytics={{ balance: 0, totalClicks: 0, totalLeads: 0 }} onRecharge={() => {}} />}
      </div>

      {/* CONTROLE DE MISSÃO */}
      <div className="p-6 border-t border-white/5 bg-slate-950 shrink-0">
        <button 
          onClick={onToggleTimer} 
          className={`w-full py-6 rounded-3xl font-black uppercase text-xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl border-b-4 ${trainingMode === 'DRAGON_BOAT' ? 'bg-pink-600 border-pink-800' : 'bg-cyan-500 border-cyan-700'} text-white`}
        >
          {sessionStatus === 'IDLE' ? <Play size={24} fill="white" /> : (isTimerRunning ? <Pause size={24} /> : <Play size={24} fill="white" />)}
          <span>{sessionStatus === 'IDLE' ? t.start_mission : (isTimerRunning ? 'PAUSAR' : 'RETOMAR')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
