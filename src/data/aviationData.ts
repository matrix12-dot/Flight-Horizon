import {
  Airline,
  Airport,
  CabinClass,
  Flight,
  LiveFlightRadarItem,
  SeatInfo,
} from '@/src/types/aviation';

export const IQD_EXCHANGE_RATE = 1310;

export const AIRPORTS: Airport[] = [
  {
    code: 'BGW',
    cityAr: 'بغداد',
    countryAr: 'العراق',
    nameAr: 'مطار بغداد الدولي',
    region: 'iraq',
    lat: 33.2625,
    lng: 44.2346,
  },
  {
    code: 'EBL',
    cityAr: 'أربيل',
    countryAr: 'العراق',
    nameAr: 'مطار أربيل الدولي',
    region: 'iraq',
    lat: 36.2376,
    lng: 43.9632,
  },
  {
    code: 'BSR',
    cityAr: 'البصرة',
    countryAr: 'العراق',
    nameAr: 'مطار البصرة الدولي',
    region: 'iraq',
    lat: 30.5491,
    lng: 47.6621,
  },
  {
    code: 'NJF',
    cityAr: 'النجف',
    countryAr: 'العراق',
    nameAr: 'مطار النجف الأشرف الدولي',
    region: 'iraq',
    lat: 31.9899,
    lng: 44.4043,
  },
  {
    code: 'ISU',
    cityAr: 'السليمانية',
    countryAr: 'العراق',
    nameAr: 'مطار السليمانية الدولي',
    region: 'iraq',
    lat: 35.5608,
    lng: 45.3147,
  },
  {
    code: 'DXB',
    cityAr: 'دبي',
    countryAr: 'الإمارات العربية المتحدة',
    nameAr: 'مطار دبي الدولي',
    region: 'middle-east',
    lat: 25.2532,
    lng: 55.3657,
  },
  {
    code: 'IST',
    cityAr: 'إسطنبول',
    countryAr: 'تركيا',
    nameAr: 'مطار إسطنبول الدولي',
    region: 'europe',
    lat: 41.2753,
    lng: 28.7519,
  },
  {
    code: 'CAI',
    cityAr: 'القاهرة',
    countryAr: 'مصر',
    nameAr: 'مطار القاهرة الدولي',
    region: 'middle-east',
    lat: 30.1219,
    lng: 31.4056,
  },
  {
    code: 'DOH',
    cityAr: 'الدوحة',
    countryAr: 'قطر',
    nameAr: 'مطار حمد الدولي',
    region: 'middle-east',
    lat: 25.2731,
    lng: 51.6081,
  },
  {
    code: 'AMM',
    cityAr: 'عمّان',
    countryAr: 'الأردن',
    nameAr: 'مطار الملكة علياء الدولي',
    region: 'middle-east',
    lat: 31.7226,
    lng: 35.9932,
  },
  {
    code: 'LHR',
    cityAr: 'لندن',
    countryAr: 'المملكة المتحدة',
    nameAr: 'مطار لندن هيثرو',
    region: 'europe',
    lat: 51.47,
    lng: -0.4543,
  },
  {
    code: 'FRA',
    cityAr: 'فرانكفورت',
    countryAr: 'ألمانيا',
    nameAr: 'مطار فرانكفورت الدولي',
    region: 'europe',
    lat: 50.0379,
    lng: 8.5622,
  },
];

