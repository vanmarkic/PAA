/**
 * Business Rules for Aide au Logement (Housing Allowance)
 *
 * Implements comprehensive eligibility rules for Belgian housing allowances
 * across all regions (Brussels, Wallonia, Flanders).
 *
 * BASE JURIDIQUE:
 * BRUXELLES-CAPITALE:
 * - Arrêté du Gouvernement de la Région de Bruxelles-Capitale du 15 juillet 2021
 *   instituant une allocation de loyer
 *   https://www.ejustice.just.fgov.be
 * - Arrêté ministériel du 30 septembre 2021 portant exécution
 *
 * WALLONIE:
 * - Code wallon du Logement et de l'Habitat durable
 * - Arrêté du Gouvernement wallon relatif à l'allocation de déménagement et de loyer (ADeL)
 * - Arrêté relatif à l'allocation d'attente logement (AAL)
 *
 * FLANDRES:
 * - Vlaams Woninghuurdecreet
 * - Besluit Vlaamse Regering betreffende de huurpremie
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../../../../../domain/types';
import { RENT_ALLOWANCE_LEGAL_FRAMEWORK } from '../../../../../legal-sources/belgianLegalSources';

// ============================================================================
// REGIONAL CONSTANTS 2024
// ============================================================================

/**
 * Brussels-Capital Region Constants
 */
const BRUSSELS_2024 = {
  incomeThresholds: {
    socialPriority: 20895.43, // EUR annual for social priority category
    mediumIncome: 27550.86,   // EUR annual for medium income category
    cohabitantSupplement: 7071.79 // EUR additional per cohabitant
  },
  monthlyAllowances: {
    socialPriority: 186.67,    // EUR for priority households
    mediumIncome: 140.00,      // EUR for medium income households
    relocationMax: 5 * 12      // Maximum 5 years
  },
  priorityPoints: {
    minimum: 6,                // Minimum points on social housing waiting list
    relocationRequired: true   // Must be relocating or on waiting list
  }
};

/**
 * Wallonia Region Constants
 */
const WALLONIA_2024 = {
  incomeThresholds: {
    isolated: 17000,           // EUR annual for isolated person
    couple: 23200,            // EUR annual for couple
    childSupplement: 3200     // EUR per child
  },
  adelAllowances: {
    baseMonthly: 100,         // EUR base monthly allowance
    perChild: 20,             // EUR per child supplement
    maxDuration: 24,          // Maximum months
    relocationGrant: 400,     // EUR one-time relocation grant
    relocationGrantPerChild: 80 // EUR per child for relocation
  },
  aalAllowances: {
    minimum: 125,             // EUR minimum monthly
    maximum: 185,             // EUR maximum monthly
    waitingListMinMonths: 18 // Minimum months on waiting list
  }
};

/**
 * Flanders Region Constants
 */
