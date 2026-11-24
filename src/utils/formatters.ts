import { AIRPORTS, IQD_EXCHANGE_RATE } from '@/src/data/aviationData';
import { Currency, TimeOfDay } from '@/src/types/aviation';

export function formatPrice(usdAmount: number, currency: Currency): string {
  if (currency === 'IQD') {
    const iqd = Math.round((usdAmount * IQD_EXCHANGE_RATE) / 1000) * 1000;
    return `${iqd.toLocaleString('en-US')} د.ع`;
  }
  return `$${usdAmount.toLocaleString('en-US')}`;
}

export function formatDurationAr(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins} د`;
  if (mins === 0) return `${hours} س`;
  return `${hours} س ${mins} د`;
}

export function getAirportByCode(code: string) {
  return AIRPORTS.find((a) => a.code === code) || AIRPORTS[0];
}

export function classifyTimeOfDay(hhmm: string): TimeOfDay {
  const hour = parseInt(hhmm.split(':')[0] || '0', 10);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function generatePNR(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getDefaultDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export function formatDateAr(isoDate: string): string {
  if (!isoDate) return '';
  try {
    const d = new Date(`${isoDate}T00:00:00`);
    return new Intl.DateTimeFormat('ar-IQ', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoDate;
  }
}
