import { useState, useEffect, useRef } from 'react';
import { Snowflake, Phone, ShieldCheck, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
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

      // Demo mode: show the OTP code since no SMS gateway
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

      // Set the session from the returned tokens
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

  const roleLabel = role === 'farmer' ? t.farmerMode : t.ownerMode;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="w-16 h-16 bg-farm-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-farm-600/30 mx-auto mb-3">
            <Snowflake className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t.appName}</h1>
          <p className="text-sm text-slate-500 font-medium">
            {roleLabel} • {t.loginSubtitle}
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center mb-6">
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

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-lg animate-slide-up">
          {step === 'phone' ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-5 h-5 text-farm-600" />
                <h2 className="text-lg font-extrabold text-slate-900">{t.enterPhone}</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">{t.loginSubtitle}</p>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                placeholder={t.phonePlaceholder}
                className="w-full text-base border-2 border-slate-300 rounded-2xl px-4 py-3.5 focus:border-farm-500 focus:ring-2 focus:ring-farm-500/20 outline-none transition mb-3"
                autoFocus
              />

              {error && (
                <p className="text-xs font-bold text-red-600 mb-3 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-farm-600 hover:bg-farm-700 active:scale-95 text-white font-extrabold py-3.5 rounded-2xl text-base shadow-lg shadow-farm-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
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
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-farm-600" />
                <h2 className="text-lg font-extrabold text-slate-900">{t.enterOtp}</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">
                {t.otpSentDesc} • {formatPhone(phone)}
              </p>

              {demoOtp && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-xl mb-4 text-center animate-fade-in">
                  <p className="text-xs font-bold">
                    Demo Mode: Your OTP is <span className="text-lg font-black tracking-widest">{demoOtp}</span>
                  </p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    (No SMS gateway configured — in production this would be sent via SMS)
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
                className="w-full text-2xl font-black tracking-[0.5em] text-center border-2 border-slate-300 rounded-2xl px-4 py-3.5 focus:border-farm-500 focus:ring-2 focus:ring-farm-500/20 outline-none transition mb-3"
                autoFocus
              />

              {error && (
                <p className="text-xs font-bold text-red-600 mb-3 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full bg-farm-600 hover:bg-farm-700 active:scale-95 text-white font-extrabold py-3.5 rounded-2xl text-base shadow-lg shadow-farm-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer mb-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
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
        </div>

        {/* Back to role selection */}
        <button
          onClick={onBack}
          className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 mt-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
          {t.chooseRole}
        </button>
      </div>
    </div>
  );
}
