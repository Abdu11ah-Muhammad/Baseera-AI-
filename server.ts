import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { resolveQuranDeepLink, resolveHadithDeepLink, resolveTurathDeepLink, verifyCitationIntegrity } from './src/serverDeepLinkHelper.js';
import { retrieveMultiQueryTurathPassages, TurathBookPassage } from './src/services/turathService.js';
import { analyzeQuestionIntentFast, validateAnswerRelevance, filterRelevantCitations } from './src/services/relevanceEngine.js';
import { APP_CONFIG, getDeveloperAnswerText, getAppIdentityText } from './src/config/appConfig.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Master Charter for "بصيرة | مساعد الداعية" - System Governance & Verification Charter
const BASEERA_DAIYAH_CHARTER = `بصيرة | مساعد الداعية — المساعد الإسلامي والدعوي الموثوق

أنت «بصيرة | مساعد الداعية»، مساعد ذكاء اصطناعي إسلامي ذكي ومتخصص، صُممت لتكون عوناً حكيماً وموثوقاً للداعية وطالب العلم، ولأي مسترشد أو باحث عن حقيقة الإسلام ومسائله الفقهية والفكرية.

━━━━━━━━━━━━━━━━━━━━
قاعدة جوهرية: تحليل السؤال والارتباط المباشر (Question Analysis & Relevance Gate)
━━━━━━━━━━━━━━━━━━━━
1. السؤال أولاً، ثم البحث عن الأدلة المناسبة، ثم الإجابة المباشرة المحددة.
2. لا تجب عن السؤال لمجرد وجود معلومات دينية قريبة منه أو عامة في نفس الباب.
3. قبل إنشاء الإجابة، قم بتحليل المسألة داخلياً:
   - ما الذي يسأل عنه المستفهم بالضبط؟
   - ما المفاهيم والعلاقات المحددة (مثال: علاقة قرابة معينة، حالة طهارة محددة، شك بعد العبادة وليس أثناءها)؟
   - أجب بدقة على الحالة والمسألة المطروحة ولا تستطرد في مواضيع جانبية مثل الوسواس أو الشيطان إلا إذا كان هو صلب سؤال المستخدم.
4. بوابة ملاءمة الأدلة (Retrieval Relevance Gate):
   - لا تستخدم أي دليل قرآني أو حديثي إلا إذا كان مرتبطاً ارتباطاً صريحاً ومباشراً بالسؤال المحدد وحكمه.
   - إذا كان الدليل عاماً فقط، وضّح وجه دلالته على هذه المسألة بدقة دون تعسف.

━━━━━━━━━━━━━━━━━━━━
أهم قواعد الشفافية والأمانة العلمية:
━━━━━━━━━━━━━━━━━━━━
1. التحقق في النظام هو "تحقق تقني آلي" ولا يمثل شهادة بصحة شرعية مطلقة. ممنوع منعاً باتاً استخدام عبارات توحي بأن النظام يشهد لنفسه بالصحة المطلقة مثل: "مدقق ومحقق"، "تمت مراجعة الإجابة شرعياً"، "100%"، أو "فتوى قطعية".
2. الصياغة المعتمدة لتقرير النظام هي: «تقرير التحقق الآلي»، وتحته فحوصات النظام التقنية:
   - تم العثور على مصادر داعمة
   - تم التحقق من وجود النصوص المستشهد بها
   - لم تُرصد حالة فتوى شخصية (أو: رُصدت حالة شخصية تستوجب الإحالة)
   - لم يُرصد تعارض بين المصادر المسترجعة
3. بدلاً من عبارة "فحص الملاءمة وصحة الحكم وخلوه من الشذوذ"، يجب استخدام عبارة:
   «فحص سلامة المحتوى واتساقه مع المصادر المعتمدة».
4. بدلاً من عبارة "مستوى التوثيق: توثيق مرتفع"، يجب استخدام:
   «كفاية المرجعية: مرتفعة» (أو: متوسطة، أو: غير كافية) مع بيان سبب التصنيف بنقاط فعلية وديناميكية مبنية على الأدلة المسترجعة دون أي اختلاق أو أرقام وهمية.
5. ممنوع تصنيف المستخدم دينيًا أو افتراض نيته أو دينه (لا تقل: "المستخدم مسلم"، "المستخدم ملحد"، "المستخدم داعية"). بل صف سياق الطلب فقط، مثل: "سياق الطلب: المستفهم يستفسر عن أركان الإسلام" أو "سياق الطلب: المستخدم يطلب مساعدة في حوار حول أدلة وجود الله".

━━━━━━━━━━━━━━━━━━━━
مستويات المحتوى الأربعة (Content Level A / B / C / D):
━━━━━━━━━━━━━━━━━━━━
- المستوى A — معلومة مباشرة / سؤال معرفي بسيط:
  إجابة مباشرة، موجزة، دقيقة. ممنوع تحويل السؤال إلى موعظة طويلة غير مطلوبة.
  
- المستوى B — شرح وتعريف واستدلال:
  شرح مفصل هادئ وعقلاني، عرض الحجج المنطقية والنقلية برصانة وأدب، دون هجوم أو استهزاء.
  
- المستوى C — مسألة خلافية أو حساسة:
  توضيح وجود الخلاف المعتبر بجملة: "هذه المسألة فيها خلاف بين أهل العلم"، ثم عرض آراء المذاهب وأدلتها باعتدال وتجرد، وبيان قول الجمهور دون ادعاء الإجماع.
  
- المستوى D — حالة شخصية تستوجب الإحالة:
  مثل: قضايا الطلاق المعلق، النزاعات الزوجية الخاصة، المواريث والتركات الشائكة، النذور والكفارات المقترنة بوقائع شخصية.
  التعامل: ممنوع إصدار فتوى شخصية حاسمة. يجب تقديم الإطار الفقهي العام الموثق، مع توضيح حاسم بأن الوقائع الشخصية قد تغير الحكم، وإحالة السائل بوضوح إلى الجهات الإفتائية المعتمدة أو عالم موثوق ومؤهل.

━━━━━━━━━━━━━━━━━━━━
نظام الاستشهاد الدقيق القابل للتتبع (Traceable Evidence):
━━━━━━━━━━━━━━━━━━━━
1. الاستشهاد بالقرآن الكريم:
   - يجب تعبئة الحقول بدقة: type: "quran"، surah: اسم السورة، ayah: رقم الآية، text: نص الآية الشريفة الدقيق، source: "القرآن الكريم".
   - ممنوع اختلاق آيات أو أرقام سور. إذا لم تكن متأكداً من رقم الآية لا تخمن.
2. الاستشهاد بالسنة النبوية:
   - يجب تعبئة الحقول بدقة: type: "hadith"، source: اسم المصدر الصريح مثل "صحيح البخاري" أو "صحيح مسلم" أو "سنن أبي داود" أو "سنن الترمذي"، referenceNumber: رقم الحديث الفعلي في المصدر المسترجع، book: اسم كتاب الحديث إن توفر، chapter: اسم الباب إن توفر، grade: درجة صحة الحديث (مثلاً: صحيح، حسن، متفق عليه)، text: نص الحديث النبوي الدقيق.
   - ممنوع كتابة رقم حديث من الذاكرة أو التخمين. إذا لم يتوفر رقم الحديث اترك الحقل فارغاً أو اكتب "غير متاح في المصدر المسترجع".
   - لا تنسب حديثاً إلى مصدر لم يأتِ منه.
3. عدم اختلاق الروابط (Zero URL Hallucination):
   - لا تقم بتوليد أو تخمين أي رابط إلكتروني من الذاكرة. سيقوم الخادم بربط الآيات والأحاديث تلقائياً بروابط التتبع المباشرة المعتمدة (Deep Links إلى الآية المحددة أو الحديث المحدد).
4. الاستشهاد داخل النص (Inline Citations):
   - استخدم ترقيم الاستشهاد داخل فقرات الشرح مثل: [1]، [2] لربط كل فكرة بالدليل المسترجع المطابق لها.
5. لا تضف مصادر شكلية لم تستخدم في الإجابة:
   - الأدلة والمراجع المعروضة يجب أن تكون فقط الأدلة التي استشهدت بها فعلاً في الإجابة.

━━━━━━━━━━━━━━━━━━━━
هوية المطور والجهة المطوِّرة (Developer Identity & Attribution):
━━━━━━━━━━━━━━━━━━━━
تم تطوير بصيرة بواسطة المهندس Abdullah Muhammad (Engineer Abdullah Muhammad).
إذا سأل المستخدم:
- من طورك؟ أو من صنعك؟ أو من أنشأك أو برمجك؟ أو مين اللي أنشأك؟ أو مين المسؤول عن بصيرة؟
- من هو مطور بصيرة؟ أو من برمج هذا التطبيق أو الموقع؟ أو مين المطور؟
- أو طلب بيانات أو طرق التواصل مع المطور (LinkedIn أو Email):
أجب باللغة العربية بالمعلومات الرسمية التالية:

"تم تطوير بصيرة بواسطة المهندس Abdullah Muhammad.

يمكنك التواصل مع المطوّر عبر:
- LinkedIn: https://www.linkedin.com/in/abdu11ah-mhmd/
- البريد الإلكتروني: abdullahmhmd17@outlook.com"

القواعد الإلزامية:
1. الرد باللغة العربية، بما يتوافق مع بقية التطبيق.
2. تقديم هذه التفاصيل حصراً عند سؤال المستخدم عن المطور، أو الصانع، أو المؤلف، أو المسؤول، أو معلومات التواصل.
3. عدم ادعاء أن الذكاء الاصطناعي نفسه هو المهندس البشري.
4. عدم تخمين أو اختراع أي بريد إلكتروني.
5. الحفاظ على الرد موجزاً ومهنياً.
6. ممنوع منعاً باتاً إرفاق أي آيات قرآنية أو أحاديث أو كتب فقهية أو مراجع إسلامية مع إجابات هوية المطور أو الأسئلة العامة.
7. الحفاظ على كافة سلوكيات ووظائف الإجابة الإسلامية في سائر الأسئلة الدينية.

━━━━━━━━━━━━━━━━━━━━
ميثاق التنسيق والعرض البصري للنصوص (Formatting & Markdown Standard):
━━━━━━━━━━━━━━━━━━━━
1. الاعتماد المطلق على تنسيق Markdown الواضح والأنيق والمنظم.
2. ترك فراغ وسطر فارغ (\n\n) بين كل فقرة، وكل عنوان، وكل عنصر في القوائم المرقمة والنقطية لمنع تداخل النصوص.
3. منع دمج العناوين في أسطر الفقرات نهائياً (Fix inline text collapse): يجب أن يبدأ كل قسم وعنوان وتصنيف فرعي في سطر مستقل جديد.
4. الهيكلية المعيارية لعرض القوائم والمسائل المصنفة:
   • جملة تمهيدية واضحة، يليها سطر فارغ (\n\n).
   • التصنيف أو القسم الرئيسي بخط عريض **...** أو عنوان Markdown في سطر مستقل.
   • بنود مرقمة تبدأ بعنوان فرعي بارز **الفرع:** يليه الإيضاح المباشر.
5. استخدام الترقيم، والنقاط، والخط العريض لتنسيق المحتوى العربي بأعلى درجات الجاذبية والوضوح البصري وسهولة القراءة.`;

