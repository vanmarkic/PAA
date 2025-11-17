/**
 * Business Rules for Social Housing in Belgium
 * Implements procedures 21-30 from logement-social.feature
 *
 * BASE JURIDIQUE:
 * - Code wallon de l'habitation durable
 *   https://wallex.wallonie.be/eli/loi-decret/1998/10/29/1998A27652/1998/10/29
 * - Ordonnance du 17 juillet 2003 (Code bruxellois du Logement)
 * - Vlaamse Wooncode (Flandre)
 */

import { Engine } from 'json-rules-engine';
import {
  SocialHousingApplicant,
  SocialHousingEligibility,
  SocialRentCalculation,
  BelgianRegion,
  IMMOBILIER_CONSTANTS,
} from '../../domain/immobilierTypes';

/**
 * Create the social housing eligibility engine
 */
function createSocialHousingEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Income ceiling check
  engine.addRule({
    conditions: {
      any: [
        {
          all: [
            {
              fact: 'region',
              operator: 'equal',
              value: 'wallonie',
            },
            {
              fact: 'adjustedIncome',
              operator: 'greaterThan',
              value: IMMOBILIER_CONSTANTS.SOCIAL_HOUSING_CEILINGS.wallonie.single,
            },
          ],
        },
        {
          all: [
            {
              fact: 'region',
              operator: 'equal',
              value: 'bruxelles',
            },
            {
              fact: 'adjustedIncome',
              operator: 'greaterThan',
              value: IMMOBILIER_CONSTANTS.SOCIAL_HOUSING_CEILINGS.bruxelles.single,
            },
          ],
        },
        {
          all: [
            {
              fact: 'region',
              operator: 'equal',
              value: 'flandre',
            },
            {
              fact: 'adjustedIncome',
              operator: 'greaterThan',
              value: IMMOBILIER_CONSTANTS.SOCIAL_HOUSING_CEILINGS.flandre.single,
            },
          ],
        },
      ],
    },
    event: {
      type: 'income-too-high',
      params: {
        reason: 'Revenus dépassent le plafond pour logement social',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Property ownership check
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'ownsProperty',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'property-owner',
      params: {
        reason: 'Ne peut pas posséder de propriété',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 3: Age requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: 18,
        },
      ],
    },
    event: {
      type: 'too-young',
      params: {
        reason: 'Doit avoir minimum 18 ans',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 4: Residency requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'legalResident',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'no-residency',
      params: {
        reason: 'Doit être résident légal en Belgique',
        priority: 10,
      },
    },
    priority: 10,
  });

  return engine;
}

// Singleton instance
const socialHousingEngineInstance = createSocialHousingEngine();

/**
 * Calculate adjusted income for social housing eligibility
 */
export function calculateAdjustedIncome(
  applicant: SocialHousingApplicant
): {
  grossIncome: number;
  deductions: { type: string; amount: number }[];
  adjustedIncome: number;
  incomeCeiling: number;
} {
  const { annualIncome, numberOfChildren, hasDisability, region } = applicant;
  const deductions: { type: string; amount: number }[] = [];
  let adjustedIncome = annualIncome;

  // Standard deduction for social security
  const socialSecurityDeduction = annualIncome * 0.1;
  deductions.push({
    type: 'Cotisations sociales',
    amount: socialSecurityDeduction,
  });
  adjustedIncome -= socialSecurityDeduction;

  // Deduction for children
  const ceilings = IMMOBILIER_CONSTANTS.SOCIAL_HOUSING_CEILINGS[region];
  const childDeduction = numberOfChildren * ceilings.perChild;
  if (childDeduction > 0) {
    deductions.push({
      type: `Abattement ${numberOfChildren} enfant(s)`,
      amount: childDeduction,
    });
    adjustedIncome -= childDeduction;
  }

  // Deduction for disability
  if (hasDisability && applicant.disabilityPercentage && applicant.disabilityPercentage >= 66) {
    const disabilityDeduction = 3000; // Fixed deduction
    deductions.push({
      type: 'Abattement handicap',
      amount: disabilityDeduction,
    });
    adjustedIncome -= disabilityDeduction;
  }

  // Calculate income ceiling
  let incomeCeiling = applicant.householdSize === 1 ? ceilings.single : ceilings.couple;
  incomeCeiling += numberOfChildren * ceilings.perChild;

  return {
    grossIncome: annualIncome,
    deductions,
    adjustedIncome: Math.max(0, adjustedIncome),
    incomeCeiling,
  };
}

/**
 * Calculate priority points for social housing waiting list
 */
