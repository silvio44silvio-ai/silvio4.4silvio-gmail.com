
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Bell, Zap, Activity, Navigation, Flame, Timer, Trophy, Play, Pause, Square, Medal, Target, Waves, AlertTriangle, Anchor, Fish, Signal, SignalLow, Globe, WifiOff, Home, Navigation2, Mic, MicOff, UserMinus, Sun, Moon, LocateFixed, Search, MapPin, Loader2, Compass, LayoutDashboard, Settings, Map as MapIcon, Layers, ChevronRight, Send } from 'lucide-react';
import { getSafetyUpdate } from './services/geminiService';
import { searchAddress, LocationResult } from './services/navigationService';
import { Telemetry, SafetyAnalysis, UserProfile, TrainingMode, Environment, MapStyle, Language, IntensityZone } from './types';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import { TrainingSummary } from './components/TrainingSummary';
import { LoginScreen } from './components/LoginScreen';

type SessionStatus = 'IDLE' | 'ACTIVE' | 'PAUSED';

const DEFAULT_ZONES: IntensityZone[] = [
  { id: 1, label: 'Z1 - Recuperação', speedKmh: 8.0, spm: 52, color: 'text-emerald-400' },
  { id: 2, label: 'Z2 - Aeróbico', speedKmh: 10.5, spm: 58, color: 'text-cyan-400' },
  { id: 3, label: 'Z3 - Tempo', speedKmh: 12.0, spm: 64, color: 'text-blue-400' },
  { id: 4, label: 'Z4 - Sub-Máximo', speedKmh: 14.0, spm: 72, color: 'text-yellow-400' },
  { id: 5, label: 'Z5 - VO2 Max', speedKmh: 16.5, spm: 80, color: 'text-orange-400' },
  { id: 6, label: 'Z6 - Anaeróbico', speedKmh: 19.0, spm: 90, color: 'text-red-400' },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [showSummary, setShowSummary] = useState(false);
  const [trainingMode, setTrainingMode] = useState<TrainingMode>('WATER');
  const [environment, setEnvironment] = useState<Environment>('SEA');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [mapStyle, setMapStyle] = useState<MapStyle>('TACTICAL');
  const [language, setLanguage] = useState<Language>('pt');
  const [intensityZones, setIntensityZones] = useState<IntensityZone[]>(DEFAULT_ZONES);
  const [activeZoneId, setActiveZoneId] = useState<number>(2);
  const [followMode, setFollowMode] = useState(true);
  const [safetyData, setSafetyData] = useState<SafetyAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [targetLocation, setTargetLocation] = useState<LocationResult | null>(null);
  const [tempTarget, setTempTarget] = useState<LocationResult | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Paddler',
    role: 'PADDLER',
    sunlightMode: false,
    tsunamiAlertEnabled: true
  });
  
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry>({ 
    speed: 0, distance: 0, spm: 0, dps: 0, heading: 0, calories: 0, totalStrokes: 0, 
    gpsAccuracy: 0, isEstimated: false, isNavigatingHome: false, isGhostActive: false, mobLocation: null 
  });

  const physicsInterval = useRef<number | null>(null);
  const watchId = useRef<number | null>(null);
  const hasCenteredInitially = useRef(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading, speed, accuracy } = position.coords;
          const newPos = { lat: latitude, lng: longitude };
          
          setUserLocation(newPos);
          setTelemetry(prev => ({
            ...prev,
            speed: (speed || 0) * 3.6,
            heading: heading || prev.heading,
            gpsAccuracy: accuracy
          }));

          if (!hasCenteredInitially.current && latitude && longitude) {
            setFollowMode(true);
            hasCenteredInitially.current = true;
          }

          if (latitude && longitude && !safetyData) {
            getSafetyUpdate(latitude, longitude).then(setSafetyData);
          }
        },
        (error) => console.error("Erro GPS:", error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setFollowMode(false);
    const result = await searchAddress(searchQuery);
    if (result) {
      setTempTarget(result);
    } else {
      alert("Local não encontrado. Tente um endereço mais específico.");
    }
    setIsSearching(false);
  };

  const startNavigation = () => {
    if (tempTarget) {
      setTargetLocation(tempTarget);
      setFollowMode(true);
      setTempTarget(null);
      // Se não estiver em treino, perguntar se quer iniciar
      if (status === 'IDLE') {
        if (confirm("Deseja iniciar o rastreamento do treino para este destino?")) {
          startSession();
        }
      }
    }
  };

  const startSession = () => {
    setStatus('ACTIVE');
    setFollowMode(true);
    setTelemetry(prev => ({ ...prev, speed: 0, distance: 0, calories: 0, totalStrokes: 0, time: 0 }));
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const stopSession = () => {
    if (confirm("Deseja realmente encerrar este treino?")) {
      setStatus('IDLE');
      setShowSummary(true);
      setTargetLocation(null);
    }
  };

  const cycleMapStyle = () => {
    const styles: MapStyle[] = ['TACTICAL', 'STREETS', 'HYBRID'];
    const nextIndex = (styles.indexOf(mapStyle) + 1) % styles.length;
    setMapStyle(styles[nextIndex]);
  };

  useEffect(() => {
    if (status === 'ACTIVE') {
      physicsInterval.current = window.setInterval(() => {
        setTelemetry(prev => ({ ...prev, time: (prev.time || 0) + 1000 }));
      }, 1000);
    } else if (physicsInterval.current) {
      clearInterval(physicsInterval.current);
    }
    return () => { if (physicsInterval.current) clearInterval(physicsInterval.current); };
  }, [status]);

  if (!isAuthenticated) return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;

  return (
    <div className={`relative h-screen w-screen flex flex-col md:flex-row ${userProfile.sunlightMode ? 'sunlight-mode-active' : 'bg-black'}`}>
      
      {/* HUD SUPERIOR DE BUSCA - ENFATIZADO NO MODO STREETS */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col gap-4 px-4 pt-12 md:pt-6 pointer-events-none">
         <div className="flex justify-between items-center w-full gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-12 h-12 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-center shadow-2xl pointer-events-auto md:hidden"
            >
              <LayoutDashboard size={24} />
            </button>

            <form onSubmit={handleSearch} className="flex-1 max-w-lg pointer-events-auto group">
               <div className={`relative transition-all duration-500 ${mapStyle === 'STREETS' ? 'scale-105 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : ''}`}>
                  <button 
                    type="submit"
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${mapStyle === 'STREETS' ? 'text-cyan-400' : 'text-slate-400'}`}
                  >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={20} strokeWidth={3} />}
                  </button>
                  <input 
                    type="text"
                    placeholder={mapStyle === 'STREETS' ? "PESQUISAR ENDEREÇO OU RUA..." : "BUSCAR NO RADAR..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full py-4 pl-12 pr-6 rounded-2xl text-[10px] font-black uppercase border backdrop-blur-md transition-all ${
                      mapStyle === 'STREETS' 
                        ? 'bg-slate-900 border-cyan-500/50 text-white placeholder:text-cyan-400/40' 
                        : 'bg-slate-900/90 border-white/10 text-white'
                    } focus:border-cyan-500 focus:outline-none`}
                  />
               </div>
            </form>

            <div className="flex gap-2 pointer-events-auto">
              <button 
                onClick={cycleMapStyle}
                className={`w-12 h-12 rounded-2xl bg-slate-900/90 backdrop-blur-md border flex flex-col items-center justify-center shadow-2xl transition-all ${mapStyle === 'STREETS' ? 'border-cyan-500 text-cyan-400' : 'border-white/10 text-white'}`}
              >
                <Layers size={18} />
                <span className="text-[6px] font-black uppercase mt-0.5">{mapStyle.slice(0,3)}</span>
              </button>
            </div>
         </div>

         {/* CARD DE RESULTADO DA BUSCA (ESPECÍFICO PARA INICIAR NAVEGAÇÃO) */}
         {tempTarget && (
           <div className="mx-auto w-full max-w-sm pointer-events-auto animate-in slide-in-from-top-4 duration-500">
              <div className="bg-slate-900 border border-cyan-500/50 rounded-[2rem] p-5 shadow-2xl flex flex-col gap-4">
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 shrink-0">
                       <MapPin size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-1">Local Encontrado</p>
                       <h4 className="text-xs font-black text-white uppercase truncate">{tempTarget.name}</h4>
                    </div>
                    <button onClick={() => setTempTarget(null)} className="text-slate-500 hover:text-white p-1"><X size={18} /></button>
                 </div>
                 <button 
                    onClick={startNavigation}
                    className="w-full py-4 bg-cyan-500 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all"
                 >
                    <Navigation2 size={16} fill="white" />
                    INICIAR NAVEGAÇÃO
                 </button>
              </div>
           </div>
         )}
      </div>

      {/* ÁREA DO MAPA */}
      <div className="flex-1 relative h-full w-full overflow-hidden" onMouseDown={() => setFollowMode(false)}>
        <MapComponent 
          userLocation={userLocation} originLocation={null}
          heading={telemetry.heading} sunlightMode={userProfile.sunlightMode} mapStyle={mapStyle} speed={telemetry.speed}
          followMode={followMode} targetLocation={targetLocation || tempTarget} waypoints={[]} onAddWaypoint={() => {}}
        />

        {!userLocation && (
          <div className="absolute inset-0 z-[150] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center">
             <Loader2 size={48} className="text-cyan-400 animate-spin mb-6" />
             <h3 className="text-xl font-black italic logo-font text-white uppercase mb-2 tracking-tighter">Sincronizando Satélites</h3>
             <p className="text-xs font-bold text-cyan-400/60 uppercase tracking-widest max-w-xs leading-relaxed">
               Buscando sinal GPS para navegação tática...
             </p>
          </div>
        )}

        {(status !== 'IDLE') && (
          <div className="absolute inset-x-0 top-32 z-[40] pointer-events-none flex flex-col items-center animate-in slide-in-from-top-4">
             <div className="px-10 py-6 rounded-[3rem] backdrop-blur-md border bg-slate-950/80 border-white/10 shadow-2xl flex flex-col items-center">
                <p className="hud-font text-7xl italic leading-none font-black text-white">{telemetry.speed.toFixed(1)}</p>
                <p className="hud-font text-cyan-500 text-center text-[10px] tracking-[0.6em] font-black mt-1 uppercase">KM/H</p>
             </div>
          </div>
        )}

        {/* CONTROLES PRINCIPAIS */}
        <div className="absolute bottom-32 left-0 right-0 z-[110] flex flex-col items-center px-6 gap-4">
           {status !== 'IDLE' && (
             <button 
                onClick={stopSession}
                className="w-full max-w-xs py-6 bg-red-600 border-b-8 border-red-800 rounded-[2.5rem] flex items-center justify-center gap-4 text-white font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(220,38,38,0.4)] active:translate-y-1 active:border-b-4 transition-all"
             >
                <Square size={24} fill="white" />
                <span>Encerrar Missão</span>
             </button>
           )}

           {!followMode && (
              <button 
                onClick={() => setFollowMode(true)}
                className="px-8 py-3 bg-cyan-500 rounded-full text-white text-[10px] font-black uppercase tracking-widest animate-bounce shadow-xl"
              >
                Recentralizar
              </button>
           )}
        </div>

        {/* DOCK INFERIOR MOBILE */}
        <div className="md:hidden fixed bottom-8 left-4 right-4 z-[100] grid grid-cols-4 gap-2 px-4 py-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           <button onClick={() => setIsSidebarOpen(true)} className="flex flex-col items-center gap-1 text-slate-400">
             <LayoutDashboard size={20} />
             <span className="text-[7px] font-black uppercase">Menu</span>
           </button>
           <button onClick={cycleMapStyle} className={`flex flex-col items-center gap-1 ${mapStyle === 'STREETS' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
             <MapIcon size={20} />
             <span className="text-[7px] font-black uppercase">Mapa</span>
           </button>
           <button onClick={() => setFollowMode(true)} className={`flex flex-col items-center gap-1 ${followMode ? 'text-cyan-400' : 'text-slate-400'}`}>
             <LocateFixed size={20} />
             <span className="text-[7px] font-black uppercase">GPS</span>
           </button>
           <button onClick={status === 'IDLE' ? startSession : () => setStatus(prev => prev === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')} className={`flex flex-col items-center gap-1 ${status === 'ACTIVE' ? 'text-yellow-400' : 'text-emerald-400'}`}>
             {status === 'ACTIVE' ? <Pause size={20} /> : <Play size={20} />}
             <span className="text-[7px] font-black uppercase">{status === 'IDLE' ? 'Treinar' : (status === 'ACTIVE' ? 'Pausar' : 'Voltar')}</span>
           </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-[200] w-full md:relative md:w-[420px] transform transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}`}>
        <Sidebar 
          userProfile={userProfile} setUserProfile={setUserProfile} 
          sessionStatus={status} isTimerRunning={status === 'ACTIVE'} 
          onToggleTimer={status === 'ACTIVE' ? () => setStatus('PAUSED') : startSession}
          onStopTimer={stopSession}
          telemetry={telemetry} analysis={safetyData} userLocation={userLocation}
          trainingMode={trainingMode} setTrainingMode={setTrainingMode}
          environment={environment} setEnvironment={setEnvironment}
          mapStyle={mapStyle} setMapStyle={setMapStyle}
          onClose={() => setIsSidebarOpen(false)}
          weather={null} news={[]} locations={[]} onSOS={() => {}} isSOSActive={false}
          targetDistance={1000} setTargetDistance={() => {}} language={language} setLanguage={setLanguage}
          intensityZones={intensityZones} setIntensityZones={setIntensityZones}
          activeZoneId={activeZoneId} setActiveZoneId={setActiveZoneId}
        />
      </div>

      {showSummary && (
        <TrainingSummary 
          telemetry={telemetry} mode={trainingMode} env={environment} target={1000} eliteTime={240}
          onClose={() => setShowSummary(false)} onShareChat={() => {}}
        />
      )}
    </div>
  );
};

export default App;
