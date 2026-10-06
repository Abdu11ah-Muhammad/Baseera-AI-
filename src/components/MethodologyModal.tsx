import React from 'react';
import { X, Sparkles, BookOpen, Layers, ShieldAlert, CheckCircle2, Cpu } from 'lucide-react';
import { VERIFIED_SOURCES } from '../data/islamicKnowledgeBase';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegistry?: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
  onOpenRegistry,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#151B23] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#273244] flex flex-col overflow-hidden text-stone-900 dark:text-[#F3F4F6] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-[#273244] flex items-center justify-between bg-stone-50/70 dark:bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-tajawal text-emerald-950 dark:text-emerald-300">
                منهجية بصيرة | مساعد الداعية
              </h2>
              <p className="text-xs text-stone-500 dark:text-[#A7B0BE] font-sans">
                دليل الشفافية العلمية والتحقق الآلي خلال 30 ثانية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق المنهجية"
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-[#F3F4F6] hover:bg-stone-200 dark:hover:bg-[#1A202C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Essential Quick-Brief Questions */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans space-y-4 text-xs sm:text-sm">
          {/* Question 1: ماذا يفعل RAG؟ */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1.5">
            <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-2 font-tajawal">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>ماذا يفعل نظام الاسترجاع المعزز (RAG)؟</span>
            </h3>
            <p className="text-stone-700 dark:text-[#A7B0BE] leading-relaxed pr-8">
              يقوم النظام باسترجاع المقاطع ذات الصلة من المصادر المعتمدة قبل بناء الإجابة، ثم يستخدمها لدعم الإجابة والاستشهاد بها بأرقام موثقة [1]، [2] لمنع التوليد العشوائي.
            </p>
          </div>

          {/* Question 2: ما مصادر بصيرة؟ */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#151B23] border border-stone-200 dark:border-[#273244] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-2 font-tajawal">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>ما هي مصادر بصيرة المعتمدة؟</span>
              </h3>
              {onOpenRegistry && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenRegistry();
                  }}
                  className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>فتح سجل المصادر</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 pr-8">
              {VERIFIED_SOURCES.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-stone-100 dark:bg-[#1A202C] text-stone-700 dark:text-[#A7B0BE] border border-stone-200 dark:border-[#273244]"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Question 3: ما مستويات A/B/C/D؟ */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#151B23] border border-stone-200 dark:border-[#273244] space-y-2">
            <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-2 font-tajawal">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>ما هي مستويات المحتوى الأربعة (A / B / C / D)؟</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
                <strong className="text-emerald-900 dark:text-emerald-300 block mb-0.5">المستوى A — معلومة مباشرة</strong>
                <p className="text-stone-600 dark:text-[#A7B0BE]">سؤال معرفي بسيط يُجاب عنه باختصار ومباشرة دون أي موعظة زائدة.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
                <strong className="text-emerald-900 dark:text-emerald-300 block mb-0.5">المستوى B — شرح واستدلال</strong>
                <p className="text-stone-600 dark:text-[#A7B0BE]">شرح مفصل وحوار عقلاني هادئ ورصين مدعم بالأدلة والبراهين.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
                <strong className="text-amber-800 dark:text-amber-300 block mb-0.5">المستوى C — مسألة خلافية</strong>
                <p className="text-stone-600 dark:text-[#A7B0BE]">بيان وجود الخلاف بين المذاهب باعتدال وتجرد، دون ادعاء إجماع.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
                <strong className="text-rose-800 dark:text-rose-300 block mb-0.5">المستوى D — حالة شخصية تستوجب الإحالة</strong>
                <p className="text-stone-600 dark:text-[#A7B0BE]">امتناع عن الفتوى الشخصية الحاسمة، وإحالة السائل لدار الإفتاء أو عالم موثوق.</p>
              </div>
            </div>
          </div>

          {/* Question 4: متى يمتنع بصيرة عن الإجابة؟ */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#151B23] border border-stone-200 dark:border-[#273244] space-y-1.5">
            <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-2 font-tajawal">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <span>متى يمتنع بصيرة عن إصدار حكم حاسم؟</span>
            </h3>
            <p className="text-stone-700 dark:text-[#A7B0BE] leading-relaxed pr-8">
              لا يصدر بصيرة فتوى شخصية حاسمة في الحالات الفردية الحساسة (كالطلاق، المنازعات الأسرية والمالية المعقدة، والكفارات المرتبطة بوقائع فردية)، بل يوضح الأطر الفقهية العامة ويقوم بالإحالة الصريحة إلى جهة علمية أو إفتائية موثوقة.
            </p>
          </div>

          {/* Question 5: ماذا تعني "كفاية المرجعية"؟ */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#151B23] border border-stone-200 dark:border-[#273244] space-y-1.5">
            <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-2 font-tajawal">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">5</span>
              <span>ماذا تعني "كفاية المرجعية"؟</span>
            </h3>
            <p className="text-stone-700 dark:text-[#A7B0BE] leading-relaxed pr-8">
              هي مؤشر تقني على كفاية الأدلة والمراجع المسترجعة لدعم الإجابة (مرتفعة، متوسطة، غير كافية) بناءً على تطابق النصوص وعدد المصادر المستقلة، وليست نسبة مئوية لصحة شرعية مطلقة.
            </p>
          </div>

          {/* Question 6: هل التحقق آلي أم بشري؟ */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1.5">
            <h3 className="font-bold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-2 font-tajawal">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">6</span>
              <span>هل التحقق آلي أم بشري؟</span>
            </h3>
            <p className="text-stone-700 dark:text-[#A7B0BE] leading-relaxed pr-8 font-semibold">
              التحقق الافتراضي في النظام هو <strong>تحقق تقني آلي</strong>. ولا تظهر عبارة «مراجَع بشريًا» إلا إذا تمت مراجعة المحتوى والتحقق منه فعليًا بواسطة شخص متخصص.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-[#273244] bg-stone-50/70 dark:bg-[#111827] flex items-center justify-between text-xs text-stone-500 dark:text-[#A7B0BE]">
          <span>بصيرة | مساعد الداعية — محايد وموثق</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            فهمت المنهجية
          </button>
        </div>
      </div>
    </div>
  );
};
