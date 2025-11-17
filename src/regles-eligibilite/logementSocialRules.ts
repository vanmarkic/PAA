/**
 * Business Rules for Logement Social (Social Housing)
 *
 * Implements comprehensive eligibility rules for Belgian social housing
 * across all regions (Brussels, Wallonia, Flanders).
 *
 * BASE JURIDIQUE:
 * BRUXELLES-CAPITALE:
 * - Code bruxellois du Logement
 * - Arrêté du Gouvernement de la Région de Bruxelles-Capitale du 26 septembre 1996
 *   organisant la location des habitations gérées par la Société du Logement de la Région bruxelloise
 *
 * WALLONIE:
 * - Code wallon du Logement et de l'Habitat durable
 * - Arrêté du Gouvernement wallon du 6 septembre 2007 organisant la location
 *   des logements gérés par les sociétés de logement de service public
 *
 * FLANDRES:
 * - Vlaamse Wooncode
 * - Besluit Vlaamse Regering betreffende het sociaal huurstelsel
 * - Test patrimoine introduit le 1er janvier 2024
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

// ============================================================================
// REGIONAL CONSTANTS 2024-2025
// ============================================================================

/**
 * Brussels-Capital Region Constants 2024
 */
const BRUSSELS_SOCIAL_2024 = {
  incomeThresholds: {
    baseIsolated: 25000,        // EUR annual (variable by household)
    baseCouple: 37500,          // EUR annual
    childSupplement: 2702.77,   // EUR per child
    handicapSupplement: 5405.54 // EUR for handicap
  },
  waitingTimes: {
    studio1Bedroom: { min: 11, max: 12 }, // years
    twoBedrooms: { min: 8, max: 10 },     // years
    threePlusBedrooms: { min: 5, max: 8 } // years
  },
  rentCalculation: {
    minPercentage: 0.20,     // 20% of income minimum
    maxPercentage: 0.30,     // 30% of income maximum
    socialRentBase: 0.22     // 22% standard calculation
  },
  priorityPoints: {
    singleParent: 3,
    childrenPerChild: 1,
    unsanitaryHousing: 5,
    handicap: 4,
    urgentNeed: 10
  }
};

/**
 * Wallonia Region Constants 2024
 */
const WALLONIA_SOCIAL_2024 = {
  incomeThresholds: {
    isolated: 69800,           // EUR annual max
    multipleHousehold: 85100, // EUR annual max
    childSupplement: 3200,     // EUR per child
    handicapSupplement: 4800   // EUR for handicap
  },
  waitingTimes: {
    average: { min: 3, max: 5 } // years for all types
  },
  categories: {
    category1: 'Revenus de remplacement', // < 14,500€
    category2: 'Revenus modestes',        // 14,500€ - 29,100€
    category3: 'Revenus moyens'           // 29,100€ - 85,100€
  },
  rentCalculation: {
    category1Rate: 0.12,  // 12% of income
    category2Rate: 0.18,  // 18% of income
    category3Rate: 0.22   // 22% of income
  },
  priorityPoints: {
    handicap: 5,
    singleParent: 4,
    largeFamily: 3,       // 3+ children
    unsanitaryHousing: 6,
    homeless: 10
  }
};

/**
 * Flanders Region Constants 2024-2025
 */
