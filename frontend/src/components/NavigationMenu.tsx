import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileCode, Home, GitCompare, Heart, Wand2, Code, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../contexts/UserRoleContext';
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

export function NavigationMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const { role } = useUserRole();
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

  const getLabel = (label: { fr: string; nl: string; en: string }) => {
    const lang = i18n.language as 'fr' | 'nl' | 'en';
    return label[lang] || label.en;
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 py-2">
          {filteredNavigation.map((item) => (
            <div key={item.path} className="relative">
              {item.children ? (
                <div className="relative group">
                  <button
                    className={cn(
                      'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                      isActive(item.path) && 'bg-accent text-accent-foreground'
                    )}
                    onMouseEnter={() => setExpandedItem(item.path)}
                    onMouseLeave={() => setExpandedItem(null)}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {getLabel(item.label)}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </button>

                  {/* Dropdown Menu */}
                  {expandedItem === item.path && (
                    <div
                      className="absolute left-0 mt-1 w-64 rounded-md shadow-lg bg-popover border z-50"
                      onMouseEnter={() => setExpandedItem(item.path)}
                      onMouseLeave={() => setExpandedItem(null)}
                    >
                      <div className="py-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={cn(
                              'block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                              isActive(child.path) && 'bg-accent text-accent-foreground'
                            )}
                          >
                            {getLabel(child.label)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive(item.path) && 'bg-accent text-accent-foreground'
                  )}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {getLabel(item.label)}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center justify-between py-2">
          <span className="text-sm font-medium">{t('navigation.menu')}</span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-1">
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
                    {getLabel(item.label)}
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
                          {getLabel(child.label)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}