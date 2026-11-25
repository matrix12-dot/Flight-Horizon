import { useEffect, useState } from 'react';
import { CABIN_LABELS } from '@/src/data/aviationData';
import {
  CabinClass,
  Currency,
  RoutePriceAlert,
  UserAccount,
} from '@/src/types/aviation';
import { formatPrice, getAirportByCode } from '@/src/utils/formatters';
import {
  Bell,
  BellOff,
  BellRing,
  Check,
  LogIn,
  Plane,
  Sparkles,
  Trash2,
  TrendingDown,
  X,
} from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  currentOrigin: string;
  currentDestination: string;
  currentCabinClass: CabinClass;
  currentLowestPriceUsd: number;
  currency: Currency;
  alerts: RoutePriceAlert[];
  onSubscribe: (
    payload: Omit<RoutePriceAlert, 'id' | 'userId' | 'createdAt'>
  ) => void;
  onToggleAlert: (alertId: string) => void;
  onDeleteAlert: (alertId: string) => void;
  onSimulateDrop: (alert: RoutePriceAlert) => void;
  alertsEnabledInSettings: boolean;
}

export function PriceAlertModal({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  currentOrigin,
  currentDestination,
  currentCabinClass,
  currentLowestPriceUsd,
  currency,
  alerts,
  onSubscribe,
  onToggleAlert,
  onDeleteAlert,
  onSimulateDrop,
  alertsEnabledInSettings,
}: PriceAlertModalProps) {
  const suggestedTarget = Math.max(
    45,
    Math.round(currentLowestPriceUsd * 0.85)
  );
  const [targetPriceUsd, setTargetPriceUsd] = useState<number>(suggestedTarget);
  const [justSubscribed, setJustSubscribed] = useState(false);

  useEffect(() => {
    setTargetPriceUsd(Math.max(45, Math.round(currentLowestPriceUsd * 0.85)));
    setJustSubscribed(false);
  }, [currentOrigin, currentDestination, currentCabinClass, currentLowestPriceUsd, isOpen]);

  if (!isOpen) return null;

  const originAirport = getAirportByCode(currentOrigin);
  const destAirport = getAirportByCode(currentDestination);

  const existingRouteAlert = alerts.find(
    (a) =>
      a.origin === currentOrigin &&
      a.destination === currentDestination &&
      a.cabinClass === currentCabinClass
  );

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const clampedTarget = Math.max(
      30,
      Math.min(currentLowestPriceUsd - 5, Math.round(targetPriceUsd))
    );
    onSubscribe({
      origin: currentOrigin,
      destination: currentDestination,
      cabinClass: currentCabinClass,
      baselinePriceUsd: currentLowestPriceUsd,
      targetPriceUsd: clampedTarget,
      isActive: true,
    });
    setJustSubscribed(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تنبيهات انخفاض الأسعار"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0B1224] border border-slate-200 dark:border-sky-400/25 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 dark:border-sky-400/30 flex items-center justify-center text-sky-700 dark:text-sky-300">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                تنبيهات انخفاض أسعار الرحلات
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اشترك لتصلك إشعارات فورية عند انخفاض أسعار مساراتك المفضلة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {!currentUser ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-center space-y-4">
              <Bell className="w-10 h-10 text-sky-600 dark:text-sky-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ميزة مخصصة للمسافرين المسجلين
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  سجّل دخولك أولاً لتفعيل تنبيهات الأسعار وحفظ المسارات التي ترغب بمراقبة تذاكرها.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول الآن</span>
              </button>
            </div>
          ) : (
            <>
              {!alertsEnabledInSettings && (
                <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
                  تنبيهات الرحلات التلقائية معطلة حالياً في إعدادات الموقع؛ يمكنك إعادة تفعيلها من تبويب «التفضيلات»، أو استخدام زر «محاكاة انخفاض السعر» لاختبار الإشعار مباشرة.
                </div>
              )}

              {/* Current Route Subscription Card */}
              <form
                onSubmit={handleSubscribeSubmit}
                className="rounded-2xl p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/65 border border-slate-200 dark:border-white/10 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono-tabular text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10">
                      {originAirport.cityAr} ({currentOrigin})
                    </span>
                    <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400 -scale-x-100 shrink-0" />
                    <span className="font-mono-tabular text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10">
                      {destAirport.cityAr} ({currentDestination})
                    </span>
                    <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                      · {CABIN_LABELS[currentCabinClass]}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    أقل سعر حالي:{' '}
                    <strong className="font-mono-tabular text-slate-900 dark:text-white">
                      {formatPrice(currentLowestPriceUsd, currency)}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6 space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      السعر المستهدف للتنبيه (USD)
                    </label>
                    <input
                      type="number"
                      min={30}
                      max={Math.max(35, currentLowestPriceUsd - 5)}
                      value={targetPriceUsd}
                      onChange={(e) =>
                        setTargetPriceUsd(Number(e.target.value) || 30)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 text-sm font-bold font-mono-tabular text-slate-900 dark:text-white focus:outline-none focus:border-sky-400"
                    />
                    {currency === 'IQD' && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-tabular">
                        يعادل تقريباً {formatPrice(targetPriceUsd, 'IQD')}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-6 flex flex-wrap items-center gap-2">
                    {[
                      { pct: 10, label: '-10%' },
                      { pct: 15, label: '-15%' },
                      { pct: 20, label: '-20%' },
                    ].map((preset) => {
                      const val = Math.max(
                        30,
                        Math.round(
                          currentLowestPriceUsd * (1 - preset.pct / 100)
                        )
                      );
                      return (
                        <button
                          key={preset.pct}
                          type="button"
                          onClick={() => setTargetPriceUsd(val)}
                          className={`px-3 py-2 rounded-xl border text-xs font-mono-tabular font-semibold transition-colors cursor-pointer ${
                            targetPriceUsd === val
                              ? 'border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-200'
                              : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-sky-400/50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}

                    <button
                      type="submit"
                      className="flex-1 min-w-[150px] px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {existingRouteAlert ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تحديث التنبيه</span>
                        </>
                      ) : (
                        <>
                          <BellRing className="w-4 h-4" />
                          <span>تفعيل التنبيه</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {justSubscribed && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/12 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      تم حفظ اشتراكك! ستصلك رسالة تنبيه فورية خلال ثوانٍ عند رصد أي انخفاض في سعر هذا المسار.
                    </span>
                  </div>
                )}
              </form>

              {/* Subscribed Routes List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    المسارات التي تتابعها ({alerts.length})
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    الحساب: {currentUser.email}
                  </span>
                </div>

                {alerts.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-white/15 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    لا توجد تنبيهات مسجلة بعد. فعّل التنبيه للمسار أعلاه لتصلك إشعارات انخفاض الأسعار.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {alerts.map((alert) => {
                      const o = getAirportByCode(alert.origin);
                      const d = getAirportByCode(alert.destination);
                      return (
                        <div
                          key={alert.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/55 border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                              <span>
                                {o.cityAr} (
                                <span className="font-mono-tabular text-sky-700 dark:text-sky-300">
                                  {alert.origin}
                                </span>
                                )
                              </span>
                              <span className="text-slate-400">←</span>
                              <span>
                                {d.cityAr} (
                                <span className="font-mono-tabular text-sky-700 dark:text-sky-300">
                                  {alert.destination}
                                </span>
                                )
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                · {CABIN_LABELS[alert.cabinClass]}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                              <span>
                                السعر الأساسي:{' '}
                                <strong className="font-mono-tabular text-slate-800 dark:text-slate-200">
                                  {formatPrice(alert.baselinePriceUsd, currency)}
                                </strong>
                              </span>
                              <span>
                                المستهدف:{' '}
                                <strong className="font-mono-tabular text-emerald-700 dark:text-emerald-300">
                                  {formatPrice(alert.targetPriceUsd, currency)}
                                </strong>
                              </span>
                              <span
                                className={
                                  alert.isActive
                                    ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                                    : 'text-slate-400'
                                }
                              >
                                {alert.isActive ? '● نشط' : '○ متوقف مؤقتاً'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onSimulateDrop(alert)}
                              className="px-3 py-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/12 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>محاكاة انخفاض السعر</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onToggleAlert(alert.id)}
                              title={
                                alert.isActive ? 'إيقاف مؤقت' : 'إعادة تفعيل'
                              }
                              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-sky-400/50 text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              {alert.isActive ? (
                                <Bell className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                              ) : (
                                <BellOff className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteAlert(alert.id)}
                              title="حذف التنبيه"
                              className="p-2 rounded-xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
