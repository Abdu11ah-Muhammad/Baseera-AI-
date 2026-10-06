import React, { useState } from 'react';
import { Sparkles, BookOpen, Compass, ShieldCheck, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { PRESET_TOPICS } from '../data/islamicKnowledgeBase';
import { PresetTopic, QuestionCategory } from '../types/chat';

interface EmptyStateProps {
  onSelectTopic: (topic: PresetTopic) => void;
  onOpenMethodology: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectTopic, onOpenMethodology }) => {
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');

  const filteredTopics =
    selectedCategory === 'all'
      ? PRESET_TOPICS
      : PRESET_TOPICS.filter((t) => t.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-8 sm:pt-8 sm:pb-12 px-4 text-center">
      {/* Main Title & Philosophy */}
      <h1 className="text-2xl sm:text-4xl font-bold font-tajawal text-emerald-950 dark:text-[#F3F4F6] tracking-tight mb-3">
        بصيرة <span className="text-emerald-700 dark:text-emerald-400 font-light">|</span> مساعد الداعية
      </h1>
      <p className="text-sm sm:text-base text-stone-600 dark:text-[#A7B0BE] max-w-2xl mx-auto leading-relaxed mb-6 font-tajawal">
        مساعدك الذكي في البحث والتحقق الشرعي والخطاب الدعوي؛ يفهم طبيعة السائل وسياق مسألته، يفكك الشبهات، ويوثق الأدلة من أمهات المصادر المعتمدة دون اختلاق أو موعظة غير مطلوبة.
      </p>

      {/* Trust Markers Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500 dark:text-[#A7B0BE] mb-8 font-sans">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>عزو دقيق لكتب السنة والمجامع الفقهية</span>
        </div>
        <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>تنبيه تلقائي عند المسائل الخلافية</span>
        </div>
        <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
        <button
          onClick={onOpenMethodology}
          className="text-emerald-800 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
        >
          <span>تعرف على المنهجية والضوابط</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Segmented Control Filter Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-1.5 mb-6 p-1 bg-stone-200/60 dark:bg-[#151B23] border border-stone-200 dark:border-[#273244] rounded-xl max-w-xl mx-auto transition-colors">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            selectedCategory === 'all'
              ? 'bg-white dark:bg-[#1A202C] text-emerald-950 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-[#A7B0BE] hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          كافة الموضوعات
        </button>
        <button
          onClick={() => setSelectedCategory('fiqh')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            selectedCategory === 'fiqh'
              ? 'bg-white dark:bg-[#1A202C] text-emerald-950 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-[#A7B0BE] hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          عبادات وفقه
        </button>
        <button
          onClick={() => setSelectedCategory('aqidah')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            selectedCategory === 'aqidah'
              ? 'bg-white dark:bg-[#1A202C] text-emerald-950 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-[#A7B0BE] hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          عقيدة وشبهات
        </button>
        <button
          onClick={() => setSelectedCategory('muamalat')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            selectedCategory === 'muamalat'
              ? 'bg-white dark:bg-[#1A202C] text-emerald-950 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-[#A7B0BE] hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          معاملات مالية
        </button>
        <button
          onClick={() => setSelectedCategory('tazkiyah')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            selectedCategory === 'tazkiyah'
              ? 'bg-white dark:bg-[#1A202C] text-emerald-950 dark:text-emerald-300 shadow-xs'
              : 'text-stone-600 dark:text-[#A7B0BE] hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          أخلاق وتزكية
        </button>
      </div>

      {/* Suggested Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-right">
        {filteredTopics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            className="p-4 bg-white dark:bg-[#151B23] hover:bg-emerald-50/40 dark:hover:bg-[#111827] border border-stone-200 dark:border-[#273244] hover:border-emerald-700/40 dark:hover:border-emerald-500/50 rounded-xl transition-all shadow-xs group flex flex-col justify-between text-right"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                  {topic.categoryLabel}
                </span>
                <ArrowUpRight className="w-4 h-4 text-stone-400 dark:text-stone-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-[#F3F4F6] mb-1 group-hover:text-emerald-950 dark:group-hover:text-emerald-300 transition-colors">
                {topic.title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-[#A7B0BE] line-clamp-2 leading-relaxed">
                {topic.question}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-stone-100 dark:border-[#273244] flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500">
              <span>انقر لتجربة الإجابة والتحليل</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
