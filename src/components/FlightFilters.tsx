import { AIRLINES } from '@/src/data/aviationData';
import { Currency, FlightFilterState, TimeOfDay } from '@/src/types/aviation';
import { formatPrice } from '@/src/utils/formatters';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';

interface FlightFiltersProps {
  filters: FlightFilterState;
  onChange: (next: FlightFilterState) => void;
  minAvailableUsd: number;
  maxAvailableUsd: number;
  availableAirlines: string[];
  currency: Currency;
  onReset: () => void;
}

const TIME_SLOTS: Array<{ id: TimeOfDay; label: string; range: string }> = [
  { id: 'morning', label: 'الصباح', range: '05:00 – 11:59' },
  { id: 'afternoon', label: 'الظهيرة', range: '12:00 – 16:59' },
  { id: 'evening', label: 'المساء', range: '17:00 – 20:59' },
  { id: 'night', label: 'الليل', range: '21:00 – 04:59' },
];

export function FlightFilters({
  filters,
  onChange,
  minAvailableUsd,
  maxAvailableUsd,
  availableAirlines,
  currency,
  onReset,
}: FlightFiltersProps) {
  const toggleTimeSlot = (slot: TimeOfDay) => {
    const exists = filters.timeOfDay.includes(slot);
    onChange({
      ...filters,
      timeOfDay: exists
        ? filters.timeOfDay.filter((t) => t !== slot)
        : [...filters.timeOfDay, slot],
    });
  };

  const toggleAirline = (code: string) => {
    const exists = filters.airlines.includes(code);
    onChange({
      ...filters,
      airlines: exists
        ? filters.airlines.filter((a) => a !== code)
        : [...filters.airlines, code],
    });
  };

  return (
    <aside className="glass-surface rounded-2xl p-5 space-y-6">
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">تصفية النتائج</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-sky-600 dark:text-sky-300 hover:text-sky-500 dark:hover:text-sky-200 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط</span>
        </button>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-800 dark:text-slate-200">الحد الأقصى للسعر</span>
          <span className="font-mono-tabular font-bold text-sky-700 dark:text-sky-300">
            {formatPrice(filters.maxPriceUsd, currency)}
          </span>
        </div>
        <input
          type="range"
          min={minAvailableUsd}
          max={maxAvailableUsd}
          step={5}
          value={filters.maxPriceUsd}
          onChange={(e) =>
            onChange({ ...filters, maxPriceUsd: Number(e.target.value) })
          }
          className="w-full ofoq-range"
          aria-label="الحد الأقصى للسعر"
        />
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
          <span>{formatPrice(minAvailableUsd, currency)}</span>
          <span>{formatPrice(maxAvailableUsd, currency)}</span>
        </div>
      </div>

      {/* Stops Filter */}
      <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-white/10">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">محطات التوقف</h3>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10">
          {(
            [
              { id: 'all', label: 'الكل' },
              { id: 'direct', label: 'مباشر فقط' },
              { id: 'one-stop', label: 'توقف واحد' },
            ] as const
          ).map((opt) => {
            const active = filters.stops === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ ...filters, stops: opt.id })}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
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

      {/* Time of Day */}
      <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-white/10">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">وقت الإقلاع</h3>
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map((slot) => {
            const active = filters.timeOfDay.includes(slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => toggleTimeSlot(slot.id)}
                className={`p-2.5 rounded-xl border text-right transition-colors cursor-pointer ${
                  active
                    ? 'bg-sky-500/15 border-sky-500/50 dark:border-sky-400/50 text-sky-800 dark:text-sky-200'
                    : 'bg-white/75 dark:bg-slate-950/40 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/25'
                }`}
              >
                <div className="text-xs font-bold">{slot.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-tabular mt-0.5">
                  {slot.range}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Airlines */}
      <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-white/10">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">شركات الطيران</h3>
        <div className="space-y-2">
          {availableAirlines.map((code) => {
            const airline = AIRLINES[code];
            if (!airline) return null;
            const checked = filters.airlines.includes(code);
            return (
              <label
                key={code}
                className="flex items-center justify-between gap-2.5 py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAirline(code)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900 text-sky-600 focus:ring-sky-400 cursor-pointer accent-sky-500"
                  />
                  <span className="text-sm text-slate-800 dark:text-slate-200">
                    {airline.nameAr}
                  </span>
                </div>
                <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                  {airline.code}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
