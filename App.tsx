
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Bell, Zap, Activity, Navigation, Flame, Timer, Trophy, Play, Pause, Square, Medal, Target, Waves, AlertTriangle, Anchor, Fish, Signal, SignalLow, Globe, WifiOff, Home, Navigation2, Mic, MicOff, UserMinus, Sun, Moon, LocateFixed, Search, MapPin, Loader2, Compass } from 'lucide-react';
import { getSafetyUpdate } from './services/geminiService';
import { fetchRealTimeWeather } from './services/weatherService';
import { fetchCanoeNews } from './services/newsService';
import { findNearestCanoeLocations } from './services/locationService';
import { searchAddress, LocationResult } from './services/navigationService';
import { Telemetry, SafetyAnalysis, WeatherData, UserProfile, TrainingMode, Environment, MapStyle, NewsItem, CompetitionEvent, CanoeLocation, Language, IntensityZone, MarineDetection } from './types';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import { TrainingSummary } from './components/TrainingSummary';
import { LoginScreen } from './components/LoginScreen';
import { translations } from './services/translations';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyle>('TACTICAL');
  const [language, setLanguage] = useState<Language>('pt');
  const [intensityZones, setIntensityZones] = useState<IntensityZone[]>(DEFAULT_ZONES);
  const [activeZoneId, setActiveZoneId] = useState<number>(2);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [originLocation, setOriginLocation] = useState<{lat: number, lng: number} | null>(null);
  const [followMode, setFollowMode] = useState(true);
  const [safetyData, setSafetyData] = useState<SafetyAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [targetLocation, setTargetLocation] = useState<LocationResult | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Paddler',
    role: 'PADDLER',
    sunlightMode: false,
    tsunamiAlertEnabled: true
  });
  
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>({ lat: -23.5505, lng: -46.6333 });
  
  const [telemetry, setTelemetry] = useState<Telemetry>({ 
    speed: 0, distance: 0, spm: 0, dps: 0, heading: 45, calories: 0, totalStrokes: 0, 
    gpsAccuracy: 0, isEstimated: false, isNavigatingHome: false, isGhostActive: false, mobLocation: null 
  });

  const physicsInterval = useRef<number | null>(null);
  const lastStrokeTime = useRef<number>(0);
  const sessionStartTime = useRef<number>(0);
  const accumulatedTime = useRef<number>(0);

  useEffect(() => {
    const savedPhone = localStorage.getItem('bussulvaa_auth_phone');
    if (savedPhone) {
      setUserProfile(prev => ({ ...prev, phone: savedPhone }));
      setIsAuthenticated(true);
    }
    if (userLocation) {
      getSafetyUpdate(userLocation.lat, userLocation.lng).then(setSafetyData);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setFollowMode(false);
    const result = await searchAddress(searchQuery);
    if (result) {
      setTargetLocation(result);
    } else {
      alert("Destino não encontrado no radar.");
    }
    setIsSearching(false);
  };

  const startSession = () => {
    if (status === 'IDLE') {
      sessionStartTime.current = Date.now();
      accumulatedTime.current = 0;
      lastStrokeTime.current = Date.now();
      setOriginLocation(userLocation);
      setTelemetry(prev => ({ ...prev, speed: 0, distance: 0, calories: 0, totalStrokes: 0 }));
    }
    setStatus('ACTIVE');
    setFollowMode(true);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (status === 'ACTIVE') {
      physicsInterval.current = window.setInterval(() => {
        const now = Date.now();
        const activeZone = intensityZones.find(z => z.id === activeZoneId) || intensityZones[1];
        
        setTelemetry(prev => {
          let newSpeed = prev.speed;
          const strokeInterval = (60 / activeZone.spm) * 1000;
          if (now - lastStrokeTime.current > strokeInterval) {
            lastStrokeTime.current = now;
            newSpeed += (activeZone.speedKmh / 10);
          }
          newSpeed *= 0.985;

          setUserLocation(loc => {
            if (!loc) return null;
            const userRad = (prev.heading * Math.PI) / 180;
            return {
              lat: loc.lat + (Math.cos(userRad) * 0.0000004 * newSpeed),
              lng: loc.lng + (Math.sin(userRad) * 0.0000004 * newSpeed)
            };
          });

          return {
            ...prev,
            speed: newSpeed,
            distance: prev.distance + (newSpeed / 3600) * 0.05,
            calories: prev.calories + (0.15 + newSpeed * 0.02) * 0.05,
            spm: activeZone.spm,
            dps: (newSpeed / 3.6) / (activeZone.spm / 60) || prev.dps,
            totalStrokes: prev.totalStrokes + 1
          };
        });
      }, 50);
    } else if (physicsInterval.current) {
      clearInterval(physicsInterval.current);
    }
    return () => { if (physicsInterval.current) clearInterval(physicsInterval.current); };
  }, [status, activeZoneId]);

  if (!isAuthenticated) return <LoginScreen onLoginSuccess={(phone) => { localStorage.setItem('bussulvaa_auth_phone', phone); setIsAuthenticated(true); }} />;

  return (
    <div className={`relative h-screen w-screen flex flex-col md:flex-row ${userProfile.sunlightMode ? 'sunlight-mode-active' : 'bg-black'}`}>
      
      {/* HUD DE BUSCA E CONTROLES */}
      <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col gap-4 px-6 pointer-events-none">
         <div className="flex justify-between items-start w-full">
            <div className="flex gap-2 pointer-events-auto">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${userProfile.sunlightMode ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-slate-900 border-white/10 text-white'}`}
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            <div className="flex-1 max-w-lg mx-4 pointer-events-auto">
               <form onSubmit={handleSearch} className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${userProfile.sunlightMode ? 'text-slate-400' : 'text-cyan-400'}`}>
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  </div>
                  <input 
                    type="text"
                    placeholder="BUSCAR DESTINO (EX: REPRESA, MAR, ENDEREÇO...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full py-4 pl-12 pr-6 rounded-2xl text-[10px] font-black tracking-widest uppercase border shadow-2xl transition-all focus:outline-none focus:ring-4 ${userProfile.sunlightMode ? 'bg-white border-slate-200 text-black focus:ring-slate-100' : 'bg-slate-900/80 backdrop-blur-md border-white/10 text-white focus:border-cyan-500 focus:ring-cyan-500/10'}`}
                  />
                  {targetLocation && (
                    <button type="button" onClick={() => { setTargetLocation(null); setSearchQuery(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 hover:scale-110 transition-transform">
                      <X size={16} />
                    </button>
                  )}
               </form>
            </div>

            <div className="flex gap-2 pointer-events-auto">
              <button 
                onClick={() => setUserProfile({...userProfile, sunlightMode: !userProfile.sunlightMode})}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${userProfile.sunlightMode ? 'bg-yellow-500 text-white' : 'bg-slate-900 border-white/10 text-white'}`}
              >
                {userProfile.sunlightMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={() => { setFollowMode(true); setTargetLocation(null); }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${followMode ? 'bg-cyan-500 text-white' : 'bg-slate-900 border-white/10 text-white'}`}
              >
                <LocateFixed size={20} />
              </button>
            </div>
         </div>
      </div>

      {showSummary && (
        <TrainingSummary 
          telemetry={{...telemetry, time: accumulatedTime.current}}
          mode={trainingMode} env={environment} target={1000} eliteTime={240}
          onClose={() => setShowSummary(false)} onShareChat={() => {}}
        />
      )}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-[200] w-full md:relative md:w-[420px] transform transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'}`}>
        <Sidebar 
          userProfile={userProfile} setUserProfile={setUserProfile} 
          sessionStatus={status} isTimerRunning={status === 'ACTIVE'} 
          onToggleTimer={status === 'ACTIVE' ? () => setStatus('PAUSED') : startSession}
          onStopTimer={() => { setStatus('IDLE'); setShowSummary(true); }}
          telemetry={telemetry} weather={null} analysis={safetyData} userLocation={userLocation}
          news={[]} locations={[]} onSOS={() => {}} isSOSActive={false}
          trainingMode={trainingMode} setTrainingMode={setTrainingMode}
          environment={environment} setEnvironment={setEnvironment}
          targetDistance={1000} setTargetDistance={() => {}}
          mapStyle={mapStyle} setMapStyle={setMapStyle} language={language} setLanguage={setLanguage}
          intensityZones={intensityZones} setIntensityZones={setIntensityZones}
          activeZoneId={activeZoneId} setActiveZoneId={setActiveZoneId}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* MAP CONTAINER - GARANTINDO VISIBILIDADE */}
      <div 
        className="flex-1 relative h-full w-full overflow-hidden" 
        onMouseDown={() => setFollowMode(false)} 
        onTouchStart={() => setFollowMode(false)}
      >
        <MapComponent 
          userLocation={userLocation} originLocation={originLocation}
          mobLocation={telemetry.mobLocation} detections={safetyData?.marineDetections} heading={telemetry.heading} waypoints={[]} onAddWaypoint={() => {}}
          sunlightMode={userProfile.sunlightMode} mapStyle={mapStyle} speed={telemetry.speed}
          isNavigatingHome={telemetry.isNavigatingHome} followMode={followMode}
          targetLocation={targetLocation}
        />

        {/* BOTÃO RE-CENTRALIZAR ESTILO WAZE */}
        {!followMode && (
          <button 
            onClick={() => setFollowMode(true)}
            className={`absolute bottom-32 left-1/2 -translate-x-1/2 z-[40] px-8 py-4 rounded-full font-black text-[10px] tracking-widest uppercase shadow-2xl transition-all animate-in slide-in-from-bottom-4 ${userProfile.sunlightMode ? 'bg-slate-900 text-white' : 'bg-cyan-500 text-white'}`}
          >
            Recentralizar Barco
          </button>
        )}

        {/* HUD DE PERFORMANCE */}
        {(status !== 'IDLE') && (
          <div className="absolute inset-x-0 top-32 z-[40] pointer-events-none flex flex-col items-center">
             <div className={`px-10 py-6 rounded-[3rem] backdrop-blur-md border transition-all ${userProfile.sunlightMode ? 'bg-white/90 border-slate-200 shadow-xl' : 'bg-slate-950/80 border-white/10 shadow-2xl'} ${telemetry.speed > 16 ? 'border-yellow-400' : ''}`}>
                <p className={`hud-font text-7xl italic leading-none font-black ${userProfile.sunlightMode ? 'text-black' : 'text-white'}`}>{telemetry.speed.toFixed(1)}</p>
                <p className="hud-font text-cyan-400 text-center text-xs tracking-[0.6em] font-black mt-1 uppercase">KM/H</p>
             </div>
          </div>
        )}

        {/* COMPASSO TÁTICO */}
        <div className="absolute bottom-10 right-10 z-[40] w-16 h-16 pointer-events-none">
           <div className={`w-full h-full rounded-full border-2 flex items-center justify-center transition-all ${userProfile.sunlightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/20'}`} style={{ transform: `rotate(${-telemetry.heading}deg)` }}>
              <Compass size={32} className="text-cyan-400" />
              <div className="absolute top-0 text-[8px] font-black text-red-500">N</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;
