export type TripType = 'round-trip' | 'one-way' | 'multi-city';

export type CabinClass = 'economy' | 'business' | 'first';

export type Currency = 'USD' | 'IQD';

export type AppTab = 'search' | 'radar' | 'trips';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type SortOption = 'cheapest' | 'fastest' | 'best';

export type FlightRadarStatus = 'in_air' | 'on_time' | 'delayed' | 'landed';

export interface Airport {
  code: string;
  cityAr: string;
  countryAr: string;
  nameAr: string;
  region: 'iraq' | 'middle-east' | 'europe';
  lat: number;
  lng: number;
}

export interface Airline {
  code: string;
  nameAr: string;
  nameEn: string;
  accentColor: string;
  bgTint: string;
  rating: number;
}

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface MultiCityLeg {
  id: string;
  origin: string;
  destination: string;
  date: string;
}

export interface SearchQuery {
  tripType: TripType;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  multiCityLegs: MultiCityLeg[];
  passengers: PassengerCounts;
  cabinClass: CabinClass;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  durationMinutes: number;
  stops: 0 | 1;
  layoverAirport?: string;
  layoverMinutes?: number;
  aircraft: string;
  baggageKg: number;
  cabinBaggageKg: number;
  priceUsd: number;
  cabinClass: CabinClass;
  rating: number;
  terminal: string;
  gate: string;
  boardingTime: string;
  isReturnIncluded?: boolean;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
}

export interface FlightFilterState {
  maxPriceUsd: number;
  stops: 'all' | 'direct' | 'one-stop';
  timeOfDay: TimeOfDay[];
  airlines: string[];
}

export type SeatStatus = 'available' | 'occupied' | 'extra_legroom';

export interface SeatInfo {
  id: string;
  row: number;
  column: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  status: SeatStatus;
  extraPriceUsd: number;
  isExitRow: boolean;
  cabinZone: CabinClass;
}

export interface PassengerDetails {
  fullName: string;
  passportNumber: string;
  email: string;
  phone: string;
}

export interface BookedTrip {
  id: string;
  pnr: string;
  flight: Flight;
  selectedSeats: string[];
  seatUpgradeUsd: number;
  passengers: PassengerCounts;
  passengerDetails: PassengerDetails;
  totalPriceUsd: number;
  currencyAtBooking: Currency;
  bookedAt: string;
  status: 'confirmed' | 'checked_in';
}

export interface LiveFlightRadarItem {
  flightNumber: string;
  airlineCode: string;
  origin: string;
  destination: string;
  departureTime: string;
  estimatedArrivalTime: string;
  scheduledArrivalTime: string;
  progressPercent: number;
  altitudeFt: number;
  speedKmh: number;
  aircraft: string;
  terminal: string;
  gate: string;
  status: FlightRadarStatus;
  distanceKm: number;
  remainingTimeMinutes: number;
}

export type ThemeMode = 'auto' | 'dark' | 'light';

export type BackgroundPresetId =
  | 'midnight_navy'
  | 'deep_ocean'
  | 'arctic_aurora'
  | 'obsidian_slate';

export type AccentColorId = 'sky' | 'emerald' | 'amber' | 'violet';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  password: string;
  passportNumber?: string;
  createdAt: string;
}

export interface SiteSettings {
  themeMode: ThemeMode;
  autoDarkSchedule: boolean;
  backgroundPreset: BackgroundPresetId;
  accentColor: AccentColorId;
  showHeroBackdrop: boolean;
  glassIntensity: 'standard' | 'high';
  defaultCurrency: Currency;
  defaultCabinClass: CabinClass;
  flightAlertsEnabled: boolean;
  autoSaveSearch: boolean;
}

