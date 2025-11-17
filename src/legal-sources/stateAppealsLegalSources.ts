/**
 * Références juridiques pour les recours contre l'État
 * Sources officielles des procédures de recours administratifs et juridictionnels
 */

import { LegalReference, BenefitLegalFramework, LegislationType } from './belgianLegalSources';

/**
 * CONSEIL D'ÉTAT - Cadre juridique
 */
export const CONSEIL_ETAT_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Recours au Conseil d\'État',

  primaryLegislation: {
    type: 'loi',
    title: 'Lois sur le Conseil d\'État, coordonnées le 12 janvier 1973',
    date: '1973-01-12',
    publication: {
      date: '1973-03-21',
      reference: 'Moniteur Belge 1973-03-21'
    },
    articles: ['14', '17', '19', '21', '24', '30'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1973011201',
    lastAmended: '2024',
    authority: 'Conseil d\'État'
  },

  implementingLegislation: [
    {
      type: 'arrete_royal',
      title: 'Arrêté du Régent déterminant la procédure devant la section du contentieux administratif du Conseil d\'État',
      date: '1946-07-23',
      publication: {
        date: '1946-08-03',
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1946072301',
      authority: 'Conseil d\'État'
    },
    {
      type: 'arrete_royal',
      title: 'Arrêté royal fixant le droit de timbre et les frais de procédure devant le Conseil d\'État',
      date: '1991-12-05',
      publication: {
        date: '1991-12-21',
      },
      articles: ['1', '2', '3'],
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991120530',
      authority: 'Conseil d\'État'
    },
    {
      type: 'arrete_royal',
      title: 'Arrêté royal relatif au greffe électronique du Conseil d\'État',
      date: '2014-01-28',
      publication: {
        date: '2014-02-03',
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2014012803',
      authority: 'Conseil d\'État'
    }
  ],

  notes: [
    'Délai de recours: 60 jours à partir de la notification ou publication',
    'Droit de timbre: 200€ pour annulation/suspension, 400€ pour extrême urgence',
    'Intérêt à agir requis: personnel, direct, certain et actuel',
    'Assistance d\'un avocat non obligatoire sauf cassation administrative'
  ]
};

/**
 * RECOURS FISCAUX - Cadre juridique
 */
export const TAX_APPEAL_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Recours en matière fiscale',

  primaryLegislation: {
    type: 'code',
    title: 'Code des impôts sur les revenus 1992 (CIR 92)',
    date: '1992-04-10',
    publication: {
      date: '1992-07-30',
    },
    articles: ['366', '367', '375', '376', '377', '378', '379'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1992041030',
    lastAmended: '2024',
    authority: 'Service Public Fédéral Finances'
  },

  implementingLegislation: [
    {
      type: 'arrete_royal',
      title: 'AR/CIR 92 - Arrêté royal d\'exécution du Code des impôts sur les revenus 1992',
      date: '1993-02-27',
      publication: {
        date: '1993-03-31',
      },
      articles: ['209', '210', '211', '212'],
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1993022750',
      authority: 'Service Public Fédéral Finances'
    },
    {
      type: 'loi',
      title: 'Loi créant un Service de conciliation fiscale',
      date: '2018-07-15',
      publication: {
        date: '2018-07-20',
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2018071503',
      authority: 'Service de conciliation fiscale'
    }
  ],

  notes: [
    'Réclamation obligatoire dans les 6 mois de l\'avertissement-extrait de rôle',
    'Recours judiciaire dans les 3 mois de la décision sur réclamation',
    'Surséance au recouvrement possible sur demande motivée',
    'Conciliation fiscale gratuite et confidentielle'
  ]
};

/**
 * MÉDIATEURS - Cadre juridique
 */
export const OMBUDSMAN_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Services de médiation institutionnelle',

  primaryLegislation: {
    type: 'loi',
    title: 'Loi instaurant des médiateurs fédéraux',
    date: '1995-03-22',
    publication: {
      date: '1995-04-07',
    },
    articles: ['1', '8', '9', '14', '15', '16'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1995032230',
    lastAmended: '2020',
    authority: 'Médiateur fédéral'
  },

  implementingLegislation: [
    {
      type: 'decret',
      title: 'Décret instituant un Médiateur de la Wallonie et de la Fédération Wallonie-Bruxelles',
      date: '1994-06-22',
      publication: {
        date: '1994-09-22',
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994062235',
      authority: 'Parlement wallon'
    },
    {
      type: 'ordonnance',
      title: 'Ordonnance créant le médiateur bruxellois',
      date: '2022-03-17',
      publication: {
        date: '2022-05-16',
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2022031702',
      authority: 'Parlement de la Région de Bruxelles-Capitale'
    }
  ],

  notes: [
    'Service gratuit et confidentiel',
    'Contact préalable avec l\'administration requis',
    'Pas de compétence si procédure judiciaire en cours',
    'Recommandations non contraignantes mais publiées'
  ]
};

/**
 * PUBLICITÉ DE L'ADMINISTRATION - Cadre juridique
 */
export const ACCESS_TO_DOCUMENTS_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Accès aux documents administratifs',

  primaryLegislation: {
    type: 'loi',
    title: 'Loi relative à la publicité de l\'administration',
    date: '1994-04-11',
    publication: {
      date: '1994-06-30',
    },
    articles: ['1', '4', '6', '8', '9'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994041151',
    lastAmended: '2022',
    authority: 'Commission d\'accès aux documents administratifs'
  },

  implementingLegislation: [
    {
      type: 'arrete_royal',
      title: 'Arrêté royal relatif à la Commission d\'accès aux documents administratifs',
      date: '1994-06-29',
      publication: {
        date: '1994-07-14',
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994062935',
      authority: 'Commission d\'accès aux documents administratifs'
    }
  ],

  notes: [
    'Délai de réponse: 30 jours',
    'Recours à la Commission en cas de refus ou silence',
    'Exceptions: vie privée, sécurité, documents préparatoires',
    'Consultation gratuite, copies payantes'
  ]
};

/**
 * RECOURS ADMINISTRATIFS - Cadre juridique général
 */
export const ADMINISTRATIVE_APPEAL_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Recours administratifs généraux',

  primaryLegislation: {
    type: 'loi',
    title: 'Loi relative à la motivation formelle des actes administratifs',
    date: '1991-07-29',
    publication: {
      date: '1991-09-12',
    },
    articles: ['1', '2', '3', '4'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991072950',
    lastAmended: '2014',
    authority: 'Service Public Fédéral Justice'
  },

  implementingLegislation: [
    {
      type: 'loi',
      title: 'Charte de l\'utilisateur des services publics',
      date: '1992-12-04',
      publication: {
        date: '1993-01-22',
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1992120432',
      authority: 'Service Public Fédéral Personnel et Organisation'
    }
  ],

  notes: [
    'Tout acte administratif individuel doit être motivé',
    'Recours gracieux toujours possible (pas de délai strict)',
    'Recours hiérarchique si supérieur existe',
    'Silence de 4 mois vaut décision implicite de rejet'
  ]
};

/**
 * CPAS ET TRIBUNAUX DU TRAVAIL - Cadre juridique
 */
export const SOCIAL_TRIBUNAL_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Recours devant les tribunaux du travail',

  primaryLegislation: {
    type: 'code',
    title: 'Code judiciaire',
    date: '1967-10-10',
    publication: {
      date: '1967-10-31',
    },
    articles: ['580', '581', '582', '704', '728'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1967101002',
    lastAmended: '2024',
    authority: 'Service Public Fédéral Justice'
  },

  implementingLegislation: [
    {
      type: 'loi',
      title: 'Loi organique des centres publics d\'action sociale',
      date: '1976-07-08',
      publication: {
        date: '1976-08-05',
      },
      articles: ['71', '72', '73'],
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1976070801',
      authority: 'Service Public de Programmation Intégration Sociale'
    }
  ],

  notes: [
    'Compétence exclusive pour litiges CPAS, ONEM, INAMI, etc.',
    'Délai de recours: 3 mois',
    'Procédure gratuite (pas de frais de justice)',
    'Assistance judiciaire disponible'
  ]
};

/**
 * Articles clés du Conseil d'État
 */
export const CONSEIL_ETAT_KEY_ARTICLES = {
  'Article 14': {
    title: 'Compétence d\'annulation',
    content: 'Le Conseil d\'État statue par voie d\'arrêts sur les recours en annulation pour violation des formes soit substantielles, soit prescrites à peine de nullité, excès ou détournement de pouvoir.',
    conditions: [
      'Acte administratif unilatéral',
      'Intérêt personnel et direct',
      'Délai de 60 jours',
      'Moyens d\'annulation fondés'
    ]
  },

  'Article 17': {
    title: 'Demande de suspension',
    content: 'La section du contentieux administratif peut ordonner la suspension de l\'exécution de l\'acte.',
    conditions: [
      'Moyens sérieux',
      'Préjudice grave difficilement réparable',
      'Urgence'
    ]
  },

  'Article 19': {
    title: 'Intérêt à agir',
    content: 'Le requérant doit justifier d\'un intérêt.',
    requirements: [
      'Intérêt personnel',
      'Intérêt direct',
      'Intérêt certain',
      'Intérêt actuel et légitime'
    ]
  },

  'Article 21': {
    title: 'Délais de recours',
    content: 'Les délais de recours continuent à courir contre celui qui a laissé passer le délai.',
    specificDelays: {
      annulation: '60 jours',
      suspension: '60 jours (simultané avec annulation)',
      extremeUrgence: '5 jours ouvrables',
      cassation: '30 jours',
      revision: '30 jours'
    }
  },

  'Article 30': {
    title: 'Procédure d\'extrême urgence',
    content: 'En cas d\'extrême urgence, la suspension de l\'exécution d\'un acte ou d\'un règlement peut être ordonnée à titre provisoire.',
    procedure: [
      'Requête motivant l\'extrême urgence',
      'Convocation dans les 3 jours',
      'Audience dans les 48 heures',
      'Arrêt dans les 5 jours'
    ]
  }
};

/**
 * Articles clés des recours fiscaux
 */
export const TAX_APPEAL_KEY_ARTICLES = {
  'Article 366 CIR': {
    title: 'Réclamation administrative',
    content: 'Le redevable peut introduire une réclamation contre le montant de l\'imposition établie à sa charge.',
    deadline: '6 mois à partir de la date d\'envoi de l\'avertissement-extrait de rôle'
  },

  'Article 375 CIR': {
    title: 'Décision du directeur',
    content: 'Le directeur régional statue par décision motivée.',
    timeframe: '6 mois (prolongeable de 3 mois)'
  },

  'Article 377 CIR': {
    title: 'Recours judiciaire',
    content: 'Le redevable peut intenter un recours devant le tribunal de première instance.',
    deadline: '3 mois à partir de la notification de la décision'
  },

  'Article 379 CIR': {
    title: 'Appel',
    content: 'L\'appel peut être interjeté contre le jugement du tribunal de première instance.',
    deadline: '1 mois à partir de la signification du jugement'
  }
};

/**
 * Grilles de référence pour les délais
 */
export const APPEAL_DEADLINES_REFERENCE = {
  administrative: {
    'recours-gracieux': 'Pas de délai strict (délai raisonnable)',
    'recours-hierarchique': '30 à 60 jours selon la matière',
    'recours-tutelle': '40 jours',
    'silence-administration': '4 mois pour décision implicite'
  },

  conseilEtat: {
    'annulation': '60 jours',
    'suspension': '60 jours (avec annulation)',
    'extreme-urgence': '5 jours ouvrables',
    'cassation-administrative': '30 jours',
    'revision': '30 jours',
    'tierce-opposition': '60 jours'
  },

  fiscal: {
    'reclamation': '6 mois (avertissement-extrait)',
    'tribunal': '3 mois (décision directeur)',
    'appel': '1 mois (jugement)',
    'cassation': '3 mois (arrêt)'
  },

  social: {
    'cpas': '3 mois',
    'onem': '3 mois',
    'inami': '3 mois',
    'tribunal-travail': '3 mois'
  },

  urbanisme: {
    'permis-urbanisme': '30 jours',
    'permis-environnement': '20 jours',
    'permis-unique': '30 jours'
  }
};

/**
 * Export all legal frameworks
 */
export const STATE_APPEALS_LEGAL_SOURCES = {
  conseilEtat: CONSEIL_ETAT_LEGAL_FRAMEWORK,
  taxAppeals: TAX_APPEAL_LEGAL_FRAMEWORK,
  ombudsman: OMBUDSMAN_LEGAL_FRAMEWORK,
  accessDocuments: ACCESS_TO_DOCUMENTS_LEGAL_FRAMEWORK,
  administrativeAppeal: ADMINISTRATIVE_APPEAL_LEGAL_FRAMEWORK,
  socialTribunal: SOCIAL_TRIBUNAL_LEGAL_FRAMEWORK,
  keyArticles: {
    conseilEtat: CONSEIL_ETAT_KEY_ARTICLES,
    tax: TAX_APPEAL_KEY_ARTICLES
  },
  deadlines: APPEAL_DEADLINES_REFERENCE
};