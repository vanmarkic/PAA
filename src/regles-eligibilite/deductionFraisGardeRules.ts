/**
 * Business Rules for Déduction des Frais de Garde d'Enfants
 *
 * Implements eligibility and calculation rules for childcare expense deduction.
 *
 * BASE JURIDIQUE:
 * - Code des Impôts sur les Revenus 1992 (CIR 92)
 * - Article 104, 9° et Article 113 CIR 92
 * - SPF Finances - Circulaire 2024/C/47 du 15 mai 2024
 * - https://finances.belgium.be/fr/particuliers/famille/garde_enfants
 * - Autorité: Service Public Fédéral Finances
 * - Dernière modification: Exercice d'imposition 2025 (revenus 2024)
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

// Constants for tax year 2024
const CHILDCARE_CONSTANTS_2024 = {
  dailyCeilingPerChild: 16.40, // EUR per day per child
  standardReductionRate: 0.45, // 45% tax reduction
  increasedReductionRate: 0.75, // 75% for single parents with low income
  lowIncomeThreshold: 18363, // EUR annual income threshold for increased rate
  standardAgeLimit: 14, // years
  disabledChildAgeLimit: 21, // years for children with disability
  minimumDisabilityRate: 0.66, // 66% disability for extended age limit
  taxDeclarationCode: '1384-71',
  maxDaysPerYear: 365,
  incompatibleWithChildUnder3Benefit: true,
  childUnder3BenefitAmount: 680, // EUR standard benefit for child < 3 years
};

// Regional parameters (federal deduction applies uniformly)
const REGIONAL_PARAMETERS = {
  wallonia: {
    rate: 0.45,
    dailyCeiling: 16.40,
  },
  flanders: {
    rate: 0.45,
    dailyCeiling: 16.40,
  },
  brussels: {
    rate: 0.45,
    dailyCeiling: 16.40,
  },
};

export interface ChildcareDeductionUser {
  familySituation: 'single' | 'married' | 'cohabitant' | 'divorced' | 'widowed';
  annualIncome: number;
  hasChildrenInCare: boolean;
  children: Array<{
    age: number;
    hasDisability: boolean;
    disabilityRate?: number;
    daysInChildcare: number;
    dailyCost: number;
    childcareType: 'approved' | 'non-approved' | 'school' | 'camp' | 'private';
    hasChildcareAttestation: boolean;
  }>;
  region: 'wallonia' | 'flanders' | 'brussels';
  sharedCustody?: boolean;
  custodyPercentage?: number;
}

export interface ChildcareDeductionResult {
  isEligible: boolean;
  totalDeductibleAmount?: number;
  taxReduction?: number;
  reductionRate?: number;
  declarationCode?: string;
  childrenDetails?: Array<{
    age: number;
    deductibleAmount: number;
    actualCost: number;
    daysInChildcare: number;
    reason?: string;
  }>;
  incompatibilityWarning?: string;
  reason?: string;
  requiredDocuments?: string[];
}

/**
 * Create the childcare deduction rules engine
 */
function createChildcareDeductionEngine(): Engine {
  const engine = new Engine();

  // Rule 1: At least one eligible child
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasNoChildren',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'childcare-ineligible',
      params: {
        reason: 'Aucun enfant éligible pour la déduction',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: All children exceed age limit
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'allChildrenTooOld',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'childcare-ineligible',
      params: {
        reason: `Tous les enfants dépassent l'âge limite (${CHILDCARE_CONSTANTS_2024.standardAgeLimit} ans ou ${CHILDCARE_CONSTANTS_2024.disabledChildAgeLimit} ans si handicapé)`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: No approved childcare
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasOnlyNonApprovedChildcare',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'childcare-ineligible',
      params: {
        reason: 'Organisme de garde non agréé - aucune déduction possible',
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 4: Missing tax attestation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'missingAttestations',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'childcare-ineligible',
      params: {
        reason: 'Attestation fiscale obligatoire manquante',
        priority: 7,
      },
    },
    priority: 7,
  });

  // Rule 5: Single parent with low income - increased rate
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'familySituation',
          operator: 'in',
          value: ['single', 'divorced', 'widowed'],
        },
        {
          fact: 'annualIncome',
          operator: 'lessThan',
          value: CHILDCARE_CONSTANTS_2024.lowIncomeThreshold,
        },
        {
          fact: 'hasEligibleChildren',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'childcare-eligible-increased-rate',
      params: {
        message: 'Éligible avec taux majoré de 75% (parent isolé revenus modestes)',
        rate: CHILDCARE_CONSTANTS_2024.increasedReductionRate,
      },
    },
    priority: 5,
  });

  // Rule 6: Standard eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasEligibleChildren',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasApprovedChildcare',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasAttestations',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'childcare-eligible-standard',
      params: {
        message: 'Éligible pour déduction frais de garde',
        rate: CHILDCARE_CONSTANTS_2024.standardReductionRate,
      },
    },
    priority: 4,
  });

  return engine;
}

