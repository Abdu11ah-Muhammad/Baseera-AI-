import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  PlusCircle,
  RotateCcw,
  Globe,
  Database,
  History,
  MessageSquarePlus,
  MessageSquare,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { AboutModal } from './components/AboutModal';
import { ChatMessageItem } from './components/ChatMessageItem';
import { MethodologyModal } from './components/MethodologyModal';
import { SourcesDrawer } from './components/SourcesDrawer';
import { SourcesRegistryModal } from './components/SourcesRegistryModal';
import { CitationModal } from './components/CitationModal';
import { ChatHistoryDrawer, ChatSidebarContent } from './components/ChatHistoryDrawer';
import { RagSimProgress } from './components/RagSimProgress';
import {
  ChatMessage,
  ChatSession,
  CustomDocument,
  PresetTopic,
  SourceReference
} from './types/chat';
import {
  FATWA_DISCLAIMER,
  PRESET_TOPICS,
  queryIslamicKnowledgeBase
} from './data/islamicKnowledgeBase';

function generateCleanSessionTitle(query: string): string {
  let cleaned = query.replace(/^(ما هو|ما هي|ما حكم|ما معنى|هل يجوز|كيف|لماذا|متى|أين|شرح|تفسير)\s+/i, '');
  cleaned = cleaned.replace(/[؟?.,!]/g, '').trim();
  if (cleaned.length === 0) cleaned = query;
  return cleaned.length > 35 ? cleaned.slice(0, 35) + '...' : cleaned;
}

