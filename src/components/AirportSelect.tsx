import { useEffect, useMemo, useRef, useState } from 'react';
import { AIRPORTS } from '@/src/data/aviationData';
import { MapPin, Search, X } from 'lucide-react';

interface AirportSelectProps {
  label: string;
  value: string;
  onChange: (code: string) => void;
  excludeCode?: string;
}

export function AirportSelect({
  label,
  value,
  onChange,
  excludeCode,
}: AirportSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedAirport = useMemo(
    () => AIRPORTS.find((a) => a.code === value) || AIRPORTS[0],
    [value]
  );

  const filteredAirports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AIRPORTS.filter((airport) => {
      if (airport.code === excludeCode) return false;
      if (!q) return true;
      return (
        airport.code.toLowerCase().includes(q) ||
        airport.cityAr.toLowerCase().includes(q) ||
        airport.nameAr.toLowerCase().includes(q) ||
        airport.countryAr.toLowerCase().includes(q)
      );
    });
  }, [query, excludeCode]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 20);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full text-right px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
          isOpen
            ? 'bg-white dark:bg-slate-900/90 border-sky-500/70 dark:border-sky-400/60'
            : 'bg-white/85 dark:bg-slate-950/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25'
        }`}
      >
        <span className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</span>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-base font-bold text-slate-900 dark:text-slate-50 truncate block">
              {selectedAirport.cityAr}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">
              {selectedAirport.nameAr}
            </span>
          </div>
          <span className="font-mono-tabular text-sm font-bold text-sky-700 dark:text-sky-300 bg-sky-500/15 border border-sky-500/25 dark:border-sky-400/25 px-2 py-1 rounded-lg shrink-0">
            {selectedAirport.code}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 inset-x-0 z-50 rounded-2xl bg-white/95 dark:bg-[#0B1224]/95 backdrop-blur-2xl border border-slate-200 dark:border-sky-400/25 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 overflow-hidden min-w-[290px]">
          <div className="p-2.5 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالمدينة أو رمز المطار (BGW, DXB...)"
              className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {filteredAirports.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                لا توجد مطارات مطابقة لبحثك
              </div>
            ) : (
              filteredAirports.map((airport) => {
                const isSelected = airport.code === value;
                return (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => {
                      onChange(airport.code);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-right transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 text-sky-800 dark:text-sky-200'
                        : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {airport.cityAr} · {airport.countryAr}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {airport.nameAr}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-xs font-bold text-sky-700 dark:text-sky-300 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-white/10 shrink-0">
                      {airport.code}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
