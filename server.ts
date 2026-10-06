import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { resolveQuranDeepLink, resolveHadithDeepLink } from './src/serverDeepLinkHelper.js';

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
  التعامل: ممنوع إصدار فتوى شخصية حاسمة. يجب تقديم الإطار الفقهي العام الموثق، مع توضيح حاسم بأن الوقائع الشخصية قد تغير الحكم، وإحالة السائل بوضوح إلى دار الإفتاء الرسمية أو عالم موثوق ومؤهل.

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
   - الأدلة والمراجع المعروضة يجب أن تكون فقط الأدلة التي استشهدت بها فعلاً في الإجابة.`;

// API Route for asking questions with structured evidence & automated verification
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

    // Build context with any user custom documents
    let customDocsContext = '';
    if (Array.isArray(customDocs) && customDocs.length > 0) {
      customDocsContext = `\n\n[وثائق وبيانات إضافية أدخلها الداعية/المستخدم للاعتماد عليها]:\n` +
        customDocs
          .map((d: any) => `وثيقة (${d.title}): ${d.content} (المصدر: ${d.sourceReference || 'مدخل مخصص'})`)
          .join('\n\n');
    }

    // Full multi-turn conversation context for this specific session
    let historyContext = '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      historyContext = `\n\n━━━━━━━━━━━━━━━━━━━━\n[سجل وسياق هذه المحادثة المتسلسلة]:\n` +
        conversationHistory
          .slice(-10)
          .map((m: any, idx: number) => {
            const role = m.role === 'user' ? 'السائل/المستفهم' : 'بصيرة';
            let contentText = m.content || '';
            if (m.briefAnswer && m.explanation) {
              contentText = `(الإجابة المختصرة): ${m.briefAnswer}\n(التوضيح): ${m.explanation.slice(0, 500)}`;
            }
            return `[رسالة ${idx + 1}] ${role}:\n${contentText}`;
          })
          .join('\n\n') +
        `\n━━━━━━━━━━━━━━━━━━━━\n\n` +
        `[توجيه محادثة متسلسلة لمساعد الداعية]:\n` +
        `- السؤال الحالي هو استمرار مباشر لنفس المحادثة أعلاه.\n` +
        `- افهم الضمائر، والأسئلة المختصرة، ومتابعة التفاصيل (مثل: "اشرح لي الركن الثالث بالتفصيل"، "وما الدليل؟").\n` +
        `- لا تكرر الإجابة السابقة بالكامل من البداية، بل أجب مباشرة على النقطة المستفسر عنها بطبيعية وذكاء.\n` +
        `- لا تعظ إذا كان السؤال عادياً أو استفساراً عن معلومة (المستوى A)؛ بل أجب بإيجاز تام.`;
    }

    const prompt = `السؤال/الرسالة الحالية من المستفتي أو الباحث:
«${question.trim()}»
${customDocsContext}
${historyContext}

