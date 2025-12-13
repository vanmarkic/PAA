/**
 * Business Rules for Allocations Familiales (Family Allowances)
 *
 * Implements comprehensive eligibility rules for Belgian family allowances
 * with regional variations (Brussels, Wallonia, Flanders).
 *
 * BASE JURIDIQUE:
 * - Constitution belge, Article 23 - Droit aux allocations familiales
 * - Ordonnance du 25 avril 2019 réglant l'octroi des prestations familiales (Bruxelles)
 * - Décret du 8 février 2018 relatif à la gestion et au paiement des prestations familiales (Wallonie)
 * - Décret du 27 avril 2018 réglant les allocations dans le cadre de la politique familiale (Flandre)
 * - Loi spéciale du 6 janvier 2014 relative à la Sixième Réforme de l'État
 *
 * AUTORITÉS:
 * - Bruxelles: Famiris / Iriscare
 * - Wallonie: AVIQ
 * - Flandre: Opgroeien (Kind en Gezin)
 *
 * Dernière mise à jour: 2024
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../../../../../domain/types';
import { FAMILY_ALLOWANCES_LEGAL_FRAMEWORK, FAMILY_ALLOWANCES_AMOUNTS_2024 } from '../../../../../legal-sources/belgianLegalSources';

// Regional types
export type BelgianRegion = 'brussels' | 'wallonia' | 'flanders';

// Constants from Belgian family allowance law (2024)
const MIN_AGE_CHILD = 0;
const MAX_AGE_CHILD_UNCONDITIONAL = 18;
const MAX_AGE_CHILD_CONDITIONAL = 25;
const MAX_AGE_DISABILITY_SUPPLEMENT = 21;

// Regional amounts for 2024 (in EUR)
export const REGIONAL_AMOUNTS_2024 = {
  brussels: {
    age0to11: {
      bornBefore2019: 174.08,
      bornAfter2019: 186.51,
    },
    age12to17: {
      bornBefore2019: 186.51,
      bornAfter2019: 198.94,
    },
    age18to24: {
      bornBefore2019: 198.95,
      bornAfter2019: 211.38,
    },
    supplements: {
      singleParent: {
        baseRate: 0.20, // 20% supplement
        maxAmount: 75.00,
      },
      disability: {
        category1: 88.51,  // 4 points
        category2: 119.68, // 6-8 points
        category3: 445.05, // 9+ points
      },
      orphan: {
        halfOrphan: 186.51,
        fullOrphan: 373.02,
      },
      social: {
        incomeThreshold: 31000, // Annual household income
        supplementAmount: 60.00,
      },
    },
    authority: 'Famiris',
    officialUrl: 'https://famiris.brussels/',
  },
  wallonia: {
    age0to17: {
      universal: 192.73, // Same amount regardless of birth year
    },
    age18to24: {
      universal: 205.16,
    },
    supplements: {
      singleParent: {
        baseAmount: 48.00,
        incomeBasedMax: 96.00,
      },
      disability: {
        category1: 91.00,
        category2: 130.00,
        category3: 455.00,
      },
      orphan: {
        amount: 192.73,
      },
      social: {
        tier1: { threshold: 30000, amount: 25.00 },
        tier2: { threshold: 20000, amount: 50.00 },
        tier3: { threshold: 15000, amount: 75.00 },
      },
      largeFamily: {
        from3rdChild: 27.40,
        from4thChild: 54.80,
      },
    },
    authority: 'AVIQ',
    officialUrl: 'https://www.aviq.be/',
  },
  flanders: {
    universal: {
      baseAmount: 184.62, // Groeipakket - same for all ages
    },
    supplements: {
      care: {
        category1: 86.04,
        category2: 123.42,
        category3: 566.86,
      },
      social: {
        standard: 67.16,
        increased: 114.06,
      },
      participation: {
        age3to5: 20.40,    // Kleutertoelage
        age6to11: 36.99,   // Schooltoelage lager onderwijs
        age12to17: 63.60,  // Schooltoelage secundair
        age18plus: 68.52,  // Studietoelage hoger
      },
      orphan: 171.45,
    },
    authority: 'Opgroeien',
    officialUrl: 'https://www.groeipakket.be/',
  },
};

// Interface for child information
export interface ChildInfo {
  age: number;
  bornAfter2019: boolean;
  isStudent?: boolean;
  isApprentice?: boolean;
  isJobSeeker?: boolean;
  hasDisability?: boolean;
  disabilityCategory?: 1 | 2 | 3;
  isOrphan?: boolean;
  orphanType?: 'half' | 'full';
}

// Interface for family situation
export interface FamilySituation {
  region: BelgianRegion;
  numberOfChildren: number;
  isSingleParent: boolean;
  annualIncome: number;
  hasBIMStatus?: boolean; // Beneficiary of Increased Intervention
  children: ChildInfo[];
}

/**
 * Create the Family Allowances eligibility rules engine
 */
function createFamilyAllowancesEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Child age requirement (0-18 unconditional)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'childAge',
          operator: 'greaterThanInclusive',
          value: MIN_AGE_CHILD,
        },
        {
          fact: 'childAge',
          operator: 'lessThanInclusive',
          value: MAX_AGE_CHILD_UNCONDITIONAL,
        },
      ],
    },
    event: {
      type: 'fa-eligible-unconditional',
      params: {
        message: 'Éligible sans condition (0-18 ans)',
        category: 'unconditional',
      },
    },
    priority: 10,
  });

  // Rule 2: Conditional eligibility (18-25 with conditions)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'childAge',
          operator: 'greaterThan',
          value: MAX_AGE_CHILD_UNCONDITIONAL,
        },
        {
          fact: 'childAge',
          operator: 'lessThanInclusive',
          value: MAX_AGE_CHILD_CONDITIONAL,
        },
        {
          any: [
            { fact: 'isStudent', operator: 'equal', value: true },
            { fact: 'isApprentice', operator: 'equal', value: true },
            { fact: 'isJobSeeker', operator: 'equal', value: true },
          ],
        },
      ],
    },
    event: {
      type: 'fa-eligible-conditional',
      params: {
        message: 'Éligible avec conditions (18-25 ans)',
        category: 'conditional',
      },
    },
    priority: 9,
  });

  // Rule 3: Age too high without conditions
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'childAge',
          operator: 'greaterThan',
          value: MAX_AGE_CHILD_CONDITIONAL,
        },
        {
          all: [
            {
              fact: 'childAge',
              operator: 'greaterThan',
              value: MAX_AGE_CHILD_UNCONDITIONAL,
            },
            { fact: 'isStudent', operator: 'equal', value: false },
            { fact: 'isApprentice', operator: 'equal', value: false },
            { fact: 'isJobSeeker', operator: 'equal', value: false },
          ],
        },
      ],
    },
    event: {
      type: 'fa-ineligible',
      params: {
        reason: 'âge maximum dépassé ou conditions non remplies pour 18-25 ans',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 4: Residency requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasValidResidency',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'fa-ineligible',
      params: {
        reason: 'pas de domicile légal ou titre de séjour valide en Belgique',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 5: Disability supplement eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasDisability',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'childAge',
          operator: 'lessThanInclusive',
          value: MAX_AGE_DISABILITY_SUPPLEMENT,
        },
      ],
    },
    event: {
      type: 'fa-disability-supplement',
      params: {
        message: 'Éligible au supplément handicap',
      },
    },
    priority: 5,
  });

  // Rule 6: Orphan supplement eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isOrphan',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'fa-orphan-supplement',
      params: {
        message: 'Éligible au supplément orphelin',
      },
    },
    priority: 5,
  });

  // Rule 7: Social supplement eligibility
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'annualIncome',
          operator: 'lessThan',
          value: 31000,
        },
        {
          fact: 'hasBIMStatus',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'fa-social-supplement',
      params: {
        message: 'Éligible au supplément social',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the Family Allowances rules engine
 */
const familyAllowancesEngineInstance = createFamilyAllowancesEngine();

/**
 * Calculate base amount based on region, age, and birth year
 */
function calculateBaseAmount(child: ChildInfo, region: BelgianRegion): number {
  switch (region) {
    case 'brussels':
      if (child.age <= 11) {
        return child.bornAfter2019
          ? REGIONAL_AMOUNTS_2024.brussels.age0to11.bornAfter2019
          : REGIONAL_AMOUNTS_2024.brussels.age0to11.bornBefore2019;
      } else if (child.age <= 17) {
        return child.bornAfter2019
          ? REGIONAL_AMOUNTS_2024.brussels.age12to17.bornAfter2019
          : REGIONAL_AMOUNTS_2024.brussels.age12to17.bornBefore2019;
      } else if (child.age <= 24) {
        return child.bornAfter2019
          ? REGIONAL_AMOUNTS_2024.brussels.age18to24.bornAfter2019
          : REGIONAL_AMOUNTS_2024.brussels.age18to24.bornBefore2019;
      }
      break;

    case 'wallonia':
      if (child.age <= 17) {
        return REGIONAL_AMOUNTS_2024.wallonia.age0to17.universal;
      } else if (child.age <= 24) {
        return REGIONAL_AMOUNTS_2024.wallonia.age18to24.universal;
      }
      break;

    case 'flanders':
      return REGIONAL_AMOUNTS_2024.flanders.universal.baseAmount;
  }

  return 0;
}

/**
 * Calculate supplements based on family situation
 */
function calculateSupplements(
  child: ChildInfo,
  family: FamilySituation
): { [key: string]: number } {
  const supplements: { [key: string]: number } = {};
  const regional = REGIONAL_AMOUNTS_2024[family.region];

  // Single parent supplement
  if (family.isSingleParent) {
    switch (family.region) {
      case 'brussels':
        const brusselsSupp = REGIONAL_AMOUNTS_2024.brussels.supplements;
        const baseAmount = calculateBaseAmount(child, family.region);
        supplements.singleParent = Math.min(
          baseAmount * brusselsSupp.singleParent.baseRate,
          brusselsSupp.singleParent.maxAmount
        );
        break;
      case 'wallonia':
        const walloniaSupp = REGIONAL_AMOUNTS_2024.wallonia.supplements;
        supplements.singleParent = family.annualIncome < 30000
          ? walloniaSupp.singleParent.incomeBasedMax
          : walloniaSupp.singleParent.baseAmount;
        break;
      case 'flanders':
        // Included in social supplement for Flanders
        break;
    }
  }

  // Disability supplement
  if (child.hasDisability && child.disabilityCategory && child.age <= MAX_AGE_DISABILITY_SUPPLEMENT) {
    switch (family.region) {
      case 'brussels':
        const brusselsDisability = REGIONAL_AMOUNTS_2024.brussels.supplements.disability;
        supplements.disability = child.disabilityCategory === 1 ? brusselsDisability.category1
          : child.disabilityCategory === 2 ? brusselsDisability.category2
          : brusselsDisability.category3;
        break;
      case 'wallonia':
        const walloniaDisability = REGIONAL_AMOUNTS_2024.wallonia.supplements.disability;
        supplements.disability = child.disabilityCategory === 1 ? walloniaDisability.category1
          : child.disabilityCategory === 2 ? walloniaDisability.category2
          : walloniaDisability.category3;
        break;
      case 'flanders':
        const flandersCategories = REGIONAL_AMOUNTS_2024.flanders.supplements.care;
        supplements.disability = child.disabilityCategory === 1 ? flandersCategories.category1
          : child.disabilityCategory === 2 ? flandersCategories.category2
          : flandersCategories.category3;
        break;
    }
  }

  // Orphan supplement
  if (child.isOrphan) {
    switch (family.region) {
      case 'brussels':
        const brusselsOrphan = REGIONAL_AMOUNTS_2024.brussels.supplements.orphan;
        supplements.orphan = child.orphanType === 'full'
          ? brusselsOrphan.fullOrphan
          : brusselsOrphan.halfOrphan;
        break;
      case 'wallonia':
        supplements.orphan = REGIONAL_AMOUNTS_2024.wallonia.supplements.orphan.amount;
        break;
      case 'flanders':
        supplements.orphan = REGIONAL_AMOUNTS_2024.flanders.supplements.orphan;
        break;
    }
  }

  // Social supplement (income-based)
  if (family.annualIncome < 31000 || family.hasBIMStatus) {
    switch (family.region) {
      case 'brussels':
        const brusselsSocial = REGIONAL_AMOUNTS_2024.brussels.supplements.social;
        if (family.annualIncome < brusselsSocial.incomeThreshold) {
          supplements.social = brusselsSocial.supplementAmount;
        }
        break;
      case 'wallonia':
        const walloniaTiers = REGIONAL_AMOUNTS_2024.wallonia.supplements.social;
        if (family.annualIncome < walloniaTiers.tier3.threshold) {
          supplements.social = walloniaTiers.tier3.amount;
        } else if (family.annualIncome < walloniaTiers.tier2.threshold) {
          supplements.social = walloniaTiers.tier2.amount;
        } else if (family.annualIncome < walloniaTiers.tier1.threshold) {
          supplements.social = walloniaTiers.tier1.amount;
        }
        break;
      case 'flanders':
        const flandersSocial = REGIONAL_AMOUNTS_2024.flanders.supplements.social;
        supplements.social = family.hasBIMStatus
          ? flandersSocial.increased
          : flandersSocial.standard;
        break;
    }
  }

  // Large family supplement (Wallonia)
  if (family.region === 'wallonia' && family.numberOfChildren >= 3) {
    const walloniaLargeFamily = REGIONAL_AMOUNTS_2024.wallonia.supplements.largeFamily;
    const childRank = family.children.indexOf(child) + 1;
    if (childRank >= 4) {
      supplements.largeFamily = walloniaLargeFamily.from4thChild;
    } else if (childRank === 3) {
      supplements.largeFamily = walloniaLargeFamily.from3rdChild;
    }
  }

  // Participation supplement (Flanders)
  if (family.region === 'flanders') {
    const flandersParticipation = REGIONAL_AMOUNTS_2024.flanders.supplements.participation;
    if (child.age >= 3 && child.age <= 5) {
      supplements.participation = flandersParticipation.age3to5;
    } else if (child.age >= 6 && child.age <= 11) {
      supplements.participation = flandersParticipation.age6to11;
    } else if (child.age >= 12 && child.age <= 17) {
      supplements.participation = flandersParticipation.age12to17;
    } else if (child.age >= 18 && child.isStudent) {
      supplements.participation = flandersParticipation.age18plus;
    }
  }

  return supplements;
}

/**
 * Calculate total family allowance amount for a child
 */
export function calculateFamilyAllowanceAmount(
  child: ChildInfo,
  family: FamilySituation
): {
  baseAmount: number;
  supplements: { [key: string]: number };
  totalAmount: number;
} {
  const baseAmount = calculateBaseAmount(child, family.region);
  const supplements = calculateSupplements(child, family);
  const totalSupplements = Object.values(supplements).reduce((sum, val) => sum + val, 0);
  const totalAmount = baseAmount + totalSupplements;

  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    supplements,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

/**
 * Check Family Allowances eligibility for a child
 */
export async function checkFamilyAllowancesEligibility(
  child: ChildInfo,
  family: FamilySituation,
  hasValidResidency: boolean = true
): Promise<EligibilityCheck> {
  const facts = {
    childAge: child.age,
    isStudent: child.isStudent || false,
    isApprentice: child.isApprentice || false,
    isJobSeeker: child.isJobSeeker || false,
    hasDisability: child.hasDisability || false,
    isOrphan: child.isOrphan || false,
    hasValidResidency,
    annualIncome: family.annualIncome,
    hasBIMStatus: family.hasBIMStatus || false,
  };

  try {
    const results = await familyAllowancesEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvent = results.events.find((e) => e.type === 'fa-ineligible');
    if (ineligibleEvent) {
      return {
        benefitType: 'family-allowance',
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    // Check for eligibility
    const eligibleUnconditional = results.events.find((e) => e.type === 'fa-eligible-unconditional');
    const eligibleConditional = results.events.find((e) => e.type === 'fa-eligible-conditional');

    if (eligibleUnconditional || eligibleConditional) {
      const calculation = calculateFamilyAllowanceAmount(child, family);
      const supplements = results.events
        .filter((e) => e.type.includes('supplement'))
        .map((e) => e.params?.message);

      // Determine responsible authority
      const authority = REGIONAL_AMOUNTS_2024[family.region].authority;
      const officialUrl = REGIONAL_AMOUNTS_2024[family.region].officialUrl;

      const supplementsList = Object.entries(supplements)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ');

      return {
        benefitType: 'family-allowance',
        isEligible: true,
        calculatedAmount: calculation.totalAmount,
        breakdown: {
          baseAmount: calculation.baseAmount,
          supplements: calculation.supplements,
          total: calculation.totalAmount,
        },
        notes: [
          eligibleConditional
            ? 'Conditions: Maintenir statut étudiant/apprenti/demandeur d\'emploi'
            : 'Conditions: Aucune condition particulière jusqu\'à 18 ans',
          `Autorité compétente: ${authority}`,
          `Site officiel: ${officialUrl}`,
          supplementsList ? `Suppléments éligibles: ${supplementsList}` : undefined
        ].filter(Boolean) as string[],
      };
    }

    return {
      benefitType: 'family-allowance',
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Family Allowances eligibility: ${error}`);
  }
}

/**
 * Calculate total family allowances for all children
 */
export function calculateTotalFamilyAllowances(
  family: FamilySituation
): {
  perChildBreakdown: Array<{
    child: ChildInfo;
    amount: ReturnType<typeof calculateFamilyAllowanceAmount>;
  }>;
  totalMonthlyAmount: number;
  totalAnnualAmount: number;
} {
  const perChildBreakdown = family.children.map((child) => ({
    child,
    amount: calculateFamilyAllowanceAmount(child, family),
  }));

  const totalMonthlyAmount = perChildBreakdown.reduce(
    (sum, item) => sum + item.amount.totalAmount,
    0
  );

  return {
    perChildBreakdown,
    totalMonthlyAmount: Math.round(totalMonthlyAmount * 100) / 100,
    totalAnnualAmount: Math.round(totalMonthlyAmount * 12 * 100) / 100,
  };
}

/**
 * Export des règles en format JSON pour transparence
 * Avec références juridiques complètes
 */
export const FAMILY_ALLOWANCES_RULES_JSON = {
  legalFramework: {
    constitutional: {
      article: 'Article 23',
      content: 'Droit aux allocations familiales garanti par la Constitution',
    },
    regionalisation: {
      law: 'Loi spéciale du 6 janvier 2014',
      content: 'Sixième Réforme de l\'État - transfert aux régions',
      effectiveDate: '2020-01-01',
    },
    regionalLegislation: {
      brussels: {
        title: 'Ordonnance du 25 avril 2019',
        authority: 'Famiris',
        url: 'https://famiris.brussels/',
      },
      wallonia: {
        title: 'Décret du 8 février 2018',
        authority: 'AVIQ',
        url: 'https://www.aviq.be/',
      },
      flanders: {
        title: 'Décret du 27 avril 2018',
        authority: 'Opgroeien',
        url: 'https://www.groeipakket.be/',
      },
    },
  },
  eligibilityCriteria: {
    age: {
      unconditional: `${MIN_AGE_CHILD}-${MAX_AGE_CHILD_UNCONDITIONAL} ans`,
      conditional: `${MAX_AGE_CHILD_UNCONDITIONAL}-${MAX_AGE_CHILD_CONDITIONAL} ans (étudiant/apprenti/demandeur d'emploi)`,
      disabilitySupplement: `jusqu'à ${MAX_AGE_DISABILITY_SUPPLEMENT} ans`,
    },
    residency: {
      requirement: 'Domicile légal en Belgique ou titre de séjour valide',
      determinant: 'Domicile de l\'enfant détermine la région compétente',
    },
    conditions18to25: [
      'Étudiant inscrit dans l\'enseignement',
      'Apprenti sous contrat',
      'Demandeur d\'emploi inscrit (max 360 jours)',
      'Formation en alternance',
    ],
  },
  regionalAmounts2024: REGIONAL_AMOUNTS_2024,
  supplements: {
    types: [
      'Famille monoparentale',
      'Handicap (selon catégorie)',
      'Orphelin (demi ou complet)',
      'Social (selon revenus)',
      'Famille nombreuse (Wallonie)',
      'Participation scolaire (Flandre)',
    ],
    cumulative: true,
    note: 'Les suppléments peuvent se cumuler selon la situation',
  },
  paymentDetails: {
    frequency: 'Mensuel',
    paymentDay: 'Généralement le 8 du mois',
    method: 'Virement bancaire',
  },
  procedures: {
    newBirth: {
      automatic: 'Inscription automatique via déclaration de naissance',
      documents: ['Acte de naissance', 'Composition de ménage'],
    },
    regionChange: {
      required: 'Informer la caisse actuelle et s\'inscrire dans la nouvelle région',
      continuity: 'Pas d\'interruption de paiement si démarches correctes',
    },
    annualReview: {
      income: 'Révision annuelle pour suppléments sociaux',
      studentStatus: 'Vérification du statut étudiant chaque année académique',
    },
  },
};