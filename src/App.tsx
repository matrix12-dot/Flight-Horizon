import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthModal } from '@/src/components/AuthModal';
import { BookingModal } from '@/src/components/BookingModal';
import { ContactModal } from '@/src/components/ContactModal';
import { FlightFilters } from '@/src/components/FlightFilters';
import { FlightRadarTab } from '@/src/components/FlightRadarTab';
import { FlightResults } from '@/src/components/FlightResults';
import { FlightSearchForm } from '@/src/components/FlightSearchForm';
import { Footer } from '@/src/components/Footer';
import { MyTripsTab } from '@/src/components/MyTripsTab';
import { Navbar } from '@/src/components/Navbar';
import { PriceAlertModal } from '@/src/components/PriceAlertModal';
import { PriceDropToastStack } from '@/src/components/PriceDropToastStack';
import { SettingsModal } from '@/src/components/SettingsModal';
import { generateFlightsForRoute } from '@/src/data/aviationData';
import {
  ACCENT_COLORS,
  BACKGROUND_PRESETS,
  DEFAULT_SITE_SETTINGS,
} from '@/src/data/themePresets';
import {
  AppTab,
  BookedTrip,
  Currency,
  Flight,
  FlightFilterState,
  PriceDropNotification,
  RoutePriceAlert,
  SearchQuery,
  SiteSettings,
  SortOption,
  ThemeMode,
  UserAccount,
} from '@/src/types/aviation';
import {
  classifyTimeOfDay,
  getAirportByCode,
  getDefaultDate,
} from '@/src/utils/formatters';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Coins,
  Filter,
  LogIn,
  Monitor,
  Moon,
  Settings,
  Sun,
  X,
} from 'lucide-react';

const TRIPS_STORAGE_KEY = 'ofoq_aviation_booked_trips_v1';
const SETTINGS_STORAGE_KEY = 'ofoq_aviation_site_settings_v1';
const USERS_STORAGE_KEY = 'ofoq_aviation_users_v1';
const SESSION_USER_ID_KEY = 'ofoq_aviation_session_user_v1';
const LAST_SEARCH_KEY = 'ofoq_aviation_last_search_v1';
const PRICE_ALERTS_STORAGE_KEY = 'ofoq_aviation_price_alerts_v1';
const HERO_IMAGE_PATH = '/src/assets/images/hero_ofoq_aviation_1795540402651.jpg';

