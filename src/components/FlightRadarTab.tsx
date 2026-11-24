import { useEffect, useMemo, useState } from 'react';
import { AirlineEmblem } from '@/src/components/AirlineEmblem';
import { AIRLINES, LIVE_RADAR_FLIGHTS } from '@/src/data/aviationData';
import { FlightRadarStatus, LiveFlightRadarItem } from '@/src/types/aviation';
import { formatDurationAr, getAirportByCode } from '@/src/utils/formatters';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Mountain,
  Plane,
  Radio,
  RefreshCw,
  Search,
} from 'lucide-react';

const STATUS_META: Record<
  FlightRadarStatus,
  {
    label: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    Icon: typeof Plane;
  }
> = {
  in_air: {
    label: 'في الجو',
    colorClass: 'text-sky-700 dark:text-sky-300',
    bgClass: 'bg-sky-500/15',
    borderClass: 'border-sky-500/35 dark:border-sky-400/35',
    Icon: Plane,
  },
  on_time: {
    label: 'في الموعد',
    colorClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/35 dark:border-emerald-400/35',
    Icon: Clock,
  },
  delayed: {
    label: 'متأخرة',
    colorClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/35 dark:border-amber-400/35',
    Icon: AlertTriangle,
  },
  landed: {
    label: 'هبطت',
    colorClass: 'text-emerald-700 dark:text-emerald-300',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/35 dark:border-emerald-400/35',
    Icon: CheckCircle2,
  },
};

