import React from 'react';
import { PlusCircle, Sparkles, History, Sun, Moon, PanelRight, Library, Compass, Home } from 'lucide-react';

interface HeaderProps {
  onNewChat: () => void;
  onOpenMethodology: () => void;
  onOpenRegistry: () => void;
  onOpenAbout?: () => void;
  onGoHome?: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isChatActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewChat,
  onOpenMethodology,
  onOpenRegistry,
  onOpenAbout,
  onGoHome,
  onOpenHistory,
  historyCount,
  isDarkMode,
  onToggleTheme,
  isSidebarOpen,
  onToggleSidebar,
  isChatActive = true,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F8FAFC]/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-stone-200 dark:border-[#273244] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Sidebar Toggle (Desktop) & Responsive Wordmark (No letter box!) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSidebar && isChatActive && (
            <button
              onClick={onToggleSidebar}
              title={isSidebarOpen ? 'طي الشريط الجانبي' : 'إظهار الشريط الجانبي للمحادثات'}
              aria-label="تبديل الشريط الجانبي"
              className="hidden lg:flex p-1.5 sm:p-2 text-stone-600 dark:text-[#A7B0BE] hover:text-emerald-950 dark:hover:text-emerald-400 bg-stone-100 dark:bg-[#1A202C] hover:bg-stone-200 dark:hover:bg-[#273244] rounded-lg border border-stone-200 dark:border-[#273244] transition-colors cursor-pointer shrink-0"
            >
              <PanelRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              if (onGoHome) onGoHome();
              else onNewChat();
            }}
            title="الرئيسية"
            className="flex items-center gap-1.5 sm:gap-2 group transition-colors select-none min-w-0 text-right cursor-pointer"
          >
            {/* Pure Wordmark: بصيرة | مساعد الداعية (NO letter badge) */}
            <span className="text-base sm:text-lg font-bold font-tajawal tracking-tight text-emerald-950 dark:text-emerald-300">
              بصيرة
            </span>
            <span className="text-stone-300 dark:text-stone-600 font-light select-none text-xs sm:text-sm">|</span>
            <span className="text-xs sm:text-sm font-semibold font-tajawal text-emerald-800 dark:text-emerald-400 whitespace-nowrap truncate">
              مساعد الداعية
            </span>
          </button>
        </div>

        {/* Zone 2: Fast Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-stone-600 dark:text-[#A7B0BE]">
          {onGoHome && isChatActive && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-1 hover:text-emerald-900 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
              <span>الرئيسية</span>
            </button>
          )}
          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1 hover:text-emerald-900 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
              <span>عن بصيرة</span>
            </button>
          )}
          <button
            onClick={onOpenMethodology}
            className="flex items-center gap-1 hover:text-emerald-900 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
            <span>المنهجية</span>
          </button>
          <button
            onClick={onOpenRegistry}
            className="flex items-center gap-1 hover:text-emerald-900 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <Library className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
            <span>سجل المصادر</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Always accessible, fully responsive) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dedicated "المحادثات" Button */}
          <button
            onClick={onOpenHistory}
            title="عرض سجل المحادثات والتبديل بينها"
            aria-label="سجل المحادثات"
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-stone-700 dark:text-[#F3F4F6] bg-stone-100 dark:bg-[#1A202C] hover:bg-stone-200 dark:hover:bg-[#273244] rounded-lg border border-stone-200 dark:border-[#273244] transition-all cursor-pointer shadow-2xs"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">المحادثات</span>
            <span className="text-[10px] sm:text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
              {historyCount}
            </span>
          </button>

          {/* Theme Toggle Button (Light ↔ Dark) */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            aria-label={isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            className="p-1.5 sm:p-2 text-stone-700 dark:text-[#F3F4F6] bg-stone-100 dark:bg-[#1A202C] hover:bg-stone-200 dark:hover:bg-[#273244] rounded-lg border border-stone-200 dark:border-[#273244] transition-colors cursor-pointer"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-stone-700 animate-in spin-in-180 duration-200" />
            )}
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            title="بدء محادثة جديدة وتصفير سياق الحوار"
            aria-label="محادثة جديدة"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 dark:hover:bg-emerald-600 rounded-lg shadow-xs transition-all whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">محادثة جديدة</span>
            <span className="sm:hidden">جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