/**
 * Singleton instance of the childcare deduction rules engine
 */
const childcareEngineInstance = createChildcareDeductionEngine();

/**
 * Calculate deductible amount for a child
 */
function calculateChildDeductibleAmount(child: ChildcareDeductionUser['children'][0]): {
  deductibleAmount: number;
  actualCost: number;
  reason?: string;
} {
  // Check if child is eligible by age
  const ageLimit = child.hasDisability && (child.disabilityRate || 0) >= CHILDCARE_CONSTANTS_2024.minimumDisabilityRate
    ? CHILDCARE_CONSTANTS_2024.disabledChildAgeLimit
    : CHILDCARE_CONSTANTS_2024.standardAgeLimit;

  if (child.age >= ageLimit) {
    return {
      deductibleAmount: 0,
      actualCost: child.dailyCost * child.daysInChildcare,
      reason: `Enfant de ${child.age} ans dépasse l'âge limite de ${ageLimit} ans`,
    };
  }

  // Check if childcare is approved
  if (child.childcareType === 'non-approved' || child.childcareType === 'private') {
    return {
      deductibleAmount: 0,
      actualCost: child.dailyCost * child.daysInChildcare,
      reason: 'Organisme de garde non agréé',
    };
  }

  // Check for attestation
  if (!child.hasChildcareAttestation) {
    return {
      deductibleAmount: 0,
      actualCost: child.dailyCost * child.daysInChildcare,
      reason: 'Attestation fiscale manquante',
    };
  }

  // Calculate deductible amount with daily ceiling
  const actualCost = child.dailyCost * child.daysInChildcare;
  const maxDeductible = CHILDCARE_CONSTANTS_2024.dailyCeilingPerChild * child.daysInChildcare;
  const deductibleAmount = Math.min(actualCost, maxDeductible);

  return {
    deductibleAmount,
    actualCost,
  };
}

/**
 * Check if incompatible with child under 3 benefit
 */
function checkChildUnder3Incompatibility(children: ChildcareDeductionUser['children']): {
  hasConflict: boolean;
  bestOption?: 'childcare' | 'under3benefit';
  childcareReduction?: number;
  under3BenefitAmount?: number;
} {
  const hasChildUnder3 = children.some(child => child.age < 3);

  if (!hasChildUnder3) {
    return { hasConflict: false };
  }

  // Calculate potential childcare deduction for children under 3
  const under3ChildcareAmount = children
    .filter(child => child.age < 3)
    .reduce((sum, child) => {
      const result = calculateChildDeductibleAmount(child);
      return sum + result.deductibleAmount;
    }, 0);

  const childcareReduction = under3ChildcareAmount * CHILDCARE_CONSTANTS_2024.standardReductionRate;
  const under3BenefitAmount = CHILDCARE_CONSTANTS_2024.childUnder3BenefitAmount;

  return {
    hasConflict: true,
    bestOption: childcareReduction > under3BenefitAmount ? 'childcare' : 'under3benefit',
    childcareReduction,
    under3BenefitAmount,
  };
}

/**
 * Calculate childcare deduction amount
 */
