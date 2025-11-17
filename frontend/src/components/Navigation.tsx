import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const Navigation: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('paa-language', lng);
  };

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">{t('header.title')}</h1>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative group">
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label={t('navigation.language')}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{currentLanguage.flag} {currentLanguage.code.toUpperCase()}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Language Dropdown */}
              <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-popover border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex items-center w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                        i18n.language === lang.code ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      <span className="mr-3">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;