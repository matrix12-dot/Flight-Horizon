import { useEffect, useState } from 'react';
import { CABIN_LABELS } from '@/src/data/aviationData';
import {
  ACCENT_COLORS,
  BACKGROUND_PRESETS,
  DEFAULT_SITE_SETTINGS,
} from '@/src/data/themePresets';
import {
  AccentColorId,
  BackgroundPresetId,
  CabinClass,
  SiteSettings,
  ThemeMode,
  UserAccount,
} from '@/src/types/aviation';
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Settings,
  Shield,
  Sliders,
  Sun,
  Trash2,
  User,
  X,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onUpdateSettings: (next: SiteSettings) => void;
  resolvedIsDark: boolean;
  currentUser: UserAccount | null;
  onUpdateUser: (updated: UserAccount) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onClearSavedTrips: () => void;
  savedTripsCount: number;
}

type SettingsSection = 'appearance' | 'security' | 'preferences';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  resolvedIsDark,
  currentUser,
  onUpdateUser,
  onLogout,
  onOpenAuth,
  onClearSavedTrips,
  savedTripsCount,
}: SettingsModalProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>('appearance');

  // Profile fields
  const [profileName, setProfileName] = useState(currentUser?.fullName || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePassport, setProfilePassport] = useState(
    currentUser?.passportNumber || ''
  );
  const [profileMessage, setProfileMessage] = useState('');

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [confirmClearTrips, setConfirmClearTrips] = useState(false);

  useEffect(() => {
    setProfileName(currentUser?.fullName || '');
    setProfileEmail(currentUser?.email || '');
    setProfilePassport(currentUser?.passportNumber || '');
    setProfileMessage('');
    setPasswordFeedback(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (profileName.trim().length < 3 || !profileEmail.includes('@')) return;

    onUpdateUser({
      ...currentUser,
      fullName: profileName.trim(),
      email: profileEmail.trim().toLowerCase(),
      passportNumber: profilePassport.trim().toUpperCase() || undefined,
    });
    setProfileMessage('تم تحديث بيانات الحساب بنجاح.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setPasswordFeedback(null);

    if (currentPassword !== currentUser.password) {
      setPasswordFeedback({
        type: 'error',
        text: 'كلمة المرور الحالية غير مطابقة.',
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: 'error',
        text: 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        text: 'تأكيد كلمة المرور الجديدة غير متطابق.',
      });
      return;
    }

    onUpdateUser({
      ...currentUser,
      password: newPassword,
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback({
      type: 'success',
      text: 'تم تغيير كلمة المرور بنجاح وحفظها في حسابك.',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="إعدادات الموقع والحساب"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-[#0B1224] border border-slate-200 dark:border-sky-400/25 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/65 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 dark:border-sky-400/30 flex items-center justify-center text-sky-700 dark:text-sky-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                إعدادات الموقع والحساب
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                الوضع الداكن التلقائي، تغيير الخلفية، إدارة كلمة المرور، وتفضيلات الحجز
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق الإعدادات"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          <aside className="md:col-span-4 border-b md:border-b-0 md:border-l border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/40 p-4 space-y-2 shrink-0">
            {[
              {
                id: 'appearance' as const,
                label: 'المظهر والخلفية',
                desc: 'الوضع الداكن التلقائي وتغيير الخلفية',
                Icon: Palette,
              },
              {
                id: 'security' as const,
                label: 'الحساب وكلمة السر',
                desc: 'الملف الشخصي وتغيير كلمة المرور',
                Icon: Shield,
              },
              {
                id: 'preferences' as const,
                label: 'تفضيلات السفر والبيانات',
                desc: 'العملة، الدرجة، وإدارة التخزين',
                Icon: Sliders,
              },
            ].map((item) => {
              const active = activeSection === item.id;
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-right p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    active
                      ? 'bg-sky-500/15 border-sky-500/45 dark:border-sky-400/45 text-slate-900 dark:text-white'
                      : 'bg-transparent border-transparent hover:bg-slate-200/60 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      active
                        ? 'text-sky-600 dark:text-sky-300'
                        : 'text-slate-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Main Settings Content */}
          <div className="md:col-span-8 p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* SECTION 1: APPEARANCE, AUTO DARK MODE & BACKGROUND */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                {/* Auto Dark Mode Selector */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        وضع الإضاءة (الداكن التلقائي)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        تبديل تلقائي حسب إعدادات نظام التشغيل أو التوقيت الليلي
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                      الوضع النشط الآن: {resolvedIsDark ? 'داكن' : 'فاتح'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {(
                      [
                        {
                          id: 'auto' as ThemeMode,
                          label: 'تلقائي',
                          sub: 'حسب النظام',
                          Icon: Monitor,
                        },
                        {
                          id: 'dark' as ThemeMode,
                          label: 'داكن',
                          sub: 'ليلي دائم',
                          Icon: Moon,
                        },
                        {
                          id: 'light' as ThemeMode,
                          label: 'فاتح',
                          sub: 'نهاري مشرق',
                          Icon: Sun,
                        },
                      ] as const
                    ).map((mode) => {
                      const active = settings.themeMode === mode.id;
                      const Icon = mode.Icon;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() =>
                            onUpdateSettings({
                              ...settings,
                              themeMode: mode.id,
                            })
                          }
                          className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-2.5 ${
                            active
                              ? 'border-sky-500 bg-sky-500/12 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/25'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              active
                                ? 'text-sky-600 dark:text-sky-300'
                                : 'text-slate-400'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold">
                              {mode.label}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {mode.sub}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {settings.themeMode === 'auto' && (
                    <label className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 cursor-pointer">
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                          الجدول الليلي التلقائي (6:00 مساءً – 6:00 صباحاً)
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          تفعيل الوضع الداكن تلقائياً أثناء ساعات المساء والليل بدلاً من تتبع النظام فقط
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoDarkSchedule}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            autoDarkSchedule: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded accent-sky-500 cursor-pointer"
                      />
                    </label>
                  )}
                </div>

                {/* Background Presets */}
                <div className="space-y-3 pt-5 border-t border-slate-200 dark:border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      خلفية الموقع والأجواء البصرية
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      اختر النمط اللوني لخلفية المنصة بالكامل
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      Object.keys(BACKGROUND_PRESETS) as BackgroundPresetId[]
                    ).map((presetId) => {
                      const preset = BACKGROUND_PRESETS[presetId];
                      const selected = settings.backgroundPreset === presetId;
                      return (
                        <button
                          key={presetId}
                          type="button"
                          onClick={() =>
                            onUpdateSettings({
                              ...settings,
                              backgroundPreset: presetId,
                            })
                          }
                          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                            selected
                              ? 'border-sky-500 bg-sky-500/12'
                              : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-white/25'
                          }`}
                        >
                          <span
                            className="w-11 h-11 rounded-xl border border-slate-300 dark:border-white/20 shrink-0 flex items-center justify-center"
                            style={{ background: preset.previewGradient }}
                          >
                            {selected && (
                              <Check className="w-4 h-4 text-sky-300" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {preset.nameAr}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {preset.descriptionAr}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-3 pt-5 border-t border-slate-200 dark:border-white/10">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    لون التمييز والإبراز
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(Object.keys(ACCENT_COLORS) as AccentColorId[]).map(
                      (colorId) => {
                        const color = ACCENT_COLORS[colorId];
                        const selected = settings.accentColor === colorId;
                        return (
                          <button
                            key={colorId}
                            type="button"
                            onClick={() =>
                              onUpdateSettings({
                                ...settings,
                                accentColor: colorId,
                              })
                            }
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                              selected
                                ? 'border-sky-500 bg-sky-500/10'
                                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-white/25'
                            }`}
                          >
                            <span
                              className="w-6 h-6 rounded-full border border-white/40 shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {color.nameAr}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Hero Image & Glass Blur Controls */}
                <div className="space-y-3 pt-5 border-t border-slate-200 dark:border-white/10">
                  <label className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 cursor-pointer">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        صورة الخلفية الجوية في الواجهة الرئيسية
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        إظهار أو إخفاء صورة جناح الطائرة في قسم البحث العلوي
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showHeroBackdrop}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          showHeroBackdrop: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded accent-sky-500 cursor-pointer"
                    />
                  </label>

                  <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        كثافة التمويه الزجاجي (Glass Blur)
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        ضبط شفافية البطاقات والنوافذ العائمة
                      </div>
                    </div>
                    <div className="inline-flex p-1 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-white/10">
                      {(
                        [
                          { id: 'standard', label: 'قياسي' },
                          { id: 'high', label: 'مكثّف' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            onUpdateSettings({
                              ...settings,
                              glassIntensity: opt.id,
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            settings.glassIntensity === opt.id
                              ? 'bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: ACCOUNT & CHANGE PASSWORD */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                {!currentUser ? (
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 dark:border-sky-400/30 flex items-center justify-center mx-auto text-sky-700 dark:text-sky-300">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        لم تقم بتسجيل الدخول بعد
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        سجّل الدخول أو أنشئ حساباً جديداً لتعديل ملفك الشخصي وتغيير كلمة المرور وتعبئة بيانات السفر تلقائياً.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-sm font-bold cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>تسجيل الدخول / إنشاء حساب</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Profile Details Form */}
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          البيانات الشخصية
                        </h3>
                        <button
                          type="button"
                          onClick={onLogout}
                          className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>

                      {profileMessage && (
                        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200">
                          {profileMessage}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block">
                          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            الاسم الكامل
                          </span>
                          <input
                            type="text"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            البريد الإلكتروني
                          </span>
                          <input
                            type="email"
                            required
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular"
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-end gap-3">
                        <label className="flex-1 min-w-[200px]">
                          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            رقم جواز السفر الافتراضي
                          </span>
                          <input
                            type="text"
                            value={profilePassport}
                            onChange={(e) => setProfilePassport(e.target.value)}
                            placeholder="A12345678"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular uppercase"
                          />
                        </label>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold cursor-pointer"
                        >
                          حفظ البيانات
                        </button>
                      </div>
                    </form>

                    {/* Change Password Form */}
                    <form
                      onSubmit={handleChangePassword}
                      className="space-y-4 pt-5 border-t border-slate-200 dark:border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            تغيير كلمة المرور
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPasswords((v) => !v)}
                          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          {showPasswords ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>إخفاء</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>إظهار</span>
                            </>
                          )}
                        </button>
                      </div>

                      {passwordFeedback && (
                        <div
                          className={`p-3 rounded-xl border text-xs ${
                            passwordFeedback.type === 'success'
                              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-800 dark:text-emerald-200'
                              : 'bg-rose-500/15 border-rose-500/35 text-rose-700 dark:text-rose-200'
                          }`}
                        >
                          {passwordFeedback.text}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="block">
                          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            كلمة المرور الحالية
                          </span>
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            كلمة المرور الجديدة
                          </span>
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="6 أحرف فأكثر"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            تأكيد الجديدة
                          </span>
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="أعد كتابتها"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular"
                          />
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl border border-sky-500/35 dark:border-sky-400/35 bg-sky-500/15 hover:bg-sky-500/25 text-sky-800 dark:text-sky-200 text-xs sm:text-sm font-bold cursor-pointer"
                      >
                        تحديث كلمة المرور
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* SECTION 3: TRAVEL PREFERENCES & DATA */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    تفضيلات العرض والحجز
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 space-y-2.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        العملة الافتراضية
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            { id: 'USD', label: 'دولار ($)' },
                            { id: 'IQD', label: 'دينار (د.ع)' },
                          ] as const
                        ).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() =>
                              onUpdateSettings({
                                ...settings,
                                defaultCurrency: c.id,
                              })
                            }
                            className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                              settings.defaultCurrency === c.id
                                ? 'bg-sky-600 dark:bg-sky-500 border-sky-500 dark:border-sky-400 text-white dark:text-slate-950'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 space-y-2.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        درجة السفر المفضلة
                      </span>
                      <select
                        value={settings.defaultCabinClass}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            defaultCabinClass: e.target.value as CabinClass,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                      >
                        {(['economy', 'business', 'first'] as CabinClass[]).map(
                          (c) => (
                            <option key={c} value={c}>
                              {CABIN_LABELS[c]}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notifications & Automation Toggles */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
                  <label className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 cursor-pointer">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        تنبيهات حالة الرحلة وتغيير البوابات
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        إظهار إشعارات فورية عند تحديث حالة الرحلات المتتبعة
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.flightAlertsEnabled}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          flightAlertsEnabled: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded accent-sky-500 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 cursor-pointer">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        حفظ آخر مسار بحث تلقائياً
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        استرجاع آخر مطار مغادرة ووجهة عند فتح الموقع مجدداً
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoSaveSearch}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          autoSaveSearch: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded accent-sky-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Data & Reset Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings(DEFAULT_SITE_SETTINGS)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>استعادة إعدادات المظهر الافتراضية</span>
                  </button>

                  {savedTripsCount > 0 &&
                    (!confirmClearTrips ? (
                      <button
                        type="button"
                        onClick={() => setConfirmClearTrips(true)}
                        className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>مسح الرحلات المحفوظة ({savedTripsCount})</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClearSavedTrips();
                            setConfirmClearTrips(false);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold cursor-pointer"
                        >
                          تأكيد المسح
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClearTrips(false)}
                          className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