const FLANDERS_2024 = {
  incomeThresholds: {
    base: 25000,              // EUR annual base threshold
    supplement: 2000          // EUR per dependent
  },
  waitingListMinYears: 4,    // Minimum years on social housing waiting list
  allowanceVariable: true,   // Amount varies by municipality
  maxRentRatio: 0.33        // Maximum 33% of income for rent
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface HousingAidRequest {
  region: 'brussels' | 'wallonia' | 'flanders';
  annualIncome: number;
  monthlyRent: number;
  householdComposition: {
    adults: number;
    children: number;
    singleParent: boolean;
  };
  socialHousingStatus: {
    onWaitingList: boolean;
    waitingListMonths: number;
    priorityPoints?: number;
  };
  currentHousing: {
    isOwner: boolean;
    isRenting: boolean;
    leavingUnsanitaryHousing?: boolean;
    leavingOvercrowdedHousing?: boolean;
    evicted?: boolean;
  };
}

export interface HousingAidResult extends EligibilityCheck {
  region: string;
  aidType?: string;
  monthlyAmount?: number;
  oneTimeGrant?: number;
  duration?: string;
  conditions?: string[];
}

// ============================================================================
// RULES ENGINE CREATION
// ============================================================================

/**
 * Create Brussels Housing Aid rules engine
 */
function createBrusselsEngine(): Engine {
  const engine = new Engine();

  // Rule: Owner not eligible
  engine.addRule({
    conditions: {
      any: [{
        fact: 'isOwner',
        operator: 'equal',
        value: true
      }]
    },
    event: {
      type: 'brussels-ineligible',
      params: {
        reason: 'propriétaire du logement - aide réservée aux locataires',
        priority: 10
      }
    },
    priority: 10
  });

  // Rule: Income too high
  engine.addRule({
    conditions: {
      any: [{
        fact: 'totalIncome',
        operator: 'greaterThan',
        value: BRUSSELS_2024.incomeThresholds.mediumIncome
      }]
    },
    event: {
      type: 'brussels-ineligible',
      params: {
        reason: `revenus annuels > ${BRUSSELS_2024.incomeThresholds.mediumIncome}€`,
        priority: 9
      }
    },
    priority: 9
  });

  // Rule: Not on waiting list or insufficient priority points
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'onWaitingList',
          operator: 'equal',
          value: true
        },
        {
          fact: 'priorityPoints',
          operator: 'lessThan',
          value: BRUSSELS_2024.priorityPoints.minimum
        }
      ]
    },
    event: {
      type: 'brussels-ineligible',
      params: {
        reason: `moins de ${BRUSSELS_2024.priorityPoints.minimum} points de priorité sur liste sociale`,
        priority: 8
      }
    },
    priority: 8
  });

  // Rule: Social priority category eligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isRenting',
          operator: 'equal',
          value: true
        },
        {
          fact: 'totalIncome',
          operator: 'lessThanInclusive',
          value: BRUSSELS_2024.incomeThresholds.socialPriority
        },
        {
          fact: 'onWaitingList',
          operator: 'equal',
          value: true
        },
        {
          fact: 'priorityPoints',
          operator: 'greaterThanInclusive',
          value: BRUSSELS_2024.priorityPoints.minimum
        }
      ]
    },
    event: {
      type: 'brussels-eligible-priority',
      params: {
        category: 'priorité sociale',
        monthlyAmount: BRUSSELS_2024.monthlyAllowances.socialPriority
      }
    },
    priority: 5
  });

  // Rule: Medium income category eligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isRenting',
          operator: 'equal',
          value: true
        },
        {
          fact: 'totalIncome',
          operator: 'greaterThan',
          value: BRUSSELS_2024.incomeThresholds.socialPriority
        },
        {
          fact: 'totalIncome',
          operator: 'lessThanInclusive',
          value: BRUSSELS_2024.incomeThresholds.mediumIncome
        },
        {
          fact: 'onWaitingList',
          operator: 'equal',
          value: true
        },
        {
          fact: 'priorityPoints',
          operator: 'greaterThanInclusive',
          value: BRUSSELS_2024.priorityPoints.minimum
        }
      ]
    },
    event: {
      type: 'brussels-eligible-medium',
      params: {
        category: 'revenus moyens',
        monthlyAmount: BRUSSELS_2024.monthlyAllowances.mediumIncome
      }
    },
    priority: 4
  });

  return engine;
}

/**
 * Create Wallonia Housing Aid rules engine
 */
function createWalloniaEngine(): Engine {
  const engine = new Engine();

  // Rule: Owner not eligible
  engine.addRule({
    conditions: {
      any: [{
        fact: 'isOwner',
        operator: 'equal',
        value: true
      }]
    },
    event: {
      type: 'wallonia-ineligible',
      params: {
        reason: 'propriétaire - aide réservée aux locataires',
        priority: 10
      }
    },
    priority: 10
  });

  // Rule: Income too high
  engine.addRule({
    conditions: {
      any: [{
        fact: 'incomeVsThreshold',
        operator: 'greaterThan',
        value: 0
      }]
    },
    event: {
      type: 'wallonia-ineligible',
      params: {
        reason: 'revenus dépassent les plafonds',
        priority: 9
      }
    },
    priority: 9
  });

  // Rule: ADeL eligibility (leaving unsanitary/overcrowded housing)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isRenting',
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
              fact: 'leavingUnsanitaryHousing',
              operator: 'equal',
              value: true
            },
            {
              fact: 'leavingOvercrowdedHousing',
              operator: 'equal',
              value: true
            },
            {
              fact: 'evicted',
              operator: 'equal',
              value: true
            }
          ]
        }
      ]
    },
    event: {
      type: 'wallonia-eligible-adel',
      params: {
        aidType: 'ADeL',
        message: 'Éligible pour allocation déménagement et loyer'
      }
    },
    priority: 5
  });

  // Rule: AAL eligibility (long waiting list)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'onWaitingList',
          operator: 'equal',
          value: true
        },
        {
          fact: 'waitingListMonths',
          operator: 'greaterThan',
          value: WALLONIA_2024.aalAllowances.waitingListMinMonths
        },
        {
          fact: 'incomeVsThreshold',
          operator: 'lessThanInclusive',
          value: 0
        }
      ]
    },
    event: {
      type: 'wallonia-eligible-aal',
      params: {
        aidType: 'AAL',
        message: 'Éligible pour allocation attente logement'
      }
    },
    priority: 4
  });

  return engine;
}