export function calculatePriorityPoints(applicant: SocialHousingApplicant, waitingMonths: number = 0): {
  totalPoints: number;
  breakdown: { criterion: string; points: number }[];
  priorityCategory: string;
} {
  const breakdown: { criterion: string; points: number }[] = [];
  let totalPoints = 0;

  // Homelessness - highest priority
  if (applicant.isHomeless) {
    breakdown.push({ criterion: 'Sans-abri', points: 20 });
    totalPoints += 20;
  }

  // Unsanitary housing
  if (applicant.hasUnsanitaryHousing) {
    breakdown.push({ criterion: 'Logement insalubre', points: 15 });
    totalPoints += 15;
  }

  // Single parent family
  if (applicant.isSingleParent) {
    breakdown.push({ criterion: 'Famille monoparentale', points: 8 });
    totalPoints += 8;
  }

  // Disability
  if (applicant.hasDisability && applicant.disabilityPercentage) {
    if (applicant.disabilityPercentage >= 66) {
      breakdown.push({ criterion: `Handicap ${applicant.disabilityPercentage}%`, points: 10 });
      totalPoints += 10;
    }
  }

  // Senior citizen
  if (applicant.age >= 65) {
    breakdown.push({ criterion: 'Plus de 65 ans', points: 6 });
    totalPoints += 6;
  }

  // Number of children
  if (applicant.numberOfChildren > 0) {
    const childPoints = Math.min(applicant.numberOfChildren * 2, 8);
    breakdown.push({ criterion: `${applicant.numberOfChildren} enfant(s)`, points: childPoints });
    totalPoints += childPoints;
  }

  // Waiting time (2 points per year, max 20)
  const waitingYears = Math.floor(waitingMonths / 12);
  const waitingPoints = Math.min(waitingYears * 2, 20);
  if (waitingPoints > 0) {
    breakdown.push({ criterion: `Ancienneté ${waitingYears} ans`, points: waitingPoints });
    totalPoints += waitingPoints;
  }

  // Determine priority category
  let priorityCategory = 'Standard';
  if (totalPoints >= 30) {
    priorityCategory = 'Très haute priorité';
  } else if (totalPoints >= 20) {
    priorityCategory = 'Haute priorité';
  } else if (totalPoints >= 10) {
    priorityCategory = 'Priorité moyenne';
  }

  return {
    totalPoints,
    breakdown,
    priorityCategory,
  };
}

/**
 * Calculate social rent based on income
 */
export function calculateSocialRent(
  referenceIncome: number,
  baseRent: number,
  numberOfDependents: number,
  region: BelgianRegion
): SocialRentCalculation {
  const monthlyIncome = referenceIncome / 12;

  // Calculate effort rate (taux d'effort) - typically 20% but can vary
  let effortRate = 0.20; // 20% base rate

  // Adjust for very low income
  if (monthlyIncome < 1000) {
    effortRate = 0.15; // Reduced to 15%
  } else if (monthlyIncome > 2000) {
    effortRate = 0.25; // Increased to 25%
  }

  // Calculate base social rent
  let calculatedRent = monthlyIncome * effortRate;

  // Apply dependency reduction
  const dependencyReduction = numberOfDependents * 20; // 20€ per dependent
  calculatedRent -= dependencyReduction;

  // Apply minimum and maximum limits
  const minimumRent = 126; // 2024 minimum
  const maximumRent = baseRent; // Cannot exceed base rent

  const finalRent = Math.max(minimumRent, Math.min(calculatedRent, maximumRent));

  // Add standard charges
  const charges = 50; // Forfait charges

  return {
    householdIncome: referenceIncome,
    referenceIncome,
    numberOfDependents,
    baseRent,
    effortRate,
    calculatedRent: Math.round(calculatedRent),
    minimumRent,
    maximumRent,
    finalRent: Math.round(finalRent),
    charges,
    totalMonthly: Math.round(finalRent + charges),
  };
}

/**
 * Check social housing eligibility
 */
export async function checkSocialHousingEligibility(
  applicant: SocialHousingApplicant,
  ownsProperty: boolean = false,
  legalResident: boolean = true
): Promise<SocialHousingEligibility> {
  const incomeCalc = calculateAdjustedIncome(applicant);
  const priorityCalc = calculatePriorityPoints(applicant);

  // Prepare facts for rules engine
  const facts = {
    region: applicant.region,
    adjustedIncome: incomeCalc.adjustedIncome,
    age: applicant.age,
    ownsProperty,
    legalResident,
  };

  const results = await socialHousingEngineInstance.run(facts);

  // Check for ineligibility
  const ineligibleEvent = results.events.find((e) =>
    ['income-too-high', 'property-owner', 'too-young', 'no-residency'].includes(e.type)
  );

  if (ineligibleEvent) {
    return {
      isEligible: false,
      incomeCeiling: incomeCalc.incomeCeiling,
      priorityPoints: 0,
      reason: ineligibleEvent.params?.reason,
    };
  }

  // Estimate wait time based on priority
  let estimatedWaitTime = '> 5 ans';
  if (priorityCalc.totalPoints >= 30) {
    estimatedWaitTime = '6-12 mois';
  } else if (priorityCalc.totalPoints >= 20) {
    estimatedWaitTime = '1-2 ans';
  } else if (priorityCalc.totalPoints >= 10) {
    estimatedWaitTime = '2-4 ans';
  }

  return {
    isEligible: true,
    incomeCeiling: incomeCalc.incomeCeiling,
    priorityPoints: priorityCalc.totalPoints,
    priorityCategory: priorityCalc.priorityCategory,
    estimatedWaitTime,
  };
}

