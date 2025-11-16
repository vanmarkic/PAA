/**
 * Références juridiques authentiques pour les prestations sociales belges
 * Sources officielles : ejustice.just.fgov.be et etaamb.openjustice.be
 */

export type LegislationType =
  | 'loi'              // Loi / Wet
  | 'arrete_royal'     // Arrêté royal / Koninklijk besluit
  | 'arrete_ministeriel' // Arrêté ministériel
  | 'code'             // Code (civil, pénal, etc.)
  | 'ordonnance'       // Ordonnance (Bruxelles)
  | 'decret';          // Décret (régional)

export interface LegalReference {
  /** Type de législation */
  type: LegislationType;

  /** Titre complet du texte légal */
  title: string;

  /** Date de promulgation */
  date: string;

  /** Publication au Moniteur Belge */
  publication?: {
    date: string;
    reference?: string;
  };

  /** Articles pertinents */
  articles?: string[];

  /** URL officielle sur ejustice.just.fgov.be */
  officialUrl: string;

  /** URL alternative (etaamb, etc.) */
  alternativeUrls?: string[];

  /** Dernière modification connue */
  lastAmended?: string;

  /** Autorité responsable */
  authority: string;
}

export interface BenefitLegalFramework {
  /** Nom de la prestation */
  benefitName: string;

  /** Législation principale */
  primaryLegislation: LegalReference;

  /** Législations d'application (arrêtés royaux, etc.) */
  implementingLegislation?: LegalReference[];

  /** Modifications récentes */
  recentAmendments?: LegalReference[];

  /** Notes juridiques supplémentaires */
  notes?: string[];
}

/**
 * RIS - Revenu d'Intégration Sociale
 * Cadre juridique complet
 */
