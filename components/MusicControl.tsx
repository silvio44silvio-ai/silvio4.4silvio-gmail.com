
import React, { useState } from 'react';
import { Music, Play, SkipForward, SkipBack, ExternalLink, Zap } from 'lucide-react';

interface MusicControlProps {
  spm: number;
}

export const MusicControl: React.FC<MusicControlProps> = ({ spm }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const openSpotify = () => {
    // Link da Canção do Remador (Album)
    const spotifyUrl = "https://open.spotify.com/album/5op8m0JsLV1fPT1HvkUaSj?si=97f1JLnbRb67YPbPYzbTDA";
    const spotifyUri = "spotify:album:5op8m0JsLV1fPT1HvkUaSj";

    // Tenta abrir o app do Spotify via Deep Link
    window.location.href = spotifyUri; 
    
    // Fallback para web player se o app não abrir
    setTimeout(() => {
      window.open(spotifyUrl, "_blank");
    }, 500);
  };

  return (
    <div className="p-5 bg-[#1DB954]/5 border border-[#1DB954]/20 rounded-[2.5rem] space-y-4 group transition-all hover:bg-[#1DB954]/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1DB954] rounded-xl shadow-[0_0_15px_rgba(29,185,84,0.4)]">
            <Music size={16} className="text-black" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#1DB954] uppercase tracking-widest">Rhythm Sync</p>
            <p className="text-[8px] font-bold text-white/40 uppercase">Sincronizado com {spm} SPM</p>
          </div>
        </div>
        
        <button 
          onClick={openSpotify}
          className="p-2 bg-white/5 border border-white/10 rounded-xl text-white hover:text-[#1DB954] transition-all"
        >
          <ExternalLink size={14} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Animação de Ondas Sonoras */}
        <div className="flex items-end gap-1 h-6">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div 
              key={i}
              className={`w-1 bg-[#1DB954] rounded-full transition-all duration-300 ${isPlaying ? 'animate-pulse' : 'opacity-20'}`}
              style={{ 
                height: isPlaying ? `${Math.random() * 100 + 20}%` : '20%',
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-6">
          <button className="text-white/40 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-all shadow-xl"
          >
            {isPlaying ? <div className="w-3 h-3 bg-black rounded-sm" /> : <Play size={20} fill="black" />}
          </button>
          <button className="text-white/40 hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      <button 
        onClick={openSpotify}
        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-[8px] font-black text-white uppercase tracking-widest hover:bg-[#1DB954] hover:text-black hover:border-[#1DB954] transition-all"
      >
        <Zap size={10} className="fill-current" />
        Canção do Remador
      </button>
    </div>
  );
};
