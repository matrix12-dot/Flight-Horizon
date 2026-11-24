import { AirlineEmblem } from '@/src/components/AirlineEmblem';
import { AIRLINES, CABIN_LABELS } from '@/src/data/aviationData';
import {
  Currency,
  Flight,
  PassengerCounts,
  SortOption,
} from '@/src/types/aviation';
import {
  formatDateAr,
  formatDurationAr,
  formatPrice,
  getAirportByCode,
} from '@/src/utils/formatters';
import { Briefcase, Plane, RotateCcw, Star } from 'lucide-react';

interface FlightResultsProps {
  flights: Flight[];
  totalUnfilteredCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  currency: Currency;
  passengers: PassengerCounts;
  onSelectFlight: (flight: Flight) => void;
  onResetFilters: () => void;
}

export function FlightResults({
  flights,
  totalUnfilteredCount,
  sortBy,
  onSortChange,
  currency,
  passengers,
  onSelectFlight,
  onResetFilters,
}: FlightResultsProps) {
  const passengerMultiplier =
    passengers.adults + passengers.children * 0.75 + passengers.infants * 0.15;

  return (
    <div className="space-y-4">
      {/* Results Toolbar */}
      <div className="glass-surface rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-700 dark:text-slate-300">
          تم العثور على{' '}
          <span className="font-mono-tabular font-bold text-sky-700 dark:text-sky-300">
            {flights.length}
          </span>{' '}
          رحلة من أصل{' '}
          <span className="font-mono-tabular text-slate-900 dark:text-slate-200">
            {totalUnfilteredCount}
          </span>
        </div>

        {/* Sort Segmented Buttons */}
        <div
          role="group"
          aria-label="ترتيب الرحلات"
          className="inline-flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10"
        >
          {(
            [
              { id: 'cheapest', label: 'الأرخص' },
              { id: 'fastest', label: 'الأسرع' },
              { id: 'best', label: 'الأفضل تقييماً' },
            ] as const
          ).map((opt) => {
            const active = sortBy === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSortChange(opt.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {flights.length === 0 ? (
        <div className="glass-surface rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/25 dark:border-sky-400/20 flex items-center justify-center mx-auto text-sky-600 dark:text-sky-300">
            <Plane className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              لا توجد رحلات مطابقة للفلاتر الحالية
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              جرّب توسيع نطاق السعر أو تعديل خيارات التوقف وشركات الطيران لعرض جميع الرحلات المتاحة.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-sm font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {flights.map((flight) => {
            const airline = AIRLINES[flight.airlineCode];
            const origin = getAirportByCode(flight.origin);
            const dest = getAirportByCode(flight.destination);
            const layover = flight.layoverAirport
              ? getAirportByCode(flight.layoverAirport)
              : null;
            const totalForPassengers = Math.round(
              flight.priceUsd * passengerMultiplier
            );

            return (
              <article
                key={flight.id}
                className="glass-surface glass-surface-hover rounded-2xl p-5 transition-all duration-150"
              >
                {/* Clean unboxed top metadata line */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {airline?.nameAr}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular text-sky-700 dark:text-sky-300">
                      {flight.flightNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{flight.aircraft}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-300 font-mono-tabular">
                      <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-300" />
                      {flight.rating}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{CABIN_LABELS[flight.cabinClass]}</span>
                    {flight.isReturnIncluded && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                          شامل الذهاب والعودة
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Main Flight Row */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Airline & Route Timing */}
                  <div className="md:col-span-8 flex items-center gap-4">
                    <AirlineEmblem airlineCode={flight.airlineCode} size="lg" />

                    <div className="flex-1 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5">
                      {/* Departure */}
                      <div className="text-right">
                        <div className="font-mono-tabular text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                          {flight.departureTime}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {origin.cityAr}{' '}
                          <span className="font-mono-tabular text-sky-700 dark:text-sky-300">
                            ({origin.code})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatDateAr(flight.departureDate)}
                        </div>
                      </div>

                      {/* Duration & Stops Arc */}
                      <div className="flex flex-col items-center justify-center px-1">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                          {formatDurationAr(flight.durationMinutes)}
                        </span>
                        <div className="relative w-full flex items-center">
                          <div className="w-2 h-2 rounded-full border border-sky-500 dark:border-sky-400 bg-white dark:bg-[#070B19]" />
                          <div className="flex-1 h-px bg-gradient-to-l from-sky-500/70 via-slate-400/50 to-sky-500/70 relative">
                            {flight.stops === 1 && (
                              <span
                                title={`توقف في ${layover?.cityAr}`}
                                className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 border-2 border-white dark:border-[#070B19] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                              />
                            )}
                          </div>
                          <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400 -scale-x-100 shrink-0 mx-1" />
                        </div>
                        <span
                          className={`text-xs mt-1.5 ${
                            flight.stops === 0
                              ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {flight.stops === 0
                            ? 'رحلة مباشرة'
                            : `توقف واحد في ${layover?.cityAr || flight.layoverAirport} (${flight.layoverMinutes} د)`}
                        </span>
                      </div>

                      {/* Arrival */}
                      <div className="text-left">
                        <div className="font-mono-tabular text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                          {flight.arrivalTime}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {dest.cityAr}{' '}
                          <span className="font-mono-tabular text-sky-700 dark:text-sky-300">
                            ({dest.code})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {flight.terminal} · بوابة {flight.gate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Baggage + Price + Select CTA */}
                  <div className="md:col-span-4 flex sm:flex-row md:flex-col lg:flex-row items-center justify-between md:items-end lg:items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:border-r border-slate-200 dark:border-white/10 md:pr-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Briefcase className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span>
                          {flight.baggageKg} كغم شحن · {flight.cabinBaggageKg}{' '}
                          كغم يد
                        </span>
                      </div>
                      <div className="font-mono-tabular text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
                        {formatPrice(totalForPassengers, currency)}
                      </div>
                      {passengerMultiplier > 1 && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {formatPrice(flight.priceUsd, currency)} / للمسافر البالغ
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectFlight(flight)}
                      className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer shadow-md shadow-sky-500/15"
                    >
                      اختيار المقعد والحجز
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
