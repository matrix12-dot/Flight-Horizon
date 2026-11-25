import { useState } from 'react';
import { UserAccount } from '@/src/types/aviation';
import {
  Compass,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredUsers: UserAccount[];
  onSignIn: (user: UserAccount) => void;
  onRegister: (user: UserAccount) => void;
  notice?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  registeredUsers,
  onSignIn,
  onRegister,
  notice,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetFields = () => {
    setError('');
    setPassword('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    const matched = registeredUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!matched) {
      setError('البريد الإلكتروني غير مسجل. يمكنك إنشاء حساب جديد أو استخدام الدخول السريع.');
      return;
    }

    if (matched.password !== password) {
      setError('كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
      return;
    }

    onSignIn(matched);
    resetFields();
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 3) {
      setError('يرجى إدخال الاسم الكامل (3 أحرف على الأقل).');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }

    if (password.length < 6) {
      setError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
      return;
    }

    const exists = registeredUsers.some(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (exists) {
      setError('هذا البريد الإلكتروني مسجل مسبقاً. انتقل إلى تبويب تسجيل الدخول.');
      return;
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      passportNumber: passportNumber.trim().toUpperCase() || undefined,
      createdAt: new Date().toISOString(),
    };

    onRegister(newUser);
    resetFields();
    onClose();
  };

  const handleDemoLogin = () => {
    const demoUser = registeredUsers[0];
    if (demoUser) {
      onSignIn(demoUser);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="حساب المسافر في أفق للطيران"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0B1224] border border-slate-200 dark:border-sky-400/25 shadow-2xl overflow-hidden my-auto">
        {/* Top Accent Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-l from-sky-500/15 via-slate-50 to-white dark:via-slate-950/60 dark:to-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 dark:border-sky-400/30 flex items-center justify-center text-sky-700 dark:text-sky-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                بوابة المسافرين · أفق
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                وصول سريع لحجوزاتك وبطاقات الصعود
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {notice && (
            <div className="p-3 rounded-xl bg-sky-500/12 border border-sky-500/30 text-xs text-sky-800 dark:text-sky-200 leading-relaxed">
              {notice}
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div
            role="tablist"
            className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء حساب</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-700 dark:text-rose-200 leading-relaxed">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  البريد الإلكتروني
                </span>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@ofoqair.iq"
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular"
                  />
                </div>
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  كلمة المرور
                </span>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900 accent-sky-500 cursor-pointer"
                  />
                  <span>تذكرني على هذا الجهاز</span>
                </label>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="text-sky-600 dark:text-sky-300 hover:text-sky-500 dark:hover:text-sky-200 font-semibold cursor-pointer"
                >
                  دخول سريع بحساب جاهز
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-sky-500/20"
              >
                تسجيل الدخول
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  الاسم الكامل
                </span>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: علي حسين الكاظمي"
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  البريد الإلكتروني
                </span>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular"
                  />
                </div>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    كلمة المرور
                  </span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 أحرف فأكثر"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    رقم الجواز (اختياري)
                  </span>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    placeholder="A12345678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular uppercase"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-sky-500/20"
              >
                إنشاء الحساب والمتابعة
              </button>
            </form>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              يتم حفظ بيانات الحساب محلياً على متصفحك لتعبئة تذاكر السفر بسرعة وأمان.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
