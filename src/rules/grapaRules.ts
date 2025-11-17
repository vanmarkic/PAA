/**
 * Business Rules for GRAPA (Garantie de Revenus aux Personnes Âgées)
 *
 * Implements eligibility rules for the Guaranteed Income for Elderly Persons.
 *
 * BASE JURIDIQUE:
 * - Loi du 22 mai 1969 instituant la garantie de revenus aux personnes âgées
 *   https://www.ejustice.just.fgov.be
 * - Service Fédéral des Pensions (SFP)
 * - Montants indexés régulièrement (janvier et mai)
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';
import { GRAPA_LEGAL_FRAMEWORK, GRAPA_AMOUNTS_2024 } from '../legal-sources/belgianLegalSources';

// Constants from GRAPA law
const MIN_AGE_GRAPA = GRAPA_AMOUNTS_2024.conditions.age.minimum; // 65
const MIN_RESIDENCE_YEARS = 0; // No minimum required, but must be resident

/**
 * Create the GRAPA eligibility rules engine
 */
function createGRAPAEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement (must be 65+)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: MIN_AGE_GRAPA,
        },
      ],
    },
    event: {
      type: 'grapa-ineligible',
      params: {
        reason: `âge minimum non atteint (${MIN_AGE_GRAPA} ans requis)`,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Residency requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'no-valid-status',
        },
        {
          fact: 'residenceBelgique',
          operator: 'lessThan',
          value: MIN_RESIDENCE_YEARS,
        },
      ],
    },
    event: {
      type: 'grapa-ineligible',
      params: {
        reason: 'pas de résidence valide en Belgique',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 3: Resources test - income too high
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: MIN_AGE_GRAPA,
        },
        {
          fact: 'totalResources',
          operator: 'greaterThan',
          value: ({ context }: { context: { situationFamiliale: string } }) => {
            // Maximum resources depend on category (isolated vs cohabitant)
            const category = context.situationFamiliale === 'isolé' ? 'isolated' : 'cohabitant';
            const maxAmount = GRAPA_AMOUNTS_2024.monthlyAmounts[category].amount * 12;
            return maxAmount;
          },
        },
      ],
    },
    event: {
      type: 'grapa-ineligible',
      params: {
        reason: 'ressources supérieures au montant maximum GRAPA',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 4: Basic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: MIN_AGE_GRAPA,
        },
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
        {
          fact: 'residenceBelgique',
          operator: 'greaterThanInclusive',
          value: MIN_RESIDENCE_YEARS,
        },
        {
          fact: 'totalResources',
          operator: 'lessThanInclusive',
          value: ({ context }: { context: { situationFamiliale: string } }) => {
            const category = context.situationFamiliale === 'isolé' ? 'isolated' : 'cohabitant';
            const maxAmount = GRAPA_AMOUNTS_2024.monthlyAmounts[category].amount * 12;
            return maxAmount;
          },
        },
      ],
    },
    event: {
      type: 'grapa-eligible',
      params: {
        message: 'Éligible pour GRAPA',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the GRAPA rules engine
 */
const grapaEngineInstance = createGRAPAEngine();

/**
 * Calculate GRAPA amount based on resources and category
 */
export function calculateGRAPAAmount(
  totalResources: number,
  situationFamiliale: 'isolé' | 'ménage'
): number {
  const category = situationFamiliale === 'isolé' ? 'isolated' : 'cohabitant';
  const maxAmount = GRAPA_AMOUNTS_2024.monthlyAmounts[category].amount * 12; // Annual max

  if (totalResources >= maxAmount) {
    return 0;
  }

  const grapaAmount = maxAmount - totalResources;
  const monthlyAmount = grapaAmount / 12;

  return Math.max(0, Math.round(monthlyAmount * 100) / 100);
}

/**
 * Check GRAPA eligibility
 */
export async function checkGRAPAEligibility(
  age: number,
  residencyStatus: string,
  residenceBelgique: number,
  totalResources: number,
  situationFamiliale: 'isolé' | 'ménage'
): Promise<EligibilityCheck> {
  const category = situationFamiliale === 'isolé' ? 'isolated' : 'cohabitant';
  const maxAmount = GRAPA_AMOUNTS_2024.monthlyAmounts[category].amount * 12;

  const facts = {
    age,
    residencyStatus,
    residenceBelgique,
    totalResources,
    situationFamiliale,
  };

  try {
    const results = await grapaEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'grapa-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'grapa-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'housing-allowance', // Using as placeholder, should add 'grapa' to BenefitType
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent) {
      const amount = calculateGRAPAAmount(totalResources, situationFamiliale);
      return {
        benefitType: 'housing-allowance', // Using as placeholder
        isEligible: true,
        calculatedAmount: amount,
      };
    }

    return {
      benefitType: 'housing-allowance', // Using as placeholder
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking GRAPA eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const GRAPA_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: GRAPA_LEGAL_FRAMEWORK.primaryLegislation.title,
      date: GRAPA_LEGAL_FRAMEWORK.primaryLegislation.date,
      officialUrl: GRAPA_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      authority: GRAPA_LEGAL_FRAMEWORK.primaryLegislation.authority,
    },
    notes: GRAPA_LEGAL_FRAMEWORK.notes,
  },
  amounts: GRAPA_AMOUNTS_2024,
  rules: [
    {
      id: 'grapa-age-requirement',
      description: `Personne doit avoir au moins ${MIN_AGE_GRAPA} ans`,
      condition: `age >= ${MIN_AGE_GRAPA}`,
      priority: 10,
      legalBasis: {
        loi: 'Loi du 22 mai 1969',
        url: GRAPA_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      },
    },
    {
      id: 'grapa-residency-requirement',
      description: 'Résidence effective en Belgique requise',
      condition: 'residencyStatus != no-valid-status AND residenceBelgique >= 0',
      priority: 10,
      legalBasis: {
        loi: 'Loi du 22 mai 1969',
        url: GRAPA_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      },
    },
    {
      id: 'grapa-resources-test',
      description: 'Ressources totales doivent être inférieures au montant maximum GRAPA',
      condition: 'totalResources < maxAmountForCategory',
      priority: 9,
      legalBasis: {
        loi: 'Loi du 22 mai 1969',
        url: GRAPA_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      },
    },
  ],
  conditions: GRAPA_AMOUNTS_2024.conditions,
};