export const RIS_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Revenu d\'Intégration Sociale (RIS)',

  primaryLegislation: {
    type: 'loi',
    title: 'Loi concernant le droit à l\'intégration sociale',
    date: '2002-05-26',
    publication: {
      date: '2002-07-31',
      reference: 'Moniteur Belge 2002-07-31'
    },
    articles: ['3', '11', '14', '19', '22', '30'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi',
    alternativeUrls: [
      'https://etaamb.openjustice.be/fr/loi-du-26-mai-2002_n2002022559.html'
    ],
    lastAmended: '2024',
    authority: 'Service Public Fédéral Sécurité Sociale'
  },

  implementingLegislation: [
    {
      type: 'arrete_royal',
      title: 'Arrêté royal portant règlement général en matière de droit à l\'intégration sociale',
      date: '2002-07-11',
      publication: {
        date: '2002-07-31',
        reference: 'Moniteur Belge 2002-07-31'
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&table_name=loi&cn=2002071138',
      alternativeUrls: [
        'https://etaamb.openjustice.be/fr/arrete-royal-du-11-juillet-2002_n2002022564.html'
      ],
      authority: 'Service Public Fédéral Sécurité Sociale'
    }
  ],

  notes: [
    'Cette loi a remplacé la loi du 7 août 1974 instituant le droit au minimum de moyens d\'existence (minimex)',
    'Les montants sont indexés annuellement selon la loi du 2 août 1971',
    'Le RIS est géré par les Centres Publics d\'Action Sociale (CPAS)'
  ]
};

/**
 * Détails des articles clés de la loi RIS
 */
export const RIS_KEY_ARTICLES = {
  'Article 3': {
    title: 'Conditions d\'octroi du droit à l\'intégration sociale',
    content: 'Conditions cumulatives',
    conditions: [
      'Résidence effective en Belgique',
      'Majorité (18 ans) ou assimilation à personne majeure',
      'Nationalité belge OU statut de résident européen (après 3 mois) OU inscription au registre des étrangers OU statut d\'apatride OU réfugié OU protection subsidiaire',
      'Absence de ressources suffisantes',
      'Disposition à travailler (sauf raisons de santé ou d\'équité)',
      'Épuisement des droits sociaux belges et étrangers'
    ]
  },

  'Article 14': {
    title: 'Montants du revenu d\'intégration',
    paragraph1: {
      title: 'Catégories et montants de base (2002)',
      categories: {
        cohabitant: {
          amount: 4400,
          currency: 'EUR',
          description: 'Personnes vivant sous le même toit et réglant principalement en commun leurs questions ménagères'
        },
        isolated: {
          amount: 6600,
          currency: 'EUR',
          description: 'Personne sans cohabitants, y compris sans-abris bénéficiant d\'un projet individualisé'
        },
        familyCharge: {
          amount: 8800,
          currency: 'EUR',
          description: 'Au moins un enfant mineur non marié, ou conjoint/partenaire de vie avec tel enfant'
        }
      },
      indexation: 'Montants indexés annuellement selon la loi du 2 août 1971'
    }
  },

  'Article 11': {
    title: 'Projet Individualisé d\'Intégration Sociale (PIIS)',
    requirements: [
      'Contrat écrit conclu entre bénéficiaire et CPAS',
      'Doit respecter une juste proportionnalité entre exigences formulées et aide octroyée',
      'Obligatoire dans certains cas définis par la loi'
    ]
  },

  'Article 19': {
    title: 'Obligations de collaboration',
    content: 'Le demandeur doit fournir tous renseignements et autorisations nécessaires pour l\'examen de son droit'
  },

  'Article 22': {
    title: 'Obligations déclaratives',
    content: 'Déclaration immédiate de tout changement de situation susceptible d\'influencer le droit à l\'intégration sociale'
  },

  'Article 30': {
    title: 'Sanctions pour non-respect des obligations',
    sanctions: {
      omissionDeclaration: {
        duration: '6 mois maximum (12 mois en cas de fraude)',
        condition: 'Omission de déclaration de ressources'
      },
      nonRespectPIIS: {
        duration: '1 mois maximum (3 mois en cas de récidive)',
        condition: 'Non-respect du PIIS'
      }
    }
  }
};

/**
 * Montants RIS actuels (2024)
 * Source: Indexation annuelle selon la loi du 2 août 1971
 */
export const RIS_AMOUNTS_2024 = {
  cohabitant: {
    monthly: 713.66,
    annual: 8563.92,
    category: 'Personne cohabitante'
  },
  isolated: {
    monthly: 1070.49,
    annual: 12845.88,
    category: 'Personne isolée'
  },
  familyCharge: {
    monthly: 1450.52,
    annual: 17406.24,
    category: 'Personne avec famille à charge'
  },
  workIncomeExemption: {
    monthly: 252.00,
    description: 'Exemption pour revenus du travail (environ 63% du revenu professionnel)',
    legalBasis: 'Article 17 de l\'arrêté royal du 11 juillet 2002'
  },
  patrimonyLimits: {
    movable: {
      amount: 6200,
      description: 'Patrimoine mobilier maximum (épargne, valeurs mobilières)'
    },
    immovable: {
      amount: 12500,
      description: 'Patrimoine immobilier habité maximum (valeur cadastrale)'
    }
  },
  indexationDate: '2024-01-01',
  source: 'SPF Sécurité Sociale - Indexation selon loi du 2 août 1971'
};

/**
 * AGR - Allocation de Garantie de Revenus
 * Cadre juridique complet
 */
export const AGR_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Allocation de Garantie de Revenus (AGR)',

  primaryLegislation: {
    type: 'arrete_royal',
    title: 'Arrêté royal portant réglementation du chômage',
    date: '1991-11-25',
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550&table_name=loi',
    alternativeUrls: [
      'https://etaamb.openjustice.be/fr/arrete-royal-du-25-novembre-1991_n2019012364',
      'https://www.ejustice.just.fgov.be/img_l/pdf/1991/11/25/1991013192_F.pdf'
    ],
    articles: ['28', '29', '33', '131bis'],
    lastAmended: '2024-09',
    authority: 'Office National de l\'Emploi (ONEM)'
  },

  notes: [
    'L\'AGR est une allocation versée par l\'ONEM en complément d\'un salaire à temps partiel',
    'L\'AGR garantit que le total (salaire + allocation) équivaut au moins aux allocations de chômage',
    'Décret modifié de nombreuses fois depuis 1991 pour s\'adapter aux évolutions du marché du travail',
    'Nouveau régime de calcul introduit le 01.07.2005'
  ]
};

