/**
 * Business Rules for Allocation de Garantie de Revenus (AGR)
 *
 * Implements the Gherkin specifications from features/benefits/income-guarantee.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Arrêté royal du 25 novembre 1991 portant réglementation du chômage
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550&table_name=loi


 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * IncomeGuarantee Rules Version Metadata
 * This version MUST match the specification version in features/benefits/income-guarantee.feature
 */
export const INCOME_GUARANTEE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/income-guarantee.feature',
  generatedFrom: 'features/benefits/income-guarantee.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2025-02-01',
};

// Constants from Belgian social law - Arrêté royal du 25 novembre 1991
export const AGR_CONSTANTS = {
  REVENU_MINIMUM_MENSUEL_GARANTI: 1650, // €
  AGR_PERCENTAGE: 0.80, // 80% of the difference between minimum guaranteed and salary
  OPTIMAL_HOURS_MIN: 20,
  OPTIMAL_HOURS_MAX: 28,
  FULL_TIME_HOURS: 35,
};

/**
 * Input parameters for AGR eligibility check
 */
export interface AGRInput {
  isPartTimeWorker: boolean;
  hasMaintenanceOfRights: boolean; // maintien des droits
  grossMonthlySalary: number;
  receivesFullUnemploymentBenefit: boolean;
  weeklyHours?: number;
}

/**
 * Create the IncomeGuarantee eligibility rules engine
 * 
 * IMPLEMENTATION NOTES:
 * - Extract conditions from "Étant donné" steps in Gherkin scenarios
 * - Map conditions to json-rules-engine facts
 * - Extract events from "Quand" steps
 * - Extract outcomes from "Alors" steps
 * - Use priority to order rule evaluation (higher = checked first)
 */
function createIncomeGuaranteeEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Check if receiving full unemployment benefit (highest priority - incompatibility)
  // Scénario: Incompatibilité avec le chômage complet
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'receivesFullUnemploymentBenefit',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'incomeGuarantee-ineligible',
      params: {
        reason: 'cumul interdit avec chômage complet',
      },
    },
    priority: 100, // Highest priority - absolute incompatibility
  });

  // Rule 2: Check maintenance of rights requirement
  // Scénario: Sans maintien des droits
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasMaintenanceOfRights',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'incomeGuarantee-ineligible',
      params: {
        reason: 'pas de maintien des droits',
      },
    },
    priority: 90, // High priority - fundamental requirement
  });

  // Rule 3: Check if salary is too high
  // Scénario: Salaire trop élevé pour l'AGR
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'grossMonthlySalary',
          operator: 'greaterThanInclusive',
          value: AGR_CONSTANTS.REVENU_MINIMUM_MENSUEL_GARANTI,
        },
      ],
    },
    event: {
      type: 'incomeGuarantee-ineligible',
      params: {
        reason: 'salaire supérieur au minimum garanti',
      },
    },
    priority: 80, // High priority - income threshold check
  });

  // Rule 4: Check if not a part-time worker
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isPartTimeWorker',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'incomeGuarantee-ineligible',
      params: {
        reason: 'doit être travailleur à temps partiel',
      },
    },
    priority: 70,
  });

  // Rule 5: Eligible - all conditions met
  // Scénario: Travailleur à temps partiel avec maintien des droits éligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isPartTimeWorker',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasMaintenanceOfRights',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'grossMonthlySalary',
          operator: 'lessThan',
          value: AGR_CONSTANTS.REVENU_MINIMUM_MENSUEL_GARANTI,
        },
        {
          fact: 'receivesFullUnemploymentBenefit',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'incomeGuarantee-eligible',
      params: {
        message: 'Éligible pour Allocation de Garantie de Revenus (AGR)',
        canCombineWithSalary: true,
        canCombineWithFamilyAllowances: true,
      },
    },
    priority: 10, // Lower priority - checked after all exclusion rules
  });

  return engine;
}

/**
 * Singleton instance of the IncomeGuarantee rules engine
 */
const incomeGuaranteeEngineInstance = createIncomeGuaranteeEngine();

