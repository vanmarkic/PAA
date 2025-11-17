/**
 * Belgian Legal Sources for Democratic Procedures
 * Sources juridiques belges pour les procédures démocratiques
 */

import { LegalFramework, LegalReference } from '../domain/legalMetadata';

/**
 * Code électoral belge - Primary electoral legislation
 */
export const CODE_ELECTORAL: LegalFramework = {
  primaryLegislation: {
    title: 'Code électoral',
    date: '12 avril 1894',
    officialUrl: 'https://www.ejustice.just.fgov.be/eli/code/1894/04/12/1894041255/justel',
    authority: 'Législateur fédéral belge',
    lastAmended: '2024-01-15',
    articles: [
      {
        number: '1',
        title: 'Électorat',
        content: 'Pour être électeur, il faut: 1° être Belge; 2° être âgé de dix-huit ans accomplis; 3° être inscrit aux registres de population d\'une commune belge; 4° ne pas se trouver dans l\'un des cas d\'exclusion ou de suspension prévus par le présent code.',
      },
      {
        number: '4',
        title: 'Listes électorales',
        content: 'Les administrations communales dressent les listes des électeurs. L\'inscription est automatique pour les citoyens belges.',
      },
      {
        number: '209',
        title: 'Sanctions',
        content: 'L\'électeur qui n\'aura pas pris part au scrutin sera puni d\'une amende de 40 à 80 euros. En cas de récidive, l\'amende sera de 80 à 200 euros.',
      },
    ],
  },
  implementingLegislation: [
    {
      title: 'Arrêté royal du 12 mars 2023 fixant les montants des amendes électorales',
      date: '12 mars 2023',
      officialUrl: 'https://www.ejustice.just.fgov.be',
      authority: 'Roi des Belges',
    },
  ],
  notes: 'Le Code électoral régit toutes les élections en Belgique: fédérales, régionales, communales et européennes.',
};

/**
 * Constitution belge - Political rights
 */
export const CONSTITUTION_DROITS_POLITIQUES: LegalFramework = {
  primaryLegislation: {
    title: 'Constitution belge - Titre II: Des Belges et de leurs droits',
    date: '17 février 1994 (coordination)',
    officialUrl: 'https://www.ejustice.just.fgov.be/eli/constitution/1994/02/17/1994021048/justel',
    authority: 'Pouvoir constituant',
    lastAmended: '2024-02-01',
    articles: [
      {
        number: '61',
        title: 'Éligibilité',
        content: 'Les membres de la Chambre des représentants sont élus directement par les citoyens âgés de dix-huit ans accomplis et ne se trouvant pas dans l\'un des cas d\'exclusion prévus par la loi.',
      },
      {
        number: '62',
        title: 'Vote obligatoire et secret',
        content: 'Le vote est obligatoire et secret. Il a lieu à la commune, sauf les exceptions à déterminer par la loi.',
      },
      {
        number: '64',
        title: 'Représentation proportionnelle',
        content: 'Le système électoral est basé sur le principe de la représentation proportionnelle.',
      },
    ],
  },
  notes: 'La Constitution garantit les droits politiques fondamentaux et établit les principes du système électoral belge.',
};

/**
 * Law on petitions
 */
export const LOI_PETITIONS: LegalFramework = {
  primaryLegislation: {
    title: 'Loi du 28 mars 1932 sur les pétitions',
    date: '28 mars 1932',
    officialUrl: 'https://www.ejustice.just.fgov.be',
    authority: 'Législateur fédéral',
    lastAmended: '2019-05-02',
    articles: [
      {
        number: '1',
        title: 'Droit de pétition',
        content: 'Toute personne a le droit d\'adresser aux autorités publiques des pétitions signées par une ou plusieurs personnes.',
      },
      {
        number: '2',
        title: 'Forme des pétitions',
        content: 'Les pétitions doivent être écrites en français, néerlandais ou allemand, selon la région linguistique.',
      },
    ],
  },
  implementingLegislation: [
    {
      title: 'Règlement de la Chambre des représentants - Chapitre des pétitions',
      date: '20 décembre 2019',
      officialUrl: 'https://www.lachambre.be',
      authority: 'Chambre des représentants',
    },
  ],
  notes: 'Le droit de pétition est un droit constitutionnel permettant aux citoyens de s\'adresser directement aux autorités.',
};

