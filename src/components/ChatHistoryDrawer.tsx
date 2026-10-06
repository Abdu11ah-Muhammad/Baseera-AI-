import React, { useState } from 'react';
import {
  X,
  History,
  Plus,
  Trash2,
  MessageSquare,
  Search,
  Check,
  Edit2,
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  PanelRightClose
} from 'lucide-react';
import { ChatSession } from '../types/chat';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onClearAllSessions: () => void;
  onOpenMethodology?: () => void;
  onOpenSources?: () => void;
}

export const ChatSidebarContent: React.FC<{
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onClearAllSessions: () => void;
  onClose?: () => void;
  onOpenMethodology?: () => void;
  onOpenSources?: () => void;
}> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onClearAllSessions,
  onClose,
  onOpenMethodology,
  onOpenSources,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(term);
    const msgMatch = s.messages.some((m) => m.content.toLowerCase().includes(term));
    return titleMatch || msgMatch;
  });

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const twoDaysMs = 48 * 60 * 60 * 1000;

  const todaySessions = filteredSessions.filter((s) => now - s.updatedAt < oneDayMs);
  const yesterdaySessions = filteredSessions.filter(
    (s) => now - s.updatedAt >= oneDayMs && now - s.updatedAt < twoDaysMs
  );
  const olderSessions = filteredSessions.filter((s) => now - s.updatedAt >= twoDaysMs);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F8FAFC] dark:bg-[#111827] text-stone-900 dark:text-[#F3F4F6] transition-colors">
      {/* Top Header */}
      <div className="p-3.5 sm:p-4 border-b border-stone-200 dark:border-[#273244] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="font-bold text-sm font-tajawal text-emerald-950 dark:text-emerald-300">
            سجل المحادثات
          </span>
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 px-1.5 py-0.5 rounded-md font-semibold">
            {sessions.length}
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="p-1 rounded-lg text-stone-400 dark:text-[#A7B0BE] hover:text-stone-700 dark:hover:text-[#F3F4F6] hover:bg-stone-200 dark:hover:bg-[#1A202C] transition-colors"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Action button & Search */}
      <div className="p-3 space-y-2 border-b border-stone-200 dark:border-[#273244] bg-white dark:bg-[#151B23]">
        <button
          onClick={onNewSession}
          className="w-full py-2.5 px-3 bg-emerald-900 dark:bg-emerald-700 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs group cursor-pointer"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>محادثة جديدة</span>
        </button>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث في المحادثات..."
            className="w-full pr-8 pl-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-[#273244] focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500 bg-stone-50 dark:bg-[#1A202C] text-stone-900 dark:text-[#F3F4F6] placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-10 px-3 text-stone-400 dark:text-stone-500">
            <MessageSquare className="w-9 h-9 mx-auto mb-2 text-stone-300 dark:text-stone-600 stroke-[1.5]" />
            <p className="text-xs font-tajawal font-medium">لا توجد محادثات سابقة</p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
              ابدأ بطرح أي سؤال وسيتكون سياق الحوار تلقائياً
            </p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-6 text-xs text-stone-500 dark:text-[#A7B0BE]">
            لا توجد محادثة مطابقة لـ «{searchTerm}»
          </div>
        ) : (
          <>
            {todaySessions.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-1.5 px-2">
                  اليوم
                </span>
                <div className="space-y-1">
                  {todaySessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={() => {
                        onSelectSession(session.id);
                        if (onClose) onClose();
                      }}
                      onDelete={() => onDeleteSession(session.id)}
                      onRename={(newTitle) => onRenameSession(session.id, newTitle)}
                    />
                  ))}
                </div>
              </div>
            )}

            {yesterdaySessions.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-1.5 px-2 mt-2">
                  الأمس
                </span>
                <div className="space-y-1">
                  {yesterdaySessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={() => {
                        onSelectSession(session.id);
                        if (onClose) onClose();
                      }}
                      onDelete={() => onDeleteSession(session.id)}
                      onRename={(newTitle) => onRenameSession(session.id, newTitle)}
                    />
                  ))}
                </div>
              </div>
            )}

            {olderSessions.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-1.5 px-2 mt-2">
                  سابقاً
                </span>
                <div className="space-y-1">
                  {olderSessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={() => {
                        onSelectSession(session.id);
                        if (onClose) onClose();
                      }}
                      onDelete={() => onDeleteSession(session.id)}
                      onRename={(newTitle) => onRenameSession(session.id, newTitle)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-stone-200 dark:border-[#273244] bg-stone-50/80 dark:bg-[#151B23] space-y-2">
        <div className="flex items-center justify-between text-xs">
          {onOpenMethodology && (
            <button
              onClick={onOpenMethodology}
              className="text-stone-600 dark:text-[#A7B0BE] hover:text-emerald-900 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
              <span>المنهجية</span>
            </button>
          )}

          {onOpenSources && (
            <button
              onClick={onOpenSources}
              className="text-stone-600 dark:text-[#A7B0BE] hover:text-emerald-900 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
              <span>المصادر</span>
            </button>
          )}

          {sessions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من مسح جميع سجلات المحادثات؟')) {
                  onClearAllSessions();
                }
              }}
              title="مسح كافة المحادثات"
              className="text-stone-400 dark:text-stone-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatHistoryDrawer: React.FC<ChatHistoryProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-start bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={props.onClose}
    >
      <div
        className="w-full max-w-xs sm:max-w-sm h-full shadow-2xl overflow-hidden border-l border-stone-200 dark:border-[#273244] bg-[#F8FAFC] dark:bg-[#111827]"
        onClick={(e) => e.stopPropagation()}
      >
        <ChatSidebarContent {...props} />
      </div>
    </div>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title || '');

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditTitle(session.title || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-2 bg-emerald-50 dark:bg-[#1A202C] border border-emerald-300 dark:border-emerald-700 rounded-xl">
        <form onSubmit={handleSaveRename} className="flex items-center gap-1.5">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
            className="w-full text-xs p-1 rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-[#151B23] text-stone-900 dark:text-[#F3F4F6] focus:outline-none"
          />
          <button
            type="submit"
            title="حفظ التسمية"
            aria-label="حفظ التسمية"
            className="p-1 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-200/50 rounded"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancelRename}
            title="إلغاء"
            aria-label="إلغاء التعديل"
            className="p-1 text-stone-400 hover:text-stone-700 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-1.5 text-right ${
        isActive
          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 shadow-xs'
          : 'bg-white dark:bg-[#151B23] hover:bg-stone-50 dark:hover:bg-[#1A202C] border-stone-200 dark:border-[#273244] text-stone-800 dark:text-[#F3F4F6]'
      }`}
    >
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs font-bold font-tajawal truncate">
          {session.title || 'محادثة جديدة'}
        </h4>
        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-400 dark:text-stone-500 font-sans">
          <span>{session.messages.length} رسائل</span>
          <span aria-hidden="true">·</span>
          <span>{new Date(session.updatedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          title="تعديل عنوان المحادثة"
          aria-label="تعديل عنوان المحادثة"
          className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#273244] transition-colors"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="حذف هذه المحادثة"
          aria-label="حذف هذه المحادثة"
          className="p-1 rounded text-stone-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
