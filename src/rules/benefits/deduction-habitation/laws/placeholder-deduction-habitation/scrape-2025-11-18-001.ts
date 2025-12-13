/**
 * Business Rules for Déduction pour Habitation Propre et Unique
 *
 * Implements eligibility and calculation rules for owner-occupied housing deductions.
 *
 * BASE JURIDIQUE:
 * - Code des Impôts sur les Revenus 1992 (CIR 92) - Articles 104 et 115-145/8
 * - Loi spéciale du 16 janvier 1989 relative au financement des Communautés et Régions
 * - Décrets régionaux (Wallonie, Flandre, Bruxelles-Capitale)
 * - SPF Finances - Circulaire 2024/C/52 du 1er juin 2024
 * - https://finances.belgium.be/fr/particuliers/habitation/avantages_fiscaux
 * - Autorité: SPF Finances et autorités régionales
 * - Dernière modification: Exercice d'imposition 2025 (revenus 2024)
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../../../../../domain/types';

// Constants for tax year 2024
const HOUSING_CONSTANTS_2024 = {
  // Federal parameters (for old contracts and non-principal residences)
  ordinaryDeductionCeiling: 2350, // EUR
  firstSliceIncrease: 820, // EUR
  childIncrease: 80, // EUR per child after the 2nd
  maxFiscalAdvantageYears: 20, // years

  // Regional parameters - Wallonia (Chèque Habitat)
  wallonia: {
    baseChequeHabitat: 1520, // EUR
    childReduction: 125, // EUR per child
    maxChildren: 8, // maximum children for reduction
    incomeLimit: 86000, // EUR for couple, 96000 EUR with children
    contractDateCutoff: '2016-01-01', // contracts after this date
    maxDuration: 20, // years
  },

  // Regional parameters - Brussels
  brussels: {
    interestDeductionCeiling: 2350, // EUR
    marginalTaxRates: [0.25, 0.40, 0.45, 0.50], // progressive rates
    contractDateCutoff: '2017-01-01',
  },

  // Regional parameters - Flanders
  flanders: {
    bonusLogementSuppressed: true, // since 2020
    granddfatheredBonusLogement: 1520, // EUR for pre-2020 contracts
    reducedRegistrationFees: 0.06, // 6% instead of 10%
    contractDateCutoff: '2020-01-01',
  },

  // Common parameters
  occupancyDeadline: 2, // years to occupy after acquisition
  refinancingLimit: 'original_balance', // only original loan balance eligible
};

export interface HousingDeductionUser {
  region: 'wallonia' | 'flanders' | 'brussels';
  propertyType: 'principal' | 'secondary' | 'investment';
  loanContractDate: Date;
  loanAmount: number;
  currentBalance?: number;
  annualInterest: number;
  annualCapital: number;
  insurancePremium?: number;
  annualIncome: number;
  spouseIncome?: number;
  numberOfChildren: number;
  hasEnergyWorks?: boolean;
  energyWorksAmount?: number;
  isFirstHome?: boolean;
  hasOccupiedProperty?: boolean;
  yearsSinceAcquisition?: number;
  isRefinancing?: boolean;
  originalLoanBalance?: number;
}

export interface HousingDeductionResult {
  isEligible: boolean;
  deductionType?: 'cheque-habitat' | 'interest-deduction' | 'bonus-logement' | 'ordinary-deduction';
  fiscalAdvantage?: number;
  deductibleAmount?: number;
  taxReduction?: number;
  childrenReduction?: number;
  maxDurationYears?: number;
  declarationCodes?: {
    code: string;
    description: string;
    amount: number;
  }[];
  regionalNotes?: string[];
  reason?: string;
  requiredDocuments?: string[];
  optimizationTips?: string[];
}

/**
 * Create the housing deduction rules engine
 */
function createHousingDeductionEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Property must be principal residence for regional advantages
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'propertyType',
          operator: 'notEqual',
          value: 'principal',
        },
        {
          fact: 'seekingRegionalAdvantage',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'housing-ineligible',
      params: {
        reason: 'Avantages régionaux réservés à l\'habitation propre et unique',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Wallonia - Chèque Habitat eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'wallonia',
        },
        {
          fact: 'propertyType',
          operator: 'equal',
          value: 'principal',
        },
        {
          fact: 'loanAfterCutoff',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'incomeWithinLimit',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'housing-eligible-cheque-habitat',
      params: {
        message: 'Éligible au chèque habitat wallon',
        type: 'cheque-habitat',
      },
    },
    priority: 5,
  });

  // Rule 3: Brussels - Interest deduction
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'brussels',
        },
        {
          fact: 'propertyType',
          operator: 'equal',
          value: 'principal',
        },
        {
          fact: 'hasLoanInterest',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'housing-eligible-brussels-deduction',
      params: {
        message: 'Éligible à la déduction des intérêts à Bruxelles',
        type: 'interest-deduction',
      },
    },
    priority: 5,
  });

  // Rule 4: Flanders - Grandfathered bonus logement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'flanders',
        },
        {
          fact: 'propertyType',
          operator: 'equal',
          value: 'principal',
        },
        {
          fact: 'loanBeforeCutoff',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'housing-eligible-bonus-logement',
      params: {
        message: 'Droits acquis bonus logement flamand',
        type: 'bonus-logement',
      },
    },
    priority: 5,
  });

  // Rule 5: Flanders - New acquisitions (no fiscal advantage)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'flanders',
        },
        {
          fact: 'propertyType',
          operator: 'equal',
          value: 'principal',
        },
        {
          fact: 'loanAfter2020',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'housing-ineligible-flanders-new',
      params: {
        reason: 'Pas d\'avantage fiscal régional en Flandre depuis 2020 (mais droits d\'enregistrement réduits)',
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 6: Secondary residence - ordinary deduction only
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'propertyType',
          operator: 'in',
          value: ['secondary', 'investment'],
        },
        {
          fact: 'hasLoanInterest',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'housing-eligible-ordinary-deduction',
      params: {
        message: 'Déduction ordinaire des intérêts (résidence secondaire)',
        type: 'ordinary-deduction',
      },
    },
    priority: 4,
  });

  // Rule 7: Occupancy requirement not met
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'propertyType',
          operator: 'equal',
          value: 'principal',
        },
        {
          fact: 'hasOccupiedProperty',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'yearsSinceAcquisition',
          operator: 'greaterThan',
          value: HOUSING_CONSTANTS_2024.occupancyDeadline,
        },
      ],
    },
    event: {
      type: 'housing-advantage-recovery',
      params: {
        reason: 'Non-respect du délai d\'occupation de 2 ans - récupération de l\'avantage fiscal',
        priority: 9,
      },
    },
    priority: 9,
  });

  return engine;
}

/**
 * Singleton instance
 */
const housingEngineInstance = createHousingDeductionEngine();

/**
 * Calculate Wallonia Chèque Habitat
 */
function calculateChequeHabitat(user: HousingDeductionUser): number {
  const baseAmount = HOUSING_CONSTANTS_2024.wallonia.baseChequeHabitat;
  const childrenReduction = Math.min(user.numberOfChildren, HOUSING_CONSTANTS_2024.wallonia.maxChildren) *
                           HOUSING_CONSTANTS_2024.wallonia.childReduction;

  // Check income limits
  const incomeLimit = user.numberOfChildren > 0 ? 96000 : 86000;
  const totalIncome = user.annualIncome + (user.spouseIncome || 0);

  if (totalIncome > incomeLimit) {
    return 0;
  }

  return baseAmount + childrenReduction;
}

/**
 * Calculate Brussels interest deduction
 */
function calculateBrusselsDeduction(user: HousingDeductionUser): {
  deductible: number;
  taxReduction: number;
} {
  // Cap interest at ceiling
  const deductibleInterest = Math.min(user.annualInterest, HOUSING_CONSTANTS_2024.brussels.interestDeductionCeiling);

  // Determine marginal tax rate based on income
  let marginalRate = 0.25;
  if (user.annualIncome > 45000) marginalRate = 0.50;
  else if (user.annualIncome > 35000) marginalRate = 0.45;
  else if (user.annualIncome > 25000) marginalRate = 0.40;

  const taxReduction = deductibleInterest * marginalRate;

  return {
    deductible: deductibleInterest,
    taxReduction: Math.round(taxReduction * 100) / 100,
  };
}

