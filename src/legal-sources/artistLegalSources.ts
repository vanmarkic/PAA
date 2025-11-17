/**
 * Belgian Legal Sources for Artist Status (Statut d'Artiste)
 *
 * Comprehensive collection of legal references for artist status,
 * unemployment benefits, tax regime, social security, and copyright.
 */

export const ARTIST_LEGAL_FRAMEWORK = {
  primaryLegislation: {
    title: "Arrêté royal du 16 novembre 2009 relatif à la protection sociale des artistes",
    date: "2009-11-16",
    officialUrl: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2009111603",
    authority: "Service Public Fédéral Emploi, Travail et Concertation sociale",
    description: "Cadre principal définissant le statut d'artiste et la protection sociale",
    lastAmended: "2023-01-01",
  },

  implementingLegislation: [
    {
      title: "Loi-programme du 24 décembre 2002",
      article: "Article 1bis",
      date: "2002-12-24",
      officialUrl: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002122445",
      description: "Définition du contrat de travail pour artistes",
    },
    {
      title: "Arrêté royal du 26 mars 2003 portant création de la Commission Artistes",
      date: "2003-03-26",
      officialUrl: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2003032638",
      description: "Création et compétences de la Commission des Artistes",
    },
    {
      title: "Arrêté royal du 25 novembre 1991 portant réglementation du chômage",
      date: "1991-11-25",
      officialUrl: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550",
      description: "Règles spécifiques pour le chômage des artistes",
    },
  ],

  notes: {
    lastUpdated: "2024-01-01",
    source: "Moniteur Belge - Service Public Fédéral Justice",
    language: "FR",
  },
};

export const ARTIST_KEY_ARTICLES = {
  "Article 1": {
    title: "Champ d'application",
    content: "Le présent arrêté s'applique aux artistes qui exercent des activités artistiques",
    conditions: [
      "Être âgé d'au moins 18 ans",
      "Exercer des activités artistiques de manière professionnelle",
      "Pouvoir prouver un minimum de prestations artistiques",
    ],
    reference: ARTIST_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
  },

  "Article 2": {
    title: "Définition de l'artiste",
    categories: {
      musicien: "Personne qui compose, interprète ou exécute de la musique",
      comédien: "Personne qui joue des rôles au théâtre, cinéma ou télévision",
      plasticien: "Personne qui crée des œuvres d'art visuel",
      danseur: "Personne qui pratique la danse de manière professionnelle",
      écrivain: "Personne qui écrit des œuvres littéraires",
      technicien: "Personne qui assure le support technique des spectacles",
    },
  },

  "Article 3": {
    title: "Conditions d'octroi du statut",
    minimumDays: {
      standard: 156,
      reduced: 104,
      description: "Jours de prestations artistiques sur 21 mois",
    },
    minimumIncome: {
      amount: 2000,
      currency: "EUR",
      period: "annuel",
    },
    maximumNonArtisticIncome: {
      amount: 10000,
      currency: "EUR",
      period: "annuel",
    },
  },

  "Article 1bis": {
    title: "Nature sui generis du contrat de travail",
    source: "Loi-programme du 24 décembre 2002",
    content: {
      paragraph1: "Les relations de travail entre un artiste et un donneur d'ordre sont présumées être exécutées dans les liens d'un contrat de travail",
      paragraph2: "Cette présomption peut être renversée si preuve contraire",
      conditions: [
        "Liberté d'organisation du travail",
        "Absence de lien de subordination",
        "Propriété des moyens de production",
      ],
    },
  },

  "Commission des Artistes": {
    title: "Compétences de la Commission",
    competences: [
      "Délivrance du visa artiste",
      "Validation du statut professionnel",
      "Médiation dans les litiges employeur-artiste",
      "Avis consultatifs sur l'interprétation de la législation",
      "Reconnaissance des artistes étrangers",
    ],
    delais: {
      standard: "30 jours ouvrables",
      appel: "30 jours calendrier",
      urgence: "15 jours ouvrables",
    },
    validity: {
      visaArtist: "5 ans",
      carteArtist: "5 ans",
      renewalPeriod: "6 mois avant expiration",
    },
  },
};

export const UNEMPLOYMENT_SPECIFIC_RULES = {
  title: "Règles spécifiques de chômage pour artistes",

  cachetRule: {
    name: "Règle du cachet",
    dailyExemption: 130,
    currency: "EUR",
    description: "Montant journalier exonéré pour les cachets artistiques",
    legalBasis: "Article 130 de l'AR du 25/11/1991",
  },

  protectionPeriod: {
    duration: 12,
    unit: "mois",
    description: "Période de protection pour maintien des droits",
    conditions: [
      "Avoir travaillé au moins 156 jours sur 21 mois",
      "Être inscrit comme demandeur d'emploi",
      "Rester disponible sur le marché du travail",
    ],
  },

  allocations: {
    isolé: {
      daily: 65.96,
      monthly: 1714.96,
    },
    cohabitant: {
      daily: 43.78,
      monthly: 1138.28,
    },
    chefDeFamille: {
      daily: 65.96,
      monthly: 1714.96,
    },
  },

  admissibilityConditions: {
    minimumDays: 156,
    referencePeriod: 21,
    unit: "mois",
    exceptions: [
      "Formation artistique reconnue",
      "Maladie professionnelle",
      "Accident de travail",
    ],
  },
};

