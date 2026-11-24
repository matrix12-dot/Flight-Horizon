import { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone, Send, X } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تواصل مع أفق للطيران"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B1224] border border-slate-200 dark:border-sky-400/25 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            تواصل مع مركز خدمة المسافرين
          </h3>
          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1">
              <Phone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <div className="text-slate-500 dark:text-slate-400">مركز الاتصال 24/7</div>
              <div className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100">
                +964 770 112 4000
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1">
              <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <div className="text-slate-500 dark:text-slate-400">الدعم الإلكتروني</div>
              <div className="font-mono-tabular font-semibold text-slate-900 dark:text-slate-100 truncate">
                care@ofoqair.iq
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-1">
              <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <div className="text-slate-500 dark:text-slate-400">المقر الرئيسي</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">بغداد · المنصور</div>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                تم استلام رسالتك بنجاح
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                سيتواصل معك فريق خدمة المسافرين في أفق للطيران على بريدك الإلكتروني خلال أقل من ساعتين.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم الكامل
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 font-mono-tabular"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  تفاصيل الاستفسار أو رقم الحجز
                </span>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="كيف يمكننا مساعدتك في رحلتك القادمة؟"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/15 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none text-sm text-slate-900 dark:text-slate-100 resize-none"
                />
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الرسالة</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