/**
 * Calculate ordinary deduction for non-principal residence
 */
function calculateOrdinaryDeduction(user: HousingDeductionUser): {
  deductible: number;
  taxReduction: number;
} {
  // Only interest is deductible, not capital or insurance
  const deductibleAmount = Math.min(user.annualInterest, HOUSING_CONSTANTS_2024.ordinaryDeductionCeiling);

  // Estimate marginal tax rate
  let marginalRate = 0.25;
  if (user.annualIncome > 45000) marginalRate = 0.50;
  else if (user.annualIncome > 35000) marginalRate = 0.45;
  else if (user.annualIncome > 25000) marginalRate = 0.40;

  return {
    deductible: deductibleAmount,
    taxReduction: Math.round(deductibleAmount * marginalRate * 100) / 100,
  };
}

/**
 * Calculate housing deduction
 */
export function calculateHousingDeduction(user: HousingDeductionUser): HousingDeductionResult {
  const loanDate = new Date(user.loanContractDate);

  // Check refinancing limits
  if (user.isRefinancing && user.originalLoanBalance) {
    const eligiblePortion = user.originalLoanBalance / user.loanAmount;
    user.annualInterest = user.annualInterest * eligiblePortion;
    user.annualCapital = user.annualCapital * eligiblePortion;
  }

  // Wallonia - Chèque Habitat
  if (user.region === 'wallonia' && user.propertyType === 'principal') {
    if (loanDate >= new Date(HOUSING_CONSTANTS_2024.wallonia.contractDateCutoff)) {
      const chequeAmount = calculateChequeHabitat(user);
      if (chequeAmount > 0) {
        return {
          isEligible: true,
          deductionType: 'cheque-habitat',
          fiscalAdvantage: chequeAmount,
          childrenReduction: user.numberOfChildren * HOUSING_CONSTANTS_2024.wallonia.childReduction,
          maxDurationYears: HOUSING_CONSTANTS_2024.wallonia.maxDuration,
          declarationCodes: [{
            code: 'Automatique',
            description: 'Chèque habitat calculé par l\'administration',
            amount: chequeAmount,
          }],
          regionalNotes: [
            'Le chèque habitat est une réduction d\'impôt directe',
            'Maximum 20 ans à partir de l\'année du prêt',
            `Montant de base: ${HOUSING_CONSTANTS_2024.wallonia.baseChequeHabitat}€`,
            `Réduction par enfant: ${HOUSING_CONSTANTS_2024.wallonia.childReduction}€`,
          ],
          requiredDocuments: [
            'Acte de crédit hypothécaire',
            'Preuve d\'occupation comme résidence principale',
            'Composition de ménage',
            'Attestation fiscale de la banque',
          ],
        };
      }
    }
  }

  // Brussels - Interest deduction
  if (user.region === 'brussels' && user.propertyType === 'principal') {
    const brusselsCalc = calculateBrusselsDeduction(user);
    return {
      isEligible: true,
      deductionType: 'interest-deduction',
      deductibleAmount: brusselsCalc.deductible,
      taxReduction: brusselsCalc.taxReduction,
      maxDurationYears: HOUSING_CONSTANTS_2024.maxFiscalAdvantageYears,
      declarationCodes: [{
        code: 'VII-1146-28',
        description: 'Intérêts hypothécaires',
        amount: brusselsCalc.deductible,
      }],
      regionalNotes: [
        'Déduction des intérêts au taux marginal d\'imposition',
        `Plafond: ${HOUSING_CONSTANTS_2024.brussels.interestDeductionCeiling}€`,
      ],
      requiredDocuments: [
        'Attestation fiscale 281.61 de la banque',
        'Preuve d\'occupation comme résidence principale',
      ],
      optimizationTips: [
        'Considérez les travaux économiseurs d\'énergie pour des déductions supplémentaires',
        'Vérifiez si vous pouvez bénéficier de primes régionales',
      ],
    };
  }

  // Flanders
  if (user.region === 'flanders' && user.propertyType === 'principal') {
    // Grandfathered bonus logement
    if (loanDate < new Date(HOUSING_CONSTANTS_2024.flanders.contractDateCutoff)) {
      return {
        isEligible: true,
        deductionType: 'bonus-logement',
        fiscalAdvantage: HOUSING_CONSTANTS_2024.flanders.granddfatheredBonusLogement,
        maxDurationYears: HOUSING_CONSTANTS_2024.maxFiscalAdvantageYears,
        declarationCodes: [{
          code: 'Automatique',
          description: 'Bonus logement (droits acquis)',
          amount: HOUSING_CONSTANTS_2024.flanders.granddfatheredBonusLogement,
        }],
        regionalNotes: [
          'Droits acquis pour contrats avant 2020',
          'Avantage maintenu jusqu\'à la fin du crédit',
        ],
        requiredDocuments: [
          'Attestation fiscale de la banque',
          'Contrat de crédit original',
        ],
      };
    }

    // New acquisitions - no fiscal advantage
    return {
      isEligible: false,
      reason: 'Pas d\'avantage fiscal régional en Flandre pour les nouveaux contrats depuis 2020',
      regionalNotes: [
        'Droits d\'enregistrement réduits à 6% (au lieu de 10%)',
        'Possibilité de déduire les frais d\'emprunt via déduction ordinaire si non-principal',
      ],
      optimizationTips: [
        'Profitez des droits d\'enregistrement réduits',
        'Considérez les rénovations énergétiques pour d\'autres avantages',
      ],
    };
  }

  // Secondary/Investment property - ordinary deduction
  if (user.propertyType !== 'principal') {
    const ordinaryCalc = calculateOrdinaryDeduction(user);
    return {
      isEligible: true,
      deductionType: 'ordinary-deduction',
      deductibleAmount: ordinaryCalc.deductible,
      taxReduction: ordinaryCalc.taxReduction,
      declarationCodes: [{
        code: 'VII-1146-28',
        description: 'Intérêts ordinaires',
        amount: ordinaryCalc.deductible,
      }],
      regionalNotes: [
        'Déduction ordinaire pour résidence non-principale',
        'Seuls les intérêts sont déductibles',
        `Plafond: ${HOUSING_CONSTANTS_2024.ordinaryDeductionCeiling}€`,
      ],
      requiredDocuments: [
        'Attestation fiscale 281.61',
        'Acte de propriété',
      ],
    };
  }

  return {
    isEligible: false,
    reason: 'Configuration non couverte par les règles actuelles',
  };
}

