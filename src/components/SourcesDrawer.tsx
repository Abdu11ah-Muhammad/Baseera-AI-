import React, { useState } from 'react';
import { X, BookOpen, Plus, Database, CheckCircle2, Trash2, ExternalLink, Shield } from 'lucide-react';
import { CustomDocument, QuestionCategory, SourceReference } from '../types/chat';
import { VERIFIED_SOURCES } from '../data/islamicKnowledgeBase';

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customDocs: CustomDocument[];
  onAddCustomDoc: (doc: CustomDocument) => void;
  onDeleteCustomDoc: (id: string) => void;
  onSelectSourceDetail: (source: SourceReference) => void;
}

export const SourcesDrawer: React.FC<SourcesDrawerProps> = ({
  isOpen,
  onClose,
  customDocs,
  onAddCustomDoc,
  onDeleteCustomDoc,
  onSelectSourceDetail
}) => {
  const [activeTab, setActiveTab] = useState<'verified' | 'custom'>('verified');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<QuestionCategory>('fiqh');
  const [content, setContent] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newDoc: CustomDocument = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category,
      content: content.trim(),
      sourceReference: sourceReference.trim() || 'مدخل يدوي من المستخدم',
      createdAt: new Date().toLocaleDateString('ar-EG')
    };

    onAddCustomDoc(newDoc);
    setTitle('');
    setContent('');
    setSourceReference('');
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-start bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl h-full bg-[#F8FAFC] dark:bg-[#151B23] border-l border-stone-200 dark:border-[#273244] shadow-2xl flex flex-col overflow-hidden text-stone-900 dark:text-[#F3F4F6] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top header */}
        <div className="p-5 border-b border-stone-200 dark:border-[#273244] flex items-center justify-between bg-stone-50/80 dark:bg-[#111827]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold font-tajawal text-base text-emerald-950 dark:text-emerald-300">
                إدارة مصادر المعرفة والبيانات الشرعية
              </h3>
              <p className="text-xs text-stone-500 dark:text-[#A7B0BE]">
                المصادر المعتمدة والمستندات المخصصة للاسترجاع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1.5 rounded-lg text-stone-400 dark:text-[#A7B0BE] hover:text-stone-700 dark:hover:text-[#F3F4F6] hover:bg-stone-200 dark:hover:bg-[#1A202C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-2 bg-stone-100 dark:bg-[#111827] border-b border-stone-200 dark:border-[#273244] gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('verified')}
            className={`flex-1 py-2 px-3 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'verified'
                ? 'bg-white dark:bg-[#1A202C] text-emerald-950 dark:text-emerald-300 font-bold shadow-sm'
                : 'text-stone-600 dark:text-[#A7B0BE] hover:text-stone-900 dark:hover:text-[#F3F4F6]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>المصادر الفقهية المعتمدة ({VERIFIED_SOURCES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 px-3 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-[#1A202C] text-emerald-950 dark:text-emerald-300 font-bold shadow-sm'
                : 'text-stone-600 dark:text-[#A7B0BE] hover:text-stone-900 dark:hover:text-[#F3F4F6]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إدخال بياناتك الخاصة ({customDocs.length})</span>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'verified' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 dark:text-[#A7B0BE] leading-relaxed">
                هذه المراجع تمثل حجر الأساس الذي يعتمد عليه بصيرة في استخراج الأدلة والنصوص الشرعية الموثقة:
              </p>
              {VERIFIED_SOURCES.map((source) => (
                <div
                  key={source.id}
                  onClick={() => onSelectSourceDetail(source)}
                  className="p-3.5 bg-white dark:bg-[#111827] border border-stone-200 dark:border-[#273244] rounded-xl hover:border-emerald-700/50 dark:hover:border-emerald-500/50 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-300 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors">
                      {source.name}
                    </h4>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 font-sans">
                      {source.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-[#A7B0BE] mb-2">
                    {source.author}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-300 line-clamp-2 italic bg-stone-50 dark:bg-[#1A202C] p-2 rounded border border-stone-100 dark:border-[#273244] font-amiri">
                    «{source.quoteExcerpt}»
                  </p>
                  <div className="mt-2 flex items-center justify-end text-[11px] text-emerald-800 dark:text-emerald-400 font-medium gap-1">
                    <span>عرض التفاصيل والتوثيق</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <strong>تجربة إدخال بياناتك:</strong> اكتب أو الصق نصوصاً شرعية، فتاوى معتمدة، أو أبحاثاً تود أن يعتمد عليها المساعد في إجاباته القادمة.
              </div>

              {successToast && (
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>تم حفظ الوثيقة بنجاح وإدراجها في قاعدة المعرفة المعتمدة!</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 bg-white dark:bg-[#111827] p-4 rounded-xl border border-stone-200 dark:border-[#273244]">
                <h4 className="text-xs font-bold text-stone-900 dark:text-[#F3F4F6]">إضافة وثيقة فقهية جديدة</h4>
                <div>
                  <label className="block text-xs text-stone-600 dark:text-[#A7B0BE] mb-1">عنوان المسألة أو الفتوى</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: حكم كفارة اليمين وإطعام المساكين"
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 dark:border-[#273244] bg-white dark:bg-[#1A202C] text-stone-900 dark:text-[#F3F4F6] placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-stone-600 dark:text-[#A7B0BE] mb-1">التصنيف</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as QuestionCategory)}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 dark:border-[#273244] focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500 bg-white dark:bg-[#1A202C] text-stone-900 dark:text-[#F3F4F6]"
                    >
                      <option value="fiqh">عبادات وفقه</option>
                      <option value="aqidah">عقيدة وشبهات</option>
                      <option value="muamalat">معاملات مالية</option>
                      <option value="tazkiyah">أخلاق وتزكية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-600 dark:text-[#A7B0BE] mb-1">جهة المصدر / الكتاب</label>
                    <input
                      type="text"
                      value={sourceReference}
                      onChange={(e) => setSourceReference(e.target.value)}
                      placeholder="مثال: فتوى دار الإفتاء رقم 2841"
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 dark:border-[#273244] bg-white dark:bg-[#1A202C] text-stone-900 dark:text-[#F3F4F6] placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-600 dark:text-[#A7B0BE] mb-1">النص الشرعي المعتمد أو خلاصة الفتوى</label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="اكتب هنا النص المعتمد الذي ترغب في أن يستند إليه بصيرة عند سؤاله..."
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 dark:border-[#273244] bg-white dark:bg-[#1A202C] text-stone-900 dark:text-[#F3F4F6] placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-900 dark:bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 dark:hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إدراج في قاعدة المعرفة</span>
                </button>
              </form>

              {/* List of custom docs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-900 dark:text-[#F3F4F6]">
                  الوثائق المضافة حالياً ({customDocs.length}):
                </h4>
                {customDocs.length === 0 ? (
                  <p className="text-xs text-stone-400 dark:text-stone-500 italic text-center py-4 bg-white dark:bg-[#111827] rounded-lg border border-dashed border-stone-200 dark:border-[#273244]">
                    لم تقم بإضافة وثائق مخصصة بعد. يمكنك تجربة إضافة نص فتوى هنا.
                  </p>
                ) : (
                  customDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-white dark:bg-[#111827] border border-stone-200 dark:border-[#273244] rounded-lg flex items-start justify-between gap-2"
                    >
                      <div className="flex-1">
                        <h5 className="font-bold text-xs text-emerald-950 dark:text-emerald-300">{doc.title}</h5>
                        <p className="text-[11px] text-stone-500 dark:text-[#A7B0BE] mt-0.5">{doc.sourceReference}</p>
                        <p className="text-xs text-stone-700 dark:text-[#F3F4F6] mt-1 line-clamp-2 font-amiri">
                          {doc.content}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteCustomDoc(doc.id)}
                        title="حذف الوثيقة"
                        aria-label="حذف الوثيقة"
                        className="text-stone-400 hover:text-red-700 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
