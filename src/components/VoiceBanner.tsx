import { Mic } from 'lucide-react';
import type { Lang } from '@/types';

interface VoiceBannerProps {
  lang: Lang;
  onVoiceCommand: () => void;
}

export default function VoiceBanner({ lang, onVoiceCommand }: VoiceBannerProps) {
  const heading =
    lang === 'hi'
      ? 'फॉर्म भरने की जरूरत नहीं!'
      : lang === 'gu'
        ? 'ફોર્મ ભરવાની જરૂર નથી!'
        : 'No Form Filling Required!';

  const subheading =
    lang === 'hi'
      ? 'अपनी भाषा में बोलें और तुरंत सही कोल्ड स्टोरेज खोजें।'
      : lang === 'gu'
        ? 'તમારી ભાષામાં બોલો અને તરત જ યોગ્ય કોલ્ડ સ્ટોરેજ શોધો.'
        : 'Speak crop name & bag count to automatically find available storage.';

  return (
    <div className="bg-gradient-to-r from-farm-700 via-farm-600 to-chilly-700 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="space-y-1 text-center sm:text-left z-10">
        <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-bold mb-1">
          🎙️ Easy Audio Command / आवाज से बोलें
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold">{heading}</h2>
        <p className="text-xs sm:text-sm text-farm-100 font-medium">{subheading}</p>
        <p className="text-[10px] text-white/80 font-semibold">
          Try potato, tomato, carrot, cabbage, peas, grapes, mango, orange, papaya and more.
        </p>
      </div>

      <button
        onClick={onVoiceCommand}
        className="z-10 bg-white text-farm-800 hover:bg-farm-50 active:scale-95 transition-all font-extrabold px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-base w-full sm:w-auto justify-center cursor-pointer border-2 border-white/50"
      >
        <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm animate-bounce">
          <Mic className="w-4 h-4" />
        </span>
        {lang === 'hi' ? 'बोलकर बताएं (Voice)' : lang === 'gu' ? 'બોલીને કહો (Voice)' : 'Speak Crop & Quantity'}
      </button>

      <div className="absolute -right-8 -bottom-10 text-white/10 text-9xl font-black select-none pointer-events-none">
        🚜
      </div>
    </div>
  );
}
