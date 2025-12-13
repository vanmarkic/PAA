/**
 * Business Rules for Allocations de Chômage
 *
 * Implements the Gherkin specifications from features/benefits/allocations-chomage.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Arrêté royal du 25 novembre 1991 portant réglementation du chômage
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112530&table_name=loi
 * - Loi du 3 juillet 1978 relative aux contrats de travail
 * - Réforme 2024 sur la limitation dans le temps des allocations de chômage
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * AllocationsChomage Rules Version Metadata
 * This version MUST match the specification version in features/benefits/allocations-chomage.feature
 */
export const ALLOCATIONS_CHOMAGE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/allocations-chomage.feature',
  generatedFrom: 'features/benefits/allocations-chomage.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law
export const CHOMAGE_CONSTANTS = {
  MIN_AGE: 18,
  DAYS_REQUIRED_UNDER_36: 312,
  MONTHS_REFERENCE_UNDER_36: 18,
  DAYS_REQUIRED_36_AND_OVER: 468,
  MONTHS_REFERENCE_36_AND_OVER: 24,
  AGE_THRESHOLD: 36,
  DAILY_CEILING: 65.48,
  MONTHLY_CEILING: 65.48 * 26, // Approximately 1702.48€
  MAX_FULL_ALLOCATION_MONTHS: 24,
  INSERTION_STAGE_DAYS: 310,
  INSERTION_MAX_DURATION_MONTHS: 12,
  TEMPORARY_UNEMPLOYMENT_RATE: 0.65,
  STANDARD_UNEMPLOYMENT_RATE: 0.60,
  TRAINING_HOURLY_BONUS: 1,
};

export const FAMILY_SITUATION_RATES = {
  WITH_DEPENDENTS: 0.75,
  ISOLATED: 0.60,
  COHABITANT: 0.55,
};

export type FamilySituation = 'avec charge' | 'isolé' | 'cohabitant';
export type UnemploymentType = 'licenciement_economique' | 'fin_cdd' | 'licenciement' | 'demission' | 'force_majeure' | 'temps_partiel' | 'insertion';

export interface ChomageUser {
  age: number;
  daysWorked: number;
  referenceMonths: number;
  monthlySalary: number;
  familySituation: FamilySituation;
  unemploymentType: UnemploymentType;
  isRegisteredWithONEM: boolean;
  isAvailableForWork: boolean;
  hasValidReason?: boolean;
  isTemporaryUnemployment?: boolean;
  isPartTime?: boolean;
  seekingFullTime?: boolean;
  hasCompletedInsertionStage?: boolean;
  hasDiploma?: boolean;
  monthsUnemployed?: number;
  isInApprovedTraining?: boolean;
}

export interface ChomageEligibilityResult {
  isEligible: boolean;
  reason?: string;
  monthlyAmount?: number;
  category?: string;
  maxDuration?: string;
  rate?: string;
  sanctionPeriod?: string;
  obligations?: string[];
  additionalInfo?: string[];
}

/**
 * Create the AllocationsChomage eligibility rules engine
 */
function createAllocationsChomageEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement (must be 18+)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: CHOMAGE_CONSTANTS.MIN_AGE,
        },
      ],
    },
    event: {
      type: 'allocationsChomage-ineligible',
      params: {
        reason: `âge minimum non atteint (${CHOMAGE_CONSTANTS.MIN_AGE} ans requis)`,
        priority: 100,
      },
    },
    priority: 100,
  });

  // Rule 2: Voluntary resignation without valid reason - sanction period
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'unemploymentType',
          operator: 'equal',
          value: 'demission',
        },
        {
          fact: 'hasValidReason',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'allocationsChomage-sanction',
      params: {
        reason: 'démission volontaire - période de sanction applicable',
        sanctionPeriod: '4 à 52 semaines selon les circonstances',
        priority: 90,
      },
    },
    priority: 90,
  });

  // Rule 3: Insufficient work days for workers under 36
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: CHOMAGE_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'age',
          operator: 'lessThan',
          value: CHOMAGE_CONSTANTS.AGE_THRESHOLD,
        },
        {
          fact: 'daysWorked',
          operator: 'lessThan',
          value: CHOMAGE_CONSTANTS.DAYS_REQUIRED_UNDER_36,
        },
        {
          fact: 'unemploymentType',
          operator: 'notEqual',
          value: 'force_majeure',
        },
        {
          fact: 'unemploymentType',
          operator: 'notEqual',
          value: 'insertion',
        },
      ],
    },
    event: {
      type: 'allocationsChomage-ineligible',
      params: {
        reason: `jours travaillés insuffisants (${CHOMAGE_CONSTANTS.DAYS_REQUIRED_UNDER_36} jours requis sur ${CHOMAGE_CONSTANTS.MONTHS_REFERENCE_UNDER_36} mois)`,
        priority: 80,
      },
    },
    priority: 80,
  });

  // Rule 4: Insufficient work days for workers 36 and over
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: CHOMAGE_CONSTANTS.AGE_THRESHOLD,
        },
        {
          fact: 'daysWorked',
          operator: 'lessThan',
          value: CHOMAGE_CONSTANTS.DAYS_REQUIRED_36_AND_OVER,
        },
        {
          fact: 'unemploymentType',
          operator: 'notEqual',
          value: 'force_majeure',
        },
      ],
    },
    event: {
      type: 'allocationsChomage-ineligible',
      params: {
        reason: `jours travaillés insuffisants (${CHOMAGE_CONSTANTS.DAYS_REQUIRED_36_AND_OVER} jours requis sur ${CHOMAGE_CONSTANTS.MONTHS_REFERENCE_36_AND_OVER} mois)`,
        priority: 80,
      },
    },
    priority: 80,
  });

  // Rule 5: Temporary unemployment for force majeure - immediate eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'unemploymentType',
          operator: 'equal',
          value: 'force_majeure',
        },
        {
          fact: 'isTemporaryUnemployment',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'allocationsChomage-eligible-temporary',
      params: {
        category: 'chômage temporaire force majeure',
        rate: '65% du salaire plafonné',
        noConditionsRequired: true,
        priority: 70,
      },
    },
    priority: 70,
  });

  // Rule 6: Insertion allowance for young people
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'unemploymentType',
          operator: 'equal',
          value: 'insertion',
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: CHOMAGE_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'hasCompletedInsertionStage',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasDiploma',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'allocationsChomage-eligible-insertion',
      params: {
        category: 'allocations d\'insertion',
        maxDuration: '1 an depuis la réforme 2024',
        priority: 60,
      },
    },
    priority: 60,
  });

  // Rule 7: Not registered with ONEM - ineligible for standard unemployment
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isRegisteredWithONEM',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'unemploymentType',
          operator: 'notEqual',
          value: 'force_majeure',
        },
      ],
    },
    event: {
      type: 'allocationsChomage-ineligible',
      params: {
        reason: 'inscription obligatoire auprès de l\'ONEM/VDAB/Forem/Actiris requise',
        priority: 75,
      },
    },
    priority: 75,
  });

  // Rule 8: Standard eligibility for workers under 36 with sufficient days
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: CHOMAGE_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'age',
          operator: 'lessThan',
          value: CHOMAGE_CONSTANTS.AGE_THRESHOLD,
        },
        {
          fact: 'daysWorked',
          operator: 'greaterThanInclusive',
          value: CHOMAGE_CONSTANTS.DAYS_REQUIRED_UNDER_36,
        },
        {
          fact: 'isRegisteredWithONEM',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isAvailableForWork',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'unemploymentType',
          operator: 'notEqual',
          value: 'demission',
        },
      ],
    },
    event: {
      type: 'allocationsChomage-eligible',
      params: {
        maxDuration: '24 mois maximum',
        priority: 50,
      },
    },
    priority: 50,
  });

  // Rule 9: Standard eligibility for workers 36 and over with sufficient days
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: CHOMAGE_CONSTANTS.AGE_THRESHOLD,
        },
        {
          fact: 'daysWorked',
          operator: 'greaterThanInclusive',
          value: CHOMAGE_CONSTANTS.DAYS_REQUIRED_36_AND_OVER,
        },
        {
          fact: 'isRegisteredWithONEM',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isAvailableForWork',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'unemploymentType',
          operator: 'notEqual',
          value: 'demission',
        },
      ],
    },
    event: {
      type: 'allocationsChomage-eligible',
      params: {
        maxDuration: '24 mois maximum',
        priority: 50,
      },
    },
    priority: 50,
  });

  // Rule 10: Part-time worker eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isPartTime',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: CHOMAGE_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'daysWorked',
          operator: 'greaterThanInclusive',
          value: CHOMAGE_CONSTANTS.DAYS_REQUIRED_UNDER_36,
        },
        {
          fact: 'seekingFullTime',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'allocationsChomage-eligible-parttime',
      params: {
        category: 'régime temps partiel',
        agrEligible: true,
        priority: 45,
      },
    },
    priority: 45,
  });

  // Rule 11: Training cumulation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isReceivingBenefits',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isInApprovedTraining',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'allocationsChomage-training-cumul',
      params: {
        canMaintainBenefits: true,
        mustDeclare: true,
        trainingBonus: '1€ par heure de formation',
        priority: 40,
      },
    },
    priority: 40,
  });

  return engine;
}

