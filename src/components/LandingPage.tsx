import React from 'react';
import { MessageSquare, ArrowLeft, ShieldCheck, BookOpen, Compass, Sparkles, Library } from 'lucide-react';
import { PRESET_TOPICS } from '../data/islamicKnowledgeBase';
import { PresetTopic } from '../types/chat';

interface LandingPageProps {
  onStartChat: (initialQuery?: string) => void;
  onOpenAbout: () => void;
  onOpenMethodology: () => void;
  onOpenRegistry: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartChat,
  onOpenAbout,
  onOpenMethodology,
  onOpenRegistry,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-16 max-w-4xl mx-auto text-center animate-in fade-in duration-300">
      {/* Visual Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 text-xs font-semibold font-tajawal">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>استرجاع معرفي إسلامي موثق ومحكم</span>
      </div>

      {/* Main Title & Subtitle */}
      <div className="mb-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold font-tajawal text-emerald-950 dark:text-[#F3F4F6] tracking-tight mb-2">
          بصيرة
        </h1>
        <p className="text-lg sm:text-2xl font-bold font-tajawal text-emerald-800 dark:text-emerald-400">
          مساعد الداعية
        </p>
      </div>

      {/* Short Description */}
      <p className="text-sm sm:text-base text-stone-600 dark:text-[#A7B0BE] max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10 font-tajawal">
        مساعد ذكي للحوار والدعوة، يعتمد على المصادر الإسلامية الموثوقة لتقديم إجابات واضحة قابلة للتتبع.
      </p>

      {/* Primary & Secondary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-md mb-12 sm:mb-16">
        <button
          onClick={() => onStartChat()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold font-tajawal text-white bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 dark:hover:bg-emerald-600 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <MessageSquare className="w-5 h-5" />
          <span>ابدأ محادثة</span>
          <ArrowLeft className="w-4 h-4 ml-1" />
        </button>

        <button
          onClick={onOpenAbout}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 text-base font-semibold font-tajawal text-stone-700 dark:text-[#F3F4F6] bg-white dark:bg-[#1A202C] hover:bg-stone-100 dark:hover:bg-[#273244] rounded-xl border border-stone-200 dark:border-[#273244] shadow-xs transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>عن بصيرة</span>
        </button>
      </div>

      {/* Quick Launch Questions (Optional, minimal single row) */}
      <div className="w-full max-w-2xl mb-12">
        <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 mb-3 font-tajawal">
          أو اختر سؤالاً شائعاً لبدء المحادثة مباشرة:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PRESET_TOPICS.slice(0, 4).map((topic: PresetTopic) => (
            <button
              key={topic.id}
              onClick={() => onStartChat(topic.question)}
              className="text-xs px-3.5 py-2 rounded-lg bg-white/80 dark:bg-[#151B23] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-[#A7B0BE] hover:text-emerald-900 dark:hover:text-emerald-300 border border-stone-200 dark:border-[#273244] hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors font-tajawal cursor-pointer shadow-2xs"
            >
              {topic.title}
            </button>
          ))}
        </div>
      </div>

      {/* Minimal Footer Navigation Links */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-stone-500 dark:text-[#A7B0BE]">
        <button
          onClick={onOpenMethodology}
          className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>منهجية العمل</span>
        </button>
        <span className="text-stone-300 dark:text-stone-600 select-none">·</span>
        <button
          onClick={onOpenRegistry}
          className="hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Library className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>سجل المصادر</span>
        </button>
        <span className="text-stone-300 dark:text-stone-600 select-none">·</span>
        <span className="text-stone-400 dark:text-stone-600 font-sans">
          توثيق معتمد وقابل للتتبع
        </span>
      </div>
    </div>
  );
};