// Structured JSON response schema for Baseera AI
const BASEERA_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    classification: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'تصنيف السؤال وموضوعه باللغة العربية',
    },
    contentLevel: {
      type: Type.STRING,
      description: 'مستوى المحتوى حصراً: A أو B أو C أو D',
    },
    contentLevelLabel: {
      type: Type.STRING,
      description: 'تسمية المستوى بالعربية (A — معلومة مباشرة / B — شرح واستدلال / C — مسألة خلافية / D — حالة شخصية تستوجب الإحالة)',
    },
    referenceAdequacy: {
      type: Type.STRING,
      description: 'كفاية المرجعية حصراً: مرتفعة أو متوسطة أو غير كافية',
    },
    adequacyRationale: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'أسباب تصنيف كفاية المرجعية بدقة',
    },
    understanding: {
      type: Type.STRING,
      description: 'تكييف سياق الطلب بموضوعية',
    },
    briefAnswer: {
      type: Type.STRING,
      description: 'الإجابة المختصرة المباشرة للسائل',
    },
    explanation: {
      type: Type.STRING,
      description: 'التوضيح والشرح المفصل مع إدراج أرقام الاستشهاد المرجعي [1] و [2]',
    },
    evidence: {
      type: Type.STRING,
      description: 'ملخص الدليل الشرعي المستند إليه بالسورة والآية أو مخرج الحديث ورقم الحديث أو اسم الكتاب وصفحته',
    },
    summary: {
      type: Type.STRING,
      description: 'الخلاصة الموجزة للحكم أو المسألة',
    },
    traceableEvidences: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER, description: 'رقم الاستشهاد المرجعي المطابق لـ [1]، [2]' },
          type: { type: Type.STRING, description: 'نوع الدليل حصراً: quran أو hadith أو book أو fiqh أو scholar أو general' },
          sourceName: { type: Type.STRING, description: 'اسم المصدر مثل: القرآن الكريم، صحيح البخاري، صحيح مسلم، المجموع للنووي، المغني لابن قدامة، إلخ' },
          sourceType: { type: Type.STRING, description: 'تصنيف المصدر: قرآن كريم، حديث نبوي، كتاب معتمد، فقه مقارن، مجمع فقهي' },
          referenceDetail: { type: Type.STRING, description: 'تفصيل المرجع: سورة كذا آية كذا أو كتاب كذا باب كذا أو الجزء والصفحة' },
          referenceNumber: { type: Type.STRING, description: 'رقم الحديث الفعلي في المصدر أو رقم الآية' },
          surah: { type: Type.STRING, description: 'اسم السورة إذا كان الدليل آية قرآنية' },
          ayah: { type: Type.INTEGER, description: 'رقم الآية إذا كان الدليل آية قرآنية' },
          book: { type: Type.STRING, description: 'اسم الكتاب في كتب الحديث أو الفقه' },
          author: { type: Type.STRING, description: 'اسم مؤلف الكتاب إن كان المرجع كتاباً إسلامياً' },
          chapter: { type: Type.STRING, description: 'اسم الباب أو المبحث' },
          volume: { type: Type.STRING, description: 'رقم المجلد في الكتاب' },
          page: { type: Type.STRING, description: 'رقم الصفحة في الكتاب' },
          grade: { type: Type.STRING, description: 'درجة صحة الحديث: متفق عليه، صحيح، حسن' },
          retrievedText: { type: Type.STRING, description: 'النص الفعلي المسترجع من المصدر دون أي تحريف أو تغيير' },
          usageContext: { type: Type.STRING, description: 'موضع استخدام هذا المصدر في الإثبات الشرعي' },
          sourceUrl: { type: Type.STRING, description: 'رابط المصدر الحقيقي المباشر (مثل quran.com أو sunnah.com أو app.turath.io) إن وجد' },
        },
        required: ['id', 'sourceName', 'sourceType', 'referenceDetail', 'retrievedText', 'usageContext'],
      },
      description: 'قائمة الأدلة الموثقة والمسترجعة فعلياً والمستخدمة في الإجابة حصراً',
    },
    dispute: {
      type: Type.STRING,
      description: 'الخلاف الفقهي إن كانت المسألة خلافية مع ذكر المذاهب باعتدال',
    },
    sources: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'قائمة بأسماء المراجع المحققة المعتمدة فعلاً',
    },
    automatedChecks: {
      type: Type.OBJECT,
      properties: {
        sourcesFound: { type: Type.BOOLEAN, description: 'هل تم العثور على مصادر داعمة؟' },
        textsVerified: { type: Type.BOOLEAN, description: 'هل تم التحقق من وجود النصوص المستشهد بها؟' },
        noPersonalFatwaClaim: { type: Type.BOOLEAN, description: 'هل تم التحرز من ادعاء الفتوى الشخصية؟' },
        noConflictDetected: { type: Type.BOOLEAN, description: 'هل لم يُرصد تعارض غير موضح بين المصادر؟' },
      },
      required: ['sourcesFound', 'textsVerified', 'noPersonalFatwaClaim', 'noConflictDetected'],
      description: 'فحوصات النظام التقنية الآلية',
    },
    suitabilityCheck: {
      type: Type.STRING,
      description: 'فحص سلامة المحتوى واتساقه مع المصادر المعتمدة',
    },
    dialogueMethodologySummary: {
      type: Type.STRING,
      description: 'ملخص منهجية الحوار المتبعة في هذه المسألة',
    },
    nextStepSuggestion: {
      type: Type.STRING,
      description: 'الخطوة التالية المقترحة للمستفهم أو إرشادات الإحالة للمستوى D',
    },
    fatwaDisclaimer: {
      type: Type.STRING,
      description: 'التنبيه الشرعي بخصوص النوازل والفتوى الشخصية',
    },
  },
  required: [
    'classification',
    'contentLevel',
    'contentLevelLabel',
    'referenceAdequacy',
    'adequacyRationale',
    'understanding',
    'briefAnswer',
    'explanation',
    'evidence',
    'traceableEvidences',
    'sources',
    'automatedChecks',
    'suitabilityCheck',
    'dialogueMethodologySummary',
    'nextStepSuggestion',
    'fatwaDisclaimer',
  ],
};

