/**
 * Business Rules for Aide au Logement (Housing Allowance)
 *
 * Implements eligibility rules for Belgian housing allowances.
 *
 * BASE JURIDIQUE:
 * - Arrêté du Gouvernement de la Région de Bruxelles-Capitale du 15 juillet 2021
 *   instituant une allocation de loyer
 *   https://www.ejustice.just.fgov.be
 * - Arrêté ministériel du 30 septembre 2021 portant exécution
 * - Régionalisé - spécifique à la Région de Bruxelles-Capitale
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';
import { RENT_ALLOWANCE_LEGAL_FRAMEWORK } from '../legal-sources/belgianLegalSources';

// Constants (to be defined based on regional regulations)
const MIN_INCOME_THRESHOLD = 0; // Minimum income threshold
const MAX_INCOME_THRESHOLD = 25000; // Maximum annual income (example)
const MAX_RENT_THRESHOLD = 800; // Maximum monthly rent (example)

/**
 * Create the Housing Allowance eligibility rules engine
 */
function createHousingAllowanceEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Residency requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'no-valid-status',
        },
      ],
    },
    event: {
      type: 'housing-allowance-ineligible',
      params: {
        reason: 'pas de résidence valide en Belgique',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Income too high
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'annualIncome',
          operator: 'greaterThan',
          value: MAX_INCOME_THRESHOLD,
        },
      ],
    },
    event: {
      type: 'housing-allowance-ineligible',
      params: {
        reason: `revenus annuels supérieurs à ${MAX_INCOME_THRESHOLD}€`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: Income too low (may not qualify)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'annualIncome',
          operator: 'lessThan',
          value: MIN_INCOME_THRESHOLD,
        },
      ],
    },
    event: {
      type: 'housing-allowance-ineligible',
      params: {
        reason: 'revenus insuffisants pour qualification',
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 4: Rent too high
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'monthlyRent',
          operator: 'greaterThan',
          value: MAX_RENT_THRESHOLD,
        },
      ],
    },
    event: {
      type: 'housing-allowance-ineligible',
      params: {
        reason: `loyer mensuel supérieur à ${MAX_RENT_THRESHOLD}€`,
        priority: 7,
      },
    },
    priority: 7,
  });

  // Rule 5: Basic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
        {
          fact: 'annualIncome',
          operator: 'greaterThanInclusive',
          value: MIN_INCOME_THRESHOLD,
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: MAX_INCOME_THRESHOLD,
        },
        {
          fact: 'monthlyRent',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'monthlyRent',
          operator: 'lessThanInclusive',
          value: MAX_RENT_THRESHOLD,
        },
        {
          fact: 'isRenting',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'housing-allowance-eligible',
      params: {
        message: 'Éligible pour allocation de loyer',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the Housing Allowance rules engine
 */
const housingAllowanceEngineInstance = createHousingAllowanceEngine();

/**
 * Calculate housing allowance amount based on income and rent
 */
export function calculateHousingAllowanceAmount(
  annualIncome: number,
  monthlyRent: number,
  householdSize: number = 1
): number {
  // Simplified calculation (actual formula depends on regional regulations)
  const incomeRatio = annualIncome / MAX_INCOME_THRESHOLD;
  const rentRatio = monthlyRent / MAX_RENT_THRESHOLD;

  // Base calculation: percentage of rent based on income
  let allowancePercentage = 0.3; // 30% base
  if (incomeRatio < 0.5) {
    allowancePercentage = 0.5; // 50% for very low income
  } else if (incomeRatio < 0.7) {
    allowancePercentage = 0.4; // 40% for low income
  }

  // Adjust for household size
  const householdMultiplier = Math.min(householdSize / 2, 1.5);

  const allowance = monthlyRent * allowancePercentage * householdMultiplier;
  const maxAllowance = monthlyRent * 0.6; // Max 60% of rent

  return Math.min(Math.round(allowance * 100) / 100, maxAllowance);
}

/**
 * Check Housing Allowance eligibility
 */
export async function checkHousingAllowanceEligibility(
  annualIncome: number,
  monthlyRent: number,
  residencyStatus: string,
  isRenting: boolean,
  householdSize: number = 1
): Promise<EligibilityCheck> {
  const facts = {
    annualIncome,
    monthlyRent,
    residencyStatus,
    isRenting,
    householdSize,
  };

  try {
    const results = await housingAllowanceEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'housing-allowance-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'housing-allowance-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'housing-allowance',
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent) {
      const amount = calculateHousingAllowanceAmount(annualIncome, monthlyRent, householdSize);
      return {
        benefitType: 'housing-allowance',
        isEligible: true,
        calculatedAmount: amount,
      };
    }

    return {
      benefitType: 'housing-allowance',
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Housing Allowance eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const HOUSING_ALLOWANCE_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation.title,
      date: RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation.date,
      officialUrl: RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      authority: RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation.authority,
    },
    implementingLegislation: RENT_ALLOWANCE_LEGAL_FRAMEWORK.implementingLegislation,
    notes: RENT_ALLOWANCE_LEGAL_FRAMEWORK.notes,
  },
  rules: [
    {
      id: 'housing-allowance-residency-requirement',
      description: 'Résidence valide en Belgique requise',
      condition: 'residencyStatus != no-valid-status',
      priority: 10,
      legalBasis: {
        arrete: 'Arrêté du 15 juillet 2021',
        url: RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      },
    },
    {
      id: 'housing-allowance-income-threshold',
      description: `Revenus annuels doivent être entre ${MIN_INCOME_THRESHOLD}€ et ${MAX_INCOME_THRESHOLD}€`,
      condition: `annualIncome >= ${MIN_INCOME_THRESHOLD} AND annualIncome <= ${MAX_INCOME_THRESHOLD}`,
      priority: 9,
      legalBasis: {
        arrete: 'Arrêté du 15 juillet 2021',
        url: RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      },
    },
    {
      id: 'housing-allowance-rent-threshold',
      description: `Loyer mensuel ne peut dépasser ${MAX_RENT_THRESHOLD}€`,
      condition: `monthlyRent > 0 AND monthlyRent <= ${MAX_RENT_THRESHOLD}`,
      priority: 7,
      legalBasis: {
        arrete: 'Arrêté du 15 juillet 2021',
        url: RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      },
    },
    {
      id: 'housing-allowance-renting-requirement',
      description: 'Doit être locataire',
      condition: 'isRenting == true',
      priority: 8,
      legalBasis: {
        arrete: 'Arrêté du 15 juillet 2021',
        url: RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      },
    },
  ],
  thresholds: {
    minIncome: MIN_INCOME_THRESHOLD,
    maxIncome: MAX_INCOME_THRESHOLD,
    maxRent: MAX_RENT_THRESHOLD,
  },
};

