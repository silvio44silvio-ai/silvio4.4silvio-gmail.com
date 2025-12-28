
import React, { useState, useEffect, useMemo } from 'react';
import { 
  RouteData, AnalysisResult, WeatherData, UserProfile, LargeVessel, 
  StrokeAnalysis, NewsItem, CompetitionEvent, CanoeLocation 
} from '../types';
import { 
  Activity, Settings, Users, Store, Music, Disc, Mic, MicOff, Ship, 
  ShieldAlert, Zap, Search, Compass, ChevronRight, ShoppingBag, Terminal, 
  Play, Download, CheckCircle2, AlertTriangle, Eye, Target, Award, 
  Newspaper, Calendar, MapPin, Filter, SortAsc, Navigation2, Anchor
} from 'lucide-react';
import { processVoiceIntent, getTechnicalPaddlingAdvice } from '../services/geminiService';
import { fetchCanoeNews } from '../services/newsService';
import { findNearestCanoeLocations } from '../services/locationService';

interface SidebarProps {
  route: RouteData;
  analysis: AnalysisResult | null;
  onClearRoute: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
  userLocation: { lat: number; lng: number } | null;
  weather: WeatherData | null;
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onToggleTimer: (forceState?: boolean) => void;
  isTimerRunning: boolean;
  vessels: LargeVessel[];
  trainingHistory: any[];
  previewRouteId: string | null;
  onPreviewTraining: (r: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  route, analysis, onClearRoute, onAnalyze, isLoading, userLocation,
  weather, userProfile, onUpdateProfile, onToggleTimer, isTimerRunning, vessels,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [historyTab, setHistoryTab] = useState<'workouts' | 'safety' | 'explore' | 'music' | 'shop'>('workouts');
  const [exploreSubTab, setExploreSubTab] = useState<'news' | 'events' | 'locations'>('news');
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [cartCount, setCartCount] = useState(0);
  
  // Discovery State
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [locations, setLocations] = useState<CanoeLocation[]>([]);
  const [isFetchingExplore, setIsFetchingExplore] = useState(false);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('Tudo');
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>('Tudo');

  // Technical State
  const [showTechAnalysis, setShowTechAnalysis] = useState(false);
  const [isAnalyzingTech, setIsAnalyzingTech] = useState(false);
  const [techTips, setTechTips] = useState<string[]>([]);
  const [simulatedTech, setSimulatedTech] = useState<StrokeAnalysis>({
    spm: 58,
    dps: 1.85,
    efficiency: 84,
    powerPhase: 0.6,
    recoveryPhase: 0.4,
    techniqueTips: []
  });

  const THEMATIC_ALBUM_URL = 'https://open.spotify.com/intl-pt/album/5op8m0JsLV1fPT1HvkUaSj?si=KbMykrbQQ2amtiWHr5GJZA';

  // Fetch News and Locations
  useEffect(() => {
    if (historyTab === 'explore') {
      const loadExploreData = async () => {
        setIsFetchingExplore(true);
        try {
          const newsData = await fetchCanoeNews();
          setNews(newsData.news);
          setEvents(newsData.events);
          
          if (userLocation) {
            const locData = await findNearestCanoeLocations(userLocation.lat, userLocation.lng);
            setLocations(locData);
          }
        } catch (err) {
          console.error("Explore fetch error:", err);
        } finally {
          setIsFetchingExplore(false);
        }
      };
      loadExploreData();
    }
  }, [historyTab, userLocation]);

  // Filtering Logic
  const filteredNews = useMemo(() => {
    return news.filter(n => categoryFilter === 'Tudo' || n.category.toLowerCase().includes(categoryFilter.toLowerCase()));
  }, [news, categoryFilter]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => categoryFilter === 'Tudo' || e.category.toLowerCase().includes(categoryFilter.toLowerCase()));
  }, [events, categoryFilter]);

  const filteredLocations = useMemo(() => {
    return locations.filter(l => locationTypeFilter === 'Tudo' || l.type.toLowerCase() === locationTypeFilter.toLowerCase());
  }, [locations, locationTypeFilter]);

  const SHOP_ITEMS = [
    { id: 1, name: 'Remo Carbono Pro OC1', price: 'R$ 1.850', tag: 'Elite', img: '🛶' },
    { id: 2, name: 'Colete de Impacto Va\'a', price: 'R$ 420', tag: 'Segurança', img: '🦺' },
  ];

  const handleConsultTechIA = async () => {
    setIsAnalyzingTech(true);
    try {
      const tips = await getTechnicalPaddlingAdvice({
        spm: simulatedTech.spm,
        speed: 6.4,
        dps: simulatedTech.dps,
        canoeType: userProfile.canoeType
      });
      setTechTips(tips);
      setShowTechAnalysis(true);
    } catch (e) { console.error(e); } finally { setIsAnalyzingTech(false); }
  };

  const handleVoiceCommand = async () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.onstart = () => { setIsListening(true); setVoiceFeedback("Escutando..."); };
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setVoiceFeedback(`Comando: "${text}"`);
      try {
        const result = await processVoiceIntent(text);
        switch(result.intent) {
          case 'START_TRAINING': onToggleTimer(true); break;
          case 'STOP_TRAINING': onToggleTimer(false); break;
          default: setVoiceFeedback("Comando não reconhecido.");
        }
      } catch (err) { setVoiceFeedback("Erro."); }
      setTimeout(() => setIsListening(false), 2000);
    };
    recognition.start();
  };

  return (
    <div className={`w-full h-full flex flex-col border-r overflow-hidden ${userProfile.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      {/* Header Section */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
             <button onClick={() => setShowSettings(!showSettings)} className="relative group active:scale-95 transition-transform">
                <div className={`relative flex items-center justify-center w-14 h-14 rounded-full border shadow-2xl ring-2 transition-all ${userProfile.theme === 'dark' ? 'bg-slate-800 border-slate-700 ring-blue-900/20' : 'bg-white border-slate-100 ring-blue-50'}`}>
                   {userProfile.photoUrl ? <img src={userProfile.photoUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : <Compass className="text-blue-600 animate-[spin_20s_linear_infinite]" size={28} />}
                </div>
             </button>
             <div>
               <h1 className="text-xl font-black tracking-tighter uppercase">BussolVa'a</h1>
               <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{userProfile.teamName}</span>
             </div>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-2xl transition-all ${showSettings ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <Settings size={20} />
          </button>
        </div>

        {showSettings && (
          <div className="p-5 rounded-[2.5rem] border animate-in slide-in-from-top duration-300 mb-4 bg-slate-50 dark:bg-slate-800 shadow-xl">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Ajustes Táticos</h4>
            <div className="grid grid-cols-2 gap-2">
                <select 
                  value={userProfile.canoeType} 
                  onChange={(e) => onUpdateProfile({ canoeType: e.target.value as any })} 
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase border border-slate-100 outline-none focus:ring-2 ring-blue-500 transition-all"
                >
                   <option value="OC1">Va'a OC1</option>
                   <option value="OC4">Va'a OC4</option>
                   <option value="OC6">Va'a OC6</option>
                   <option value="V1">Va'a V1</option>
                   <option value="V6">Va'a V6</option>
                   <option value="Dragon Boat">Dragon Boat</option>
                   <option value="Surfski">Surfski</option>
                </select>
                <input type="text" placeholder="Equipe" value={userProfile.teamName} onChange={(e) => onUpdateProfile({ teamName: e.target.value })} className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-bold border border-slate-100" />
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full mt-3 py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-2xl active:scale-95 transition-transform">Confirmar</button>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="px-6 py-2 flex gap-1 overflow-x-auto scrollbar-hide bg-slate-50/50">
         {[
           {id: 'workouts', label: 'Treino', icon: <Activity size={12}/>},
           {id: 'safety', label: 'Radar', icon: <Ship size={12}/>},
           {id: 'explore', label: 'Explorar', icon: <Search size={12}/>},
           {id: 'shop', label: 'Loja', icon: <ShoppingBag size={12}/>},
           {id: 'music', label: 'Play', icon: <Music size={12}/>},
         ].map((tab: any) => (
           <button 
             key={tab.id} 
             onClick={() => setHistoryTab(tab.id)}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${historyTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
           >
             {tab.icon}
             {tab.label}
           </button>
         ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {historyTab === 'explore' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
             {/* Explore Sub-Tabs */}
             <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button onClick={() => setExploreSubTab('news')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${exploreSubTab === 'news' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Notícias</button>
                <button onClick={() => setExploreSubTab('events')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${exploreSubTab === 'events' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Eventos</button>
                <button onClick={() => setExploreSubTab('locations')} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${exploreSubTab === 'locations' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Locais</button>
             </div>

             {/* Filters Section */}
             {(exploreSubTab === 'news' || exploreSubTab === 'events') && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                   {['Tudo', 'Va\'a', 'SUP', 'Surfski', 'Dragon'].map(cat => (
                     <button 
                       key={cat} 
                       onClick={() => setCategoryFilter(cat)}
                       className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase border transition-all ${categoryFilter === cat ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                     >
                       {cat}
                     </button>
                   ))}
                </div>
             )}

             {exploreSubTab === 'locations' && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                   {['Tudo', 'Escola', 'Guardaria'].map(type => (
                     <button 
                       key={type} 
                       onClick={() => setLocationTypeFilter(type)}
                       className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase border transition-all ${locationTypeFilter === type ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                     >
                       {type}
                     </button>
                   ))}
                </div>
             )}

             {/* Content List */}
             <div className="space-y-4">
                {isFetchingExplore ? (
                   <div className="flex flex-col items-center py-20 opacity-40">
                      <Disc className="animate-spin mb-2" size={32} />
                      <p className="text-[10px] font-black uppercase">Sincronizando Dados...</p>
                   </div>
                ) : (
                  <>
                    {exploreSubTab === 'news' && filteredNews.map(item => (
                       <a href={item.url} target="_blank" rel="noopener noreferrer" key={item.id} className="block p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[8px] font-black uppercase bg-blue-50 text-blue-500 px-2 py-0.5 rounded-sm">{item.category}</span>
                             <span className="text-[8px] font-bold text-slate-400">{item.date}</span>
                          </div>
                          <h4 className="text-xs font-black leading-tight mb-2 group-hover:text-blue-600">{item.title}</h4>
                          <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{item.summary}</p>
                       </a>
                    ))}

                    {exploreSubTab === 'events' && filteredEvents.map(event => (
                       <div key={event.id} className="p-5 bg-indigo-50/30 rounded-3xl border border-indigo-100 flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex flex-col items-center justify-center border border-indigo-100 shadow-sm">
                             <Calendar size={18} className="text-indigo-600" />
                          </div>
                          <div className="flex-1">
                             <h4 className="text-xs font-black">{event.title}</h4>
                             <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1"><MapPin size={10}/> {event.location}</p>
                             <p className="text-[9px] font-black text-indigo-600 mt-1">{event.date}</p>
                          </div>
                          <ChevronRight size={18} className="text-slate-300" />
                       </div>
                    ))}

                    {exploreSubTab === 'locations' && filteredLocations.map(loc => (
                       <div key={loc.id} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${loc.type === 'escola' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                             {loc.type === 'escola' ? <Award size={20} /> : <Anchor size={20} />}
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-2">
                                <h4 className="text-xs font-black">{loc.name}</h4>
                                <span className={`text-[7px] font-black uppercase px-1 rounded ${loc.type === 'escola' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{loc.type}</span>
                             </div>
                             <p className="text-[10px] text-slate-400 font-bold">Aprox. 2.4km • {loc.description}</p>
                          </div>
                          <button className="p-3 bg-slate-900 text-white rounded-2xl">
                             <Navigation2 size={16} />
                          </button>
                       </div>
                    ))}
                  </>
                )}
             </div>
          </div>
        )}

        {/* Existing Workouts Tab Content... */}
        {historyTab === 'workouts' && (
           <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Ritmo Atual</p>
                    <p className="text-2xl font-black italic">6.4 <span className="text-[10px] opacity-40">km/h</span></p>
                 </div>
                 <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Total Dist.</p>
                    <p className="text-2xl font-black italic">{route.distance.toFixed(1)} <span className="text-[10px] opacity-40">km</span></p>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                 <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-4"><Target size={16} className="text-blue-500" /> Métricas Técnicas</h3>
                 <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                       <p className="text-[8px] font-black text-slate-400 uppercase">SPM</p>
                       <p className="text-lg font-black">{isTimerRunning ? simulatedTech.spm : '--'}</p>
                    </div>
                    <div className="text-center border-x border-slate-200">
                       <p className="text-[8px] font-black text-slate-400 uppercase">DPS</p>
                       <p className="text-lg font-black">{isTimerRunning ? simulatedTech.dps : '--'}m</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[8px] font-black text-slate-400 uppercase">POWER</p>
                       <p className="text-lg font-black">{isTimerRunning ? simulatedTech.efficiency : '--'}%</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleConsultTechIA}
                disabled={!isTimerRunning || isAnalyzingTech}
                className={`w-full py-4 rounded-3xl font-black uppercase text-[10px] flex items-center justify-center gap-3 shadow-xl transition-all ${!isTimerRunning ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 text-white'}`}
              >
                {isAnalyzingTech ? <Disc className="animate-spin" /> : <Award size={16} />}
                Consultar Técnico Virtual (IA)
              </button>

              <button 
                onClick={() => onToggleTimer()} 
                className={`w-full py-8 rounded-[3rem] font-black uppercase text-sm flex flex-col items-center justify-center gap-3 shadow-2xl active:scale-95 ${isTimerRunning ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}
              >
                 <Activity size={24} className={isTimerRunning ? 'animate-bounce' : ''} />
                 <span>{isTimerRunning ? 'Pausar Remada' : 'Iniciar Novo Treino'}</span>
              </button>
           </div>
        )}

        {/* Other Tabs content... (Safety, Shop, Music kept simplified for brevity) */}
        {historyTab === 'safety' && (
           <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => alert("Perigo reportado!")} className="p-4 bg-orange-50 text-orange-600 border border-orange-100 rounded-[2rem] flex flex-col items-center gap-2"><AlertTriangle size={24} /><span className="text-[9px] font-black uppercase">Perigo</span></button>
                 <button onClick={() => alert("Vida marinha reportada!")} className="p-4 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-[2rem] flex flex-col items-center gap-2"><Eye size={24} /><span className="text-[9px] font-black uppercase">Vida</span></button>
              </div>
              <button onClick={onAnalyze} className={`w-full py-5 rounded-3xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl transition-all ${isLoading ? 'bg-slate-200' : 'bg-blue-600 text-white'}`}>
                 <ShieldAlert size={18} /> Análise Tática
              </button>
           </div>
        )}
      </div>

      {/* Voice Control Sticky Footer */}
      <div className="p-6 sticky bottom-0 bg-inherit border-t">
        {isListening && (
           <div className="absolute bottom-full left-0 w-full px-6 py-4 animate-in slide-in-from-bottom-2">
              <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/20">
                 <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-4 bg-white/70 rounded-full animate-pulse" style={{animationDelay: `${i*0.2}s`}} />)}
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest truncate">{voiceFeedback}</p>
              </div>
           </div>
        )}
        <button 
          onClick={handleVoiceCommand} 
          className={`w-full py-5 rounded-[2.5rem] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white'}`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          <span className="font-black uppercase text-xs tracking-[0.2em]">{isListening ? 'Escutando...' : 'Comando de Voz'}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