export function calculateChildcareDeductionAmount(user: ChildcareDeductionUser): ChildcareDeductionResult {
  if (!user.children || user.children.length === 0) {
    return {
      isEligible: false,
      reason: 'Aucun enfant déclaré',
    };
  }

  // Calculate deductible amount for each child
  const childrenDetails = user.children.map(child => ({
    age: child.age,
    ...calculateChildDeductibleAmount(child),
    daysInChildcare: child.daysInChildcare,
  }));

  // Calculate total deductible amount
  const totalDeductibleAmount = childrenDetails.reduce((sum, child) => sum + child.deductibleAmount, 0);

  if (totalDeductibleAmount === 0) {
    return {
      isEligible: false,
      reason: 'Aucun montant déductible',
      childrenDetails,
    };
  }

  // Determine reduction rate
  const isSingleParentLowIncome =
    ['single', 'divorced', 'widowed'].includes(user.familySituation) &&
    user.annualIncome < CHILDCARE_CONSTANTS_2024.lowIncomeThreshold;

  const reductionRate = isSingleParentLowIncome
    ? CHILDCARE_CONSTANTS_2024.increasedReductionRate
    : CHILDCARE_CONSTANTS_2024.standardReductionRate;

  // Calculate tax reduction
  const taxReduction = Math.round(totalDeductibleAmount * reductionRate * 100) / 100;

  // Check for incompatibility with child under 3 benefit
  const under3Check = checkChildUnder3Incompatibility(user.children);

  const result: ChildcareDeductionResult = {
    isEligible: true,
    totalDeductibleAmount,
    taxReduction,
    reductionRate,
    declarationCode: CHILDCARE_CONSTANTS_2024.taxDeclarationCode,
    childrenDetails,
    requiredDocuments: [
      'Attestation fiscale de l\'organisme agréé',
      'Numéro national de l\'enfant',
      'Numéro d\'agrément de l\'organisme',
      'Montant total des frais payés en 2024',
      'Nombre de jours de garde effectifs',
      'Preuves de paiement (à conserver 7 ans)',
    ],
  };

  if (under3Check.hasConflict) {
    result.incompatibilityWarning = `Attention: Vous avez un enfant de moins de 3 ans. Vous devez choisir entre la déduction frais de garde (${under3Check.childcareReduction}€) et la majoration enfant < 3 ans (${under3Check.under3BenefitAmount}€). Recommandation: ${under3Check.bestOption === 'childcare' ? 'déduction frais de garde' : 'majoration enfant < 3 ans'}`;
  }

  // Apply shared custody if applicable
  if (user.sharedCustody && user.custodyPercentage && result.totalDeductibleAmount && result.taxReduction) {
    result.totalDeductibleAmount = Math.round(result.totalDeductibleAmount * (user.custodyPercentage / 100) * 100) / 100;
    result.taxReduction = Math.round(result.taxReduction * (user.custodyPercentage / 100) * 100) / 100;
  }

  return result;
}

/**
 * Check childcare deduction eligibility
 */
