
import React, { useState } from 'react';
import { ShieldCheck, Loader2, Smartphone, Check, UserCircle, Fingerprint, Zap } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LoginScreenProps {
  onLoginSuccess: (phone: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'ID' | 'SYNC'>('ID');
  const [loading, setLoading] = useState(false);

  const handleQuickAccess = () => {
    setLoading(true);
    // Simula uma varredura biométrica/satélite para dar o "feeling" do app
    setTimeout(() => {
      setStep('SYNC');
      setTimeout(() => {
        onLoginSuccess('ELITE_PADDLER');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #22d3ee 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative w-full max-w-sm space-y-12 text-center animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center scale-110 mb-6">
          <BrandLogo size="lg" />
        </div>

        {step === 'ID' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-xl font-black italic logo-font text-white uppercase tracking-tighter">Inicialização de Sistema</h2>
              <p className="text-[10px] font-bold text-cyan-400/60 uppercase tracking-widest leading-relaxed">
                Acesse sua licença de navegação tática via satélite.
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleQuickAccess}
                disabled={loading}
                className="w-full py-8 bg-cyan-500 rounded-[2.5rem] text-white font-black uppercase text-sm flex flex-col items-center justify-center gap-3 shadow-2xl shadow-cyan-500/30 transition-all active:scale-95 group"
              >
                {loading ? <Loader2 className="animate-spin" size={32} /> : (
                  <>
                    <Fingerprint size={40} className="group-hover:scale-110 transition-transform" />
                    <span>AUTENTICAR BIOMETRIA</span>
                  </>
                )}
              </button>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
                  Nota: O envio de SMS está desativado nesta versão de testes. Use a biometria para acesso imediato.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'SYNC' && (
          <div className="space-y-8 animate-in zoom-in-110 duration-700">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40 relative">
               <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
               <Check size={48} className="text-white" strokeWidth={4} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black italic logo-font text-emerald-400 uppercase tracking-tighter">Sincronizando GPS</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest animate-pulse">Localizando embarcação no radar global...</p>
            </div>
          </div>
        )}

        <div className="pt-10 flex items-center justify-center gap-4 text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
          <ShieldCheck size={12} />
          <span>Protocolo Militar Encriptado</span>
        </div>
      </div>
    </div>
  );
};
