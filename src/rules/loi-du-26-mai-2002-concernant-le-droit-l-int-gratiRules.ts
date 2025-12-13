/**
 * Business Rules for Droit à l'intégration sociale en Belgique
 *
 * Implements the Gherkin specifications from features/benefits/loi-du-26-mai-2002-concernant-le-droit-l-int-grati.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Loi du 26 mai 2002 concernant le droit à l'intégration sociale
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language


 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * LoiDu26Mai2002ConcernantLeDroitLIntGrati Rules Version Metadata
 * This version MUST match the specification version in features/benefits/loi-du-26-mai-2002-concernant-le-droit-l-int-grati.feature
 */
export const LOI_DU_26_MAI_2002_CONCERNANT_LE_DROIT_L_INT_GRATI_RULES_METADATA = {
  implementsSpecification: '1.0.0',
  implementationVersion: '1.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/loi-du-26-mai-2002-concernant-le-droit-l-int-grati.feature',
  generatedFrom: 'features/benefits/loi-du-26-mai-2002-concernant-le-droit-l-int-grati.feature@1.0.0',
  divergences: [] as string[],
  effectiveDate: '2025-11-18',
};

// Constants from Belgian social law
const MAJORITY_AGE = 18;
const EU_RESIDENCE_MIN_MONTHS = 3;

/**
 * Create the LoiDu26Mai2002ConcernantLeDroitLIntGrati eligibility rules engine
 * 
 * IMPLEMENTATION NOTES:
 * - Extract conditions from "Étant donné" steps in Gherkin scenarios
 * - Map conditions to json-rules-engine facts
 * - Extract events from "Quand" steps
 * - Extract outcomes from "Alors" steps
 * - Use priority to order rule evaluation (higher = checked first)
 */
function createLoiDu26Mai2002ConcernantLeDroitLIntGratiEngine(): Engine {
  const engine = new Engine();

  // Rule: Age requirement - must be of majority age
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: MAJORITY_AGE,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-ineligible',
      params: {
        reason: 'Vous n\'avez pas atteint l\'âge de la majorité',
      },
    },
    priority: 100,
  });

  // Rule: Residency requirement - must have effective residence in Belgium
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasEffectiveResidenceInBelgium',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-ineligible',
      params: {
        reason: 'Vous n\'avez pas de résidence effective en Belgique',
      },
    },
    priority: 90,
  });

  // Rule: Insufficient resources requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-ineligible',
      params: {
        reason: 'Vous disposez de ressources suffisantes',
      },
    },
    priority: 80,
  });

  // Rule: Belgian nationality eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationality',
          operator: 'equal',
          value: 'belgian',
        },
        {
          fact: 'hasEffectiveResidenceInBelgium',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: MAJORITY_AGE,
        },
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'canObtainResourcesByOwnEfforts',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-eligible',
      params: {
        message: 'Éligible en tant que citoyen belge',
        category: 'belgian_national',
      },
    },
    priority: 70,
  });

  // Rule: EU citizen eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isEUCitizen',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasEffectiveResidenceInBelgium',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'residenceRightDurationMonths',
          operator: 'greaterThan',
          value: EU_RESIDENCE_MIN_MONTHS,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: MAJORITY_AGE,
        },
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-eligible',
      params: {
        message: 'Éligible en tant que citoyen de l\'Union européenne',
        category: 'eu_citizen',
      },
    },
    priority: 60,
  });

  // Rule: Foreigner registered in population registry eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isRegisteredInPopulationRegistry',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasEffectiveResidenceInBelgium',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: MAJORITY_AGE,
        },
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-eligible',
      params: {
        message: 'Éligible en tant qu\'étranger inscrit au registre de la population',
        category: 'registered_foreigner',
      },
    },
    priority: 50,
  });

  // Rule: Recognized refugee eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isRecognizedRefugee',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasEffectiveResidenceInBelgium',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: MAJORITY_AGE,
        },
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-eligible',
      params: {
        message: 'Éligible en tant que réfugié reconnu',
        category: 'refugee',
      },
    },
    priority: 40,
  });

  // Rule: Subsidiary protection beneficiary eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasSubsidiaryProtection',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasEffectiveResidenceInBelgium',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: MAJORITY_AGE,
        },
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-eligible',
      params: {
        message: 'Éligible en tant que bénéficiaire de la protection subsidiaire',
        category: 'subsidiary_protection',
      },
    },
    priority: 30,
  });

  // Rule: Work disposition requirement for able-bodied
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isEligible',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isAbleToWork',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isDisposedToWork',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-work-requirement',
      params: {
        requirement: 'Vous devez être disposé à travailler et prouver votre disposition au travail',
      },
    },
    priority: 20,
  });

  // Rule: Health exemption from work disposition
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isEligible',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasHealthReasonsPreventingWork',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-work-exemption',
      params: {
        exemptionReason: 'Exempté de la condition de disposition au travail pour raisons de santé',
      },
    },
    priority: 15,
  });

  // Rule: Equity exemption from work disposition
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isEligible',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasEquityReasonsForExemption',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-work-exemption',
      params: {
        exemptionReason: 'Exempté de la condition de disposition au travail pour raisons d\'équité',
      },
    },
    priority: 10,
  });

  return engine;
}

