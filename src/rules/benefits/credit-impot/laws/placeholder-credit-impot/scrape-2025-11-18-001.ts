/**
 * Business Rules for Crédit d'Impôt pour Bas et Moyens Revenus
 *
 * Implements eligibility and calculation rules for low and medium income tax credit.
 *
 * BASE JURIDIQUE:
 * - Code des Impôts sur les Revenus 1992 (CIR 92) - Articles 134-145
 * - Article 289ter CIR 92 (crédit d'impôt remboursable)
 * - SPF Finances - Circulaire 2024/C/38 du 10 avril 2024
 * - https://finances.belgium.be/fr/particuliers/avantages_fiscaux/credit_impot
 * - Autorité: Service Public Fédéral Finances
 * - Dernière modification: Exercice d'imposition 2025 (revenus 2024)
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../../../../../domain/types';

// Constants for tax year 2024
const TAX_CREDIT_CONSTANTS_2024 = {
  // Basic tax credit amounts
  creditAmounts: {
    single: 320, // EUR for single taxpayers
    couple: 640, // EUR for married/cohabiting couples
    perChild: 460, // EUR per dependent child
    singleParentBonus: 460, // EUR additional for single parents
  },

  // Income thresholds for full credit
  lowIncomeThresholds: {
    single: 7070, // EUR below this = full credit
    couple: 14140, // EUR below this = full credit
  },

  // Income thresholds where credit phases out
  mediumIncomeThresholds: {
    single: 15820, // EUR above this = no credit
    couple: 21070, // EUR above this = no credit
  },

  // Work bonus (bonus à l'emploi)
  workBonus: {
    maxAmount: 760, // EUR maximum annual bonus
    monthlyMax: 63.33, // EUR maximum monthly
    salaryThreshold: 2500, // EUR gross monthly salary threshold
    reductionRate: 0.1775, // reduction rate above threshold
  },

  // Pension supplement
  pensionSupplement: {
    ageThreshold: 65, // years
    maxAmount: 320, // EUR additional credit
  },

  // Credit is refundable
  isRefundable: true,

  // Tax declaration - automatic calculation
  declarationCode: 'Automatic',
};

export interface TaxCreditUser {
  situation: 'single' | 'married' | 'cohabitant' | 'divorced' | 'widowed';
  annualIncome: number;
  partnerIncome?: number;
  numberOfChildren: number;
  hasDependentChildren: boolean;
  isSingleParent: boolean;
  employmentStatus: 'employed' | 'self-employed' | 'pensioner' | 'unemployed' | 'mixed';
  grossMonthlySalary?: number;
  age: number;
  partnerAge?: number;
  paidTaxes: number; // précompte professionnel or versements anticipés
  calculatedTax: number; // impôt calculé
  hasWorkBonus?: boolean;
  otherDeductions?: {
    pensionSaving?: number;
    donations?: number;
    childcareExpenses?: number;
  };
}

export interface TaxCreditResult {
  isEligible: boolean;
  basicCredit?: number;
  childrenCredit?: number;
  singleParentBonus?: number;
  workBonus?: number;
  totalCredit?: number;
  finalTax?: number;
  refundAmount?: number;
  explanation?: string;
  incomePhaseOut?: {
    percentage: number;
    reduction: number;
  };
  requiredDocuments?: string[];
}

/**
 * Create the tax credit rules engine
 */
function createTaxCreditEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Income too high for any credit
  engine.addRule({
    conditions: {
      any: [
        {
          all: [
            {
              fact: 'situation',
              operator: 'in',
              value: ['single', 'divorced', 'widowed'],
            },
            {
              fact: 'totalIncome',
              operator: 'greaterThan',
              value: TAX_CREDIT_CONSTANTS_2024.mediumIncomeThresholds.single,
            },
          ],
        },
        {
          all: [
            {
              fact: 'situation',
              operator: 'in',
              value: ['married', 'cohabitant'],
            },
            {
              fact: 'totalIncome',
              operator: 'greaterThan',
              value: TAX_CREDIT_CONSTANTS_2024.mediumIncomeThresholds.couple,
            },
          ],
        },
      ],
    },
    event: {
      type: 'taxcredit-ineligible',
      params: {
        reason: 'Revenus trop élevés pour le crédit d\'impôt',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Full credit for low income
  engine.addRule({
    conditions: {
      any: [
        {
          all: [
            {
              fact: 'situation',
              operator: 'in',
              value: ['single', 'divorced', 'widowed'],
            },
            {
              fact: 'totalIncome',
              operator: 'lessThanInclusive',
              value: TAX_CREDIT_CONSTANTS_2024.lowIncomeThresholds.single,
            },
          ],
        },
        {
          all: [
            {
              fact: 'situation',
              operator: 'in',
              value: ['married', 'cohabitant'],
            },
            {
              fact: 'totalIncome',
              operator: 'lessThanInclusive',
              value: TAX_CREDIT_CONSTANTS_2024.lowIncomeThresholds.couple,
            },
          ],
        },
      ],
    },
    event: {
      type: 'taxcredit-full',
      params: {
        message: 'Éligible au crédit d\'impôt complet',
        reduction: 1.0,
      },
    },
    priority: 5,
  });

  // Rule 3: Partial credit for medium income
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'incomeInPhaseOutRange',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'taxcredit-partial',
      params: {
        message: 'Éligible au crédit d\'impôt partiel (dégressif)',
      },
    },
    priority: 4,
  });

  // Rule 4: Work bonus eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'employed',
        },
        {
          fact: 'grossMonthlySalary',
          operator: 'lessThan',
          value: TAX_CREDIT_CONSTANTS_2024.workBonus.salaryThreshold,
        },
      ],
    },
    event: {
      type: 'workbonus-eligible',
      params: {
        message: 'Éligible au bonus à l\'emploi fiscal',
      },
    },
    priority: 3,
  });

  // Rule 5: Single parent bonus
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isSingleParent',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasDependentChildren',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'singleparent-bonus',
      params: {
        message: 'Éligible au bonus parent isolé',
        amount: TAX_CREDIT_CONSTANTS_2024.creditAmounts.singleParentBonus,
      },
    },
    priority: 3,
  });

  return engine;
}

/**
 * Singleton instance
 */
const taxCreditEngineInstance = createTaxCreditEngine();

/**
 * Calculate phase-out reduction for medium income
 */
function calculatePhaseOut(income: number, situation: 'single' | 'couple'): {
  percentage: number;
  reduction: number;
} {
  const lowThreshold = situation === 'single' ?
    TAX_CREDIT_CONSTANTS_2024.lowIncomeThresholds.single :
    TAX_CREDIT_CONSTANTS_2024.lowIncomeThresholds.couple;

  const highThreshold = situation === 'single' ?
    TAX_CREDIT_CONSTANTS_2024.mediumIncomeThresholds.single :
    TAX_CREDIT_CONSTANTS_2024.mediumIncomeThresholds.couple;

  if (income <= lowThreshold) {
    return { percentage: 100, reduction: 0 };
  }

  if (income >= highThreshold) {
    return { percentage: 0, reduction: 1 };
  }

  // Linear phase-out between thresholds
  const range = highThreshold - lowThreshold;
  const excess = income - lowThreshold;
  const reductionFactor = excess / range;

  return {
    percentage: Math.round((1 - reductionFactor) * 100),
    reduction: reductionFactor,
  };
}

/**
 * Calculate work bonus amount
 */
function calculateWorkBonus(monthlySalary: number): number {
  if (monthlySalary >= TAX_CREDIT_CONSTANTS_2024.workBonus.salaryThreshold) {
    return 0;
  }

  const referenceAmount = 1945; // EUR reference salary for calculation
  if (monthlySalary <= referenceAmount) {
    return TAX_CREDIT_CONSTANTS_2024.workBonus.monthlyMax * 12;
  }

  // Degressive calculation
  const excess = monthlySalary - referenceAmount;
  const reduction = excess * TAX_CREDIT_CONSTANTS_2024.workBonus.reductionRate;
  const monthlyBonus = Math.max(0, TAX_CREDIT_CONSTANTS_2024.workBonus.monthlyMax - reduction);

  return Math.round(monthlyBonus * 12 * 100) / 100;
}

/**
 * Calculate total tax credit
 */