/**
 * Check housing deduction eligibility
 */
export async function checkHousingDeductionEligibility(user: HousingDeductionUser): Promise<EligibilityCheck> {
  const loanDate = new Date(user.loanContractDate);

  const facts = {
    region: user.region,
    propertyType: user.propertyType,
    seekingRegionalAdvantage: user.propertyType === 'principal',
    loanAfterCutoff: user.region === 'wallonia' ?
      loanDate >= new Date(HOUSING_CONSTANTS_2024.wallonia.contractDateCutoff) :
      loanDate >= new Date(HOUSING_CONSTANTS_2024.brussels.contractDateCutoff),
    loanBeforeCutoff: user.region === 'flanders' &&
      loanDate < new Date(HOUSING_CONSTANTS_2024.flanders.contractDateCutoff),
    loanAfter2020: user.region === 'flanders' &&
      loanDate >= new Date(HOUSING_CONSTANTS_2024.flanders.contractDateCutoff),
    hasLoanInterest: user.annualInterest > 0,
    incomeWithinLimit: user.region === 'wallonia' ?
      (user.annualIncome + (user.spouseIncome || 0)) <= (user.numberOfChildren > 0 ? 96000 : 86000) :
      true,
    hasOccupiedProperty: user.hasOccupiedProperty,
    yearsSinceAcquisition: user.yearsSinceAcquisition || 0,
  };

  try {
    const results = await housingEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvent = results.events.find(e =>
      e.type === 'housing-ineligible' ||
      e.type === 'housing-ineligible-flanders-new' ||
      e.type === 'housing-advantage-recovery'
    );

    if (ineligibleEvent) {
      return {
        benefitType: 'housing-deduction',
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    // Check for eligibility
    const eligibleEvent = results.events.find(e =>
      e.type.startsWith('housing-eligible')
    );

    if (eligibleEvent) {
      const calculation = calculateHousingDeduction(user);
      return {
        benefitType: 'housing-deduction',
        isEligible: calculation.isEligible,
        calculatedAmount: calculation.fiscalAdvantage || calculation.taxReduction,
        optimizationSuggestion: calculation.optimizationTips?.join('; '),
      };
    }

    return {
      benefitType: 'housing-deduction',
      isEligible: false,
      reason: 'Conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking housing deduction eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format
 */
export const HOUSING_DEDUCTION_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: 'Code des Impôts sur les Revenus 1992 (CIR 92)',
      articles: ['Article 104', 'Articles 115-145/8'],
      authority: 'Service Public Fédéral Finances',
      officialUrl: 'https://finances.belgium.be/fr/particuliers/habitation/avantages_fiscaux',
      lastAmended: '2024',
    },
    regionalLegislation: [
      {
        region: 'Wallonie',
        title: 'Décret wallon du 20 décembre 2018 - Chèque habitat',
        authority: 'Gouvernement wallon',
      },
      {
        region: 'Bruxelles',
        title: 'Ordonnance du 21 décembre 2018',
        authority: 'Gouvernement de la Région de Bruxelles-Capitale',
      },
      {
        region: 'Flandre',
        title: 'Décret flamand du 19 décembre 2019',
        authority: 'Gouvernement flamand',
        note: 'Suppression du bonus logement pour nouveaux contrats',
      },
    ],
  },
  parameters2024: HOUSING_CONSTANTS_2024,
  rules: [
    {
      id: 'housing-principal-residence',
      description: 'Habitation propre et unique requise pour avantages régionaux',
      condition: 'propertyType == principal',
      priority: 10,
    },
    {
      id: 'housing-wallonia-cheque',
      description: 'Chèque habitat wallon pour contrats après 2016',
      parameters: {
        base: '1520€',
        childReduction: '125€/enfant',
        maxDuration: '20 ans',
        incomeLimit: '86000€ (96000€ avec enfants)',
      },
    },
    {
      id: 'housing-brussels-interest',
      description: 'Déduction intérêts Bruxelles au taux marginal',
      parameters: {
        ceiling: '2350€',
        taxReduction: 'taux marginal × intérêts',
      },
    },
    {
      id: 'housing-flanders-legacy',
      description: 'Bonus logement Flandre (droits acquis pre-2020)',
      parameters: {
        amount: '1520€',
        newContracts: 'supprimé',
        registrationFees: '6% au lieu de 10%',
      },
    },
    {
      id: 'housing-ordinary-deduction',
      description: 'Déduction ordinaire résidences secondaires',
      parameters: {
        ceiling: '2350€',
        eligible: 'intérêts uniquement',
      },
    },
  ],
  requiredDocuments: [
    'Attestation fiscale 281.61 du prêteur',
    'Acte de crédit hypothécaire',
    'Preuve d\'occupation (certificat de résidence)',
    'Composition de ménage',
    'Déclaration sur l\'honneur habitation propre',
  ],
  calculation: {
    wallonia: 'Chèque = 1520€ + (125€ × enfants)',
    brussels: 'Réduction = MIN(intérêts, 2350€) × taux marginal',
    flanders: 'Grandfathered: 1520€, New: 0€ (mais -4% droits enregistrement)',
    secondary: 'Déduction = MIN(intérêts, 2350€) × taux marginal',
  },
  lastUpdate: '2024-06-01',
  source: 'SPF Finances et autorités régionales',
};