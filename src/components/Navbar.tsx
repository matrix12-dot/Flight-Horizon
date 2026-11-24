import { AppTab, UserAccount } from '@/src/types/aviation';
import { Compass, LogIn, User } from 'lucide-react';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  savedTripsCount: number;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenAccountSettings: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  savedTripsCount,
  currentUser,
  onOpenAuth,
  onOpenAccountSettings,
}: NavbarProps) {
  const navItems: Array<{ id: AppTab; label: string }> = [
    { id: 'search', label: 'حجز الرحلات' },
    { id: 'radar', label: 'تتبع الرحلات' },
    {
      id: 'trips',
      label: savedTripsCount > 0 ? `رحلاتي (${savedTripsCount})` : 'رحلاتي',
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#070B19]/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onTabChange('search')}
          className="flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg px-1 py-1 cursor-pointer"
        >
          <Compass className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>أفق للطيران</span>
        </button>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="flex items-center gap-5 sm:gap-8 overflow-x-auto no-scrollbar"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`relative py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded ${
                  isActive
                    ? 'text-sky-600 dark:text-sky-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-sky-500 dark:bg-sky-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Account / Sign In Action */}
        <div className="flex items-center shrink-0">
          {currentUser ? (
            <button
              type="button"
              onClick={onOpenAccountSettings}
              className="px-3.5 py-2 rounded-xl border border-sky-500/35 dark:border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-200 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <User className="w-4 h-4 text-sky-600 dark:text-sky-300 shrink-0" />
              <span className="max-w-[130px] truncate">
                {currentUser.fullName}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs sm:text-sm font-bold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
