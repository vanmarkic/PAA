/**
 * Business Rules for Artist Unemployment Benefits
 *
 * BASE JURIDIQUE:
 * - Arrêté royal du 25 novembre 1991 (chômage)
 * - Arrêté ministériel du 26 novembre 1991
 * - Règle du cachet artistique
 */

import { Engine } from 'json-rules-engine';
import { Artist, ArtistUnemployment, ARTIST_STATUS_CONSTANTS } from '../modele-metier/statutArtisteTypes';

function createUnemploymentEngine(): Engine {
  const engine = new Engine();

  // Rule: Minimum days for opening rights
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'daysWorked',
          operator: 'lessThan',
          value: ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD,
        },
      ],
    },
    event: {
      type: 'unemployment-ineligible',
      params: {
        reason: `Minimum ${ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD} jours sur ${ARTIST_STATUS_CONSTANTS.REFERENCE_PERIOD_MONTHS} mois requis`,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule: Protection period active
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasProtectionPeriod',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'monthsSinceLastWork',
          operator: 'lessThanInclusive',
          value: ARTIST_STATUS_CONSTANTS.PROTECTION_PERIOD_MONTHS,
        },
      ],
    },
    event: {
      type: 'protection-period-active',
      params: {
        message: 'Période de protection de 12 mois active',
        maintainRights: true,
      },
    },
    priority: 8,
  });

  // Rule: Cachet exemption applicable
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasCachetIncome',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cachetAmount',
          operator: 'greaterThan',
          value: 0,
        },
      ],
    },
    event: {
      type: 'cachet-exemption',
      params: {
        exemptionAmount: ARTIST_STATUS_CONSTANTS.DAILY_CACHET_EXEMPTION,
        message: 'Exonération cachet applicable',
      },
    },
    priority: 7,
  });

  // Rule: Training compatible with unemployment
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isInTraining',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'trainingType',
          operator: 'equal',
          value: 'artistic',
        },
      ],
    },
    event: {
      type: 'training-compatible',
      params: {
        message: 'Formation artistique compatible avec allocations',
        maintainBenefits: true,
      },
    },
    priority: 6,
  });

  return engine;
}

const unemploymentEngineInstance = createUnemploymentEngine();

export async function checkArtistUnemploymentEligibility(
  artist: Artist,
  additionalFacts: {
    monthsSinceLastWork: number;
    hasProtectionPeriod: boolean;
    hasCachetIncome: boolean;
    cachetAmount?: number;
    isInTraining?: boolean;
    trainingType?: string;
  }
): Promise<ArtistUnemployment> {
  const facts = {
    daysWorked: artist.professionalActivity.daysWorkedArtistic,
    ...additionalFacts,
  };

  const results = await unemploymentEngineInstance.run(facts);

  const ineligibleEvent = results.events.find((e) => e.type === 'unemployment-ineligible');

  if (ineligibleEvent) {
    return {
      userId: artist.id,
      eligibility: {
        hasMinimumDays: false,
        daysWorked: artist.professionalActivity.daysWorkedArtistic,
        referenceperiod: ARTIST_STATUS_CONSTANTS.REFERENCE_PERIOD_MONTHS,
        isEligible: false,
      },
      benefits: {
        dailyAllowance: 0,
        monthlyEstimate: 0,
        category: 'isolé',
        protectionPeriod: 0,
      },
      cachetRule: {
        dailyExemption: 0,
        appliedTo: [],
      },
      obligations: [],
    };
  }

  // Calculate benefits
  const category = determineUnemploymentCategory(artist);
  const dailyRates = {
    'isolé': 65.96,
    'cohabitant': 43.78,
    'chef de famille': 65.96,
  };

  const dailyAllowance = dailyRates[category];
  let monthlyEstimate = dailyAllowance * 26;

  // Apply cachet exemption if applicable
  const cachetEvent = results.events.find((e) => e.type === 'cachet-exemption');
  if (cachetEvent && additionalFacts.cachetAmount) {
    const exemption = Math.min(
      additionalFacts.cachetAmount,
      ARTIST_STATUS_CONSTANTS.DAILY_CACHET_EXEMPTION
    );
    const deduction = additionalFacts.cachetAmount - exemption;
    monthlyEstimate = Math.max(0, monthlyEstimate - deduction);
  }

  return {
    userId: artist.id,
    eligibility: {
      hasMinimumDays: true,
      daysWorked: artist.professionalActivity.daysWorkedArtistic,
      referenceperiod: ARTIST_STATUS_CONSTANTS.REFERENCE_PERIOD_MONTHS,
      isEligible: true,
    },
    benefits: {
      dailyAllowance,
      monthlyEstimate,
      category,
      protectionPeriod: ARTIST_STATUS_CONSTANTS.PROTECTION_PERIOD_MONTHS,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    cachetRule: {
      dailyExemption: ARTIST_STATUS_CONSTANTS.DAILY_CACHET_EXEMPTION,
      appliedTo: [],
    },
    obligations: [
      'Être disponible sur le marché de l\'emploi',
      'Accepter tout emploi convenable',
      'Rechercher activement du travail',
      'Se présenter aux convocations',
      'Déclarer toute activité artistique',
      'Déclarer tout changement de situation',
    ],
  };
}

function determineUnemploymentCategory(artist: Artist): 'isolé' | 'cohabitant' | 'chef de famille' {
  // This would normally check family situation from additional data
  // Simplified for this implementation
  return 'isolé';
}

export const ARTIST_UNEMPLOYMENT_RULES_JSON = {
  minimumRequirements: {
    daysRequired: ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD,
    referencePeriod: ARTIST_STATUS_CONSTANTS.REFERENCE_PERIOD_MONTHS,
  },
  benefitRates: {
    isolé: 65.96,
    cohabitant: 43.78,
    chefDeFamille: 65.96,
  },
  cachetRule: {
    dailyExemption: ARTIST_STATUS_CONSTANTS.DAILY_CACHET_EXEMPTION,
    description: 'Montant journalier exonéré pour cachets artistiques',
  },
  protectionPeriod: {
    duration: ARTIST_STATUS_CONSTANTS.PROTECTION_PERIOD_MONTHS,
    description: 'Période de maintien des droits pour artistes',
  },
};