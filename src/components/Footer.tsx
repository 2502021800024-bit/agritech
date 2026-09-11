import { Mail, MessageCircle, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-8 bg-slate-900 text-slate-300 rounded-3xl p-5 text-center text-xs space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-bold">
        <span className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" />
          Toll-Free Helpline: <strong className="text-white">1800-KOLD-AGRI</strong>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp Assist: <strong className="text-emerald-400">7990287190</strong>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          Email: <strong className="text-white">dtandon391@gamil.com</strong>
        </span>
      </div>
      <p className="text-[11px] text-slate-500">
        AgriStore+ Cold Chain Network • Developed for Kalpvruksh 2.0 Hackathon • Team Codestrom
      </p>
    </footer>
  );
}
