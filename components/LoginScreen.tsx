
import React, { useState } from 'react';
import { Phone, ArrowRight, ShieldCheck, Loader2, Smartphone, Check, UserCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface LoginScreenProps {
  onLoginSuccess: (phone: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'SYNC'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
    }, 1500);
  };

  const handleQuickAccess = () => {
    setLoading(true);
    setStep('SYNC');
    setTimeout(() => {
      onLoginSuccess('GUEST_USER');
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (newOtp.every(v => v !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleVerifyOtp = (code: string) => {
    setLoading(true);
    setTimeout(() => {
      setStep('SYNC');
      setTimeout(() => {
        onLoginSuccess(phone);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #22d3ee 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      <div className="relative w-full max-w-sm space-y-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center scale-125 mb-10">
          <BrandLogo size="lg" />
        </div>

        {step === 'PHONE' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
              <h2 className="text-xl font-black italic logo-font text-white uppercase tracking-tighter">Identificação Tática</h2>
              <p className="text-[10px] font-bold text-cyan-400/60 uppercase tracking-widest leading-relaxed">Inicie sua conexão via satélite através do seu terminal móvel.</p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400 transition-transform group-focus-within:scale-110">
                  <Smartphone size={20} />
                </div>
                <input 
                  type="tel"
                  placeholder="(00) 0 0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-3xl py-6 pl-14 pr-6 text-lg font-black tracking-widest text-white placeholder:text-white/10 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 focus:outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <button 
                  type="submit"
                  disabled={phone.length < 10 || loading}
                  className="w-full py-6 bg-cyan-500 rounded-3xl text-white font-black uppercase text-sm flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <span>INICIAR CONEXÃO</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={handleQuickAccess}
                  disabled={loading}
                  className="w-full py-4 rounded-3xl border border-white/10 text-cyan-400 font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-white/5 transition-all active:scale-95"
                >
                  <UserCircle size={16} />
                  <span>Entrar como Convidado (Modo Demo)</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'OTP' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-2">
              <h2 className="text-xl font-black italic logo-font text-white uppercase tracking-tighter">Verificação de Chave</h2>
              <p className="text-[10px] font-bold text-yellow-500/60 uppercase tracking-widest">Enviamos um código de acesso para seu terminal.</p>
            </div>

            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="number"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-16 h-20 bg-slate-900/80 border border-white/10 rounded-2xl text-3xl font-black text-center text-white focus:border-yellow-500 focus:outline-none transition-all"
                />
              ))}
            </div>

            {loading && <div className="flex justify-center"><Loader2 className="animate-spin text-yellow-500" size={24} /></div>}
            
            <button 
              onClick={() => setStep('PHONE')}
              className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
            >
              Corrigir Número de Telefone
            </button>
          </div>
        )}

        {step === 'SYNC' && (
          <div className="space-y-8 animate-in fade-in zoom-in-110 duration-700">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40 relative">
               <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
               <Check size={48} className="text-white" strokeWidth={4} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black italic logo-font text-emerald-400 uppercase tracking-tighter">Acesso Concedido</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest animate-pulse">Sincronizando telemetria e biometria...</p>
            </div>
          </div>
        )}

        <div className="pt-10 flex items-center justify-center gap-4 text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
          <ShieldCheck size={12} />
          <span>Protocolo Encriptado</span>
        </div>
      </div>
    </div>
  );
};