const FLANDERS_SOCIAL_2024 = {
  incomeThresholds2024: {
    isolated: 29515,              // EUR annual
    isolatedHandicap: 31987,      // EUR annual
    others: 44270,                // EUR annual
    childSupplement: 2475         // EUR per child
  },
  incomeThresholds2025: {
    isolated: 30636,              // EUR annual
    isolatedHandicap: 33202,      // EUR annual
    others: 45952,                // EUR annual
    childSupplement: 2569         // EUR per child
  },
  patrimonyLimits2024: {
    isolated: 29515,              // EUR movable assets
    isolatedHandicap: 31987,      // EUR movable assets
    others: 44270                 // EUR movable assets
  },
  patrimonyLimits2025: {
    isolated: 30636,              // EUR movable assets
    isolatedHandicap: 33202,      // EUR movable assets
    others: 45952                 // EUR movable assets
  },
  waitingTimes: {
    average: { min: 2, max: 5 }  // years
  },
  rentCalculation: {
    baseSocialRent: 0.20,         // 20% of income base
    marketCorrection: 0.033       // 1/30th market value correction
  },
  priorityCategories: {
    actualUrgency: 20,            // Highest priority
    localBinding: 15,             // Strong local connection
    housingNeed: 10,              // General housing need
    rational: 5                   // Rational occupation
  }
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SocialHousingRequest {
  region: 'brussels' | 'wallonia' | 'flanders';
  applicantInfo: {
    age: number;
    nationality: string;
    registeredInBelgium: boolean;
    residencyStatus: string;
  };
  householdComposition: {
    adults: number;
    children: number;
    singleParent: boolean;
    handicappedMembers: number;
  };
  financialSituation: {
    annualIncome: number;          // Taxable income N-3
    patrimonyValue?: number;        // For Flanders 2024+ only
    ownsProperty: boolean;
    propertyDetails?: {
      inhabitable: boolean;
      certificateOfUninhabitability?: boolean;
    };
  };
  currentHousing: {
    situation: 'renting' | 'owner' | 'homeless' | 'institution' | 'family';
    unsanitary?: boolean;
    overcrowded?: boolean;
    evictionNotice?: boolean;
  };
  applicationYear: 2024 | 2025;
}

export interface SocialHousingResult extends EligibilityCheck {
  region: string;
  category?: string;
  estimatedWaitingTime?: {
    min: number;
    max: number;
    unit: 'months' | 'years';
  };
  estimatedMonthlyRent?: number;
  priorityPoints?: number;
  incomeThreshold?: number;
  requiredDocuments?: string[];
}

// ============================================================================
// RULES ENGINE CREATION
// ============================================================================

/**
 * Create Brussels Social Housing rules engine
 */
function createBrusselsSocialEngine(): Engine {
  const engine = new Engine();

  // Rule: Property owner ineligible (unless uninhabitable with certificate)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'ownsProperty',
          operator: 'equal',
          value: true
        },
        {
          any: [
            {
              fact: 'propertyInhabitable',
              operator: 'notEqual',
              value: true
            },
            {
              fact: 'hasCertificateUninhabitability',
              operator: 'notEqual',
              value: true
            }
          ]
        }
      ]
    },
    event: {
      type: 'brussels-social-ineligible',
      params: {
        reason: 'propriétaire d\'un bien immobilier',
        priority: 10
      }
    },
    priority: 10
  });

  // Rule: Not registered in Belgium
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'registeredInBelgium',
          operator: 'equal',
          value: false
        }
      ]
    },
    event: {
      type: 'brussels-social-ineligible',
      params: {
        reason: 'non inscrit au registre de la population',
        priority: 10
      }
    },
    priority: 10
  });

  // Rule: Income too high
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'incomeVsThreshold',
          operator: 'greaterThan',
          value: 0
        }
      ]
    },
    event: {
      type: 'brussels-social-ineligible',
      params: {
        reason: 'revenus dépassent les plafonds',
        priority: 9
      }
    },
    priority: 9
  });

  // Rule: Basic eligibility met
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'registeredInBelgium',
          operator: 'equal',
          value: true
        },
        {
          fact: 'incomeVsThreshold',
          operator: 'lessThanInclusive',
          value: 0
        },
        {
          any: [
            {
              fact: 'ownsProperty',
              operator: 'equal',
              value: false
            },
            {
              all: [
                {
                  fact: 'propertyInhabitable',
                  operator: 'equal',
                  value: true
                },
                {
                  fact: 'hasCertificateUninhabitability',
                  operator: 'equal',
                  value: true
                }
              ]
            }
          ]
        }
      ]
    },
    event: {
      type: 'brussels-social-eligible',
      params: {
        message: 'Éligible pour logement social à Bruxelles'
      }
    },
    priority: 5
  });

  return engine;
}