/**
 * Singleton instance of the LoiDu26Mai2002ConcernantLeDroitLIntGrati rules engine
 */
const loiDu26Mai2002ConcernantLeDroitLIntGratiEngineInstance = createLoiDu26Mai2002ConcernantLeDroitLIntGratiEngine();

/**
 * Calculate Droit à l'intégration sociale en Belgique amount
 * 
 * Note: Actual amounts are defined by royal decree and updated annually
 * These are placeholder values as specific amounts are not provided in the Gherkin scenarios
 */
export function calculateLoiDu26Mai2002ConcernantLeDroitLIntGratiAmount(
  category: string,
  householdSize: number = 1,
  hasChildren: boolean = false
): number {
  // Base amounts (2024 values - to be updated with actual legal amounts)
  const baseAmounts = {
    single: 1183.74,
    cohabitant: 789.16,
    familyHead: 1603.11,
  };

  if (hasChildren || householdSize > 1) {
    return baseAmounts.familyHead;
  }
  
  if (category === 'cohabitant') {
    return baseAmounts.cohabitant;
  }
  
  return baseAmounts.single;
}

/**
 * Check Droit à l'intégration sociale en Belgique eligibility
 */
export async function checkLoiDu26Mai2002ConcernantLeDroitLIntGratiEligibility(
  user: {
    age: number;
    nationality?: string;
    isEUCitizen?: boolean;
    hasEffectiveResidenceInBelgium: boolean;
    residenceRightDurationMonths?: number;
    isRegisteredInPopulationRegistry?: boolean;
    isRecognizedRefugee?: boolean;
    hasSubsidiaryProtection?: boolean;
    hasSufficientResources: boolean;
    canObtainResourcesByOwnEfforts?: boolean;
    isAbleToWork?: boolean;
    isDisposedToWork?: boolean;
    hasHealthReasonsPreventingWork?: boolean;
    hasEquityReasonsForExemption?: boolean;
    householdSize?: number;
    hasChildren?: boolean;
  }
): Promise<EligibilityCheck> {
  const facts = {
    age: user.age,
    nationality: user.nationality || 'unknown',
    isEUCitizen: user.isEUCitizen || false,
    hasEffectiveResidenceInBelgium: user.hasEffectiveResidenceInBelgium,
    residenceRightDurationMonths: user.residenceRightDurationMonths || 0,
    isRegisteredInPopulationRegistry: user.isRegisteredInPopulationRegistry || false,
    isRecognizedRefugee: user.isRecognizedRefugee || false,
    hasSubsidiaryProtection: user.hasSubsidiaryProtection || false,
    hasSufficientResources: user.hasSufficientResources,
    canObtainResourcesByOwnEfforts: user.canObtainResourcesByOwnEfforts || false,
    isAbleToWork: user.isAbleToWork || false,
    isDisposedToWork: user.isDisposedToWork || false,
    hasHealthReasonsPreventingWork: user.hasHealthReasonsPreventingWork || false,
    hasEquityReasonsForExemption: user.hasEquityReasonsForExemption || false,
    isEligible: false, // Will be set based on eligibility events
  };

  const baseResult: EligibilityCheck = {
    benefitType: 'ris',
    isEligible: false,
    reason: 'Conditions non vérifiées',
  };

  try {
    const results = await loiDu26Mai2002ConcernantLeDroitLIntGratiEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type.includes('ineligible'));
    const eligibleEvent = results.events.find((e) => e.type.includes('eligible'));

    if (eligibleEvent) {
      return {
        ...baseResult,
        isEligible: true,
        reason: eligibleEvent.params?.reason as string,
      };
    }

    if (ineligibleEvent) {
      return {
        ...baseResult,
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    return baseResult;
  } catch (error) {
    return {
      ...baseResult,
      isEligible: false,
      reason: 'Erreur lors de la vérification',
    };
  }
}