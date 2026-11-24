import {
  AccentColorId,
  BackgroundPresetId,
  SiteSettings,
} from '@/src/types/aviation';

export interface BackgroundPresetConfig {
  id: BackgroundPresetId;
  nameAr: string;
  descriptionAr: string;
  bgHex: string;
  lightBgHex: string;
  glowPrimary: string;
  glowSecondary: string;
  previewGradient: string;
}

export const BACKGROUND_PRESETS: Record<
  BackgroundPresetId,
  BackgroundPresetConfig
> = {
  midnight_navy: {
    id: 'midnight_navy',
    nameAr: 'منتصف الليل الكلاسيكي',
    descriptionAr: 'كحلي داكن عميق مع توهج سماوي هادئ',
    bgHex: '#070B19',
    lightBgHex: '#F1F5F9',
    glowPrimary: 'rgba(14, 165, 233, 0.14)',
    glowSecondary: 'rgba(6, 182, 212, 0.08)',
    previewGradient: 'linear-gradient(135deg, #070B19 0%, #0E1B38 100%)',
  },
  deep_ocean: {
    id: 'deep_ocean',
    nameAr: 'أعماق المحيط الليلي',
    descriptionAr: 'تدرجات زرقاء بحرية مع إضاءة فيروزية',
    bgHex: '#04121F',
    lightBgHex: '#ECFEFF',
    glowPrimary: 'rgba(20, 184, 166, 0.16)',
    glowSecondary: 'rgba(14, 165, 233, 0.10)',
    previewGradient: 'linear-gradient(135deg, #04121F 0%, #0A253A 100%)',
  },
  arctic_aurora: {
    id: 'arctic_aurora',
    nameAr: 'شفق أفق الطيران',
    descriptionAr: 'سماء قطبية داكنة مع هالة أرجوانية سماوية',
    bgHex: '#0A091B',
    lightBgHex: '#EEF2FF',
    glowPrimary: 'rgba(99, 102, 241, 0.16)',
    glowSecondary: 'rgba(56, 189, 248, 0.10)',
    previewGradient: 'linear-gradient(135deg, #0A091B 0%, #19173B 100%)',
  },
  obsidian_slate: {
    id: 'obsidian_slate',
    nameAr: 'الليلي الكربوني الداكن',
    descriptionAr: 'رمادي داكن محايد لتباين بصري عالٍ',
    bgHex: '#090D16',
    lightBgHex: '#F8FAFC',
    glowPrimary: 'rgba(148, 163, 184, 0.10)',
    glowSecondary: 'rgba(56, 189, 248, 0.07)',
    previewGradient: 'linear-gradient(135deg, #090D16 0%, #161E2E 100%)',
  },
};

export const ACCENT_COLORS: Record<
  AccentColorId,
  { id: AccentColorId; nameAr: string; hex: string; softBg: string }
> = {
  sky: {
    id: 'sky',
    nameAr: 'سماوي أفق',
    hex: '#38BDF8',
    softBg: 'rgba(56, 189, 248, 0.15)',
  },
  emerald: {
    id: 'emerald',
    nameAr: 'زمردي هادئ',
    hex: '#34D399',
    softBg: 'rgba(52, 211, 153, 0.15)',
  },
  amber: {
    id: 'amber',
    nameAr: 'ذهبي كهرماني',
    hex: '#FBBF24',
    softBg: 'rgba(251, 191, 36, 0.15)',
  },
  violet: {
    id: 'violet',
    nameAr: 'بنفسجي ليلي',
    hex: '#A78BFA',
    softBg: 'rgba(167, 139, 250, 0.15)',
  },
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  themeMode: 'auto',
  autoDarkSchedule: false,
  backgroundPreset: 'midnight_navy',
  accentColor: 'sky',
  showHeroBackdrop: true,
  glassIntensity: 'standard',
  defaultCurrency: 'USD',
  defaultCabinClass: 'economy',
  flightAlertsEnabled: true,
  autoSaveSearch: true,
};