/**
 * Create Wallonia Social Housing rules engine
 */
function createWalloniaSocialEngine(): Engine {
  const engine = new Engine();

  // Rule: Property owner ineligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'ownsProperty',
          operator: 'equal',
          value: true
        },
        {
          fact: 'propertyInhabitable',
          operator: 'notEqual',
          value: true
        }
      ]
    },
    event: {
      type: 'wallonia-social-ineligible',
      params: {
        reason: 'propriétaire d\'un bien immobilier habitable',
        priority: 10
      }
    },
    priority: 10
  });

  // Rule: Income too high
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'incomeVsThreshold',
          operator: 'greaterThan',
          value: 0
        }
      ]
    },
    event: {
      type: 'wallonia-social-ineligible',
      params: {
        reason: 'revenus dépassent les plafonds sociaux',
        priority: 9
      }
    },
    priority: 9
  });

  // Rule: Not registered in Belgium
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'registeredInBelgium',
          operator: 'equal',
          value: false
        }
      ]
    },
    event: {
      type: 'wallonia-social-ineligible',
      params: {
        reason: 'non inscrit au registre de la population',
        priority: 10
      }
    },
    priority: 10
  });

  // Rule: Basic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'registeredInBelgium',
          operator: 'equal',
          value: true
        },
        {
          fact: 'incomeVsThreshold',
          operator: 'lessThanInclusive',
          value: 0
        },
        {
          any: [
            {
              fact: 'ownsProperty',
              operator: 'equal',
              value: false
            },
            {
              fact: 'propertyInhabitable',
              operator: 'equal',
              value: true
            }
          ]
        }
      ]
    },
    event: {
      type: 'wallonia-social-eligible',
      params: {
        message: 'Éligible pour logement social en Wallonie'
      }
    },
    priority: 5
  });

  return engine;
}

/**
 * Create Flanders Social Housing rules engine
 */
function createFlandersSocialEngine(): Engine {
  const engine = new Engine();

  // Rule: Property owner ineligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'ownsProperty',
          operator: 'equal',
          value: true
        },
        {
          fact: 'propertyInhabitable',
          operator: 'notEqual',
          value: true
        }
      ]
    },
    event: {
      type: 'flanders-social-ineligible',
      params: {
        reason: 'eigenaar van onroerend goed',
        priority: 10
      }
    },
    priority: 10
  });

  // Rule: Income too high
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'incomeVsThreshold',
          operator: 'greaterThan',
          value: 0
        }
      ]
    },
    event: {
      type: 'flanders-social-ineligible',
      params: {
        reason: 'inkomen boven sociale grenzen',
        priority: 9
      }
    },
    priority: 9
  });

  // Rule: Patrimony too high (2024+ only)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasPatrimonyTest',
          operator: 'equal',
          value: true
        },
        {
          fact: 'patrimonyVsLimit',
          operator: 'greaterThan',
          value: 0
        }
      ]
    },
    event: {
      type: 'flanders-social-ineligible',
      params: {
        reason: 'vermogen boven limiet',
        priority: 8
      }
    },
    priority: 8
  });

  // Rule: Basic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'registeredInBelgium',
          operator: 'equal',
          value: true
        },
        {
          fact: 'incomeVsThreshold',
          operator: 'lessThanInclusive',
          value: 0
        },
        {
          any: [
            {
              fact: 'hasPatrimonyTest',
              operator: 'equal',
              value: false
            },
            {
              fact: 'patrimonyVsLimit',
              operator: 'lessThanInclusive',
              value: 0
            }
          ]
        },
        {
          any: [
            {
              fact: 'ownsProperty',
              operator: 'equal',
              value: false
            },
            {
              fact: 'propertyInhabitable',
              operator: 'equal',
              value: true
            }
          ]
        }
      ]
    },
    event: {
      type: 'flanders-social-eligible',
      params: {
        message: 'In aanmerking voor sociale huisvesting'
      }
    },
    priority: 5
  });

  return engine;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate Brussels income threshold
 */
