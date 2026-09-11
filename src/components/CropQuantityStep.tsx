import { Minus, Plus } from 'lucide-react';
import type { Crop, Lang, TranslationDict } from '@/types';
import { CROPS, getVehicleSuggestion } from '@/data';

interface CropQuantityStepProps {
  t: TranslationDict;
  lang: Lang;
  selectedCrop: Crop;
  setSelectedCrop: (crop: Crop) => void;
  bagQuantity: number;
  setBagQuantity: (qty: number) => void;
  durationMonths: number;
  setDurationMonths: (months: number) => void;
  needTransport: boolean;
  setNeedTransport: (val: boolean) => void;
}

export default function CropQuantityStep({
  t,
  lang,
  selectedCrop,
  setSelectedCrop,
  bagQuantity,
  setBagQuantity,
  durationMonths,
  setDurationMonths,
  needTransport,
  setNeedTransport,
}: CropQuantityStepProps) {
  const vehicle = getVehicleSuggestion(bagQuantity);
  const monthLabel = lang === 'hi' ? 'महीना' : lang === 'gu' ? 'મહિના' : 'Month';

  return (
    <>
      {/* Step 1: Crop Picker */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 bg-farm-100 text-farm-700 rounded-lg flex items-center justify-center font-black text-sm">
              1
            </span>
            {t.selectCrop}
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Target Temp: <strong className="text-chilly-700">{selectedCrop.temp}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CROPS.map((crop) => {
            const isSelected = selectedCrop.id === crop.id;
            return (
              <button
                key={crop.id}
                onClick={() => setSelectedCrop(crop)}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-farm-600 bg-farm-50/90 shadow-md scale-105 ring-2 ring-farm-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="text-3xl mb-1">{crop.icon}</span>
                <span className="font-extrabold text-sm text-slate-900 leading-tight">
                  {crop.name[lang] || crop.name.en}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 mt-1">{crop.temp}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Quantity & Duration */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 bg-farm-100 text-farm-700 rounded-lg flex items-center justify-center font-black text-sm">
              2
            </span>
            {t.selectQty}
          </h3>
          <span className="text-xs font-bold text-chilly-800 bg-chilly-50 border border-chilly-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <span>{vehicle.icon}</span>
            {vehicle.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Bags Counter */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              {t.bags}
            </label>

            <div className="flex items-center justify-between gap-3 mb-3">
              <button
                onClick={() => setBagQuantity(Math.max(20, bagQuantity - 20))}
                className="w-12 h-12 bg-white hover:bg-red-50 text-red-600 border border-slate-300 rounded-2xl shadow-sm active:scale-95 transition flex items-center justify-center"
              >
                <Minus className="w-5 h-5" strokeWidth={3} />
              </button>

              <div className="text-center">
                <span className="text-3xl font-black text-slate-900">{bagQuantity}</span>
                <span className="text-xs text-slate-500 font-bold block">
                  (~{((bagQuantity * 50) / 1000).toFixed(1)} Tonnes)
                </span>
              </div>

              <button
                onClick={() => setBagQuantity(bagQuantity + 20)}
                className="w-12 h-12 bg-farm-600 hover:bg-farm-700 text-white rounded-2xl shadow-md shadow-farm-600/30 active:scale-95 transition flex items-center justify-center"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            <div className="flex gap-2 justify-center">
              {[50, 100, 250, 500].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBagQuantity(preset)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-extrabold transition ${
                    bagQuantity === preset
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {preset} Bags
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Transport */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              {lang === 'hi' ? 'रखने की अवधि' : lang === 'gu' ? 'સંગ્રહ અવધિ' : 'Storage Duration'}
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[1, 2, 3, 6].map((m) => (
                <button
                  key={m}
                  onClick={() => setDurationMonths(m)}
                  className={`py-2.5 rounded-xl text-center font-black text-xs transition cursor-pointer border ${
                    durationMonths === m
                      ? 'bg-chilly-600 text-white border-chilly-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {m} {monthLabel}
                  {m > 1 && lang === 'en' ? 's' : ''}
                </button>
              ))}
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                🚚 {t.transportNeeded}
              </span>
              <button
                onClick={() => setNeedTransport(!needTransport)}
                className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border transition ${
                  needTransport
                    ? 'bg-farm-600 text-white border-farm-600 shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                {needTransport ? '✓ ' + t.yesTransport : t.noTransport}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
