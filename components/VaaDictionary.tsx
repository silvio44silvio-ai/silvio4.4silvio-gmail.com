
import React, { useState } from 'react';
import { Book, Search, Anchor, Zap, Heart, Info } from 'lucide-react';

interface Term {
  word: string;
  meaning: string;
  category: 'Equipamento' | 'Comando' | 'Cultura';
}

const DICTIONARY: Term[] = [
  { word: 'ALOHA', meaning: 'Muito além de um "olá", significa amor, compaixão e compartilhar o fôlego da vida.', category: 'Cultura' },
  { word: 'AMA', meaning: 'O flutuador lateral que garante a estabilidade da canoa.', category: 'Equipamento' },
  { word: 'E PAI', meaning: 'Comando para "bater" ou iniciar a remada com força.', category: 'Comando' },
  { word: 'HOE', meaning: 'Remo ou o ato de remar. É a ferramenta de conexão com a água.', category: 'Equipamento' },
  { word: 'HOE ULI', meaning: 'O mestre do leme; a pessoa responsável por guiar a direção da canoa.', category: 'Comando' },
  { word: 'HUKI', meaning: 'Puxar. A fase crucial de tração onde o remador move a água.', category: 'Comando' },
  { word: 'IAKO', meaning: 'Os braços de madeira ou metal que conectam o casco (Kino) ao flutuador (Ama).', category: 'Equipamento' },
  { word: 'IHU', meaning: 'A proa (frente) da canoa.', category: 'Equipamento' },
  { word: 'IMUA', meaning: 'Para frente! Grito de ordem para foco total e superação de obstáculos.', category: 'Comando' },
  { word: 'KAI', meaning: 'Mar ou água salgada. A fonte de vida e energia para o remador.', category: 'Cultura' },
  { word: 'KAHUNA', meaning: 'Mestre, especialista ou guardião de segredos técnicos e espirituais.', category: 'Cultura' },
  { word: 'KINO', meaning: 'O casco principal da canoa.', category: 'Equipamento' },
  { word: 'KUPUNA', meaning: 'Ancestral ou ancião. O respeito aos que remaram antes de nós.', category: 'Cultura' },
  { word: 'MAHALO', meaning: 'Gratidão profunda. Reconhecimento pela jornada e pelos companheiros.', category: 'Cultura' },
  { word: 'MALAMA', meaning: 'Cuidar, preservar e proteger (ex: Malama I Ke Kai - cuide do mar).', category: 'Cultura' },
  { word: 'MANU', meaning: 'As extremidades curvas (proa e popa) que dão identidade à canoa.', category: 'Equipamento' },
  { word: 'MOANA', meaning: 'Oceano profundo; a vastidão azul que desafia e acolhe.', category: 'Cultura' },
  { word: 'NOHO', meaning: 'Os assentos da canoa, numerados de 1 a 6 na OC6.', category: 'Equipamento' },
  { word: 'OHANA', meaning: 'Família. Na canoa, significa que ninguém fica para trás.', category: 'Cultura' },
  { word: 'PAPA', meaning: 'Prancha ou superfície plana. Origem do surfe e SUP.', category: 'Equipamento' },
  { word: 'VA\'A', meaning: 'Termo polinésio para Canoa. É a embarcação sagrada.', category: 'Equipamento' },
  { word: 'WAA', meaning: 'Grafia havaiana original para canoa (intercambiável com Va\'a).', category: 'Equipamento' },
];

export const VaaDictionary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = DICTIONARY.sort((a, b) => a.word.localeCompare(b.word)).filter(t => 
    t.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Equipamento': return <Anchor size={12} className="text-cyan-400" />;
      case 'Comando': return <Zap size={12} className="text-yellow-400" />;
      case 'Cultura': return <Heart size={12} className="text-red-400" />;
      default: return <Info size={12} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="px-2">
        <div className="flex items-center gap-3 mb-4">
          <Book size={18} className="text-cyan-400" />
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Bússola Cultural</h3>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            type="text"
            placeholder="BUSCAR TERMO (EX: AMA, HUKI...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black tracking-widest text-white focus:border-cyan-500/50 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid gap-3 px-1">
        {filtered.map((item, idx) => (
          <div 
            key={idx}
            className="group p-5 bg-slate-900/40 border border-white/5 rounded-[2rem] hover:border-cyan-500/30 transition-all hover:bg-slate-900/60 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="logo-font text-sm font-black italic text-white tracking-tighter group-hover:text-cyan-400 transition-colors">
                {item.word}
              </h4>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/5">
                {getCategoryIcon(item.category)}
                <span className="text-[7px] font-black uppercase opacity-60 tracking-tighter text-white">{item.category}</span>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
              {item.meaning}
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center opacity-20">
            <Search size={40} className="mb-4" />
            <p className="text-center text-[10px] font-black uppercase tracking-widest">Nenhum registro encontrado no radar</p>
          </div>
        )}
      </div>
      
      <div className="mx-2 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex items-start gap-3">
        <Info size={16} className="text-cyan-500 shrink-0 mt-0.5" />
        <p className="text-[9px] leading-relaxed text-cyan-500/70 font-bold uppercase">
          A linguagem da canoa conecta você com milhares de anos de navegação. Aprender os termos é respeitar o mar.
        </p>
      </div>
    </div>
  );
};
