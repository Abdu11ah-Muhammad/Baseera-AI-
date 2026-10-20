import React from 'react';
import { ExternalLink, BookOpen, Bookmark, Award, Info } from 'lucide-react';
import { TraceableEvidence } from '../types/chat';

interface EvidenceCardProps {
  evidence: TraceableEvidence;
  isHighlighted?: boolean;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, isHighlighted }) => {
  const isQuran =
    evidence.type === 'quran' ||
    (evidence.sourceName && (evidence.sourceName.includes('قرآن') || evidence.sourceName.includes('سورة'))) ||
    (evidence.sourceType && evidence.sourceType.includes('قرآن'));

  const isHadith =
    evidence.type === 'hadith' ||
    (evidence.sourceType && evidence.sourceType.includes('حديث')) ||
    (evidence.sourceName && (
      evidence.sourceName.includes('بخاري') ||
      evidence.sourceName.includes('مسلم') ||
      evidence.sourceName.includes('داود') ||
      evidence.sourceName.includes('ترمذي') ||
      evidence.sourceName.includes('نسائي') ||
      evidence.sourceName.includes('ابن ماجه')
    ));

  const isTurathBook =
    evidence.type === 'book' ||
    Boolean(evidence.sourceUrl && evidence.sourceUrl.includes('turath.io')) ||
    Boolean(evidence.book || evidence.author || evidence.page || evidence.volume);

  // Determine clean display details
  const hasDirectLink = Boolean(evidence.sourceUrl && evidence.sourceUrl.trim().length > 0);

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        isHighlighted
          ? 'bg-emerald-50/95 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
          : 'bg-white dark:bg-[#151B23] border-stone-200/90 dark:border-[#273244] shadow-xs'
      }`}
    >
      {/* Top Header */}
      <div className="p-3.5 sm:p-4 bg-stone-50/80 dark:bg-[#111827]/80 border-b border-stone-200/70 dark:border-[#273244] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-800 dark:bg-emerald-700 text-white font-bold text-xs font-sans shadow-xs">
            [{evidence.id}]
          </span>

          {isQuran ? (
            <div className="flex items-center gap-1.5 text-emerald-950 dark:text-emerald-300 font-bold text-xs sm:text-sm font-tajawal">
              <span className="text-base">📖</span>
              <span>القرآن الكريم</span>
            </div>
          ) : isHadith ? (
            <div className="flex items-center gap-1.5 text-emerald-950 dark:text-emerald-300 font-bold text-xs sm:text-sm font-tajawal">
              <span className="text-base">📚</span>
              <span>{evidence.sourceName}</span>
            </div>
          ) : isTurathBook ? (
            <div className="flex items-center gap-1.5 text-emerald-950 dark:text-emerald-300 font-bold text-xs sm:text-sm font-tajawal">
              <span className="text-base">📜</span>
              <span>{evidence.book || evidence.sourceName}</span>
              {evidence.author && (
                <span className="text-xs text-stone-500 dark:text-[#A7B0BE] font-normal">
                  — {evidence.author}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-950 dark:text-emerald-300 font-bold text-xs sm:text-sm font-tajawal">
              <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{evidence.sourceName}</span>
            </div>
          )}

          <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-[#1E293B] text-stone-700 dark:text-[#A7B0BE] font-sans font-medium">
            {evidence.sourceType || (isQuran ? 'قرآن كريم' : isHadith ? 'حديث نبوي' : isTurathBook ? 'كتاب معتمد' : 'مرجع موثق')}
          </span>
        </div>

        {/* Grade badge if hadith */}
        {evidence.grade && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
            <Award className="w-3 h-3" />
            <span>درجة الحديث: {evidence.grade}</span>
          </span>
        )}
      </div>

      {/* Body content */}
      <div className="p-3.5 sm:p-4 space-y-3 text-xs sm:text-sm">
        {/* Specific Reference coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs bg-stone-50/60 dark:bg-[#111827]/60 p-2.5 rounded-xl border border-stone-200/60 dark:border-[#273244]/60 font-tajawal">
          {isQuran ? (
            <>
              {evidence.surah && (
                <div>
                  <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">السورة:</span>
                  <strong className="text-stone-800 dark:text-[#F3F4F6]">سورة {evidence.surah}</strong>
                </div>
              )}
              {evidence.ayah && (
                <div>
                  <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">رقم الآية:</span>
                  <strong className="text-stone-800 dark:text-[#F3F4F6] font-sans">{evidence.ayah}</strong>
                </div>
              )}
            </>
          ) : isHadith ? (
            <>
              {evidence.referenceNumber && (
                <div>
                  <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">رقم الحديث:</span>
                  <strong className="text-stone-800 dark:text-[#F3F4F6] font-sans">{evidence.referenceNumber}</strong>
                </div>
              )}
              {evidence.book && (
                <div>
                  <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">الكتاب:</span>
                  <span className="text-stone-800 dark:text-[#F3F4F6] font-medium">{evidence.book}</span>
                </div>
              )}
              {evidence.chapter && (
                <div className="sm:col-span-2">
                  <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">الباب:</span>
                  <span className="text-stone-800 dark:text-[#F3F4F6] font-medium">{evidence.chapter}</span>
                </div>
              )}
            </>
          ) : (
            <>
              {(evidence.book || evidence.sourceName) && (
                <div>
                  <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">الكتاب:</span>
                  <strong className="text-stone-800 dark:text-[#F3F4F6]">{evidence.book || evidence.sourceName}</strong>
                </div>
              )}
              {evidence.author && (
                <div>
                  <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">المؤلف:</span>
                  <span className="text-stone-800 dark:text-[#F3F4F6] font-medium">{evidence.author}</span>
                </div>
              )}
              {evidence.volume && (
                <div>
                  <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">المجلد:</span>
                  <span className="text-stone-800 dark:text-[#F3F4F6] font-sans font-medium">ج {evidence.volume}</span>
                </div>
              )}
              {evidence.page && (
                <div>
                  <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">الصفحة:</span>
                  <span className="text-stone-800 dark:text-[#F3F4F6] font-sans font-medium">ص {evidence.page}</span>
                </div>
              )}
              {evidence.chapter && (
                <div className="sm:col-span-2">
                  <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">المبحث/الباب:</span>
                  <span className="text-stone-800 dark:text-[#F3F4F6] font-medium">{evidence.chapter}</span>
                </div>
              )}
            </>
          )}

          {/* Reference detail fallback */}
          {!evidence.surah && !evidence.referenceNumber && !evidence.page && evidence.referenceDetail && (
            <div className="sm:col-span-2">
              <span className="text-stone-500 dark:text-[#A7B0BE] ml-1">الموضع في المصدر:</span>
              <span className="text-stone-800 dark:text-[#F3F4F6] font-medium">{evidence.referenceDetail}</span>
            </div>
          )}
        </div>

        {/* The Exact Retrieved Text */}
        {evidence.retrievedText && (
          <div className="p-3 rounded-xl bg-stone-50/90 dark:bg-[#111827] border border-stone-200/80 dark:border-[#273244] space-y-1">
            <span className="text-[11px] font-bold text-stone-500 dark:text-[#A7B0BE] block">
              {isQuran ? 'نص الآية الكريمة المستشهد بها:' : isHadith ? 'نص الحديث النبوي الشريف:' : 'النص المسترجع من المرجع المعتمد:'}
            </span>
            <p className="font-amiri text-sm sm:text-base text-stone-900 dark:text-emerald-100 leading-relaxed">
              «{evidence.retrievedText}»
            </p>
          </div>
        )}

        {/* Usage Context & Verified Deep Link */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-150 dark:border-[#273244] text-xs">
          <div className="text-stone-600 dark:text-[#A7B0BE] font-tajawal text-[11px] sm:text-xs">
            <span className="font-semibold text-stone-700 dark:text-[#E2E8F0] ml-1">موضع الاستخدام:</span>
            <span>{evidence.usageContext || 'بيان الحكم والاستدلال في المسألة'}</span>
          </div>

          {/* Deep link button or transparent unverified label (NO hallucinated fake URLs) */}
          {hasDirectLink ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-500 dark:text-[#A7B0BE] hidden sm:inline">
                🔗 المصدر المباشر:
              </span>
              <a
                href={evidence.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-tajawal font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                title={
                  isQuran
                    ? `فتح الآية ${evidence.ayah || ''} مباشرة في المصدر الرسمي (quran.com)`
                    : isHadith
                    ? `فتح الحديث رقم ${evidence.referenceNumber || ''} مباشرة في المصدر الرسمي (sunnah.com)`
                    : `فتح الصفحة ${evidence.page || ''} في مكتبة تراث الإسلامية (app.turath.io)`
                }
              >
                <span>
                  {isQuran
                    ? 'فتح الآية مباشرة'
                    : isHadith
                    ? 'فتح الحديث مباشرة'
                    : isTurathBook
                    ? 'فتح في مكتبة تراث'
                    : 'المصدر المباشر'}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-[#A7B0BE] bg-stone-100 dark:bg-[#1A202C] px-2.5 py-1 rounded-md border border-stone-200/60 dark:border-[#273244]">
              <Info className="w-3 h-3 text-stone-400" />
              <span>الرابط المباشر غير متوفر حاليًا للموضع المحدد</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
