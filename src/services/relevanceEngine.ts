// Relevance, Intent Classification & Reasoning Engine for Baseera AI
// Implements:
// 1. Pre-retrieval Intent Classification across all mandatory categories
// 2. Strict Conditional Retrieval Gate (Never retrieve Islamic books for developer/general/greeting questions)
// 3. Strict Relevance Filter for Citations (Never display unrelated or unverified book references)
// 4. Follow-up Context Resolution and Topic Shift Detection

export type QuestionCategory =
  | 'developer_identity'    // Developer, creator, who made/developed/owns Baseera, contact info
  | 'general_info'          // General non-religious greetings, chat, app name/identity ("ما اسمك", "مرحبا", "من أنت")
  | 'quran_tafsir'          // Quran verses, meanings, tafsir, surahs
  | 'hadith'                // Hadiths, sayings of the Prophet, authenticity, numbers, sunnah
  | 'fiqh_ruling'           // Rulings, halal/haram, prayer, fasting, zakat, purity, wudu, transactions, marriage
  | 'islamic_knowledge'     // General Islamic history, seerah, creed, ethics, pillars
  | 'follow_up'             // Follow-up questions requiring previous conversation context
  | 'ambiguous';            // Ambiguous questions requiring clarification

export interface QuestionAnalysis {
  category: QuestionCategory;
  categoryLabel: string;
  isFollowUp: boolean;
  isTopicShift: boolean;
  resolvedQuestion: string;
  coreSubject: string;
  isAmbiguous: boolean;
  clarifyingQuestion?: string;
  isNonIslamic: boolean;
  isDeveloperQuery: boolean;
  isAppIdentityQuery: boolean;
  isGreetingQuery: boolean;
  requiresReferences: boolean;
  searchKeywords: string[];
  expectedLevel: 'A' | 'B' | 'C' | 'D';
}

export interface ValidationResult {
  isValid: boolean;
  confidenceScore: number;
  isDirectlyRelevant: boolean;
  evidenceRelevance: boolean;
  reasons: string[];
  correctionGuidance?: string;
}

