
import React from 'react';
import { Compass } from 'lucide-react';

export const BrandLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 36 : 22;
  const textSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-2xl' : 'text-xl';
  
  const renderWaveText = () => {
    // Texto com apóstrofo garantido
    const text = "BUSSULVA'A";
    
    return text.split('').map((char, i) => {
      let translateY = "translate-y-0";
      
      // Mapeamento da onda focado no centro (S S U L V)
      // B(0) U(1) S(2) S(3) U(4) L(5) V(6) A(7) '(8) A(9)
      if (i === 2) translateY = "-translate-y-[3px]"; // S
      if (i === 3) translateY = "-translate-y-[6px]"; // S
      if (i === 4) translateY = "-translate-y-[9px]"; // U - Pico da onda
      if (i === 5) translateY = "-translate-y-[6px]"; // L
      if (i === 6) translateY = "-translate-y-[3px]"; // V

      const isApostrophe = char === "'";
      const isGradient = i >= 7; // VA'A final em gradiente

      return (
        <span 
          key={i} 
          className={`
            inline-block transition-transform duration-500 group-hover:scale-110 
            ${translateY} 
            ${isGradient ? 'logo-gradient' : ''} 
            ${isApostrophe ? 'text-cyan-400 font-black scale-150 mx-[0.5px] -translate-y-1' : ''}
          `}
          style={isApostrophe ? { textShadow: '0 0 8px rgba(34, 211, 238, 0.8)' } : {}}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="flex items-center gap-2 group cursor-default">
      <div className={`relative p-2 bg-slate-900 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-500 group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]`}>
        <div className="absolute inset-0 rounded-xl bg-cyan-400/10 animate-ping"></div>
        <Compass size={iconSize} className="text-cyan-400 relative z-10" />
      </div>
      
      <div className="flex flex-col leading-none">
        <span className={`font-black italic logo-font tracking-tighter ${textSize} text-white uppercase flex items-end h-10 overflow-visible`}>
          {renderWaveText()}
        </span>
        <span className="text-[7px] font-bold text-cyan-400/60 tracking-[0.4em] uppercase ml-1">
          Elite Tactical
        </span>
      </div>
    </div>
  );
};
