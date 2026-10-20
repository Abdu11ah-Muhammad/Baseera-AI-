export type QuestionCategory = 'fiqh' | 'aqidah' | 'muamalat' | 'tazkiyah' | 'general';

export type ContentLevel = 'A' | 'B' | 'C' | 'D';
export type ReferenceAdequacy = 'مرتفعة' | 'متوسطة' | 'غير كافية';

export interface QuranVerse {
  text: string;
  surah: string;
  ayah: number;
}

export interface HadithRef {
  text: string;
  source: string;
  grade: 'صحيح' | 'حسن' | 'متفق عليه' | string;
  narrator?: string;
}

export interface MadhhabView {
  madhhab: 'الحنفية' | 'المالكية' | 'الشافعية' | 'الحنابلة' | 'المجامع المعاصرة' | string;
  ruling: string;
  details?: string;
}

export interface SourceReference {
  id: string;
  name: string;
  category: string;
  author?: string;
  referenceDetail?: string;
  quoteExcerpt?: string;
  type?: string;
  status?: string;
  url?: string;
}

export interface TraceableEvidence {
  id: number;
  type?: 'quran' | 'hadith' | 'fiqh' | 'scholar' | 'book' | 'custom' | string;
  sourceName: string;
  sourceType: string;
  referenceDetail: string;
  referenceNumber?: string | number;
  surah?: string;
  ayah?: number;
  book?: string;
  author?: string;
  chapter?: string;
  volume?: string | number;
  page?: string | number;
  grade?: string;
  retrievedText: string;
  usageContext: string;
  sourceUrl?: string;
}

export interface AutomatedChecks {
  sourcesFound: boolean;
  textsVerified: boolean;
  noPersonalFatwaClaim: boolean;
  noConflictDetected: boolean;
}

export interface RagPipelineStep {
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
  timeMs?: number;
}

export interface WebGroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  category?: QuestionCategory;
  isControversial?: boolean;
  disclaimer?: string;
  classification?: string[];
  
  // Content Level A / B / C / D
  contentLevel?: ContentLevel;
  contentLevelLabel?: string;
  
  // Reference Adequacy
  referenceAdequacy?: ReferenceAdequacy;
  adequacyRationale?: string[];
  evidenceLevel?: string;
  evidenceLevelArabic?: string;

  understanding?: string;
  briefAnswer?: string;
  explanation?: string;
  evidence?: string;
  summary?: string;
  dispute?: string;
  isError?: boolean;
  
  // Traceable Evidence
  traceableEvidences?: TraceableEvidence[];
  sourcesSearched?: string[];
  
  // Automated Checks and Safety
  automatedChecks?: AutomatedChecks;
  suitabilityCheck?: string;
  reviewStatus?: 'automated' | 'human_reviewed';
  dialogueMethodologySummary?: string;
  nextStepSuggestion?: string;

  quranVerses?: QuranVerse[];
  hadiths?: HadithRef[];
  madhhabViews?: MadhhabView[];
  sources?: SourceReference[];
  ragSteps?: RagPipelineStep[];
  ragLatencyMs?: number;
  matchedCustomSource?: string;
  webSources?: WebGroundingSource[];
  searchQueries?: string[];
  isRealAi?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface CustomDocument {
  id: string;
  title: string;
  category: QuestionCategory;
  content: string;
  sourceReference: string;
  createdAt: string;
}

export interface PresetTopic {
  id: string;
  title: string;
  question: string;
  category: QuestionCategory;
  categoryLabel: string;
}
