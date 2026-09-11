import { Printer, Check } from 'lucide-react';
import type { ReceiptData, Lang, TranslationDict } from '@/types';

interface ReceiptModalProps {
  receipt: ReceiptData;
  t: TranslationDict;
  lang: Lang;
  onDone: () => void;
}

export default function ReceiptModal({ receipt, t, lang, onDone }: ReceiptModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border-2 border-farm-500 animate-slide-up">
        <div className="w-16 h-16 bg-farm-100 text-farm-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <Check className="w-8 h-8" strokeWidth={3} />
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">{t.bookingSuccess}</h3>
          <p className="text-xs text-slate-500 font-bold mt-1">
            SMS & WhatsApp confirmation sent to farmer mobile.
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl text-left space-y-3 relative overflow-hidden shadow-md">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
              {t.tokenNo}
            </span>
            <span className="text-lg font-black text-farm-400">{receipt.token}</span>
          </div>

          <div className="text-xs space-y-1">
            <p>
              <strong className="text-slate-400">Facility:</strong> {receipt.storage.name}
            </p>
            <p>
              <strong className="text-slate-400">Crop:</strong> {receipt.crop.icon}{' '}
              {receipt.crop.name[lang]}
            </p>
            <p>
              <strong className="text-slate-400">Quantity:</strong> {receipt.bags} Bags (~
              {((receipt.bags * 50) / 1000).toFixed(1)} Tonnes)
            </p>
            <p>
              <strong className="text-slate-400">Date:</strong> {receipt.date} at {receipt.time}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
            <span className="text-xs text-slate-400">Estimated Total:</span>
            <span className="text-base font-black text-white">
              ₹{receipt.totalEstimatedCost.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print / Save Token
          </button>
          <button
            onClick={onDone}
            className="flex-1 bg-farm-600 hover:bg-farm-700 text-white font-extrabold py-3 rounded-xl text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
