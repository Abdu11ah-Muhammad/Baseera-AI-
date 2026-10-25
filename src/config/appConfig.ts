// Trusted Developer and Application Configuration
// Single source of truth for Baseera (بصيرة | مساعد الداعية)

export interface DeveloperConfig {
  displayName: string;
  displayNameEnglish: string;
  linkedinUrl: string;
  email: string;
  appName: string;
  appTitleArabic: string;
}

export const APP_CONFIG: DeveloperConfig = {
  displayName: 'المهندس Abdullah Muhammad',
  displayNameEnglish: 'Engineer Abdullah Muhammad',
  linkedinUrl: 'https://www.linkedin.com/in/abdu11ah-mhmd/',
  email: 'abdullahmhmd17@outlook.com',
  appName: 'Baseera',
  appTitleArabic: 'بصيرة | مساعد الداعية',
};

/**
 * Generates the official, canonical response in Arabic when a user inquires
 * about who created, developed, or is responsible for Baseera.
 * Adheres strictly to the charter: concise, professional, no religious citations attached.
 */
export function getDeveloperAnswerText(): string {
  const parts = [
    `تم تطوير بصيرة بواسطة ${APP_CONFIG.displayName}.`,
    '',
    'يمكنك التواصل مع المطوّر عبر:',
    `- LinkedIn: ${APP_CONFIG.linkedinUrl}`,
  ];

  if (APP_CONFIG.email && APP_CONFIG.email.trim() !== '') {
    parts.push(`- البريد الإلكتروني: ${APP_CONFIG.email}`);
  }

  return parts.join('\n');
}

/**
 * Canonical application identity explanation (What is Baseera / Who are you).
 */
export function getAppIdentityText(): string {
  return `أنا «بصيرة | مساعد الداعية»، مساعد ذكاء اصطناعي إسلامي متخصص ومصمم لخدمة الداعية، وطالب العلم، والمسترشد في المسائل الفقهية والمعرفية الموثقة من أمهات المصادر الإسلامية وفق منهج علمي متزن ورصين.`;
}
