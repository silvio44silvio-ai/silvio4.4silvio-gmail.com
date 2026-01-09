
import React, { useState } from 'react';
import { ShoppingBag, Zap, MessageSquare, ExternalLink, BarChart3, ChevronDown, ChevronUp, Eye, EyeOff, Wallet, CreditCard, ArrowUpRight, Target, TrendingUp, Info } from 'lucide-react';
import { Product, StoreAnalytics, UserRole } from '../types';

interface ShopDisplayProps {
  role: UserRole;
  products: Product[];
  onProductClick: (id: string) => void;
  onLeadAction: (id: string) => void;
  analytics: StoreAnalytics;
  onRecharge: () => void;
}

export const ShopDisplay: React.FC<ShopDisplayProps> = ({ role, products, onProductClick, onLeadAction, analytics, onRecharge }) => {
  const [isFeaturedCollapsed, setIsFeaturedCollapsed] = useState(false);
  const [isTacticalMode, setIsTacticalMode] = useState(false);
  const [showROIInfo, setShowROIInfo] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* PAINEL EXCLUSIVO DO LOJISTA COM MÉTRICAS DE NEGÓCIO */}
      {role === 'MERCHANT' && (
        <div className="space-y-4">
          <div className="p-5 rounded-[2rem] bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wallet size={12} className="text-emerald-400" />
                  <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em]">Créditos de Exposição</p>
                </div>
                <h3 className="text-3xl font-black italic logo-font text-white">R$ {analytics.balance.toFixed(2)}</h3>
              </div>
              <button 
                onClick={onRecharge}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-2xl text-white text-[10px] font-black hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                <CreditCard size={14} />
                RECARREGAR
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[7px] font-bold opacity-40 uppercase mb-1">Cliques Úteis</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{analytics.totalClicks}</span>
                  <span className="text-[8px] text-emerald-400 font-bold">- R$ {(analytics.totalClicks * 0.5).toFixed(2)}</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[7px] font-bold opacity-40 uppercase mb-1">Leads Gerados</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{analytics.totalLeads}</span>
                  <span className="text-[8px] text-cyan-400 font-bold">- R$ {(analytics.totalLeads * 5.0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* SIMULADOR DE ROI / INFO BENEFÍCIO */}
            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
               <button 
                onClick={() => setShowROIInfo(!showROIInfo)}
                className="w-full flex items-center justify-between text-[8px] font-black text-emerald-400 uppercase tracking-widest"
               >
                 <div className="flex items-center gap-2">
                   <Target size={12} />
                   Por que investir R$ 100,00?
                 </div>
                 <Info size={12} />
               </button>
               
               {showROIInfo && (
                 <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                      <p className="text-[9px] opacity-70 leading-relaxed text-white">
                        <b>Alcance Qualificado:</b> Seus produtos são exibidos para remadores ativos no momento da prática.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                      <p className="text-[9px] opacity-70 leading-relaxed text-white">
                        <b>PPC (R$ 0,50):</b> R$ 100 garantem até 200 visitas diretas à sua vitrine técnica.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                      <p className="text-[9px] opacity-70 leading-relaxed text-white">
                        <b>Conversão:</b> O sistema prioriza lojistas com saldo, mantendo sua marca em evidência tática.
                      </p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* CABEÇALHO DO MARKETPLACE */}
      <div className="flex items-center justify-between px-2 pt-2">
        <h3 className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Marketplace</h3>
        <button 
          onClick={() => setIsTacticalMode(!isTacticalMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isTacticalMode ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-slate-900 border-white/10 text-slate-400'}`}
        >
          {isTacticalMode ? <EyeOff size={12} /> : <Eye size={12} />}
          <span className="text-[9px] font-black uppercase tracking-tighter">
            {isTacticalMode ? 'MODO TÁTICO' : 'MODO VISUAL'}
          </span>
        </button>
      </div>

      {/* PRODUTOS (Visão do Remador / Catálogo) */}
      <div className="space-y-3">
        <button 
          onClick={() => setIsFeaturedCollapsed(!isFeaturedCollapsed)}
          className="w-full flex items-center justify-between px-2 group"
        >
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-yellow-400 fill-yellow-400" /> 
            <span className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] group-hover:opacity-100 transition-opacity">Equipamento de Elite</span>
          </div>
          {isFeaturedCollapsed ? <ChevronDown size={14} className="opacity-40" /> : <ChevronUp size={14} className="opacity-40" />}
        </button>

        {!isFeaturedCollapsed && (
          <div className="grid grid-cols-1 gap-4">
            {products.filter(p => p.isFeatured).map(product => (
              <div 
                key={product.id}
                className={`group relative bg-slate-900/60 rounded-[2rem] border border-cyan-500/30 overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all hover:border-cyan-400 ${isTacticalMode ? 'h-24' : 'h-40'}`}
              >
                {!isTacticalMode && (
                  <div className="absolute top-4 right-4 z-10 bg-cyan-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-pulse uppercase">
                    Destaque
                  </div>
                )}
                <div className="flex h-full">
                  {!isTacticalMode && (
                    <div className="w-1/3 bg-slate-800 flex items-center justify-center p-4">
                      <img src={product.image} alt={product.name} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <div className={`flex-1 p-5 flex flex-col justify-between ${isTacticalMode ? 'bg-slate-900/80' : ''}`}>
                    <div>
                      <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">{product.category}</p>
                      <h4 className={`font-black text-white leading-tight uppercase italic ${isTacticalMode ? 'text-xs' : 'text-sm'}`}>{product.name}</h4>
                      <p className="text-[10px] opacity-40">por {product.storeName}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`${isTacticalMode ? 'text-sm' : 'text-xl'} font-black italic logo-font text-white`}>R$ {product.price}</span>
                      <button 
                        onClick={() => onLeadAction(product.id)}
                        className={`${isTacticalMode ? 'p-2' : 'p-3'} bg-cyan-500 rounded-2xl text-white hover:bg-cyan-400 active:scale-90 transition-all shadow-lg shadow-cyan-500/20`}
                      >
                        <MessageSquare size={isTacticalMode ? 14 : 18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] px-2">Outras Ofertas</h3>
        <div className={`grid gap-3 ${isTacticalMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {products.filter(p => !p.isFeatured).map(product => (
            <div 
              key={product.id}
              onClick={() => onProductClick(product.id)}
              className={`bg-slate-900/40 border border-white/5 rounded-3xl transition-all cursor-pointer group hover:bg-slate-800/60 ${isTacticalMode ? 'p-3 flex items-center justify-between' : 'p-4 flex flex-col gap-3'}`}
            >
              {!isTacticalMode && (
                <div className="h-24 bg-slate-900/80 rounded-2xl flex items-center justify-center overflow-hidden">
                   <img src={product.image} alt={product.name} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                </div>
              )}
              <div className={isTacticalMode ? 'flex-1' : ''}>
                <h5 className="text-[10px] font-black text-white uppercase truncate">{product.name}</h5>
                <p className="text-[8px] font-bold text-cyan-400/60 uppercase">{product.storeName}</p>
              </div>
              <div className={`flex items-center gap-3 ${isTacticalMode ? '' : 'justify-between'}`}>
                <span className="text-xs font-black italic logo-font text-white">R$ {product.price}</span>
                <ExternalLink size={12} className="opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
