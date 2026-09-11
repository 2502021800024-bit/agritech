import { MapPin, Phone, MessageCircle, Zap, Snowflake, Droplets, Package, Star, User } from 'lucide-react';
import type { ColdStorage, Crop, Lang, TranslationDict } from '@/types';

interface StorageCardProps {
  storage: ColdStorage;
  t: TranslationDict;
  lang: Lang;
  selectedCrop: Crop;
  bagQuantity: number;
  durationMonths: number;
  needTransport: boolean;
  onBook: (storage: ColdStorage) => void;
}

export default function StorageCard({
  storage,
  t,
  lang,
  selectedCrop,
  bagQuantity,
  durationMonths,
  needTransport,
  onBook,
}: StorageCardProps) {
  const totalEstCost =
    storage.price_per_bag * bagQuantity * durationMonths + (needTransport ? 1200 : 0);

  const waText = encodeURIComponent(
    `Hello I want to book cold storage space for ${bagQuantity} bags of ${selectedCrop.name.en}`,
  );
  const waPhone = storage.phone.replace(/[^0-9]/g, '');

  return (
    <div className="bg-slate-50 hover:bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200 hover:border-farm-500 transition-all hover:shadow-md relative overflow-hidden">
      {/* Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-chilly-100 text-chilly-800 text-[10px] font-black px-2.5 py-1 rounded-md border border-chilly-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-chilly-500 animate-pulse" />
            {t.liveSensors}
          </span>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            {storage.rating} / 5.0
          </span>
        </div>
        <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1">
          <User className="w-3 h-3" />
          {storage.owner_name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Info */}
        <div className="md:col-span-2 space-y-1">
          <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
            {storage.name}
          </h4>
          <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            {storage.location}
          </p>

          {/* Telemetry */}
          <div className="pt-2 flex flex-wrap gap-2">
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <Snowflake className="w-3.5 h-3.5 text-chilly-600" />
              <span className="text-chilly-600 font-bold">{t.temp}:</span>
              <strong className="text-slate-900 font-extrabold">{storage.temp_current}</strong>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-600 font-bold">{t.humidity}:</span>
              <strong className="text-slate-900 font-extrabold">{storage.humidity_current}</strong>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <Package className="w-3.5 h-3.5 text-farm-700" />
              <span className="text-farm-700 font-bold">{t.freeSpace}:</span>
              <strong className="text-slate-900 font-extrabold">{storage.capacity_free} Tonnes</strong>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between text-right">
          <div>
            <span className="text-2xl font-black text-farm-700">₹{storage.price_per_bag}</span>
            <span className="text-xs font-bold text-slate-500">{t.pricePerBag}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">
              Estimated Total Cost
            </span>
            <span className="text-lg font-black text-slate-900">
              ₹{totalEstCost.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 block">
              ({bagQuantity} bags x {durationMonths} month{durationMonths > 1 ? 's' : ''})
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href={`tel:${storage.phone}`}
            className="flex-1 sm:flex-initial bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-extrabold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            {t.callOwner}
          </a>
          <a
            href={`https://wa.me/${waPhone}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-extrabold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {t.whatsapp}
          </a>
        </div>

        <button
          onClick={() => onBook(storage)}
          className="w-full sm:w-auto bg-farm-600 hover:bg-farm-700 active:scale-95 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-md shadow-farm-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          {t.bookNow}
        </button>
      </div>
    </div>
  );
}
