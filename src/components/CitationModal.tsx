import React from 'react';
import { X, BookOpen, Bookmark, CheckCircle } from 'lucide-react';
import { SourceReference } from '../types/chat';

interface CitationModalProps {
  source: SourceReference | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ source, onClose }) => {
  if (!source) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[#F8FAFC] dark:bg-[#151B23] border border-stone-300 dark:border-[#273244] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-stone-900 dark:text-[#F3F4F6] relative transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 p-1.5 rounded-lg text-stone-400 dark:text-[#A7B0BE] hover:text-stone-700 dark:hover:text-[#F3F4F6] hover:bg-stone-200 dark:hover:bg-[#1A202C] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 dark:text-[#A7B0BE] font-sans">{source.category}</span>
            <h3 className="text-lg font-bold font-tajawal text-emerald-950 dark:text-emerald-300">
              {source.name}
            </h3>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-stone-700 dark:text-[#A7B0BE] font-sans">
          {source.author && (
            <div>
              <span className="font-semibold text-stone-900 dark:text-[#F3F4F6] block mb-0.5">المؤلف / جهة الإصدار:</span>
              <p className="text-stone-600 dark:text-[#A7B0BE] bg-white dark:bg-[#111827] p-2.5 rounded-lg border border-stone-200 dark:border-[#273244]">
                {source.author}
              </p>
            </div>
          )}

          {source.referenceDetail && (
            <div>
              <span className="font-semibold text-stone-900 dark:text-[#F3F4F6] block mb-0.5">التوصيف المرجعي والمنهجي:</span>
              <p className="text-stone-600 dark:text-[#A7B0BE] bg-white dark:bg-[#111827] p-2.5 rounded-lg border border-stone-200 dark:border-[#273244]">
                {source.referenceDetail}
              </p>
            </div>
          )}

          {source.quoteExcerpt && (
            <div>
              <span className="font-semibold text-stone-900 dark:text-[#F3F4F6] block mb-0.5">اقتباس من المصدر:</span>
              <p className="text-stone-800 dark:text-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40 font-amiri text-sm leading-relaxed">
                «{source.quoteExcerpt}»
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 text-[11px] pt-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>مرجع موثق ومعتمد ضمن الفهرس الشرعي لمنصة بصيرة</span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-stone-200 dark:border-[#273244] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 dark:text-[#F3F4F6] hover:bg-stone-200 dark:hover:bg-[#1A202C] rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