export const TAX_REGIME_ARTISTS = {
  title: "Régime fiscal des artistes",

  flatRateDeduction: {
    rate: 50,
    unit: "%",
    cap: 10000,
    currency: "EUR",
    legalBasis: "Article 37 CIR 92",
    description: "Déduction forfaitaire pour frais professionnels",
  },

  copyrightTaxation: {
    withholdingRate: 15,
    unit: "%",
    maxAmount: 59970,
    currency: "EUR",
    description: "Précompte mobilier sur droits d'auteur",
    legalBasis: "Article 17, §1, 5° CIR 92",
  },

  vatRates: {
    originalWorks: {
      rate: 6,
      unit: "%",
      description: "TVA réduite sur ventes d'œuvres originales",
      conditions: [
        "Œuvre créée par l'artiste",
        "Vente directe ou via galerie",
        "Tirage limité pour multiples",
      ],
    },
    performances: {
      rate: 21,
      unit: "%",
      description: "TVA standard sur prestations",
      exemptions: [
        "Spectacles culturels subventionnés",
        "Activités éducatives",
      ],
    },
  },

  smallCompensationRegime: {
    threshold: 2500,
    currency: "EUR",
    period: "annuel",
    description: "Régime des petites indemnités",
    benefits: [
      "Pas de cotisations sociales",
      "Impôt sur le revenu uniquement",
      "Pas d'inscription comme indépendant",
    ],
  },

  artistTaxExemption: {
    amount: 3590,
    currency: "EUR",
    period: "annuel",
    description: "Quotité exemptée supplémentaire pour artistes",
    conditions: [
      "Revenus principalement artistiques",
      "Statut d'artiste reconnu",
    ],
  },
};

export const SOCIAL_SECURITY_ARTISTS = {
  title: "Sécurité sociale des artistes",

  contributionRates: {
    independent: {
      rate: 20.5,
      unit: "%",
      minimumQuarterly: 721.89,
      currency: "EUR",
      description: "Cotisations indépendant principal",
    },
    complementary: {
      rate: 20.5,
      unit: "%",
      minimumQuarterly: 0,
      threshold: 1500,
      currency: "EUR",
      description: "Cotisations indépendant complémentaire",
    },
    employee: {
      employerRate: 25,
      employeeRate: 13.07,
      unit: "%",
      description: "Cotisations sous contrat 1bis",
    },
  },

  coverage: {
    healthInsurance: {
      covered: true,
      waitingPeriod: 6,
      unit: "mois",
    },
    pension: {
      covered: true,
      minimumCareer: 45,
      unit: "années",
    },
    familyAllowances: {
      covered: true,
      immediateAccess: true,
    },
    workAccident: {
      covered: "Selon le régime",
      description: "Salarié: oui, Indépendant: assurance privée",
    },
  },

  maternityBenefits: {
    duration: 12,
    unit: "semaines",
    weeklyAmount: 506.24,
    currency: "EUR",
    conditions: [
      "6 mois de cotisations minimum",
      "Arrêt complet d'activité",
      "Certificat médical",
    ],
  },

  exemptions: {
    lowIncome: {
      threshold: 1500,
      currency: "EUR",
      period: "annuel",
      description: "Pas de cotisations si revenus < seuil",
    },
    student: {
      hoursLimit: 475,
      unit: "heures/an",
      description: "Cotisations de solidarité uniquement",
    },
    pensioner: {
      incomeLimit: 7700,
      currency: "EUR",
      period: "annuel",
      description: "Limite pour cumul pension-activité",
    },
  },
};