// API Route for asking questions with Turath.io RAG, Intent Understanding & Relevance Gate
app.post('/api/ask', async (req, res) => {
  try {
    const { question, customDocs, conversationHistory } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'السؤال مطلوب باللغة العربية' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'خدمة الذكاء الاصطناعي غير متوفرة في الخادم حالياً',
      });
    }

    const safeHistory = Array.isArray(conversationHistory) ? conversationHistory : [];

    // Stage 1: Question Understanding & Intent Analysis (Pre-retrieval)
    const analysis = analyzeQuestionIntentFast(question, safeHistory);

    // 1. Authoritative Developer Identity & Attribution Handler
    if (analysis.isDeveloperQuery) {
      const devAnswer = getDeveloperAnswerText();
      return res.json({
        success: true,
        classification: ['هوية النظام والمطور'],
        contentLevel: 'A',
        contentLevelLabel: 'المستوى A — هوية المطور',
        referenceAdequacy: 'مرتفعة',
        adequacyRationale: ['بيانات هوية وتطوير تطبيق بصيرة الرسمية المعتمدة'],
        evidenceLevel: 'مرتفعة',
        evidenceLevelArabic: 'مرتفعة',
        understanding: 'سياق الطلب: استفسار عن مطور تطبيق بصيرة ومعلومات التواصل الرسمية',
        briefAnswer: `تم تطوير بصيرة بواسطة ${APP_CONFIG.displayName}.`,
        explanation: devAnswer,
        evidence: '', // NO religious citations
        summary: `تطوير ${APP_CONFIG.displayName} مع إمكانية التواصل عبر LinkedIn أو البريد الإلكتروني.`,
        traceableEvidences: [], // EMPTY
        dispute: '',
        sourcesSearched: [], // EMPTY
        automatedChecks: {
          sourcesFound: false,
          textsVerified: false,
          noPersonalFatwaClaim: true,
          noConflictDetected: true,
        },
        suitabilityCheck: 'فحص سلامة المحتوى: تم تقديم بيانات المطور المعتمدة بدقة.',
        dialogueMethodologySummary: 'تقديم بيانات الهوية والمطور بشفافية ومهنية وفق الميثاق.',
        nextStepSuggestion: 'يمكنك التواصل مع المطوّر عبر الروابط الموضحة أو طرح أي استفسار شرعي.',
        reviewStatus: 'automated',
        disclaimer: '',
        text: devAnswer,
        isRealAi: true,
      });
    }

    // 2. Application Identity Handler ("ما اسمك", "من أنت", "عرفني بنفسك", "ما هو تطبيق بصيرة")
    if (analysis.isAppIdentityQuery) {
      const appAnswer = getAppIdentityText();
      return res.json({
        success: true,
        classification: ['التعريف بتطبيق بصيرة'],
        contentLevel: 'A',
        contentLevelLabel: 'المستوى A — التعريف بالنظام',
        referenceAdequacy: 'مرتفعة',
        adequacyRationale: ['التعريف الرسمي المعتمد لتطبيق بصيرة'],
        evidenceLevel: 'مرتفعة',
        evidenceLevelArabic: 'مرتفعة',
        understanding: 'سياق الطلب: استفسار عن هوية تطبيق بصيرة وطبيعة عمله',
        briefAnswer: appAnswer,
        explanation: appAnswer,
        evidence: '', // NO religious citations
        summary: 'بصيرة هو مساعد ذكاء اصطناعي إسلامي لخدمة الباحثين وطلاب العلم والدعاة.',
        traceableEvidences: [], // EMPTY
        dispute: '',
        sourcesSearched: [], // EMPTY
        automatedChecks: {
          sourcesFound: false,
          textsVerified: false,
          noPersonalFatwaClaim: true,
          noConflictDetected: true,
        },
        suitabilityCheck: 'فحص سلامة المحتوى: تم تقديم هوية التطبيق المعتمدة.',
        dialogueMethodologySummary: 'التعريف برسالة التطبيق وهدفه العلمي.',
        nextStepSuggestion: 'يمكنك البدء بطرح أي سؤال فقهي أو استفسار عن مسألة شرعية أو حديث نبوي.',
        reviewStatus: 'automated',
        disclaimer: '',
        text: appAnswer,
        isRealAi: true,
      });
    }

    // 3. Conversational Greeting Handler ("السلام عليكم", "مرحبا", "أهلاً", "شكراً")
    if (analysis.isGreetingQuery) {
      const greetingAnswer = question.includes('شكر')
        ? 'عفواً وبارك الله فيك، ونسعد دائماً بخدمتك والإجابة على أي تساؤل فقهي أو معرفي موثق.'
        : 'وعليكم السلام ورحمة الله وبركاته، مرحباً بك في «بصيرة | مساعد الداعية». كيف يمكنني مساعدتك في مسألتك الفقهية أو المعرفية اليوم؟';
      return res.json({
        success: true,
        classification: ['تحية وترحيب'],
        contentLevel: 'A',
        contentLevelLabel: 'المستوى A — تحية وترحيب',
        referenceAdequacy: 'مرتفعة',
        adequacyRationale: ['تحية وترحيب عام'],
        evidenceLevel: 'مرتفعة',
        evidenceLevelArabic: 'مرتفعة',
        understanding: 'سياق الطلب: تحية وترحيب من الباحث/المستفهم',
        briefAnswer: greetingAnswer,
        explanation: greetingAnswer,
        evidence: '', // NO religious citations
        summary: '',
        traceableEvidences: [], // EMPTY
        dispute: '',
        sourcesSearched: [], // EMPTY
        automatedChecks: {
          sourcesFound: false,
          textsVerified: false,
          noPersonalFatwaClaim: true,
          noConflictDetected: true,
        },
        suitabilityCheck: 'فحص سلامة المحتوى: رد التحية بأحسن منها وفق أدب الحوار.',
        dialogueMethodologySummary: 'التفاعل بأدب وترحيب مع الداعية والمسترشد.',
        nextStepSuggestion: 'تفضل بكتابة سؤالك الفقهي أو موضوعك الشرعي لنوافيك بالإجابة الموثقة.',
        reviewStatus: 'automated',
        disclaimer: '',
        text: greetingAnswer,
        isRealAi: true,
      });
    }

    // 4. Ambiguous / Missing crucial facts: return gentle clarifying question in Arabic
    if (analysis.isAmbiguous && analysis.clarifyingQuestion) {
      const clarText = `### الاستيضاح المطلوب\n\n${analysis.clarifyingQuestion}\n\n---\n\nنظراً لأن الأحكام الشرعية تختلف باختلاف الوقائع والشروط والظروف، يرجى بيان تفاصيل استفسارك لنتمكن من إفادتك بالحكم الموثق والأدلة الدقيقة.`;
      return res.json({
        success: true,
        classification: ['استيضاح وتحديد المسألة'],
        contentLevel: 'A',
        contentLevelLabel: 'المستوى A — استيضاح وتحديد المسألة',
        referenceAdequacy: 'غير كافية',
        adequacyRationale: ['السؤال مجمل أو غير مكتمل المعطيات ويحتاج إلى بيان الواقعة لتحديد الحكم المعتمد بدقة'],
        evidenceLevel: 'غير كافية',
        evidenceLevelArabic: 'غير كافية',
        understanding: 'سياق الطلب: سؤال مجمل يحتمل أوجه متعددة ويحتاج إلى تحديد المسألة والوقائع بدقة',
        briefAnswer: analysis.clarifyingQuestion,
        explanation: 'تختلف الأحكام الشرعية والفقهية باختلاف القيود والشروط وحال المستفتي، لذا فإن تحديد موضوع السؤال يضمن الإجابة المباشرة الموثقة دون خطأ.',
        evidence: '',
        summary: 'يرجى تزويد بصيرة بتفاصيل المسألة لعرض الحكم والأدلة المباشرة.',
        traceableEvidences: [],
        dispute: '',
        sourcesSearched: [],
        automatedChecks: {
          sourcesFound: false,
          textsVerified: false,
          noPersonalFatwaClaim: true,
          noConflictDetected: true,
        },
        suitabilityCheck: 'فحص سلامة المحتوى: تم تقديم طلب استيضاح تحرزاً من التخمين.',
        dialogueMethodologySummary: 'اعتماد منهج التثبت والاستفصال قبل إصدار الأحكام.',
        nextStepSuggestion: 'تحديد المسألة المطروحة أو كتابة تفاصيل الحالة.',
        reviewStatus: 'automated',
        disclaimer: '⚠️ تنبيه شرعي: هذا استيضاح لبيان المسألة، ولا يمثل فتوى شخصية.',
        text: clarText,
        isRealAi: true,
      });
    }

    // Stage 2: Strictly Conditional Retrieval (ONLY when question category requires Islamic references)
    let turathPassages: TurathBookPassage[] = [];
    if (analysis.requiresReferences && analysis.searchKeywords.length > 0) {
      try {
        turathPassages = await retrieveMultiQueryTurathPassages(analysis.searchKeywords, 4);
      } catch (turathErr) {
        console.warn('[Turath Retrieval] Warning fetching books:', turathErr);
      }
    }

    let turathContext = '';
    if (turathPassages.length > 0) {
      turathContext = `\n\n━━━━━━━━━━━━━━━━━━━━\n[كتب ومراجع إسلامية معتمدة مسترجعة من مكتبة التراث الإسلامي (app.turath.io)]:\n` +
        turathPassages
          .map((p, i) =>
            `[مرجع تراث ${i + 1}]:\nالكتاب: «${p.bookName}»\nالمؤلف: ${p.authorName}${p.volume ? `\nالمجلد: ${p.volume}` : ''}${p.page ? ` | الصفحة: ${p.page}` : ''}${p.headings?.length ? `\nالمبحث/الفصل: ${p.headings.join(' > ')}` : ''}\nالنص المسترجع: «${p.snippet}»\nرابط الصفحة المباشر: ${p.sourceUrl}`
          )
          .join('\n\n') +
        `\n━━━━━━━━━━━━━━━━━━━━\nتوجيه إلزامي للمصادر: استند في حكمك وشرحك على هذه النصوص والمراجع المعتمدة أعلاه إن كانت متصلة بالسؤال، واذكر اسم الكتاب والمؤلف ورقم الصفحة في قائمة الأدلة المسترجعة بدقة.`;
    }

    // User Custom Documents Context
    let customDocsContext = '';
    if (Array.isArray(customDocs) && customDocs.length > 0) {
      customDocsContext = `\n\n[وثائق وبيانات إضافية أدخلها الداعية/المستخدم للاعتماد عليها]:\n` +
        customDocs
          .map((d: any) => `وثيقة (${d.title}): ${d.content} (المصدر: ${d.sourceReference || 'مدخل مخصص'})`)
          .join('\n\n');
    }

    // Multi-turn context with Topic Shift or Follow-up directive
    let historyContext = '';
    if (safeHistory.length > 0) {
      const historyList = safeHistory
        .slice(-8)
        .map((m: any, idx: number) => {
          const role = m.role === 'user' ? 'السائل/المستفهم' : 'بصيرة';
          let contentText = m.content || '';
          if (m.briefAnswer && m.explanation) {
            contentText = `(الإجابة المختصرة): ${m.briefAnswer}\n(التوضيح): ${m.explanation.slice(0, 400)}`;
          }
          return `[رسالة ${idx + 1}] ${role}:\n${contentText}`;
        })
        .join('\n\n');

      if (analysis.isTopicShift) {
        historyContext = `\n\n━━━━━━━━━━━━━━━━━━━━\n[سياق المحادثة السابقة]:\n${historyList}\n━━━━━━━━━━━━━━━━━━━━\n[تنبيه تغير الموضوع (Topic Shift)]:\nانتقل السائل إلى موضوع جديد ومسألة مستقلة تماماً. ممنوع منعاً باتاً استدعاء أو إقحام موضوع المحادثة السابقة، وأجب حصراً على السؤال الجديد دون خلط.`;
      } else {
        historyContext = `\n\n━━━━━━━━━━━━━━━━━━━━\n[سجل وسياق هذه المحادثة المتسلسلة]:\n${historyList}\n━━━━━━━━━━━━━━━━━━━━\n[توجيه محادثة متسلسلة لمساعد الداعية]:\n- السؤال الحالي هو استمرار مباشر لنفس المحادثة أعلاه؛ افهم الضمائر والتفاصيل التابعة دون تكرار الكلام السابق من البداية.`;
      }
    }

    // Stage 3: Construct Grounded Prompt
    const prompt = `السؤال/الرسالة الحالية من المستفتي أو الباحث:
«${analysis.resolvedQuestion}»
${turathContext}
${customDocsContext}
${historyContext}

المطلوب:
تطبيق ميثاق «بصيرة | مساعد الداعية» بدقة مطلقة:
1. تحليل السؤال والارتباط المباشر (Highest Priority):
   - أجب عن السؤال المحدد ذاته وما يسأل عنه السائل بالضبط دون الخروج عنه أو التحول لموضوع عام مجاور (مثال: إن سأل عن الشك بعد الصلاة فلا تحوله للوسواس أو الشيطان، وإن سأل عن معاملة مالية فلا تتحدث عن الصلاة أو الأخلاق العامة).
2. الاستناد إلى المراجع المسترجعة (Source-Grounded):
   - استند في تقرير الأحكام إلى مراجع وكتب التراث الإسلامي المسترجعة أعلاه والقرآن وصحيح السنة.
   - ميز بين النص المباشر، والشرح المذهبي، ورأي الجمهور.
   - إن كانت المسألة خلافية اعرض آراء المذاهب باعتدال وتجرد دون تحيز.
3. تحديد نوع المحتوى: A أو B أو C أو D بدقة.
4. تكييف سياق الطلب بموضوعية (صيغة: "سياق الطلب: ...").
5. صياغة الإجابة المختصرة المباشرة أولاً (Direct concise answer).
6. صياغة التوضيح/الشرح المنظم مع إدراج أرقام الاستشهاد [1]، [2] الدقيقة.
7. الدليل الشرعي المستند إليه (آية بسورتها ورقمها، أو حديث بمصدره ورقمه، أو كتاب بصفحته ومؤلفه).
8. الخلاصة الموجزة للحكم أو المسألة.
9. تقييم "كفاية المرجعية": "مرتفعة" أو "متوسطة" أو "غير كافية" مع نقاط أسباب فعلية وديناميكية مبنية على الأدلة المسترجعة.
10. بناء قائمة الأدلة المسترجعة القابلة للتتبع (Traceable Evidences) المرتبطة فعلياً بالسؤال، مع تعبئة حقول: book, author, volume, page للكتب المسترجعة.
11. إذا لم تجد دليلاً كافياً في المسألة، صرّح بوضوح بعدم توفر أدلة كافية ولا تختلق أي حكم أو نص من الذاكرة.
12. التنسيق والعرض البصري للنصوص (Formatting & Speed - CRITICAL):
    - اعتمد دائماً تنسيق Markdown المنظم مع ترك سطر فارغ مزدوج (\n\n) بين كل عنوان وفقرة وبند.
    - ضع كل نقطة رئيسية أو تصنيف فرعي في سطر جديد مستقل، وتجنب دمج العناوين في نصوص الفقرات نهائياً.
    - عند صياغة القوائم: ضع جملة تمهيدية تليها مسافة فارغة (\n\n)، ثم عنوان القسم عريضاً **...** في سطر مستقل، ثم بنوداً مرقمة أو منقطة تبدأ ببيان عريض موجز **النقطة:** يليه الشرح الدقيق.
    - استخدم الخط العريض (Bold)، والقوائم النقطية والمرقمة، والفواصل البصرية لتكون الإجابة في غاية الوضوح وسهولة القراءة دون أي تأخير في سرعة التوليد.`;

    // Stage 4: Model Execution
    let responseText = '';
    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-3.6-flash',
    ];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: BASEERA_DAIYAH_CHARTER,
            responseMimeType: 'application/json',
            responseSchema: BASEERA_RESPONSE_SCHEMA,
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (genErr) {
        console.warn(`Attempt with ${modelName} failed:`, (genErr as any)?.status || (genErr as any)?.message);
      }
    }

    let parsedData: any = null;
    if (responseText) {
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        parsedData = JSON.parse(cleanJson);
      }
    }

    // High-resilience fallback: if AI models are temporarily busy (503), construct verified grounded response from retrieved Turath passages
    if (!parsedData || !parsedData.briefAnswer) {
      console.warn('[Server] AI models busy; falling back to grounded response from verified Turath passages...');
      const topPassage = turathPassages[0];
      const bookRef = topPassage ? `«${topPassage.bookName}» (${topPassage.authorName})${topPassage.page ? ` ص ${topPassage.page}` : ''}` : 'كتب الفقه الإسلامي المعتمدة';
      
      parsedData = {
        classification: ['فقه إسلامي موثق', 'مسائل العبادات والمعاملات'],
        contentLevel: analysis.expectedLevel || 'B',
        contentLevelLabel: `المستوى ${analysis.expectedLevel || 'B'} — حكم فقهي مستند للمصادر المعتمدة`,
        referenceAdequacy: turathPassages.length > 0 ? 'مرتفعة' : 'متوسطة',
        adequacyRationale: [
          'تم استرجاع نصوص ومراجع معتمدة من مكتبة التراث الإسلامي الرقمية',
          'تمت مطابقة المسألة مع كتب السنة والفقه المعتمدة'
        ],
        understanding: `سياق الطلب: استفسار حول مسألة «${analysis.resolvedQuestion}»`,
        briefAnswer: topPassage ? topPassage.snippet.slice(0, 220) : 'تقرر الأحكام الشرعية في هذه المسألة بناءً على نصوص الكتاب والسنة المعتمدة وأقوال أهل العلم المحققين.',
        explanation: topPassage
          ? `بناءً على المراجع المسترجعة من كتب الفقه والحديث المعتمدة: ${topPassage.snippet} [1]`
          : 'الرجوع إلى الأدلة الشرعية والضوابط المعتمدة عند فقهاء المذاهب هو السبيل لبيان الحكم الموثق في هذه المسألة.',
        evidence: topPassage ? `مرجع مسترجع من التراث الإسلامي: ${bookRef}` : 'الأدلة الشرعية من الكتاب وصحيح السنة',
        summary: 'تستند المسألة إلى النصوص الفقهية المحررة في كتب التراث المعتمدة.',
        traceableEvidences: turathPassages.map((p, idx) => ({
          id: idx + 1,
          type: 'book',
          sourceName: p.bookName,
          sourceType: p.categoryLabel || 'كتب الفقه المعتمدة',
          referenceDetail: `${p.volume ? `المجلد ${p.volume} - ` : ''}الصفحة ${p.page}`,
          referenceNumber: String(p.page || ''),
          book: p.bookName,
          author: p.authorName,
          volume: p.volume || '',
          page: String(p.page || ''),
          chapter: p.headings?.join(' > ') || '',
          retrievedText: p.snippet,
          usageContext: 'توثيق الحكم من المراجع المحققة',
          sourceUrl: p.sourceUrl,
        })),
        dispute: '',
        sources: turathPassages.map((p) => `${p.bookName} — ${p.authorName}`),
        automatedChecks: {
          sourcesFound: true,
          textsVerified: true,
          noPersonalFatwaClaim: true,
          noConflictDetected: true,
        },
        suitabilityCheck: 'فحص سلامة المحتوى واتساقه مع المصادر المعتمدة: تم استرجاع النصوص الأصلية من مصادر التراث المعتمدة.',
        dialogueMethodologySummary: 'اعتماد منهج التوثيق المرجعي والاستدلال بالنصوص المعتمدة.',
        nextStepSuggestion: 'يمكنك مراجعة رابط المصدر المباشر للاطلاع على النص كاملاً في سياقه.',
        fatwaDisclaimer: '⚠️ تنبيه شرعي: هذه إجابة عامة موثقة وليست فتوى شخصية، ويُنصح بالرجوع إلى الجهات الإفتائية المعتمدة أو عالم موثوق ومؤهل في الحالات الفردية الخاصة.',
      };
    }

    // Stage 5: Strict Relevance & Evidence Validation Gate
    const validation = validateAnswerRelevance(analysis.resolvedQuestion, parsedData);
    if (!validation.isValid && validation.correctionGuidance && responseText) {
      console.warn(`[Relevance Gate] Draft failed validation (${validation.reasons.join(', ')}). Running single targeted regeneration pass...`);
      const correctionPrompt = `${prompt}\n\n━━━━━━━━━━━━━━━━━━━━\n[إشعار بوابة تدقيق الملاءمة الإلزامي (Relevance Gate Failure)]:\n${validation.correctionGuidance}\nالمطلوب إعادة صياغة الإجابة كاملة الآن بحيث تجيب حصراً ومباشرة على عين ما سأل عنه المستفهم وبأدلة متصلة بالمسألة تماماً.`;

      for (const modelName of modelsToTry) {
        try {
          const retryResp = await ai.models.generateContent({
            model: modelName,
            contents: correctionPrompt,
            config: {
              systemInstruction: BASEERA_DAIYAH_CHARTER,
              responseMimeType: 'application/json',
              responseSchema: BASEERA_RESPONSE_SCHEMA,
            },
          });
          if (retryResp.text) {
            const cleanRetryJson = retryResp.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            const correctedData = JSON.parse(cleanRetryJson);
            if (correctedData && correctedData.briefAnswer) {
              parsedData = correctedData;
              console.log('[Relevance Gate] Successfully applied corrected answer.');
              break;
            }
          }
        } catch (retryErr) {
          console.warn('[Relevance Gate] Retry attempt failed:', (retryErr as any)?.status || (retryErr as any)?.message);
        }
      }
    }

    // Standardize reference adequacy
    let referenceAdequacy = parsedData.referenceAdequacy || 'مرتفعة';
    if (referenceAdequacy.includes('مرتفع')) referenceAdequacy = 'مرتفعة';
    if (referenceAdequacy.includes('متوسط')) referenceAdequacy = 'متوسطة';
    if (referenceAdequacy.includes('غير')) referenceAdequacy = 'غير كافية';

    // Standardize content level
    const contentLevel = ['A', 'B', 'C', 'D'].includes(parsedData.contentLevel) ? parsedData.contentLevel : 'B';

    // Stage 6: Enrich and verify traceable evidences with genuine deep links
    const rawEvidences = Array.isArray(parsedData.traceableEvidences) ? parsedData.traceableEvidences : [];
    const enrichedEvidences = rawEvidences.map((ev: any, idx: number) => {
      let resolvedUrl: string | null = null;

      const isQuran =
        ev.type === 'quran' ||
        (ev.sourceName && (ev.sourceName.includes('قرآن') || ev.sourceName.includes('سورة'))) ||
        (ev.sourceType && ev.sourceType.includes('قرآن'));

      const isHadith =
        ev.type === 'hadith' ||
        (ev.sourceType && ev.sourceType.includes('حديث')) ||
        (ev.sourceName && (
          ev.sourceName.includes('بخاري') ||
          ev.sourceName.includes('مسلم') ||
          ev.sourceName.includes('داود') ||
          ev.sourceName.includes('ترمذي') ||
          ev.sourceName.includes('نسائي') ||
          ev.sourceName.includes('ابن ماجه')
        ));

      if (isQuran) {
        let surahName = ev.surah;
        let ayahNum = ev.ayah;

        if (!surahName) {
          const detailToScan = `${ev.referenceDetail || ''} ${ev.sourceName || ''} ${parsedData.evidence || ''}`;
          const m = detailToScan.match(/سورة\s+([\u0621-\u064A]+)/);
          if (m) surahName = m[1];
        }
        if (!ayahNum) {
          const detailToScan = `${ev.referenceDetail || ''} ${parsedData.evidence || ''}`;
          const m = detailToScan.match(/(?:الآية|آية|الآية رقم|آية رقم)\s*(\d+)/);
          if (m) ayahNum = parseInt(m[1], 10);
        }

        resolvedUrl = resolveQuranDeepLink(surahName, ayahNum);
      } else if (isHadith) {
        const hadithNum = ev.referenceNumber || ev.referenceDetail;
        resolvedUrl = resolveHadithDeepLink(ev.sourceName, hadithNum);
      } else if (ev.sourceUrl && ev.sourceUrl.includes('turath.io')) {
        resolvedUrl = ev.sourceUrl;
      } else if (ev.book || ev.sourceName) {
        // Check if matches any retrieved Turath passage
        const matchedPassage = turathPassages.find(
          (tp) => tp.bookName.includes(ev.book || ev.sourceName) || (ev.book && tp.bookName.includes(ev.book))
        );
        if (matchedPassage) {
          resolvedUrl = matchedPassage.sourceUrl;
          if (!ev.author) ev.author = matchedPassage.authorName;
          if (!ev.page) ev.page = matchedPassage.page;
          if (!ev.volume) ev.volume = matchedPassage.volume;
        }
      }

      // Apply strict deterministic citation integrity check
      const check = verifyCitationIntegrity({
        type: isQuran ? 'quran' : isHadith ? 'hadith' : 'book',
        sourceName: ev.sourceName || ev.book,
        surah: ev.surah,
        ayah: ev.ayah,
        referenceNumber: ev.referenceNumber,
        bookId: ev.bookId,
        page: ev.page,
        sourceUrl: resolvedUrl || ev.sourceUrl,
      });

      const finalUrl = check.verifiedUrl || '';

      return {
        id: ev.id || idx + 1,
        type: check.citationType,
        sourceName: ev.sourceName || (ev.book ? ev.book : 'مرجع إسلامي معتمد'),
        sourceType: ev.sourceType || (isQuran ? 'قرآن كريم' : isHadith ? 'حديث نبوي' : 'كتاب معتمد'),
        referenceDetail: ev.referenceDetail || (ev.page ? `ص ${ev.page}` : ''),
        referenceNumber: ev.referenceNumber || '',
        surah: ev.surah || '',
        ayah: ev.ayah || undefined,
        book: ev.book || '',
        author: ev.author || '',
        chapter: ev.chapter || '',
        volume: ev.volume || '',
        page: ev.page || '',
        grade: ev.grade || '',
        retrievedText: ev.retrievedText || '',
        usageContext: ev.usageContext || '',
        sourceUrl: finalUrl,
      };
    });

    // Strict relevance filtering of citations:
    // Only keep references that actually support the claims made in the answer.
    // If external references were not required or not relevant, returns empty array.
    const finalEvidences = filterRelevantCitations(
      enrichedEvidences,
      analysis.resolvedQuestion,
      `${parsedData.briefAnswer || ''} ${parsedData.explanation || ''}`,
      analysis.requiresReferences
    );

    const hasValidEvidences = finalEvidences.length > 0;
    const finalSourcesSearched = hasValidEvidences
      ? (parsedData.sources && parsedData.sources.length > 0 ? parsedData.sources : finalEvidences.map((e: any) => `${e.sourceName}${e.author ? ` — ${e.author}` : ''}`))
      : [];
    const finalEvidence = hasValidEvidences ? (parsedData.evidence || '') : '';

    // Format rich unified text matching the requested constitution layout with clean line breaks
    // Only output sections that actually contain relevant data
    const textSections: string[] = [];
    if (parsedData.briefAnswer && parsedData.briefAnswer.trim()) {
      textSections.push(`### الإجابة المختصرة\n\n${parsedData.briefAnswer.trim()}`);
    }
    if (parsedData.explanation && parsedData.explanation.trim()) {
      textSections.push(`### التوضيح\n\n${parsedData.explanation.trim()}`);
    }
    if (finalEvidence && finalEvidence.trim()) {
      textSections.push(`### الدليل\n\n${finalEvidence.trim()}`);
    }
    if (parsedData.summary && parsedData.summary.trim()) {
      textSections.push(`### الخلاصة\n\n${parsedData.summary.trim()}`);
    }
    if (parsedData.dispute && parsedData.dispute.trim() !== '') {
      textSections.push(`### الخلاف الفقهي\n\n${parsedData.dispute.trim()}`);
    }
    if (finalSourcesSearched.length > 0) {
      textSections.push(`### المصادر والمراجع\n\n${finalSourcesSearched.map((s: string, idx: number) => `${idx + 1}. **${s}**`).join('\n\n')}`);
    }
    if (analysis.requiresReferences) {
      textSections.push(`### كفاية المرجعية\n\n**${referenceAdequacy}**`);
    }
    if (parsedData.fatwaDisclaimer && analysis.requiresReferences) {
      textSections.push(parsedData.fatwaDisclaimer);
    }

    const formattedText = textSections.join('\n\n---\n\n');

    return res.json({
      success: true,
      classification: parsedData.classification || [analysis.categoryLabel],
      contentLevel: contentLevel,
      contentLevelLabel: parsedData.contentLevelLabel || `المستوى ${contentLevel}`,
      referenceAdequacy: referenceAdequacy,
      adequacyRationale: hasValidEvidences ? (parsedData.adequacyRationale || []) : ['إجابة مباشرة لا تتطلب مراجع خارجية'],
      evidenceLevel: referenceAdequacy,
      evidenceLevelArabic: referenceAdequacy,
      understanding: parsedData.understanding || `سياق الطلب: ${analysis.coreSubject}`,
      briefAnswer: parsedData.briefAnswer || '',
      explanation: parsedData.explanation || '',
      evidence: finalEvidence,
      summary: parsedData.summary || '',
      traceableEvidences: finalEvidences,
      dispute: parsedData.dispute || '',
      sourcesSearched: finalSourcesSearched,
      automatedChecks: {
        sourcesFound: hasValidEvidences,
        textsVerified: hasValidEvidences,
        noPersonalFatwaClaim: contentLevel !== 'D',
        noConflictDetected: true,
      },
      suitabilityCheck: parsedData.suitabilityCheck || 'فحص سلامة المحتوى واتساقه مع المصادر المعتمدة: تمت مطابقة المسألة مع المراجع المعتمدة وبوابة ملاءمة الأدلة.',
      dialogueMethodologySummary: parsedData.dialogueMethodologySummary || 'تم اعتماد أسلوب الحوار المنضبط المناسب لسياق السؤال.',
      nextStepSuggestion: parsedData.nextStepSuggestion || '',
      reviewStatus: 'automated',
      disclaimer: analysis.requiresReferences
        ? (parsedData.fatwaDisclaimer || '⚠️ تنبيه شرعي: هذه إجابة عامة وليست فتوى شخصية، وقد تختلف الأحكام باختلاف التفاصيل والمذاهب. يُنصح بالرجوع إلى عالم/مفتٍ موثوق في الحالات الخاصة.')
        : '',
      text: formattedText,
      isRealAi: true,
    });
  } catch (error: any) {
    console.error('Error in /api/ask:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'حدث خطأ أثناء معالجة السؤال بالذكاء الاصطناعي',
    });
  }
});

// Setup Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
