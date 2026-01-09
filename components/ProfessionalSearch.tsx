
import React, { useState, useEffect } from 'react';
import { Search, UserCircle, MapPin, Briefcase, MessageSquare, Loader2, Award, Shield, Users, BriefcaseBusiness, Globe, CheckCircle2, Star } from 'lucide-react';
import { Professional, JobVacancy } from '../types';
import { searchProfessionals, searchJobs } from '../services/professionalService';

interface TacticalCareerProps {
  userLocation: { lat: number, lng: number } | null;
}

export const ProfessionalSearch: React.FC<TacticalCareerProps> = ({ userLocation }) => {
  const [view, setView] = useState<'PROS' | 'JOBS'>('PROS');
  const [query, setQuery] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    if (view === 'PROS') {
      const results = await searchProfessionals(query || 'Treinadores', userLocation?.lat, userLocation?.lng);
      setProfessionals(results);
    } else {
      const results = await searchJobs(userLocation?.lat, userLocation?.lng);
      setJobs(results);
    }
    setLoading(false);
  };

  useEffect(() => { handleSearch(); }, [view]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* SELETOR DE VISTA */}
      <div className="flex p-1 bg-slate-900/80 rounded-2xl border border-white/5">
        <button 
          onClick={() => setView('PROS')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'PROS' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
        >
          <Users size={14} /> Profissionais
        </button>
        <button 
          onClick={() => setView('JOBS')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'JOBS' ? 'bg-yellow-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
        >
          <BriefcaseBusiness size={14} /> Mural de Vagas
        </button>
      </div>

      {view === 'PROS' && (
        <form onSubmit={handleSearch} className="relative">
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
          </button>
          <input 
            type="text"
            placeholder="BUSCAR TREINADOR, SALVA-VIDAS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black tracking-widest text-white focus:border-cyan-500/50 focus:outline-none transition-all uppercase"
          />
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
             <Loader2 size={32} className="text-cyan-500 animate-spin mb-4" />
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Sincronizando Base de Dados...</p>
          </div>
        ) : (
          <>
            {view === 'PROS' ? (
              professionals.map((pro) => (
                <div key={pro.id} className="group p-5 bg-slate-900/40 border border-white/5 rounded-[2.5rem] hover:border-cyan-500/30 transition-all hover:bg-slate-900/60 relative overflow-hidden">
                  {pro.available && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[7px] font-black text-emerald-400 uppercase">Disponível</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white/10 shrink-0 bg-slate-800">
                        <img src={pro.image} alt={pro.name} className="w-full h-full object-cover" />
                      </div>
                      {pro.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-cyan-500 p-1 rounded-full border-2 border-slate-900">
                          <CheckCircle2 size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="logo-font text-xs font-black italic text-white uppercase tracking-tighter mb-1">{pro.name}</h4>
                      <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-3">{pro.role}</p>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {pro.certifications?.slice(0, 2).map((cert, i) => (
                          <div key={i} className="px-2 py-0.5 bg-white/5 rounded-md flex items-center gap-1">
                             <Star size={8} className="text-yellow-500" />
                             <span className="text-[7px] font-bold text-white/40 uppercase">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[8px] font-bold text-white/40 uppercase">
                          <MapPin size={10} className="text-cyan-400" /> {pro.location}
                       </div>
                       <div className="text-[8px] font-black text-white/60 uppercase">{pro.yearsExperience}+ anos exp</div>
                    </div>
                    
                    <p className="text-[9px] leading-relaxed text-slate-400 font-medium italic">"{pro.description}"</p>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 py-3 bg-slate-800 border border-white/10 rounded-2xl text-[8px] font-black text-white uppercase hover:bg-slate-700 transition-all">Perfil Tático</button>
                      <button className="px-5 py-3 bg-cyan-500 rounded-2xl text-white hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"><MessageSquare size={14} /></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="p-6 bg-slate-900/60 border border-white/5 rounded-[2.5rem] hover:border-yellow-500/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="logo-font text-sm font-black italic text-white uppercase tracking-tighter">{job.title}</h4>
                      <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">{job.baseName}</p>
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[7px] font-black text-white uppercase">{job.type}</div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-[8px] font-bold text-white/40 uppercase">
                      <MapPin size={10} className="text-yellow-500" /> {job.location}
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-400 uppercase">
                        <Star size={10} className="text-emerald-400" /> {job.salaryRange}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-white/60 leading-relaxed mb-6 uppercase font-bold tracking-tight">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.requirements.map((req, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-[7px] font-black text-white/30 uppercase border border-white/5">{req}</span>
                    ))}
                  </div>

                  <button className="w-full py-4 bg-yellow-500 rounded-3xl text-[10px] font-black text-white uppercase shadow-xl shadow-yellow-500/10 active:scale-95 transition-all">Candidatar-se à Missão</button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