function calculateBrusselsThreshold(isolated: boolean, children: number, handicapped: number): number {
  const base = isolated ? BRUSSELS_SOCIAL_2024.incomeThresholds.baseIsolated
                        : BRUSSELS_SOCIAL_2024.incomeThresholds.baseCouple;
  const childrenSupplement = children * BRUSSELS_SOCIAL_2024.incomeThresholds.childSupplement;
  const handicapSupplement = handicapped * BRUSSELS_SOCIAL_2024.incomeThresholds.handicapSupplement;

  return base + childrenSupplement + handicapSupplement;
}

/**
 * Calculate Wallonia income threshold
 */
function calculateWalloniaThreshold(isolated: boolean, children: number, handicapped: number): number {
  const base = isolated ? WALLONIA_SOCIAL_2024.incomeThresholds.isolated
                        : WALLONIA_SOCIAL_2024.incomeThresholds.multipleHousehold;
  const childrenSupplement = children * WALLONIA_SOCIAL_2024.incomeThresholds.childSupplement;
  const handicapSupplement = handicapped * WALLONIA_SOCIAL_2024.incomeThresholds.handicapSupplement;

  return Math.min(base + childrenSupplement + handicapSupplement, WALLONIA_SOCIAL_2024.incomeThresholds.multipleHousehold);
}

/**
 * Calculate Flanders income threshold
 */
function calculateFlandersThreshold(year: 2024 | 2025, isolated: boolean, children: number, handicapped: number): number {
  const thresholds = year === 2024 ? FLANDERS_SOCIAL_2024.incomeThresholds2024
                                   : FLANDERS_SOCIAL_2024.incomeThresholds2025;

  let base: number;
  if (isolated && handicapped > 0) {
    base = thresholds.isolatedHandicap;
  } else if (isolated) {
    base = thresholds.isolated;
  } else {
    base = thresholds.others;
  }

  const childrenSupplement = children * thresholds.childSupplement;
  return base + childrenSupplement;
}

/**
 * Calculate Flanders patrimony limit
 */
function calculateFlandersPatrimonyLimit(year: 2024 | 2025, isolated: boolean, handicapped: number): number {
  const limits = year === 2024 ? FLANDERS_SOCIAL_2024.patrimonyLimits2024
                               : FLANDERS_SOCIAL_2024.patrimonyLimits2025;

  if (isolated && handicapped > 0) {
    return limits.isolatedHandicap;
  } else if (isolated) {
    return limits.isolated;
  } else {
    return limits.others;
  }
}

/**
 * Calculate priority points
 */
function calculatePriorityPoints(region: string, currentHousing: any, householdComposition: any): number {
  let points = 0;

  switch (region) {
    case 'brussels':
      if (householdComposition.singleParent) points += BRUSSELS_SOCIAL_2024.priorityPoints.singleParent;
      points += householdComposition.children * BRUSSELS_SOCIAL_2024.priorityPoints.childrenPerChild;
      if (currentHousing.unsanitary) points += BRUSSELS_SOCIAL_2024.priorityPoints.unsanitaryHousing;
      if (householdComposition.handicappedMembers > 0) points += BRUSSELS_SOCIAL_2024.priorityPoints.handicap;
      if (currentHousing.situation === 'homeless') points += BRUSSELS_SOCIAL_2024.priorityPoints.urgentNeed;
      break;

    case 'wallonia':
      if (householdComposition.handicappedMembers > 0) points += WALLONIA_SOCIAL_2024.priorityPoints.handicap;
      if (householdComposition.singleParent) points += WALLONIA_SOCIAL_2024.priorityPoints.singleParent;
      if (householdComposition.children >= 3) points += WALLONIA_SOCIAL_2024.priorityPoints.largeFamily;
      if (currentHousing.unsanitary) points += WALLONIA_SOCIAL_2024.priorityPoints.unsanitaryHousing;
      if (currentHousing.situation === 'homeless') points += WALLONIA_SOCIAL_2024.priorityPoints.homeless;
      break;

    case 'flanders':
      if (currentHousing.situation === 'homeless') points += FLANDERS_SOCIAL_2024.priorityCategories.actualUrgency;
      else if (currentHousing.unsanitary || currentHousing.overcrowded) {
        points += FLANDERS_SOCIAL_2024.priorityCategories.housingNeed;
      } else {
        points += FLANDERS_SOCIAL_2024.priorityCategories.rational;
      }
      break;
  }

  return points;
}

