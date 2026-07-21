export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const LOCALE_STORAGE_KEY = 'orion.locale';
export const DEFAULT_LANGUAGE: Language = 'es';