export default function App() {
  // Navigation Flow State: 'landing' (Home) -> 'chat' (Conversation)
  const [viewMode, setViewMode] = useState<'landing' | 'chat'>('landing');

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('baseera_chat_sessions') || localStorage.getItem('bayan_chat_sessions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState<number>(0); // 0: البحث, 1: إعداد, 2: تجهيز
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  // Sidebar & Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<SourceReference | null>(null);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('baseera_theme') || localStorage.getItem('bayan_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('baseera_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('baseera_theme', 'light');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Custom documents added by the user
  const [customDocs, setCustomDocs] = useState<CustomDocument[]>(() => {
    try {
      const savedDocs = localStorage.getItem('baseera_custom_docs') || localStorage.getItem('bayan_custom_docs');
      if (savedDocs) return JSON.parse(savedDocs);
    } catch {
      // ignore
    }
    return [
      {
        id: 'sample-doc-1',
        title: 'كفارة اليمين عند الحنفية والجمهور',
        category: 'fiqh',
        content:
          'كفارة اليمين تجب بإطعام عشرة مساكين من أوسط ما تطعمون أهليكم أو كسوتهم أو تحرير رقبة. ويجوز عند الحنفية إخراج القيمة نقداً تيسيراً على الفقير ومراعاة لحاجته، بينما اشترط الجمهور الإطعام عيناً، ويجزئ إخراج القيمة إذا تعينت المصلحة.',
        sourceReference: 'الهداية في شرح بداية المبتدي مع فتاوى معاصرة',
        createdAt: '2026-09-29'
      }
    ];
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Programmatic focus helper for Desktop & Mobile
  const triggerFocus = useCallback(() => {
    // 1. Immediate synchronous attempt (critical for mobile iOS/Android touch events)
    if (textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
    // 2. Next animation frame for layout paint cycle
    const rafId = requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
      }
    });
    // 3. Fallback slight delay for mobile viewport keyboard rendering
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
      }
    }, 80);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, []);

  // Ref callback to capture textarea node and trigger focus immediately upon DOM mounting
  const setInputRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (node && viewMode === 'chat' && messages.length === 0) {
        node.focus({ preventScroll: true });
      }
    },
    [viewMode, messages.length]
  );

  // Auto-focus whenever entering chat mode with an empty conversation
  useEffect(() => {
    if (viewMode === 'chat' && messages.length === 0) {
      triggerFocus();
    }
  }, [viewMode, messages.length, triggerFocus]);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('baseera_chat_sessions', JSON.stringify(sessions));
    } catch {
      // ignore storage error
    }
  }, [sessions]);

  // Save custom docs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('baseera_custom_docs', JSON.stringify(customDocs));
    } catch {
      // ignore storage error
    }
  }, [customDocs]);

  // Adjust textarea height automatically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Send message with multi-turn conversation support
  const handleSendMessage = async (overrideText?: string) => {
    const query = (overrideText || inputText).trim();
    if (!query || isGenerating) return;

    // Switch view to chat if on landing
    setViewMode('chat');
    setLastFailedQuery(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    // Save user message to active state
    const priorMessages = messages;
    const updatedMessages = [...priorMessages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Scroll to show the newly sent question immediately
    setTimeout(() => {
      const userEl = document.getElementById(`msg-${userMsg.id}`);
      if (userEl) {
        userEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);

    // Determine or update active session
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = `session-${Date.now()}`;
      setActiveSessionId(currentSessionId);
      const newSession: ChatSession = {
        id: currentSessionId,
        title: generateCleanSessionTitle(query),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: updatedMessages,
      };
      setSessions((prev) => [newSession, ...prev]);
    } else {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, updatedAt: Date.now(), messages: updatedMessages }
            : s
        )
      );
    }

    // Initiate Real AI generation
    setIsGenerating(true);
    await executeRagWorkflow(query, currentSessionId, priorMessages, userMsg);
  };

  const executeRagWorkflow = async (
    query: string,
    sessionId: string,
    priorHistory: ChatMessage[],
    userMsg: ChatMessage
  ) => {
    // 3-stage simple loading progress:
    // 0: جاري البحث في المصادر...
    // 1: جاري إعداد الإجابة...
    // 2: جاري تجهيز المراجع...
    setLoadingStage(0);
    const stage1Timer = setTimeout(() => setLoadingStage(1), 700);
    const stage2Timer = setTimeout(() => setLoadingStage(2), 1500);

    let assistantMsg: ChatMessage | null = null;

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          customDocs: customDocs,
          conversationHistory: priorHistory.map((m) => ({
            role: m.role,
            content: m.content,
            briefAnswer: m.briefAnswer,
            explanation: m.explanation,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          assistantMsg = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.text || data.briefAnswer || data.explanation || 'تمت الإجابة بناءً على المصادر المعتمدة.',
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            understanding: data.understanding,
            classification: data.classification || [],
            contentLevel: data.contentLevel || 'B',
            contentLevelLabel: data.contentLevelLabel || 'B — شرح واستدلال',
            referenceAdequacy: data.referenceAdequacy || 'مرتفعة',
            adequacyRationale: data.adequacyRationale || [],
            evidenceLevel: data.evidenceLevel || 'مرتفعة',
            evidenceLevelArabic: data.evidenceLevelArabic || 'مرتفعة',
            briefAnswer: data.briefAnswer,
            explanation: data.explanation,
            evidence: data.evidence,
            summary: data.summary,
            dispute: data.dispute,
            traceableEvidences: data.traceableEvidences || [],
            sourcesSearched: data.sourcesSearched || [],
            automatedChecks: data.automatedChecks,
            suitabilityCheck: data.suitabilityCheck,
            dialogueMethodologySummary: data.dialogueMethodologySummary,
            nextStepSuggestion: data.nextStepSuggestion,
            disclaimer: data.disclaimer || FATWA_DISCLAIMER,
            reviewStatus: data.reviewStatus || 'automated',
            isRealAi: true,
          };
        }
      }
    } catch (err) {
      console.warn('Network or AI endpoint error, trying robust knowledge fallback:', err);
    } finally {
      clearTimeout(stage1Timer);
      clearTimeout(stage2Timer);
    }

    // Graceful fallback: If API was temporarily unreachable, generate from trusted knowledge base
    if (!assistantMsg) {
      try {
        const responseData = queryIslamicKnowledgeBase(query, customDocs);
        assistantMsg = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          ...responseData,
        };
      } catch (fallbackErr) {
        console.error('Fallback generation also failed:', fallbackErr);
      }
    }

    // If still no assistant message (critical system failure), show clear error with Retry button (NO SILENT FAILURE)
    if (!assistantMsg) {
      setLastFailedQuery(query);
      assistantMsg = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        isError: true,
        content: 'تعذر إكمال الإجابة حاليًا بسبب مشكلة مؤقتة. حاول مرة أخرى.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // Save final message in continuous conversation
    const finalMessages = [...priorHistory, userMsg, assistantMsg];
    setMessages(finalMessages);
    setIsGenerating(false);

    // Sync session state and storage
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, updatedAt: Date.now(), messages: finalMessages }
          : s
      )
    );

    // FIX AUTO SCROLL:
    // When the assistant message appears, smoothly scroll to the START / TOP of the assistant's answer
    // so the user sees the answer starting from line 1 and can read downwards naturally!
    const targetMsgId = assistantMsg.id;
    setTimeout(() => {
      const el = document.getElementById(`msg-${targetMsgId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Switch to an existing past conversation
  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setActiveSessionId(session.id);
      setMessages(session.messages || []);
      setInputText('');
      setIsGenerating(false);
      setIsHistoryOpen(false);
      setViewMode('chat');
    }
  };

  // Start a fresh, clean conversation session
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInputText('');
    setIsGenerating(false);
    setIsHistoryOpen(false);
    setViewMode('chat');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    triggerFocus();
  };

  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  };

  // Rename a session
  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    );
  };

  // Delete a session
  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      handleNewChat();
    }
  };

  const handleClearAllSessions = () => {
    setSessions([]);
    handleNewChat();
  };

  const handleAddCustomDoc = (doc: CustomDocument) => {
    setCustomDocs((prev) => [doc, ...prev]);
  };

  const handleDeleteCustomDoc = (id: string) => {
    setCustomDocs((prev) => prev.filter((d) => d.id !== id));
  };

  // Reusable Chat Input Card component for both centered and sticky bottom states
  const renderInputCard = (isCentered: boolean) => (
    <div
      className={`bg-white/95 dark:bg-[#151B23]/95 backdrop-blur-md border border-stone-300 dark:border-[#273244] focus-within:border-emerald-700/70 dark:focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-700/20 dark:focus-within:ring-emerald-500/20 rounded-2xl transition-all p-2.5 sm:p-3 ${
        isCentered
          ? 'shadow-xl border-stone-300/90 dark:border-[#2b384c] ring-1 ring-stone-900/5 dark:ring-white/5'
          : 'shadow-lg'
      }`}
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={setInputRef}
          rows={isCentered ? 2 : 1}
          value={inputText}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          autoFocus={true}
          placeholder={
            isCentered
              ? 'اكتب سؤالك الشرعي أو استفسارك هنا...'
              : 'اكتب رسالتك التالية أو استفسارك التابع لمواصلة المحادثة...'
          }
          className="w-full max-h-40 p-2 text-sm sm:text-base font-tajawal bg-transparent resize-none focus:outline-none placeholder:text-stone-400 dark:placeholder:text-[#A7B0BE]/70 text-stone-900 dark:text-[#F3F4F6]"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isGenerating}
          aria-label="إرسال السؤال"
          className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-emerald-900 dark:bg-emerald-700 text-white flex items-center justify-center shrink-0 hover:bg-emerald-800 dark:hover:bg-emerald-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
          )}
        </button>
      </div>

      <div className="mt-2 pt-2 border-t border-stone-100 dark:border-[#273244] flex items-center justify-between text-[11px] text-stone-500 dark:text-[#A7B0BE] font-sans">
        <div className="flex items-center gap-1.5 truncate">
          <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span className="truncate">
            بصيرة مساعد دعوي ذكي يعتمد على المصادر المعتمدة ولا يصدر فتاوى شخصية حاسمة.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="text-stone-600 dark:text-[#A7B0BE] hover:text-emerald-900 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
          >
            <History className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
            <span>{sessions.length} محادثات</span>
          </button>
          <button
            onClick={() => setIsSourcesOpen(true)}
            className="text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Database className="w-3 h-3" />
            <span>{customDocs.length} وثائق</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F14] text-stone-900 dark:text-[#F3F4F6] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        onNewChat={handleNewChat}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenRegistry={() => setIsRegistryOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onGoHome={() => setViewMode('landing')}
        onOpenHistory={handleOpenHistory}
        historyCount={sessions.length}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isChatActive={viewMode === 'chat'}
      />

      {/* Main Content Area: Landing View vs Chat View */}
      {viewMode === 'landing' ? (
        <LandingPage
          onStartChat={(query) => {
            setViewMode('chat');
            setActiveSessionId(null);
            setMessages([]);
            setInputText('');
            if (query) {
              setTimeout(() => handleSendMessage(query), 50);
            } else {
              triggerFocus();
            }
          }}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenMethodology={() => setIsMethodologyOpen(true)}
          onOpenRegistry={() => setIsRegistryOpen(true)}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden w-full max-w-7xl mx-auto">
          {/* Desktop Sidebar (ChatGPT style) */}
          {isSidebarOpen && (
            <aside className="hidden lg:block w-72 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] border-l border-stone-200 dark:border-[#273244] shrink-0 sticky top-14 sm:top-16 transition-all">
              <ChatSidebarContent
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onNewSession={handleNewChat}
                onDeleteSession={handleDeleteSession}
                onRenameSession={handleRenameSession}
                onClearAllSessions={handleClearAllSessions}
                onClose={() => setIsSidebarOpen(false)}
                onOpenMethodology={() => setIsMethodologyOpen(true)}
                onOpenSources={() => setIsSourcesOpen(true)}
              />
            </aside>
          )}

          {/* Chat Workspace */}
          <main className="flex-1 min-w-0 flex flex-col justify-between pt-2 pb-2 px-3 sm:px-6 lg:px-8 h-full">
            {messages.length === 0 ? (
              /* Initial Conversation State (ChatGPT-Style Centered Input) */
              <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto px-2 sm:px-4 py-8 sm:py-12 my-auto transition-all duration-300 ease-out animate-in fade-in">
                {/* Centered Welcome Header */}
                <div className="w-full text-center mb-6 sm:mb-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
                    <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-tajawal text-emerald-950 dark:text-[#F3F4F6] tracking-tight mb-2">
                    بصيرة | مساعد الداعية
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-[#A7B0BE] max-w-md mx-auto leading-relaxed mb-4 font-tajawal">
                    اطرح استفسارك الشرعي أو الفقهي أو شبهة ترغب في تفكيكها وسيقوم بصيرة باسترجاع الأدلة وتوثيق المراجع بدقة.
                  </p>
                  <button
                    onClick={() => setIsAboutOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer font-tajawal"
                  >
                    <span>تعرف على ضوابط ومزايا بصيرة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Centered Input Card */}
                <div className="w-full transition-all duration-300 transform">
                  {renderInputCard(true)}
                </div>

                {/* Quick Launch Suggestions under Centered Input */}
                <div className="w-full mt-6">
                  <p className="text-[11px] font-semibold text-stone-400 dark:text-[#A7B0BE]/70 mb-2.5 text-center font-tajawal">
                    أو اختر من المسائل الشائعة للبدء الفوري:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {PRESET_TOPICS.slice(0, 4).map((topic: PresetTopic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleSendMessage(topic.question)}
                        className="text-xs px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#151B23] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-[#A7B0BE] hover:text-emerald-900 dark:hover:text-emerald-300 border border-stone-200/90 dark:border-[#273244] hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors font-tajawal shadow-2xs cursor-pointer"
                      >
                        {topic.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Active Ongoing Conversation View (Messages stream top + Input fixed at bottom) */
              <div className="flex-1 flex flex-col justify-between h-full min-h-0 animate-in fade-in duration-300">
                {/* Scrollable message stream */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-3 max-w-4xl w-full mx-auto">
                  {/* Active Session Sub-header */}
                  <div className="mb-4 pb-2 border-b border-stone-200/70 dark:border-[#273244] flex items-center justify-between text-xs text-stone-500 dark:text-[#A7B0BE]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                      <span className="font-semibold text-stone-800 dark:text-[#F3F4F6] truncate max-w-md">
                        {sessions.find((s) => s.id === activeSessionId)?.title || 'محادثة جارية'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleNewChat}
                        className="text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-tajawal font-medium"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>محادثة جديدة</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  {messages.map((msg) => (
                    <ChatMessageItem
                      key={msg.id}
                      message={msg}
                      fontSize={fontSize}
                      onSelectSource={(s) => setSelectedCitation(s)}
                      onRetry={
                        msg.isError
                          ? () => handleSendMessage(lastFailedQuery || 'أعد المحاولة')
                          : undefined
                      }
                    />
                  ))}

                  {/* Minimal 3-stage Loading Indicator */}
                  {isGenerating && <RagSimProgress currentStage={loadingStage} />}
                </div>

                {/* Sticky Bottom Input Bar */}
                <div className="sticky bottom-2 z-20 max-w-4xl w-full mx-auto pt-1 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  {renderInputCard(false)}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Mobile Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAllSessions={handleClearAllSessions}
        onOpenMethodology={() => {
          setIsHistoryOpen(false);
          setIsMethodologyOpen(true);
        }}
        onOpenSources={() => {
          setIsHistoryOpen(false);
          setIsSourcesOpen(true);
        }}
      />

      {/* Modals */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onStartChat={() => {
          setIsAboutOpen(false);
          handleNewChat();
        }}
      />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        onOpenRegistry={() => {
          setIsMethodologyOpen(false);
          setIsRegistryOpen(true);
        }}
      />

      <SourcesRegistryModal
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
      />

      <SourcesDrawer
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
        customDocs={customDocs}
        onAddCustomDoc={handleAddCustomDoc}
        onDeleteCustomDoc={handleDeleteCustomDoc}
        onSelectSourceDetail={(s) => setSelectedCitation(s)}
      />

      <CitationModal
        source={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
}
