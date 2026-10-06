import React from 'react';
import { Loader2 } from 'lucide-react';

interface SimpleLoadingStateProps {
  currentStage: number; // 0: البحث في المصادر, 1: إعداد الإجابة, 2: تجهيز المراجع
}

export const RagSimProgress: React.FC<SimpleLoadingStateProps> = ({ currentStage }) => {
  const stageLabels = [
    'جاري البحث في المصادر...',
    'جاري إعداد الإجابة...',
    'جاري تجهيز المراجع...',
  ];

  const label = stageLabels[Math.min(currentStage, stageLabels.length - 1)] || stageLabels[0];

  return (
    <div className="flex items-center gap-2.5 py-3 px-4 my-2 max-w-sm rounded-xl bg-white dark:bg-[#151B23] border border-stone-200 dark:border-[#273244] shadow-xs text-xs font-semibold text-stone-700 dark:text-[#F3F4F6] font-tajawal animate-pulse">
      <Loader2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 animate-spin shrink-0" />
      <span>{label}</span>
    </div>
  );
};
