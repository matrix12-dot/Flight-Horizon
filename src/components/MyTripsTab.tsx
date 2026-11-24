import { useState } from 'react';
import { AirlineEmblem } from '@/src/components/AirlineEmblem';
import { AIRLINES, CABIN_LABELS } from '@/src/data/aviationData';
import { BookedTrip, Currency } from '@/src/types/aviation';
import { downloadBoardingPassPng } from '@/src/utils/boardingPassExport';
import {
  formatDateAr,
  formatPrice,
  getAirportByCode,
} from '@/src/utils/formatters';
import {
  Download,
  Plane,
  QrCode,
  Search,
  Ticket,
  Trash2,
} from 'lucide-react';

interface MyTripsTabProps {
  trips: BookedTrip[];
  currency: Currency;
  onViewBoardingPass: (trip: BookedTrip) => void;
  onCancelTrip: (tripId: string) => void;
  onGoToSearch: () => void;
}

export function MyTripsTab({
  trips,
  currency,
  onViewBoardingPass,
  onCancelTrip,
  onGoToSearch,
}: MyTripsTabProps) {
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDirectDownload = async (trip: BookedTrip) => {
    setDownloadingId(trip.id);
    try {
      await downloadBoardingPassPng(trip);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-3xl p-5 sm:p-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            رحلاتي المحفوظة
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            جميع حجوزاتك وبطاقات الصعود الإلكترونية محفوظة محلياً للوصول السريع في أي وقت.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToSearch}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          <span>حجز رحلة جديدة</span>
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="glass-surface rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/25 dark:border-sky-400/25 flex items-center justify-center mx-auto text-sky-600 dark:text-sky-300">
            <Ticket className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              لا توجد رحلات محفوظة حتى الآن
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              عند حجز أي رحلة وإصدار بطاقة الصعود الإلكترونية، ستظهر هنا مباشرة مع رمز الاستجابة السريعة (QR) وإمكانية التحميل أو الإلغاء.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToSearch}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-sm transition-colors cursor-pointer"
          >
            <Plane className="w-4 h-4 -scale-x-100" />
            <span>استكشاف الرحلات المتاحة</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {trips.map((trip) => {
            const origin = getAirportByCode(trip.flight.origin);
            const dest = getAirportByCode(trip.flight.destination);
            const airline = AIRLINES[trip.flight.airlineCode];
            const isConfirming = confirmCancelId === trip.id;

            return (
              <article
                key={trip.id}
                className="glass-surface rounded-3xl p-5 sm:p-6 space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <AirlineEmblem
                        airlineCode={trip.flight.airlineCode}
                        size="sm"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {airline?.nameAr} ·{' '}
                          <span className="font-mono-tabular text-sky-700 dark:text-sky-300">
                            {trip.flight.flightNumber}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDateAr(trip.flight.departureDate)} ·{' '}
                          {CABIN_LABELS[trip.flight.cabinClass]}
                        </div>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        رمز الحجز
                      </span>
                      <span className="font-mono-tabular text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        {trip.pnr}
                      </span>
                    </div>
                  </div>

                  {/* Route Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-mono-tabular text-2xl font-bold text-slate-900 dark:text-white">
                        {origin.code}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        {origin.cityAr} · {trip.flight.departureTime}
                      </div>
                    </div>

                    <div className="flex-1 flex items-center gap-2 px-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400" />
                      <span className="flex-1 h-px bg-slate-300 dark:bg-white/15" />
                      <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400 -scale-x-100" />
                      <span className="flex-1 h-px bg-slate-300 dark:bg-white/15" />
                      <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400" />
                    </div>

                    <div className="text-left">
                      <div className="font-mono-tabular text-2xl font-bold text-slate-900 dark:text-white">
                        {dest.code}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        {dest.cityAr} · {trip.flight.arrivalTime}
                      </div>
                    </div>
                  </div>

                  {/* Passenger & Seats metadata */}
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/55 border border-slate-200 dark:border-white/10 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">المسافر</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                        {trip.passengerDetails.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">المقاعد</span>
                      <span className="font-mono-tabular font-bold text-sky-700 dark:text-sky-300">
                        {trip.selectedSeats.join(' , ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">الإجمالي</span>
                      <span className="font-mono-tabular font-bold text-slate-900 dark:text-slate-100">
                        {formatPrice(trip.totalPriceUsd, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewBoardingPass(trip)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>عرض بطاقة الصعود</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectDownload(trip)}
                      disabled={downloadingId === trip.id}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>
                        {downloadingId === trip.id ? 'جاري التحميل...' : 'PNG'}
                      </span>
                    </button>
                  </div>

                  {!isConfirming ? (
                    <button
                      type="button"
                      onClick={() => setConfirmCancelId(trip.id)}
                      className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>إلغاء الحجز</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onCancelTrip(trip.id);
                          setConfirmCancelId(null);
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold cursor-pointer"
                      >
                        تأكيد الإلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmCancelId(null)}
                        className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        تراجع
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