/**
 * EU citizens voting rights
 */
export const LOI_CITOYENS_EU: LegalFramework = {
  primaryLegislation: {
    title: 'Loi du 23 mars 1989 relative à l\'élection du Parlement européen',
    date: '23 mars 1989',
    officialUrl: 'https://www.ejustice.just.fgov.be',
    authority: 'Législateur fédéral',
    lastAmended: '2023-06-15',
  },
  implementingLegislation: [
    {
      title: 'Loi du 27 janvier 1999 permettant aux citoyens de l\'UE de voter aux élections communales',
      date: '27 janvier 1999',
      officialUrl: 'https://www.ejustice.just.fgov.be',
      authority: 'Législateur fédéral',
    },
  ],
  notes: 'Les citoyens européens résidant en Belgique peuvent voter aux élections européennes et communales sur inscription volontaire.',
};

/**
 * Non-EU residents voting rights
 */
export const LOI_RESIDENTS_NON_EU: LegalFramework = {
  primaryLegislation: {
    title: 'Loi du 19 mars 2004 visant à octroyer le droit de vote aux élections communales aux étrangers',
    date: '19 mars 2004',
    officialUrl: 'https://www.ejustice.just.fgov.be',
    authority: 'Législateur fédéral',
    lastAmended: '2023-01-20',
    articles: [
      {
        number: '1bis',
        title: 'Conditions pour les non-européens',
        content: 'Les étrangers non-européens peuvent voter aux élections communales s\'ils résident légalement en Belgique depuis au moins 5 ans et s\'engagent à respecter la Constitution, les lois et la Convention européenne des droits de l\'homme.',
      },
    ],
  },
  notes: 'Cette loi étend le droit de vote communal aux résidents non-européens sous conditions strictes.',
};

/**
 * Popular consultations
 */
export const LOI_CONSULTATIONS_POPULAIRES: LegalFramework = {
  primaryLegislation: {
    title: 'Loi du 14 janvier 2013 portant diverses dispositions en matière de consultations populaires',
    date: '14 janvier 2013',
    officialUrl: 'https://www.ejustice.just.fgov.be',
    authority: 'Législateur fédéral',
    lastAmended: '2022-09-01',
  },
  implementingLegislation: [
    {
      title: 'Ordonnance bruxelloise du 18 juillet 2013 organisant les consultations populaires régionales',
      date: '18 juillet 2013',
      officialUrl: 'https://www.ejustice.just.fgov.be',
      authority: 'Parlement de la Région de Bruxelles-Capitale',
    },
    {
      title: 'Décret wallon du 22 novembre 2018 sur les consultations populaires communales',
      date: '22 novembre 2018',
      officialUrl: 'https://www.ejustice.just.fgov.be',
      authority: 'Parlement wallon',
    },
  ],
  notes: 'Les consultations populaires sont non-contraignantes et organisées au niveau communal ou régional.',
};

/**
 * European Citizens' Initiative
 */
export const EU_CITIZEN_INITIATIVE: LegalFramework = {
  primaryLegislation: {
    title: 'Règlement (UE) 2019/788 relatif à l\'initiative citoyenne européenne',
    date: '17 avril 2019',
    officialUrl: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32019R0788',
    authority: 'Parlement européen et Conseil de l\'UE',
    lastAmended: '2020-01-01',
    articles: [
      {
        number: '3',
        title: 'Seuils',
        content: 'Une initiative citoyenne doit recueillir au moins un million de signatures provenant d\'au moins sept États membres.',
      },
    ],
  },
  notes: 'L\'ICE permet aux citoyens européens de proposer des changements législatifs à la Commission européenne.',
};

/**
 * Campaign finance laws
 */
