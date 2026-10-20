// Relevance & Reasoning Engine for Baseera AI
// Implements:
// 1. Question Understanding & Intent Analysis (Follow-up vs Topic Shift detection)
// 2. Ambiguity & Domain Detection (Polite Clarification vs Direct Answering)
// 3. Retrieval Keyword Extraction for Islamic Books (Turath.io & Curated Knowledge)
// 4. Strict Question-to-Answer Relevance Validation Gate (Auto-rejection of off-topic drafts)

export interface QuestionAnalysis {
  isFollowUp: boolean;
  isTopicShift: boolean;
  resolvedQuestion: string;
  coreSubject: string;
  isAmbiguous: boolean;
  clarifyingQuestion?: string;
  isNonIslamic: boolean;
  isDeveloperQuery?: boolean;
  searchKeywords: string[];
  expectedLevel: 'A' | 'B' | 'C' | 'D';
}

export interface ValidationResult {
  isValid: boolean;
  confidenceScore: number; // 0 to 1
  isDirectlyRelevant: boolean;
  evidenceRelevance: boolean;
  reasons: string[];
  correctionGuidance?: string;
}

/**
 * Heuristic + semantic analyzer to resolve pronouns and detect topic shifts
 */
export function analyzeQuestionIntentFast(
  question: string,
  history: Array<{ role: string; content: string; briefAnswer?: string }>
): QuestionAnalysis {
  const trimmed = question.trim();
  const lower = trimmed.toLowerCase();

  // Developer Attribution / Creator Query Check
  const developerQueryPatterns = [
    /من\s*(طورك|صنعك|أنشأك|برمجك|سواك|عملك|خلقك|صممك)/i,
    /من\s*(هو\s*)?(مطور|مبرمج|صاحب|مبتكر|مؤسس|صانع)\s*(بصيرة|التطبيق|الموقع|البرنامج)?/i,
    /من\s*(طور|صنع|أنشأ|برمج|صمم)\s*(بصيرة|التطبيق|الموقع|البرنامج)/i,
    /(معلومات|بيانات|حساب|ايميل|إيميل|رابط|طرق?\s*التواصل\s*مع)\s*(المطور|المبرمج)/i,
    /(تواصل\s*مع\s*المطور|كيف\s*أتواصل\s*مع\s*المطور|كيف\s*اتواصل\s*مع\s*المطور)/i,
    /(who\s*(created|developed|programmed|made|built|coded)\s*(you|baseera|this\s*app))/i,
    /(who\s*is\s*(the\s*)?(developer|creator|programmer|author|maker))/i,
    /(developer\s*(contact|info|email|linkedin)|contact\s*(the\s*)?developer)/i,
  ];
  const isDeveloperQuery = developerQueryPatterns.some((p) => p.test(trimmed));

  if (isDeveloperQuery) {
    return {
      isFollowUp: false,
      isTopicShift: true,
      resolvedQuestion: trimmed,
      coreSubject: 'هوية مطور بصيرة ومعلومات التواصل',
      isAmbiguous: false,
      isNonIslamic: false,
      isDeveloperQuery: true,
      searchKeywords: [],
      expectedLevel: 'A',
    };
  }

  // Non-Islamic query check (pure programming, physical sciences, casual chat)
  const nonIslamicPatterns = [
    /^(console\.log|import |function |const |let |var |<html|css |react |python |def |class )/i,
    /^(كيف أبرمج|حل هذه المعادلة التفاضلية|ما هي عاصمة|أكتب كود|أصلح هذا الكود)/i,
  ];
  const isNonIslamic = nonIslamicPatterns.some((p) => p.test(trimmed));

  // Ambiguity / incomplete question check
  const isVeryShort = trimmed.split(/\s+/).length <= 2;
  const vagueOneWords = ['كيف', 'لماذا', 'ما الحكم', 'هل يجوز', 'حكمه', 'ما الرأي', 'ما القول'];
  const isAmbiguousWithoutContext =
    isVeryShort && vagueOneWords.includes(trimmed.replace(/[؟?.,!]/g, '')) && history.length === 0;

  // Follow-up detection (pronouns, continuation words)
  const followUpIndicators = [
    /^(هل هي|وهل هي|وهل هو|وما حكمها|وما حكمه|وما دليله|وما دليله؟|وكيف ذلك|ولماذا|وما الفرق بينهما|وماذا عن|ثم ماذا)/,
    /\b(هي|هو|ذلك|تلك|هذا|هذه|منهم|عنه|عنها)\b/,
  ];

  const hasHistory = Array.isArray(history) && history.length > 0;
  const startsWithFollowUp = followUpIndicators[0].test(trimmed);

  // Check if user mentions a completely new specific fiqh/Islamic keyword indicating a topic shift
  const explicitTopicKeywords = [
    'الوضوء', 'الصلاة', 'الزكاة', 'الصيام', 'الحج', 'العمرة', 'الربا', 'البيع',
    'الطلاق', 'الزواج', 'الميراث', 'الوتر', 'الشك', 'النجاسة', 'التيمم', 'الأذان',
    'اليمين', 'النذر', 'الحجاب', 'الغناء', 'التأمين', 'التقسيط', 'الأسهم', 'البيتكوين'
  ];

  const foundExplicitTopics = explicitTopicKeywords.filter((k) => trimmed.includes(k));

  let isFollowUp = false;
  let isTopicShift = false;
  let resolvedQuestion = trimmed;
  let coreSubject = trimmed;

  if (hasHistory) {
    const lastUserMsg = [...history].reverse().find((m) => m.role === 'user');
    const lastAssistMsg = [...history].reverse().find((m) => m.role === 'assistant');

    if (startsWithFollowUp && lastUserMsg) {
      isFollowUp = true;
      isTopicShift = false;
      // Inherit the topic from previous question
      resolvedQuestion = `${trimmed} (في سياق السؤال السابق: «${lastUserMsg.content}»)`;
      coreSubject = `${lastUserMsg.content} — ${trimmed}`;
    } else if (foundExplicitTopics.length > 0) {
      // User introduced a new explicit topic
      const prevContent = lastUserMsg?.content || '';
      const sharesTopic = foundExplicitTopics.some((t) => prevContent.includes(t));
      if (!sharesTopic) {
        isTopicShift = true;
        isFollowUp = false;
      } else {
        isFollowUp = true;
      }
    }
  }

  // Generate targeted search keywords for Islamic books
  const cleanTokens = trimmed
    .replace(/[؟?.,!«»()[\]{}":]/g, '')
    .replace(/^(ما هو|ما هي|ما حكم|هل يجوز|كيف يكون|بين حكم|اشرح لي|سؤال عن|أريد معرفة)\s+/gi, '')
    .trim();

  const searchKeywords: string[] = [];
  if (cleanTokens.length > 2) {
    searchKeywords.push(cleanTokens);
  }

  // Extract key 2-word phrases
  const words = cleanTokens.split(/\s+/).filter((w) => w.length > 2);
  if (words.length >= 2) {
    searchKeywords.push(`${words[0]} ${words[1]}`);
    if (words.length >= 3) {
      searchKeywords.push(`${words[1]} ${words[2]}`);
    }
  }

  // Content Level Classification
  let expectedLevel: 'A' | 'B' | 'C' | 'D' = 'B';
  if (/طلاق|خلع|زوجتي طلبت|حلفت بالطلاق|تركة|ورثة توفي|توفي وترك/i.test(trimmed)) {
    expectedLevel = 'D'; // Personal status requiring referral
  } else if (/خلاف|هل اختلف|أقوال العلماء|المذاهب الأربعة|قول الجمهور/i.test(trimmed)) {
    expectedLevel = 'C'; // Disputed matters
  } else if (/ما معنى|كم عدد|متى فرض|ما هي أركان|ما هي شروط/i.test(trimmed) && trimmed.length < 35) {
    expectedLevel = 'A'; // Direct concise fact
  }

  return {
    isFollowUp,
    isTopicShift,
    resolvedQuestion,
    coreSubject,
    isAmbiguous: isAmbiguousWithoutContext,
    clarifyingQuestion: isAmbiguousWithoutContext
      ? 'فضلاً، وضّح مسألتك أو حدد الجانب الذي تسأل عنه (مثل: هل السؤال متعلق بالطهارة، الصلاة، المعاملات، أو مسألة أخرى؟) لنقدم لك الحكم الموثق بدقة.'
      : undefined,
    isNonIslamic,
    searchKeywords: Array.from(new Set(searchKeywords)).slice(0, 3),
    expectedLevel,
  };
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
  const qClean = question.trim().toLowerCase();
  const brief = (answer.briefAnswer || '').trim().toLowerCase();
  const explanation = (answer.explanation || '').trim().toLowerCase();
  const combinedAnswer = `${brief} ${explanation}`;

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
    'ذلك', 'تلك', 'الذي', 'التي', 'بين', 'حول', 'أريد', 'معرفة', 'سؤال', 'بيان', 'توضيح'
  ]);

  const rawWords = qClean
    .replace(/[؟?.,!«»()[\]{}":]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  if (rawWords.length >= 2) {
    const matchedCount = rawWords.filter((w) => combinedAnswer.includes(w)).length;
    const matchRatio = matchedCount / rawWords.length;

    if (matchRatio < 0.25) {
      isDirectlyRelevant = false;
      reasons.push(`الإجابة أغفلت المفاهيم الجوهرية للسؤال («${rawWords.slice(0, 3).join('، ')}») ولم تتناولها بشكل صريح.`);
    }
  }

  // Check 3: Anti-Drift Specific Scenario Validations

  // Scenario A: Doubt AFTER worship (الشك بعد الفراغ من الصلاة أو الوضوء)
  if (qClean.includes('بعد الفراغ') || qClean.includes('بعد الصلاة') || qClean.includes('بعد الانتهاء')) {
    const mentionsAfterEffect =
      combinedAnswer.includes('لا يلتفت') ||
      combinedAnswer.includes('لا عبرة') ||
      combinedAnswer.includes('صحيحة') ||
      combinedAnswer.includes('لا يؤثر') ||
      combinedAnswer.includes('الفراغ') ||
      combinedAnswer.includes('الأصل تمام') ||
      combinedAnswer.includes('براءة الذمة');

    if (!mentionsAfterEffect) {
      isDirectlyRelevant = false;
      reasons.push('السؤال يسأل عن الشك "بعد الفراغ" من العبادة، والإجابة أغفلت القاعدة الفقهية: أن الشك بعد الفراغ من العبادة لا يؤثر ولا يلتفت إليه والصلاة صحيحة.');
    }

    if (combinedAnswer.includes('الشيطان') && !mentionsAfterEffect) {
      isDirectlyRelevant = false;
      reasons.push('انحرفت الإجابة للحديث الوعظي عن الوسواس ونزغ الشيطان بدلاً من تقرير الحكم الفقهي المحدد للشك بعد الفراغ.');
    }
  }

  // Scenario B: Missed Prayers (قضاء الفوائت / النوم أو النسيان)
  if (qClean.includes('فاتته صلاة') || qClean.includes('نام عن صلاة') || qClean.includes('قضاء الصلاة') || qClean.includes('نسي صلاة')) {
    const addressesMakingUp =
      combinedAnswer.includes('يقضي') ||
      combinedAnswer.includes('القضاء') ||
      combinedAnswer.includes('استيقظ') ||
      combinedAnswer.includes('ذكرها') ||
      combinedAnswer.includes('كفارة');

    if (!addressesMakingUp) {
      isDirectlyRelevant = false;
      reasons.push('السؤال يسأل عن قضاء الصلاة الفائتة، ولم توضح الإجابة وجوب القضاء عند التذكر فوراً مستندة إلى الحديث النبوي.');
    }
  }

  // Scenario C: Financial transactions (بيع التقسيط / زيادة الثمن للأجل / المرابحة)
  if (qClean.includes('تقسيط') || qClean.includes('مرابحة') || qClean.includes('زيادة في الثمن للأجل')) {
    const mentionsFinanceRuling =
      combinedAnswer.includes('جائز') ||
      combinedAnswer.includes('يجوز') ||
      combinedAnswer.includes('جمهور') ||
      combinedAnswer.includes('أجل') ||
      combinedAnswer.includes('ثمن') ||
      combinedAnswer.includes('عقد');

    if (!mentionsFinanceRuling) {
      isDirectlyRelevant = false;
      reasons.push('السؤال عن بيع التقسيط والزيادة في الثمن للأجل، ولم تبيّن الإجابة حكم جمهور الفقهاء والمجامع الفقهية في جواز الزيادة مقابل الأجل بشرط استقرار الثمن في العقد.');
    }
  }

  // Scenario D: Wiping over socks / khuffayn (المسح على الخفين / الجوربين)
  if (qClean.includes('المسح على الخفين') || qClean.includes('المسح على الجوربين') || qClean.includes('مسح الجوارب')) {
    const mentionsWipingRules =
      combinedAnswer.includes('يوم وليلة') ||
      combinedAnswer.includes('ثلاثة أيام') ||
      combinedAnswer.includes('طهارة') ||
      combinedAnswer.includes('المقيم') ||
      combinedAnswer.includes('المسافر');

    if (!mentionsWipingRules && (qClean.includes('مدة') || qClean.includes('شروط') || qClean.includes('كيف'))) {
      isDirectlyRelevant = false;
      reasons.push('السؤال عن أحكام المسح على الخفين ومدته أو شروطه، ولم تذكر الإجابة المدة المقررة شرعاً (يوماً وليلة للمقيم، وثلاثة أيام بلياليهن للمسافر) أو شرط لبسهما على طهارة كاملة.');
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