export const AIRLINES: Record<string, Airline> = {
  OQ: {
    code: 'OQ',
    nameAr: 'طيران أفق',
    nameEn: 'Ofoq Airways',
    accentColor: '#38BDF8',
    bgTint: 'rgba(56, 189, 248, 0.14)',
    rating: 4.9,
  },
  IA: {
    code: 'IA',
    nameAr: 'الخطوط الجوية العراقية',
    nameEn: 'Iraqi Airways',
    accentColor: '#10B981',
    bgTint: 'rgba(16, 185, 129, 0.14)',
    rating: 4.5,
  },
  EK: {
    code: 'EK',
    nameAr: 'طيران الإمارات',
    nameEn: 'Emirates',
    accentColor: '#F59E0B',
    bgTint: 'rgba(245, 158, 11, 0.14)',
    rating: 4.9,
  },
  TK: {
    code: 'TK',
    nameAr: 'الخطوط التركية',
    nameEn: 'Turkish Airlines',
    accentColor: '#F43F5E',
    bgTint: 'rgba(244, 63, 94, 0.14)',
    rating: 4.8,
  },
  QR: {
    code: 'QR',
    nameAr: 'الخطوط القطرية',
    nameEn: 'Qatar Airways',
    accentColor: '#A78BFA',
    bgTint: 'rgba(167, 139, 250, 0.14)',
    rating: 4.9,
  },
  RJ: {
    code: 'RJ',
    nameAr: 'الملكية الأردنية',
    nameEn: 'Royal Jordanian',
    accentColor: '#60A5FA',
    bgTint: 'rgba(96, 165, 250, 0.14)',
    rating: 4.6,
  },
  LH: {
    code: 'LH',
    nameAr: 'لوفتهانزا',
    nameEn: 'Lufthansa',
    accentColor: '#FBBF24',
    bgTint: 'rgba(251, 191, 36, 0.14)',
    rating: 4.7,
  },
  MS: {
    code: 'MS',
    nameAr: 'مصر للطيران',
    nameEn: 'EgyptAir',
    accentColor: '#2DD4BF',
    bgTint: 'rgba(45, 212, 191, 0.14)',
    rating: 4.4,
  },
};

export const CABIN_LABELS: Record<CabinClass, string> = {
  economy: 'الدرجة السياحية',
  business: 'درجة رجال الأعمال',
  first: 'الدرجة الأولى',
};

const CABIN_PRICE_MULTIPLIER: Record<CabinClass, number> = {
  economy: 1,
  business: 2.35,
  first: 3.9,
};

const CABIN_BAGGAGE_KG: Record<CabinClass, number> = {
  economy: 30,
  business: 40,
  first: 50,
};

