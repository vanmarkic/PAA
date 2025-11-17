import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { NavigationMenu } from './NavigationMenu';
import { Footer } from './Footer';
import { BreadcrumbNav } from './BreadcrumbNav';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routeConfig } from '../types/routes';

export function RouterLayout() {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update document title based on route
    const path = location.pathname;
    const routeKey = path === '/' ? '/' :
      path.split('/').slice(0, 2).join('/');

    const config = routeConfig[routeKey];
    const language = i18n.language as 'fr' | 'nl' | 'en';

    if (config) {
      document.title = config.title[language] || config.title['fr'];
    } else {
      document.title = 'PAA - Plateforme d\'Aide Administrative';
    }
  }, [location, i18n.language]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <NavigationMenu />
      <BreadcrumbNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}