export function FlightRadarTab() {
  const [flights, setFlights] = useState<LiveFlightRadarItem[]>(LIVE_RADAR_FLIGHTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FlightRadarStatus>('all');
  const [selectedFlightNum, setSelectedFlightNum] = useState<string>(
    LIVE_RADAR_FLIGHTS[0].flightNumber
  );

  // Subtle live progress tick for airborne flights
  useEffect(() => {
    const interval = setInterval(() => {
      setFlights((prev) =>
        prev.map((item) => {
          if (item.status !== 'in_air') return item;
          const nextProgress = Math.min(99, item.progressPercent + 1);
          const nextRemaining = Math.max(4, item.remainingTimeMinutes - 1);
          const speedJitter = ((Math.floor(Date.now() / 1000) % 7) - 3) * 2;
          return {
            ...item,
            progressPercent: nextProgress,
            remainingTimeMinutes: nextRemaining,
            speedKmh: Math.max(760, item.speedKmh + speedJitter),
          };
        })
      );
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const filteredFlights = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return flights.filter((f) => {
      if (statusFilter !== 'all' && f.status !== statusFilter) return false;
      if (!q) return true;
      const origin = getAirportByCode(f.origin);
      const dest = getAirportByCode(f.destination);
      const airline = AIRLINES[f.airlineCode];
      return (
        f.flightNumber.toLowerCase().includes(q) ||
        origin.code.toLowerCase().includes(q) ||
        dest.code.toLowerCase().includes(q) ||
        origin.cityAr.includes(q) ||
        dest.cityAr.includes(q) ||
        (airline?.nameAr.includes(q) ?? false)
      );
    });
  }, [flights, searchQuery, statusFilter]);

  const activeFlight = useMemo(() => {
    return (
      flights.find((f) => f.flightNumber === selectedFlightNum) ||
      filteredFlights[0] ||
      flights[0]
    );
  }, [flights, filteredFlights, selectedFlightNum]);

  const handleManualRefresh = () => {
    setFlights((prev) =>
      prev.map((item) =>
        item.status === 'in_air'
          ? {
              ...item,
              progressPercent:
                item.progressPercent >= 98 ? 45 : item.progressPercent + 2,
              speedKmh: item.speedKmh + (item.progressPercent % 2 === 0 ? 4 : -4),
            }
          : item
      )
    );
  };

  const activeOrigin = getAirportByCode(activeFlight.origin);
  const activeDest = getAirportByCode(activeFlight.destination);
  const activeAirline = AIRLINES[activeFlight.airlineCode];
  const activeMeta = STATUS_META[activeFlight.status];
  const ActiveStatusIcon = activeMeta.Icon;

  return (
    <section className="space-y-6">
      {/* Header & Search Controls */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-300">
              <Radio className="w-4 h-4" />
              <span>مركز مراقبة الحركة الجوية المباشر</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              تتبع حالة الرحلات المباشر
            </h2>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="px-4 py-2.5 rounded-xl border border-sky-500/35 dark:border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-200 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تحديث القراءات</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Flight Number / City Search */}
          <div className="lg:col-span-6 relative">
            <Search className="w-4 h-4 text-sky-600 dark:text-sky-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الرحلة (مثل IA-102، EK-942، TK-305) أو المدينة..."
              className="w-full pr-11 pl-4 py-3 rounded-xl bg-white/85 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 focus:border-sky-500/60 dark:focus:border-sky-400/60 focus:outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="lg:col-span-6 flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: 'جميع الرحلات' },
                { id: 'in_air', label: 'في الجو' },
                { id: 'on_time', label: 'في الموعد' },
                { id: 'delayed', label: 'متأخرة' },
                { id: 'landed', label: 'هبطت' },
              ] as const
            ).map((btn) => {
              const active = statusFilter === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setStatusFilter(btn.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-sky-600 dark:bg-sky-500 border-sky-500 dark:border-sky-400 text-white dark:text-slate-950'
                      : 'bg-white/75 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/25'
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Radar View: Active Flight Telemetry + Active Flights List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Selected Flight Visual Radar Telemetry */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3.5">
              <AirlineEmblem airlineCode={activeFlight.airlineCode} size="lg" />
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white">
                    {activeFlight.flightNumber}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {activeAirline?.nameAr}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeFlight.aircraft} · {activeFlight.terminal} · بوابة{' '}
                  <span className="font-mono-tabular text-slate-800 dark:text-slate-200">
                    {activeFlight.gate}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-bold ${activeMeta.bgClass} ${activeMeta.borderClass} ${activeMeta.colorClass}`}
            >
              <ActiveStatusIcon className="w-4 h-4" />
              <span>{activeMeta.label}</span>
            </div>
          </div>

          {/* Visual Flight Progress Bar */}
          <div className="space-y-4 py-2">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="font-mono-tabular text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  {activeOrigin.code}
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {activeOrigin.cityAr}
                </div>
                <div className="font-mono-tabular text-xs text-slate-500 dark:text-slate-400 mt-1">
                  الإقلاع: {activeFlight.departureTime}
                </div>
              </div>

              <div className="text-center">
                <div className="font-mono-tabular text-sm font-bold text-sky-700 dark:text-sky-300">
                  {activeFlight.progressPercent}% مكتمل
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeFlight.remainingTimeMinutes > 0
                    ? `المتبقي: ${formatDurationAr(activeFlight.remainingTimeMinutes)}`
                    : 'وصلت إلى وجهتها'}
                </div>
              </div>

              <div className="text-left">
                <div className="font-mono-tabular text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  {activeDest.code}
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {activeDest.cityAr}
                </div>
                <div className="font-mono-tabular text-xs text-slate-500 dark:text-slate-400 mt-1">
                  الوصول المتوقع:{' '}
                  <span
                    className={
                      activeFlight.status === 'delayed'
                        ? 'text-amber-700 dark:text-amber-300 font-bold'
                        : 'text-emerald-700 dark:text-emerald-300 font-bold'
                    }
                  >
                    {activeFlight.estimatedArrivalTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Progress Track (RTL aware: starts from right, moves left) */}
            <div className="relative pt-4 pb-2">
              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-sky-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${activeFlight.progressPercent}%` }}
                />
              </div>

              {/* Moving Airplane Indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 transition-all duration-500"
                style={{ right: `${activeFlight.progressPercent}%` }}
              >
                <div className="w-9 h-9 rounded-full bg-white dark:bg-[#0B1224] border-2 border-sky-500 dark:border-sky-400 shadow-lg shadow-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-300">
                  <Plane className="w-4 h-4 -scale-x-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Flight Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Mountain className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>الارتفاع الحالي</span>
              </div>
              <div className="font-mono-tabular text-lg font-bold text-slate-900 dark:text-slate-100">
                {activeFlight.altitudeFt > 0
                  ? `${activeFlight.altitudeFt.toLocaleString('en-US')} قدم`
                  : 'على المدرج'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Gauge className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>السرعة الأرضية</span>
              </div>
              <div className="font-mono-tabular text-lg font-bold text-slate-900 dark:text-slate-100">
                {activeFlight.speedKmh > 0
                  ? `${activeFlight.speedKmh} كم/س`
                  : '0 كم/س'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">المسافة الكلية</div>
              <div className="font-mono-tabular text-lg font-bold text-slate-900 dark:text-slate-100">
                {activeFlight.distanceKm.toLocaleString('en-US')} كم
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">المبنى والبوابة</div>
              <div className="font-mono-tabular text-lg font-bold text-sky-700 dark:text-sky-300">
                {activeFlight.gate} · {activeFlight.terminal}
              </div>
            </div>
          </div>
        </div>

        {/* Active Flights List */}
        <div className="lg:col-span-5 glass-surface rounded-3xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-200 dark:border-white/10">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              الرحلات النشطة ({filteredFlights.length})
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">اضغط للتفاصيل</span>
          </div>

          {filteredFlights.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              لم يتم العثور على رحلة مطابقة لرقم البحث.
            </div>
          ) : (
            <div className="space-y-2 max-h-[430px] overflow-y-auto pl-1">
              {filteredFlights.map((item) => {
                const origin = getAirportByCode(item.origin);
                const dest = getAirportByCode(item.destination);
                const meta = STATUS_META[item.status];
                const isSelected =
                  activeFlight.flightNumber === item.flightNumber;

                return (
                  <button
                    key={item.flightNumber}
                    type="button"
                    onClick={() => setSelectedFlightNum(item.flightNumber)}
                    className={`w-full text-right p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/50 dark:border-sky-400/50'
                        : 'bg-white/70 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AirlineEmblem airlineCode={item.airlineCode} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-tabular text-sm font-bold text-slate-900 dark:text-white">
                            {item.flightNumber}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {origin.cityAr} ← {dest.cityAr}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular mt-0.5">
                          {item.origin} {item.departureTime} · {item.destination}{' '}
                          {item.estimatedArrivalTime}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap shrink-0 ${meta.bgClass} ${meta.borderClass} ${meta.colorClass}`}
                    >
                      {meta.label}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