/**
 * Calculate estimated social rent
 */
function calculateEstimatedRent(region: string, annualIncome: number, bedroomsNeeded: number): number {
  const monthlyIncome = annualIncome / 12;

  switch (region) {
    case 'brussels':
      return Math.round(monthlyIncome * BRUSSELS_SOCIAL_2024.rentCalculation.socialRentBase);

    case 'wallonia':
      let rate: number;
      if (annualIncome < 14500) {
        rate = WALLONIA_SOCIAL_2024.rentCalculation.category1Rate;
      } else if (annualIncome < 29100) {
        rate = WALLONIA_SOCIAL_2024.rentCalculation.category2Rate;
      } else {
        rate = WALLONIA_SOCIAL_2024.rentCalculation.category3Rate;
      }
      return Math.round(monthlyIncome * rate);

    case 'flanders':
      return Math.round(monthlyIncome * FLANDERS_SOCIAL_2024.rentCalculation.baseSocialRent);

    default:
      return 0;
  }
}

/**
 * Get waiting time estimate
 */
function getWaitingTimeEstimate(region: string, bedroomsNeeded: number): { min: number; max: number; unit: 'years' | 'months' } {
  switch (region) {
    case 'brussels':
      if (bedroomsNeeded <= 1) {
        return { ...BRUSSELS_SOCIAL_2024.waitingTimes.studio1Bedroom, unit: 'years' };
      } else if (bedroomsNeeded === 2) {
        return { ...BRUSSELS_SOCIAL_2024.waitingTimes.twoBedrooms, unit: 'years' };
      } else {
        return { ...BRUSSELS_SOCIAL_2024.waitingTimes.threePlusBedrooms, unit: 'years' };
      }

    case 'wallonia':
      return { ...WALLONIA_SOCIAL_2024.waitingTimes.average, unit: 'years' };

    case 'flanders':
      return { ...FLANDERS_SOCIAL_2024.waitingTimes.average, unit: 'years' };

    default:
      return { min: 2, max: 5, unit: 'years' };
  }
}

// ============================================================================
// MAIN ELIGIBILITY CHECK FUNCTION
// ============================================================================

/**
 * Check Social Housing eligibility across all regions
 */
