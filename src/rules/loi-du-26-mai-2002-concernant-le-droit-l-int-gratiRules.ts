```typescript
/**
 * Business Rules for Droit à l'Intégration Sociale
 *
 * Implements the Gherkin specifications from features/benefits/loi-du-26-mai-2002-concernant-le-droit-l-int-grati.feature
 *
 * BASE JURIDIQUE:
 * - Loi du 26 mai 2002 concernant le droit à l'intégration sociale
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language
 * - Publication au Moniteur Belge: 31 juillet 2002
 * - Date d'effet: 2024-01-01
 */

import { Engine } from 'json-rules-engine';

/**
 * Types for Droit à l'Intégration Sociale
 */
export interface DISUser {
  nationality: 'belgian' | 'eu_citizen' | 'foreign_registered' | 'refugee' | 'subsidiary_protection' | 'other';
  hasEffectiveResidence: boolean;
  age: number;
  hasSufficientResources: boolean;
  canClaimResources: boolean;
  canObtainResourcesByOwnMeans: boolean;
  euResidencyDuration?: number; // in months
  isAbleToWork?: boolean;
  hasHealthReasonsPreventingWork?: boolean;
  hasEquityReasonsForExemption?: boolean;
}

export interface DISEligibilityResult {
  eligible: boolean;
  reasons: string[];
  requiresWorkDisposition?: boolean;
  exemptFromWorkDisposition?: boolean;
  exemptionReason?: string;
}

/**
 * Constants for DIS eligibility
 */
export const DIS_CONSTANTS = {
  MIN_AGE: 18,
  MIN_EU_RESIDENCY_MONTHS: 3,
};

/**
 * DIS Rules Version Metadata
 * This version MUST match the specification version in features/benefits/loi-du-26-mai-2002-concernant-le-droit-l-int-grati.feature
 */
export const DIS_RULES_METADATA = {
  implementsSpecification: '1.0.0',
  implementationVersion: '1.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/loi-du-26-mai-2002-concernant-le-droit-l-int-grati.feature',
  generatedFrom: 'features/benefits/loi-du-26-mai-2002-concernant-le-droit-l-int-grati.feature@1.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

/**
 * Create the DIS eligibility rules engine
 */
function createDISEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement (must be 18+)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: DIS_CONSTANTS.MIN_AGE,
        },
      ],
    },
    event: {
      type: 'dis-ineligible',
      params: {
        reason: `Vous n'avez pas atteint l'âge de la majorité (${DIS_CONSTANTS.MIN_AGE} ans requis)`,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Effective residence requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasEffectiveResidence',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'dis-ineligible',
      params: {
        reason: 'Vous n\'avez pas de résidence effective en Belgique',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: Belgian nationality eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationality',
          operator: 'equal',
          value: 'belgian',
        },
        {
          fact: 'hasEffectiveResidence',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: DIS_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'canClaimResources',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'canObtainResourcesByOwnMeans',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'dis-eligible',
      params: {
        reason: 'Éligible en tant que citoyen belge',
        category: 'belgian_national',
      },
    },
    priority: 5,
  });

  // Rule 4: EU citizen eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationality',
          operator: 'equal',
          value: 'eu_citizen',
        },
        {
          fact: 'hasEffectiveResidence',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'euResidencyDuration',
          operator: 'greaterThan',
          value: DIS_CONSTANTS.MIN_EU_RESIDENCY_MONTHS,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: DIS_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'dis-eligible',
      params: {
        reason: 'Éligible en tant que citoyen de l\'Union européenne',
        category: 'eu_citizen',
      },
    },
    priority: 5,
  });

  // Rule 5: Foreign registered eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationality',
          operator: 'equal',
          value: 'foreign_registered',
        },
        {
          fact: 'hasEffectiveResidence',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: DIS_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'dis-eligible',
      params: {
        reason: 'Éligible en tant qu\'étranger inscrit au registre de la population',
        category: 'foreign_registered',
      },
    },
    priority: 5,
  });

  // Rule 6: Refugee eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationality',
          operator: 'equal',
          value: 'refugee',
        },
        {
          fact: 'hasEffectiveResidence',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: DIS_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'dis-eligible',
      params: {
        reason: 'Éligible en tant que réfugié reconnu',
        category: 'refugee',
      },
    },
    priority: 5,
  });

  // Rule 7: Subsidiary protection eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationality',
          operator: 'equal',
          value: 'subsidiary_protection',
        },
        {
          fact: 'hasEffectiveResidence',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: DIS_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'dis-eligible',
      params: {
        reason: 'Éligible en tant que bénéficiaire de la protection subsidiaire',
        category: 'subsidiary_protection',
      },
    },
    priority: 5,
  });

  // Rule 8: Work disposition requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isAbleToWork',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'work-disposition-required',
      params: {
        requirement: 'Vous devez être disposé à travailler et prouver votre disposition au travail',
      },
    },
    priority: 3,
  });

  // Rule 9: Health exemption from work disposition
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasHealthReasonsPreventingWork',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'work-disposition-exempted',
      params: {
        reason: 'Exempté de la condition de disposition au travail pour raisons de santé',
        exemptionType: 'health',
      },
    },
    priority: 2,
  });

  // Rule 10: Equity exemption from work disposition
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasEquityReasonsForExemption',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'work-disposition-exempted',
      params: {
        reason: 'Peut être exempté de la condition de disposition au travail pour raisons d\'équité',
        exemptionType: 'equity',
      },
    },
    priority: 2,
  });

  // Rule 11: Insufficient resources check
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasSufficientResources',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'dis-ineligible',
      params: {
        reason: 'Vous disposez de ressources suffisantes',
        priority: 7,
      },
    },
    priority: 7,
  });

  return engine;
}

/**
 * Evaluate DIS eligibility for a user
 */
export async function evaluateDISEligibility(user: DISUser): Promise<DISEligibilityResult> {
  const engine = createDISEngine();
  
  const facts = {
    nationality: user.nationality,
    hasEffectiveResidence: user.hasEffectiveResidence,
    age: user.age,
    hasSufficientResources: user.hasSufficientResources,
    canClaimResources: user.canClaimResources,
    canObtainResourcesByOwnMeans: user.canObtainResourcesByOwnMeans,
    euResidencyDuration: user.euResidencyDuration || 0,
    isAbleToWork: user.isAbleToWork !== undefined ? user.isAbleToWork : true,
    hasHealthReasonsPreventingWork: user.hasHealthReasonsPreventingWork || false,
    hasEquityReasonsForExemption: user.hasEquityReasonsForExemption || false,
  };

  const { events } = await engine.run(facts);

  // Process events to determine eligibility
  const ineligibleEvents = events.filter(e => e.type === 'dis-ineligible');
  const eligibleEvents = events.filter(e => e.type === 'dis-eligible');
  const workDispositionEvents = events.filter(e => e.type === 'work-disposition-required');
  const workExemptionEvents = events.filter(e => e.type === 'work-disposition-exempted');

  if (ineligibleEvents.length > 0) {
    return {
      eligible: false,
      reasons: ineligibleEvents.map(e => e.params?.reason as string),
    };
  }

  if (eligibleEvents.length > 0) {
    const result: DISEligibilityResult = {
      eligible: true,
      reasons: eligibleEvents.map(e => e.params?.reason as string),
    };

    if (workDispositionEvents.length > 0) {
      result.requiresWorkDisposition = true;
    }

    if (workExemptionEvents.length > 0) {
      result.exemptFromWorkDisposition = true;
      result.exemptionReason = workExemptionEvents[0].params?.reason as string;
      result.requiresWorkDisposition = false;
    }

    return result;
  }

  return {
    eligible: false,
    reasons: ['Conditions d\'éligibilité non remplies'],
  };
}

/**
 * Export the engine creator for testing purposes
 */
export { createDISEngine };
```