const DEFAULT_DEMO_USER: UserAccount = {
  id: 'user-demo-1',
  fullName: 'أحمد المنصور',
  email: 'traveler@ofoqair.iq',
  password: 'ofoq2026',
  passportNumber: 'A84920145',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const isNightHoursNow = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('search');

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return raw
        ? { ...DEFAULT_SITE_SETTINGS, ...(JSON.parse(raw) as Partial<SiteSettings>) }
        : DEFAULT_SITE_SETTINGS;
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isNightTime, setIsNightTime] = useState<boolean>(() =>
    isNightHoursNow()
  );

  const resolvedIsDark = useMemo(() => {
    if (siteSettings.themeMode === 'dark') return true;
    if (siteSettings.themeMode === 'light') return false;
    return siteSettings.autoDarkSchedule ? isNightTime : systemPrefersDark;
  }, [
    siteSettings.themeMode,
    siteSettings.autoDarkSchedule,
    isNightTime,
    systemPrefersDark,
  ]);

  const [currency, setCurrency] = useState<Currency>(
    () => siteSettings.defaultCurrency
  );

  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserAccount[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback below
    }
    return [DEFAULT_DEMO_USER];
  });

  const [sessionUserId, setSessionUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_USER_ID_KEY);
    } catch {
      return null;
    }
  });

  const currentUser = useMemo(
    () => registeredUsers.find((u) => u.id === sessionUserId) || null,
    [registeredUsers, sessionUserId]
  );

  const [bookedTrips, setBookedTrips] = useState<BookedTrip[]>(() => {
    try {
      const raw = localStorage.getItem(TRIPS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as BookedTrip[]) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState<SearchQuery>(() => {
    const fallback: SearchQuery = {
      tripType: 'round-trip',
      origin: 'BGW',
      destination: 'DXB',
      departureDate: getDefaultDate(3),
      returnDate: getDefaultDate(8),
      multiCityLegs: [
        {
          id: 'leg-1',
          origin: 'BGW',
          destination: 'DXB',
          date: getDefaultDate(3),
        },
        {
          id: 'leg-2',
          origin: 'DXB',
          destination: 'IST',
          date: getDefaultDate(7),
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: siteSettings.defaultCabinClass,
    };

    try {
      if (siteSettings.autoSaveSearch) {
        const saved = localStorage.getItem(LAST_SEARCH_KEY);
        if (saved) {
          return { ...fallback, ...(JSON.parse(saved) as Partial<SearchQuery>) };
        }
      }
    } catch {
      // ignore
    }
    return fallback;
  });

  const [activeMultiCityLegIdx, setActiveMultiCityLegIdx] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('cheapest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [selectedFlightForBooking, setSelectedFlightForBooking] =
    useState<Flight | null>(null);
  const [viewingTripPass, setViewingTripPass] = useState<BookedTrip | null>(
    null
  );
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | undefined>(undefined);
  const [pendingAlertModalAfterAuth, setPendingAlertModalAfterAuth] =
    useState(false);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bookingBannerPnr, setBookingBannerPnr] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const [priceAlerts, setPriceAlerts] = useState<RoutePriceAlert[]>(() => {
    try {
      const raw = localStorage.getItem(PRICE_ALERTS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RoutePriceAlert[]) : [];
    } catch {
      return [];
    }
  });
  const [priceNotifications, setPriceNotifications] = useState<
    PriceDropNotification[]
  >([]);
  const simulationTimersRef = useRef<number[]>([]);

  const userPriceAlerts = useMemo(
    () =>
      currentUser
        ? priceAlerts.filter((a) => a.userId === currentUser.id)
        : [],
    [priceAlerts, currentUser]
  );

  // Persist Trips
  useEffect(() => {
    try {
      localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(bookedTrips));
    } catch {
      // ignore
    }
  }, [bookedTrips]);

  // Persist Route Price Alerts
  useEffect(() => {
    try {
      localStorage.setItem(
        PRICE_ALERTS_STORAGE_KEY,
        JSON.stringify(priceAlerts)
      );
    } catch {
      // ignore
    }
  }, [priceAlerts]);

  // Clear pending timers on unmount or logout
  useEffect(() => {
    if (!currentUser) {
      setPriceNotifications([]);
      simulationTimersRef.current.forEach((id) => window.clearTimeout(id));
      simulationTimersRef.current = [];
    }
  }, [currentUser]);

  useEffect(() => {
    return () => {
      simulationTimersRef.current.forEach((id) => window.clearTimeout(id));
      simulationTimersRef.current = [];
    };
  }, []);

  // Listen to OS color-scheme changes for Automatic Dark Mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    setSystemPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Periodic check for automatic night-time schedule (18:00 - 06:00)
  useEffect(() => {
    setIsNightTime(isNightHoursNow());
    if (siteSettings.themeMode !== 'auto' || !siteSettings.autoDarkSchedule) {
      return;
    }
    const timer = window.setInterval(() => {
      setIsNightTime(isNightHoursNow());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [siteSettings.themeMode, siteSettings.autoDarkSchedule]);

  // Persist Settings & apply DOM .dark class + CSS Variables for Background/Accent/Glass
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(siteSettings));
    } catch {
      // ignore
    }
    const preset = BACKGROUND_PRESETS[siteSettings.backgroundPreset];
    const accent = ACCENT_COLORS[siteSettings.accentColor];
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedIsDark);
    root.style.setProperty(
      '--ofoq-bg',
      resolvedIsDark ? preset.bgHex : preset.lightBgHex
    );
    root.style.setProperty('--ofoq-accent', accent.hex);
    root.style.setProperty(
      '--ofoq-glass-blur',
      siteSettings.glassIntensity === 'high' ? '34px' : '24px'
    );
  }, [siteSettings, resolvedIsDark]);

  // Persist Users & Session
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
    } catch {
      // ignore
    }
  }, [registeredUsers]);

  useEffect(() => {
    try {
      if (sessionUserId) {
        localStorage.setItem(SESSION_USER_ID_KEY, sessionUserId);
      } else {
        localStorage.removeItem(SESSION_USER_ID_KEY);
      }
    } catch {
      // ignore
    }
  }, [sessionUserId]);

  const activeRouteParams = useMemo(() => {
    if (searchQuery.tripType === 'multi-city') {
      const leg =
        searchQuery.multiCityLegs[activeMultiCityLegIdx] ||
        searchQuery.multiCityLegs[0];
      return {
        origin: leg.origin,
        destination: leg.destination,
        departureDate: leg.date,
        cabinClass: searchQuery.cabinClass,
        isRoundTrip: false,
      };
    }
    return {
      origin: searchQuery.origin,
      destination: searchQuery.destination,
      departureDate: searchQuery.departureDate,
      cabinClass: searchQuery.cabinClass,
      isRoundTrip: searchQuery.tripType === 'round-trip',
    };
  }, [searchQuery, activeMultiCityLegIdx]);

  const rawFlights = useMemo(
    () => generateFlightsForRoute(activeRouteParams),
    [activeRouteParams]
  );

  const { minPriceUsd, maxPriceUsd, availableAirlines } = useMemo(() => {
    if (rawFlights.length === 0) {
      return { minPriceUsd: 100, maxPriceUsd: 1500, availableAirlines: [] };
    }
    const prices = rawFlights.map((f) => f.priceUsd);
    const airlines = Array.from(new Set(rawFlights.map((f) => f.airlineCode)));
    return {
      minPriceUsd: Math.min(...prices),
      maxPriceUsd: Math.max(...prices),
      availableAirlines: airlines,
    };
  }, [rawFlights]);

  const [filters, setFilters] = useState<FlightFilterState>({
    maxPriceUsd: maxPriceUsd,
    stops: 'all',
    timeOfDay: [],
    airlines: [],
  });

  useEffect(() => {
    setFilters({
      maxPriceUsd,
      stops: 'all',
      timeOfDay: [],
      airlines: [],
    });
  }, [maxPriceUsd, activeRouteParams]);

  const filteredAndSortedFlights = useMemo(() => {
    const filtered = rawFlights.filter((flight) => {
      if (flight.priceUsd > filters.maxPriceUsd) return false;
      if (filters.stops === 'direct' && flight.stops !== 0) return false;
      if (filters.stops === 'one-stop' && flight.stops !== 1) return false;
      if (
        filters.timeOfDay.length > 0 &&
        !filters.timeOfDay.includes(classifyTimeOfDay(flight.departureTime))
      ) {
        return false;
      }
      if (
        filters.airlines.length > 0 &&
        !filters.airlines.includes(flight.airlineCode)
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'cheapest') return a.priceUsd - b.priceUsd;
      if (sortBy === 'fastest') return a.durationMinutes - b.durationMinutes;
      return b.rating - a.rating;
    });
  }, [rawFlights, filters, sortBy]);

  const handleSearch = (nextQuery: SearchQuery) => {
    setSearchQuery(nextQuery);
    setActiveMultiCityLegIdx(0);
    if (siteSettings.autoSaveSearch) {
      try {
        localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(nextQuery));
      } catch {
        // ignore
      }
    }
    const resultsEl = document.getElementById('flight-results-section');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      maxPriceUsd,
      stops: 'all',
      timeOfDay: [],
      airlines: [],
    });
  };

  const handleBookingConfirmed = (trip: BookedTrip) => {
    setBookedTrips((prev) => [trip, ...prev]);
    setBookingBannerPnr(trip.pnr);
  };

  const handleCancelTrip = (tripId: string) => {
    setBookedTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  const handleUpdateSettings = (next: SiteSettings) => {
    setSiteSettings(next);
    if (next.defaultCurrency !== siteSettings.defaultCurrency) {
      setCurrency(next.defaultCurrency);
    }
  };

  const handleUpdateUser = (updated: UserAccount) => {
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? updated : u))
    );
  };

  const handleCycleThemeMode = () => {
    const order: ThemeMode[] = ['auto', 'dark', 'light'];
    const next = order[(order.indexOf(siteSettings.themeMode) + 1) % order.length];
    setSiteSettings((prev) => ({ ...prev, themeMode: next }));
  };

  const triggerSimulatedPriceDrop = useCallback((alert: RoutePriceAlert) => {
    const previousPriceUsd = Math.max(
      alert.baselinePriceUsd,
      alert.targetPriceUsd + 20
    );
    const dropPercent = 0.08 + Math.random() * 0.08;
    const candidatePrice = Math.round(alert.targetPriceUsd * (1 - dropPercent * 0.35));
    const newPriceUsd = Math.max(
      25,
      Math.min(alert.targetPriceUsd, candidatePrice)
    );

    const notificationId = `drop-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const notification: PriceDropNotification = {
      id: notificationId,
      alertId: alert.id,
      origin: alert.origin,
      destination: alert.destination,
      cabinClass: alert.cabinClass,
      previousPriceUsd,
      newPriceUsd,
      triggeredAt: new Date().toISOString(),
    };

    setPriceNotifications((prev) => [notification, ...prev].slice(0, 3));
    setPriceAlerts((prev) =>
      prev.map((item) =>
        item.id === alert.id
          ? {
              ...item,
              lastNotifiedAt: notification.triggeredAt,
              lastDropPriceUsd: newPriceUsd,
            }
          : item
      )
    );

    const dismissTimer = window.setTimeout(() => {
      setPriceNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    }, 15_000);
    simulationTimersRef.current.push(dismissTimer);
  }, []);

  // Periodic background simulation for active alerts of the logged-in user
  useEffect(() => {
    if (!currentUser || !siteSettings.flightAlertsEnabled) return;
    const activeAlerts = userPriceAlerts.filter((a) => a.isActive);
    if (activeAlerts.length === 0) return;

    const intervalId = window.setInterval(() => {
      const candidate =
        activeAlerts.find((a) => !a.lastNotifiedAt) || activeAlerts[0];
      if (candidate) {
        triggerSimulatedPriceDrop(candidate);
      }
    }, 45_000);

    return () => window.clearInterval(intervalId);
  }, [
    currentUser,
    siteSettings.flightAlertsEnabled,
    userPriceAlerts,
    triggerSimulatedPriceDrop,
  ]);

  const handleOpenPriceAlerts = () => {
    if (!currentUser) {
      setAuthNotice(
        'سجّل دخولك لتفعيل تنبيهات انخفاض الأسعار لهذا المسار واستلام الإشعارات الفورية.'
      );
      setPendingAlertModalAfterAuth(true);
      setIsAuthOpen(true);
      return;
    }
    setIsPriceAlertOpen(true);
  };

  const handleSubscribePriceAlert = (
    payload: Omit<RoutePriceAlert, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (!currentUser) return;

    const existing = priceAlerts.find(
      (a) =>
        a.userId === currentUser.id &&
        a.origin === payload.origin &&
        a.destination === payload.destination &&
        a.cabinClass === payload.cabinClass
    );

    let savedAlert: RoutePriceAlert;
    if (existing) {
      savedAlert = {
        ...existing,
        baselinePriceUsd: payload.baselinePriceUsd,
        targetPriceUsd: payload.targetPriceUsd,
        isActive: true,
      };
      setPriceAlerts((prev) =>
        prev.map((a) => (a.id === existing.id ? savedAlert : a))
      );
    } else {
      savedAlert = {
        ...payload,
        id: `alert-${Date.now()}`,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      setPriceAlerts((prev) => [savedAlert, ...prev]);
    }

    if (siteSettings.flightAlertsEnabled) {
      const timerId = window.setTimeout(() => {
        triggerSimulatedPriceDrop(savedAlert);
      }, 5000);
      simulationTimersRef.current.push(timerId);
    }
  };

  const handleTogglePriceAlert = (alertId: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleDeletePriceAlert = (alertId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleSelectNotifiedRoute = (notification: PriceDropNotification) => {
    setSearchQuery((prev) => ({
      ...prev,
      tripType: prev.tripType === 'multi-city' ? 'round-trip' : prev.tripType,
      origin: notification.origin,
      destination: notification.destination,
      cabinClass: notification.cabinClass,
    }));
    setActiveTab('search');
    setPriceNotifications((prev) =>
      prev.filter((n) => n.id !== notification.id)
    );
    window.setTimeout(() => {
      const resultsEl = document.getElementById('flight-results-section');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const activeRouteAlert = useMemo(
    () =>
      userPriceAlerts.find(
        (a) =>
          a.origin === activeRouteParams.origin &&
          a.destination === activeRouteParams.destination &&
          a.cabinClass === activeRouteParams.cabinClass &&
          a.isActive
      ) || null,
    [userPriceAlerts, activeRouteParams]
  );

  const activePreset = BACKGROUND_PRESETS[siteSettings.backgroundPreset];
  const activeBgHex = resolvedIsDark
    ? activePreset.bgHex
    : activePreset.lightBgHex;
  const activeAccent = ACCENT_COLORS[siteSettings.accentColor];
  const currentOriginAirport = getAirportByCode(activeRouteParams.origin);
  const currentDestAirport = getAirportByCode(activeRouteParams.destination);

  const themeModeLabel =
    siteSettings.themeMode === 'auto'
      ? `تلقائي (${resolvedIsDark ? 'داكن' : 'فاتح'})`
      : siteSettings.themeMode === 'dark'
        ? 'داكن'
        : 'فاتح';

  return (
    <div
      className="min-h-screen flex flex-col text-slate-900 dark:text-slate-100 relative transition-colors duration-300"
      style={{ backgroundColor: activeBgHex }}
    >
      {/* Dynamic Ambient Sky Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden opacity-45 dark:opacity-100 transition-opacity duration-300"
      >
        <div
          className="absolute -top-40 right-1/4 w-[640px] h-[440px] rounded-full blur-[140px] transition-colors duration-500"
          style={{ backgroundColor: activePreset.glowPrimary }}
        />
        <div
          className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full blur-[140px] transition-colors duration-500"
          style={{ backgroundColor: activePreset.glowSecondary }}
        />
      </div>

      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedTripsCount={bookedTrips.length}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAccountSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 relative z-10">
        {/* Main Page Quick Controls Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
            {currentUser ? (
              <span>
                مرحباً،{' '}
                <strong className="text-slate-900 dark:text-white">
                  {currentUser.fullName}
                </strong>
              </span>
            ) : (
              <span>مرحباً بك في منصة أفق للطيران</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCycleThemeMode}
              title="تبديل وضع الإضاءة (تلقائي / داكن / فاتح)"
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-white/85 dark:bg-slate-900/70 hover:border-sky-400/50 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs dark:shadow-none"
            >
              {siteSettings.themeMode === 'auto' ? (
                <Monitor className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              ) : siteSettings.themeMode === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>المظهر: {themeModeLabel}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrency((prev) => (prev === 'USD' ? 'IQD' : 'USD'))
              }
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-white/85 dark:bg-slate-900/70 hover:border-sky-400/50 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer tabular-nums shadow-xs dark:shadow-none"
            >
              <Coins className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{currency === 'USD' ? 'العملة: USD $' : 'العملة: IQD د.ع'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPriceAlerts}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs dark:shadow-none ${
                userPriceAlerts.some((a) => a.isActive)
                  ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/20'
                  : 'border-slate-200 dark:border-white/15 bg-white/85 dark:bg-slate-900/70 hover:border-sky-400/50 text-slate-700 dark:text-slate-200'
              }`}
            >
              {userPriceAlerts.some((a) => a.isActive) ? (
                <BellRing className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              )}
              <span>
                تنبيهات الأسعار
                {currentUser && userPriceAlerts.length > 0
                  ? ` (${userPriceAlerts.filter((a) => a.isActive).length})`
                  : ''}
              </span>
            </button>

            {!currentUser && (
              <button
                type="button"
                onClick={() => {
                  setAuthNotice(undefined);
                  setPendingAlertModalAfterAuth(false);
                  setIsAuthOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-white/85 dark:bg-slate-900/70 hover:border-sky-400/50 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs dark:shadow-none"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>دخول المسافر</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 rounded-xl border border-sky-500/35 dark:border-sky-400/35 bg-sky-500/12 dark:bg-sky-500/15 hover:bg-sky-500/20 dark:hover:bg-sky-500/25 text-xs font-bold text-sky-700 dark:text-sky-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-sky-600 dark:text-sky-300" />
              <span>إعدادات الموقع</span>
            </button>
          </div>
        </div>

        {/* Confirmation Toast Banner */}
        {bookingBannerPnr && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/12 border border-emerald-500/35 dark:border-emerald-400/35 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  تم تأكيد حجزك برقم المرجع{' '}
                  <strong className="font-mono-tabular text-slate-900 dark:text-white">
                    {bookingBannerPnr}
                  </strong>{' '}
                  وحفظ بطاقة الصعود في قسم «رحلاتي».
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('trips');
                    setBookingBannerPnr(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
                >
                  عرض رحلاتي
                </button>
                <button
                  type="button"
                  onClick={() => setBookingBannerPnr(null)}
                  aria-label="إغلاق الإشعار"
                  className="p-1 text-emerald-700 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <>
            {/* Atmospheric Hero & Search Engine */}
            <section className="relative z-40 border-b border-slate-200/80 dark:border-white/10 mt-3">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                {siteSettings.showHeroBackdrop && !heroImgFailed && (
                  <img
                    src={HERO_IMAGE_PATH}
                    alt="منظر جوي من نافذة الطائرة فوق السحب عند الغسق"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-35 transition-opacity duration-300"
                  />
                )}
                <div
                  className="absolute inset-0 transition-colors duration-300"
                  style={{
                    background: `linear-gradient(to bottom, ${activeBgHex}CC, ${activeBgHex}B8, ${activeBgHex})`,
                  }}
                />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-8">
                <div className="max-w-2xl space-y-3">
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight [text-wrap:balance]">
                    سافر بثقة عبر شبكة{' '}
                    <span
                      style={{
                        color: resolvedIsDark ? activeAccent.hex : '#0284C7',
                      }}
                    >
                      أفق للطيران
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    ابحث عن أفضل الرحلات من بغداد وأربيل والبصرة والنجف إلى أبرز الوجهات العالمية، واختر مقعدك مباشرة وأصدر بطاقة الصعود الإلكترونية خلال ثوانٍ.
                  </p>
                </div>

                <FlightSearchForm
                  initialQuery={searchQuery}
                  onSearch={handleSearch}
                />
              </div>
            </section>

            {/* Results & Filters Workspace */}
            <section
              id="flight-results-section"
              className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    الرحلات من {currentOriginAirport.cityAr} (
                    <span
                      className="font-mono-tabular"
                      style={{
                        color: resolvedIsDark ? activeAccent.hex : '#0284C7',
                      }}
                    >
                      {currentOriginAirport.code}
                    </span>
                    ) إلى {currentDestAirport.cityAr} (
                    <span
                      className="font-mono-tabular"
                      style={{
                        color: resolvedIsDark ? activeAccent.hex : '#0284C7',
                      }}
                    >
                      {currentDestAirport.code}
                    </span>
                    )
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    أسعار شاملة للضرائب مع إمكانية اختيار المقعد وإصدار بطاقة الصعود فوراً
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleOpenPriceAlerts}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs dark:shadow-none ${
                      activeRouteAlert
                        ? 'border-emerald-500/45 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/25'
                        : 'border-sky-500/35 dark:border-sky-400/35 bg-white/85 dark:bg-slate-900/80 hover:border-sky-400 text-sky-700 dark:text-sky-200'
                    }`}
                  >
                    {activeRouteAlert ? (
                      <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Bell className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    )}
                    <span>
                      {activeRouteAlert
                        ? 'تنبيه السعر مفعّل لهذا المسار'
                        : 'تفعيل تنبيه انخفاض السعر'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMobileFilters((v) => !v)}
                    className="lg:hidden px-4 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-white/85 dark:bg-slate-900/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer shadow-xs dark:shadow-none"
                  >
                    <Filter className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>{showMobileFilters ? 'إخفاء الفلاتر' : 'تصفية النتائج'}</span>
                  </button>
                </div>
              </div>

              {searchQuery.tripType === 'multi-city' && (
                <div className="flex flex-wrap items-center gap-2">
                  {searchQuery.multiCityLegs.map((leg, idx) => {
                    const active = idx === activeMultiCityLegIdx;
                    const o = getAirportByCode(leg.origin);
                    const d = getAirportByCode(leg.destination);
                    return (
                      <button
                        key={leg.id}
                        type="button"
                        onClick={() => setActiveMultiCityLegIdx(idx)}
                        className={`px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                          active
                            ? 'bg-sky-500 border-sky-400 text-white dark:text-slate-950'
                            : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/25'
                        }`}
                      >
                        الوجهة {idx + 1}: {o.cityAr} ← {d.cityAr}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div
                  className={`lg:col-span-3 ${
                    showMobileFilters ? 'block' : 'hidden lg:block'
                  }`}
                >
                  <FlightFilters
                    filters={filters}
                    onChange={setFilters}
                    minAvailableUsd={minPriceUsd}
                    maxAvailableUsd={maxPriceUsd}
                    availableAirlines={availableAirlines}
                    currency={currency}
                    onReset={handleResetFilters}
                  />
                </div>

                <div className="lg:col-span-9">
                  <FlightResults
                    flights={filteredAndSortedFlights}
                    totalUnfilteredCount={rawFlights.length}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    currency={currency}
                    passengers={searchQuery.passengers}
                    onSelectFlight={(flight) => {
                      setViewingTripPass(null);
                      setSelectedFlightForBooking(flight);
                    }}
                    onResetFilters={handleResetFilters}
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'radar' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <FlightRadarTab />
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <MyTripsTab
              trips={bookedTrips}
              currency={currency}
              onViewBoardingPass={(trip) => {
                setSelectedFlightForBooking(null);
                setViewingTripPass(trip);
              }}
              onCancelTrip={handleCancelTrip}
              onGoToSearch={() => setActiveTab('search')}
            />
          </div>
        )}
      </main>

      <Footer
        onNavigate={setActiveTab}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Booking & Boarding Pass Modal */}
      {(selectedFlightForBooking || viewingTripPass) && (
        <BookingModal
          flight={selectedFlightForBooking}
          existingTrip={viewingTripPass}
          currentUser={currentUser}
          passengers={searchQuery.passengers}
          currency={currency}
          onClose={() => {
            setSelectedFlightForBooking(null);
            setViewingTripPass(null);
          }}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthNotice(undefined);
          setPendingAlertModalAfterAuth(false);
        }}
        registeredUsers={registeredUsers}
        notice={authNotice}
        onSignIn={(user) => {
          setSessionUserId(user.id);
          setAuthNotice(undefined);
          if (pendingAlertModalAfterAuth) {
            setPendingAlertModalAfterAuth(false);
            setIsPriceAlertOpen(true);
          }
        }}
        onRegister={(newUser) => {
          setRegisteredUsers((prev) => [newUser, ...prev]);
          setSessionUserId(newUser.id);
          setAuthNotice(undefined);
          if (pendingAlertModalAfterAuth) {
            setPendingAlertModalAfterAuth(false);
            setIsPriceAlertOpen(true);
          }
        }}
      />

      {/* Route Price Alert Modal */}
      <PriceAlertModal
        isOpen={isPriceAlertOpen}
        onClose={() => setIsPriceAlertOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthNotice(
            'سجّل دخولك لتفعيل تنبيهات انخفاض الأسعار لهذا المسار واستلام الإشعارات الفورية.'
          );
          setPendingAlertModalAfterAuth(true);
          setIsAuthOpen(true);
        }}
        currentOrigin={activeRouteParams.origin}
        currentDestination={activeRouteParams.destination}
        currentCabinClass={activeRouteParams.cabinClass}
        currentLowestPriceUsd={minPriceUsd}
        currency={currency}
        alerts={userPriceAlerts}
        onSubscribe={handleSubscribePriceAlert}
        onToggleAlert={handleTogglePriceAlert}
        onDeleteAlert={handleDeletePriceAlert}
        onSimulateDrop={triggerSimulatedPriceDrop}
        alertsEnabledInSettings={siteSettings.flightAlertsEnabled}
      />

      {/* Site Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={siteSettings}
        onUpdateSettings={handleUpdateSettings}
        resolvedIsDark={resolvedIsDark}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={() => setSessionUserId(null)}
        onOpenAuth={() => {
          setAuthNotice(undefined);
          setPendingAlertModalAfterAuth(false);
          setIsAuthOpen(true);
        }}
        onClearSavedTrips={() => setBookedTrips([])}
        savedTripsCount={bookedTrips.length}
      />

      {/* Contact Support Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Simulated Price Drop Toast Stack */}
      <PriceDropToastStack
        notifications={priceNotifications}
        currency={currency}
        onDismiss={(id) =>
          setPriceNotifications((prev) => prev.filter((n) => n.id !== id))
        }
        onSelectRoute={handleSelectNotifiedRoute}
      />
    </div>
  );
}
