import { useState } from 'react';
import { Wifi } from 'lucide-react';
import { TRANSLATIONS } from '@/translations';
import type { Lang, UserRole } from '@/types';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RoleSelection from '@/components/RoleSelection';
import FarmerView from '@/components/FarmerView';
import OwnerView from '@/components/OwnerView';

export default function App() {
  const [lang, setLang] = useState<Lang>('hi');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);

  const t = TRANSLATIONS[lang];

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-slate-100">
        <RoleSelection t={t} lang={lang} onSelect={setUserRole} />
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
          userRole={userRole}
          setUserRole={setUserRole}
          lowBandwidthMode={lowBandwidthMode}
          setLowBandwidthMode={setLowBandwidthMode}
        />

        {lowBandwidthMode && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl mb-4 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-600" />
              {t.lowBandwidth} - Images simplified for fast load on weak farm networks.
            </span>
            <button onClick={() => setLowBandwidthMode(false)} className="underline text-amber-800">
              Switch to Standard
            </button>
          </div>
        )}

        {userRole === 'farmer' && <FarmerView t={t} lang={lang} />}

        {userRole === 'owner' && <OwnerView t={t} lang={lang} />}

        <Footer />
      </div>
    </div>
  );
}
