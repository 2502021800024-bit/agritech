import { useState, useEffect, useRef } from 'react';
import {
  Snowflake,
  Phone,
  ShieldCheck,
  Loader2,
  ArrowRight,
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import type { Lang, TranslationDict, UserRole } from '@/types';

interface AuthScreenProps {
  t: TranslationDict;
  lang: Lang;
  setLang: (lang: Lang) => void;
  role: UserRole;
  onSuccess: () => void;
  onBack: () => void;
}

export default function AuthScreen({ t, lang, setLang, role, onSuccess, onBack }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<number | null>(null);

  const langButtons: { key: Lang; label: string }[] = [
    { key: 'hi', label: 'हिंदी' },
    { key: 'gu', label: 'ગુજરાતી' },
    { key: 'en', label: 'ENG' },
  ];

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = window.setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [resendTimer]);

  const formatPhone = (raw: string): string => {
    let cleaned = raw.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 10) {
        cleaned = '+91' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }
    return cleaned;
  };

  const handleSendOtp = async () => {
    setError('');
    const formattedPhone = formatPhone(phone);
    if (formattedPhone.length < 10) {
      setError(t.phoneRequired);
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError(t.phoneRequired);
      return;
    }

    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || t.loginError);
        setLoading(false);
        return;
      }

      if (data.code) {
        setDemoOtp(data.code);
      }
      setStep('otp');
      setResendTimer(30);
    } catch {
      setError(t.loginError);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length !== 6) {
      setError(t.invalidOtp);
      return;
    }

    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const formattedPhone = formatPhone(phone);
      const response = await fetch(`${supabaseUrl}/functions/v1/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, code: otp, role }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || t.invalidOtp);
        setLoading(false);
        return;
      }

      if (data.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (sessionError) {
          setError(t.loginError);
          setLoading(false);
          return;
        }

        // If registering, update profile with name
        if (mode === 'register' && name.trim()) {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            await supabase
              .from('user_profiles')
              .update({ full_name: name.trim() })
              .eq('id', userData.user.id);
          }
        }
      }
      onSuccess();
    } catch {
      setError(t.loginError);
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtp('');
    setDemoOtp('');
    await handleSendOtp();
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setStep('phone');
    setOtp('');
    setDemoOtp('');
    setError('');
  };

  const roleLabel = role === 'farmer' ? t.farmerMode : t.ownerMode;
  const isRegister = mode === 'register';
  const title = isRegister ? t.registerTitle : t.loginTitle;
  const subtitle = isRegister ? t.registerSubtitle : t.loginSubtitle;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="w-16 h-16 bg-farm-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-farm-600/30 mx-auto mb-3">
            <Snowflake className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t.appName}</h1>
          <div className="inline-flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-farm-700 bg-farm-100 px-2.5 py-0.5 rounded-full">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center mb-5">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {langButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setLang(btn.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  lang === btn.key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm mb-5 mx-auto max-w-[280px]">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-extrabold transition flex items-center justify-center gap-1.5 ${
              !isRegister
                ? 'bg-farm-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {t.loginBtn}
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 rounded-lg text-sm font-extrabold transition flex items-center justify-center gap-1.5 ${
              isRegister
                ? 'bg-farm-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {t.registerBtn}
          </button>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-lg animate-slide-up">
          {/* Title */}
          <h2 className="text-xl font-extrabold text-slate-900 mb-1 text-center">{title}</h2>
          <p className="text-xs text-slate-500 font-medium mb-5 text-center">{subtitle}</p>

          {step === 'phone' ? (
            <>
              {/* Name field for register */}
              {isRegister && (
                <div className="relative mb-3">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full text-sm border-2 border-slate-300 rounded-2xl pl-11 pr-4 py-3 focus:border-farm-500 focus:ring-2 focus:ring-farm-500/20 outline-none transition"
                  />
                </div>
              )}

              {/* Phone input */}
              <div className="relative mb-3">
                <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  placeholder={t.phonePlaceholder}
                  className="w-full text-sm border-2 border-slate-300 rounded-2xl pl-11 pr-4 py-3 focus:border-farm-500 focus:ring-2 focus:ring-farm-500/20 outline-none transition"
                  autoFocus
                />
              </div>

              {/* Privacy note */}
              <div className="flex items-center gap-1.5 mb-4 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <p className="text-[11px] font-medium">{t.privacyNote}</p>
              </div>

              {error && (
                <p className="text-xs font-bold text-red-600 mb-3 bg-red-50 px-3 py-2 rounded-lg animate-fade-in">
                  {error}
                </p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-farm-600 hover:bg-farm-700 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-2xl text-base shadow-lg shadow-farm-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.sending}
                  </>
                ) : (
                  <>
                    {t.sendOtp}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* OTP step */}
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-farm-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-7 h-7 text-farm-600" />
                </div>
                <p className="text-sm font-bold text-slate-700">{t.otpSent}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formatPhone(phone)}</p>
              </div>

              {demoOtp && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-xl mb-4 text-center animate-fade-in">
                  <p className="text-xs font-bold">
                    Demo: Your OTP is{' '}
                    <span className="text-lg font-black tracking-widest">{demoOtp}</span>
                  </p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    (No SMS gateway — in production this would be sent via SMS)
                  </p>
                </div>
              )}

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                placeholder={t.otpPlaceholder}
                className="w-full text-2xl font-black tracking-[0.4em] text-center border-2 border-slate-300 rounded-2xl px-4 py-3.5 focus:border-farm-500 focus:ring-2 focus:ring-farm-500/20 outline-none transition mb-3"
                autoFocus
              />

              {error && (
                <p className="text-xs font-bold text-red-600 mb-3 bg-red-50 px-3 py-2 rounded-lg animate-fade-in">
                  {error}
                </p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full bg-farm-600 hover:bg-farm-700 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-2xl text-base shadow-lg shadow-farm-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mb-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.verifying}
                  </>
                ) : (
                  <>
                    {t.verifyLogin}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setDemoOtp('');
                    setError('');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t.changePhone}
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className="text-xs font-bold text-farm-700 hover:text-farm-800 disabled:text-slate-400 transition"
                >
                  {resendTimer > 0 ? `${t.resendOtp} (${resendTimer}s)` : t.resendOtp}
                </button>
              </div>
            </>
          )}

          {/* Mode switch link at bottom */}
          <div className="text-center mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => switchMode(isRegister ? 'login' : 'register')}
              className="text-xs font-bold text-farm-700 hover:text-farm-800 transition"
            >
              {isRegister ? t.alreadyHave : t.newHere}{' '}
              <span className="underline">
                {isRegister ? t.loginBtn : t.registerBtn}
              </span>
            </button>
          </div>
        </div>

        {/* Back to role selection */}
        <button
          onClick={onBack}
          className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 mt-4 transition flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t.chooseRole}
        </button>
      </div>
    </div>
  );
}