export const LOI_FINANCEMENT_POLITIQUE: LegalFramework = {
  primaryLegislation: {
    title: 'Loi du 4 juillet 1989 relative à la limitation et au contrôle des dépenses électorales',
    date: '4 juillet 1989',
    officialUrl: 'https://www.ejustice.just.fgov.be',
    authority: 'Législateur fédéral',
    lastAmended: '2023-12-01',
    articles: [
      {
        number: '16bis',
        title: 'Dons limités',
        content: 'Les dons de personnes physiques sont limités à 500 euros par an et par parti. Les dons d\'entreprises sont interdits.',
      },
      {
        number: '16ter',
        title: 'Transparence',
        content: 'Tout don supérieur à 125 euros doit être déclaré et l\'identité du donateur rendue publique.',
      },
    ],
  },
  notes: 'La Belgique a des règles strictes sur le financement politique pour garantir la transparence et limiter l\'influence de l\'argent.',
};

/**
 * Municipal council participation
 */
export const NOUVELLE_LOI_COMMUNALE: LegalReference = {
  title: 'Nouvelle loi communale - Droit d\'interpellation',
  date: '24 juin 1988',
  officialUrl: 'https://www.ejustice.just.fgov.be',
  authority: 'Législateur fédéral',
  lastAmended: '2023-03-15',
  type: 'loi',
  publicationDate: '3 septembre 1988',
  sections: [
    {
      title: 'Article 88',
      content: 'Les habitants de la commune ont le droit d\'interpeller le collège communal en séance publique du conseil.',
    },
  ],
};

/**
 * Electoral offense sanctions
 */
export const CODE_PENAL_ELECTORAL: LegalReference = {
  title: 'Code pénal - Infractions électorales',
  date: '8 juin 1867',
  officialUrl: 'https://www.ejustice.just.fgov.be',
  authority: 'Législateur fédéral',
  lastAmended: '2023-11-01',
  type: 'code',
  sections: [
    {
      title: 'Articles 200-210',
      content: 'Sanctions pour fraude électorale, vote multiple, corruption électorale, violence ou menaces.',
    },
  ],
};

/**
 * Key democratic procedures and their legal bases
 */
export const DEMOCRATIC_PROCEDURES_LEGAL_BASIS = {
  'inscription-electorale': {
    laws: [CODE_ELECTORAL, CONSTITUTION_DROITS_POLITIQUES],
    description: 'Inscription sur les listes électorales',
  },
  'vote-elections': {
    laws: [CODE_ELECTORAL, CONSTITUTION_DROITS_POLITIQUES],
    description: 'Participation aux élections',
  },
  'petition': {
    laws: [LOI_PETITIONS, CONSTITUTION_DROITS_POLITIQUES],
    description: 'Droit de pétition',
  },
  'initiative-citoyenne-eu': {
    laws: [EU_CITIZEN_INITIATIVE],
    description: 'Initiative citoyenne européenne',
  },
  'consultation-populaire': {
    laws: [LOI_CONSULTATIONS_POPULAIRES],
    description: 'Participation aux consultations populaires',
  },
  'interpellation-communale': {
    laws: [NOUVELLE_LOI_COMMUNALE],
    description: 'Interpellation du conseil communal',
  },
  'vote-citoyen-eu': {
    laws: [LOI_CITOYENS_EU, CODE_ELECTORAL],
    description: 'Vote des citoyens européens',
  },
  'vote-resident-non-eu': {
    laws: [LOI_RESIDENTS_NON_EU, CODE_ELECTORAL],
    description: 'Vote des résidents non-européens',
  },
  'financement-politique': {
    laws: [LOI_FINANCEMENT_POLITIQUE],
    description: 'Règles de financement politique',
  },
};

/**
 * Export all legal references
 */
export const DEMOCRATIE_LEGAL_REFERENCES = {
  CODE_ELECTORAL,
  CONSTITUTION_DROITS_POLITIQUES,
  LOI_PETITIONS,
  LOI_CITOYENS_EU,
  LOI_RESIDENTS_NON_EU,
  LOI_CONSULTATIONS_POPULAIRES,
  EU_CITIZEN_INITIATIVE,
  LOI_FINANCEMENT_POLITIQUE,
  NOUVELLE_LOI_COMMUNALE,
  CODE_PENAL_ELECTORAL,
};