/**
 * Singleton instance of the AllocationsChomage rules engine
 */
const allocationsChomageEngineInstance = createAllocationsChomageEngine();

/**
 * Get the rate based on family situation
 */
function getRateForFamilySituation(situation: FamilySituation): number {
  switch (situation) {
    case 'avec charge':
      return FAMILY_SITUATION_RATES.WITH_DEPENDENTS;
    case 'isolé':
      return FAMILY_SITUATION_RATES.ISOLATED;
    case 'cohabitant':
      return FAMILY_SITUATION_RATES.COHABITANT;
    default:
      return FAMILY_SITUATION_RATES.COHABITANT;
  }
}

/**
 * Get category label based on family situation
 */
function getCategoryLabel(situation: FamilySituation): string {
  switch (situation) {
    case 'avec charge':
      return 'travailleur avec charge de famille';
    case 'isolé':
      return 'isolé';
    case 'cohabitant':
      return 'cohabitant';
    default:
      return 'cohabitant';
  }
}

/**
 * Calculate Allocations de Chômage amount
 */
export function calculateAllocationsChomageAmount(
  monthlySalary: number,
  familySituation: FamilySituation,
  isTemporaryForceMajeure: boolean = false
): number {
  // Determine the applicable rate
  let rate: number;
  
  if (isTemporaryForceMajeure) {
    rate = CHOMAGE_CONSTANTS.TEMPORARY_UNEMPLOYMENT_RATE;
  } else {
    rate = getRateForFamilySituation(familySituation);
  }

  // Calculate based on salary
  const calculatedAmount = monthlySalary * rate;

  // Apply ceiling (monthly ceiling based on daily ceiling * 26 working days)
  const monthlyCeiling = CHOMAGE_CONSTANTS.DAILY_CEILING * 26;
  
  // For workers with dependents at 75%, the ceiling applies differently
  // The ceiling is on the reference salary, not on the final amount
  const cappedSalary = Math.min(monthlySalary, monthlyCeiling / rate * rate);
  const finalAmount = Math.min(calculatedAmount, monthlyCeiling * rate / 0.60);

  // Round to nearest euro
  return Math.round(Math.min(calculatedAmount, monthlyCeiling * rate / CHOMAGE_CONSTANTS.STANDARD_UNEMPLOYMENT_RATE));
}

/**
 * Check Allocations de Chômage eligibility
 */