export async function checkSocialHousingEligibility(request: SocialHousingRequest): Promise<SocialHousingResult> {
  const { region, applicantInfo, householdComposition, financialSituation, currentHousing, applicationYear } = request;

  // Calculate bedrooms needed (1 for single/couple, +1 per 2 children)
  const bedroomsNeeded = 1 + Math.ceil(householdComposition.children / 2);

  // Prepare common facts
  const baseFacts = {
    registeredInBelgium: applicantInfo.registeredInBelgium,
    ownsProperty: financialSituation.ownsProperty,
    propertyInhabitable: financialSituation.propertyDetails?.inhabitable || false,
    hasCertificateUninhabitability: financialSituation.propertyDetails?.certificateOfUninhabitability || false,
    annualIncome: financialSituation.annualIncome
  };

  try {
    switch (region) {
      case 'brussels': {
        const engine = createBrusselsSocialEngine();

        const isolated = householdComposition.adults === 1;
        const threshold = calculateBrusselsThreshold(
          isolated,
          householdComposition.children,
          householdComposition.handicappedMembers
        );

        const facts = {
          ...baseFacts,
          incomeVsThreshold: financialSituation.annualIncome - threshold
        };

        const results = await engine.run(facts);

        const ineligibleEvent = results.events.find(e => e.type === 'brussels-social-ineligible');
        if (ineligibleEvent) {
          return {
            benefitType: 'logement-social',
            region: 'Bruxelles-Capitale',
            isEligible: false,
            reason: ineligibleEvent.params?.reason,
            incomeThreshold: threshold
          };
        }

        const eligibleEvent = results.events.find(e => e.type === 'brussels-social-eligible');
        if (eligibleEvent) {
          const priorityPoints = calculatePriorityPoints('brussels', currentHousing, householdComposition);
          const estimatedRent = calculateEstimatedRent('brussels', financialSituation.annualIncome, bedroomsNeeded);
          const waitingTime = getWaitingTimeEstimate('brussels', bedroomsNeeded);

          return {
            benefitType: 'logement-social',
            region: 'Bruxelles-Capitale',
            isEligible: true,
            estimatedMonthlyRent: estimatedRent,
            estimatedWaitingTime: waitingTime,
            priorityPoints: priorityPoints,
            incomeThreshold: threshold,
            reason: `Revenus (${financialSituation.annualIncome}€) dans les limites (${threshold}€)`,
            requiredDocuments: [
              'Carte d\'identité tous membres',
              'Composition de ménage',
              'Avertissement-extrait de rôle N-3',
              'Preuve de non-propriété',
              'Certificat médical si handicap'
            ]
          };
        }
        break;
      }

      case 'wallonia': {
        const engine = createWalloniaSocialEngine();

        const isolated = householdComposition.adults === 1;
        const threshold = calculateWalloniaThreshold(
          isolated,
          householdComposition.children,
          householdComposition.handicappedMembers
        );

        const facts = {
          ...baseFacts,
          incomeVsThreshold: financialSituation.annualIncome - threshold
        };

        const results = await engine.run(facts);

        const ineligibleEvent = results.events.find(e => e.type === 'wallonia-social-ineligible');
        if (ineligibleEvent) {
          return {
            benefitType: 'logement-social',
            region: 'Wallonie',
            isEligible: false,
            reason: ineligibleEvent.params?.reason,
            incomeThreshold: threshold
          };
        }

        const eligibleEvent = results.events.find(e => e.type === 'wallonia-social-eligible');
        if (eligibleEvent) {
          let category: string;
          if (financialSituation.annualIncome < 14500) {
            category = WALLONIA_SOCIAL_2024.categories.category1;
          } else if (financialSituation.annualIncome < 29100) {
            category = WALLONIA_SOCIAL_2024.categories.category2;
          } else {
            category = WALLONIA_SOCIAL_2024.categories.category3;
          }

          const priorityPoints = calculatePriorityPoints('wallonia', currentHousing, householdComposition);
          const estimatedRent = calculateEstimatedRent('wallonia', financialSituation.annualIncome, bedroomsNeeded);
          const waitingTime = getWaitingTimeEstimate('wallonia', bedroomsNeeded);

          return {
            benefitType: 'logement-social',
            region: 'Wallonie',
            isEligible: true,
            category: category,
            estimatedMonthlyRent: estimatedRent,
            estimatedWaitingTime: waitingTime,
            priorityPoints: priorityPoints,
            incomeThreshold: threshold,
            reason: `Plafond adapté: ${threshold}€`,
            requiredDocuments: [
              'Carte d\'identité tous membres',
              'Composition de ménage',
              'Avertissement-extrait de rôle N-3',
              'Attestation notariale non-propriété',
              'Certificat insalubrité si applicable',
              'Jugement garde enfants si séparé'
            ]
          };
        }
        break;
      }

      case 'flanders': {
        const engine = createFlandersSocialEngine();

        const isolated = householdComposition.adults === 1;
        const threshold = calculateFlandersThreshold(
          applicationYear,
          isolated,
          householdComposition.children,
          householdComposition.handicappedMembers
        );

        // Check patrimony for new applications from 2024
        const hasPatrimonyTest = applicationYear >= 2024;
        const patrimonyLimit = hasPatrimonyTest ?
          calculateFlandersPatrimonyLimit(applicationYear, isolated, householdComposition.handicappedMembers) : 0;
        const patrimonyVsLimit = hasPatrimonyTest && financialSituation.patrimonyValue ?
          financialSituation.patrimonyValue - patrimonyLimit : -1;

        const facts = {
          ...baseFacts,
          incomeVsThreshold: financialSituation.annualIncome - threshold,
          hasPatrimonyTest: hasPatrimonyTest,
          patrimonyVsLimit: patrimonyVsLimit
        };

        const results = await engine.run(facts);

        const ineligibleEvent = results.events.find(e => e.type === 'flanders-social-ineligible');
        if (ineligibleEvent) {
          let reason = ineligibleEvent.params?.reason;
          if (reason === 'vermogen boven limiet' && financialSituation.patrimonyValue) {
            reason = `patrimoine mobilier (${financialSituation.patrimonyValue}€) > limite (${patrimonyLimit}€)`;
          } else if (reason === 'inkomen boven sociale grenzen') {
            reason = `revenus (${financialSituation.annualIncome}€) > plafond (${threshold}€)`;
          }

          return {
            benefitType: 'logement-social',
            region: 'Vlaanderen',
            isEligible: false,
            reason: reason,
            incomeThreshold: threshold
          };
        }

        const eligibleEvent = results.events.find(e => e.type === 'flanders-social-eligible');
        if (eligibleEvent) {
          const priorityPoints = calculatePriorityPoints('flanders', currentHousing, householdComposition);
          const estimatedRent = calculateEstimatedRent('flanders', financialSituation.annualIncome, bedroomsNeeded);
          const waitingTime = getWaitingTimeEstimate('flanders', bedroomsNeeded);

          return {
            benefitType: 'logement-social',
            region: 'Vlaanderen',
            isEligible: true,
            estimatedMonthlyRent: estimatedRent,
            estimatedWaitingTime: waitingTime,
            priorityPoints: priorityPoints,
            incomeThreshold: threshold,
            reason: `revenus < ${threshold}€` + (hasPatrimonyTest ? ` et patrimoine < ${patrimonyLimit}€` : ''),
            requiredDocuments: [
              'Identiteitskaart alle gezinsleden',
              'Gezinssamenstelling',
              'Aanslagbiljet jaar N-3',
              'Bewijs geen eigendom',
              'Medisch attest indien handicap',
              hasPatrimonyTest ? 'Verklaring roerend vermogen' : null
            ].filter(doc => doc !== null) as string[]
          };
        }
        break;
      }
    }

    // Default: not eligible
    return {
      benefitType: 'logement-social',
      region: region,
      isEligible: false,
      reason: 'conditions non remplies'
    };

  } catch (error) {
    throw new Error(`Error checking Social Housing eligibility: ${error}`);
  }
}

