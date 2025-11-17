import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Globe, User, X, FileCode, Home, GitCompare, Heart, Wand2, Code } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserRole } from '../contexts/UserRoleContext';
import { Language, UserRole } from '../types/routes';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { cn } from './ui/utils';

const navigation = [
  {
    path: '/',
    label: { fr: 'Accueil', nl: 'Home', en: 'Home' },
    icon: Home,
  },
  {
    path: '/workflows',
    label: { fr: 'Workflows', nl: 'Workflows', en: 'Workflows' },
    icon: FileCode,
    children: [
      {
        path: '/workflows/conversion',
        label: { fr: 'Machine de conversion', nl: 'Conversiemachine', en: 'Conversion Machine' },
      },
      {
        path: '/workflows/ris',
        label: { fr: 'Workflow RIS', nl: 'RIS Workflow', en: 'RIS Workflow' },
      },
      {
        path: '/workflows/agr',
        label: { fr: 'Workflow AGR', nl: 'AGR Workflow', en: 'AGR Workflow' },
      },
    ],
  },
  {
    path: '/comparison',
    label: { fr: 'Comparaison', nl: 'Vergelijking', en: 'Comparison' },
    icon: GitCompare,
  },
  {
    path: '/benefits',
    label: { fr: 'Prestations', nl: 'Uitkeringen', en: 'Benefits' },
    icon: Heart,
  },
  {
    path: '/wizard',
    label: { fr: 'Assistant', nl: 'Wizard', en: 'Wizard' },
    icon: Wand2,
  },
  {
    path: '/developer',
    label: { fr: 'Documentation', nl: 'Documentatie', en: 'Documentation' },
    icon: Code,
    roleRestricted: ['developer'],
  },
];

const languages: { value: Language; label: string; flag: string }[] = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

const roles: { value: UserRole; label: Record<Language, string>; icon: string }[] = [
  {
    value: 'citizen',
    label: { fr: 'Citoyen', nl: 'Burger', en: 'Citizen' },
    icon: '👤'
  },
  {
    value: 'social-worker',
    label: { fr: 'Travailleur social', nl: 'Sociaal werker', en: 'Social Worker' },
    icon: '🏥'
  },
  {
    value: 'developer',
    label: { fr: 'Développeur', nl: 'Ontwikkelaar', en: 'Developer' },
    icon: '💻'
  },
];

export function NavigationHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { role, setRole } = useUserRole();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const filteredNavigation = navigation.filter(item => {
    if (!item.roleRestricted) return true;
    return item.roleRestricted.includes(role);
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo and Brand */}
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            PAA
          </div>
          <span className="hidden font-bold sm:inline-block">
            {t({
              fr: 'Plateforme d\'Aide Administrative',
              nl: 'Platform voor Administratieve Hulp',
              en: 'Administrative Assistance Platform'
            })}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {filteredNavigation.map((item) => (
              <NavigationMenuItem key={item.path}>
                {item.children ? (
                  <>
                    <NavigationMenuTrigger className={cn(isActive(item.path) && 'text-primary')}>
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {t(item.label)}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={child.path}
                                className={cn(
                                  'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                                  isActive(child.path) && 'bg-accent'
                                )}
                              >
                                <div className="text-sm font-medium leading-none">{t(child.label)}</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50',
                        isActive(item.path) && 'text-primary'
                      )}
                    >
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {t(item.label)}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center space-x-2">
          {/* Role Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <User className="mr-2 h-4 w-4" />
                <span className="text-sm">
                  {roles.find(r => r.value === role)?.icon} {t(roles.find(r => r.value === role)!.label)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {roles.map((r) => (
                <DropdownMenuItem
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={cn(role === r.value && 'bg-accent')}
                >
                  <span className="mr-2">{r.icon}</span>
                  {t(r.label)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Switch language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={cn(language === lang.value && 'bg-accent')}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t">
          <nav className="container px-4 py-4 space-y-2">
            {filteredNavigation.map((item) => (
              <div key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive(item.path) && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {t(item.label)}
                </Link>
                {item.children && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          'block px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                          isActive(child.path) && 'bg-accent text-accent-foreground'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t(child.label)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Role Selector */}
            <div className="pt-4 border-t">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t({ fr: 'Rôle', nl: 'Rol', en: 'Role' })}
              </p>
              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => {
                      setRole(r.value);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      'flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                      role === r.value && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <span className="mr-2">{r.icon}</span>
                    {t(r.label)}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}