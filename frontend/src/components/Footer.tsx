import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Github, Mail, FileText, Shield, Heart } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { path: '/', label: { fr: 'Accueil', nl: 'Home', en: 'Home' } },
      { path: '/benefits', label: { fr: 'Prestations', nl: 'Uitkeringen', en: 'Benefits' } },
      { path: '/workflows', label: { fr: 'Workflows', nl: 'Workflows', en: 'Workflows' } },
      { path: '/wizard', label: { fr: 'Assistant', nl: 'Wizard', en: 'Wizard' } },
    ],
    resources: [
      { path: '/developer', label: { fr: 'Documentation', nl: 'Documentatie', en: 'Documentation' } },
      { path: '/comparison', label: { fr: 'Outil de comparaison', nl: 'Vergelijkingstool', en: 'Comparison Tool' } },
      { path: '#', label: { fr: 'API', nl: 'API', en: 'API' }, external: true },
      { path: '#', label: { fr: 'GitHub', nl: 'GitHub', en: 'GitHub' }, external: true },
    ],
    legal: [
      { path: '#', label: { fr: 'Mentions légales', nl: 'Juridische informatie', en: 'Legal Notice' } },
      { path: '#', label: { fr: 'Confidentialité', nl: 'Privacy', en: 'Privacy' } },
      { path: '#', label: { fr: 'Conditions d\'utilisation', nl: 'Gebruiksvoorwaarden', en: 'Terms of Use' } },
      { path: '#', label: { fr: 'Accessibilité', nl: 'Toegankelijkheid', en: 'Accessibility' } },
    ],
  };

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                PAA
              </div>
              <span className="font-bold text-lg">PAA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t({
                fr: 'Plateforme de démonstration pour l\'encodage de la logique administrative belge.',
                nl: 'Demonstratieplatform voor het coderen van Belgische administratieve logica.',
                en: 'Demonstration platform for encoding Belgian administrative logic.'
              })}
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@paa.be"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold mb-4">
              {t({ fr: 'Plateforme', nl: 'Platform', en: 'Platform' })}
            </h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">
              {t({ fr: 'Ressources', nl: 'Bronnen', en: 'Resources' })}
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.path + link.label.en}>
                  {link.external ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(link.label)}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(link.label)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">
              {t({ fr: 'Légal', nl: 'Juridisch', en: 'Legal' })}
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path + link.label.en}>
                  <a
                    href={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.label)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>© {currentYear} PAA.</span>
              <span>{t({ fr: 'Tous droits réservés.', nl: 'Alle rechten voorbehouden.', en: 'All rights reserved.' })}</span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>{t({ fr: 'Sécurisé', nl: 'Beveiligd', en: 'Secure' })}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>{t({ fr: 'Open Source', nl: 'Open Source', en: 'Open Source' })}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{t({ fr: 'Fait avec', nl: 'Gemaakt met', en: 'Made with' })}</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>{t({ fr: 'en Belgique', nl: 'in België', en: 'in Belgium' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}