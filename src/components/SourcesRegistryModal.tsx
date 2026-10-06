import React from 'react';
import { X, BookCheck, ShieldCheck, Database, ExternalLink, Library } from 'lucide-react';
import { VERIFIED_SOURCES } from '../data/islamicKnowledgeBase';

interface SourcesRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourcesRegistryModal: React.FC<SourcesRegistryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#151B23] rounded-2xl shadow-2xl border border-stone-200 dark:border-[#273244] flex flex-col overflow-hidden text-stone-900 dark:text-[#F3F4F6] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-[#273244] flex items-center justify-between bg-stone-50/70 dark:bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 flex items-center justify-center">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-tajawal text-emerald-950 dark:text-emerald-300">
                سجل المصادر المعتمدة (Sources Registry)
              </h2>
              <p className="text-xs text-stone-500 dark:text-[#A7B0BE] font-sans">
                الفهرس المعتمد لبيانات الاسترجاع والتحقق الشرعي في نظام بصيرة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق السجل"
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-[#F3F4F6] hover:bg-stone-200 dark:hover:bg-[#1A202C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans space-y-4">
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-[#273244]">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-stone-100/80 dark:bg-[#1A202C] text-stone-700 dark:text-[#F3F4F6] border-b border-stone-200 dark:border-[#273244]">
                <tr>
                  <th className="py-3 px-4 font-bold font-tajawal">المصدر</th>
                  <th className="py-3 px-4 font-bold font-tajawal">النوع</th>
                  <th className="py-3 px-4 font-bold font-tajawal">حالة الاعتماد</th>
                  <th className="py-3 px-4 font-bold font-tajawal hidden md:table-cell">بيان التوثيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70 dark:divide-[#273244]">
                {VERIFIED_SOURCES.map((source) => (
                  <tr
                    key={source.id}
                    className="hover:bg-emerald-50/30 dark:hover:bg-[#1A202C]/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-emerald-950 dark:text-emerald-300">
                      <div className="flex items-center gap-1.5">
                        <span>{source.name}</span>
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 inline-flex"
                            title="رابط البوابة الرسمية"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {source.author && (
                        <div className="text-[11px] font-normal text-stone-500 dark:text-[#A7B0BE] mt-0.5">
                          {source.author}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-700 dark:text-[#A7B0BE]">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 dark:bg-[#1A202C] border border-stone-200 dark:border-[#273244]">
                        {source.type || source.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{source.status || 'معتمد'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-stone-600 dark:text-[#A7B0BE] hidden md:table-cell leading-relaxed max-w-xs">
                      {source.referenceDetail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Mandatory Note */}
          <div className="p-3.5 bg-stone-50 dark:bg-[#111827] rounded-xl border border-stone-200 dark:border-[#273244] text-xs text-stone-600 dark:text-[#A7B0BE] leading-relaxed">
            <span className="font-bold text-stone-800 dark:text-[#F3F4F6] block mb-1">
              ملاحظة منهجية:
            </span>
            <p>
              إدراج المصدر في السجل لا يعني استخدام جميع محتوياته في كل سؤال؛ يقوم النظام باسترجاع المقاطع المرتبطة بالسؤال ثم يستخدم المصادر ذات الصلة فقط.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-[#273244] bg-stone-50/70 dark:bg-[#111827] flex items-center justify-between text-xs text-stone-500 dark:text-[#A7B0BE]">
          <span>إجمالي المصادر المعتمدة المسجلة: {VERIFIED_SOURCES.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
