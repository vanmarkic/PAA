/**
 * Business Rules for Aide Sociale du CPAS
 *
 * Implements comprehensive eligibility rules for Social Aid from CPAS.
 * Based on features/benefits/aide-sociale.feature Gherkin specifications.
 *
 * BASE JURIDIQUE:
 * - Loi organique des centres publics d'action sociale du 8 juillet 1976
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1976070834&table_name=loi
 * - Loi du 26 mai 2002 concernant le droit à l'intégration sociale
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi
 * - Arrêté royal du 12 décembre 1996 relatif à l'aide médicale urgente
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1996121231&table_name=loi
 * - Autorité: Centres Publics d'Action Sociale (CPAS) - niveau communal
 * - Dernière modification: 2024
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../domain/types';

// Types spécifiques pour l'aide sociale
export type AideSocialeType =
  | 'aide-medicale-urgente'
  | 'aide-sociale-equivalente-ris'
  | 'aide-en-nature'
  | 'avance-sur-prestations'
  | 'aide-complementaire'
  | 'aide-urgence';

export type ResidencyStatus =
  | 'belgian-citizen'
  | 'eu-citizen'
  | 'long-term-resident'
  | 'refugee'
  | 'asylum-seeker'
  | 'no-valid-status'
  | 'student-visa'
  | 'unaccompanied-minor';

// Montants RIS de référence 2024 (utilisés pour aide équivalente)
const RIS_AMOUNTS_2024 = {
  isolated: 1070.49,
  cohabitant: 713.66,
  familyCharge: 1447.22,
};

// Constantes pour l'aide sociale
const AIDE_SOCIALE_CONSTANTS = {
  decisionDelay: 30, // jours maximum pour décision
  paymentDelay: 15, // jours après décision positive
  appealDelay: 90, // 3 mois pour recours
  urgencyAidDuration: 30, // jours maximum aide d'urgence
  enqueteSocialeDelay: 30, // jours pour enquête sociale
  recuperationYears: 5, // années pour récupération meilleure fortune
};

/**
 * Create the comprehensive Aide Sociale eligibility rules engine
 */
function createAideSocialeEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Sans papiers - aide médicale urgente uniquement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'no-valid-status',
        },
        {
          fact: 'needsUrgentMedicalCare',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-medicale-urgente-eligible',
      params: {
        aidType: 'aide-medicale-urgente',
        message: 'aide médicale urgente pour personnes sans titre de séjour',
        restrictions: ['Pas d\'aide financière régulière', 'Uniquement soins médicaux urgents'],
      },
    },
    priority: 10,
  });

  // Rule 2: Mineur non accompagné - aide sociale spécifique
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'unaccompanied-minor',
        },
        {
          fact: 'age',
          operator: 'lessThan',
          value: 18,
        },
      ],
    },
    event: {
      type: 'aide-sociale-mineur-eligible',
      params: {
        aidType: 'aide-sociale-equivalente-ris',
        message: 'mineurs exclus du RIS mais éligibles aide sociale',
        amount: RIS_AMOUNTS_2024.isolated,
        coverage: ['hébergement', 'nourriture', 'vêtements', 'frais scolaires'],
        tuteur: 'désignation par service des tutelles requise',
      },
    },
    priority: 9,
  });

  // Rule 3: Étudiant étranger hors UE - aide très limitée
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'student-visa',
        },
        {
          fact: 'hasGuarantorDefault',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-sociale-etudiant-limited',
      params: {
        aidType: 'aide-urgence',
        message: 'étudiant avec garant défaillant',
        conditions: 'aide exceptionnelle et temporaire',
        verification: 'vérification engagement de prise en charge',
      },
    },
    priority: 8,
  });

  // Rule 4: Demandeur d'asile - aide équivalente RIS
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'asylum-seeker',
        },
        {
          fact: 'asylumProcedureActive',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-sociale-demandeur-asile',
      params: {
        aidType: 'aide-sociale-equivalente-ris',
        message: 'demandeur d\'asile en procédure',
        baseAmount: RIS_AMOUNTS_2024.isolated,
        note: 'Aide équivalente au RIS pendant procédure d\'asile',
      },
    },
    priority: 7,
  });

  // Rule 5: En attente d'autres allocations - avance récupérable
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'awaitingBenefits',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasNoIncome',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'nationality',
          operator: 'in',
          value: ['belgian', 'eu-citizen', 'long-term-resident'],
        },
      ],
    },
    event: {
      type: 'avance-sur-prestations-eligible',
      params: {
        aidType: 'avance-sur-prestations',
        message: 'avance sur allocations en attente',
        recoverable: true,
        amount: 'équivalent RIS selon situation familiale',
        contact: 'CPAS contacte organisme pour accélérer traitement',
      },
    },
    priority: 6,
  });

  // Rule 6: Européen < 3 mois séjour - aide urgence uniquement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'eu-citizen',
        },
        {
          fact: 'residenceDurationMonths',
          operator: 'lessThan',
          value: 3,
        },
      ],
    },
    event: {
      type: 'aide-urgence-europeen',
      params: {
        aidType: 'aide-urgence',
        message: 'aide sociale d\'urgence pour européen < 3 mois',
        limitations: [
          'Aide limitée dans le temps',
          'Ne peut créer charge déraisonnable',
          'Possible retour volontaire',
        ],
      },
    },
    priority: 6,
  });

  // Rule 7: Personne avec handicap - aide complémentaire
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasDisability',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasSpecificNeeds',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-complementaire-handicap',
      params: {
        aidType: 'aide-complementaire',
        message: 'aide sociale complémentaire pour personne avec handicap',
        possibleAids: [
          'Adaptation logement',
          'Matériel médical non INAMI',
          'Transport adapté',
          'Aide familiale supplémentaire',
        ],
        collaboration: 'CPAS collabore avec AVIQ/PHARE',
      },
    },
    priority: 5,
  });

  // Rule 8: Situation d'urgence immédiate
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'inEmergencySituation',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasNoResources',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-urgence-immediate',
      params: {
        aidType: 'aide-urgence',
        message: 'aide d\'urgence immédiate',
        includes: [
          'Hébergement d\'urgence',
          'Repas (tickets ou colis)',
          'Soins médicaux urgents',
          'Vêtements de base',
        ],
        duration: `Maximum ${AIDE_SOCIALE_CONSTANTS.urgencyAidDuration} jours`,
        followUp: 'Enquête sociale complète dans les 30 jours',
      },
    },
    priority: 10,
  });

  // Rule 9: Aide en nature pour familles
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasDependentChildren',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'needsSupplementaryAid',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-en-nature-famille',
      params: {
        aidType: 'aide-en-nature',
        message: 'aide en nature pour famille avec enfants',
        types: [
          'Colis alimentaires via banque alimentaire',
          'Bons d\'achat pour vêtements et fournitures',
          'Abonnement transports publics',
          'Chèques sport/culture pour enfants',
        ],
        evaluation: 'Réévaluation tous les 3 mois',
      },
    },
    priority: 5,
  });

  // Rule 10: Personne âgée avec GRAPA insuffisante
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: 65,
        },
        {
          fact: 'receivesGRAPA',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasAdditionalNeeds',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-complementaire-senior',
      params: {
        aidType: 'aide-complementaire',
        message: 'aide sociale complémentaire pour personne âgée',
        possibleAids: [
          'Garantie locative (max 3 mois loyer)',
          'Frais pharmaceutiques non remboursés',
          'Frais de chauffage (fonds social mazout/gaz)',
          'Aide ménagère (titres-services subsidiés)',
        ],
        procedure: 'Enquête sociale complète et analyse budgétaire',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the Aide Sociale rules engine
 * SCALABILITY IMPROVEMENT: Reuse engine instance instead of recreating on every call
 */
const aideSocialeEngineInstance = createAideSocialeEngine();

/**
 * Calculate Aide Sociale amount based on type and situation
 */
export function calculateAideSocialeAmount(
  aidType: AideSocialeType,
  familySituation: 'isolated' | 'cohabitant' | 'family-charge',
  currentIncome: number = 0,
  specificNeeds: number = 0
): { monthlyAmount: number; description: string; recoverable: boolean } {
  switch (aidType) {
    case 'aide-medicale-urgente':
      return {
        monthlyAmount: 0, // Prise en charge directe des frais
        description: 'Prise en charge des frais médicaux urgents',
        recoverable: false,
      };

    case 'aide-sociale-equivalente-ris':
      const risAmount =
        familySituation === 'family-charge' ? RIS_AMOUNTS_2024.familyCharge :
        familySituation === 'isolated' ? RIS_AMOUNTS_2024.isolated :
        RIS_AMOUNTS_2024.cohabitant;

      const netAmount = Math.max(0, risAmount - currentIncome);
      return {
        monthlyAmount: netAmount,
        description: `Aide équivalente au RIS catégorie ${familySituation}`,
        recoverable: false,
      };

    case 'avance-sur-prestations':
      const avanceAmount =
        familySituation === 'family-charge' ? RIS_AMOUNTS_2024.familyCharge :
        familySituation === 'isolated' ? RIS_AMOUNTS_2024.isolated :
        RIS_AMOUNTS_2024.cohabitant;

      return {
        monthlyAmount: avanceAmount,
        description: 'Avance récupérable sur prestations sociales',
        recoverable: true,
      };

    case 'aide-complementaire':
      return {
        monthlyAmount: specificNeeds,
        description: 'Aide complémentaire selon besoins évalués',
        recoverable: false,
      };

    case 'aide-en-nature':
      return {
        monthlyAmount: specificNeeds,
        description: 'Valeur estimée de l\'aide en nature',
        recoverable: false,
      };

    case 'aide-urgence':
      return {
        monthlyAmount: specificNeeds,
        description: `Aide d'urgence limitée à ${AIDE_SOCIALE_CONSTANTS.urgencyAidDuration} jours`,
        recoverable: false,
      };

    default:
      return {
        monthlyAmount: 0,
        description: 'Type d\'aide non défini',
        recoverable: false,
      };
  }
}

/**
 * Check Aide Sociale eligibility with comprehensive rules
 */
export async function checkAideSocialeEligibility(user: {
  age: number;
  residencyStatus: ResidencyStatus;
  nationality?: string;
  hasNoIncome?: boolean;
  hasNoResources?: boolean;
  needsUrgentMedicalCare?: boolean;
  hasGuarantorDefault?: boolean;
  asylumProcedureActive?: boolean;
  awaitingBenefits?: boolean;
  residenceDurationMonths?: number;
  hasDisability?: boolean;
  hasSpecificNeeds?: boolean;
  inEmergencySituation?: boolean;
  hasDependentChildren?: boolean;
  needsSupplementaryAid?: boolean;
  receivesGRAPA?: boolean;
  hasAdditionalNeeds?: boolean;
  familySituation?: 'isolated' | 'cohabitant' | 'family-charge';
  currentIncome?: number;
}): Promise<EligibilityCheck> {
  const facts = {
    age: user.age,
    residencyStatus: user.residencyStatus,
    nationality: user.nationality || 'unknown',
    hasNoIncome: user.hasNoIncome || false,
    hasNoResources: user.hasNoResources || false,
    needsUrgentMedicalCare: user.needsUrgentMedicalCare || false,
    hasGuarantorDefault: user.hasGuarantorDefault || false,
    asylumProcedureActive: user.asylumProcedureActive || false,
    awaitingBenefits: user.awaitingBenefits || false,
    residenceDurationMonths: user.residenceDurationMonths || 0,
    hasDisability: user.hasDisability || false,
    hasSpecificNeeds: user.hasSpecificNeeds || false,
    inEmergencySituation: user.inEmergencySituation || false,
    hasDependentChildren: user.hasDependentChildren || false,
    needsSupplementaryAid: user.needsSupplementaryAid || false,
    receivesGRAPA: user.receivesGRAPA || false,
    hasAdditionalNeeds: user.hasAdditionalNeeds || false,
  };

  try {
    const results = await aideSocialeEngineInstance.run(facts);

    // Check for any eligible events
    const eligibleEvents = results.events.filter((e) => e.type.includes('eligible'));

    if (eligibleEvents.length === 0) {
      return {
        benefitType: 'housing-allowance', // Using as placeholder
        isEligible: false,
        reason: 'Aucune aide sociale applicable selon votre situation',
      };
    }

    // Get the highest priority eligible event
    const primaryEvent = eligibleEvents[0];
    const aidType = primaryEvent.params?.aidType as AideSocialeType;

    // Calculate amount if applicable
    const calculation = calculateAideSocialeAmount(
      aidType,
      user.familySituation || 'isolated',
      user.currentIncome || 0,
      100 // Default specific needs amount
    );

    const obligations = [
      'Déclarer tout changement de situation',
      'Collaborer à l\'enquête sociale',
      'Faire valoir tous vos droits',
      'Résider effectivement en Belgique',
    ];

    if (primaryEvent.params?.conditions) {
      obligations.push(primaryEvent.params.conditions);
    }

    return {
      benefitType: 'housing-allowance', // Using as placeholder
      isEligible: true,
      calculatedAmount: calculation.monthlyAmount,
      reason: primaryEvent.params?.message,
      optimizationSuggestion: `${calculation.description} - ${calculation.recoverable ? 'Récupérable' : 'Non récupérable'}`,
    };
  } catch (error) {
    throw new Error(`Error checking Aide Sociale eligibility: ${error}`);
  }
}

/**
 * Get information about Aide Sociale application procedure
 */
export function getAideSocialeProcedure() {
  return {
    authority: 'Centre Public d\'Action Sociale (CPAS) de votre commune',
    steps: [
      {
        step: 'Accusé de réception',
        delay: 'Immédiat',
        description: 'Preuve de dépôt de demande',
      },
      {
        step: 'Enquête sociale',
        delay: `${AIDE_SOCIALE_CONSTANTS.enqueteSocialeDelay} jours maximum`,
        description: 'Visite à domicile, vérifications',
      },
      {
        step: 'Audition',
        delay: 'Facultative',
        description: 'Présentation devant le conseil',
      },
      {
        step: 'Décision',
        delay: `${AIDE_SOCIALE_CONSTANTS.decisionDelay} jours`,
        description: 'Notification écrite motivée',
      },
      {
        step: 'Paiement',
        delay: `${AIDE_SOCIALE_CONSTANTS.paymentDelay} jours`,
        description: 'Après décision positive',
      },
      {
        step: 'Recours',
        delay: `${AIDE_SOCIALE_CONSTANTS.appealDelay / 30} mois`,
        description: 'Tribunal du travail si refus',
      },
    ],
    documents: [
      'Carte d\'identité ou titre de séjour',
      'Composition de ménage',
      'Preuves de revenus',
      'Contrat de bail',
      'Attestations médicales si nécessaire',
      'Preuves de charges (factures, dettes)',
    ],
  };
}

/**
 * Get information about recuperation rules
 */
export function getRecuperationRules() {
  return {
    cases: [
      {
        case: 'Retour à meilleure fortune',
        delay: `Dans les ${AIDE_SOCIALE_CONSTANTS.recuperationYears} ans`,
        conditions: 'Montants raisonnables selon amélioration',
      },
      {
        case: 'Auprès des débiteurs d\'aliments',
        targets: 'Parents, enfants selon capacité',
        conditions: 'Si débiteurs ont capacité suffisante',
      },
      {
        case: 'Erreur ou fraude',
        obligation: 'Récupération totale obligatoire',
        sanctions: 'Possibles poursuites pénales',
      },
      {
        case: 'Avance sur prestations',
        automatic: true,
        description: 'Récupération automatique sur prestations',
      },
    ],
    exceptions: [
      'Aide minimale de survie',
      'Aide médicale urgente',
      'Aide accordée aux mineurs',
    ],
    procedure: 'Le CPAS doit motiver sa décision de récupération',
  };
}

/**
 * Export comprehensive rules in JSON format for transparency
 * Avec références juridiques authentiques
 */
export const AIDESOCIALE_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: 'Loi organique des centres publics d\'action sociale',
      date: '1976-07-08',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1976070834&table_name=loi',
      authority: 'Centres Publics d\'Action Sociale (CPAS)',
      articles: ['1', '57', '57bis', '57ter', '60', '61'],
    },
    relatedLegislation: [
      {
        title: 'Loi concernant le droit à l\'intégration sociale',
        date: '2002-05-26',
        officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi',
        relevance: 'Définit RIS comme référence pour aide équivalente',
      },
      {
        title: 'Arrêté royal relatif à l\'aide médicale urgente',
        date: '1996-12-12',
        officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1996121231&table_name=loi',
        relevance: 'Aide médicale pour personnes sans titre de séjour',
      },
    ],
    notes: [
      'Aide sociale est subsidiaire au RIS et autres droits sociaux',
      'Compétence territoriale selon inscription au registre',
      'Principe de dignité humaine comme base',
      'Individualisation de l\'aide selon besoins',
    ],
  },
  aidTypes: {
    'aide-medicale-urgente': {
      beneficiaries: 'Personnes sans titre de séjour valide',
      coverage: 'Frais médicaux urgents uniquement',
      procedure: 'Via réquisitoire médical du CPAS',
      legalBasis: 'Article 57§2 loi CPAS + AR 12/12/1996',
    },
    'aide-sociale-equivalente-ris': {
      beneficiaries: 'Personnes exclues du RIS (mineurs, étrangers certains statuts)',
      amount: 'Montants équivalents au RIS selon catégorie',
      conditions: 'Mêmes conditions que RIS sauf critères d\'exclusion',
      legalBasis: 'Article 57§1 loi organique CPAS',
    },
    'aide-en-nature': {
      forms: ['Colis alimentaires', 'Bons d\'achat', 'Abonnements transport', 'Chèques culture'],
      evaluation: 'Selon besoins évalués par enquête sociale',
      cumul: 'Possible avec autres aides',
      legalBasis: 'Article 57§1 loi organique CPAS',
    },
    'avance-sur-prestations': {
      conditions: 'En attente d\'autres allocations sociales',
      recoverable: true,
      procedure: 'CPAS contacte organisme concerné',
      legalBasis: 'Article 99 loi organique CPAS',
    },
    'aide-complementaire': {
      for: ['Personnes âgées', 'Personnes handicapées', 'Familles en difficulté'],
      types: ['Garantie locative', 'Frais médicaux', 'Chauffage', 'Aide ménagère'],
      evaluation: 'Après enquête sociale et analyse budgétaire',
      legalBasis: 'Article 57§1 loi organique CPAS',
    },
    'aide-urgence': {
      duration: `Maximum ${AIDE_SOCIALE_CONSTANTS.urgencyAidDuration} jours`,
      coverage: ['Hébergement', 'Nourriture', 'Soins urgents', 'Vêtements'],
      followUp: 'Enquête sociale complète obligatoire',
      legalBasis: 'Article 57§1 et principe de dignité humaine',
    },
  },
  amounts: {
    reference: 'Montants RIS 2024',
    isolated: RIS_AMOUNTS_2024.isolated,
    cohabitant: RIS_AMOUNTS_2024.cohabitant,
    familyCharge: RIS_AMOUNTS_2024.familyCharge,
    indexation: 'Selon index santé comme RIS',
  },
  procedure: getAideSocialeProcedure(),
  recuperation: getRecuperationRules(),
  obligations: {
    beneficiary: [
      'Déclarer tout changement de situation',
      'Collaborer à l\'enquête sociale',
      'Faire valoir tous ses droits',
      'Résider effectivement en Belgique',
      'Respecter le contrat PIIS si applicable',
    ],
    cpas: [
      'Accusé de réception immédiat',
      'Décision dans les 30 jours',
      'Motivation écrite de la décision',
      'Information sur recours possibles',
      'Respect de la dignité humaine',
    ],
  },
  appeals: {
    tribunal: 'Tribunal du travail',
    delay: `${AIDE_SOCIALE_CONSTANTS.appealDelay} jours après notification`,
    assistance: 'Aide juridique gratuite possible',
    suspension: 'Recours non suspensif sauf urgence',
  },
  rules: [
    {
      id: 'aide-medicale-urgente',
      description: 'Aide médicale urgente pour sans-papiers',
      condition: 'residencyStatus == no-valid-status AND needsUrgentMedicalCare',
      priority: 10,
      legalBasis: 'Article 57§2 loi CPAS',
    },
    {
      id: 'aide-mineur-non-accompagne',
      description: 'Aide sociale pour mineur non accompagné',
      condition: 'age < 18 AND residencyStatus == unaccompanied-minor',
      priority: 9,
      legalBasis: 'Article 57§1 loi CPAS',
    },
    {
      id: 'aide-demandeur-asile',
      description: 'Aide équivalente RIS pour demandeur d\'asile',
      condition: 'residencyStatus == asylum-seeker AND asylumProcedureActive',
      priority: 7,
      legalBasis: 'Article 57ter loi CPAS',
    },
    {
      id: 'avance-prestations',
      description: 'Avance sur prestations sociales',
      condition: 'awaitingBenefits AND hasNoIncome',
      priority: 6,
      legalBasis: 'Article 99 loi CPAS',
    },
    {
      id: 'aide-urgence',
      description: 'Aide d\'urgence immédiate',
      condition: 'inEmergencySituation AND hasNoResources',
      priority: 10,
      legalBasis: 'Article 57§1 et dignité humaine',
    },
  ],
};