/**
 * Détails des articles clés de l'arrêté royal sur le chômage (AGR)
 */
export const AGR_KEY_ARTICLES = {
  'Article 28': {
    title: 'Travailleurs assimilés aux travailleurs à temps plein',
    content: 'Définit les travailleurs assimilés sur base des seuils de rémunération'
  },

  'Article 29': {
    title: 'Travailleur à temps partiel avec maintien des droits (TPMD)',
    content: 'Définit les conditions pour les travailleurs à temps partiel avec maintien des droits au chômage'
  },

  'Article 33': {
    title: 'Admission des travailleurs à temps partiel volontaires',
    content: 'Établit les conditions pour les travailleurs volontaires à temps partiel'
  },

  'Article 131bis': {
    title: 'Allocation de garantie de revenus',
    content: 'Formule de calcul et conditions d\'octroi de l\'AGR',
    formula: 'AGR = Allocation de référence + Supplément horaire mensuel − Rémunération nette'
  }
};

/**
 * Conditions et calculs AGR (2025)
 * Source: ONEM - Mise à jour 01.02.2025
 */
export const AGR_CONDITIONS_2025 = {
  salaryThreshold: {
    grossMonthly: 2111.89,
    currency: 'EUR',
    description: 'Rémunération brute mensuelle maximale pour être éligible'
  },

  workingTimeLimit: {
    fraction: 4/5,
    description: 'L\'horaire de travail ne peut dépasser 4/5 d\'un emploi à temps plein'
  },

  calculation: {
    formula: 'AGR = Allocation de référence + Supplément horaire mensuel − Rémunération nette',

    referenceAllowance: {
      calculation: '26 × allocation journalière théorique nette (chômage complet)',
      description: 'Montant que le travailleur recevrait au chômage complet'
    },

    hourlySupplement: {
      formula: '(Heures travaillées − Seuil 1/3 temps) × 4.02 EUR',
      threshold: {
        hours: 55,
        description: 'Heures par mois pour un régime de 38h/semaine (1/3 temps plein)'
      },
      rate: 4.02,
      currency: 'EUR'
    },

    netSalary: {
      calculation: 'Rémunération brute − Cotisations ONSS (13.07%) + Bonus ONSS − Précompte professionnel',
      onssRate: 0.1307
    }
  },

  minimumAmount: {
    amount: 14.35,
    currency: 'EUR',
    description: 'Montant minimum de l\'AGR, en dessous l\'allocation est nulle'
  },

  maximumAmount: {
    description: 'Ne peut excéder (rémunération nette fictive temps plein − rémunération nette temps partiel)'
  },

  registration: {
    forms: ['C131A', 'C3'],
    deadline: '2 mois',
    authority: 'Organisme de paiement + Office régional de l\'emploi'
  },

  exclusions: [
    'Pas d\'AGR si revenus d\'employeur précédent subsistent',
    'Passage involontaire temps plein → partiel : période de carence de 3 mois',
    'Passage volontaire temps plein → partiel : pas d\'AGR (sauf restructuration)'
  ],

  lastUpdate: '2025-02-01',
  source: 'ONEM - Office National de l\'Emploi'
};

/**
 * ALLOCATIONS FAMILIALES - Région de Bruxelles-Capitale
 * Cadre juridique complet
 */
export const FAMILY_ALLOWANCES_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Allocations Familiales (Région de Bruxelles-Capitale)',

  primaryLegislation: {
    type: 'ordonnance',
    title: 'Ordonnance réglant l\'octroi des prestations familiales',
    date: '2019-04-25',
    publication: {
      date: '2019-05-06',
      reference: 'Moniteur Belge 2019-05-06'
    },
    officialUrl: 'https://www.ejustice.just.fgov.be',
    authority: 'Région de Bruxelles-Capitale - Iriscare'
  },

  notes: [
    'Régionalisation des allocations familiales depuis le 1er janvier 2020',
    'La loi spéciale du 6 janvier 2014 relative à la Sixième Réforme de l\'État organise le transfert',
    'Article 23 de la Constitution garantit le droit aux allocations familiales',
    'Le critère d\'attachement principal est le domicile légal de l\'enfant'
  ]
};

