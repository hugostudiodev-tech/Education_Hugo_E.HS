// Thư viện đối tác không mang i18next: ngôn ngữ đến từ prop `lang` (config/partner.js).
export const useTranslation = () => ({ i18n: null, t: (key) => key });
