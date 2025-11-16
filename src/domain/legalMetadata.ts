/**
 * Métadonnées légales pour la traçabilité et l'authenticité des données
 *
 * Ce fichier contient les structures de métadonnées pour toutes les machines,
 * incluant les dates d'extraction, versions de législation, et sources officielles.
 */

export type Region = 'fédéral' | 'wallonie' | 'flandre' | 'bruxelles';
export type AuthorityType = 'SPF' | 'ONEM' | 'ONSS' | 'SPW' | 'VDAB' | 'Actiris' | 'Moniteur Belge';

/**
 * Source légale officielle avec URL authentique
 */
export interface LegalSource {
  /** Nom de l'autorité émettrice */
  authority: string;

  /** Type d'autorité */
  authorityType: AuthorityType;

  /** Région concernée */
  region: Region;

  /** Titre du texte légal */
  title: string;

  /** Numéro de l'arrêté, loi, décret, etc. */
  referenceNumber?: string;

  /** Date de publication au Moniteur Belge */
  publicationDate: Date;

  /** Date d'entrée en vigueur */
  effectiveDate: Date;

  /** URL vers le texte officiel sur le Moniteur Belge ou site officiel */
  officialUrl: string;

  /** URL de secours (ex: sur le site du SPF) */
  backupUrl?: string;

  /** Langue du document */
  language: 'fr' | 'nl' | 'de';
}

/**
 * Version de la législation avec historique
 */
export interface LegislationVersion {
  /** Version sémantique (ex: "1.0.0") */
  version: string;

  /** Date d'extraction des données */
  extractionDate: Date;

  /** Date de dernière mise à jour de la législation */
  lastLegislativeUpdate: Date;

  /** Date de la prochaine révision prévue (indexation annuelle, etc.) */
  nextReviewDate?: Date;

  /** Sources légales utilisées */
  sources: LegalSource[];

  /** Montants et valeurs en vigueur à cette date */
  amounts?: Record<string, number>;

  /** Notes sur les changements par rapport à la version précédente */
  changeLog?: string;

  /** Statut de la version */
  status: 'active' | 'deprecated' | 'upcoming';
}

/**
 * Métadonnées complètes d'une machine
 */
export interface MachineLegalMetadata {
  /** ID unique de la machine */
  machineId: string;

  /** Nom complet en français */
  nameFr: string;

  /** Nom complet en néerlandais */
  nameNl?: string;

  /** Catégorie de droit */
  category: 'social-benefits' | 'fiscal-rights' | 'social-services' | 'employment-rights';

  /** Version actuelle de la législation */
  currentVersion: LegislationVersion;

  /** Historique des versions */
  versionHistory: LegislationVersion[];

  /** Contact pour questions (email du service compétent) */
  contactEmail?: string;

  /** Numéro de téléphone du service compétent */
  contactPhone?: string;

  /** Dernière validation par un expert juridique */
  lastLegalValidation?: {
    date: Date;
    validatorName: string;
    validatorRole: string;
  };
}

// ============================================================================
// SOURCES OFFICIELLES BELGES
// ============================================================================

/**
 * URLs des sources officielles belges pour les droits sociaux et fiscaux
 */
export const OFFICIAL_SOURCES = {
  // Moniteur Belge
  MONITEUR_BELGE: 'https://www.ejustice.just.fgov.be/cgi/welcome.pl',

  // SPF Sécurité Sociale
  SPF_SECURITE_SOCIALE: 'https://socialsecurity.belgium.be',
  SPF_SECURITE_SOCIALE_GRAPA: 'https://www.socialsecurity.belgium.be/fr/tout-sur-les-pensions/grapa',

  // SPF Finances
  SPF_FINANCES: 'https://finances.belgium.be',
  SPF_FINANCES_AVANTAGES: 'https://finances.belgium.be/fr/particuliers',

  // SPF Emploi
  SPF_EMPLOI: 'https://emploi.belgique.be',

  // ONEM (Office National de l'Emploi)
  ONEM: 'https://www.onem.be',
  ONEM_CHOMAGE: 'https://www.onem.be/fr/documentation/feuille-info',
  ONEM_CREDIT_TEMPS: 'https://www.onem.be/fr/documentation/feuille-info/t160',

  // ONSS (Office National de Sécurité Sociale)
  ONSS: 'https://www.onss.be',

  // SPF Santé Publique
  SPF_SANTE: 'https://www.health.belgium.be',

  // INAMI (Institut National d'Assurance Maladie-Invalidité)
  INAMI: 'https://www.inami.fgov.be',

  // SPF Intégration Sociale
  SPF_INTEGRATION_SOCIALE: 'https://www.mi-is.be',
  SPF_INTEGRATION_SOCIALE_RIS: 'https://www.mi-is.be/fr/cpas/ris',

  // Famifed (Allocations familiales)
  FAMIFED: 'https://www.famifed.be',

  // Région Wallonne
  WALLONIE_LOGEMENT: 'https://logement.wallonie.be',
  WALLONIE_EMPLOI: 'https://www.leforem.be',
  WALLONIE_ENERGIE: 'https://energie.wallonie.be',

  // Région Flamande
  FLANDRE_LOGEMENT: 'https://www.wonenvlaanderen.be',
  FLANDRE_EMPLOI: 'https://www.vdab.be',

  // Région Bruxelles-Capitale
  BRUXELLES_LOGEMENT: 'https://logement.brussels',
  BRUXELLES_EMPLOI: 'https://www.actiris.brussels',

  // Service des Pensions
  SERVICE_PENSIONS: 'https://www.sfpd.fgov.be',

  // DG Personnes handicapées
  DG_HANDICAP: 'https://handicap.belgium.be',
} as const;

