
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Bell, Zap, Activity, Navigation, Flame, Timer, Trophy, Play, Pause, Square, Medal, Target, Waves, AlertTriangle, Anchor, Fish, Signal, SignalLow, Globe, WifiOff, Home, Navigation2, Mic, MicOff, UserMinus, Sun, Moon, LocateFixed, Search, MapPin, Loader2, Compass, LayoutDashboard, Settings, Map as MapIcon, Layers, ChevronRight, Info } from 'lucide-react';
import { getSafetyUpdate } from './services/geminiService';
import { searchAddress, LocationResult } from './services/navigationService';
import { Telemetry, SafetyAnalysis, UserProfile, TrainingMode, Environment, MapStyle, Language, IntensityZone } from './types';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import { TrainingSummary } from './components/TrainingSummary';
import { LoginScreen } from './components/LoginScreen';

type SessionStatus = 'IDLE' | 'ACTIVE' | 'PAUSED';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [showSummary, setShowSummary] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [mapStyle, setMapStyle] = useState<MapStyle>('TACTICAL');
  const [followMode, setFollowMode] = useState(true);
  const [safetyData, setSafetyData] = useState<SafetyAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [targetLocation, setTargetLocation] = useState<LocationResult | null>(null);
  const [tempTarget, setTempTarget] = useState<LocationResult | null>(null);
  const [arrived, setArrived] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Paddler',
    role: 'PADDLER',
    sunlightMode: false,
    tsunamiAlertEnabled: true
  });
  
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry>({ 
    speed: 0, distance: 0, spm: 62, dps: 2.4, heading: 0, calories: 0, totalStrokes: 0, 
    gpsAccuracy: 0, isEstimated: false, isNavigatingHome: false, isGhostActive: false, mobLocation: null 
  });

  const physicsInterval = useRef<number | null>(null);
  const watchId = useRef<number | null>(null);

  // Monitoramento de Chegada
  useEffect(() => {
    if (status === 'ACTIVE' && userLocation && targetLocation && !arrived) {
      const R = 6371e3; 
      const φ1 = userLocation.lat * Math.PI / 180;
      const φ2 = targetLocation.lat * Math.PI / 180;
      const Δφ = (targetLocation.lat - userLocation.lat) * Math.PI / 180;
      const Δλ = (targetLocation.lng - userLocation.lng) * Math.PI / 180;
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const dist = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));

      if (dist < 50) { // Chegou a 50 metros
        setArrived(true);
        setStatus('IDLE');
        setShowSummary(true);
      }
    }
  }, [userLocation, status, targetLocation, arrived]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        (p) => {
          setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
          setTelemetry(prev => ({ ...prev, speed: (p.coords.speed || 0) * 3.6 }));
          if (p.coords.latitude && !safetyData) getSafetyUpdate(p.coords.latitude, p.coords.longitude).then(setSafetyData);
        },
        null, { enableHighAccuracy: true }
      );
    }
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const result = await searchAddress(searchQuery);
    if (result) {
      setTempTarget(result);
      setFollowMode(false);
    }
    setIsSearching(false);
  };

  const initiateMission = () => {
    setShowBriefing(true);
    setTargetLocation(tempTarget);
    setTempTarget(null);
  };

  const startTraining = () => {
    setShowBriefing(false);
    setStatus('ACTIVE');
    setFollowMode(true);
    setArrived(false);
    setTelemetry(prev => ({ ...prev, distance: 0, time: 0, totalStrokes: 0, calories: 0 }));
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  if (!isAuthenticated) return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;

  return (
    <div className={`relative h-screen w-screen flex flex-col md:flex-row bg-slate-950`}>
      
      {/* MAPA E HUD */}
      <div className="flex-1 relative h-full w-full overflow-hidden">
        <MapComponent 
          userLocation={userLocation} mapStyle={mapStyle} speed={telemetry.speed}
          followMode={followMode} targetLocation={targetLocation || tempTarget} waypoints={[]} onAddWaypoint={() => {}}
        />

        {/* BRIEFING MODAL */}
        {showBriefing && safetyData && (
          <div className="absolute inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/30 rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/20"><Info className="text-white" /></div>
                  <h3 className="logo-font text-lg font-black italic text-white uppercase">Missão: {targetLocation?.name}</h3>
               </div>
               
               <div className="space-y-4 mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl">
                     <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Análise de Segurança</p>
                     <p className="text-xs text-white/70 leading-relaxed font-medium uppercase">{safetyData.recommendations}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[8px] font-black text-white/30 uppercase">Swell / Ondas</p>
                        <p className="text-xs font-black text-white">0.8m - SE</p>
                     </div>
                     <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[8px] font-black text-white/30 uppercase">Vento</p>
                        <p className="text-xs font-black text-white">12kt - E</p>
                     </div>
                  </div>
               </div>

               <button 
                onClick={startTraining}
                className="w-full py-5 bg-cyan-500 rounded-[2rem] text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 active:scale-95"
               >
                 VAMOS REMAR!
               </button>
            </div>
          </div>
        )}

        {/* HUD DE VELOCIDADE */}
        {status === 'ACTIVE' && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[40] pointer-events-none">
             <div className="px-10 py-6 rounded-[3rem] bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col items-center">
                <p className="hud-font text-6xl italic font-black text-white">{telemetry.speed.toFixed(1)}</p>
                <p className="hud-font text-cyan-400 text-[10px] tracking-[0.6em] font-black uppercase mt-1">KM/H</p>
             </div>
          </div>
        )}

        {/* BUSCA DE ENDEREÇO / LOCAL */}
        <div className="absolute top-10 inset-x-4 z-[100] md:max-w-md md:left-10 pointer-events-none">
          <form onSubmit={handleSearch} className="pointer-events-auto">
             <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                  {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={20} />}
                </div>
                <input 
                  type="text"
                  placeholder="DIGITE O DESTINO..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-5 pl-12 pr-6 rounded-[2rem] text-[10px] font-black bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white focus:border-cyan-500 transition-all uppercase"
                />
             </div>
          </form>

          {tempTarget && (
             <div className="mt-4 p-6 bg-slate-900 border border-cyan-500/50 rounded-[2.5rem] shadow-2xl pointer-events-auto animate-in slide-in-from-top-4">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400"><MapPin /></div>
                   <h4 className="text-xs font-black text-white uppercase">{tempTarget.name}</h4>
                </div>
                <button 
                  onClick={initiateMission}
                  className="w-full py-4 bg-cyan-500 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
                >
                   DEFINIR COMO DESTINO
                </button>
             </div>
          )}
        </div>
      </div>

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-[200] w-full md:relative md:w-[420px] transform transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}`}>
        <Sidebar 
          userProfile={userProfile} sessionStatus={status} 
          onToggleTimer={() => status === 'ACTIVE' ? setStatus('PAUSED') : startTraining()}
          onStopTimer={() => setShowSummary(true)}
          telemetry={telemetry} analysis={safetyData} userLocation={userLocation}
          onStartNav={(type) => setMapStyle(type)}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {showSummary && (
        <TrainingSummary 
          telemetry={telemetry} mode="WATER" env="SEA" target={1000} eliteTime={300} arrivedAtDestination={arrived} destinationName={targetLocation?.name}
          onClose={() => setShowSummary(false)} onShareChat={() => {}}
        />
      )}
    </div>
  );
};

export default App;