/**
 * Montants des allocations familiales 2024 - Bruxelles
 */
export const FAMILY_ALLOWANCES_AMOUNTS_2024 = {
  birthAllowance: {
    firstChild: 1367.74,
    otherChildren: 621.70,
    currency: 'EUR'
  },
  monthlyAllowances: {
    age0to11: {
      bornBefore2019: 174.08,
      bornAfter2019: 186.51,
      currency: 'EUR'
    },
    age12to17: {
      bornBefore2019: 186.51,
      bornAfter2019: 198.94,
      currency: 'EUR'
    },
    age18to24NoHigherEd: {
      bornBefore2019: 186.51,
      bornAfter2019: 198.94,
      currency: 'EUR'
    },
    age18to24HigherEd: {
      bornBefore2019: 198.95,
      bornAfter2019: 211.38,
      currency: 'EUR'
    }
  },
  supplements: {
    ageSupplement: {
      min: 24.87,
      max: 99.47,
      description: 'Supplément d\'âge annuel'
    },
    socialSupplement: {
      description: 'Pour ménages à revenus limités (seuil défini)',
      note: 'Montant variable selon revenus du ménage'
    },
    orphanSupplement: {
      description: 'Supplément pour enfant orphelin'
    },
    disabilitySupplement: {
      description: 'Supplément handicap (jusqu\'à 21 ans)'
    }
  },
  conditions: {
    domicile: 'Domicilié en Région de Bruxelles-Capitale ou résidence effective',
    nationality: 'Belge ou étranger avec titre de séjour valide',
    ageRanges: {
      unconditional: '0-18 ans',
      conditional: '18-25 ans (apprenti, étudiant, stagiaire ou demandeur d\'emploi)'
    }
  },
  legalBasis: {
    ordonnance: 'Ordonnance bruxelloise du 25 avril 2019',
    effectiveDate: '2020-01-01'
  }
};

/**
 * GRAPA - Garantie de Revenus aux Personnes Âgées
 * Cadre juridique complet
 */
export const GRAPA_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Garantie de Revenus aux Personnes Âgées (GRAPA)',

  primaryLegislation: {
    type: 'loi',
    title: 'Loi instituant la garantie de revenus aux personnes âgées',
    date: '1969-05-22',
    officialUrl: 'https://www.ejustice.just.fgov.be',
    authority: 'Service Fédéral des Pensions (SFP)'
  },

  notes: [
    'La GRAPA n\'est pas une pension mais un régime d\'assistance',
    'Ne relève pas de la sécurité sociale',
    'Octroyée après examen des ressources et des pensions',
    'Montants indexés régulièrement'
  ]
};

/**
 * Montants GRAPA 2024
 */
export const GRAPA_AMOUNTS_2024 = {
  baseAmountAnnual: {
    amount: 7303.10,
    currency: 'EUR',
    effectiveDate: '2024-01-01',
    description: 'Montant annuel de base'
  },
  monthlyAmounts: {
    isolated: {
      amount: 1549.42,
      currency: 'EUR',
      effectiveDate: '2024-05-01',
      category: 'Personne isolée (montant majoré indexé)'
    },
    cohabitant: {
      amount: 1032.95,
      currency: 'EUR',
      effectiveDate: '2024-05-01',
      category: 'Personne en situation de cohabitation (montant de base indexé)'
    }
  },
  conditions: {
    age: {
      minimum: 65,
      description: 'Âge légal de la pension'
    },
    resourcesTest: {
      required: true,
      description: 'Examen des ressources et des pensions'
    },
    residency: {
      description: 'Résidence effective en Belgique'
    }
  },
  source: 'Service Fédéral des Pensions - Recueil GRAPA septembre 2024',
  officialDocument: 'https://www.sfpd.fgov.be/files/3286/receuil-grapa-septembre-2024.pdf'
};

/**
 * ALLOCATION DE LOYER - Région de Bruxelles-Capitale
 * Cadre juridique complet
 */