export const COPYRIGHT_LEGISLATION = {
  title: "Droits d'auteur et droits voisins",

  primaryLaw: {
    title: "Code de droit économique, Livre XI",
    date: "2013-02-28",
    officialUrl: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2013022819",
    description: "Titre 5 - Droit d'auteur et droits voisins",
  },

  protectionDuration: {
    copyright: {
      duration: "Vie + 70 ans",
      description: "Protection des œuvres originales",
    },
    neighboringRights: {
      duration: "50 ans",
      description: "Droits des interprètes",
      startDate: "Date de la prestation",
    },
    resaleRight: {
      duration: "Vie + 70 ans",
      rates: [
        { threshold: 50000, rate: 4 },
        { threshold: 200000, rate: 3 },
        { threshold: 350000, rate: 1 },
        { threshold: 500000, rate: 0.5 },
        { above: 500000, rate: 0.25, cap: 12500 },
      ],
      currency: "EUR",
    },
  },

  collectiveSocieties: {
    SABAM: {
      domain: "Musique et arts de la scène",
      website: "https://www.sabam.be",
      membershipFee: 50,
      currency: "EUR",
      commissionRate: "10-15%",
    },
    SACD: {
      domain: "Dramaturgie et audiovisuel",
      website: "https://www.sacd.be",
      membershipFee: 35,
      currency: "EUR",
    },
    SOFAM: {
      domain: "Arts plastiques et visuels",
      website: "https://www.sofam.be",
      membershipFee: 75,
      currency: "EUR",
    },
    SCAM: {
      domain: "Multimédia et littérature",
      website: "https://www.scam.be",
      membershipFee: 50,
      currency: "EUR",
    },
    PlayRight: {
      domain: "Droits voisins des interprètes",
      website: "https://www.playright.be",
      membershipFee: "Gratuit",
    },
  },

  mechanicalRights: {
    rate: 9.1,
    unit: "%",
    description: "Taux pour reproduction mécanique",
    minimumPerUnit: 0.091,
    currency: "EUR",
  },

  digitalRights: {
    streaming: {
      rate: "Variable",
      description: "Selon plateforme et nombre d'écoutes",
      averagePerStream: 0.003,
      currency: "EUR",
    },
    download: {
      rate: 15,
      unit: "%",
      description: "Pourcentage du prix de vente",
    },
  },
};

export const GRANTS_AND_SUBSIDIES = {
  title: "Bourses et subventions artistiques",

  authorities: {
    federal: {
      name: "SPF Économie",
      website: "https://economie.fgov.be",
      focus: "Tax shelter, mécénat",
    },
    wallonia: {
      name: "Fédération Wallonie-Bruxelles",
      website: "https://www.culture.be",
      focus: "Bourses de création, résidences",
    },
    flanders: {
      name: "Vlaams Audiovisueel Fonds",
      website: "https://www.vaf.be",
      focus: "Production audiovisuelle",
    },
    brussels: {
      name: "Commission Communautaire Française",
      website: "https://ccf.brussels",
      focus: "Projets locaux",
    },
  },

  grantTypes: {
    creation: {
      maxAmount: 25000,
      currency: "EUR",
      duration: "12 mois",
      eligibility: [
        "Portfolio professionnel",
        "Projet détaillé",
        "Budget réaliste",
      ],
    },
    residence: {
      maxAmount: 15000,
      currency: "EUR",
      duration: "6 mois",
      includes: [
        "Hébergement",
        "Espace de travail",
        "Allocation mensuelle",
      ],
    },
    research: {
      maxAmount: 20000,
      currency: "EUR",
      duration: "12 mois",
      focus: "Projets expérimentaux",
    },
    youngTalent: {
      maxAmount: 8000,
      currency: "EUR",
      ageLimit: 30,
      firstTime: true,
    },
    equipment: {
      maxAmount: 5000,
      currency: "EUR",
      coFinancing: 50,
      unit: "%",
    },
  },

  applicationProcess: {
    deadlines: [
      { period: "Q1", date: "15 janvier" },
      { period: "Q2", date: "15 avril" },
      { period: "Q3", date: "15 juillet" },
      { period: "Q4", date: "15 octobre" },
    ],
    evaluationCriteria: {
      artisticQuality: 40,
      feasibility: 30,
      impact: 20,
      innovation: 10,
      unit: "%",
    },
    decisionDelay: "60 jours",
    disbursement: {
      upfront: 50,
      interim: 25,
      final: 25,
      unit: "%",
    },
  },

  reporting: {
    interim: {
      due: "Mi-parcours",
      content: [
        "État d'avancement",
        "Justificatifs financiers partiels",
        "Documentation visuelle",
      ],
    },
    final: {
      due: "30 jours après fin",
      content: [
        "Rapport complet",
        "Justificatifs financiers complets",
        "Documentation complète du projet",
        "Évaluation et perspectives",
      ],
    },
  },
};

// Export comprehensive legal framework summary
export const COMPLETE_ARTIST_LEGAL_FRAMEWORK = {
  mainFramework: ARTIST_LEGAL_FRAMEWORK,
  keyArticles: ARTIST_KEY_ARTICLES,
  unemployment: UNEMPLOYMENT_SPECIFIC_RULES,
  taxation: TAX_REGIME_ARTISTS,
  socialSecurity: SOCIAL_SECURITY_ARTISTS,
  copyright: COPYRIGHT_LEGISLATION,
  grants: GRANTS_AND_SUBSIDIES,

  summary: {
    totalLaws: 15,
    lastUpdate: "2024-01-01",
    domains: [
      "Statut d'artiste",
      "Protection sociale",
      "Chômage artistique",
      "Régime fiscal",
      "Droits d'auteur",
      "Subventions",
    ],
    keyOrganizations: [
      "Commission des Artistes",
      "ONEM",
      "INASTI",
      "SPF Finances",
      "Sociétés de gestion collective",
      "Fédération Wallonie-Bruxelles",
    ],
  },
};