export function calculateTaxCredit(user: TaxCreditUser): TaxCreditResult {
  const isCouple = ['married', 'cohabitant'].includes(user.situation);
  const totalIncome = user.annualIncome + (user.partnerIncome || 0);

  // Check basic eligibility
  const maxThreshold = isCouple ?
    TAX_CREDIT_CONSTANTS_2024.mediumIncomeThresholds.couple :
    TAX_CREDIT_CONSTANTS_2024.mediumIncomeThresholds.single;

  if (totalIncome > maxThreshold) {
    return {
      isEligible: false,
      explanation: `Revenus (${totalIncome}€) supérieurs au plafond (${maxThreshold}€)`,
    };
  }

  // Calculate basic credit
  const baseCredit = isCouple ?
    TAX_CREDIT_CONSTANTS_2024.creditAmounts.couple :
    TAX_CREDIT_CONSTANTS_2024.creditAmounts.single;

  // Calculate phase-out
  const phaseOut = calculatePhaseOut(totalIncome, isCouple ? 'couple' : 'single');
  const adjustedBaseCredit = Math.round(baseCredit * (1 - phaseOut.reduction));

  // Children credit
  const childrenCredit = user.numberOfChildren * TAX_CREDIT_CONSTANTS_2024.creditAmounts.perChild;

  // Single parent bonus
  const singleParentBonus = user.isSingleParent && user.hasDependentChildren ?
    TAX_CREDIT_CONSTANTS_2024.creditAmounts.singleParentBonus : 0;

  // Work bonus
  const workBonus = user.employmentStatus === 'employed' && user.grossMonthlySalary ?
    calculateWorkBonus(user.grossMonthlySalary) : 0;

  // Total credit
  const totalCredit = adjustedBaseCredit + childrenCredit + singleParentBonus + workBonus;

  // Calculate final tax and refund
  const finalTax = Math.max(0, user.calculatedTax - totalCredit);
  const creditExcess = totalCredit - user.calculatedTax;
  const refundAmount = creditExcess > 0 ?
    user.paidTaxes + creditExcess : // Refundable credit
    user.paidTaxes - finalTax;

  return {
    isEligible: true,
    basicCredit: adjustedBaseCredit,
    childrenCredit,
    singleParentBonus,
    workBonus,
    totalCredit,
    finalTax,
    refundAmount: Math.max(0, refundAmount),
    incomePhaseOut: phaseOut.reduction > 0 ? phaseOut : undefined,
    explanation: generateExplanation(user, totalCredit, phaseOut),
    requiredDocuments: [
      'Déclaration fiscale complète',
      'Fiches de salaire ou pension',
      'Composition de ménage',
      'Attestation enfants à charge',
      'Preuves des précomptes/versements anticipés',
    ],
  };
}

/**
 * Generate explanation text
 */
function generateExplanation(user: TaxCreditUser, totalCredit: number, phaseOut: any): string {
  const parts = [];

  if (phaseOut.reduction === 0) {
    parts.push('Vous bénéficiez du crédit d\'impôt complet');
  } else if (phaseOut.reduction < 1) {
    parts.push(`Crédit d'impôt réduit à ${phaseOut.percentage}% (revenus moyens)`);
  }

  if (user.numberOfChildren > 0) {
    parts.push(`${user.numberOfChildren} enfant(s) à charge`);
  }

  if (user.isSingleParent) {
    parts.push('Majoration parent isolé');
  }

  if (TAX_CREDIT_CONSTANTS_2024.isRefundable && totalCredit > user.calculatedTax) {
    parts.push('Crédit remboursable (excédent remboursé)');
  }

  return parts.join(' - ');
}

/**
 * Check tax credit eligibility
 */
