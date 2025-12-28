
import React, { useState, useEffect, useRef } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import { RouteData, UserProfile, LargeVessel, TrainingRecord, WeatherData, AnalysisResult } from './types';
import { analyzeRouteSafety } from './services/geminiService';
import { fetchRealTimeWeather } from './services/weatherService';
import { Compass, ShieldCheck, User as UserIcon, Lock, Terminal, ShieldAlert, Siren, AlertCircle } from 'lucide-react';

const MOCK_VESSELS: LargeVessel[] = [
  { id: 'v1', name: 'OCEAN GIANT', type: 'Cargo', lat: -23.56, lng: -46.64, heading: 45, speed: 18, distance: 3.2 },
  { id: 'v2', name: 'BLUE MARLIN', type: 'Tanker', lat: -23.54, lng: -46.62, heading: 180, speed: 12, distance: 1.5 },
];

const ADMIN_KEY = "BUSSOL-2025"; 

const App: React.FC = () => {
  const [accessState, setAccessState] = useState<'landing' | 'admin-check' | 'user-pin' | 'unlocked'>('landing');
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<RouteData>({ distance: 0, estimatedTime: 0, waypoints: [] });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [vessels, setVessels] = useState<LargeVessel[]>(MOCK_VESSELS);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sosActive, setSosActive] = useState(false);
  
  // Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<any>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('bussol_profile');
    if (saved) return JSON.parse(saved);
    return {
      userName: 'Comandante',
      teamName: 'Va\'a Pro Team',
      photoUrl: '',
      modality: 'Canoagem VAA',
      nextPaddles: '',
      routeAlertEnabled: true,
      bigWaveAlertEnabled: true,
      marineLifeAlertEnabled: true,
      canoeType: 'Canoa Havaiana',
      theme: 'light',
      fontSize: 1,
      levelConfigs: [],
      savedTrainingPlans: [],
      bookings: [],
      myPartnerships: [],
      isPro: true,
      chatMessages: [],
      visibilityEnabled: false,
      pinEnabled: false,
      pinCode: "",
      isAdmin: false
    };
  });

  useEffect(() => {
    localStorage.setItem('bussol_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        try {
            const w = await fetchRealTimeWeather(loc.lat, loc.lng);
            setWeather(w);
        } catch (e) { console.error("Weather error", e); }
      });
    }

    const aisInterval = setInterval(() => {
       setVessels(prev => prev.map(v => ({
         ...v,
         lat: v.lat + (Math.random() - 0.5) * 0.001,
         lng: v.lng + (Math.random() - 0.5) * 0.001,
         distance: Math.max(0.1, v.distance + (Math.random() - 0.6) * 0.1)
       })));
    }, 5000);

    return () => {
        clearInterval(aisInterval);
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleTimer = (forceState?: boolean) => {
    const targetState = forceState !== undefined ? forceState : !isTimerRunning;
    if (targetState === isTimerRunning) return;
    if (!targetState) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(true);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
  };

  const handleSOS = () => {
    setSosActive(true);
    setTimeout(() => {
       if (confirm("SOS ENVIADO! Deseja cancelar o alerta de emergência?")) {
          setSosActive(false);
       }
    }, 500);
  };

  if (accessState === 'landing') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.15),transparent)]" />
        <div className="max-w-md w-full text-center space-y-12 z-10 p-8">
            <div className="space-y-4">
                <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-12 transition-transform hover:rotate-0 cursor-pointer">
                   <Compass size={48} className="text-white animate-[spin_20s_linear_infinite]" />
                </div>
                <h1 className="text-5xl font-black italic tracking-tighter">BUSSOLVA'A</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Navegação Tática para Remadores</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <button 
                    onClick={() => { if (userProfile.pinEnabled) setAccessState('user-pin'); else setAccessState('unlocked'); }}
                    className="group flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95 text-left shadow-xl"
                >
                    <div>
                        <p className="text-xs font-black uppercase text-blue-400 tracking-widest mb-1">Comandante</p>
                        <p className="text-lg font-black italic">Acessar App</p>
                    </div>
                    <UserIcon className="text-white/20 group-hover:text-blue-500 transition-colors" size={32} />
                </button>
            </div>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">v2.6.0-ALFA • Tactical Ready</p>
        </div>
      </div>
    );
  }

  if (accessState === 'user-pin') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-8">
         <div className="max-w-sm w-full text-center space-y-8 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl mb-4">
                <Lock size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-black italic">PIN Requerido</h2>
            <input 
              type="password" maxLength={4} placeholder="••••" 
              className="w-full p-6 rounded-[2rem] bg-slate-200 border-none text-center font-mono text-3xl outline-none focus:ring-4 ring-blue-500/20"
              autoFocus value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
            />
            <button onClick={() => { if (pinInput === userProfile.pinCode) setAccessState('unlocked'); else alert("PIN Incorreto."); }} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl">Desbloquear</button>
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-slate-50">
      <main className="flex-1 relative h-[45vh] md:h-full">
        <MapComponent 
          waypoints={route.waypoints} 
          onAddWaypoint={(lat, lng) => {
             setRoute(prev => ({
               ...prev,
               waypoints: [...prev.waypoints, { lat, lng, id: Math.random().toString() }],
               distance: prev.distance + (prev.waypoints.length > 0 ? 0.85 : 0)
             }));
          }}
          userLocation={userLocation}
          userPhoto={userProfile.photoUrl}
          vessels={vessels}
        />
        
        {/* BOTÃO DE SOS (PÂNICO) */}
        <button 
           onClick={handleSOS}
           className={`absolute bottom-10 left-6 z-40 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 border-4 ${sosActive ? 'bg-red-600 border-red-200 animate-pulse' : 'bg-red-500 border-white/20'}`}
        >
           <Siren size={32} className="text-white" />
           <div className="absolute -top-1 -right-1 bg-white text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">SOS</div>
        </button>

        {/* ALERTA DE NAVIO PRÓXIMO */}
        {vessels.some(v => v.distance < 1.5) && (
           <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-bounce border-2 border-white/50">
              <AlertCircle size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Colisão Iminente! Navio a menos de 1.5km</span>
           </div>
        )}

        {isTimerRunning && (
           <div className="absolute top-6 right-6 z-30 bg-black/80 backdrop-blur-md text-white px-8 py-4 rounded-[2rem] font-mono text-3xl border border-white/10 shadow-2xl flex items-center gap-6 animate-in slide-in-from-top-4">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              {new Date(elapsedTime * 1000).toISOString().substr(11, 8)}
           </div>
        )}
      </main>
      <aside className="w-full md:w-[450px] h-[55vh] md:h-full z-20 shadow-[-10px_0_40px_rgba(0,0,0,0.05)] bg-white">
        <Sidebar 
          route={route} analysis={analysis} 
          onClearRoute={() => { setRoute({ distance: 0, estimatedTime: 0, waypoints: [] }); setAnalysis(null); setElapsedTime(0); }}
          onAnalyze={async () => {
             if (userLocation && route.waypoints.length > 0) {
               setIsAnalyzing(true);
               const r = await analyzeRouteSafety(route, userLocation);
               setAnalysis(r);
               setIsAnalyzing(false);
             } else { alert("Adicione pontos no mapa para analisar a rota."); }
          }}
          isLoading={isAnalyzing} userLocation={userLocation} weather={weather} userProfile={userProfile}
          onUpdateProfile={(u) => setUserProfile(p => ({ ...p, ...u }))} onToggleTimer={toggleTimer} isTimerRunning={isTimerRunning}
          vessels={vessels} trainingHistory={[]} previewRouteId={null} onPreviewTraining={() => {}}
        />
      </aside>
    </div>
  );
};

export default App;
