import { AppTab } from '@/src/types/aviation';
import { Compass, MessageSquare } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: AppTab) => void;
  onOpenContact: () => void;
}

export function Footer({ onNavigate, onOpenContact }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-white/75 dark:bg-[#050814]/90 mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Compass className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">أفق للطيران</span>
            <span className="mx-2 text-slate-400 dark:text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              جميع الحقوق محفوظة من STARK4 © {new Date().getFullYear()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm">
          <button
            type="button"
            onClick={() => onNavigate('search')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            حجز الرحلات
          </button>
          <button
            type="button"
            onClick={() => onNavigate('radar')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            تتبع الطيران
          </button>
          <button
            type="button"
            onClick={() => onNavigate('trips')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            رحلاتي المحفوظة
          </button>

          <button
            type="button"
            onClick={onOpenContact}
            className="px-4 py-2 rounded-xl border border-sky-500/35 dark:border-sky-400/35 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>تواصل معنا</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
