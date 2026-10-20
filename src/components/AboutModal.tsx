import React from 'react';
import { X, ShieldCheck, BookOpen, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onStartChat }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#151B23] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#273244] p-5 sm:p-6 text-stone-900 dark:text-[#F3F4F6] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-150 dark:border-[#273244]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-tajawal text-emerald-950 dark:text-emerald-300">
                عن بصيرة | مساعد الداعية
              </h2>
              <span className="text-xs text-stone-500 dark:text-[#A7B0BE]">
                المساعد المعرفي والدعوي الموثق
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-[#F3F4F6] hover:bg-stone-100 dark:hover:bg-[#1A202C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Short Statement */}
        <p className="text-sm leading-relaxed text-stone-700 dark:text-[#F3F4F6] mb-5 font-tajawal">
          بصيرة هو مساعد إسلامي ذكي مصمم لدعم الحوار والدعوة من خلال استرجاع المعلومات من مصادر إسلامية موثوقة وتقديمها بطريقة منظمة وقابلة للتتبع.
        </p>

        {/* 5 Key Concise Bullets */}
        <div className="space-y-2.5 mb-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-tajawal text-stone-800 dark:text-[#F3F4F6]">
              <strong>استرجاع المصادر المعتمدة:</strong> البحث في أمهات كتب السنة والمجامع الفقهية.
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-tajawal text-stone-800 dark:text-[#F3F4F6]">
              <strong>الاستدلال بالقرآن والسنة:</strong> ذكر اسم السورة ورقم الآية، ومخرج الحديث ورقمه بدقة.
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-tajawal text-stone-800 dark:text-[#F3F4F6]">
              <strong>تتبع المراجع والأدلة:</strong> أرقام استشهاد داخلية [1] و [2] قابلة للنقر والتتبع.
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-tajawal text-stone-800 dark:text-[#F3F4F6]">
              <strong>تصنيف نوع السؤال (A / B / C / D):</strong> تفريق علمي بين المعلومة والشرح والخلاف والحالة الخاصة.
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-tajawal text-stone-800 dark:text-[#F3F4F6]">
              <strong>الإحالة في الحالات الشخصية الحساسة:</strong> التحرز من الفتوى الفردية والإحالة للعلماء.
            </span>
          </div>
        </div>

        {/* Developer Attribution & Contact */}
        <div className="p-3 mb-5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 text-xs font-tajawal">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
            <span className="font-bold text-emerald-950 dark:text-emerald-300">
              تطوير المشروع:
            </span>
            <span className="text-stone-800 dark:text-stone-200 font-semibold font-sans">
              المهندس Abdullah M. Refaat
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-stone-600 dark:text-stone-400">
            <a
              href="https://www.linkedin.com/in/abdu11ah-mhmd/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-sans font-medium"
            >
              LinkedIn ↗
            </a>
            <span>•</span>
            <a
              href="mailto:abdullahmhmd17@outlook.com"
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-sans font-medium"
            >
              abdullahmhmd17@outlook.com
            </a>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-150 dark:border-[#273244]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-stone-200 dark:border-[#273244] hover:bg-stone-100 dark:hover:bg-[#1A202C] transition-colors cursor-pointer"
          >
            إغلاق
          </button>
          {onStartChat && (
            <button
              onClick={() => {
                onClose();
                onStartChat();
              }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 dark:hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
            >
              ابدأ محادثة
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