export const RENT_ALLOWANCE_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Allocation de Loyer (Région de Bruxelles-Capitale)',

  primaryLegislation: {
    type: 'arrete_royal',
    title: 'Arrêté du Gouvernement de la Région de Bruxelles-Capitale instituant une allocation de loyer',
    date: '2021-07-15',
    publication: {
      date: '2021-10-01',
      reference: 'Moniteur Belge 2021-10-01'
    },
    officialUrl: 'https://www.ejustice.just.fgov.be',
    alternativeUrls: [
      'https://etaamb.openjustice.be/fr/arrete-ministeriel-du-30-septembre-2021_n2021022047.html'
    ],
    authority: 'Région de Bruxelles-Capitale'
  },

  implementingLegislation: [
    {
      type: 'arrete_ministeriel',
      title: 'Arrêté ministériel portant exécution de l\'arrêté du Gouvernement de la Région de Bruxelles-Capitale du 15 juillet 2021',
      date: '2021-09-30',
      publication: {
        date: '2021-10-13',
        reference: 'Moniteur Belge 2021-10-13'
      },
      officialUrl: 'https://etaamb.openjustice.be/fr/arrete-ministeriel-du-30-septembre-2021_n2021022047.html',
      authority: 'Région de Bruxelles-Capitale'
    }
  ],

  notes: [
    'Aide financière pour locataires précaires',
    'Régionalisée - spécifique à la Région de Bruxelles-Capitale',
    'Conditions de revenus et de loyer applicables'
  ]
};

/**
 * ALLOCATION D'ATTENTE LOGEMENT - Région Wallonne
 */
export const HOUSING_WAITING_ALLOWANCE_WALLONIA = {
  benefitName: 'Allocation d\'attente logement social (Wallonie)',
  description: 'Aide financière en attendant un logement social',
  authority: 'Région Wallonne',
  officialUrl: 'https://www.wallonie.be/fr/demarches/obtenir-une-allocation-dattente-logement',
  notes: [
    'Aide pour personnes inscrites sur liste d\'attente logement social',
    'Conditions de revenus applicables',
    'Montant variable selon la composition du ménage'
  ]
};

/**
 * Correspondance entre les catégories de code et les références juridiques
 */
export const LEGAL_MAPPING = {
  RIS: {
    framework: RIS_LEGAL_FRAMEWORK,
    articles: RIS_KEY_ARTICLES,
    amounts: RIS_AMOUNTS_2024
  },
  AGR: {
    framework: AGR_LEGAL_FRAMEWORK,
    articles: AGR_KEY_ARTICLES,
    conditions: AGR_CONDITIONS_2025
  },
  FAMILY_ALLOWANCES: {
    framework: FAMILY_ALLOWANCES_LEGAL_FRAMEWORK,
    amounts: FAMILY_ALLOWANCES_AMOUNTS_2024
  },
  GRAPA: {
    framework: GRAPA_LEGAL_FRAMEWORK,
    amounts: GRAPA_AMOUNTS_2024
  },
  RENT_ALLOWANCE: {
    framework: RENT_ALLOWANCE_LEGAL_FRAMEWORK
  }
};

/**
 * URLs officielles pour consultation des textes légaux
 */
export const OFFICIAL_LEGAL_DATABASES = {
  ejustice: {
    name: 'Justel - Base de données juridique belge',
    url: 'https://www.ejustice.just.fgov.be',
    description: 'Base de données officielle du Service Public Fédéral Justice'
  },
  etaamb: {
    name: 'etaamb - Open Justice Belgium',
    url: 'https://etaamb.openjustice.be',
    description: 'Plateforme open data des actes publiés au Moniteur Belge'
  },
  onem: {
    name: 'ONEM - Office National de l\'Emploi',
    url: 'https://www.onem.be',
    description: 'Informations officielles sur les allocations de chômage et AGR'
  },
  spfSecuriteSociale: {
    name: 'SPF Sécurité Sociale',
    url: 'https://socialsecurity.belgium.be',
    description: 'Service Public Fédéral Sécurité Sociale'
  }
};
