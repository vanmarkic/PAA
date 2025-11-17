/**
 * Références juridiques pour les Droits Civils et État Civil
 * Comprehensive legal framework for 50 civil rights procedures
 */

import { LegalReference, BenefitLegalFramework } from './belgianLegalSources';

// ========================================
// 1. IDENTITY DOCUMENTS LEGAL FRAMEWORK
// ========================================

export const IDENTITY_DOCUMENTS_LEGAL: BenefitLegalFramework = {
  benefitName: 'Documents d\'Identité',

  primaryLegislation: {
    type: 'loi',
    title: 'Loi relative aux registres de la population, aux cartes d\'identité, aux cartes d\'étranger et aux documents de séjour',
    date: '1991-07-19',
    publication: {
      date: '1991-09-03',
      reference: 'Moniteur Belge 1991-09-03',
    },
    articles: ['6', '6bis', '6ter', '7', '7bis'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991071931&table_name=loi',
    authority: 'Service Public Fédéral Intérieur',
  },

  implementingLegislation: [
    {
      type: 'arrete_royal',
      title: 'Arrêté royal relatif aux cartes d\'identité',
      date: '2003-03-25',
      publication: {
        date: '2003-03-28',
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2003032530&table_name=loi',
      authority: 'Service Public Fédéral Intérieur',
    },
    {
      type: 'arrete_royal',
      title: 'Arrêté royal déterminant le modèle des cartes d\'identité pour enfants de moins de douze ans',
      date: '2019-10-18',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2019101808&table_name=loi',
      authority: 'Service Public Fédéral Intérieur',
    },
  ],

  recentAmendments: [
    {
      type: 'loi',
      title: 'Loi modifiant la loi du 19 juillet 1991 concernant les empreintes digitales',
      date: '2020-05-20',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2020052001&table_name=loi',
      authority: 'Service Public Fédéral Intérieur',
    },
  ],
};

// ========================================
// 2. CIVIL STATUS (CODE CIVIL)
// ========================================

export const CIVIL_STATUS_LEGAL: BenefitLegalFramework = {
  benefitName: 'État Civil',

  primaryLegislation: {
    type: 'code',
    title: 'Code Civil belge - Livre I: Des personnes',
    date: '1804-03-21',
    publication: {
      date: '1804-03-31',
      reference: 'Publication originale Napoléonienne',
    },
    articles: ['34-101'], // État civil
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032130&table_name=loi',
    lastAmended: '2024',
    authority: 'Service Public Fédéral Justice',
  },

  implementingLegislation: [
    {
      type: 'loi',
      title: 'Loi portant création de la Banque de Données des Actes de l\'État Civil (BAEC)',
      date: '2018-06-18',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2018061801&table_name=loi',
      authority: 'Service Public Fédéral Justice',
    },
  ],
};

// ========================================
// 3. MARRIAGE & PARTNERSHIP
// ========================================

export const MARRIAGE_LEGAL: BenefitLegalFramework = {
  benefitName: 'Mariage et Partenariat',

  primaryLegislation: {
    type: 'code',
    title: 'Code Civil - Livre I, Titre V: Du mariage',
    date: '1804-03-21',
    articles: ['143-228'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032133&table_name=loi',
    lastAmended: '2024',
    authority: 'Service Public Fédéral Justice',
  },

  implementingLegislation: [
    {
      type: 'loi',
      title: 'Loi instaurant la cohabitation légale',
      date: '1998-11-23',
      publication: {
        date: '1999-01-12',
      },
      articles: ['1475-1479'],
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1998112335&table_name=loi',
      authority: 'Service Public Fédéral Justice',
    },
    {
      type: 'loi',
      title: 'Loi ouvrant le mariage à des personnes de même sexe',
      date: '2003-02-13',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2003021336&table_name=loi',
      authority: 'Service Public Fédéral Justice',
    },
  ],
};

// ========================================
// 4. NAME & GENDER CHANGES
// ========================================

export const NAME_GENDER_LEGAL: BenefitLegalFramework = {
  benefitName: 'Changement de Nom et de Genre',

  primaryLegislation: {
    type: 'loi',
    title: 'Loi relative aux noms et prénoms',
    date: '1987-05-15',
    publication: {
      date: '1987-07-10',
    },
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1987051532&table_name=loi',
    lastAmended: '2022',
    authority: 'Service Public Fédéral Justice',
  },

  implementingLegislation: [
    {
      type: 'loi',
      title: 'Loi réformant des régimes relatifs aux personnes transgenres',
      date: '2017-06-25',
      publication: {
        date: '2017-07-10',
      },
      articles: ['135/1-135/3'],
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2017062503&table_name=loi',
      authority: 'Service Public Fédéral Justice',
    },
    {
      type: 'arrete_royal',
      title: 'Arrêté royal fixant le montant de la rétribution pour changement de prénom',
      date: '2018-07-18',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2018071803&table_name=loi',
      authority: 'Service Public Fédéral Justice',
    },
  ],
};

// ========================================
// 5. PRIVACY & DATA PROTECTION
// ========================================

export const PRIVACY_LEGAL: BenefitLegalFramework = {
  benefitName: 'Protection de la Vie Privée et RGPD',

  primaryLegislation: {
    type: 'loi',
    title: 'Loi relative à la protection des personnes physiques à l\'égard des traitements de données à caractère personnel',
    date: '2018-07-30',
    publication: {
      date: '2018-09-05',
    },
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2018073046&table_name=loi',
    authority: 'Autorité de Protection des Données',
  },

  implementingLegislation: [
    {
      type: 'loi',
      title: 'Loi portant création de l\'Autorité de protection des données',
      date: '2017-12-03',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2017120310&table_name=loi',
      authority: 'Autorité de Protection des Données',
    },
  ],

  recentAmendments: [
    {
      type: 'loi',
      title: 'Règlement (UE) 2016/679 (RGPD)',
      date: '2016-04-27',
      officialUrl: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679',
      alternativeUrls: ['https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679'],
      authority: 'Union Européenne',
    },
  ],
};

// ========================================
// 6. INHERITANCE & SUCCESSION
// ========================================

export const SUCCESSION_LEGAL: BenefitLegalFramework = {
  benefitName: 'Successions et Héritage',

  primaryLegislation: {
    type: 'code',
    title: 'Code Civil - Livre III, Titre I & II: Des successions',
    date: '1804-03-21',
    articles: ['718-1100'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032134&table_name=loi',
    lastAmended: '2024',
    authority: 'Service Public Fédéral Justice',
  },

  implementingLegislation: [
    {
      type: 'loi',
      title: 'Loi modifiant le Code civil en ce qui concerne les successions et les libéralités',
      date: '2017-07-31',
      publication: {
        date: '2017-09-01',
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2017073105&table_name=loi',
      authority: 'Service Public Fédéral Justice',
    },
  ],
};

// ========================================
// 7. ADOPTION & PARENTHOOD
// ========================================

export const ADOPTION_LEGAL: BenefitLegalFramework = {
  benefitName: 'Adoption et Filiation',

  primaryLegislation: {
    type: 'code',
    title: 'Code Civil - Livre I, Titre VII & VIII: De la filiation et de l\'adoption',
    date: '1804-03-21',
    articles: ['343-370'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032135&table_name=loi',
    lastAmended: '2024',
    authority: 'Service Public Fédéral Justice',
  },

  implementingLegislation: [
    {
      type: 'loi',
      title: 'Loi réformant l\'adoption',
      date: '2003-04-24',
      publication: {
        date: '2003-05-16',
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2003042432&table_name=loi',
      authority: 'Service Public Fédéral Justice',
    },
    {
      type: 'loi',
      title: 'Convention de La Haye sur l\'adoption internationale',
      date: '1993-05-29',
      officialUrl: 'https://www.hcch.net/fr/instruments/conventions/full-text/?cid=69',
      alternativeUrls: ['https://www.hcch.net/fr/instruments/conventions/full-text/?cid=69'],
      authority: 'Conférence de La Haye',
    },
  ],
};

// ========================================
// 8. LEGAL CAPACITY
// ========================================

export const LEGAL_CAPACITY: BenefitLegalFramework = {
  benefitName: 'Capacité Juridique et Protection',

  primaryLegislation: {
    type: 'loi',
    title: 'Loi réformant les régimes d\'incapacité et instaurant un nouveau statut de protection',
    date: '2013-03-17',
    publication: {
      date: '2013-06-14',
    },
    articles: ['488-502'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2013031714&table_name=loi',
    authority: 'Service Public Fédéral Justice',
  },

  implementingLegislation: [
    {
      type: 'code',
      title: 'Code Civil - Protection judiciaire',
      date: '1804-03-21',
      articles: ['488/1-502/16'],
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032137&table_name=loi',
      lastAmended: '2019',
      authority: 'Service Public Fédéral Justice',
    },
  ],
};

// ========================================
// KEY ARTICLES FOR CIVIL RIGHTS
// ========================================

export const CIVIL_RIGHTS_KEY_ARTICLES = {
  // Identity Documents
  'Article 6': {
    title: 'Obligation de carte d\'identité',
    content: 'Tout Belge âgé de quinze ans accomplis doit être titulaire d\'une carte d\'identité',
    source: 'Loi 19/07/1991',
  },

  'Article 6bis': {
    title: 'Kids-ID',
    content: 'Les enfants belges de moins de douze ans peuvent obtenir un document d\'identité électronique',
    source: 'Loi 19/07/1991',
  },

  // Marriage
  'Article 144': {
    title: 'Âge minimum pour le mariage',
    content: 'Nul ne peut contracter mariage avant dix-huit ans',
    source: 'Code Civil',
  },

  'Article 147': {
    title: 'Interdiction de la bigamie',
    content: 'On ne peut contracter un second mariage avant la dissolution du premier',
    source: 'Code Civil',
  },

  'Article 161-164': {
    title: 'Empêchements au mariage',
    content: 'Prohibitions de mariage entre certains degrés de parenté',
    source: 'Code Civil',
  },

  // Name Changes
  'Article 335': {
    title: 'Nom de l\'enfant',
    content: 'L\'enfant dont la filiation est établie à l\'égard de ses deux parents porte soit le nom de son père, soit le nom de sa mère, soit leurs deux noms accolés',
    source: 'Code Civil',
  },

  // Gender Change
  'Article 135/1': {
    title: 'Changement de l\'enregistrement du sexe',
    content: 'Tout Belge majeur ou Belge mineur émancipé qui a la conviction intime et durable d\'appartenir au sexe opposé à celui indiqué dans l\'acte de naissance',
    conditions: [
      'Être Belge ou résider légalement en Belgique',
      'Avoir atteint l\'âge de seize ans',
      'Déclaration devant l\'officier de l\'état civil',
    ],
    source: 'Loi 25/06/2017',
  },

  // GDPR Rights
  'Article 15 RGPD': {
    title: 'Droit d\'accès',
    content: 'La personne concernée a le droit d\'obtenir du responsable du traitement la confirmation que des données la concernant sont ou ne sont pas traitées',
    source: 'RGPD',
  },

  'Article 17 RGPD': {
    title: 'Droit à l\'effacement',
    content: 'La personne concernée a le droit d\'obtenir l\'effacement de données la concernant',
    exceptions: [
      'Liberté d\'expression et d\'information',
      'Respect d\'une obligation légale',
      'Motifs d\'intérêt public dans le domaine de la santé',
      'Fins archivistiques, recherche scientifique ou historique',
      'Constatation, exercice ou défense de droits en justice',
    ],
    source: 'RGPD',
  },

  'Article 20 RGPD': {
    title: 'Droit à la portabilité',
    content: 'La personne concernée a le droit de recevoir les données dans un format structuré, couramment utilisé et lisible par machine',
    source: 'RGPD',
  },

  'Article 21 RGPD': {
    title: 'Droit d\'opposition',
    content: 'La personne concernée a le droit de s\'opposer à tout moment au traitement des données',
    special: 'Opposition au marketing direct sans justification nécessaire',
    source: 'RGPD',
  },

  // Succession
  'Article 718': {
    title: 'Ouverture des successions',
    content: 'Les successions s\'ouvrent par la mort',
    source: 'Code Civil',
  },

  'Article 784': {
    title: 'Options successorales',
    content: 'L\'héritier a trois options: accepter purement et simplement, accepter sous bénéfice d\'inventaire, ou renoncer',
    deadline: '4 mois pour la déclaration, possibilité de prolongation',
    source: 'Code Civil',
  },

  // Adoption
  'Article 343': {
    title: 'Conditions de l\'adoption',
    content: 'L\'adoption n\'est permise qu\'aux personnes de l\'un ou de l\'autre sexe, âgées de vingt-cinq ans au moins',
    conditions: [
      'Différence d\'âge de 15 ans minimum avec l\'adopté',
      'Consentement de l\'adopté de plus de 12 ans',
      'Enquête sociale préalable',
    ],
    source: 'Code Civil',
  },

  // Legal Capacity
  'Article 488/1': {
    title: 'Protection judiciaire',
    content: 'Le juge de paix peut ordonner une mesure de protection judiciaire à l\'égard de la personne majeure qui, en raison de son état de santé, est totalement ou partiellement hors d\'état d\'assumer elle-même la gestion de ses intérêts patrimoniaux ou non patrimoniaux',
    source: 'Code Civil',
  },
};

// ========================================
// ADMINISTRATIVE AUTHORITIES
// ========================================

export const CIVIL_RIGHTS_AUTHORITIES = {
  IDENTITY_DOCUMENTS: {
    name: 'Service Public Fédéral Intérieur',
    department: 'Direction générale Institutions et Population',
    website: 'https://www.ibz.rrn.fgov.be',
    competences: [
      'Cartes d\'identité',
      'Passeports',
      'Registre national',
      'Documents de voyage',
    ],
  },

  CIVIL_STATUS: {
    name: 'Service Public Fédéral Justice',
    department: 'Direction générale de la Législation',
    website: 'https://justice.belgium.be',
    competences: [
      'État civil',
      'Nationalité',
      'Adoption',
      'Changement de nom',
    ],
  },

  PRIVACY: {
    name: 'Autorité de Protection des Données',
    acronym: 'APD',
    website: 'https://www.dataprotectionauthority.be',
    competences: [
      'RGPD',
      'Vie privée',
      'Traitement des données',
      'Plaintes privacy',
    ],
  },

  LOCAL: {
    name: 'Administrations communales',
    role: 'Guichet de proximité',
    competences: [
      'Délivrance documents',
      'Enregistrement état civil',
      'Célébration mariages',
      'Domiciliation',
    ],
  },
};

// ========================================
// FEES AND DEADLINES (2024)
// ========================================

export const CIVIL_RIGHTS_FEES_2024 = {
  IDENTITY_DOCUMENTS: {
    'carte-identite': { normal: 20, urgent: 90, veryUrgent: 135 },
    'carte-identite-enfant': { normal: 10, urgent: 50, veryUrgent: 90 },
    'passeport': { normal: 65, urgent: 240, veryUrgent: 290 },
    'titre-voyage': { normal: 50, urgent: 180 },
  },

  CIVIL_STATUS_ACTS: {
    'acte-naissance': 25,
    'acte-mariage': 25,
    'acte-deces': 25,
    'extrait-casier-judiciaire': 20,
    'certificat-nationalite': 50,
    'certificat-residence': 10,
  },

  NAME_GENDER: {
    'changement-prenom': 490,
    'changement-nom': 890,
    'changement-genre': 135,
    'rectification-acte': 50,
  },

  MARRIAGE: {
    'declaration-mariage': 50,
    'cohabitation-legale': 25,
    'divorce-consentement-mutuel': 500, // minimum notary fees
    'divorce-desunion': 800, // court fees
  },
};

export const CIVIL_RIGHTS_DEADLINES = {
  IDENTITY_DOCUMENTS: {
    normal: '7 jours ouvrables',
    urgent: '2 jours ouvrables',
    veryUrgent: '24 heures',
    validity: {
      adult: '10 ans',
      minor: '5 ans',
      kidsId: '3 ans',
    },
  },

  MARRIAGE: {
    bannsPublication: '14 jours minimum',
    validityAfterBanns: '365 jours',
    parquetReview: '5 mois maximum',
    oppositionResolution: '6 mois maximum',
  },

  GDPR: {
    standardResponse: '30 jours',
    complexExtension: '60 jours supplémentaires',
    dataBreachNotification: '72 heures',
    dataBreachToIndividuals: 'Sans délai injustifié',
  },

  SUCCESSION: {
    declaration: '4 mois',
    taxPayment: '2 mois après déclaration',
    renunciation: '3 mois',
    benefitOfInventory: '3 mois et 40 jours',
  },

  NAME_CHANGE: {
    processingTime: '2-4 mois',
    publicationPeriod: '60 jours',
    oppositionPeriod: '60 jours',
  },
};