/**
 * Calculate AIS (Agence Immobilière Sociale) rent
 */
export function calculateAISRent(
  marketRent: number,
  tenantIncome: number,
  region: BelgianRegion
): {
  marketRent: number;
  aisRent: number;
  tenantRent: number;
  ownerReceives: number;
  aisFee: number;
  ownerAdvantage: {
    type: string;
    value: number | string;
  }[];
} {
  // AIS typically offers 85% of market rent to owner
  const ownerReceives = marketRent * 0.85;

  // AIS management fee (typically 15%)
  const aisFee = marketRent * 0.15;

  // Tenant pays based on income (similar to social housing)
  const monthlyIncome = tenantIncome / 12;
  const effortRate = 0.25; // Slightly higher than pure social housing
  let tenantRent = monthlyIncome * effortRate;

  // Apply limits
  const maxTenantRent = marketRent * 0.80; // Max 80% of market
  const minTenantRent = 200; // Minimum rent

  tenantRent = Math.max(minTenantRent, Math.min(tenantRent, maxTenantRent));

  // Owner advantages
  const ownerAdvantage = [
    { type: 'Loyer garanti', value: `${ownerReceives}€/mois` },
    { type: 'Pas de vide locatif', value: '0% vacancy' },
    { type: 'Gestion complète', value: 'AIS gère tout' },
    { type: 'Exonération précompte', value: 'Réduction fiscale' },
    { type: 'Entretien locatif', value: 'AIS supervise' },
  ];

  return {
    marketRent,
    aisRent: ownerReceives,
    tenantRent: Math.round(tenantRent),
    ownerReceives: Math.round(ownerReceives),
    aisFee: Math.round(aisFee),
    ownerAdvantage,
  };
}

/**
 * Calculate mutation priority in social housing
 */
export function calculateMutationPriority(
  currentOccupancy: number,
  requiredBedrooms: number,
  actualBedrooms: number,
  medicalNeed: boolean = false,
  workDistance: number = 0
): {
  priority: 'high' | 'medium' | 'low';
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  // Over/under occupation
  const occupancyDiff = Math.abs(requiredBedrooms - actualBedrooms);
  if (occupancyDiff >= 2) {
    score += 20;
    reasons.push(`Sur/sous-occupation importante (${occupancyDiff} chambres)`);
  } else if (occupancyDiff === 1) {
    score += 10;
    reasons.push('Sur/sous-occupation légère');
  }

  // Medical reasons
  if (medicalNeed) {
    score += 15;
    reasons.push('Raisons médicales');
  }

  // Work proximity
  if (workDistance > 50) {
    score += 5;
    reasons.push(`Éloignement travail (${workDistance}km)`);
  }

  // Years in current housing
  const yearsOccupied = currentOccupancy / 12;
  if (yearsOccupied > 5) {
    score += 3;
    reasons.push(`Ancienneté ${Math.floor(yearsOccupied)} ans`);
  }

  // Determine priority
  let priority: 'high' | 'medium' | 'low' = 'low';
  if (score >= 25) {
    priority = 'high';
  } else if (score >= 15) {
    priority = 'medium';
  }

  return {
    priority,
    score,
    reasons,
  };
}

/**
 * Export rules in JSON format
 */
export const SOCIAL_HOUSING_RULES_JSON = {
  legalFramework: {
    wallonie: {
      title: 'Code wallon de l\'habitation durable',
      date: '29 octobre 1998',
      url: 'https://wallex.wallonie.be/eli/loi-decret/1998/10/29/1998A27652/1998/10/29',
    },
    bruxelles: {
      title: 'Code bruxellois du Logement',
      date: '17 juillet 2003',
      ordonnance: 'Ordonnance-cadre',
    },
    flandre: {
      title: 'Vlaamse Wooncode',
      decreet: 'Decreet houdende de Vlaamse Wooncode',
    },
  },
  incomeCeilings2024: IMMOBILIER_CONSTANTS.SOCIAL_HOUSING_CEILINGS,
  priorityPoints: {
    homelessness: 20,
    unsanitaryHousing: 15,
    disability66plus: 10,
    evictionNoFault: 10,
    singleParent: 8,
    senior65plus: 6,
    perChild: 2,
    perYearWaiting: 2,
    maxWaitingPoints: 20,
  },
  rentCalculation: {
    standardEffortRate: 0.20,
    minimumRent: 126,
    deductionPerDependent: 20,
    standardCharges: 50,
  },
  requirements: [
    'Revenus sous plafonds',
    'Pas de propriété',
    'Âge minimum 18 ans',
    'Résidence légale en Belgique',
    'Inscription registre population',
  ],
};