export async function checkAllocationsChomageEligibility(
  user: ChomageUser
): Promise<ChomageEligibilityResult> {
  const facts = {
    age: user.age,
    daysWorked: user.daysWorked,
    referenceMonths: user.referenceMonths,
    monthlySalary: user.monthlySalary,
    familySituation: user.familySituation,
    unemploymentType: user.unemploymentType,
    isRegisteredWithONEM: user.isRegisteredWithONEM,
    isAvailableForWork: user.isAvailableForWork,
    hasValidReason: user.hasValidReason ?? false,
    isTemporaryUnemployment: user.isTemporaryUnemployment ?? false,
    isPartTime: user.isPartTime ?? false,
    seekingFullTime: user.seekingFullTime ?? false,
    hasCompletedInsertionStage: user.hasCompletedInsertionStage ?? false,
    hasDiploma: user.hasDiploma ?? false,
    monthsUnemployed: user.monthsUnemployed ?? 0,
    isReceivingBenefits: user.monthsUnemployed !== undefined && user.monthsUnemployed > 0,
    isInApprovedTraining: user.isInApprovedTraining ?? false,
  };

  try {
    const results = await allocationsChomageEngineInstance.run(facts);

    // Check for ineligibility first (highest priority)
    const ineligibleEvent = results.events.find((e) => e.type === 'allocationsChomage-ineligible');
    if (ineligibleEvent) {
      return {
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    // Check for sanction (voluntary resignation)
    const sanctionEvent = results.events.find((e) => e.type === 'allocationsChomage-sanction');
    if (sanctionEvent) {
      return {
        isEligible: false,
        reason: sanctionEvent.params?.reason as string,
        sanctionPeriod: sanctionEvent.params?.sanctionPeriod as string,
      };
    }

    // Check for temporary unemployment eligibility
    const temporaryEvent = results.events.find((e) => e.type === 'allocationsChomage-eligible-temporary');
    if (temporaryEvent) {
      const amount = calculateAllocationsChomageAmount(
        user.monthlySalary,
        user.familySituation,
        true
      );
      return {
        isEligible: true,
        monthlyAmount: amount,
        category: temporaryEvent.params?.category as string,
        rate: temporaryEvent.params?.rate as string,
        additionalInfo: ['Pas besoin de prouver les conditions d\'admissibilité'],
      };
    }

    // Check for insertion allowance eligibility
    const insertionEvent = results.events.find((e) => e.type === 'allocationsChomage-eligible-insertion');
    if (insertionEvent) {
      return {
        isEligible: true,
        category: insertionEvent.params?.category as string,
        maxDuration: insertionEvent.params?.maxDuration as string,
        additionalInfo: ['Le montant dépend de la situation familiale', 'Diplôme ou formation requise'],
      };
    }

    // Check for part-time eligibility
    const partTimeEvent = results.events.find((e) => e.type === 'allocationsChomage-eligible-parttime');
    if (partTimeEvent) {
      const amount = calculateAllocationsChomageAmount(
        user.monthlySalary,
        user.familySituation,
        false
      );
      return {
        isEligible: true,
        monthlyAmount: amount,
        category: partTimeEvent.params?.category as string,
        additionalInfo: [
          'Le calcul tient compte du régime temps partiel',
          'Droit potentiel à l\'AGR si nouvel emploi temps partiel',
        ],
      };
    }

    // Check for standard eligibility
    const eligibleEvent = results.events.find((e) => e.type === 'allocationsChomage-eligible');
    if (eligibleEvent) {
      const amount = calculateAllocationsChomageAmount(
        user.monthlySalary,
        user.familySituation,
        false
      );
      const rate = getRateForFamilySituation(user.familySituation);
      return {
        isEligible: true,
        monthlyAmount: amount,
        category: getCategoryLabel(user.familySituation),
        maxDuration: eligibleEvent.params?.maxDuration as string,
        rate: `${Math.round(rate * 100)}% du salaire plafonné`,
        obligations: [
          'Être inscrit comme demandeur d\'emploi',
          'Être disponible pour le marché de l\'emploi',
          'Rechercher activement un emploi',
          'Accepter tout emploi convenable proposé',
          'Se présenter aux convocations de l\'ONEM',
          'Déclarer toute activité ou revenu',
          'Résider effectivement en Belgique',
          'Coller les timbres de contrôle (carte C3)',
        ],
      };
    }

    // Check for training cumulation
    const trainingEvent = results.events.find((e) => e.type === 'allocationsChomage-training-cumul');
    if (trainingEvent) {
      return {
        isEligible: true,
        additionalInfo: [
          'Maintien des allocations pendant la formation',
          'Déclaration obligatoire à l\'ONEM',
          'Indemnité de formation supplémentaire possible',
          trainingEvent.params?.trainingBonus as string,
        ],
      };
    }

    return {
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Allocations de Chômage eligibility: ${error}`);
  }
}

/**
 * Calculate degressive amounts based on unemployment duration
 */
export function calculateDegressiveAmount(
  baseMonthlySalary: number,
  familySituation: FamilySituation,
  monthsUnemployed: number
): { amount: number; period: string } {
  const baseRate = getRateForFamilySituation(familySituation);
  
  if (monthsUnemployed <= 12) {
    // Period 1: First 12 months - full rate
    return {
      amount: calculateAllocationsChomageAmount(baseMonthlySalary, familySituation, false),
      period: 'Période 1 - taux complet',
    };
  } else if (monthsUnemployed <= 24) {
    // Period 2: Months 13-24 - degressive rate
    const degressiveRate = baseRate * 0.9; // 10% reduction
    const amount = Math.round(baseMonthlySalary * degressiveRate);
    return {
      amount,
      period: 'Période 2 - montant dégressif',
    };
  } else {
    // Period 3: After 24 months - forfait
    const forfaitAmounts: Record<FamilySituation, number> = {
      'avec charge': 1366.44,
      'isolé': 1024.83,
      'cohabitant': 614.90,
    };
    return {
      amount: forfaitAmounts[familySituation],
      period: 'Période 3 - allocation forfaitaire',
    };
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const ALLOCATIONS_CHOMAGE_RULES_JSON = {
  legalFramework: {
    primaryLaw: 'Arrêté royal du 25 novembre 1991 portant réglementation du chômage',
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112530&table_name=loi',
    reform2024: 'Réforme sur la limitation dans le temps des allocations de chômage',
  },
  rules: [
    {
      id: 'age-minimum',
      description: 'Le demandeur doit avoir au moins 18 ans',
      condition: 'age >= 18',
      source: 'Article 30 AR 25/11/1991',
    },
    {
      id: 'jours-travailles-moins-36-ans',
      description: 'Travailleurs de moins de 36 ans: 312 jours sur 18 mois',
      condition: 'age < 36 AND daysWorked >= 312 dans les 18 derniers mois',
      source: 'Article 30 AR 25/11/1991',
    },
    {
      id: 'jours-travailles-36-ans-et-plus',
      description: 'Travailleurs de 36 ans et plus: 468 jours sur 24 mois',
      condition: 'age >= 36 AND daysWorked >= 468 dans les 24 derniers mois',
      source: 'Article 30 AR 25/11/1991',
    },
    {
      id: 'inscription-onem',
      description: 'Inscription obligatoire auprès d\'un service régional de l\'emploi',
      condition: 'isRegisteredWithONEM == true',
      source: 'Article 56 AR 25/11/1991',
    },
    {
      id: 'disponibilite-marche-emploi',
      description: 'Disponibilité pour le marché de l\'emploi',
      condition: 'isAvailableForWork == true',
      source: 'Article 56 AR 25/11/1991',
    },
    {
      id: 'demission-sanction',
      description: 'Démission volontaire sans motif valable entraîne une période de sanction',
      condition: 'unemploymentType == demission AND hasValidReason == false',
      sanctionPeriod: '4 à 52 semaines',
      source: 'Article 51 AR 25/11/1991',
    },
    {
      id: 'chomage-temporaire-force-majeure',
      description: 'Chômage temporaire pour force majeure - éligibilité immédiate à 65%',
      condition: 'unemploymentType == force_majeure AND isTemporaryUnemployment == true',
      rate: 0.65,
      source: 'Article 26 AR 25/11/1991',
    },
    {
      id: 'taux-avec-charge',
      description: 'Travailleur avec charge de famille: 75% du salaire plafonné',
      condition: 'familySituation == avec_charge',
      rate: 0.75,
      source: 'Article 100 AR 25/11/1991',
    },
    {
      id: 'taux-isole',
      description: 'Travailleur isolé: 60% du salaire plafonné',
      condition: 'familySituation == isolé',
      rate: 0.60,
      source: 'Article 100 AR 25/11/1991',
    },
    {
      id: 'taux-cohabitant',
      description: 'Travailleur cohabitant: 55% du salaire plafonné',
      condition: 'familySituation == cohabitant',
      rate: 0.55,
      source: 'Article 100 AR 25/11/1991',
    },
    {
      id: 'plafond-journalier',
      description: 'Plafond journalier de référence',
      value: 65.48,
      source: 'Montants 2024',
    },
    {
      id: 'duree-maximale',
      description: 'Durée maximale des allocations complètes: 24 mois',
      maxMonths: 24,
      source: 'Réforme 2024',
    },
    {
      id: 'allocations-insertion',
      description: 'Allocations d\'insertion pour jeunes après stage de 310 jours',
      condition: 'hasCompletedInsertionStage == true AND hasDiploma == true',
      maxDuration: '12 mois depuis réforme 2024',
      source: 'Article 36 AR 25/11/1991 modifié',
    },
    {
      id: 'formation-cumul',
      description: 'Maintien des allocations pendant formation agréée + bonus horaire',
      bonus: '1€/heure',
      source: 'Article 94 AR 25/11/1991',
    },
  ],
  obligations: [
    'Être inscrit comme demandeur d\'emploi',
    'Être disponible pour le marché de l\'emploi',
    'Rechercher activement un emploi',
    'Accepter tout emploi convenable proposé',
    'Se présenter aux convocations de l\'ONEM',
    'Déclarer toute activité ou revenu',
    'Résider effectivement en Belgique',
    'Coller les timbres de contrôle (carte C3)',
  ],
};