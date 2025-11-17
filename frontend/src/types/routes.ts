// Route parameter types
export interface RouteParams {
  id?: string;
}

// Available routes in the application
export type AppRoutes =
  | '/'
  | '/workflows/:id'
  | '/comparison'
  | '/benefits'
  | '/wizard'
  | '/developer';

// User roles for navigation
export type UserRole = 'citizen' | 'social-worker' | 'developer';

// Language options
export type Language = 'fr' | 'nl' | 'en';

// Route metadata for page titles and breadcrumbs
export interface RouteMetadata {
  title: {
    fr: string;
    nl: string;
    en: string;
  };
  description?: {
    fr: string;
    nl: string;
    en: string;
  };
  breadcrumb: {
    fr: string;
    nl: string;
    en: string;
  };
}

// Route configuration map
export const routeConfig: Record<string, RouteMetadata> = {
  '/': {
    title: {
      fr: 'Accueil - PAA',
      nl: 'Home - PAA',
      en: 'Home - PAA'
    },
    description: {
      fr: 'Plateforme d\'Aide Administrative - Simplifier l\'accès aux services sociaux',
      nl: 'Platform voor Administratieve Hulp - Toegang tot sociale diensten vereenvoudigen',
      en: 'Administrative Assistance Platform - Simplifying access to social services'
    },
    breadcrumb: {
      fr: 'Accueil',
      nl: 'Home',
      en: 'Home'
    }
  },
  '/workflows': {
    title: {
      fr: 'Workflows - PAA',
      nl: 'Workflows - PAA',
      en: 'Workflows - PAA'
    },
    breadcrumb: {
      fr: 'Workflows',
      nl: 'Workflows',
      en: 'Workflows'
    }
  },
  '/comparison': {
    title: {
      fr: 'Comparaison - PAA',
      nl: 'Vergelijking - PAA',
      en: 'Comparison - PAA'
    },
    breadcrumb: {
      fr: 'Outil de comparaison',
      nl: 'Vergelijkingstool',
      en: 'Comparison Tool'
    }
  },
  '/benefits': {
    title: {
      fr: 'Guide des prestations - PAA',
      nl: 'Uitkeringengids - PAA',
      en: 'Benefits Guide - PAA'
    },
    breadcrumb: {
      fr: 'Guide des prestations',
      nl: 'Uitkeringengids',
      en: 'Benefits Guide'
    }
  },
  '/wizard': {
    title: {
      fr: 'Assistant - PAA',
      nl: 'Wizard - PAA',
      en: 'Wizard - PAA'
    },
    breadcrumb: {
      fr: 'Assistant de workflow',
      nl: 'Workflow wizard',
      en: 'Workflow Wizard'
    }
  },
  '/developer': {
    title: {
      fr: 'Documentation développeur - PAA',
      nl: 'Ontwikkelaarsdocumentatie - PAA',
      en: 'Developer Documentation - PAA'
    },
    breadcrumb: {
      fr: 'Documentation développeur',
      nl: 'Ontwikkelaarsdocs',
      en: 'Developer Docs'
    }
  }
};