export function normalizeArabicText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove tashkeel & Quranic annotations
    .replace(/[﴿﴾«»"'\(\)\[\]\{\}؟?.,!:\-_/\\|]/g, ' ')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/[ى]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Determines whether external Islamic reference books (Turath.io, Sunnah.com)
 * are actually required for this specific question category.
 */
export function requiresExternalReferences(
  category: QuestionCategory,
  isFollowUpToIslamic: boolean = false
): boolean {
  switch (category) {
    case 'developer_identity':
    case 'general_info':
    case 'ambiguous':
      return false;
    case 'quran_tafsir':
    case 'hadith':
    case 'fiqh_ruling':
    case 'islamic_knowledge':
      return true;
    case 'follow_up':
      return isFollowUpToIslamic;
    default:
      return false;
  }
}

/**
 * Pre-retrieval intent classification: runs BEFORE searching books or calling models.
 */
export function analyzeQuestionIntentFast(
  question: string,
  history: Array<{ role: string; content?: string; briefAnswer?: string; category?: string }> = []
): QuestionAnalysis {
  const trimmed = question.trim();
  const lower = trimmed.toLowerCase();

  // 1. Developer and Application Attribution Patterns (Standard Arabic + Colloquial + English)
  const developerQueryPatterns = [
    // Arabic colloquial and standard: مين / من / إيش مين
    /(من|مين|ايش\s*مين|منهو|أنت\s*مين|انت\s*مين)\s*(اللي\s*)?(أنشأك|انشاك|سواك|صنعك|طورك|برمجك|عملك|بناك|خلقك|صممك)/i,
    /(من|مين|منهو)\s*(هو\s*)?(الذي|التي)?\s*(أنشأ|انشأ|سوى|صنع|طور|برمج|عمل|بنى|صمم)\s*(بصيرة|التطبيق|الموقع|البرنامج|هذا\s*المشروع)?/i,
    /(من|مين|منهو)\s*(المسؤول|المسئول|الراعي|المالك|صاحب|مطور|مبرمج|صانع|مؤسس|مهندس|مشرف)\s*(عنك|عن\s*بصيرة|عن\s*التطبيق|عن\s*الموقع|عن\s*البرنامج|بصيرة)?/i,
    /(من|مين)\s*(سواك|عملك|أنشأك|انشاك|برمجك|طورك|صنعك)/i,
    /(معلومات|بيانات|حساب|ايميل|إيميل|رابط|طرق?\s*التواصل|كيف\s*أتواصل|كيف\s*اتواصل|اراسل|أراسل|تواصل)\s*(مع\s*)?(المطور|المبرمج|المهندس|صاحب\s*التطبيق|مطور\s*بصيرة)/i,
    /(عبد\s*الله\s*محمد|عبدالله\s*محمد|عبد\s*الله\s*محمد\s*رفعت|عبدالله\s*محمد\s*رفعت|Abdullah\s*Muhammad|Abdullah\s*Refaat)/i,
    /(who\s*(created|developed|programmed|made|built|coded|designed)\s*(you|baseera|this\s*app|this\s*website)?)/i,
    /(who\s*is\s*(responsible\s*for|behind|the\s*developer\s*of|the\s*creator\s*of)\s*(you|baseera|this\s*app|this\s*website)?)/i,
    /(developer\s*(contact|info|email|linkedin)|contact\s*(the\s*)?developer)/i,
  ];

  const isDeveloperQuery = developerQueryPatterns.some((p) => p.test(trimmed));
  if (isDeveloperQuery) {
    return {
      category: 'developer_identity',
      categoryLabel: 'هوية مطور بصيرة',
      isFollowUp: false,
      isTopicShift: true,
      resolvedQuestion: trimmed,
      coreSubject: 'هوية مطور بصيرة ومعلومات التواصل',
      isAmbiguous: false,
      isNonIslamic: false,
      isDeveloperQuery: true,
      isAppIdentityQuery: false,
      isGreetingQuery: false,
      requiresReferences: false,
      searchKeywords: [],
      expectedLevel: 'A',
    };
  }

  // 2. Application Identity Patterns ("ما اسمك", "من أنت", "عرفني بنفسك", "ما هو تطبيق بصيرة")
  const appIdentityPatterns = [
    /^(ما\s*اسمك|شو\s*اسمك|اسمك\s*ايه|اسمك\s*إيه|ما\s*هو\s*اسمك|ماذا\s*تدعى|من\s*أنت|من\s*انت|عرفني\s*بنفسك|عرف\s*بنفسك|ما\s*هو\s*تطبيق\s*بصيرة|ما\s*هي\s*بصيرة|ما\s*بصيرة)[؟?.,!]*$/i,
    /^(what\s*is\s*your\s*name|who\s*are\s*you|what\s*is\s*baseera)[؟?.,!]*$/i,
  ];
  const isAppIdentityQuery = appIdentityPatterns.some((p) => p.test(trimmed));
  if (isAppIdentityQuery) {
    return {
      category: 'general_info',
      categoryLabel: 'التعريف بتطبيق بصيرة',
      isFollowUp: false,
      isTopicShift: true,
      resolvedQuestion: trimmed,
      coreSubject: 'التعريف بتطبيق بصيرة ومهمته',
      isAmbiguous: false,
      isNonIslamic: false,
      isDeveloperQuery: false,
      isAppIdentityQuery: true,
      isGreetingQuery: false,
      requiresReferences: false,
      searchKeywords: [],
      expectedLevel: 'A',
    };
  }

  // 3. Conversational Greetings ("السلام عليكم", "مرحبا", "أهلاً", "صباح الخير", "شكراً")
  const greetingPatterns = [
    /^(السلام\s*عليكم|سلام\s*عليكم|مرحبا|مرحباً|أهلاً|اهلا|أهلا\s*وسهلاً|اهلا\s*وسهلا|صباح\s*الخير|مساء\s*الخير|حيّاك\s*الله|حياك\s*الله)[!؟?.,\s]*$/i,
    /^(شكراً|شكرا|جزاك\s*الله\s*خيرا|بارك\s*الله\s*فيك|تسلم|ألف\s*شكر)[!؟?.,\s]*$/i,
    /^(hello|hi|welcome|good\s*morning|good\s*evening|thank\s*you|thanks)[!؟?.,\s]*$/i,
  ];
  const isGreetingQuery = greetingPatterns.some((p) => p.test(trimmed));
  if (isGreetingQuery) {
    return {
      category: 'general_info',
      categoryLabel: 'تحية وترحيب',
      isFollowUp: false,
      isTopicShift: true,
      resolvedQuestion: trimmed,
      coreSubject: 'تحية وترحيب بالباحث',
      isAmbiguous: false,
      isNonIslamic: false,
      isDeveloperQuery: false,
      isAppIdentityQuery: false,
      isGreetingQuery: true,
      requiresReferences: false,
      searchKeywords: [],
      expectedLevel: 'A',
    };
  }

  // 4. Non-Islamic query check (pure programming, physical sciences)
  const nonIslamicPatterns = [
    /^(console\.log|import |function |const |let |var |<html|css |react |python |def |class )/i,
    /^(كيف أبرمج|حل هذه المعادلة التفاضلية|ما هي عاصمة|أكتب كود|أصلح هذا الكود)/i,
  ];
  const isNonIslamic = nonIslamicPatterns.some((p) => p.test(trimmed));

  // 5. Follow-up detection (pronouns, continuation words)
  const followUpIndicators = [
    /^(هل هي|وهل هي|وهل هو|وما حكمها|وما حكمه|وما دليله|وما دليله؟|وكيف ذلك|ولماذا|وما الفرق بينهما|وماذا عن|ثم ماذا|وما رقم الحديث الذي ذكرته|ما رقمه|ما رقم هذا الحديث|أين ذُكر|اين ذكر)/,
    /\b(هي|هو|ذلك|تلك|هذا|هذه|منهم|عنه|عنها|المذكور|السابق|الحديث السابق|الآية السابقة)\b/,
  ];

  const hasHistory = Array.isArray(history) && history.length > 0;
  const startsWithFollowUp = followUpIndicators[0].test(trimmed);

  // Check past context for topic continuity or shift
  const lastUserMsg = hasHistory ? [...history].reverse().find((m) => m.role === 'user') : null;
  const lastAssistMsg = hasHistory ? [...history].reverse().find((m) => m.role === 'assistant') : null;

  // Determine if previous conversation was an Islamic question
  const prevContent = lastUserMsg?.content || '';
  const prevWasDeveloper = developerQueryPatterns.some((p) => p.test(prevContent));
  const prevWasIslamic = !prevWasDeveloper && prevContent.length > 0;

  // Explicit Fiqh/Islamic topics
  const explicitTopicKeywords = [
    'الوضوء', 'الصلاة', 'الزكاة', 'الصيام', 'صوم', 'رمضان', 'الحج', 'العمرة', 'الربا', 'البيع',
    'الطلاق', 'الزواج', 'الميراث', 'الوتر', 'الشك', 'النجاسة', 'التيمم', 'الأذان',
    'اليمين', 'النذر', 'الحجاب', 'الغناء', 'التأمين', 'التقسيط', 'الأسهم', 'الحديث', 'الآية',
    'سورة', 'تفسير', 'عرفة', 'الأضحية', 'الجنائز', 'المسح'
  ];
  const foundExplicitTopics = explicitTopicKeywords.filter((k) => trimmed.includes(k));

  let isFollowUp = false;
  let isTopicShift = false;
  let resolvedQuestion = trimmed;
  let coreSubject = trimmed;

  if (hasHistory) {
    if (startsWithFollowUp && lastUserMsg) {
      isFollowUp = true;
      isTopicShift = false;
      resolvedQuestion = `${trimmed} (في سياق السؤال السابق: «${lastUserMsg.content}»)`;
      coreSubject = `${lastUserMsg.content} — ${trimmed}`;
    } else if (foundExplicitTopics.length > 0 && lastUserMsg) {
      const sharesTopic = foundExplicitTopics.some((t) => prevContent.includes(t));
      if (!sharesTopic) {
        isTopicShift = true;
        isFollowUp = false;
      } else {
        isFollowUp = true;
      }
    }
  }

  // 6. Ambiguity / Incomplete question check
  const isVeryShort = trimmed.split(/\s+/).length <= 2;
  const vagueOneWords = ['كيف', 'لماذا', 'ما الحكم', 'هل يجوز', 'حكمه', 'ما الرأي', 'ما القول'];
  const isAmbiguousWithoutContext =
    isVeryShort && vagueOneWords.includes(trimmed.replace(/[؟?.,!]/g, '')) && !isFollowUp;

  // 7. Domain Categorization: Quran / Hadith / Fiqh / General Islamic
  let category: QuestionCategory = 'fiqh_ruling';
  let categoryLabel = 'مسائل الأحكام والفقه الإسلامي';

  const isHadithNumberQuery = /ما\s*رقم\s*الحديث|تخريج\s*الحديث|أين\s*ورد|اين\s*ورد|رقم\s*الحديث\s*الذي\s*ذكرته|ما\s*رقم\s*هذا\s*الحديث/i.test(trimmed);

  if (isHadithNumberQuery) {
    category = 'hadith';
    categoryLabel = 'تخريج وتحديد رقم الحديث الشريف';
  } else if (isAmbiguousWithoutContext) {
    category = 'ambiguous';
    categoryLabel = 'استيضاح وتحديد المسألة';
  } else if (isFollowUp) {
    category = 'follow_up';
    categoryLabel = 'سؤال متابع في نفس السياق';
  } else if (
    /آية|سورة|تفسير|ما معنى قوله|القرآن|مصحف|معنى الآية|في أي سورة/i.test(trimmed)
  ) {
    category = 'quran_tafsir';
    categoryLabel = 'القرآن الكريم وتفسير آياته';
  } else if (
    /حديث|رقم الحديث|صحة حديث|سنن|رواه|البخاري|مسلم|النبي ﷺ قال|هل ورد حديث/i.test(trimmed)
  ) {
    category = 'hadith';
    categoryLabel = 'الحديث الشريف وعلومه';
  } else if (
    /حكم|هل يجوز|ما حكم|هل تبطل|شروط|أركان|واجبات|سجود السهو|صلاة|صيام|زكاة|حج|طلاق|بيع|ربا|مسح/i.test(trimmed)
  ) {
    category = 'fiqh_ruling';
    categoryLabel = 'أحكام الفقه الإسلامي';
  } else if (
    /عقيدة|إيمان|توحيد|أركان الإسلام|سيرة|تاريخ إسلامي|أخلاق|فضائل/i.test(trimmed)
  ) {
    category = 'islamic_knowledge';
    categoryLabel = 'المعارف والعلوم الإسلامية';
  }

  const requiresReferences = requiresExternalReferences(category, isFollowUp && prevWasIslamic);

  const searchKeywords: string[] = [];
  if (requiresReferences) {
    // If asking about the hadith number from previous turn, inherit the hadith text/subject from context
    if (isHadithNumberQuery && lastAssistMsg) {
      const quoteMatch = (lastAssistMsg.content || '').match(/[«"]([^»"]+)[»"]/);
      if (quoteMatch && quoteMatch[1].length > 4) {
        resolvedQuestion = `ما رقم وتخريج الحديث النبوي الشريف: «${quoteMatch[1]}» المذكور في المحادثة السابقة؟`;
        searchKeywords.push(normalizeArabicText(quoteMatch[1]).slice(0, 50));
      } else if (lastUserMsg?.content) {
        resolvedQuestion = `ما رقم وتخريج الحديث النبوي المتعلق بمسألة «${lastUserMsg.content}» المذكور سابقاً؟`;
        searchKeywords.push(normalizeArabicText(lastUserMsg.content).slice(0, 50));
      }
    }

    if (searchKeywords.length === 0) {
      const norm = normalizeArabicText(trimmed);
      const cleanTokens = norm
        .replace(/^(ما هو|ما هي|ما حكم|هل يجوز|كيف يكون|بين حكم|اشرح لي|سؤال عن|اريد معرفه|ما معني هذه الايه|ما معني الايه|ما معني قوله|ما معني|ما رقم الحديث الذي ذكرته|ما رقم الحديث|معني|تفسير)\s+/gi, '')
        .trim();

      if (cleanTokens.length > 2) {
        searchKeywords.push(cleanTokens);
      }

      const words = cleanTokens.split(/\s+/).filter((w) => w.length > 2);
      if (words.length >= 2) {
        searchKeywords.push(`${words[0]} ${words[1]}`);
        if (words.length >= 3) {
          searchKeywords.push(`${words[1]} ${words[2]}`);
        }
      }
    }
  }

  // Content Level Classification
  let expectedLevel: 'A' | 'B' | 'C' | 'D' = 'B';
  if (/طلاق|خلع|زوجتي طلبت|حلفت بالطلاق|تركة|ورثة توفي|توفي وترك/i.test(trimmed)) {
    expectedLevel = 'D'; // Personal status requiring referral
  } else if (/خلاف|هل اختلف|أقوال العلماء|المذاهب الأربعة|قول الجمهور/i.test(trimmed)) {
    expectedLevel = 'C'; // Disputed matters
  } else if (
    (/ما معنى|كم عدد|متى فرض|ما هي أركان|ما هي شروط|ما رقم/i.test(trimmed) && trimmed.length < 40)
  ) {
    expectedLevel = 'A'; // Direct concise fact
  }

  return {
    category,
    categoryLabel,
    isFollowUp,
    isTopicShift,
    resolvedQuestion,
    coreSubject,
    isAmbiguous: isAmbiguousWithoutContext,
    clarifyingQuestion: isAmbiguousWithoutContext
      ? 'فضلاً، وضّح مسألتك أو حدد الجانب الذي تسأل عنه (مثل: هل السؤال متعلق بالطهارة، الصلاة، المعاملات، أو مسألة أخرى؟) لنقدم لك الحكم الموثق بدقة.'
      : undefined,
    isNonIslamic,
    isDeveloperQuery,
    isAppIdentityQuery,
    isGreetingQuery,
    requiresReferences,
    searchKeywords: Array.from(new Set(searchKeywords)).slice(0, 3),
    expectedLevel,
  };
}

/**
 * Strict Citation Relevance Filter:
 * Ensures that EVERY displayed reference directly supports the answer to the user's question.
 * If the question does not require references (developer, general chat, greeting), returns an empty array.
 * If a reference is unrelated or unsupported, removes it completely.
 */
export function filterRelevantCitations<T extends {
  id?: number;
  sourceName?: string;
  book?: string;
  author?: string;
  retrievedText?: string;
  referenceDetail?: string;
  surah?: string;
  ayah?: number;
  referenceNumber?: string | number;
}>(
  evidences: T[],
  question: string,
  answerText: string,
  requiresReferences: boolean
): T[] {
  // 1. If references are not required for this question category, return empty list!
  if (!requiresReferences || !Array.isArray(evidences) || evidences.length === 0) {
    return [];
  }

  const qLower = question.toLowerCase();
  const aLower = answerText.toLowerCase();

  // Extract core keywords from question
  const stopWords = new Set([
    'ماذا', 'لماذا', 'كيف', 'متى', 'أين', 'وهل', 'فهل', 'حكم', 'الحكم', 'حكمه', 'حكمها',
    'الشرعي', 'فيها', 'فيه', 'منها', 'منه', 'على', 'عن', 'إلى', 'مع', 'هذا', 'هذه',
    'ذلك', 'تلك', 'الذي', 'التي', 'بين', 'حول', 'أريد', 'معرفة', 'سؤال', 'بيان', 'توضيح',
    'ما', 'هو', 'هي', 'هل', 'في', 'من', 'عن'
  ]);

  const normQ = normalizeArabicText(question);
  const normA = normalizeArabicText(answerText);

  const qKeywords = normQ
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  const filtered = evidences.filter((ev, idx) => {
    const citationTag = `[${idx + 1}]`;
    const isExplicitlyCited = answerText.includes(citationTag);

    const sourceNameNorm = normalizeArabicText(ev.sourceName || ev.book || '');
    const isNamedInAnswer = sourceNameNorm.length > 2 && normA.includes(sourceNameNorm);

    const textNorm = normalizeArabicText(ev.retrievedText || '');
    const sharesKeywords = qKeywords.some((kw) => textNorm.includes(kw) || sourceNameNorm.includes(kw));

    // A citation is considered valid and relevant IF:
    // - It is explicitly cited via [N] in the text, OR
    // - Its book/source name is discussed in the answer, OR
    // - Its retrieved passage directly shares core concepts with the question AND is relevant.
    return isExplicitlyCited || isNamedInAnswer || (sharesKeywords && textNorm.length > 15);
  });

  // Re-index remaining citations to keep IDs clean: 1, 2, ...
  return filtered.map((ev, i) => ({
    ...ev,
    id: i + 1,
  }));
}

/**
 * Validates the generated answer against the specific user question.
 * Checks for topic drift, relevance of cited verses/hadiths, and domain adherence.
 */
export function validateAnswerRelevance(
  question: string,
  answer: {
    briefAnswer?: string;
    explanation?: string;
    evidence?: string;
    traceableEvidences?: Array<{ sourceName?: string; retrievedText?: string; referenceDetail?: string; usageContext?: string }>;
  }
): ValidationResult {
  const normQ = normalizeArabicText(question);
  const brief = (answer.briefAnswer || '').trim();
  const explanation = (answer.explanation || '').trim();
  const normAnswer = normalizeArabicText(`${brief} ${explanation}`);

  const reasons: string[] = [];
  let isDirectlyRelevant = true;
  let evidenceRelevance = true;

  // Check 1: Empty or trivial answer
  if (!brief && !explanation) {
    return {
      isValid: false,
      confidenceScore: 0,
      isDirectlyRelevant: false,
      evidenceRelevance: false,
      reasons: ['الإجابة فارغة تماماً أو لم يتم توليد أي محتوى'],
      correctionGuidance: 'يجب توليد إجابة موجزة ومباشرة للمسألة المطروحة مع الأدلة الشرعية.',
    };
  }

  // Check 2: Core Islamic Concept Overlap
  const stopWords = new Set([
    'ماذا', 'لماذا', 'كيف', 'متى', 'أين', 'وهل', 'فهل', 'حكم', 'الحكم', 'حكمه', 'حكمها',
    'الشرعي', 'فيها', 'فيه', 'منها', 'منه', 'على', 'عن', 'إلى', 'مع', 'هذا', 'هذه',
    'ذلك', 'تلك', 'الذي', 'التي', 'بين', 'حول', 'أريد', 'معرفة', 'سؤال', 'بيان', 'توضيح',
    'ما', 'هو', 'هي', 'هل', 'في', 'من', 'عن'
  ]);

  const rawWords = normQ
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  if (rawWords.length >= 2) {
    const matchedCount = rawWords.filter((w) => normAnswer.includes(w)).length;
    const matchRatio = matchedCount / rawWords.length;

    if (matchRatio < 0.25) {
      isDirectlyRelevant = false;
      reasons.push(`الإجابة أغفلت المفاهيم الجوهرية للسؤال («${rawWords.slice(0, 3).join('، ')}») ولم تتناولها بشكل صريح.`);
    }
  }

  // Check 3: Anti-Drift Specific Scenario Validations
  if (normQ.includes('بعد الفراغ') || normQ.includes('بعد الصلاه') || normQ.includes('بعد الانتهاء')) {
    const mentionsAfterEffect =
      normAnswer.includes('لا يلتفت') ||
      normAnswer.includes('لا عبره') ||
      normAnswer.includes('صحيحه') ||
      normAnswer.includes('لا يوثر') ||
      normAnswer.includes('الفراغ') ||
      normAnswer.includes('الاصل تمام') ||
      normAnswer.includes('براءه الذمه');

    if (!mentionsAfterEffect) {
      isDirectlyRelevant = false;
      reasons.push('السؤال يسأل عن الشك "بعد الفراغ" من العبادة، والإجابة أغفلت القاعدة الفقهية: أن الشك بعد الفراغ من العبادة لا يؤثر ولا يلتفت إليه والصلاة صحيحة.');
    }
  }

  // Check 4: Traceable Evidence Relevance & Support Check
  const evidences = answer.traceableEvidences || [];
  if (evidences.length > 0) {
    let hasDirectlySupportingEvidence = false;
    for (const ev of evidences) {
      const text = (ev.retrievedText || '').toLowerCase();
      const detail = (ev.referenceDetail || '').toLowerCase();
      const context = (ev.usageContext || '').toLowerCase();
      const name = (ev.sourceName || '').toLowerCase();

      const evidenceContent = `${text} ${detail} ${context} ${name}`;
      const sharesConcept = rawWords.some((w) => evidenceContent.includes(w));
      if (sharesConcept || (text.length > 15 && context.length > 10)) {
        hasDirectlySupportingEvidence = true;
      }
    }

    if (!hasDirectlySupportingEvidence && rawWords.length > 0) {
      evidenceRelevance = false;
      reasons.push('الأدلة الشرعية المستشهد بها لم يُبين وجه دلالتها المباشر على المسألة المسؤول عنها.');
    }
  }

  const isValid = isDirectlyRelevant && reasons.length === 0;
  const confidenceScore = isValid ? 0.96 : 0.35;

  let correctionGuidance: string | undefined;
  if (!isValid) {
    correctionGuidance = `تنبيه تدقيق الملاءمة الصارم (Relevance Gate Failure):\nرُصد في المسودة الخلل التالي:\n- ${reasons.join('\n- ')}\nالمطلوب الآن: صياغة إجابة مباشرة تركز حصراً على ما سأل عنه المستفهم: «${question}»، وتقديم الحكم الفقهي المحدد أولاً بدقة، وتضمين الأدلة الشرعية المتصلة مباشرة بالمسألة دون أي استطراد في مواضيع جانبية.`;
  }

  return {
    isValid,
    confidenceScore,
    isDirectlyRelevant,
    evidenceRelevance,
    reasons,
    correctionGuidance,
  };
}
