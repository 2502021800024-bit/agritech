import { useState } from 'react';
import { Mic, Send } from 'lucide-react';
import type { TranslationDict } from '@/types';

interface VoiceOverlayProps {
  t: TranslationDict;
  voiceMessage: string;
  onTextSubmit: (text: string) => void;
  onClose: () => void;
}

export default function VoiceOverlay({
  voiceMessage,
  onTextSubmit,
  onClose,
}: VoiceOverlayProps) {
  const [textInput, setTextInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onTextSubmit(textInput);
      setTextInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-slide-up">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-md animate-pulse">
          <Mic className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900">Voice Assistant Active</h3>
        <p className="text-sm font-semibold text-slate-600 bg-slate-100 p-3 rounded-xl min-h-[3rem] flex items-center justify-center">
          {voiceMessage}
        </p>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder='e.g. "200 बोरी गाजर" or "100 bags grapes"'
              className="flex-1 text-sm border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-farm-500 outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="bg-farm-600 hover:bg-farm-700 text-white rounded-xl px-3 py-2.5 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