export async function checkChildcareDeductionEligibility(user: ChildcareDeductionUser): Promise<EligibilityCheck> {
  // Prepare facts for the rules engine
  const hasEligibleChildren = user.children.some(child => {
    const ageLimit = child.hasDisability && (child.disabilityRate || 0) >= CHILDCARE_CONSTANTS_2024.minimumDisabilityRate
      ? CHILDCARE_CONSTANTS_2024.disabledChildAgeLimit
      : CHILDCARE_CONSTANTS_2024.standardAgeLimit;
    return child.age < ageLimit;
  });

  const hasApprovedChildcare = user.children.some(child =>
    child.childcareType !== 'non-approved' && child.childcareType !== 'private'
  );

  const hasAttestations = user.children.every(child =>
    child.childcareType === 'non-approved' ||
    child.childcareType === 'private' ||
    child.hasChildcareAttestation
  );

  const facts = {
    hasNoChildren: !user.children || user.children.length === 0,
    allChildrenTooOld: !hasEligibleChildren,
    hasOnlyNonApprovedChildcare: user.children.length > 0 && !hasApprovedChildcare,
    missingAttestations: !hasAttestations,
    familySituation: user.familySituation,
    annualIncome: user.annualIncome,
    hasEligibleChildren,
    hasApprovedChildcare,
    hasAttestations,
  };

  try {
    const results = await childcareEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvent = results.events.find(e => e.type === 'childcare-ineligible');
    if (ineligibleEvent) {
      return {
        benefitType: 'childcare-deduction',
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    // Check for eligibility (standard or increased rate)
    const eligibleEvent = results.events.find(e =>
      e.type === 'childcare-eligible-standard' ||
      e.type === 'childcare-eligible-increased-rate'
    );

    if (eligibleEvent) {
      const calculation = calculateChildcareDeductionAmount(user);
      return {
        benefitType: 'childcare-deduction',
        isEligible: calculation.isEligible,
        calculatedAmount: calculation.taxReduction,
        optimizationSuggestion: calculation.incompatibilityWarning,
      };
    }

    return {
      benefitType: 'childcare-deduction',
      isEligible: false,
      reason: 'Conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking childcare deduction eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 * With authentic legal references
 */
export const CHILDCARE_DEDUCTION_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: 'Code des Impôts sur les Revenus 1992 (CIR 92)',
      articles: ['Article 104, 9°', 'Article 113'],
      authority: 'Service Public Fédéral Finances',
      officialUrl: 'https://finances.belgium.be/fr/particuliers/famille/garde_enfants',
      lastAmended: '2024',
    },
    circulars: [
      {
        reference: 'Circulaire 2024/C/47',
        date: '2024-05-15',
        subject: 'Frais de garde d\'enfants - Exercice d\'imposition 2025',
      },
    ],
    notes: [
      'Déduction fédérale applicable uniformément dans toutes les régions',
      'Les attestations doivent être délivrées par des organismes agréés',
      'Conservation obligatoire des preuves pendant 7 ans',
    ],
  },
  parameters2024: {
    dailyCeilingPerChild: {
      amount: CHILDCARE_CONSTANTS_2024.dailyCeilingPerChild,
      currency: 'EUR',
      description: 'Plafond journalier par enfant',
    },
    reductionRates: {
      standard: {
        rate: CHILDCARE_CONSTANTS_2024.standardReductionRate,
        percentage: '45%',
        description: 'Taux de réduction standard',
      },
      increased: {
        rate: CHILDCARE_CONSTANTS_2024.increasedReductionRate,
        percentage: '75%',
        description: 'Taux majoré pour parent isolé à revenus modestes',
        incomeThreshold: CHILDCARE_CONSTANTS_2024.lowIncomeThreshold,
      },
    },
    ageLimits: {
      standard: {
        age: CHILDCARE_CONSTANTS_2024.standardAgeLimit,
        description: 'Âge limite standard',
      },
      disabled: {
        age: CHILDCARE_CONSTANTS_2024.disabledChildAgeLimit,
        description: 'Âge limite enfant handicapé (min 66%)',
        minimumDisabilityRate: CHILDCARE_CONSTANTS_2024.minimumDisabilityRate,
      },
    },
    declarationCode: CHILDCARE_CONSTANTS_2024.taxDeclarationCode,
  },
  rules: [
    {
      id: 'childcare-age-eligibility',
      description: `Enfant de moins de ${CHILDCARE_CONSTANTS_2024.standardAgeLimit} ans (ou ${CHILDCARE_CONSTANTS_2024.disabledChildAgeLimit} ans si handicapé)`,
      condition: 'age < 14 OR (age < 21 AND disability >= 66%)',
      priority: 10,
      legalBasis: 'Article 113 CIR 92',
    },
    {
      id: 'childcare-approved-organism',
      description: 'Organisme de garde agréé obligatoire',
      condition: 'childcareType IN [approved, school, camp]',
      priority: 9,
      legalBasis: 'Article 104, 9° CIR 92',
    },
    {
      id: 'childcare-attestation-required',
      description: 'Attestation fiscale obligatoire',
      condition: 'hasChildcareAttestation == true',
      priority: 8,
      legalBasis: 'Circulaire 2024/C/47',
    },
    {
      id: 'childcare-daily-ceiling',
      description: `Plafond journalier de ${CHILDCARE_CONSTANTS_2024.dailyCeilingPerChild}€ par enfant`,
      calculation: 'MIN(actualCost, 16.40 × days)',
      legalBasis: 'Article 113 CIR 92',
    },
    {
      id: 'childcare-incompatibility-under3',
      description: 'Choix entre déduction et majoration enfant < 3 ans',
      condition: 'Cannot cumulate both benefits for same child',
      legalBasis: 'Article 132bis CIR 92',
    },
  ],
  regionalApplication: {
    uniform: true,
    description: 'Déduction fédérale applicable uniformément dans toutes les régions',
    regions: REGIONAL_PARAMETERS,
  },
  requiredDocuments: [
    'Attestation fiscale de l\'organisme agréé (modèle 281.86)',
    'Numéro national de l\'enfant',
    'Numéro d\'agrément ONE, K&G ou équivalent',
    'Montant total et nombre de jours de garde',
    'Preuves de paiement',
    'Attestation de handicap le cas échéant',
  ],
  calculation: {
    formula: 'Réduction = MIN(frais réels, plafond journalier × jours) × taux',
    examples: [
      {
        scenario: 'Parent salarié, 1 enfant, 200 jours à 15€/jour',
        calculation: '200 × 15€ = 3000€ déductible, réduction = 3000€ × 45% = 1350€',
      },
      {
        scenario: 'Parent isolé revenus < 18363€, 220 jours à 10€/jour',
        calculation: '220 × 10€ = 2200€ déductible, réduction = 2200€ × 75% = 1650€',
      },
      {
        scenario: 'Frais dépassant plafond: 100 jours à 25€/jour',
        calculation: 'Plafonné à 100 × 16.40€ = 1640€, réduction = 1640€ × 45% = 738€',
      },
    ],
  },
  lastUpdate: '2024-05-15',
  source: 'SPF Finances - Service des Décisions Anticipées',
};