import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language } from '../types/routes';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (translations: Record<Language, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage for saved language preference
    const saved = localStorage.getItem('paa-language');
    if (saved && ['fr', 'nl', 'en'].includes(saved)) {
      return saved as Language;
    }
    // Default to French as it's the primary language for Wallonia
    return 'fr';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('paa-language', language);
    // Update document language attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  const t = (translations: Record<Language, string>): string => {
    return translations[language] || translations['fr'];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}