import { useEffect, useMemo, useState } from 'react';
import { AirlineEmblem } from '@/src/components/AirlineEmblem';
import {
  AIRLINES,
  CABIN_LABELS,
  generateSeatMapForFlight,
} from '@/src/data/aviationData';
import {
  BookedTrip,
  Currency,
  Flight,
  PassengerCounts,
  PassengerDetails,
  SeatInfo,
  UserAccount,
} from '@/src/types/aviation';
import {
  downloadBoardingPassPng,
  generateBoardingPassQrDataUrl,
} from '@/src/utils/boardingPassExport';
import {
  formatDateAr,
  formatDurationAr,
  formatPrice,
  generatePNR,
  getAirportByCode,
} from '@/src/utils/formatters';
import {
  ArrowRight,
  Check,
  Download,
  Plane,
  Printer,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';

interface BookingModalProps {
  flight: Flight | null;
  existingTrip?: BookedTrip | null;
  currentUser?: UserAccount | null;
  passengers: PassengerCounts;
  currency: Currency;
  onClose: () => void;
  onBookingConfirmed: (trip: BookedTrip) => void;
}

export function BookingModal({
  flight,
  existingTrip,
  currentUser,
  passengers,
  currency,
  onClose,
  onBookingConfirmed,
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(existingTrip ? 3 : 1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    existingTrip ? existingTrip.selectedSeats : []
  );
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails>(
    existingTrip
      ? existingTrip.passengerDetails
      : {
          fullName: currentUser?.fullName || '',
          passportNumber: currentUser?.passportNumber || '',
          email: currentUser?.email || '',
          phone: '',
        }
  );
  const [formError, setFormError] = useState<string>('');
  const [confirmedTrip, setConfirmedTrip] = useState<BookedTrip | null>(
    existingTrip || null
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  const activeFlight = existingTrip?.flight || flight;
  const requiredSeatCount = useMemo(() => {
    const pax = existingTrip ? existingTrip.passengers : passengers;
    return Math.max(1, pax.adults + pax.children);
  }, [existingTrip, passengers]);

  const seats = useMemo<SeatInfo[]>(() => {
    if (!activeFlight) return [];
    return generateSeatMapForFlight(activeFlight.id, activeFlight.cabinClass);
  }, [activeFlight]);

  useEffect(() => {
    if (existingTrip) {
      setStep(3);
      setConfirmedTrip(existingTrip);
      setSelectedSeats(existingTrip.selectedSeats);
      setPassengerDetails(existingTrip.passengerDetails);
    } else {
      setStep(1);
      setConfirmedTrip(null);
      setSelectedSeats([]);
      setPassengerDetails({
        fullName: currentUser?.fullName || '',
        passportNumber: currentUser?.passportNumber || '',
        email: currentUser?.email || '',
        phone: '',
      });
      setFormError('');
    }
  }, [existingTrip, flight?.id, currentUser]);

  useEffect(() => {
    if (step === 3 && confirmedTrip) {
      generateBoardingPassQrDataUrl(confirmedTrip)
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(''));
    }
  }, [step, confirmedTrip]);

  if (!activeFlight) return null;

  const origin = getAirportByCode(activeFlight.origin);
  const dest = getAirportByCode(activeFlight.destination);
  const airline = AIRLINES[activeFlight.airlineCode];

  const seatUpgradeUsd = selectedSeats.reduce((sum, seatId) => {
    const info = seats.find((s) => s.id === seatId);
    return sum + (info?.extraPriceUsd || 0);
  }, 0);

  const pax = existingTrip ? existingTrip.passengers : passengers;
  const passengerMultiplier =
    pax.adults + pax.children * 0.75 + pax.infants * 0.15;
  const baseTotalUsd = Math.round(activeFlight.priceUsd * passengerMultiplier);
  const grandTotalUsd = baseTotalUsd + seatUpgradeUsd;

  const toggleSeat = (seat: SeatInfo) => {
    if (seat.status === 'occupied') return;
    setSelectedSeats((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id);
      }
      if (prev.length >= requiredSeatCount) {
        return [...prev.slice(1), seat.id];
      }
      return [...prev, seat.id];
    });
  };

  const handleConfirmDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerDetails.fullName.trim()) {
      setFormError('يرجى إدخال الاسم الكامل كما يظهر في جواز السفر.');
      return;
    }
    if (passengerDetails.passportNumber.trim().length < 5) {
      setFormError('يرجى إدخال رقم جواز سفر صحيح.');
      return;
    }
    if (!passengerDetails.email.includes('@')) {
      setFormError('يرجى إدخال بريد إلكتروني صحيح لاستلام نسخة التذكرة.');
      return;
    }
    setFormError('');

    const newTrip: BookedTrip = {
      id: `trip-${Date.now()}`,
      pnr: generatePNR(),
      flight: activeFlight,
      selectedSeats,
      seatUpgradeUsd,
      passengers: pax,
      passengerDetails: {
        ...passengerDetails,
        passportNumber: passengerDetails.passportNumber.toUpperCase().trim(),
      },
      totalPriceUsd: grandTotalUsd,
      currencyAtBooking: currency,
      bookedAt: new Date().toISOString(),
      status: 'checked_in',
    };

    setConfirmedTrip(newTrip);
    onBookingConfirmed(newTrip);
    setStep(3);
  };

  const handleDownloadPng = async () => {
    if (!confirmedTrip) return;
    setIsDownloading(true);
    try {
      await downloadBoardingPassPng(confirmedTrip);
    } finally {
      setIsDownloading(false);
    }
  };

  const rows = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="إتمام الحجز وبطاقة الصعود"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-[#0B1224] border border-slate-200 dark:border-sky-400/25 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <AirlineEmblem airlineCode={activeFlight.airlineCode} size="sm" />
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {origin.cityAr} ({origin.code}) ← {dest.cityAr} ({dest.code})
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {airline?.nameAr} ·{' '}
                <span className="font-mono-tabular">
                  {activeFlight.flightNumber}
                </span>{' '}
                · {formatDateAr(activeFlight.departureDate)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        {!existingTrip && (
          <div className="px-6 py-3 bg-slate-100/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-white/10 flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm shrink-0">
            {[
              { num: 1, label: 'اختيار المقعد' },
              { num: 2, label: 'بيانات المسافر' },
              { num: 3, label: 'بطاقة الصعود' },
            ].map((item, idx) => {
              const isCurrent = step === item.num;
              const isDone = step > item.num;
              return (
                <div key={item.num} className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono-tabular font-bold ${
                      isDone
                        ? 'bg-emerald-500 text-white dark:text-slate-950'
                        : isCurrent
                          ? 'bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : item.num}
                  </span>
                  <span
                    className={`font-semibold whitespace-nowrap ${
                      isCurrent
                        ? 'text-sky-700 dark:text-sky-300'
                        : isDone
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                  {idx < 2 && (
                    <span className="hidden sm:inline-block w-8 h-px bg-slate-300 dark:bg-white/10 mr-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* STEP 1: INTERACTIVE SEAT MAP */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      خريطة مقاعد الطائرة ({activeFlight.aircraft})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      اختر {requiredSeatCount}{' '}
                      {requiredSeatCount === 1 ? 'مقعد' : 'مقاعد'} على الخريطة
                    </p>
                  </div>
                  <span className="text-xs font-mono-tabular text-sky-700 dark:text-sky-300 font-semibold">
                    تم اختيار: {selectedSeats.length} / {requiredSeatCount}
                  </span>
                </div>

                {/* Seat Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 dark:text-slate-300 p-3 rounded-xl bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/20" />
                    <span>متاح</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50 dark:border-amber-400/50" />
                    <span>مساحة إضافية للأرجل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-sky-600 dark:bg-sky-500 border border-sky-400 dark:border-sky-300" />
                    <span>مقعدك المختار</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-900/80 border border-slate-300 dark:border-white/5 opacity-45" />
                    <span>محجوز</span>
                  </div>
                </div>

                {/* Airplane Fuselage Map */}
                <div className="rounded-3xl bg-slate-100/85 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 p-4 sm:p-6 max-h-[410px] overflow-y-auto">
                  {/* Nose indicator */}
                  <div className="w-28 h-8 mx-auto mb-4 rounded-t-full border-t-2 border-x-2 border-sky-500/40 dark:border-sky-400/30 flex items-center justify-center text-[11px] text-sky-700 dark:text-sky-300 font-semibold">
                    مقدمة الطائرة
                  </div>

                  {/* Column Headers */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_28px_1fr_1fr_1fr_28px] gap-1.5 max-w-sm mx-auto mb-2 text-center font-mono-tabular text-xs text-slate-500 dark:text-slate-400">
                    <span>A</span>
                    <span>B</span>
                    <span>C</span>
                    <span />
                    <span>D</span>
                    <span>E</span>
                    <span>F</span>
                    <span />
                  </div>

                  <div className="space-y-1.5 max-w-sm mx-auto">
                    {rows.map((rowNum) => {
                      const rowSeats = seats.filter((s) => s.row === rowNum);
                      const isZoneStart =
                        rowNum === 1 || rowNum === 3 || rowNum === 7;
                      const zoneLabel =
                        rowNum === 1
                          ? 'الدرجة الأولى'
                          : rowNum === 3
                            ? 'درجة رجال الأعمال'
                            : 'الدرجة السياحية';

                      return (
                        <div key={rowNum}>
                          {isZoneStart && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center py-1.5 my-1 border-y border-slate-200 dark:border-white/5">
                              {zoneLabel}
                            </div>
                          )}
                          <div className="grid grid-cols-[1fr_1fr_1fr_28px_1fr_1fr_1fr_28px] gap-1.5 items-center">
                            {(['A', 'B', 'C'] as const).map((col) => {
                              const seat = rowSeats.find(
                                (s) => s.column === col
                              )!;
                              const isSelected = selectedSeats.includes(
                                seat.id
                              );
                              return (
                                <SeatButton
                                  key={seat.id}
                                  seat={seat}
                                  isSelected={isSelected}
                                  onClick={() => toggleSeat(seat)}
                                />
                              );
                            })}
                            <div className="text-center font-mono-tabular text-[11px] text-slate-500">
                              {rowNum}
                            </div>
                            {(['D', 'E', 'F'] as const).map((col) => {
                              const seat = rowSeats.find(
                                (s) => s.column === col
                              )!;
                              const isSelected = selectedSeats.includes(
                                seat.id
                              );
                              return (
                                <SeatButton
                                  key={seat.id}
                                  seat={seat}
                                  isSelected={isSelected}
                                  onClick={() => toggleSeat(seat)}
                                />
                              );
                            })}
                            <div className="text-[10px] text-amber-600 dark:text-amber-300/80 text-center">
                              {rowNum === 7 || rowNum === 13 ? 'مخرج' : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Summary Panel */}
              <div className="lg:col-span-5 glass-surface rounded-2xl p-5 space-y-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200 dark:border-white/10">
                  ملخص اختيار المقاعد
                </h4>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>الدرجة</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {CABIN_LABELS[activeFlight.cabinClass]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>المقاعد المختارة</span>
                    <span className="font-mono-tabular font-bold text-sky-700 dark:text-sky-300">
                      {selectedSeats.length > 0
                        ? selectedSeats.join(' , ')
                        : 'لم يتم الاختيار بعد'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>سعر التذاكر الأساسي</span>
                    <span className="font-mono-tabular">
                      {formatPrice(baseTotalUsd, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>رسوم المقاعد الإضافية</span>
                    <span className="font-mono-tabular text-amber-600 dark:text-amber-300">
                      {seatUpgradeUsd > 0
                        ? `+ ${formatPrice(seatUpgradeUsd, currency)}`
                        : 'مجاناً'}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-base font-bold text-slate-900 dark:text-white">
                    <span>الإجمالي النهائي</span>
                    <span className="font-mono-tabular text-sky-700 dark:text-sky-300">
                      {formatPrice(grandTotalUsd, currency)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={selectedSeats.length < requiredSeatCount}
                  onClick={() => setStep(2)}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white dark:text-slate-950 font-bold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {selectedSeats.length < requiredSeatCount
                    ? `اختر ${requiredSeatCount - selectedSeats.length} مقعد للمتابعة`
                    : 'متابعة إلى بيانات المسافر'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PASSENGER DETAILS FORM */}
          {step === 2 && (
            <form
              onSubmit={handleConfirmDetails}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    بيانات المسافر الرئيسي
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-sky-600 dark:text-sky-300 hover:text-sky-500 dark:hover:text-sky-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>تعديل المقاعد</span>
                  </button>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs sm:text-sm text-rose-700 dark:text-rose-200">
                    {formError}
                  </div>
                )}

                <div className="space-y-3.5">
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      الاسم الكامل (مطابق لجواز السفر)
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="مثال: أحمد محمد علي"
                      value={passengerDetails.fullName}
                      onChange={(e) =>
                        setPassengerDetails((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        رقم جواز السفر
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="A12345678"
                        value={passengerDetails.passportNumber}
                        onChange={(e) =>
                          setPassengerDetails((p) => ({
                            ...p,
                            passportNumber: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular uppercase placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        رقم الهاتف
                      </span>
                      <input
                        type="tel"
                        placeholder="+964 770 000 0000"
                        value={passengerDetails.phone}
                        onChange={(e) =>
                          setPassengerDetails((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      البريد الإلكتروني
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={passengerDetails.email}
                      onChange={(e) =>
                        setPassengerDetails((p) => ({
                          ...p,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </label>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5 glass-surface rounded-2xl p-5 space-y-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-200 dark:border-white/10">
                  تأكيد تفاصيل الحجز
                </h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>الرحلة</span>
                    <span className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                      {activeFlight.flightNumber} ({origin.code} ← {dest.code})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>الإقلاع</span>
                    <span className="font-mono-tabular text-slate-900 dark:text-slate-100">
                      {activeFlight.departureTime} ·{' '}
                      {formatDateAr(activeFlight.departureDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>المقاعد</span>
                    <span className="font-mono-tabular font-bold text-sky-700 dark:text-sky-300">
                      {selectedSeats.join(' , ')}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between text-base font-bold text-slate-900 dark:text-white">
                    <span>المبلغ الإجمالي</span>
                    <span className="font-mono-tabular text-sky-700 dark:text-sky-300">
                      {formatPrice(grandTotalUsd, currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    سيتم إصدار بطاقة الصعود الإلكترونية فوراً وحفظها في قسم «رحلاتي» على جهازك.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>تأكيد الحجز وإصدار بطاقة الصعود</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: DIGITAL BOARDING PASS */}
          {step === 3 && confirmedTrip && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    تم إصدار بطاقة صعود الطائرة الإلكترونية
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    يمكنك تحميل البطاقة كصورة PNG عالية الدقة أو طباعتها مباشرة
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    disabled={isDownloading}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isDownloading ? 'جاري التجهيز...' : 'تحميل كصورة PNG'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>طباعة البطاقة</span>
                  </button>
                </div>
              </div>

              {/* Digital Boarding Pass Card (Executive Dark Pass) */}
              <div
                id="printable-boarding-pass"
                className="rounded-3xl border border-sky-400/35 bg-gradient-to-br from-[#0F1A36] via-[#0B1224] to-[#0E1832] overflow-hidden shadow-2xl text-slate-100"
              >
                {/* Pass Header */}
                <div className="px-6 py-4 bg-sky-500/12 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AirlineEmblem
                      airlineCode={confirmedTrip.flight.airlineCode}
                      size="sm"
                    />
                    <div>
                      <div className="text-sm font-bold text-sky-300">
                        أفق للطيران · بطاقة صعود إلكترونية
                      </div>
                      <div className="text-xs text-slate-300">
                        {airline?.nameAr} · {confirmedTrip.flight.aircraft}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] text-slate-400 block">
                      مرجع الحجز (PNR)
                    </span>
                    <span className="font-mono-tabular text-lg font-bold text-sky-300 tracking-wider">
                      {confirmedTrip.pnr}
                    </span>
                  </div>
                </div>

                {/* Main + QR Stub */}
                <div className="grid grid-cols-1 md:grid-cols-12">
                  {/* Main Details */}
                  <div className="md:col-span-8 p-6 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-mono-tabular text-3xl sm:text-4xl font-bold text-white">
                          {origin.code}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300">
                          {origin.cityAr}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-center px-2">
                        <span className="font-mono-tabular text-xs text-sky-300 mb-1">
                          {confirmedTrip.flight.departureTime} ←{' '}
                          {confirmedTrip.flight.arrivalTime}
                        </span>
                        <div className="w-full flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-400" />
                          <span className="flex-1 h-px border-t border-dashed border-sky-400/50" />
                          <Plane className="w-4 h-4 text-sky-400 -scale-x-100" />
                          <span className="flex-1 h-px border-t border-dashed border-sky-400/50" />
                          <span className="w-2 h-2 rounded-full bg-sky-400" />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1">
                          {formatDurationAr(
                            confirmedTrip.flight.durationMinutes
                          )}{' '}
                          · {CABIN_LABELS[confirmedTrip.flight.cabinClass]}
                        </span>
                      </div>

                      <div className="text-left">
                        <div className="font-mono-tabular text-3xl sm:text-4xl font-bold text-white">
                          {dest.code}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300">
                          {dest.cityAr}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-5 border-t border-white/10">
                      <div>
                        <span className="text-xs text-slate-400 block">
                          اسم المسافر
                        </span>
                        <span className="text-sm font-bold text-slate-100">
                          {confirmedTrip.passengerDetails.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">
                          رقم الجواز
                        </span>
                        <span className="font-mono-tabular text-sm font-bold text-slate-100">
                          {confirmedTrip.passengerDetails.passportNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">
                          تاريخ الرحلة
                        </span>
                        <span className="text-sm font-semibold text-slate-100">
                          {formatDateAr(confirmedTrip.flight.departureDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">
                          رقم المقعد
                        </span>
                        <span className="font-mono-tabular text-base font-bold text-sky-300">
                          {confirmedTrip.selectedSeats.join(' , ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">
                          البوابة والمبنى
                        </span>
                        <span className="font-mono-tabular text-sm font-bold text-slate-100">
                          {confirmedTrip.flight.gate} ·{' '}
                          {confirmedTrip.flight.terminal}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">
                          وقت الصعود
                        </span>
                        <span className="font-mono-tabular text-base font-bold text-emerald-300">
                          {confirmedTrip.flight.boardingTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tear-off QR Stub */}
                  <div className="md:col-span-4 p-6 bg-slate-950/55 border-t md:border-t-0 md:border-r border-dashed border-white/15 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="p-2.5 rounded-2xl bg-slate-50 shadow-lg">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt={`رمز QR للحجز ${confirmedTrip.pnr}`}
                          className="w-36 h-36 object-contain"
                        />
                      ) : (
                        <div className="w-36 h-36 bg-slate-200 animate-pulse rounded-xl" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-slate-400">
                        امسح الرمز عند البوابة
                      </div>
                      <div className="font-mono-tabular text-sm font-bold text-sky-300">
                        {confirmedTrip.flight.flightNumber} · {confirmedTrip.pnr}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SeatButton({
  seat,
  isSelected,
  onClick,
}: {
  seat: SeatInfo;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isOccupied = seat.status === 'occupied';
  const isExtra = seat.status === 'extra_legroom';

  return (
    <button
      type="button"
      disabled={isOccupied}
      onClick={onClick}
      title={
        isOccupied
          ? `المقعد ${seat.id} محجوز`
          : isExtra
            ? `المقعد ${seat.id} · مساحة إضافية للأرجل (+$${seat.extraPriceUsd})`
            : `المقعد ${seat.id} متاح`
      }
      className={`h-9 rounded-lg font-mono-tabular text-[11px] font-bold transition-all duration-150 border ${
        isOccupied
          ? 'bg-slate-200 dark:bg-slate-900/60 border-slate-300 dark:border-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-45'
          : isSelected
            ? 'bg-sky-600 dark:bg-sky-500 border-sky-400 dark:border-sky-300 text-white dark:text-slate-950 shadow-md shadow-sky-500/30 cursor-pointer scale-[1.03]'
            : isExtra
              ? 'bg-amber-500/15 border-amber-500/50 dark:border-amber-400/45 text-amber-800 dark:text-amber-200 hover:bg-amber-500/30 cursor-pointer'
              : 'bg-white dark:bg-slate-800/80 border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 hover:border-sky-500 dark:hover:border-sky-400/60 cursor-pointer'
      }`}
    >
      {seat.id}
    </button>
  );
}
