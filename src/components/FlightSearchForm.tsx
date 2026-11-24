import { useEffect, useRef, useState } from 'react';
import { AirportSelect } from '@/src/components/AirportSelect';
import { CABIN_LABELS } from '@/src/data/aviationData';
import {
  CabinClass,
  MultiCityLeg,
  PassengerCounts,
  SearchQuery,
  TripType,
} from '@/src/types/aviation';
import { getDefaultDate } from '@/src/utils/formatters';
import {
  ArrowLeftRight,
  Calendar,
  ChevronDown,
  Minus,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';

interface FlightSearchFormProps {
  initialQuery: SearchQuery;
  onSearch: (query: SearchQuery) => void;
}

export function FlightSearchForm({
  initialQuery,
  onSearch,
}: FlightSearchFormProps) {
  const [tripType, setTripType] = useState<TripType>(initialQuery.tripType);
  const [origin, setOrigin] = useState<string>(initialQuery.origin);
  const [destination, setDestination] = useState<string>(initialQuery.destination);
  const [departureDate, setDepartureDate] = useState<string>(
    initialQuery.departureDate
  );
  const [returnDate, setReturnDate] = useState<string>(initialQuery.returnDate);
  const [multiCityLegs, setMultiCityLegs] = useState<MultiCityLeg[]>(
    initialQuery.multiCityLegs
  );
  const [passengers, setPassengers] = useState<PassengerCounts>(
    initialQuery.passengers
  );
  const [cabinClass, setCabinClass] = useState<CabinClass>(
    initialQuery.cabinClass
  );
  const [isSwapped, setIsSwapped] = useState(false);
  const [isPassengersOpen, setIsPassengersOpen] = useState(false);

  const passengerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        passengerMenuRef.current &&
        !passengerMenuRef.current.contains(e.target as Node)
      ) {
        setIsPassengersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const totalPassengers =
    passengers.adults + passengers.children + passengers.infants;

  const handleSwap = () => {
    setIsSwapped((prev) => !prev);
    const prevOrigin = origin;
    setOrigin(destination);
    setDestination(prevOrigin);
  };

  const updatePassengerCount = (
    key: keyof PassengerCounts,
    delta: number
  ) => {
    setPassengers((prev) => {
      const next = { ...prev };
      const val = next[key] + delta;
      if (key === 'adults') {
        if (val < 1 || val > 9) return prev;
        next.adults = val;
        if (next.infants > val) next.infants = val;
      } else if (key === 'children') {
        if (val < 0 || val > 8) return prev;
        next.children = val;
      } else {
        if (val < 0 || val > prev.adults) return prev;
        next.infants = val;
      }
      return next;
    });
  };

  const addMultiCityLeg = () => {
    if (multiCityLegs.length >= 4) return;
    const lastLeg = multiCityLegs[multiCityLegs.length - 1];
    const nextOrigin = lastLeg ? lastLeg.destination : 'DXB';
    const nextDest = nextOrigin === 'IST' ? 'LHR' : 'IST';
    setMultiCityLegs((prev) => [
      ...prev,
      {
        id: `leg-${Date.now()}`,
        origin: nextOrigin,
        destination: nextDest,
        date: getDefaultDate(7 + prev.length * 4),
      },
    ]);
  };

  const removeMultiCityLeg = (id: string) => {
    if (multiCityLegs.length <= 2) return;
    setMultiCityLegs((prev) => prev.filter((leg) => leg.id !== id));
  };

  const updateMultiCityLeg = (
    id: string,
    patch: Partial<Omit<MultiCityLeg, 'id'>>
  ) => {
    setMultiCityLegs((prev) =>
      prev.map((leg) => (leg.id === id ? { ...leg, ...patch } : leg))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      tripType,
      origin,
      destination,
      departureDate,
      returnDate,
      multiCityLegs,
      passengers,
      cabinClass,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl shadow-slate-900/10 dark:shadow-black/50"
    >
      {/* Top Row: Trip Type & Cabin/Passenger Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        {/* Trip Type Segmented Control */}
        <div
          role="tablist"
          aria-label="نوع الرحلة"
          className="inline-flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10"
        >
          {(
            [
              { id: 'round-trip', label: 'ذهاب وعودة' },
              { id: 'one-way', label: 'ذهاب فقط' },
              { id: 'multi-city', label: 'وجهات متعددة' },
            ] as const
          ).map((tab) => {
            const active = tripType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTripType(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Passengers & Cabin Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Passengers Dropdown */}
          <div ref={passengerMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsPassengersOpen((o) => !o)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Users className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="tabular-nums">{totalPassengers} مسافر</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPassengersOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 z-50 rounded-2xl bg-white/95 dark:bg-[#0B1224]/95 backdrop-blur-2xl border border-slate-200 dark:border-sky-400/25 shadow-2xl p-4 space-y-3.5">
                {(
                  [
                    {
                      key: 'adults',
                      title: 'بالغين',
                      subtitle: '12 سنة فأكثر',
                      min: 1,
                    },
                    {
                      key: 'children',
                      title: 'أطفال',
                      subtitle: '2 – 11 سنة',
                      min: 0,
                    },
                    {
                      key: 'infants',
                      title: 'رضع',
                      subtitle: 'أقل من سنتين (على الحجر)',
                      min: 0,
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.subtitle}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updatePassengerCount(item.key, -1)}
                        disabled={passengers[item.key] <= item.min}
                        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-sky-500/50 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                        aria-label={`إنقاص ${item.title}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono-tabular text-sm font-bold text-slate-900 dark:text-slate-100">
                        {passengers[item.key]}
                      </span>
                      <button
                        type="button"
                        onClick={() => updatePassengerCount(item.key, 1)}
                        disabled={
                          item.key === 'infants'
                            ? passengers.infants >= passengers.adults
                            : totalPassengers >= 9
                        }
                        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-sky-500/50 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                        aria-label={`زيادة ${item.title}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setIsPassengersOpen(false)}
                  className="w-full py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 dark:border-sky-400/30 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-500/25 transition-colors cursor-pointer"
                >
                  تأكيد ({totalPassengers} مسافر)
                </button>
              </div>
            )}
          </div>

          {/* Cabin Class Select */}
          <div className="relative">
            <select
              aria-label="درجة السفر"
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value as CabinClass)}
              className="appearance-none px-3.5 py-2 pl-8 rounded-xl bg-white/85 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-400/60 cursor-pointer"
            >
              {(['economy', 'business', 'first'] as CabinClass[]).map((c) => (
                <option
                  key={c}
                  value={c}
                  className="bg-white dark:bg-[#0B1224] text-slate-900 dark:text-slate-100"
                >
                  {CABIN_LABELS[c]}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Search Inputs */}
      {tripType !== 'multi-city' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          {/* Origin + Swap + Destination */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
            <AirportSelect
              label="مطار المغادرة (من)"
              value={origin}
              onChange={setOrigin}
              excludeCode={destination}
            />

            <button
              type="button"
              onClick={handleSwap}
              aria-label="تبديل مطار المغادرة والوجهة"
              className="mx-auto w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-sky-500/40 dark:border-sky-400/35 hover:bg-sky-500/15 text-sky-600 dark:text-sky-300 flex items-center justify-center transition-transform duration-300 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              style={{
                transform: isSwapped ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <AirportSelect
              label="مطار الوصول (إلى)"
              value={destination}
              onChange={setDestination}
              excludeCode={origin}
            />
          </div>

          {/* Departure & Return Dates */}
          <div
            className={`lg:col-span-4 grid gap-2.5 ${
              tripType === 'round-trip'
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            <label className="block px-4 py-2.5 rounded-xl bg-white/85 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 focus-within:border-sky-400/60 cursor-pointer">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>تاريخ المغادرة</span>
              </span>
              <input
                type="date"
                value={departureDate}
                min={getDefaultDate(0)}
                onChange={(e) => {
                  const val = e.target.value;
                  setDepartureDate(val);
                  if (returnDate < val) setReturnDate(val);
                }}
                required
                className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none font-mono-tabular"
              />
            </label>

            {tripType === 'round-trip' && (
              <label className="block px-4 py-2.5 rounded-xl bg-white/85 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 focus-within:border-sky-400/60 cursor-pointer">
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>تاريخ العودة</span>
                </span>
                <input
                  type="date"
                  value={returnDate}
                  min={departureDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none font-mono-tabular"
                />
              </label>
            )}
          </div>

          {/* Search CTA */}
          <div className="lg:col-span-2 flex">
            <button
              type="submit"
              className="w-full min-h-[56px] px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 active:scale-[0.99] text-white dark:text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all duration-150 cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>بحث عن رحلات</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {multiCityLegs.map((leg, index) => (
            <div
              key={leg.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center p-3 rounded-2xl bg-slate-100/75 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10"
            >
              <div className="md:col-span-1 text-xs font-semibold text-sky-700 dark:text-sky-300 whitespace-nowrap">
                الوجهة {index + 1}
              </div>
              <div className="md:col-span-4">
                <AirportSelect
                  label="من"
                  value={leg.origin}
                  onChange={(code) =>
                    updateMultiCityLeg(leg.id, { origin: code })
                  }
                  excludeCode={leg.destination}
                />
              </div>
              <div className="md:col-span-4">
                <AirportSelect
                  label="إلى"
                  value={leg.destination}
                  onChange={(code) =>
                    updateMultiCityLeg(leg.id, { destination: code })
                  }
                  excludeCode={leg.origin}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block px-3.5 py-2.5 rounded-xl bg-white/85 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10">
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                    التاريخ
                  </span>
                  <input
                    type="date"
                    value={leg.date}
                    min={getDefaultDate(0)}
                    onChange={(e) =>
                      updateMultiCityLeg(leg.id, { date: e.target.value })
                    }
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none font-mono-tabular"
                  />
                </label>
              </div>
              <div className="md:col-span-1 flex justify-end">
                {multiCityLegs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeMultiCityLeg(leg.id)}
                    aria-label="حذف الوجهة"
                    className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={addMultiCityLeg}
              disabled={multiCityLegs.length >= 4}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white/80 dark:bg-slate-900/70 hover:border-sky-400/50 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>إضافة وجهة أخرى</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>عرض رحلات المسار المتعدد</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
