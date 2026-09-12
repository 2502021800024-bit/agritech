import { Snowflake, Wifi, Sprout, Warehouse } from 'lucide-react';
import type { Lang, TranslationDict, UserRole } from '@/types';

interface HeaderProps {
  t: TranslationDict;
  lang: Lang;
  setLang: (lang: Lang) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  lowBandwidthMode: boolean;
  setLowBandwidthMode: (val: boolean) => void;
}

export default function Header({
  t,
  lang,
  setLang,
  userRole,
  setUserRole,
  lowBandwidthMode,
  setLowBandwidthMode,
}: HeaderProps) {
  const langButtons: { key: Lang; label: string }[] = [
    { key: 'hi', label: 'हिंदी' },
    { key: 'gu', label: 'ગુજરાતી' },
    { key: 'en', label: 'ENG' },
  ];

  return (
    <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-farm-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-farm-600/30">
            <Snowflake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              {t.appName}
              <span className="bg-chilly-100 text-chilly-700 text-xs px-2 py-0.5 rounded-full font-bold border border-chilly-200">
                2.0 Live
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">{t.appTagline}</p>
          </div>
        </div>

        <button
          onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
          className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 sm:hidden ${
            lowBandwidthMode
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <Wifi className="w-3 h-3" />
          {lowBandwidthMode ? '2G Lite' : '4G HD'}
        </button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setUserRole('farmer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              userRole === 'farmer'
                ? 'bg-farm-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            {t.farmerMode}
          </button>
          <button
            onClick={() => setUserRole('owner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              userRole === 'owner'
                ? 'bg-chilly-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            {t.ownerMode}
          </button>
        </div>

        {/* Language Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {langButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setLang(btn.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
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
    </header>
  );
}