function haversineDistanceKm(a: Airport, b: Airport): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function addMinutesToTime(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (h * 60 + m + mins + 1440) % 1440;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function subtractMinutesFromTime(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (h * 60 + m - mins + 1440) % 1440;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function deterministicHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

const LAYOVER_HUBS = ['DOH', 'DXB', 'IST', 'AMM'];

const AIRCRAFT_POOL = [
  'Boeing 787-9 Dreamliner',
  'Airbus A350-900',
  'Airbus A321neo',
  'Boeing 737 MAX 8',
  'Boeing 777-300ER',
];

export function generateFlightsForRoute(params: {
  origin: string;
  destination: string;
  departureDate: string;
  cabinClass: CabinClass;
  isRoundTrip: boolean;
}): Flight[] {
  const originAirport = AIRPORTS.find((a) => a.code === params.origin) || AIRPORTS[0];
  const destAirport = AIRPORTS.find((a) => a.code === params.destination) || AIRPORTS[5];

  const distKm = Math.max(480, haversineDistanceKm(originAirport, destAirport));
  const baseDirectMinutes = Math.round((distKm / 780) * 60) + 35;
  const baseUsd = Math.round(145 + distKm * 0.13);

  const routeKey = `${originAirport.code}-${destAirport.code}-${params.departureDate}`;
  const seed = deterministicHash(routeKey);

  const preferredAirlines = ['OQ', 'IA', 'EK', 'TK', 'QR', 'RJ', 'LH', 'MS'];

  const departureSlots = [
    '06:15',
    '09:40',
    '12:30',
    '15:20',
    '18:45',
    '21:10',
    '23:35',
  ];

  const layoverCandidates = LAYOVER_HUBS.filter(
    (code) => code !== originAirport.code && code !== destAirport.code
  );

  const flights: Flight[] = departureSlots.map((depTime, idx) => {
    const airlineCode = preferredAirlines[(seed + idx) % preferredAirlines.length];
    const airline = AIRLINES[airlineCode];
    const isOneStop = idx === 2 || idx === 4 || (distKm > 3200 && idx === 6);
    const stops: 0 | 1 = isOneStop ? 1 : 0;
    const layoverMinutes = isOneStop ? 65 + ((seed + idx * 17) % 75) : 0;
    const durationMinutes =
      baseDirectMinutes + (isOneStop ? layoverMinutes + 40 : (idx % 3) * 10);

    const arrivalTime = addMinutesToTime(depTime, durationMinutes);
    const boardingTime = subtractMinutesFromTime(depTime, 45);

    const airlineMultiplier =
      airlineCode === 'EK' || airlineCode === 'QR'
        ? 1.18
        : airlineCode === 'IA' || airlineCode === 'MS'
          ? 0.92
          : airlineCode === 'OQ'
            ? 1.02
            : 1.08;

    const stopDiscount = isOneStop ? 0.84 : 1;
    const slotVariance = 0.92 + ((seed + idx * 13) % 24) / 100;
    const roundTripFactor = params.isRoundTrip ? 1.82 : 1;

    const priceUsd = Math.round(
      baseUsd *
        airlineMultiplier *
        stopDiscount *
        slotVariance *
        CABIN_PRICE_MULTIPLIER[params.cabinClass] *
        roundTripFactor
    );

    const flightNumDigits = 100 + ((seed + idx * 73) % 880);
    const gateLetters = ['A', 'B', 'C', 'D'];
    const gate = `${gateLetters[(seed + idx) % gateLetters.length]}${10 + ((seed + idx * 3) % 18)}`;

    return {
      id: `${routeKey}-${airlineCode}-${flightNumDigits}-${idx}`,
      flightNumber: `${airlineCode}-${flightNumDigits}`,
      airlineCode,
      origin: originAirport.code,
      destination: destAirport.code,
      departureTime: depTime,
      arrivalTime,
      departureDate: params.departureDate,
      durationMinutes,
      stops,
      layoverAirport: isOneStop
        ? layoverCandidates[(seed + idx) % layoverCandidates.length]
        : undefined,
      layoverMinutes: isOneStop ? layoverMinutes : undefined,
      aircraft: AIRCRAFT_POOL[(seed + idx) % AIRCRAFT_POOL.length],
      baggageKg: CABIN_BAGGAGE_KG[params.cabinClass],
      cabinBaggageKg: params.cabinClass === 'economy' ? 7 : 12,
      priceUsd,
      cabinClass: params.cabinClass,
      rating: Number((airline.rating - (isOneStop ? 0.2 : 0)).toFixed(1)),
      terminal: `مبنى ${1 + ((seed + idx) % 3)}`,
      gate,
      boardingTime,
      isReturnIncluded: params.isRoundTrip,
      returnDepartureTime: params.isRoundTrip
        ? addMinutesToTime(depTime, 180)
        : undefined,
      returnArrivalTime: params.isRoundTrip
        ? addMinutesToTime(addMinutesToTime(depTime, 180), durationMinutes)
        : undefined,
    };
  });

  return flights;
}

export function generateSeatMapForFlight(flightId: string, cabinClass: CabinClass): SeatInfo[] {
  const seed = deterministicHash(flightId);
  const columns: Array<'A' | 'B' | 'C' | 'D' | 'E' | 'F'> = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seats: SeatInfo[] = [];

  for (let row = 1; row <= 18; row++) {
    const cabinZone: CabinClass =
      row <= 2 ? 'first' : row <= 6 ? 'business' : 'economy';
    const isExitRow = row === 7 || row === 13;

    for (const column of columns) {
      const id = `${row}${column}`;
      const cellHash = deterministicHash(`${flightId}-${id}`);
      const occupiedThreshold = cabinZone === cabinClass ? 34 : 62;
      const isOccupied = (cellHash + seed) % 100 < occupiedThreshold;
      const isExtraLegroom = !isOccupied && (isExitRow || row <= 6);

      let extraPriceUsd = 0;
      if (isExitRow) extraPriceUsd = 28;
      else if (row <= 2) extraPriceUsd = cabinClass === 'first' ? 0 : 95;
      else if (row <= 6) extraPriceUsd = cabinClass === 'economy' ? 55 : 0;

      seats.push({
        id,
        row,
        column,
        status: isOccupied
          ? 'occupied'
          : isExtraLegroom
            ? 'extra_legroom'
            : 'available',
        extraPriceUsd,
        isExitRow,
        cabinZone,
      });
    }
  }

  return seats;
}

export const LIVE_RADAR_FLIGHTS: LiveFlightRadarItem[] = [
  {
    flightNumber: 'IA-102',
    airlineCode: 'IA',
    origin: 'BGW',
    destination: 'DXB',
    departureTime: '08:30',
    scheduledArrivalTime: '11:45',
    estimatedArrivalTime: '11:42',
    progressPercent: 64,
    altitudeFt: 37000,
    speedKmh: 865,
    aircraft: 'Boeing 787-9 Dreamliner',
    terminal: 'مبنى 1',
    gate: 'B14',
    status: 'in_air',
    distanceKm: 1390,
    remainingTimeMinutes: 52,
  },
  {
    flightNumber: 'EK-942',
    airlineCode: 'EK',
    origin: 'BGW',
    destination: 'DXB',
    departureTime: '11:20',
    scheduledArrivalTime: '14:35',
    estimatedArrivalTime: '14:35',
    progressPercent: 18,
    altitudeFt: 29400,
    speedKmh: 790,
    aircraft: 'Boeing 777-300ER',
    terminal: 'مبنى 3',
    gate: 'A08',
    status: 'on_time',
    distanceKm: 1390,
    remainingTimeMinutes: 118,
  },
  {
    flightNumber: 'TK-305',
    airlineCode: 'TK',
    origin: 'EBL',
    destination: 'IST',
    departureTime: '07:45',
    scheduledArrivalTime: '10:30',
    estimatedArrivalTime: '10:55',
    progressPercent: 78,
    altitudeFt: 38000,
    speedKmh: 882,
    aircraft: 'Airbus A321neo',
    terminal: 'مبنى 2',
    gate: 'C22',
    status: 'delayed',
    distanceKm: 1470,
    remainingTimeMinutes: 36,
  },
  {
    flightNumber: 'OQ-108',
    airlineCode: 'OQ',
    origin: 'BGW',
    destination: 'LHR',
    departureTime: '06:00',
    scheduledArrivalTime: '10:50',
    estimatedArrivalTime: '10:44',
    progressPercent: 51,
    altitudeFt: 39000,
    speedKmh: 904,
    aircraft: 'Airbus A350-900',
    terminal: 'مبنى 1',
    gate: 'A04',
    status: 'in_air',
    distanceKm: 4100,
    remainingTimeMinutes: 162,
  },
  {
    flightNumber: 'QR-451',
    airlineCode: 'QR',
    origin: 'BSR',
    destination: 'DOH',
    departureTime: '05:15',
    scheduledArrivalTime: '06:55',
    estimatedArrivalTime: '06:50',
    progressPercent: 100,
    altitudeFt: 0,
    speedKmh: 0,
    aircraft: 'Airbus A320neo',
    terminal: 'مبنى 1',
    gate: 'D11',
    status: 'landed',
    distanceKm: 710,
    remainingTimeMinutes: 0,
  },
  {
    flightNumber: 'IA-237',
    airlineCode: 'IA',
    origin: 'NJF',
    destination: 'CAI',
    departureTime: '13:10',
    scheduledArrivalTime: '15:20',
    estimatedArrivalTime: '15:20',
    progressPercent: 42,
    altitudeFt: 35000,
    speedKmh: 840,
    aircraft: 'Boeing 737 MAX 8',
    terminal: 'مبنى 2',
    gate: 'B06',
    status: 'in_air',
    distanceKm: 1290,
    remainingTimeMinutes: 74,
  },
  {
    flightNumber: 'LH-699',
    airlineCode: 'LH',
    origin: 'EBL',
    destination: 'FRA',
    departureTime: '09:15',
    scheduledArrivalTime: '13:45',
    estimatedArrivalTime: '14:10',
    progressPercent: 34,
    altitudeFt: 36000,
    speedKmh: 875,
    aircraft: 'Airbus A330-300',
    terminal: 'مبنى 1',
    gate: 'C09',
    status: 'delayed',
    distanceKm: 3180,
    remainingTimeMinutes: 175,
  },
  {
    flightNumber: 'RJ-811',
    airlineCode: 'RJ',
    origin: 'BSR',
    destination: 'AMM',
    departureTime: '06:40',
    scheduledArrivalTime: '08:30',
    estimatedArrivalTime: '08:28',
    progressPercent: 100,
    altitudeFt: 0,
    speedKmh: 0,
    aircraft: 'Embraer E195-E2',
    terminal: 'مبنى 1',
    gate: 'A15',
    status: 'landed',
    distanceKm: 1120,
    remainingTimeMinutes: 0,
  },
];