/**
 * Calculate Allocation de Garantie de Revenus (AGR) amount
 * 
 * Based on Gherkin scenario:
 * - Salary: 1200€, AGR amount: 360€
 * - Formula: (REVENU_MINIMUM_MENSUEL_GARANTI - grossMonthlySalary) * 0.80
 * - 1650 - 1200 = 450, 450 * 0.80 = 360€
 */
export function calculateIncomeGuaranteeAmount(
  grossMonthlySalary: number
): number {
  if (grossMonthlySalary >= AGR_CONSTANTS.REVENU_MINIMUM_MENSUEL_GARANTI) {
    return 0;
  }
  
  const difference = AGR_CONSTANTS.REVENU_MINIMUM_MENSUEL_GARANTI - grossMonthlySalary;
  const agrAmount = Math.round(difference * AGR_CONSTANTS.AGR_PERCENTAGE);
  
  return agrAmount;
}

/**
 * Calculate total revenue with AGR
 * 
 * Based on Plan du Scénario: Heures de travail optimales
 */
export function calculateTotalRevenueWithAGR(
  grossMonthlySalary: number,
  isEligible: boolean
): number {
  if (!isEligible || grossMonthlySalary >= AGR_CONSTANTS.REVENU_MINIMUM_MENSUEL_GARANTI) {
    return grossMonthlySalary;
  }
  
  const agrAmount = calculateIncomeGuaranteeAmount(grossMonthlySalary);
  return grossMonthlySalary + agrAmount;
}

/**
 * Get optimization advice based on weekly hours
 * 
 * Based on Plan du Scénario: Heures de travail optimales
 */
export function getOptimizationAdvice(weeklyHours: number): string {
  if (weeklyHours >= AGR_CONSTANTS.FULL_TIME_HOURS) {
    return 'Temps plein, pas d\'AGR possible';
  }
  
  if (weeklyHours >= AGR_CONSTANTS.OPTIMAL_HOURS_MIN && weeklyHours <= AGR_CONSTANTS.OPTIMAL_HOURS_MAX) {
    return 'Zone optimale pour AGR';
  }
  
  if (weeklyHours < AGR_CONSTANTS.OPTIMAL_HOURS_MIN) {
    return 'Augmenter à 20-28h pour maximiser AGR';
  }
  
  return 'Zone optimale pour AGR';
}

/**
 * Check Allocation de Garantie de Revenus (AGR) eligibility
 * 
 * Maps Gherkin "Étant donné" steps to facts for rules engine evaluation
 */
