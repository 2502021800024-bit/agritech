import { useState } from 'react';
import { Wifi, LogOut, Phone, Snowflake } from 'lucide-react';
import { TRANSLATIONS } from '@/translations';
import type { Lang, UserRole } from '@/types';
import { useAuth } from '@/useAuth';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RoleSelection from '@/components/RoleSelection';
import AuthScreen from '@/components/AuthScreen';
import FarmerView from '@/components/FarmerView';
import OwnerView from '@/components/OwnerView';

type Screen = 'role' | 'auth' | 'app';

export default function App() {
  const [lang, setLang] = useState<Lang>('hi');
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [screen, setScreen] = useState<Screen>('role');
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);

  const { session, profile, loading, signOut } = useAuth();

  const t = TRANSLATIONS[lang];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (session) {
      setScreen('app');
    } else {
      setScreen('auth');
    }
  };

  const handleAuthSuccess = () => {
    setScreen('app');
  };

  const handleSignOut = async () => {
    await signOut();
    setScreen('role');
  };

  if (loading && screen === 'role') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 bg-farm-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-farm-600/30 animate-pulse">
          <Snowflake className="w-7 h-7" />
        </div>
        <p className="text-sm font-bold text-slate-400">{t.appName}</p>
      </div>
    );
  }

  const effectiveRole = profile?.role ?? selectedRole;

  if (screen === 'role') {
    return (
      <div className="min-h-screen bg-slate-100">
        <RoleSelection t={t} lang={lang} setLang={setLang} onSelect={handleRoleSelect} />
      </div>
    );
  }

  if (screen === 'auth') {
    return (
      <div className="min-h-screen bg-slate-100">
        <AuthScreen
          t={t}
          lang={lang}
          setLang={setLang}
          role={selectedRole}
          onSuccess={handleAuthSuccess}
          onBack={() => setScreen('role')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-4xl mx-auto pb-24 px-3 sm:px-6 pt-4">
        <Header
          t={t}
          lang={lang}
          setLang={setLang}
          userRole={effectiveRole}
          setUserRole={(role) => {
            setSelectedRole(role);
          }}
          lowBandwidthMode={lowBandwidthMode}
          setLowBandwidthMode={setLowBandwidthMode}
        />

        {lowBandwidthMode && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl mb-4 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-600" />
              {t.lowBandwidth} - Images simplified for fast load on weak farm networks.
            </span>
            <button onClick={() => setLowBandwidthMode(false)} className="underline text-amber-800">
              Switch to Standard
            </button>
          </div>
        )}

        {session && (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between text-xs animate-fade-in">
            <span className="flex items-center gap-2 font-bold text-slate-600">
              <Phone className="w-3.5 h-3.5 text-farm-600" />
              {profile?.phone ?? session.user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 font-bold text-red-600 hover:text-red-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.logout}
            </button>
          </div>
        )}

        <div key={effectiveRole} className="animate-fade-in">
          {effectiveRole === 'farmer' && <FarmerView t={t} lang={lang} />}
          {effectiveRole === 'owner' && <OwnerView t={t} lang={lang} />}
        </div>

        <Footer />
      </div>
    </div>
  );
}