// ============================================================================
// MÉTADONNÉES PAR MACHINE
// ============================================================================

/**
 * Registre central des métadonnées légales pour toutes les machines
 */
export const MACHINES_LEGAL_METADATA: Record<string, MachineLegalMetadata> = {
  // ============================================================================
  // ALLOCATIONS SOCIALES
  // ============================================================================

  allocationsChomage: {
    machineId: 'allocationsChomage',
    nameFr: 'Allocations de chômage',
    nameNl: 'Werkloosheidsuitkeringen',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'ONEM',
          authorityType: 'ONEM',
          region: 'fédéral',
          title: 'Réglementation du chômage',
          publicationDate: new Date('2023-12-15'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.onem.be/fr/documentation/feuille-info/t67',
          backupUrl: 'https://emploi.belgique.be/fr/themes/chomage',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@onem.be',
    contactPhone: '02 515 44 44',
  },

  allocationsFamiliales: {
    machineId: 'allocationsFamiliales',
    nameFr: 'Allocations familiales',
    nameNl: 'Kinderbijslag',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'FAMIFED',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Allocations familiales',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.famifed.be/fr/montants',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'contact@famifed.be',
  },

  grapa: {
    machineId: 'grapa',
    nameFr: 'Garantie de revenus aux personnes âgées (GRAPA)',
    nameNl: 'Inkomensgarantie voor ouderen (IGO)',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Sécurité Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi du 22 mars 2001 instaurant la garantie de revenus aux personnes âgées',
          referenceNumber: '2001022201',
          publicationDate: new Date('2001-04-26'),
          effectiveDate: new Date('2001-06-01'),
          officialUrl: 'https://www.ejustice.just.fgov.be/eli/loi/2001/03/22/2001022201/justel',
          backupUrl: 'https://www.socialsecurity.belgium.be/fr/tout-sur-les-pensions/grapa',
          language: 'fr',
        },
      ],
      amounts: {
        montantMaximalIsole: 1070.49, // EUR/mois au 01/01/2024
        montantMaximalMenage: 713.66, // EUR/mois au 01/01/2024
      },
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'grapa@minsoc.fed.be',
  },

  risApplication: {
    machineId: 'risApplication',
    nameFr: "Revenu d'Intégration Sociale (RIS)",
    nameNl: 'Leefloon',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Intégration Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: "Loi du 26 mai 2002 concernant le droit à l'intégration sociale",
          referenceNumber: '2002022559',
          publicationDate: new Date('2002-07-31'),
          effectiveDate: new Date('2002-10-01'),
          officialUrl: 'https://www.ejustice.just.fgov.be/eli/loi/2002/05/26/2002022559/justel',
          backupUrl: 'https://www.mi-is.be/fr/cpas/ris',
          language: 'fr',
        },
      ],
      amounts: {
        isolé: 1070.49,
        cohabitant: 713.66,
        familleMonoparentale: 1450.52,
      },
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@mi-is.be',
    contactPhone: '02 508 85 86',
  },

  pensionRetraite: {
    machineId: 'pensionRetraite',
    nameFr: 'Pension de retraite',
    nameNl: 'Rustpensioen',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'Service Fédéral des Pensions',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi sur les pensions',
          publicationDate: new Date('2023-12-20'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.sfpd.fgov.be/fr/montant-de-la-pension/calcul-pension-salarie',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@sfpd.fgov.be',
    contactPhone: '1765',
  },

  allocationHandicapes: {
    machineId: 'allocationHandicapes',
    nameFr: 'Allocation pour personnes handicapées',
    nameNl: 'Tegemoetkoming voor personen met een handicap',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'DG Personnes handicapées',
          authorityType: 'SPF',
          region: 'fédéral',
          title: "Loi du 27 février 1987 relative aux allocations aux personnes handicapées",
          referenceNumber: '1987022063',
          publicationDate: new Date('1987-04-01'),
          effectiveDate: new Date('1987-07-01'),
          officialUrl: 'https://www.ejustice.just.fgov.be/eli/loi/1987/02/27/1987022063/justel',
          backupUrl: 'https://handicap.belgium.be/fr/allocations-et-aides/allocations.htm',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'contact@handicap.belgium.be',
    contactPhone: '0800 987 99',
  },

  // ============================================================================
  // DROITS FISCAUX
  // ============================================================================

  creditImpot: {
    machineId: 'creditImpot',
    nameFr: "Crédit d'impôt",
    nameNl: 'Belastingkrediet',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Code des Impôts sur les Revenus 1992',
          referenceNumber: 'CIR92',
          publicationDate: new Date('1992-08-12'),
          effectiveDate: new Date('1992-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/avantages_fiscaux',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'contact.center@minfin.fed.be',
    contactPhone: '0257 257 57',
  },

  deductionHabitation: {
    machineId: 'deductionHabitation',
    nameFr: 'Déduction fiscale habitation',
    nameNl: 'Fiscale aftrek woning',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Déduction pour habitation propre - CIR92 Art. 104-106',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/habitation/credits_hypothecaires',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'contact.center@minfin.fed.be',
    contactPhone: '0257 257 57',
  },

  chequesRepas: {
    machineId: 'chequesRepas',
    nameFr: 'Chèques repas',
    nameNl: 'Maaltijdcheques',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Arrêté royal du 28 novembre 1969 - Chèques-repas',
          publicationDate: new Date('1969-12-09'),
          effectiveDate: new Date('1969-12-01'),
          officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1969112801',
          backupUrl: 'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/avantages_de_toute_nature',
          language: 'fr',
        },
      ],
      amounts: {
        valeurMaximaleExoneree: 8.00, // EUR par chèque
        contributionEmployeurMax: 6.91, // EUR
        contributionEmployeMin: 1.09, // EUR
      },
      status: 'active',
    },
    versionHistory: [],
  },

  // ============================================================================
  // SERVICES SOCIAUX
  // ============================================================================

  logementSocial: {
    machineId: 'logementSocial',
    nameFr: 'Logement social',
    nameNl: 'Sociale woningen',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'Région Wallonne - Logement',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Code wallon du Logement et de l\'Habitat durable',
          publicationDate: new Date('2023-12-15'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://logement.wallonie.be/home/aides-au-logement/aides-a-lacquisition/logement-social.html',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'logement@spw.wallonie.be',
  },

  mediationDettes: {
    machineId: 'mediationDettes',
    nameFr: 'Médiation de dettes',
    nameNl: 'Schuldbemiddeling',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Économie - Médiation de dettes',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi relative au règlement collectif de dettes',
          publicationDate: new Date('1998-08-05'),
          effectiveDate: new Date('1999-01-01'),
          officialUrl: 'https://economie.fgov.be/fr/themes/financial-services/credit-et-endettement/mediation-de-dettes',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  // ============================================================================
  // DROITS DU TRAVAIL
  // ============================================================================

  contratTravail: {
    machineId: 'contratTravail',
    nameFr: 'Contrat de travail',
    nameNl: 'Arbeidsovereenkomst',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi, Travail et Concertation sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi du 3 juillet 1978 relative aux contrats de travail',
          referenceNumber: '1978070301',
          publicationDate: new Date('1978-08-22'),
          effectiveDate: new Date('1978-09-01'),
          officialUrl: 'https://www.ejustice.just.fgov.be/eli/loi/1978/07/03/1978070301/justel',
          backupUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@emploi.belgique.be',
    contactPhone: '02 233 41 11',
  },

  creditTemps: {
    machineId: 'creditTemps',
    nameFr: 'Crédit-temps',
    nameNl: 'Tijdskrediet',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'ONEM',
          authorityType: 'ONEM',
          region: 'fédéral',
          title: 'Crédit-temps et interruption de carrière',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.onem.be/fr/documentation/feuille-info/t160',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@onem.be',
  },

  teletravail: {
    machineId: 'teletravail',
    nameFr: 'Télétravail',
    nameNl: 'Telewerk',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2022-11-21'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi du 21 novembre 2022 relative au télétravail occasionnel et régulier',
          publicationDate: new Date('2022-12-02'),
          effectiveDate: new Date('2023-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/teletravail',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  // ============================================================================
  // ADDITIONAL SOCIAL BENEFITS
  // ============================================================================

  primeNaissance: {
    machineId: 'primeNaissance',
    nameFr: 'Prime de naissance',
    nameNl: 'Geboortepremie',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'FAMIFED',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Prime de naissance et d\'adoption',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.famifed.be/fr/prime-naissance',
          language: 'fr',
        },
      ],
      amounts: {
        primeNaissance: 1272.52,
      },
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'contact@famifed.be',
  },

  pensionSurvie: {
    machineId: 'pensionSurvie',
    nameFr: 'Pension de survie',
    nameNl: 'Overlevingspensioen',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'Service Fédéral des Pensions',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Pension de survie',
          publicationDate: new Date('2023-12-20'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.sfpd.fgov.be/fr/pension-de-survie',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@sfpd.fgov.be',
    contactPhone: '1765',
  },

  assuranceMaladie: {
    machineId: 'assuranceMaladie',
    nameFr: 'Assurance maladie-invalidité',
    nameNl: 'Ziekte- en invaliditeitsverzekering',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'INAMI',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Assurance obligatoire soins de santé et indemnités',
          publicationDate: new Date('2023-12-15'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.inami.fgov.be/fr/themes/cout-remboursement',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'webmaster@inami.fgov.be',
  },

  allocationIntegration: {
    machineId: 'allocationIntegration',
    nameFr: "Allocation d'intégration",
    nameNl: 'Integratietegemoetkoming',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'DG Personnes handicapées',
          authorityType: 'SPF',
          region: 'fédéral',
          title: "Allocation d'intégration pour personnes handicapées",
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://handicap.belgium.be/fr/allocations-et-aides/allocation-integration.htm',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'contact@handicap.belgium.be',
    contactPhone: '0800 987 99',
  },

  aideSociale: {
    machineId: 'aideSociale',
    nameFr: 'Aide sociale',
    nameNl: 'Maatschappelijke dienstverlening',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Intégration Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi organique des CPAS - Aide sociale',
          publicationDate: new Date('1976-07-08'),
          effectiveDate: new Date('1976-07-01'),
          officialUrl: 'https://www.mi-is.be/fr/cpas/aide-sociale',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@mi-is.be',
  },

  bourseEtudes: {
    machineId: 'bourseEtudes',
    nameFr: "Bourse d'études",
    nameNl: 'Studiebeurs',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'Fédération Wallonie-Bruxelles',
          authorityType: 'SPW',
          region: 'wallonie',
          title: "Allocations et bourses d'études",
          publicationDate: new Date('2023-12-15'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://allocations-etudes.cfwb.be',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  allocationsEtudes: {
    machineId: 'allocationsEtudes',
    nameFr: "Allocations d'études",
    nameNl: 'Studietoelagen',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'Fédération Wallonie-Bruxelles',
          authorityType: 'SPW',
          region: 'wallonie',
          title: "Allocations d'études de la Communauté française",
          publicationDate: new Date('2023-12-15'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://allocations-etudes.cfwb.be',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  aideLogement: {
    machineId: 'aideLogement',
    nameFr: 'Aide au logement',
    nameNl: 'Woonsteun',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'Région Wallonne - Logement',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Aide locative',
          publicationDate: new Date('2023-12-15'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://logement.wallonie.be/home/aides-au-logement.html',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  allocationChauffage: {
    machineId: 'allocationChauffage',
    nameFr: 'Allocation de chauffage',
    nameNl: 'Verwarmingstoelage',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Économie',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Allocation de chauffage',
          publicationDate: new Date('2023-12-15'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://economie.fgov.be/fr/themes/energie/prix-de-lenergie/tarif-social-pour-lenergie/allocation-de-chauffage',
          language: 'fr',
        },
      ],
      amounts: {
        gasoilChauffage: 300,
        petrole: 300,
      },
      status: 'active',
    },
    versionHistory: [],
  },

  pensionComplementaire: {
    machineId: 'pensionComplementaire',
    nameFr: 'Pension complémentaire',
    nameNl: 'Aanvullend pensioen',
    category: 'social-benefits',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'FSMA',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi relative aux pensions complémentaires',
          publicationDate: new Date('2003-05-28'),
          effectiveDate: new Date('2004-01-01'),
          officialUrl: 'https://www.fsma.be/fr/pension-complementaire',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  // ============================================================================
  // ADDITIONAL FISCAL RIGHTS
  // ============================================================================

  deductionInvestissement: {
    machineId: 'deductionInvestissement',
    nameFr: 'Déduction pour investissement',
    nameNl: 'Investeringsaftrek',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Déduction pour investissement - CIR92',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/entreprises/impots/impot_des_societes/deductions',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'contact.center@minfin.fed.be',
  },

  reductionEpargnePension: {
    machineId: 'reductionEpargnePension',
    nameFr: 'Réduction fiscale épargne-pension',
    nameNl: 'Belastingvermindering pensioensparen',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Épargne-pension - CIR92 Art. 145',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/avantages_fiscaux/epargne-pension',
          language: 'fr',
        },
      ],
      amounts: {
        plafond1: 1020,
        plafond2: 1310,
      },
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'contact.center@minfin.fed.be',
  },

  ecoCheque: {
    machineId: 'ecoCheque',
    nameFr: 'Éco-chèques',
    nameNl: 'Ecocheques',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Éco-chèques - Avantages de toute nature',
          publicationDate: new Date('2009-05-12'),
          effectiveDate: new Date('2009-05-01'),
          officialUrl: 'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/avantages_de_toute_nature/ecocheques',
          language: 'fr',
        },
      ],
      amounts: {
        montantMaximalAnnuel: 250,
      },
      status: 'active',
    },
    versionHistory: [],
  },

  avantagesNature: {
    machineId: 'avantagesNature',
    nameFr: 'Avantages de toute nature',
    nameNl: 'Voordelen van alle aard',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Avantages de toute nature - CIR92',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/avantages_de_toute_nature',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'contact.center@minfin.fed.be',
  },

  tvaReduite: {
    machineId: 'tvaReduite',
    nameFr: 'TVA réduite',
    nameNl: 'Verlaagd BTW-tarief',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Taux de TVA réduits',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/entreprises/tva/assujettissement-et-franchise/taux-de-tva',
          language: 'fr',
        },
      ],
      amounts: {
        tauxReduit: 6,
        tauxIntermediaire: 12,
        tauxNormal: 21,
      },
      status: 'active',
    },
    versionHistory: [],
  },

  exonerationPrecompte: {
    machineId: 'exonerationPrecompte',
    nameFr: 'Exonération du précompte immobilier',
    nameNl: 'Vrijstelling van onroerende voorheffing',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Précompte immobilier - Exonérations',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/habitation/precompte_immobilier',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  bonusLogement: {
    machineId: 'bonusLogement',
    nameFr: 'Bonus logement',
    nameNl: 'Woonbonus',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Région Flamande',
          authorityType: 'VDAB',
          region: 'flandre',
          title: 'Woonbonus',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.wonenvlaanderen.be/woonbonus',
          language: 'nl',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  deductionFraisGarde: {
    machineId: 'deductionFraisGarde',
    nameFr: 'Déduction fiscale frais de garde',
    nameNl: 'Belastingaftrek kinderopvang',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Déduction frais de garde d\'enfants - CIR92',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/famille/frais_de_garde',
          language: 'fr',
        },
      ],
      amounts: {
        plafondDeduction: 14,
      },
      status: 'active',
    },
    versionHistory: [],
  },

  creditImpotServiceLocal: {
    machineId: 'creditImpotServiceLocal',
    nameFr: "Crédit d'impôt service local",
    nameNl: 'Belastingkrediet lokale diensten',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Titre-services - Crédit d\'impôt',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/avantages_fiscaux/titres-services',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  quotientConjugal: {
    machineId: 'quotientConjugal',
    nameFr: 'Quotient conjugal',
    nameNl: 'Huwelijksquotiënt',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Quotient conjugal - CIR92',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/famille/mariage_et_cohabitation_legale/quotient_conjugal',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  renteAlimentaire: {
    machineId: 'renteAlimentaire',
    nameFr: 'Rente alimentaire',
    nameNl: 'Onderhoudsuitkering',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Rentes alimentaires - Déductibilité',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/famille/divorce_et_separation/rentes_alimentaires',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  deductionDons: {
    machineId: 'deductionDons',
    nameFr: 'Déduction fiscale pour dons',
    nameNl: 'Belastingaftrek voor giften',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Déduction pour dons - CIR92 Art. 104',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/avantages_fiscaux/dons',
          language: 'fr',
        },
      ],
      amounts: {
        minimumDeductible: 40,
      },
      status: 'active',
    },
    versionHistory: [],
  },

  fraisProfessionnels: {
    machineId: 'fraisProfessionnels',
    nameFr: 'Frais professionnels',
    nameNl: 'Beroepskosten',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Frais professionnels - CIR92',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/declaration_impot/revenus-professionnels/frais_professionnels',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  deductionVehiculeElectrique: {
    machineId: 'deductionVehiculeElectrique',
    nameFr: 'Déduction fiscale véhicule électrique',
    nameNl: 'Belastingaftrek elektrische wagen',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Déduction véhicule électrique',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/entreprises/voitures-societe/deduction',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  primeRenovation: {
    machineId: 'primeRenovation',
    nameFr: 'Prime à la rénovation',
    nameNl: 'Renovatiepremie',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'Région Wallonne - Logement',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Prime à la rénovation',
          publicationDate: new Date('2023-12-15'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://energie.wallonie.be/fr/prime-a-la-renovation.html',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  deductionIsolation: {
    machineId: 'deductionIsolation',
    nameFr: 'Déduction fiscale isolation',
    nameNl: 'Belastingaftrek isolatie',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Réduction d\'impôt isolation toiture',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/habitation/isolation_toiture',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  creditImpotInvestissementDurable: {
    machineId: 'creditImpotInvestissementDurable',
    nameFr: "Crédit d'impôt investissement durable",
    nameNl: 'Belastingkrediet duurzame investering',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Investissements économiseurs d\'énergie',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/habitation/economie_energie',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  tarifSocialEnergie: {
    machineId: 'tarifSocialEnergie',
    nameFr: 'Tarif social énergie',
    nameNl: 'Sociaal tarief energie',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SPF Économie',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Tarif social pour l\'énergie',
          publicationDate: new Date('2023-12-15'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://economie.fgov.be/fr/themes/energie/prix-de-lenergie/tarif-social-pour-lenergie',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  revenuCadastralExoneration: {
    machineId: 'revenuCadastralExoneration',
    nameFr: 'Exonération du revenu cadastral',
    nameNl: 'Vrijstelling kadastraal inkomen',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Revenu cadastral - Exonérations',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/habitation/revenu_cadastral',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  abonnementSocialTransport: {
    machineId: 'abonnementSocialTransport',
    nameFr: 'Abonnement social transport',
    nameNl: 'Sociaal abonnement vervoer',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      sources: [
        {
          authority: 'SNCB',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Tarifs sociaux SNCB',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.belgiantrain.be/fr/tickets-and-railpasses/social-tariffs',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  exonerationPlusValue: {
    machineId: 'exonerationPlusValue',
    nameFr: 'Exonération des plus-values',
    nameNl: 'Vrijstelling meerwaarden',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Plus-values - Exonérations',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/habitation/vente',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  deductionEmpruntHypothecaire: {
    machineId: 'deductionEmpruntHypothecaire',
    nameFr: 'Déduction emprunt hypothécaire',
    nameNl: 'Aftrek hypothecaire lening',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Emprunt hypothécaire - Déduction',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/habitation/credits_hypothecaires',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  abattementSuccession: {
    machineId: 'abattementSuccession',
    nameFr: 'Abattement droits de succession',
    nameNl: 'Vermindering successierechten',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Région Wallonne',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Droits de succession',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/famille/deces/droits_de_succession',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  droitsDonationReduits: {
    machineId: 'droitsDonationReduits',
    nameFr: 'Droits de donation réduits',
    nameNl: 'Verminderde schenkingsrechten',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Région Wallonne',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Droits de donation',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/famille/donations',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  exonerationRevenusMobiliers: {
    machineId: 'exonerationRevenusMobiliers',
    nameFr: 'Exonération revenus mobiliers',
    nameNl: 'Vrijstelling roerende inkomsten',
    category: 'fiscal-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Revenus mobiliers - Exonération',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/declaration_impot/revenus/revenus-mobiliers',
          language: 'fr',
        },
      ],
      amounts: {
        exemptionEpargne: 980,
      },
      status: 'active',
    },
    versionHistory: [],
  },

  // ============================================================================
  // ADDITIONAL EMPLOYMENT RIGHTS
  // ============================================================================

  preavis: {
    machineId: 'preavis',
    nameFr: 'Préavis',
    nameNl: 'Opzegging',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi du 3 juillet 1978 - Préavis',
          publicationDate: new Date('1978-08-22'),
          effectiveDate: new Date('1978-09-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/fin-du-contrat-de-travail/preavis',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@emploi.belgique.be',
  },

  licenciement: {
    machineId: 'licenciement',
    nameFr: 'Licenciement',
    nameNl: 'Ontslag',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Licenciement - Loi du 3 juillet 1978',
          publicationDate: new Date('1978-08-22'),
          effectiveDate: new Date('1978-09-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/fin-du-contrat-de-travail/licenciement',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@emploi.belgique.be',
  },

  demission: {
    machineId: 'demission',
    nameFr: 'Démission',
    nameNl: 'Ontslag',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Démission - Loi du 3 juillet 1978',
          publicationDate: new Date('1978-08-22'),
          effectiveDate: new Date('1978-09-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/fin-du-contrat-de-travail/demission',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  congeMaladie: {
    machineId: 'congeMaladie',
    nameFr: 'Congé de maladie',
    nameNl: 'Ziekteverlof',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'INAMI',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Incapacité de travail',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.inami.fgov.be/fr/themes/incapacite-travail',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  accidentTravail: {
    machineId: 'accidentTravail',
    nameFr: 'Accident du travail',
    nameNl: 'Arbeidsongeval',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'FEDRIS',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi du 10 avril 1971 sur les accidents du travail',
          publicationDate: new Date('1971-04-24'),
          effectiveDate: new Date('1971-07-01'),
          officialUrl: 'https://www.fedris.be/fr/professionnels-de-la-sante/accident-du-travail',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@fedris.be',
  },

  travailEtudiant: {
    machineId: 'travailEtudiant',
    nameFr: 'Travail étudiant',
    nameNl: 'Studentenarbeid',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Occupation d\'étudiants',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/contrats-de-travail-particuliers/contrat-doccupation-detudiants',
          language: 'fr',
        },
      ],
      amounts: {
        heuresMaximales: 600,
      },
      status: 'active',
    },
    versionHistory: [],
  },

  stage: {
    machineId: 'stage',
    nameFr: 'Stage',
    nameNl: 'Stage',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Stages',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/stages',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  maladieProfessionnelle: {
    machineId: 'maladieProfessionnelle',
    nameFr: 'Maladie professionnelle',
    nameNl: 'Beroepsziekte',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'FEDRIS',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Maladies professionnelles',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.fedris.be/fr/professionnels-de-la-sante/maladie-professionnelle',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@fedris.be',
  },

  harcelementTravail: {
    machineId: 'harcelementTravail',
    nameFr: 'Harcèlement au travail',
    nameNl: 'Pesterijen op het werk',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi du 4 août 1996 - Bien-être au travail',
          publicationDate: new Date('1996-09-18'),
          effectiveDate: new Date('1997-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/bien-etre-au-travail/harcelement-et-violence-au-travail',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  egaliteSalariale: {
    machineId: 'egaliteSalariale',
    nameFr: 'Égalité salariale',
    nameNl: 'Loongelijkheid',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Institut pour l\'égalité des femmes et des hommes',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi du 22 avril 2012 - Écart salarial',
          publicationDate: new Date('2012-05-15'),
          effectiveDate: new Date('2012-08-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/egalite-des-chances/egalite-de-remuneration-entre-hommes-et-femmes',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  discriminationEmploi: {
    machineId: 'discriminationEmploi',
    nameFr: 'Discrimination à l\'emploi',
    nameNl: 'Discriminatie bij werk',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi du 10 mai 2007 - Lutte contre la discrimination',
          publicationDate: new Date('2007-05-30'),
          effectiveDate: new Date('2007-06-09'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/egalite-des-chances/lutte-contre-la-discrimination',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  flexiJob: {
    machineId: 'flexiJob',
    nameFr: 'Flexi-job',
    nameNl: 'Flexi-job',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'ONSS',
          authorityType: 'ONSS',
          region: 'fédéral',
          title: 'Flexi-jobs',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.onss.be/fr/flexi-jobs',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  travailInterimaire: {
    machineId: 'travailInterimaire',
    nameFr: 'Travail intérimaire',
    nameNl: 'Uitzendarbeid',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Loi du 24 juillet 1987 - Travail intérimaire',
          publicationDate: new Date('1987-08-20'),
          effectiveDate: new Date('1987-09-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/contrats-de-travail-particuliers/travail-interimaire',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  tempsPartiel: {
    machineId: 'tempsPartiel',
    nameFr: 'Temps partiel',
    nameNl: 'Deeltijds werk',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Travail à temps partiel',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/temps-de-travail/travail-temps-partiel',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  horaireFlexible: {
    machineId: 'horaireFlexible',
    nameFr: 'Horaire flexible',
    nameNl: 'Flexibel werkrooster',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Horaires flexibles',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/temps-de-travail/horaires-flexibles',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  contratDureeIndeterminee: {
    machineId: 'contratDureeIndeterminee',
    nameFr: 'Contrat à durée indéterminée',
    nameNl: 'Contract voor onbepaalde duur',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'CDI - Loi du 3 juillet 1978',
          publicationDate: new Date('1978-08-22'),
          effectiveDate: new Date('1978-09-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/types-de-contrats',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  contratDureeDeterminee: {
    machineId: 'contratDureeDeterminee',
    nameFr: 'Contrat à durée déterminée',
    nameNl: 'Contract voor bepaalde duur',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'CDD - Loi du 3 juillet 1978',
          publicationDate: new Date('1978-08-22'),
          effectiveDate: new Date('1978-09-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/contrats-de-travail/types-de-contrats/contrat-duree-determinee',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  congeParental: {
    machineId: 'congeParental',
    nameFr: 'Congé parental',
    nameNl: 'Ouderschapsverlof',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'ONEM',
          authorityType: 'ONEM',
          region: 'fédéral',
          title: 'Congé parental',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.onem.be/fr/documentation/feuille-info/t19',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
    contactEmail: 'info@onem.be',
  },

  congeMaternite: {
    machineId: 'congeMaternite',
    nameFr: 'Congé de maternité',
    nameNl: 'Moederschapsverlof',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'INAMI',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Congé de maternité',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.inami.fgov.be/fr/themes/grossesse-naissance/conge-maternite',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  representationSyndicale: {
    machineId: 'representationSyndicale',
    nameFr: 'Représentation syndicale',
    nameNl: 'Syndicale vertegenwoordiging',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Représentation syndicale',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/concertation-sociale/representation-syndicale',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  outplacement: {
    machineId: 'outplacement',
    nameFr: 'Outplacement',
    nameNl: 'Outplacement',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Reclassement professionnel',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/restructurations/outplacement',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  formationEntreprise: {
    machineId: 'formationEntreprise',
    nameFr: 'Formation en entreprise',
    nameNl: 'Opleiding in bedrijf',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Formation professionnelle',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/formation-professionnelle',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  droitGreve: {
    machineId: 'droitGreve',
    nameFr: 'Droit de grève',
    nameNl: 'Stakingsrecht',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Droit de grève',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/concertation-sociale/droit-de-greve',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  fondsSecuriteExistence: {
    machineId: 'fondsSecuriteExistence',
    nameFr: 'Fonds de sécurité d\'existence',
    nameNl: 'Fonds voor bestaanszekerheid',
    category: 'employment-rights',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Emploi',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Fonds de sécurité d\'existence',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://emploi.belgique.be/fr/themes/remuneration/fonds-de-securite-dexistence',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  // ============================================================================
  // ADDITIONAL SOCIAL SERVICES
  // ============================================================================

  transportScolaire: {
    machineId: 'transportScolaire',
    nameFr: 'Transport scolaire',
    nameNl: 'Schoolvervoer',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Région Wallonne',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Transport scolaire',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.wallonie.be/fr/transport-scolaire',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  soinsSanteMentale: {
    machineId: 'soinsSanteMentale',
    nameFr: 'Soins de santé mentale',
    nameNl: 'Geestelijke gezondheidszorg',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Santé Publique',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Santé mentale',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.health.belgium.be/fr/sante/soins-de-sante/aide-aux-personnes/sante-mentale',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  servicePublicEmploi: {
    machineId: 'servicePublicEmploi',
    nameFr: 'Service public de l\'emploi',
    nameNl: 'Openbare dienst voor arbeidsbemiddeling',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Le Forem',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Service public de l\'emploi et de la formation',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.leforem.be',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  restaurantsSociaux: {
    machineId: 'restaurantsSociaux',
    nameFr: 'Restaurants sociaux',
    nameNl: 'Sociale restaurants',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Intégration Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Restaurants sociaux',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.mi-is.be/fr/etudes-projets-pilotes-et-lutte-contre-la-pauvrete/restaurants-sociaux',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  repasScolairesGratuits: {
    machineId: 'repasScolairesGratuits',
    nameFr: 'Repas scolaires gratuits',
    nameNl: 'Gratis schoolmaaltijden',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Fédération Wallonie-Bruxelles',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Repas scolaires gratuits',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.cfwb.be',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  protectionJuridique: {
    machineId: 'protectionJuridique',
    nameFr: 'Protection juridique',
    nameNl: 'Juridische bescherming',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Justice',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Aide juridique',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://justice.belgium.be/fr/themes_et_dossiers/acces_a_la_justice/aide_juridique',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  insertionProfessionnelle: {
    machineId: 'insertionProfessionnelle',
    nameFr: 'Insertion professionnelle',
    nameNl: 'Professionele inschakeling',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Le Forem',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Insertion socio-professionnelle',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.leforem.be/particuliers/insertion-professionnelle.html',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  inscriptionEcole: {
    machineId: 'inscriptionEcole',
    nameFr: 'Inscription à l\'école',
    nameNl: 'Inschrijving school',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Fédération Wallonie-Bruxelles',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Inscription scolaire',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.enseignement.be/index.php?page=26100',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  formationProfessionnelle: {
    machineId: 'formationProfessionnelle',
    nameFr: 'Formation professionnelle',
    nameNl: 'Beroepsopleiding',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Le Forem',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Formation professionnelle',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.leforem.be/particuliers/formation-professionnelle.html',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  fondsCreances: {
    machineId: 'fondsCreances',
    nameFr: 'Fonds des créances alimentaires',
    nameNl: 'Fonds voor alimentatievorderingen',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Finances - SECAL',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Service des Créances Alimentaires',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://finances.belgium.be/fr/particuliers/famille/divorce_et_separation/service_creances_alimentaires',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  budgetEnergetique: {
    machineId: 'budgetEnergetique',
    nameFr: 'Aide au budget énergétique',
    nameNl: 'Energiebudgethulp',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Économie',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Aide énergétique',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://economie.fgov.be/fr/themes/energie/aide-energetique',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  banqueAlimentaire: {
    machineId: 'banqueAlimentaire',
    nameFr: 'Banque alimentaire',
    nameNl: 'Voedselbank',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Intégration Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Aide alimentaire',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.mi-is.be/fr/etudes-projets-pilotes-et-lutte-contre-la-pauvrete/aide-alimentaire',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  aideSansAbri: {
    machineId: 'aideSansAbri',
    nameFr: 'Aide aux sans-abri',
    nameNl: 'Hulp aan daklozen',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Intégration Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Aide aux sans-abri',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.mi-is.be/fr/etudes-projets-pilotes-et-lutte-contre-la-pauvrete/sans-abrisme',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  aideMobilite: {
    machineId: 'aideMobilite',
    nameFr: 'Aide à la mobilité',
    nameNl: 'Mobiliteitshulp',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'DG Personnes handicapées',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Aide à la mobilité',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://handicap.belgium.be/fr/aides-techniques-et-adaptations/aides-a-la-mobilite.htm',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  aideAlimentaire: {
    machineId: 'aideAlimentaire',
    nameFr: 'Aide alimentaire',
    nameNl: 'Voedselhulp',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Intégration Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Aide alimentaire',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.mi-is.be/fr/etudes-projets-pilotes-et-lutte-contre-la-pauvrete/aide-alimentaire',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  accompagnementSocial: {
    machineId: 'accompagnementSocial',
    nameFr: 'Accompagnement social',
    nameNl: 'Sociale begeleiding',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Intégration Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Accompagnement social - CPAS',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.mi-is.be/fr/cpas/accompagnement-social',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  gardeEnfants: {
    machineId: 'gardeEnfants',
    nameFr: 'Garde d\'enfants',
    nameNl: 'Kinderopvang',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'ONE',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Accueil de l\'enfance',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.one.be/public/accueillant/',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  garantieLocative: {
    machineId: 'garantieLocative',
    nameFr: 'Garantie locative',
    nameNl: 'Huurwaarborg',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Région Wallonne - Logement',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Garantie locative',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://logement.wallonie.be/home/location/garantie-locative.html',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  aidePersonnesAgees: {
    machineId: 'aidePersonnesAgees',
    nameFr: 'Aide aux personnes âgées',
    nameNl: 'Hulp aan ouderen',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Sécurité Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Aide aux personnes âgées',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.belgium.be/fr/famille/aide_et_soins_a_domicile/personnes_agees',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  carteMedicale: {
    machineId: 'carteMedicale',
    nameFr: 'Carte médicale',
    nameNl: 'Medische kaart',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'INAMI',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Carte médicale CPAS',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.mi-is.be/fr/cpas/aide-sociale/aide-medicale',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  aideJuridique: {
    machineId: 'aideJuridique',
    nameFr: 'Aide juridique',
    nameNl: 'Juridische bijstand',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Justice',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Aide juridique de première et deuxième ligne',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://justice.belgium.be/fr/themes_et_dossiers/acces_a_la_justice/aide_juridique',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  teleAssistance: {
    machineId: 'teleAssistance',
    nameFr: 'Téléassistance',
    nameNl: 'Teleassistentie',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Sécurité Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Téléassistance pour personnes âgées',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.belgium.be/fr/famille/aide_et_soins_a_domicile/teleassistance',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  repasDomicile: {
    machineId: 'repasDomicile',
    nameFr: 'Repas à domicile',
    nameNl: 'Maaltijden aan huis',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Sécurité Sociale',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Repas à domicile',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.belgium.be/fr/famille/aide_et_soins_a_domicile/repas_a_domicile',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  protectionEnfance: {
    machineId: 'protectionEnfance',
    nameFr: 'Protection de l\'enfance',
    nameNl: 'Jeugdbescherming',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Fédération Wallonie-Bruxelles',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Aide à la jeunesse',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.aidealajeunesse.cfwb.be',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  mediationFamiliale: {
    machineId: 'mediationFamiliale',
    nameFr: 'Médiation familiale',
    nameNl: 'Familiebemiddeling',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Justice',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Médiation familiale',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://justice.belgium.be/fr/themes_et_dossiers/famille/mediation_familiale',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  centreAccueil: {
    machineId: 'centreAccueil',
    nameFr: 'Centre d\'accueil',
    nameNl: 'Opvangcentrum',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Fedasil',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Centres d\'accueil',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.fedasil.be',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  aideVictimes: {
    machineId: 'aideVictimes',
    nameFr: 'Aide aux victimes',
    nameNl: 'Slachtofferhulp',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Justice',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Aide aux victimes',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://justice.belgium.be/fr/themes_et_dossiers/securite_et_criminalite/aide_aux_victimes',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  aideMenagere: {
    machineId: 'aideMenagere',
    nameFr: 'Aide ménagère',
    nameNl: 'Huishoudelijke hulp',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'Région Wallonne',
          authorityType: 'SPW',
          region: 'wallonie',
          title: 'Aide à domicile',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://www.aviq.be/aide-domicile.html',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },

  // ============================================================================
  // LEGAL CONVERSION MACHINES
  // ============================================================================

  conversion: {
    machineId: 'conversion',
    nameFr: 'Conversion légale',
    nameNl: 'Wettelijke omzetting',
    category: 'social-services',
    currentVersion: {
      version: '2024.1.0',
      extractionDate: new Date('2024-11-16'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [
        {
          authority: 'SPF Justice',
          authorityType: 'SPF',
          region: 'fédéral',
          title: 'Conversion de droits',
          publicationDate: new Date('2023-12-31'),
          effectiveDate: new Date('2024-01-01'),
          officialUrl: 'https://justice.belgium.be',
          language: 'fr',
        },
      ],
      status: 'active',
    },
    versionHistory: [],
  },
};

/**
 * Fonction pour obtenir les métadonnées d'une machine
 */
export function getMachineLegalMetadata(machineId: string): MachineLegalMetadata | undefined {
  return MACHINES_LEGAL_METADATA[machineId];
}

/**
 * Fonction pour vérifier si une machine a des données à jour
 */
export function isMachineDataCurrent(machineId: string): {
  isCurrent: boolean;
  daysOld: number;
  needsReview: boolean;
} {
  const metadata = getMachineLegalMetadata(machineId);

  if (!metadata) {
    return { isCurrent: false, daysOld: 0, needsReview: true };
  }

  const now = new Date();
  const extractionDate = metadata.currentVersion.extractionDate;
  const daysOld = Math.floor((now.getTime() - extractionDate.getTime()) / (1000 * 60 * 60 * 24));

  // Considéré comme actuel si < 30 jours
  const isCurrent = daysOld < 30;

  // Nécessite une révision si nextReviewDate est dépassée
  const needsReview = metadata.currentVersion.nextReviewDate
    ? now > metadata.currentVersion.nextReviewDate
    : false;

  return { isCurrent, daysOld, needsReview };
}

/**
 * Fonction pour obtenir toutes les sources officielles d'une machine
 */
export function getMachineSources(machineId: string): LegalSource[] {
  const metadata = getMachineLegalMetadata(machineId);
  return metadata?.currentVersion.sources || [];
}

/**
 * Fonction pour générer un rapport d'audit sur toutes les machines
 */
export function generateAuditReport(): {
  totalMachines: number;
  upToDate: number;
  needsReview: number;
  deprecated: number;
  missingMetadata: number;
} {
  const allMachineIds = Object.keys(MACHINES_LEGAL_METADATA);

  let upToDate = 0;
  let needsReview = 0;
  let deprecated = 0;

  allMachineIds.forEach(id => {
    const status = isMachineDataCurrent(id);
    const metadata = getMachineLegalMetadata(id);

    if (metadata?.currentVersion.status === 'deprecated') {
      deprecated++;
    } else if (status.needsReview) {
      needsReview++;
    } else if (status.isCurrent) {
      upToDate++;
    }
  });

  return {
    totalMachines: allMachineIds.length,
    upToDate,
    needsReview,
    deprecated,
    missingMetadata: 0, // Toutes les machines dans le registre ont des métadonnées
  };
}