/**
 * Create Flanders Housing Aid rules engine
 */
function createFlandersEngine(): Engine {
  const engine = new Engine();

  // Rule: Owner not eligible
  engine.addRule({
    conditions: {
      any: [{
        fact: 'isOwner',
        operator: 'equal',
        value: true
      }]
    },
    event: {
      type: 'flanders-ineligible',
      params: {
        reason: 'eigenaar - hulp voorbehouden voor huurders',
        priority: 10
      }
    },
    priority: 10
  });

  // Rule: Not on waiting list long enough
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'onWaitingList',
          operator: 'equal',
          value: true
        },
        {
          fact: 'waitingListYears',
          operator: 'lessThan',
          value: FLANDERS_2024.waitingListMinYears
        }
      ]
    },
    event: {
      type: 'flanders-ineligible',
      params: {
        reason: `minder dan ${FLANDERS_2024.waitingListMinYears} jaar op wachtlijst`,
        priority: 9
      }
    },
    priority: 9
  });

  // Rule: Basic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isRenting',
          operator: 'equal',
          value: true
        },
        {
          fact: 'onWaitingList',
          operator: 'equal',
          value: true
        },
        {
          fact: 'waitingListYears',
          operator: 'greaterThanInclusive',
          value: FLANDERS_2024.waitingListMinYears
        }
      ]
    },
    event: {
      type: 'flanders-eligible',
      params: {
        message: 'In aanmerking voor huurpremie'
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
 * Calculate adjusted income threshold for Wallonia
 */
function calculateWalloniaThreshold(isolated: boolean, children: number): number {
  const base = isolated ? WALLONIA_2024.incomeThresholds.isolated : WALLONIA_2024.incomeThresholds.couple;
  return base + (children * WALLONIA_2024.incomeThresholds.childSupplement);
}

/**
 * Calculate ADeL monthly allowance for Wallonia
 */
function calculateADelAmount(children: number): {
  monthly: number;
  relocationGrant: number;
} {
  const monthly = WALLONIA_2024.adelAllowances.baseMonthly +
                 (children * WALLONIA_2024.adelAllowances.perChild);
  const relocationGrant = WALLONIA_2024.adelAllowances.relocationGrant +
                         (children * WALLONIA_2024.adelAllowances.relocationGrantPerChild);

  return { monthly, relocationGrant };
}

/**
 * Calculate AAL monthly allowance for Wallonia
 */
function calculateAALAmount(monthsWaiting: number): number {
  // Linear interpolation based on waiting time
  const min = WALLONIA_2024.aalAllowances.minimum;
  const max = WALLONIA_2024.aalAllowances.maximum;
  const factor = Math.min((monthsWaiting - 18) / 24, 1); // Max at 42 months

  return Math.round(min + (max - min) * factor);
}

// ============================================================================
// MAIN ELIGIBILITY CHECK FUNCTION
// ============================================================================

/**
 * Check Housing Aid eligibility across all regions
 */
export async function checkHousingAidEligibility(request: HousingAidRequest): Promise<HousingAidResult> {
  const { region, annualIncome, monthlyRent, householdComposition, socialHousingStatus, currentHousing } = request;

  // Prepare common facts
  const baseFacts = {
    annualIncome,
    monthlyRent,
    isOwner: currentHousing.isOwner,
    isRenting: currentHousing.isRenting,
    onWaitingList: socialHousingStatus.onWaitingList,
    waitingListMonths: socialHousingStatus.waitingListMonths,
    waitingListYears: Math.floor(socialHousingStatus.waitingListMonths / 12),
    leavingUnsanitaryHousing: currentHousing.leavingUnsanitaryHousing || false,
    leavingOvercrowdedHousing: currentHousing.leavingOvercrowdedHousing || false,
    evicted: currentHousing.evicted || false
  };

  try {
    switch (region) {
      case 'brussels': {
        const engine = createBrusselsEngine();

        // Calculate total income including cohabitant supplements
        const cohabitants = householdComposition.adults - 1 + householdComposition.children;
        const totalIncome = annualIncome + (cohabitants > 0 ? BRUSSELS_2024.incomeThresholds.cohabitantSupplement : 0);

        const facts = {
          ...baseFacts,
          totalIncome,
          priorityPoints: socialHousingStatus.priorityPoints || 0,
          singleParent: householdComposition.singleParent
        };

        const results = await engine.run(facts);

        const ineligibleEvent = results.events.find(e => e.type === 'brussels-ineligible');
        if (ineligibleEvent) {
          return {
            benefitType: 'aide-logement',
            region: 'Bruxelles-Capitale',
            isEligible: false,
            reason: ineligibleEvent.params?.reason
          };
        }

        const eligiblePriority = results.events.find(e => e.type === 'brussels-eligible-priority');
        if (eligiblePriority) {
          return {
            benefitType: 'aide-logement',
            region: 'Bruxelles-Capitale',
            isEligible: true,
            aidType: 'Allocation loyer - priorité sociale',
            monthlyAmount: eligiblePriority.params?.monthlyAmount,
            reason: householdComposition.singleParent
              ? `famille monoparentale avec revenus <= ${BRUSSELS_2024.incomeThresholds.socialPriority}€`
              : `revenus <= ${BRUSSELS_2024.incomeThresholds.socialPriority}€`,
            conditions: ['Maintenir résidence à Bruxelles', 'Rester locataire', 'Déclarer tout changement de situation']
          };
        }

        const eligibleMedium = results.events.find(e => e.type === 'brussels-eligible-medium');
        if (eligibleMedium) {
          return {
            benefitType: 'aide-logement',
            region: 'Bruxelles-Capitale',
            isEligible: true,
            aidType: 'Allocation loyer - revenus moyens',
            monthlyAmount: eligibleMedium.params?.monthlyAmount,
            reason: `revenus entre ${BRUSSELS_2024.incomeThresholds.socialPriority}€ et ${BRUSSELS_2024.incomeThresholds.mediumIncome}€`,
            conditions: ['Maintenir résidence à Bruxelles', 'Rester locataire', 'Déclarer tout changement de situation']
          };
        }

        // Check for relocation aid if evicted
        if (currentHousing.evicted && annualIncome <= BRUSSELS_2024.incomeThresholds.socialPriority) {
          return {
            benefitType: 'aide-logement',
            region: 'Bruxelles-Capitale',
            isEligible: true,
            aidType: 'Allocation de relogement',
            oneTimeGrant: 1180,
            duration: '60', // 5 years max
            reason: 'expulsion avec revenus modestes',
            conditions: ['Nouveau bail signé', 'Ancien logement quitté suite expulsion']
          };
        }

        break;
      }

      case 'wallonia': {
        const engine = createWalloniaEngine();

        const isolated = householdComposition.adults === 1;
        const threshold = calculateWalloniaThreshold(isolated, householdComposition.children);
        const incomeVsThreshold = annualIncome - threshold;

        const facts = {
          ...baseFacts,
          incomeVsThreshold
        };

        const results = await engine.run(facts);

        const ineligibleEvent = results.events.find(e => e.type === 'wallonia-ineligible');
        if (ineligibleEvent) {
          return {
            benefitType: 'aide-logement',
            region: 'Wallonie',
            isEligible: false,
            reason: ineligibleEvent.params?.reason
          };
        }

        const eligibleADel = results.events.find(e => e.type === 'wallonia-eligible-adel');
        if (eligibleADel) {
          const amounts = calculateADelAmount(householdComposition.children);
          return {
            benefitType: 'aide-logement',
            region: 'Wallonie',
            isEligible: true,
            aidType: 'ADeL - Allocation déménagement et loyer',
            monthlyAmount: amounts.monthly,
            oneTimeGrant: amounts.relocationGrant,
            duration: String(WALLONIA_2024.adelAllowances.maxDuration),
            calculatedAmount: amounts.monthly,
            reason: `revenus < ${threshold}€ et déménagement logement salubre`,
            conditions: [
              'Nouveau logement doit être salubre',
              'Certificat de salubrité requis',
              'Durée maximum 2 ans'
            ]
          };
        }

        const eligibleAAL = results.events.find(e => e.type === 'wallonia-eligible-aal');
        if (eligibleAAL) {
          const amount = calculateAALAmount(socialHousingStatus.waitingListMonths);
          return {
            benefitType: 'aide-logement',
            region: 'Wallonie',
            isEligible: true,
            aidType: 'AAL - Allocation attente logement',
            monthlyAmount: amount,
            reason: `inscrit liste attente > ${WALLONIA_2024.aalAllowances.waitingListMinMonths} mois`,
            conditions: [
              'Maintenir inscription liste attente',
              'Accepter logement social proposé'
            ]
          };
        }

        break;
      }

      case 'flanders': {
        const engine = createFlandersEngine();

        const results = await engine.run(baseFacts);

        const ineligibleEvent = results.events.find(e => e.type === 'flanders-ineligible');
        if (ineligibleEvent) {
          return {
            benefitType: 'aide-logement',
            region: 'Vlaanderen',
            isEligible: false,
            reason: ineligibleEvent.params?.reason
          };
        }

        const eligibleEvent = results.events.find(e => e.type === 'flanders-eligible');
        if (eligibleEvent) {
          // Amount varies by municipality in Flanders
          const estimatedAmount = Math.min(monthlyRent * 0.3, 200);
          return {
            benefitType: 'aide-logement',
            region: 'Vlaanderen',
            isEligible: true,
            aidType: 'Huurpremie',
            monthlyAmount: estimatedAmount,
            reason: `liste attente ${socialHousingStatus.waitingListMonths / 12} ans`,
            conditions: [
              'Montant varie selon commune',
              'Vérifier conditions locales',
              'Maintenir inscription liste sociale'
            ]
          };
        }

        break;
      }
    }

    // Default: not eligible
    return {
      benefitType: 'aide-logement',
      region: region,
      isEligible: false,
      reason: 'conditions non remplies'
    };

  } catch (error) {
    throw new Error(`Error checking Housing Aid eligibility: ${error}`);
  }
}

// ============================================================================
// EXPORT JSON RULES FOR TRANSPARENCY
// ============================================================================

export const HOUSING_AID_RULES_JSON = {
  legalFramework: {
    brussels: {
      primaryLegislation: {
        title: 'Arrêté du Gouvernement de la Région de Bruxelles-Capitale instituant une allocation de loyer',
        date: '2021-07-15',
        publication: {
          date: '2021-10-01',
          reference: 'Moniteur Belge 2021-10-01'
        },
        officialUrl: 'https://www.ejustice.just.fgov.be',
        authority: 'Région de Bruxelles-Capitale'
      },
      implementingLegislation: [{
        title: 'Arrêté ministériel portant exécution',
        date: '2021-09-30',
        publication: {
          date: '2021-10-13',
          reference: 'Moniteur Belge 2021-10-13'
        }
      }]
    },
    wallonia: {
      primaryLegislation: {
        title: 'Code wallon du Logement et de l\'Habitat durable',
        authority: 'Région Wallonne',
        officialUrl: 'https://wallex.wallonie.be'
      },
      adelLegislation: {
        title: 'Arrêté du Gouvernement wallon relatif à l\'allocation de déménagement et de loyer (ADeL)',
        description: 'Aide pour déménagement vers logement salubre'
      },
      aalLegislation: {
        title: 'Arrêté relatif à l\'allocation d\'attente logement (AAL)',
        description: 'Aide pendant l\'attente d\'un logement social'
      }
    },
    flanders: {
      primaryLegislation: {
        title: 'Vlaams Woninghuurdecreet',
        authority: 'Vlaamse Regering',
        officialUrl: 'https://codex.vlaanderen.be'
      },
      implementingDecree: {
        title: 'Besluit Vlaamse Regering betreffende de huurpremie',
        description: 'Regeling huurpremie voor wachtlijstkandidaten'
      }
    }
  },
  regionalThresholds2024: {
    brussels: {
      incomeThresholds: BRUSSELS_2024.incomeThresholds,
      monthlyAllowances: BRUSSELS_2024.monthlyAllowances,
      priorityRequirements: BRUSSELS_2024.priorityPoints,
      conditions: [
        'Être locataire',
        'Minimum 6 points de priorité sur liste sociale',
        'Revenus dans les plafonds',
        'Résidence effective à Bruxelles'
      ]
    },
    wallonia: {
      incomeThresholds: WALLONIA_2024.incomeThresholds,
      adelAllowances: WALLONIA_2024.adelAllowances,
      aalAllowances: WALLONIA_2024.aalAllowances,
      conditions: {
        adel: [
          'Déménagement depuis logement insalubre/surpeuplé',
          'Nouveau logement salubre',
          'Revenus sous plafonds',
          'Maximum 2 ans'
        ],
        aal: [
          'Minimum 18 mois sur liste attente',
          'Revenus sous plafonds sociaux',
          'Maintenir inscription'
        ]
      }
    },
    flanders: {
      requirements: {
        waitingListMinYears: FLANDERS_2024.waitingListMinYears,
        incomeThresholds: FLANDERS_2024.incomeThresholds
      },
      conditions: [
        'Minimum 4 jaar op wachtlijst',
        'Huurder zijn',
        'Inkomen onder grenzen',
        'Bedrag varieert per gemeente'
      ]
    }
  },
  calculationMethods: {
    brussels: {
      formula: 'Montant fixe selon catégorie de revenus',
      categories: {
        socialPriority: '186.67€/mois si revenus <= 20,895.43€',
        mediumIncome: '140€/mois si revenus entre 20,895.43€ et 27,550.86€'
      },
      relocation: {
        oneTime: '1,180€ aide déménagement après expulsion',
        monthly: 'Aide mensuelle jusqu\'à 5 ans'
      }
    },
    wallonia: {
      adel: {
        formula: '100€ + (20€ × nombre enfants)',
        relocationGrant: '400€ + (80€ × nombre enfants)',
        maxDuration: '24 mois'
      },
      aal: {
        formula: 'Entre 125€ et 185€ selon durée attente',
        calculation: 'Interpolation linéaire 18-42 mois'
      }
    },
    flanders: {
      description: 'Variable selon commune',
      estimate: 'Environ 30% du loyer, max 200€/mois'
    }
  },
  cumulRules: {
    withRIS: {
      allowed: true,
      note: 'Cumulable avec RIS, déclaration au CPAS obligatoire'
    },
    withOtherHousingAids: {
      allowed: false,
      note: 'Non cumulable avec logement social effectif'
    }
  },
  procedureAndDelays: {
    brussels: {
      applicationDeadline: '45 jours',
      requiredDocuments: [
        'Contrat de bail',
        'Preuve de revenus',
        'Composition de ménage',
        'Attestation liste attente sociale'
      ]
    },
    wallonia: {
      applicationDeadline: '30 jours',
      requiredDocuments: [
        'Contrat de bail',
        'Preuve de revenus',
        'Composition de ménage',
        'Certificat salubrité (ADeL)',
        'Attestation liste attente (AAL)'
      ]
    },
    flanders: {
      applicationDeadline: '60 jours',
      requiredDocuments: [
        'Huurcontract',
        'Bewijs inkomen',
        'Gezinssamenstelling',
        'Attest wachtlijst sociale huisvesting'
      ]
    }
  },
  controlAndObligations: {
    annualReview: true,
    obligations: [
      'Déclarer tout changement de situation',
      'Maintenir statut locataire',
      'Résider effectivement dans la région',
      'Accepter contrôles administratifs'
    ],
    sanctions: {
      falseDeclaration: 'Remboursement intégral + exclusion',
      nonCompliance: 'Suspension ou arrêt de l\'aide'
    }
  }
};