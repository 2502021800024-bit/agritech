import { Snowflake, Sprout, Warehouse, ArrowRight } from 'lucide-react';
import type { Lang, TranslationDict, UserRole } from '@/types';

interface RoleSelectionProps {
  t: TranslationDict;
  lang: Lang;
  setLang: (lang: Lang) => void;
  onSelect: (role: UserRole) => void;
}

export default function RoleSelection({ t, lang, setLang, onSelect }: RoleSelectionProps) {
  const langButtons: { key: Lang; label: string }[] = [
    { key: 'hi', label: 'हिंदी' },
    { key: 'gu', label: 'ગુજરાતી' },
    { key: 'en', label: 'ENG' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Language Selector - Top Right */}
        <div className="flex justify-end mb-6">
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
        {/* Logo & Welcome */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-farm-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-farm-600/30 mx-auto mb-4">
            <Snowflake className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.chooseRole}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-2">
            {t.chooseRoleDesc}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-slide-up">
          {/* Farmer Card */}
          <button
            onClick={() => onSelect('farmer')}
            className="group bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-farm-500 shadow-sm hover:shadow-xl transition-all text-left active:scale-[0.98] cursor-pointer"
          >
            <div className="w-16 h-16 bg-farm-100 text-farm-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-farm-600 group-hover:text-white transition-colors">
              <Sprout className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">{t.roleFarmer}</h2>
            <p className="text-sm text-slate-500 font-medium mb-4">{t.roleFarmerDesc}</p>
            <div className="flex items-center gap-1.5 text-farm-700 font-bold text-sm">
              {t.enterApp}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Owner Card */}
          <button
            onClick={() => onSelect('owner')}
            className="group bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-chilly-500 shadow-sm hover:shadow-xl transition-all text-left active:scale-[0.98] cursor-pointer"
          >
            <div className="w-16 h-16 bg-chilly-100 text-chilly-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-chilly-600 group-hover:text-white transition-colors">
              <Warehouse className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">{t.roleOwner}</h2>
            <p className="text-sm text-slate-500 font-medium mb-4">{t.roleOwnerDesc}</p>
            <div className="flex items-center gap-1.5 text-chilly-700 font-bold text-sm">
              {t.enterApp}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {['🎙️ Voice Booking', '❄️ IoT Live Sensors', '📱 Hindi / Gujarati / English', '🚚 Transport'].map(
            (badge) => (
              <span
                key={badge}
                className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full"
              >
                {badge}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
