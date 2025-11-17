import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';

export function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
      <div className="text-center space-y-6 max-w-2xl">
        {/* 404 Error Code */}
        <div className="relative">
          <h1 className="text-[150px] font-bold text-muted-foreground/20 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-20 w-20 text-muted-foreground/50" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">
            {t({
              fr: 'Page introuvable',
              nl: 'Pagina niet gevonden',
              en: 'Page not found'
            })}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t({
              fr: 'Désolé, la page que vous recherchez n\'existe pas ou a été déplacée.',
              nl: 'Sorry, de pagina die u zoekt bestaat niet of is verplaatst.',
              en: 'Sorry, the page you are looking for does not exist or has been moved.'
            })}
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-muted/30 rounded-lg p-6 text-left">
          <h3 className="font-semibold mb-3">
            {t({
              fr: 'Suggestions :',
              nl: 'Suggesties:',
              en: 'Suggestions:'
            })}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              {t({
                fr: 'Vérifiez l\'URL pour d\'éventuelles erreurs de frappe',
                nl: 'Controleer de URL op eventuele typefouten',
                en: 'Check the URL for any typos'
              })}
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              {t({
                fr: 'Retournez à la page d\'accueil et naviguez à partir de là',
                nl: 'Ga terug naar de homepage en navigeer vanaf daar',
                en: 'Return to the homepage and navigate from there'
              })}
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              {t({
                fr: 'Utilisez le menu de navigation pour trouver ce que vous cherchez',
                nl: 'Gebruik het navigatiemenu om te vinden wat u zoekt',
                en: 'Use the navigation menu to find what you\'re looking for'
              })}
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="default"
            asChild
            className="min-w-[150px]"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              {t({
                fr: 'Accueil',
                nl: 'Naar huis',
                en: 'Go Home'
              })}
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="min-w-[150px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t({
              fr: 'Retour',
              nl: 'Terug',
              en: 'Go Back'
            })}
          </Button>
        </div>
      </div>
    </div>
  );
}