export async function checkIncomeGuaranteeEligibility(
  input: AGRInput
): Promise<EligibilityCheck> {
  const facts = {
    isPartTimeWorker: input.isPartTimeWorker,
    hasMaintenanceOfRights: input.hasMaintenanceOfRights,
    grossMonthlySalary: input.grossMonthlySalary,
    receivesFullUnemploymentBenefit: input.receivesFullUnemploymentBenefit,
    weeklyHours: input.weeklyHours ?? 0,
  };

  try {
    const results = await incomeGuaranteeEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'incomeGuarantee-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'incomeGuarantee-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'agr',
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    if (eligibleEvent) {
      const calculatedAmount = calculateIncomeGuaranteeAmount(input.grossMonthlySalary);
      const totalRevenue = calculateTotalRevenueWithAGR(input.grossMonthlySalary, true);
      const optimizationAdvice = input.weeklyHours ? getOptimizationAdvice(input.weeklyHours) : undefined;

      return {
        benefitType: 'agr',
        isEligible: true,
        calculatedAmount: calculatedAmount,
        optimizationSuggestion: optimizationAdvice,
        notes: [
          'Peut être cumulé avec le salaire',
          'Peut être cumulé avec les allocations familiales',
          `Revenu total avec AGR: ${totalRevenue}€`,
        ],
      };
    }

    return {
      benefitType: 'agr',
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Allocation de Garantie de Revenus (AGR) eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const INCOME_GUARANTEE_RULES_JSON = {
  legalFramework: {
    name: 'Arrêté royal du 25 novembre 1991 portant réglementation du chômage',
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550&table_name=loi',
    effectiveDate: '2025-02-01',
  },
  constants: {
    revenuMinimumMensuelGaranti: AGR_CONSTANTS.REVENU_MINIMUM_MENSUEL_GARANTI,
    agrPercentage: AGR_CONSTANTS.AGR_PERCENTAGE,
    optimalHoursMin: AGR_CONSTANTS.OPTIMAL_HOURS_MIN,
    optimalHoursMax: AGR_CONSTANTS.OPTIMAL_HOURS_MAX,
    fullTimeHours: AGR_CONSTANTS.FULL_TIME_HOURS,
  },
  rules: [
    {
      id: 'agr-incompatibility-full-unemployment',
      description: 'Incompatibilité avec le chômage complet',
      priority: 100,
      conditions: {
        receivesFullUnemploymentBenefit: true,
      },
      outcome: {
        eligible: false,
        reason: 'cumul interdit avec chômage complet',
      },
    },
    {
      id: 'agr-maintenance-of-rights-required',
      description: 'Sans maintien des droits - inéligible',
      priority: 90,
      conditions: {
        hasMaintenanceOfRights: false,
      },
      outcome: {
        eligible: false,
        reason: 'pas de maintien des droits',
      },
    },
    {
      id: 'agr-salary-too-high',
      description: 'Salaire trop élevé pour l\'AGR',
      priority: 80,
      conditions: {
        grossMonthlySalary: '>= 1650',
      },
      outcome: {
        eligible: false,
        reason: 'salaire supérieur au minimum garanti',
      },
    },
    {
      id: 'agr-part-time-required',
      description: 'Doit être travailleur à temps partiel',
      priority: 70,
      conditions: {
        isPartTimeWorker: false,
      },
      outcome: {
        eligible: false,
        reason: 'doit être travailleur à temps partiel',
      },
    },
    {
      id: 'agr-eligible',
      description: 'Travailleur à temps partiel avec maintien des droits éligible',
      priority: 10,
      conditions: {
        isPartTimeWorker: true,
        hasMaintenanceOfRights: true,
        grossMonthlySalary: '< 1650',
        receivesFullUnemploymentBenefit: false,
      },
      outcome: {
        eligible: true,
        calculation: '(1650 - salaire) * 0.80',
        canCombineWithSalary: true,
        canCombineWithFamilyAllowances: true,
      },
    },
  ],
  examples: [
    {
      scenario: 'Travailleur à temps partiel avec maintien des droits éligible',
      input: { grossMonthlySalary: 1200, isPartTimeWorker: true, hasMaintenanceOfRights: true, receivesFullUnemploymentBenefit: false },
      expectedOutput: { eligible: true, amount: 360 },
    },
    {
      scenario: 'Salaire trop élevé pour l\'AGR',
      input: { grossMonthlySalary: 1700, isPartTimeWorker: true, hasMaintenanceOfRights: true, receivesFullUnemploymentBenefit: false },
      expectedOutput: { eligible: false, reason: 'salaire supérieur au minimum garanti' },
    },
    {
      scenario: 'Sans maintien des droits',
      input: { grossMonthlySalary: 1200, isPartTimeWorker: true, hasMaintenanceOfRights: false, receivesFullUnemploymentBenefit: false },
      expectedOutput: { eligible: false, reason: 'pas de maintien des droits' },
    },
    {
      scenario: 'Incompatibilité avec le chômage complet',
      input: { grossMonthlySalary: 1200, isPartTimeWorker: true, hasMaintenanceOfRights: true, receivesFullUnemploymentBenefit: true },
      expectedOutput: { eligible: false, reason: 'cumul interdit avec chômage complet' },
    },
  ],
  optimizationExamples: [
    { weeklyHours: 15, salary: 800, totalRevenue: 1160, advice: 'Augmenter à 20-28h pour maximiser AGR' },
    { weeklyHours: 20, salary: 1100, totalRevenue: 1540, advice: 'Zone optimale pour AGR' },
    { weeklyHours: 28, salary: 1500, totalRevenue: 1620, advice: 'Zone optimale pour AGR' },
    { weeklyHours: 35, salary: 1800, totalRevenue: 1800, advice: 'Temps plein, pas d\'AGR possible' },
  ],
};