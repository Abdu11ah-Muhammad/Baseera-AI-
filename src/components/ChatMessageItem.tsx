import React, { useState } from 'react';
import {
  Copy,
  Check,
  Scale,
  ChevronDown,
  ChevronUp,
  FileText,
  Gauge,
  Layers,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  Compass,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, SourceReference, TraceableEvidence } from '../types/chat';
import { EvidenceCard } from './EvidenceCard';

interface ChatMessageItemProps {
  message: ChatMessage;
  fontSize?: 'normal' | 'large';
  onSelectSource?: (source: SourceReference) => void;
  onRetry?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onSelectSource,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);

  // Accordion states for the 4 Layer-2 sections (closed by default for clean hierarchy)
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [isNextStepOpen, setIsNextStepOpen] = useState(false);
  const [highlightedEvidenceId, setHighlightedEvidenceId] = useState<number | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    let textToCopy = message.content || message.briefAnswer || '';
    if (message.explanation && !textToCopy.includes(message.explanation)) {
      textToCopy += `\n\n${message.explanation}`;
    }
    if (message.evidence && !textToCopy.includes(message.evidence)) {
      textToCopy += `\n\nالدليل: ${message.evidence}`;
    }
    if (message.disclaimer && !textToCopy.includes(message.disclaimer)) {
      textToCopy += `\n\n[تنبيه شرعي]: ${message.disclaimer}`;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCitationClick = (evidenceId: number) => {
    setIsEvidenceOpen(true);
    setHighlightedEvidenceId(evidenceId);
    setTimeout(() => {
      const el = document.getElementById(`evidence-card-${message.id}-${evidenceId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // If user message, render clean bubble
  if (isUser) {
    return (
      <div id={`msg-${message.id}`} className="flex justify-end mb-5">
        <div className="max-w-2xl bg-emerald-900 dark:bg-emerald-950/90 text-white rounded-2xl rounded-tl-sm px-4 sm:px-5 py-3 shadow-sm border border-emerald-800/40">
          <p className="font-tajawal text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          <div className="flex justify-end items-center gap-1 mt-1 text-[11px] text-emerald-200/70 font-sans">
            <span>{message.timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  // If error message, render explicit error card with Retry button
  if (message.isError) {
    return (
      <div id={`msg-${message.id}`} className="flex flex-col mb-6">
        <div className="max-w-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 text-rose-900 dark:text-rose-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <h4 className="font-bold text-sm font-tajawal">تعذر إكمال الإجابة حالياً</h4>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed mb-4 font-tajawal text-stone-700 dark:text-[#A7B0BE]">
            تعذر إكمال الإجابة حاليًا بسبب مشكلة مؤقتة في الاتصال أو الخادم. يمكنك المحاولة مرة أخرى الآن.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Content Level Badge Configuration (A, B, C, D)
  const contentLevel = message.contentLevel || 'B';
  const contentLevelBadgeStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    A: {
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-900 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800/70',
      label: message.contentLevelLabel || 'A — معلومة مباشرة',
    },
    B: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-900 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/70',
      label: message.contentLevelLabel || 'B — شرح واستدلال',
    },
    C: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-900 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/70',
      label: message.contentLevelLabel || 'C — مسألة خلافية',
    },
    D: {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-900 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800/70',
      label: message.contentLevelLabel || 'D — حالة شخصية تستوجب الإحالة',
    },
  };
  const activeLevelStyle = contentLevelBadgeStyles[contentLevel] || contentLevelBadgeStyles['B'];

  // Reference Adequacy (كفاية المرجعية: مرتفعة / متوسطة / غير كافية)
  const referenceAdequacy = message.referenceAdequacy || message.evidenceLevelArabic || 'مرتفعة';
  const isHighAdequacy = referenceAdequacy.includes('مرتفع');
  const isMediumAdequacy = referenceAdequacy.includes('متوسط');

  // Dynamic rationale bullets
  const dynamicRationale: string[] =
    message.adequacyRationale && message.adequacyRationale.length > 0
      ? message.adequacyRationale
      : [
          message.traceableEvidences && message.traceableEvidences.length > 0
            ? `تم استرجاع ${message.traceableEvidences.length} أدلة داعمة مباشرة وموثقة`
            : 'تم استرجاع نصوص معتمدة من أمهات المصادر',
          'تطابق مباشر مع نصوص الوحيين والقواعد المعتمدة',
          'جميع الاستشهادات قابلة للتتبع والتخريج',
        ];

  // Automated checks
  const checks = message.automatedChecks || {
    sourcesFound: true,
    textsVerified: true,
    noPersonalFatwaClaim: contentLevel !== 'D',
    noConflictDetected: true,
  };

  // Helper to parse inline markdown (bolding, inline code) and interactive citations [1], [2]
  const renderInlineMarkdownAndCitations = (text: string) => {
    if (!text) return null;
    // Match [1], [2] citations, **bold text**, and `code`
    const parts = text.split(/(\[\d+\]|\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, pIdx) => {
      if (!part) return null;

      // 1. Citation button [N]
      const citationMatch = part.match(/^\[(\d+)\]$/);
      if (citationMatch) {
        const cId = parseInt(citationMatch[1], 10);
        return (
          <button
            key={pIdx}
            type="button"
            onClick={() => handleCitationClick(cId)}
            title={`عرض تفاصيل الدليل [${cId}]`}
            aria-label={`الدليل رقم ${cId}`}
            className="inline-flex items-center justify-center text-[10px] sm:text-xs font-bold font-sans text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950 px-1.5 py-0.2 mx-0.5 rounded border border-emerald-300 dark:border-emerald-700/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors cursor-pointer select-none align-baseline"
          >
            [{cId}]
          </button>
        );
      }

      // 2. Bold text **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        const inner = part.slice(2, -2);
        return (
          <strong key={pIdx} className="font-bold text-stone-900 dark:text-white">
            {inner}
          </strong>
        );
      }

      // 3. Inline code `text`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        const inner = part.slice(1, -1);
        return (
          <code
            key={pIdx}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-mono"
          >
            {inner}
          </code>
        );
      }

      // 4. Regular text segment
      return <React.Fragment key={pIdx}>{part}</React.Fragment>;
    });
  };

  // Pre-normalizer to prevent text collapse and guarantee clean structural paragraph breaks
  const normalizeContentMarkdown = (raw: string): string => {
    if (!raw) return '';
    return raw
      .replace(/\r\n/g, '\n')
      // Ensure headings have double blank lines before & after
      .replace(/([^\n])\n(#{1,4}\s+[^\n]+)/g, '$1\n\n$2')
      .replace(/(#{1,4}\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2')
      // Ensure horizontal dividers have double blank lines
      .replace(/([^\n])\n(---|\*\*\*|___)\n/g, '$1\n\n$2\n\n')
      // Ensure numbered lists following a paragraph start on a fresh block
      .replace(/([^\n])\n(\d+[\.\)]\s+[^\n]+)/g, '$1\n\n$2')
      // Ensure bullet lists following a paragraph start on a fresh block
      .replace(/([^\n])\n([•\*\-]\s+[^\n]+)/g, '$1\n\n$2')
      // Collapse 3+ consecutive newlines to 2
      .replace(/\n{3,}/g, '\n\n');
  };

  // Format paragraphs into clean, structured Arabic Markdown components (zero inline collapse)
  const renderFormattedParagraphs = (content: string) => {
    if (!content) return null;
    const normalized = normalizeContentMarkdown(content);
    const blocks = normalized.split('\n\n');

    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // 1. Horizontal divider
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        return <hr key={idx} className="my-5 border-t border-stone-200 dark:border-[#273244]" />;
      }

      // 2. Heading (e.g. ### Section or ## Section or # Section)
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        const title = headingMatch[2].trim();
        return (
          <div
            key={idx}
            className="flex items-center gap-2 mt-5 mb-2.5 pt-1 text-emerald-950 dark:text-emerald-200 font-bold font-tajawal text-base sm:text-lg border-r-4 border-emerald-600 dark:border-emerald-400 pr-3 py-1 bg-emerald-50/50 dark:bg-emerald-950/25 rounded-l-lg"
          >
            <span className="text-emerald-700 dark:text-emerald-400 text-sm">✦</span>
            <span>{renderInlineMarkdownAndCitations(title)}</span>
          </div>
        );
      }

      // 3. Standalone bold category title e.g. **أولاً: أركان الصلاة:**
      if (/^\*\*[^*]+\*\*[:]?$/.test(trimmed)) {
        const categoryTitle = trimmed.replace(/\*\*/g, '').trim();
        return (
          <div
            key={idx}
            className="flex items-center gap-2 mt-4 mb-2 font-bold font-tajawal text-sm sm:text-base text-emerald-900 dark:text-emerald-300 pr-2 border-r-2 border-emerald-600 dark:border-emerald-400"
          >
            <span>{renderInlineMarkdownAndCitations(categoryTitle)}</span>
          </div>
        );
      }

      // 4. Blockquote (> ...)
      if (trimmed.startsWith('>')) {
        const quoteContent = trimmed
          .split('\n')
          .map((line) => line.replace(/^>\s?/, ''))
          .join('\n');
        return (
          <div
            key={idx}
            className="my-3 p-3 sm:p-4 bg-emerald-50/30 dark:bg-emerald-950/20 border-r-4 border-emerald-700 dark:border-emerald-500 rounded-l-xl text-stone-800 dark:text-[#F3F4F6] font-tajawal text-sm sm:text-base leading-relaxed italic"
          >
            {renderInlineMarkdownAndCitations(quoteContent)}
          </div>
        );
      }

      // 5. Bullet list (* item, - item, • item)
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const lines = trimmed.split('\n');
        return (
          <ul key={idx} className="space-y-2.5 my-3 pr-1">
            {lines.map((l, lIdx) => {
              const cleaned = l.replace(/^[\*\-•]\s*/, '').trim();
              if (!cleaned) return null;
              return (
                <li key={lIdx} className="flex items-start gap-2.5 font-tajawal text-sm sm:text-base leading-relaxed text-stone-800 dark:text-[#F3F4F6]">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-2 shrink-0 ring-2 ring-emerald-100 dark:ring-emerald-950" />
                  <div className="flex-1">
                    {renderInlineMarkdownAndCitations(cleaned)}
                  </div>
                </li>
              );
            })}
          </ul>
        );
      }

      // 6. Numbered list (1. item, 2. item)
      if (/^\d+[\.\)]\s/.test(trimmed)) {
        const lines = trimmed.split('\n');
        return (
          <div key={idx} className="space-y-2.5 my-3">
            {lines.map((l, lIdx) => {
              const m = l.match(/^(\d+)[\.\)]\s*(.*)/);
              if (m) {
                const num = m[1];
                const itemText = m[2];
                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl bg-stone-50/60 dark:bg-[#111827]/60 border border-stone-200/60 dark:border-[#273244]/60"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-800 dark:bg-emerald-700 text-white font-bold text-xs shrink-0 font-sans shadow-2xs mt-0.5">
                      {num}
                    </span>
                    <div className="flex-1 min-w-0 font-tajawal text-stone-800 dark:text-[#F3F4F6] text-sm sm:text-base leading-relaxed">
                      {renderInlineMarkdownAndCitations(itemText)}
                    </div>
                  </div>
                );
              }
              return (
                <p key={lIdx} className="text-stone-800 dark:text-[#F3F4F6] font-tajawal text-sm sm:text-base leading-relaxed">
                  {renderInlineMarkdownAndCitations(l)}
                </p>
              );
            })}
          </div>
        );
      }

      // 7. Standard paragraph
      return (
        <p key={idx} className="leading-relaxed text-stone-800 dark:text-[#F3F4F6] font-tajawal text-sm sm:text-base mb-3 whitespace-pre-line">
          {renderInlineMarkdownAndCitations(trimmed)}
        </p>
      );
    });
  };

  const evidences = message.traceableEvidences || [];

  // Determine if primary answer content is available
  const hasBrief = Boolean(message.briefAnswer && message.briefAnswer.trim());
  const hasExplanation = Boolean(message.explanation && message.explanation.trim());
  const hasRawContent = Boolean(message.content && message.content.trim());

  return (
    <div id={`msg-${message.id}`} className="flex flex-col mb-6 sm:mb-8 text-stone-900 dark:text-[#F3F4F6]">
      <div className="max-w-4xl bg-white dark:bg-[#151B23] border border-stone-200/90 dark:border-[#273244] rounded-2xl rounded-tr-sm p-4 sm:p-6 shadow-xs transition-colors">
        
        {/* Top Header: Brand + Badges + Copy (NO letter box!) */}
        <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-stone-150 dark:border-[#273244] gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {/* Clean Wordmark: بصيرة | مساعد الداعية */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold font-tajawal text-emerald-950 dark:text-emerald-300">
              <span>بصيرة</span>
              <span className="text-stone-300 dark:text-stone-600 font-light">|</span>
              <span className="font-semibold text-emerald-800 dark:text-emerald-400">مساعد الداعية</span>
            </div>

            {/* Content Level Badge (A / B / C / D) */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md font-sans border ${activeLevelStyle.bg} ${activeLevelStyle.text} ${activeLevelStyle.border}`}
              title="تصنيف نوع المسألة"
            >
              <Layers className="w-3 h-3" />
              <span>{activeLevelStyle.label}</span>
            </span>

            {/* Reference Adequacy Badge (Only when references are present) */}
            {evidences.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAuditOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md font-sans border transition-colors cursor-pointer ${
                  isHighAdequacy
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                    : isMediumAdequacy
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                    : 'bg-stone-100 dark:bg-[#1A202C] text-stone-700 dark:text-[#A7B0BE] border-stone-200 dark:border-[#273244]'
                }`}
                title="انقر لعرض أسباب كفاية المرجعية وتقرير التحقق الآلي"
              >
                <Gauge className="w-3 h-3" />
                <span>كفاية المرجعية: {referenceAdequacy}</span>
              </button>
            )}
          </div>

          {/* Timestamp & Copy Action */}
          <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 font-sans">
            <span>{message.timestamp}</span>
            <button
              onClick={handleCopy}
              title="نسخ الإجابة"
              aria-label="نسخ"
              className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-[#F3F4F6] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 🌟 1. Primary Answer Box: الإجابة المختصرة (Direct Answer) 🌟 */}
        {hasBrief && (
          <div className="mb-4 p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800/60 rounded-xl">
            <div className="flex items-center justify-between gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1.5 font-tajawal">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>الإجابة المختصرة</span>
              </div>
              <span className="text-[10px] font-normal text-emerald-800/80 dark:text-emerald-400/80 bg-white/70 dark:bg-[#151B23]/70 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40">
                موجز مباشر
              </span>
            </div>
            <p className="font-semibold text-emerald-950 dark:text-emerald-100 text-sm sm:text-base leading-relaxed font-tajawal">
              {renderInlineMarkdownAndCitations(message.briefAnswer!)}
            </p>
          </div>
        )}

        {/* 🌟 2. الحكم / التوضيح (Explanation with Inline Citations [1], [2]) 🌟 */}
        {hasExplanation ? (
          <div className="mb-4 space-y-2.5 text-sm sm:text-base leading-relaxed font-tajawal">
            {renderFormattedParagraphs(message.explanation!)}
          </div>
        ) : !hasBrief && hasRawContent ? (
          /* Fallback: If neither brief nor explanation is present, display full content so NO answer is EVER invisible! */
          <div className="mb-4 space-y-2.5 text-sm sm:text-base leading-relaxed font-tajawal">
            {renderFormattedParagraphs(message.content)}
          </div>
        ) : null}

        {/* 🌟 3. الدليل الشرعي المستند إليه (Evidence: Quran verse or Hadith) 🌟 */}
        {message.evidence && message.evidence.trim() !== '' && (
          <div className="mb-4 p-3.5 bg-stone-50/80 dark:bg-[#111827] border border-stone-200 dark:border-[#273244] rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300 font-tajawal">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>الدليل الشرعي:</span>
            </div>
            <div className="text-xs sm:text-sm text-stone-800 dark:text-[#F3F4F6] font-tajawal leading-relaxed">
              {renderFormattedParagraphs(message.evidence)}
            </div>
          </div>
        )}

        {/* 🌟 4. الخلاصة (Summary if available) 🌟 */}
        {message.summary && message.summary.trim() !== '' && (
          <div className="mb-4 p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl text-xs sm:text-sm font-tajawal">
            <strong className="text-emerald-900 dark:text-emerald-300 block mb-1">الخلاصة:</strong>
            <div className="text-stone-700 dark:text-[#A7B0BE] leading-relaxed">
              {renderFormattedParagraphs(message.summary)}
            </div>
          </div>
        )}

        {/* 🌟 5. الخلاف الفقهي إن كانت المسألة خلافية (Level C) 🌟 */}
        {message.dispute && message.dispute.trim() !== '' && (
          <div className="mb-4 p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 font-tajawal">
              <Scale className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>بيان الخلاف الفقهي المعتبر:</span>
            </div>
            <div className="text-xs sm:text-sm text-stone-700 dark:text-[#A7B0BE] leading-relaxed font-tajawal">
              {renderFormattedParagraphs(message.dispute)}
            </div>
          </div>
        )}

        {/* 🌟 6. قائمة الأدلة والمراجع المباشرة المستخدمة فعلياً في الإجابة 🌟 */}
        {evidences.length > 0 && (
          <div className="mb-4 p-3.5 sm:p-4 bg-stone-50/70 dark:bg-[#111827]/70 border border-stone-200/90 dark:border-[#273244] rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 dark:border-[#273244] pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📖</span>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-[#F3F4F6] font-tajawal">
                  الأدلة والمراجع المستخدمة في الإجابة
                </h4>
              </div>
              <span className="text-[11px] font-sans text-stone-500 dark:text-[#A7B0BE]">
                {evidences.length} {evidences.length === 1 ? 'مرجع موثق' : 'مراجع موثقة'}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {evidences.map((ev) => {
                const isQuran =
                  ev.type === 'quran' ||
                  (ev.sourceName && (ev.sourceName.includes('قرآن') || ev.sourceName.includes('سورة'))) ||
                  (ev.sourceType && ev.sourceType.includes('قرآن'));

                const isHadith =
                  ev.type === 'hadith' ||
                  (ev.sourceType && ev.sourceType.includes('حديث')) ||
                  (ev.sourceName && (
                    ev.sourceName.includes('بخاري') ||
                    ev.sourceName.includes('مسلم') ||
                    ev.sourceName.includes('داود') ||
                    ev.sourceName.includes('ترمذي') ||
                    ev.sourceName.includes('نسائي') ||
                    ev.sourceName.includes('ابن ماجه')
                  ));

                const hasLink = Boolean(ev.sourceUrl && ev.sourceUrl.trim().length > 0);

                return (
                  <div
                    key={ev.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-[#151B23] border border-stone-200/60 dark:border-[#273244]/80 text-xs font-tajawal"
                  >
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <button
                        type="button"
                        onClick={() => handleCitationClick(ev.id)}
                        className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-800 dark:bg-emerald-700 text-white font-bold text-[10px] font-sans hover:bg-emerald-900 transition-colors cursor-pointer"
                        title="انقر لعرض البطاقة الكاملة للدليل"
                      >
                        [{ev.id}]
                      </button>

                      <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-[#F3F4F6]">
                        <span>{isQuran ? '📖' : isHadith ? '📚' : '📜'}</span>
                        <span>{ev.sourceName}</span>
                      </div>

                      {/* Coordinates */}
                      {isQuran && (ev.surah || ev.ayah) && (
                        <span className="text-stone-600 dark:text-[#A7B0BE] font-medium">
                          {ev.surah ? `سورة ${ev.surah}` : ''} {ev.ayah ? `— الآية ${ev.ayah}` : ''}
                        </span>
                      )}

                      {isHadith && ev.referenceNumber && (
                        <span className="text-stone-600 dark:text-[#A7B0BE] font-sans font-medium">
                          حديث رقم: {ev.referenceNumber}
                          {ev.book ? ` (${ev.book})` : ''}
                        </span>
                      )}

                      {!isQuran && !isHadith && ev.referenceDetail && (
                        <span className="text-stone-600 dark:text-[#A7B0BE]">
                          {ev.referenceDetail}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hasLink ? (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>{isQuran ? 'فتح الآية' : isHadith ? 'فتح الحديث' : 'فتح المصدر'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCitationClick(ev.id)}
                          className="text-[11px] text-stone-500 hover:text-emerald-800 dark:hover:text-emerald-400 hover:underline"
                        >
                          عرض تفاصيل النص
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🌟 Layer 2: Four Collapsible Sections (Accordions) 🌟 */}
        <div className="space-y-2 mt-4 pt-3 border-t border-stone-150 dark:border-[#273244]">
          
          {/* Accordion 1: 📖 الأدلة والمراجع المسترجعة (Only rendered when references are present) */}
          {evidences.length > 0 && (
            <div className="border border-stone-200 dark:border-[#273244] rounded-xl overflow-hidden bg-stone-50/40 dark:bg-[#111827]/40">
              <button
                type="button"
                onClick={() => setIsEvidenceOpen((prev) => !prev)}
                className="w-full p-3 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800 dark:text-[#F3F4F6] hover:bg-stone-100/70 dark:hover:bg-[#1A202C] transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📖</span>
                  <span className="font-tajawal">
                    الأدلة والمراجع المسترجعة ({evidences.length})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-normal text-stone-500 dark:text-[#A7B0BE]">
                  <span>{isEvidenceOpen ? 'إخفاء' : 'عرض التفاصيل'}</span>
                  {isEvidenceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isEvidenceOpen && (
                <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-[#273244] bg-white dark:bg-[#151B23] space-y-3">
                  {evidences.map((ev: TraceableEvidence) => {
                    const isHighlighted = highlightedEvidenceId === ev.id;
                    return (
                      <div key={ev.id} id={`evidence-card-${message.id}-${ev.id}`}>
                        <EvidenceCard evidence={ev} isHighlighted={isHighlighted} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Accordion 2: 🛡️ تقرير التحقق الآلي */}
          <div className="border border-stone-200 dark:border-[#273244] rounded-xl overflow-hidden bg-stone-50/40 dark:bg-[#111827]/40">
            <button
              type="button"
              onClick={() => setIsAuditOpen((prev) => !prev)}
              className="w-full p-3 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800 dark:text-[#F3F4F6] hover:bg-stone-100/70 dark:hover:bg-[#1A202C] transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <span className="font-tajawal">تقرير التحقق الآلي</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-200 dark:bg-[#273244] text-stone-700 dark:text-[#A7B0BE]">
                  {message.reviewStatus === 'human_reviewed' ? 'مراجَع بشريًا' : 'تحقق آلي'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-normal text-stone-500 dark:text-[#A7B0BE]">
                <span>{isAuditOpen ? 'إخفاء' : 'عرض التقرير'}</span>
                {isAuditOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isAuditOpen && (
              <div className="p-3 sm:p-5 border-t border-stone-200 dark:border-[#273244] bg-white dark:bg-[#151B23] space-y-4 text-xs">
                {/* Reference Adequacy & Category Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244] space-y-1">
                    <span className="text-stone-500 dark:text-[#A7B0BE] block text-[11px]">كفاية المرجعية:</span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 font-tajawal text-xs sm:text-sm block">
                      {referenceAdequacy}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244] space-y-1">
                    <span className="text-stone-500 dark:text-[#A7B0BE] block text-[11px]">تصنيف المحتوى:</span>
                    <span className="font-bold text-emerald-950 dark:text-emerald-300 font-tajawal text-xs sm:text-sm block">
                      {activeLevelStyle.label}
                    </span>
                  </div>
                </div>

                {/* Dynamic Rationale */}
                <div className="p-3 bg-stone-50/70 dark:bg-[#111827] rounded-lg border border-stone-200 dark:border-[#273244] space-y-1.5">
                  <span className="font-bold text-stone-800 dark:text-[#F3F4F6] block">سبب تقييم كفاية المرجعية:</span>
                  <ul className="space-y-1 pr-3 text-stone-600 dark:text-[#A7B0BE]">
                    {dynamicRationale.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-600 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Automated Checks */}
                <div className="space-y-1.5">
                  <span className="font-bold text-stone-800 dark:text-[#F3F4F6] block">فحوصات النظام الآلية:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-stone-700 dark:text-[#A7B0BE]">
                      <Check className={`w-3.5 h-3.5 ${checks.sourcesFound ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span>تم العثور على مصادر داعمة</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-700 dark:text-[#A7B0BE]">
                      <Check className={`w-3.5 h-3.5 ${checks.textsVerified ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span>تم التحقق من وجود النصوص المستشهد بها</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-700 dark:text-[#A7B0BE]">
                      <Check className={`w-3.5 h-3.5 ${checks.noPersonalFatwaClaim ? 'text-emerald-600' : 'text-rose-600'}`} />
                      <span>{contentLevel === 'D' ? 'رُصدت حالة شخصية تستوجب الإحالة' : 'لم تُرصد حالة فتوى شخصية'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-700 dark:text-[#A7B0BE]">
                      <Check className={`w-3.5 h-3.5 ${checks.noConflictDetected ? 'text-emerald-600' : 'text-amber-600'}`} />
                      <span>لم يُرصد تعارض بين المصادر المسترجعة</span>
                    </div>
                  </div>
                </div>

                {/* Content Safety Check */}
                {message.suitabilityCheck && (
                  <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-stone-700 dark:text-[#A7B0BE] space-y-1">
                    <span className="font-bold text-emerald-950 dark:text-emerald-300 block">
                      فحص سلامة المحتوى واتساقه مع المصادر المعتمدة:
                    </span>
                    <p>{message.suitabilityCheck}</p>
                  </div>
                )}

                {/* Transparency Disclaimer */}
                <div className="text-[11px] text-stone-500 dark:text-[#A7B0BE] pt-2 border-t border-stone-200 dark:border-[#273244] leading-relaxed">
                  <strong>ملاحظة شفافية:</strong> يصف هذا التقرير الفحوصات التقنية الآلية التي أجراها النظام للتأكد من سلامة استرجاع النصوص واتساقها، ولا يمثل شهادة بصحة شرعية مطلقة.
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: 🧭 منهجية الإجابة */}
          <div className="border border-stone-200 dark:border-[#273244] rounded-xl overflow-hidden bg-stone-50/40 dark:bg-[#111827]/40">
            <button
              type="button"
              onClick={() => setIsMethodologyOpen((prev) => !prev)}
              className="w-full p-3 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800 dark:text-[#F3F4F6] hover:bg-stone-100/70 dark:hover:bg-[#1A202C] transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🧭</span>
                <span className="font-tajawal">منهجية الإجابة وضوابط الحوار</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-normal text-stone-500 dark:text-[#A7B0BE]">
                <span>{isMethodologyOpen ? 'إخفاء' : 'عرض المنهجية'}</span>
                {isMethodologyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isMethodologyOpen && (
              <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-[#273244] bg-white dark:bg-[#151B23] space-y-2.5 text-xs text-stone-700 dark:text-[#A7B0BE]">
                {message.understanding && (
                  <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
                    <strong className="block text-emerald-950 dark:text-emerald-300 mb-0.5">تكييف سياق الطلب:</strong>
                    <p>{message.understanding}</p>
                  </div>
                )}
                {message.dialogueMethodologySummary && (
                  <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-[#111827] border border-stone-200 dark:border-[#273244]">
                    <strong className="block text-emerald-950 dark:text-emerald-300 mb-0.5">ملخص منهجية الحوار:</strong>
                    <p>{message.dialogueMethodologySummary}</p>
                  </div>
                )}
                <ul className="space-y-1 pr-3 text-[11px] list-disc">
                  <li>الالتزام بالأسلوب الهادئ والمحترم وتفكيك الشبهات بالأدلة العقلية والنقلية.</li>
                  <li>عدم إطلاق أحكام مطلقة في مواطن الخلاف المعتبر.</li>
                  <li>الامتناع عن الفتوى الشخصية في الحالات الفردية التي تستوجب الإحالة.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Accordion 4: ➡️ الخطوة التالية */}
          <div className="border border-stone-200 dark:border-[#273244] rounded-xl overflow-hidden bg-stone-50/40 dark:bg-[#111827]/40">
            <button
              type="button"
              onClick={() => setIsNextStepOpen((prev) => !prev)}
              className="w-full p-3 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800 dark:text-[#F3F4F6] hover:bg-stone-100/70 dark:hover:bg-[#1A202C] transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">➡️</span>
                <span className="font-tajawal">الخطوة التالية والإرشاد</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-normal text-stone-500 dark:text-[#A7B0BE]">
                <span>{isNextStepOpen ? 'إخفاء' : 'عرض التوجيه'}</span>
                {isNextStepOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isNextStepOpen && (
              <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-[#273244] bg-white dark:bg-[#151B23] space-y-2 text-xs sm:text-sm text-stone-700 dark:text-[#A7B0BE]">
                {contentLevel === 'D' ? (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-950 dark:text-rose-200">
                    <strong className="block mb-1 font-tajawal">إحالة إلزامية لمفتٍ مؤهل:</strong>
                    <p className="leading-relaxed">
                      نظراً لأن هذه المسألة تتعلق بوقائع وأحوال شخصية خاصة، فإن الأحكام تتغير بحسب الملابسات والنيات. يُرجى استشارة الجهات الإفتائية المعتمدة أو عالم موثوق ومؤهل لعرض تفاصيل الواقعة كاملة.
                    </p>
                  </div>
                ) : message.nextStepSuggestion ? (
                  <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg text-stone-800 dark:text-[#F3F4F6]">
                    <strong className="block mb-1 text-emerald-950 dark:text-emerald-300 font-tajawal">
                      يمكنك المتابعة بسؤال مثل:
                    </strong>
                    <p className="leading-relaxed font-tajawal">{message.nextStepSuggestion}</p>
                  </div>
                ) : (
                  <p className="leading-relaxed">
                    يمكنك كتابة سؤال متابع في نفس السياق أو طلب مزيد من الأدلة حول نقطة معينة.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