// ============================================================================
// EXPORT JSON RULES FOR TRANSPARENCY
// ============================================================================

export const SOCIAL_HOUSING_RULES_JSON = {
  legalFramework: {
    brussels: {
      primaryLegislation: {
        title: 'Code bruxellois du Logement',
        authority: 'Région de Bruxelles-Capitale',
        officialUrl: 'https://www.ejustice.just.fgov.be'
      },
      implementingDecree: {
        title: 'Arrêté du Gouvernement du 26 septembre 1996',
        description: 'Organisation location habitations SLRB'
      }
    },
    wallonia: {
      primaryLegislation: {
        title: 'Code wallon du Logement et de l\'Habitat durable',
        authority: 'Région Wallonne',
        officialUrl: 'https://wallex.wallonie.be'
      },
      implementingDecree: {
        title: 'Arrêté du Gouvernement wallon du 6 septembre 2007',
        description: 'Organisation location logements sociaux'
      }
    },
    flanders: {
      primaryLegislation: {
        title: 'Vlaamse Wooncode',
        authority: 'Vlaamse Regering',
        officialUrl: 'https://codex.vlaanderen.be'
      },
      implementingDecree: {
        title: 'Besluit Vlaamse Regering sociaal huurstelsel',
        description: 'Regeling sociale huurwoningen'
      },
      recentChanges: {
        patrimonyTest: {
          effectiveDate: '2024-01-01',
          description: 'Vermogenstest voor nieuwe inschrijvingen'
        }
      }
    }
  },
  regionalThresholds2024: {
    brussels: BRUSSELS_SOCIAL_2024,
    wallonia: WALLONIA_SOCIAL_2024,
    flanders: {
      year2024: FLANDERS_SOCIAL_2024.incomeThresholds2024,
      year2025: FLANDERS_SOCIAL_2024.incomeThresholds2025,
      patrimony2024: FLANDERS_SOCIAL_2024.patrimonyLimits2024,
      patrimony2025: FLANDERS_SOCIAL_2024.patrimonyLimits2025
    }
  },
  waitingTimes: {
    brussels: {
      studio1Bedroom: '11-12 ans',
      twoBedrooms: '8-10 ans',
      threePlusBedrooms: '5-8 ans'
    },
    wallonia: {
      allTypes: '3-5 ans'
    },
    flanders: {
      allTypes: '2-5 ans'
    }
  },
  rentCalculation: {
    brussels: {
      formula: 'Environ 20-30% des revenus',
      standard: '22% pour calcul standard'
    },
    wallonia: {
      category1: '12% des revenus (< 14,500€)',
      category2: '18% des revenus (14,500-29,100€)',
      category3: '22% des revenus (> 29,100€)'
    },
    flanders: {
      base: '20% des revenus',
      correction: 'Ajustement selon valeur marché'
    }
  },
  prioritySystem: {
    brussels: {
      singleParent: 3,
      perChild: 1,
      unsanitaryHousing: 5,
      handicap: 4,
      urgentNeed: 10
    },
    wallonia: {
      handicap: 5,
      singleParent: 4,
      largeFamily: 3,
      unsanitaryHousing: 6,
      homeless: 10
    },
    flanders: {
      actualUrgency: 20,
      localBinding: 15,
      housingNeed: 10,
      rational: 5
    }
  },
  eligibilityConditions: {
    common: [
      'Inscription registre population',
      'Ne pas être propriétaire (sauf inhabitable)',
      'Revenus dans les plafonds',
      'Majorité ou émancipation'
    ],
    regionalSpecific: {
      brussels: [
        'Domicile à Bruxelles ou lien avec la région'
      ],
      wallonia: [
        'Pas de radiation SWCS dernières 3 années'
      ],
      flanders: [
        'Test patrimoine depuis 2024',
        'Connaissance néerlandais après 1 an'
      ]
    }
  },
  applicationProcess: {
    registration: {
      cost: 'Gratuit',
      validity: 'Renouvellement annuel requis',
      multipleRegistrations: 'Possible auprès de plusieurs sociétés'
    },
    requiredDocuments: [
      'Carte d\'identité/Identiteitskaart',
      'Composition de ménage/Gezinssamenstelling',
      'Avertissement-extrait de rôle/Aanslagbiljet (N-3)',
      'Attestation non-propriété/Bewijs geen eigendom',
      'Documents spécifiques selon situation'
    ],
    processingTime: {
      acknowledgment: '30-50 jours',
      inscriptionNumber: 'Détermine ordre sur liste'
    }
  },
  mutations: {
    description: 'Changement logement dans parc social',
    priority: 'Priorité sur nouveaux candidats',
    reasons: [
      'Sur/sous-occupation',
      'Mobilité réduite',
      'Rapprochement travail/famille',
      'Violence domestique'
    ],
    waitingTime: 'Généralement 1-2 ans'
  }
};