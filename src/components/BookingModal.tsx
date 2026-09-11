import { X, ShieldCheck } from 'lucide-react';
import type { ColdStorage, Crop, Lang, TranslationDict } from '@/types';

interface BookingModalProps {
  storage: ColdStorage;
  t: TranslationDict;
  lang: Lang;
  selectedCrop: Crop;
  bagQuantity: number;
  durationMonths: number;
  needTransport: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function BookingModal({
  storage,
  t,
  lang,
  selectedCrop,
  bagQuantity,
  durationMonths,
  needTransport,
  onConfirm,
  onClose,
}: BookingModalProps) {
  const totalCost =
    storage.price_per_bag * bagQuantity * durationMonths + (needTransport ? 1200 : 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-slide-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            ⚡ Quick Booking Confirmation
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex justify-between text-xs border-b border-slate-200/60 pb-2">
            <span className="text-slate-500 font-bold">Cold Storage:</span>
            <span className="font-extrabold text-slate-900">{storage.name}</span>
          </div>
          <div className="flex justify-between text-xs border-b border-slate-200/60 pb-2">
            <span className="text-slate-500 font-bold">Selected Crop:</span>
            <span className="font-extrabold text-slate-900">
              {selectedCrop.icon} {selectedCrop.name[lang]}
            </span>
          </div>
          <div className="flex justify-between text-xs border-b border-slate-200/60 pb-2">
            <span className="text-slate-500 font-bold">Quantity & Duration:</span>
            <span className="font-extrabold text-slate-900">
              {bagQuantity} Bags • {durationMonths} Month(s)
            </span>
          </div>
          <div className="flex justify-between text-xs border-b border-slate-200/60 pb-2">
            <span className="text-slate-500 font-bold">Truck Pickup Service:</span>
            <span className="font-extrabold text-farm-700">
              {needTransport ? '✓ Yes (+₹1,200)' : 'Self Transport'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm pt-1">
            <span className="text-slate-700 font-black">Total Payable:</span>
            <span className="text-xl font-black text-farm-700">
              ₹{totalCost.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{t.payAtFacility}</span>
        </div>

        <button
          onClick={onConfirm}
          className="w-full bg-farm-600 hover:bg-farm-700 active:scale-95 text-white font-extrabold py-4 rounded-2xl text-base shadow-lg shadow-farm-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          ✅ Confirm Reservation & Get Receipt
        </button>
      </div>
    </div>
  );
}
