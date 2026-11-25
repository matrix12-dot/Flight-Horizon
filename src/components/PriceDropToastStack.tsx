import { CABIN_LABELS } from '@/src/data/aviationData';
import { Currency, PriceDropNotification } from '@/src/types/aviation';
import { formatPrice, getAirportByCode } from '@/src/utils/formatters';
import { ArrowLeft, Plane, TrendingDown, X } from 'lucide-react';

interface PriceDropToastStackProps {
  notifications: PriceDropNotification[];
  currency: Currency;
  onDismiss: (id: string) => void;
  onSelectRoute: (notification: PriceDropNotification) => void;
}

export function PriceDropToastStack({
  notifications,
  currency,
  onDismiss,
  onSelectRoute,
}: PriceDropToastStackProps) {
  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="إشعارات انخفاض الأسعار"
      className="fixed bottom-5 left-5 z-[999] flex flex-col gap-3 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
    >
      {notifications.map((item) => {
        const origin = getAirportByCode(item.origin);
        const dest = getAirportByCode(item.destination);
        const discountPct = Math.max(
          1,
          Math.round(
            ((item.previousPriceUsd - item.newPriceUsd) /
              item.previousPriceUsd) *
              100
          )
        );

        return (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto rounded-2xl bg-white/95 dark:bg-[#0B1224]/95 backdrop-blur-2xl border border-emerald-500/45 dark:border-emerald-400/40 shadow-2xl shadow-slate-900/20 dark:shadow-black/70 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                      انخفض سعر الرحلة!
                    </span>
                    <span className="text-[11px] font-bold font-mono-tabular px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      -{discountPct}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    إشعار تنبيه السعر للمسار المشترك
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                aria-label="إغلاق التنبيه"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  <span>{origin.cityAr}</span>
                  <span className="font-mono-tabular text-sky-600 dark:text-sky-400">
                    ({origin.code})
                  </span>
                  <Plane className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 -scale-x-100 shrink-0" />
                  <span>{dest.cityAr}</span>
                  <span className="font-mono-tabular text-sky-600 dark:text-sky-400">
                    ({dest.code})
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {CABIN_LABELS[item.cabinClass]}
                </div>
              </div>

              <div className="text-left shrink-0">
                <div className="text-[11px] line-through text-slate-400 font-mono-tabular">
                  {formatPrice(item.previousPriceUsd, currency)}
                </div>
                <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 font-mono-tabular">
                  {formatPrice(item.newPriceUsd, currency)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onSelectRoute(item)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>عرض الرحلات بهذا السعر</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