export async function checkTaxCreditEligibility(user: TaxCreditUser): Promise<EligibilityCheck> {
  const totalIncome = user.annualIncome + (user.partnerIncome || 0);
  const isCouple = ['married', 'cohabitant'].includes(user.situation);

  // Check if income is in phase-out range
  const lowThreshold = isCouple ?
    TAX_CREDIT_CONSTANTS_2024.lowIncomeThresholds.couple :
    TAX_CREDIT_CONSTANTS_2024.lowIncomeThresholds.single;

  const highThreshold = isCouple ?
    TAX_CREDIT_CONSTANTS_2024.mediumIncomeThresholds.couple :
    TAX_CREDIT_CONSTANTS_2024.mediumIncomeThresholds.single;

  const facts = {
    situation: user.situation,
    totalIncome,
    employmentStatus: user.employmentStatus,
    grossMonthlySalary: user.grossMonthlySalary || 0,
    isSingleParent: user.isSingleParent,
    hasDependentChildren: user.hasDependentChildren,
    incomeInPhaseOutRange: totalIncome > lowThreshold && totalIncome < highThreshold,
  };

  try {
    const results = await taxCreditEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvent = results.events.find(e => e.type === 'taxcredit-ineligible');
    if (ineligibleEvent) {
      return {
        benefitType: 'tax-credit',
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    // Calculate credit
    const calculation = calculateTaxCredit(user);

    return {
      benefitType: 'tax-credit',
      isEligible: calculation.isEligible,
      calculatedAmount: calculation.totalCredit,
      optimizationSuggestion: calculation.explanation,
    };
  } catch (error) {
    throw new Error(`Error checking tax credit eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format
 */
export const TAX_CREDIT_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: 'Code des Impôts sur les Revenus 1992 (CIR 92)',
      articles: ['Articles 134-145', 'Article 289ter'],
      authority: 'Service Public Fédéral Finances',
      officialUrl: 'https://finances.belgium.be/fr/particuliers/avantages_fiscaux/credit_impot',
      lastAmended: '2024',
    },
    circulars: [
      {
        reference: 'Circulaire 2024/C/38',
        date: '2024-04-10',
        subject: 'Crédit d\'impôt - Exercice d\'imposition 2025',
      },
    ],
    notes: [
      'Crédit d\'impôt remboursable depuis 2019',
      'Calcul automatique par l\'administration fiscale',
      'Applicable uniformément dans toutes les régions',
    ],
  },
  parameters2024: TAX_CREDIT_CONSTANTS_2024,
  rules: [
    {
      id: 'taxcredit-income-threshold',
      description: 'Plafonds de revenus pour éligibilité',
      thresholds: {
        single: {
          fullCredit: '≤ 7070€',
          partialCredit: '7070€ - 15820€',
          noCredit: '> 15820€',
        },
        couple: {
          fullCredit: '≤ 14140€',
          partialCredit: '14140€ - 21070€',
          noCredit: '> 21070€',
        },
      },
    },
    {
      id: 'taxcredit-amounts',
      description: 'Montants du crédit d\'impôt',
      amounts: {
        basicSingle: '320€',
        basicCouple: '640€',
        perChild: '460€/enfant',
        singleParentBonus: '460€',
      },
    },
    {
      id: 'taxcredit-work-bonus',
      description: 'Bonus à l\'emploi fiscal',
      parameters: {
        maxAnnual: '760€',
        salaryThreshold: '< 2500€ brut/mois',
        calculation: 'Dégressif entre 1945€ et 2500€',
      },
    },
    {
      id: 'taxcredit-refundable',
      description: 'Crédit remboursable',
      condition: 'Si crédit > impôt calculé',
      result: 'Remboursement de l\'excédent',
    },
  ],
  calculation: {
    formula: 'Crédit total = Base × (1 - réduction) + Enfants + Bonus',
    phaseOut: 'Linéaire entre seuils bas et moyens',
    examples: [
      {
        scenario: 'Isolé 12000€, 0 enfants',
        calculation: '320€ × 50% = 160€ (revenus moyens)',
      },
      {
        scenario: 'Couple 13000€, 2 enfants',
        calculation: '640€ + (2 × 460€) = 1560€',
      },
      {
        scenario: 'Parent isolé 15000€, 2 enfants',
        calculation: '320€ + 920€ + 460€ = 1700€',
      },
    ],
  },
  automaticCalculation: {
    description: 'Le crédit est calculé automatiquement par l\'administration',
    requirements: [
      'Déclaration correcte des revenus',
      'Situation familiale à jour',
      'Enfants à charge déclarés',
    ],
  },
  lastUpdate: '2024-04-10',
  source: 'SPF Finances - Direction générale de la fiscalité',
};