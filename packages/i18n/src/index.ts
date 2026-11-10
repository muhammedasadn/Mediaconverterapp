export * from './translations';

export function getTranslation(lang: string, key: string): string {
  const translations = (TRANSLATIONS as any)[lang] || TRANSLATIONS.en;
  return translations[key] || TRANSLATIONS.en[key] || key;
}
