// Node.js / Server-side verified Islamic Deep Linker

export const SURAH_NAME_TO_NUMBER: Record<string, number> = {
  'الفاتحة': 1,
  'البقرة': 2,
  'آل عمران': 3,
  'النساء': 4,
  'المائدة': 5,
  'الأنعام': 6,
  'الأعراف': 7,
  'الأنفال': 8,
  'التوبة': 9,
  'يونس': 10,
  'هود': 11,
  'يوسف': 12,
  'الرعد': 13,
  'إبراهيم': 14,
  'الحجر': 15,
  'النحل': 16,
  'الإسراء': 17,
  'الكهف': 18,
  'مريم': 19,
  'طه': 20,
  'الأنبياء': 21,
  'الحج': 22,
  'المؤمنون': 23,
  'النور': 24,
  'الفرقان': 25,
  'الشعراء': 26,
  'النمل': 27,
  'القصص': 28,
  'العنكبوت': 29,
  'الروم': 30,
  'لقمان': 31,
  'السجدة': 32,
  'الأحزاب': 33,
  'سبأ': 34,
  'فاطر': 35,
  'يس': 36,
  'الصافات': 37,
  'ص': 38,
  'الزمر': 39,
  'غافر': 40,
  'فصلت': 41,
  'الشورى': 42,
  'الزخرف': 43,
  'الدخان': 44,
  'الجاثية': 45,
  'الأحقاف': 46,
  'محمد': 47,
  'الفتح': 48,
  'الحجرات': 49,
  'ق': 50,
  'الذاريات': 51,
  'الطور': 52,
  'النجم': 53,
  'القمر': 54,
  'الرحمن': 55,
  'الواقعة': 56,
  'الحديد': 57,
  'المجادلة': 58,
  'الحشر': 59,
  'الممتحنة': 60,
  'الصف': 61,
  'الجمعة': 62,
  'المنافقون': 63,
  'التغابن': 64,
  'الطلاق': 65,
  'التحريم': 66,
  'الملك': 67,
  'القلم': 68,
  'الحاقة': 69,
  'المعارج': 70,
  'نوح': 71,
  'الجن': 72,
  'المزمل': 73,
  'المدثر': 74,
  'القيامة': 75,
  'الإنسان': 76,
  'المرسلات': 77,
  'النبأ': 78,
  'النازعات': 79,
  'عبس': 80,
  'التكوير': 81,
  'الانفطار': 82,
  'المطففين': 83,
  'الانشقاق': 84,
  'البروج': 85,
  'الطارق': 86,
  'الأعلى': 87,
  'الغاشية': 88,
  'الفجر': 89,
  'البلد': 90,
  'الشمس': 91,
  'الليل': 92,
  'الضحى': 93,
  'الشرح': 94,
  'التين': 95,
  'العلق': 96,
  'القدر': 97,
  'البينة': 98,
  'الزلزلة': 99,
  'العاديات': 100,
  'القارعة': 101,
  'التكاثر': 102,
  'العصر': 103,
  'الهمزة': 104,
  'الفيل': 105,
  'قريش': 106,
  'الماعون': 107,
  'الكوثر': 108,
  'الكافرون': 109,
  'النصر': 110,
  'المسد': 111,
  'الإخلاص': 112,
  'الفلق': 113,
  'الناس': 114,
};

export function resolveQuranDeepLink(surahName?: string, ayahNumber?: number | string): string | null {
  if (!surahName) return null;
  const cleanSurah = surahName.replace(/^سورة\s+/, '').trim();
  const surahNum = SURAH_NAME_TO_NUMBER[cleanSurah];
  const ayahNum = typeof ayahNumber === 'string' ? parseInt(ayahNumber.replace(/[^\d]/g, ''), 10) : ayahNumber;

  if (surahNum && ayahNum && ayahNum > 0) {
    // Official Quran.com verse deep link
    return `https://quran.com/${surahNum}/${ayahNum}`;
  }
  return null;
}

export function resolveHadithDeepLink(sourceName?: string, hadithNumber?: string | number): string | null {
  if (!sourceName || !hadithNumber) return null;
  const numStr = String(hadithNumber).replace(/[^\d]/g, '').trim();
  if (!numStr) return null;

  const normalizedSource = sourceName.toLowerCase();

  if (normalizedSource.includes('بخاري') || normalizedSource.includes('bukhari')) {
    return `https://sunnah.com/bukhari:${numStr}`;
  }
  if (normalizedSource.includes('مسلم') || normalizedSource.includes('muslim')) {
    return `https://sunnah.com/muslim:${numStr}`;
  }
  if (normalizedSource.includes('أبي داود') || normalizedSource.includes('ابو داود') || normalizedSource.includes('abudawud')) {
    return `https://sunnah.com/abudawud:${numStr}`;
  }
  if (normalizedSource.includes('ترمذي') || normalizedSource.includes('tirmidhi')) {
    return `https://sunnah.com/tirmidhi:${numStr}`;
  }
  if (normalizedSource.includes('نسائي') || normalizedSource.includes('nasai')) {
    return `https://sunnah.com/nasai:${numStr}`;
  }
  if (normalizedSource.includes('ابن ماجه') || normalizedSource.includes('ibn majah') || normalizedSource.includes('ibnmajah')) {
    return `https://sunnah.com/ibnmajah:${numStr}`;
  }
  if (normalizedSource.includes('رياض الصالحين') || normalizedSource.includes('riyad')) {
    return `https://sunnah.com/riyadussalihin:${numStr}`;
  }
  if (normalizedSource.includes('الأربعين النووية') || normalizedSource.includes('الأربعون النووية') || normalizedSource.includes('nawawi')) {
    return `https://sunnah.com/nawawi40:${numStr}`;
  }

  return null;
}
