import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { routeConfig } from '../types/routes';

export function PageMeta() {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    // Get the route config for the current path
    const path = location.pathname;
    const routeKey = path === '/' ? '/' :
      path.split('/').slice(0, 2).join('/'); // Get the base route (e.g., /workflows from /workflows/123)

    const config = routeConfig[routeKey];

    if (config) {
      // Update document title
      document.title = config.title[language];

      // Update meta description if available
      if (config.description) {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', config.description[language]);
      }
    } else {
      // Fallback title for unmatched routes
      document.title = 'PAA - Plateforme d\'Aide Administrative';
    }
  }, [location, language]);

  return null;
}