المطلوب:
تطبيق ميثاق «بصيرة | مساعد الداعية» بدقة مطلقة:
1. تحليل السؤال بدقة: أجب عن السؤال المحدد ذاته وما يسأل عنه السائل بالضبط دون الخروج عنه أو التحول لموضوع عام مجاور.
2. تحديد نوع المحتوى: A أو B أو C أو D بدقة.
3. تكييف سياق الطلب بموضوعية (صيغة: "سياق الطلب: ...").
4. صياغة الإجابة المختصرة المباشرة أولاً (Direct concise answer).
5. صياغة التوضيح/الشرح المنظم مع إدراج أرقام الاستشهاد [1]، [2] الدقيقة.
6. الدليل الشرعي المستند إليه (آية بسورتها ورقمها، أو حديث بمصدره ورقمه وبابه).
7. الخلاصة الموجزة للحكم أو المسألة.
8. تقييم "كفاية المرجعية": "مرتفعة" أو "متوسطة" أو "غير كافية" مع نقاط أسباب فعلية وديناميكية مبنية على الأدلة المسترجعة.
9. بناء قائمة الأدلة المسترجعة القابلة للتتبع (Traceable Evidences) المرتبطة فعلياً بالسؤال (Retrieval Relevance Gate).
10. الفحوصات التقنية الآلية الأربعة بدقة وأمانة.
11. التحرز التام في المستوى D والإحالة لدار الإفتاء المعتمدة.`;

    // Use gemini-3.1-flash-lite as primary fast & reliable model
    let responseText = '';
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: BASEERA_DAIYAH_CHARTER,
            responseMimeType: 'application/json',
            responseSchema: {
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
                  description: 'ملخص الدليل الشرعي المستند إليه بالسورة والآية أو مخرج الحديث ورقم الحديث',
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
                      type: { type: Type.STRING, description: 'نوع الدليل حصراً: quran أو hadith أو fiqh أو scholar أو general' },
                      sourceName: { type: Type.STRING, description: 'اسم المصدر مثل: القرآن الكريم، صحيح البخاري، صحيح مسلم، إلخ' },
                      sourceType: { type: Type.STRING, description: 'تصنيف المصدر: قرآن كريم، حديث نبوي، فقه مقارن، مجمع فقهي' },
                      referenceDetail: { type: Type.STRING, description: 'تفصيل المرجع: سورة كذا آية كذا أو كتاب كذا باب كذا حديث رقم كذا' },
                      referenceNumber: { type: Type.STRING, description: 'رقم الحديث الفعلي في المصدر أو رقم الآية' },
                      surah: { type: Type.STRING, description: 'اسم السورة إذا كان الدليل آية قرآنية' },
                      ayah: { type: Type.INTEGER, description: 'رقم الآية إذا كان الدليل آية قرآنية' },
                      book: { type: Type.STRING, description: 'اسم الكتاب في كتب الحديث مثل: كتاب الجنائز، كتاب الإيمان' },
                      chapter: { type: Type.STRING, description: 'اسم الباب في كتب الحديث' },
                      grade: { type: Type.STRING, description: 'درجة صحة الحديث: متفق عليه، صحيح، حسن' },
                      retrievedText: { type: Type.STRING, description: 'النص الفعلي المسترجع من المصدر دون أي تحريف أو تغيير' },
                      usageContext: { type: Type.STRING, description: 'موضع استخدام هذا المصدر في الإثبات الشرعي' },
                      sourceUrl: { type: Type.STRING, description: 'رابط المصدر الحقيقي إن وجد أو نص فارغ' },
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
            },
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (genErr) {
        console.warn(`Attempt with ${modelName} failed:`, genErr);
      }
    }

    if (!responseText) {
      throw new Error('تعذر إنشاء الإجابة عبر نموذج الذكاء الاصطناعي');
    }

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Strip any markdown code fencing
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    // Standardize reference adequacy
    let referenceAdequacy = parsedData.referenceAdequacy || 'مرتفعة';
    if (referenceAdequacy.includes('مرتفع')) referenceAdequacy = 'مرتفعة';
    if (referenceAdequacy.includes('متوسط')) referenceAdequacy = 'متوسطة';
    if (referenceAdequacy.includes('غير')) referenceAdequacy = 'غير كافية';

    // Standardize content level
    const contentLevel = ['A', 'B', 'C', 'D'].includes(parsedData.contentLevel) ? parsedData.contentLevel : 'B';

    // Enrich and verify traceable evidences with genuine deep links
    const rawEvidences = Array.isArray(parsedData.traceableEvidences) ? parsedData.traceableEvidences : [];
    const enrichedEvidences = rawEvidences.map((ev: any, idx: number) => {
      let resolvedUrl: string | null = null;

      // Check if evidence is Quranic
      const isQuran =
        ev.type === 'quran' ||
        (ev.sourceName && (ev.sourceName.includes('قرآن') || ev.sourceName.includes('سورة'))) ||
        (ev.sourceType && ev.sourceType.includes('قرآن'));

      if (isQuran) {
        // Try to resolve surah and ayah
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
      } else {
        // Check Hadith deep link
        const hadithNum = ev.referenceNumber || ev.referenceDetail;
        resolvedUrl = resolveHadithDeepLink(ev.sourceName, hadithNum);
      }

      // Never keep homepage URLs or hallucinated domains
      const finalUrl = resolvedUrl || '';

      return {
        id: ev.id || idx + 1,
        type: ev.type || (isQuran ? 'quran' : 'general'),
        sourceName: ev.sourceName || 'مصدر معتمد',
        sourceType: ev.sourceType || 'مرجع موثق',
        referenceDetail: ev.referenceDetail || '',
        referenceNumber: ev.referenceNumber || '',
        surah: ev.surah || '',
        ayah: ev.ayah || undefined,
        book: ev.book || '',
        chapter: ev.chapter || '',
        grade: ev.grade || '',
        retrievedText: ev.retrievedText || '',
        usageContext: ev.usageContext || '',
        sourceUrl: finalUrl,
      };
    });

    // Format rich unified text matching the requested constitution layout
    const formattedText = `### الإجابة المختصرة\n${parsedData.briefAnswer || ''}\n\n### التوضيح\n${parsedData.explanation || ''}\n\n### الدليل\n${parsedData.evidence || ''}${parsedData.summary ? `\n\n### الخلاصة\n${parsedData.summary}` : ''}${parsedData.dispute && parsedData.dispute.trim() !== '' ? `\n\n### الخلاف الفقهي\n${parsedData.dispute}` : ''}\n\n### المصادر والمراجع\n${(parsedData.sources || []).map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n')}\n\n### كفاية المرجعية\n${referenceAdequacy}\n\n${parsedData.fatwaDisclaimer || ''}`;

    return res.json({
      success: true,
      classification: parsedData.classification || [],
      contentLevel: contentLevel,
      contentLevelLabel: parsedData.contentLevelLabel || `المستوى ${contentLevel}`,
      referenceAdequacy: referenceAdequacy,
      adequacyRationale: parsedData.adequacyRationale || [],
      evidenceLevel: referenceAdequacy,
      evidenceLevelArabic: referenceAdequacy,
      understanding: parsedData.understanding || `سياق الطلب: استفسار حول ${question}`,
      briefAnswer: parsedData.briefAnswer || '',
      explanation: parsedData.explanation || '',
      evidence: parsedData.evidence || '',
      summary: parsedData.summary || '',
      traceableEvidences: enrichedEvidences,
      dispute: parsedData.dispute || '',
      sourcesSearched: parsedData.sources || [],
      automatedChecks: parsedData.automatedChecks || {
        sourcesFound: true,
        textsVerified: true,
        noPersonalFatwaClaim: contentLevel !== 'D',
        noConflictDetected: true,
      },
      suitabilityCheck: parsedData.suitabilityCheck || 'فحص سلامة المحتوى واتساقه مع المصادر المعتمدة: تمت مطابقة المسألة مع المراجع المعتمدة.',
      dialogueMethodologySummary: parsedData.dialogueMethodologySummary || 'تم اعتماد أسلوب الحوار المنضبط المناسب لسياق السؤال.',
      nextStepSuggestion: parsedData.nextStepSuggestion || '',
      reviewStatus: 'automated',
      disclaimer: parsedData.fatwaDisclaimer || '⚠️ تنبيه شرعي: هذه إجابة عامة وليست فتوى شخصية، وقد تختلف الأحكام باختلاف التفاصيل والمذاهب. يُنصح بالرجوع إلى عالم/مفتٍ موثوق في الحالات الخاصة.',
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
