/**
 * Business Rules for Property Acquisition in Belgium
 * Implements procedures 1-10 from acquisition.feature
 *
 * BASE JURIDIQUE:
 * - Code Civil Belge, Livre III, Titre VI (De la vente)
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032133&table_name=loi
 * - Code des droits d'enregistrement (par région)
 * - Loi hypothécaire du 16 décembre 1851
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1851121650&table_name=loi
 */

import { Engine } from 'json-rules-engine';
import {
  PropertyBuyer,
  PropertyDetails,
  MortgageCapacity,
  AcquisitionCosts,
  BelgianRegion,
  RegistrationFeesCalculation,
  CompromisVente,
  IMMOBILIER_CONSTANTS,
} from '../modele-metier/immobilierTypes';

/**
 * Create the property acquisition eligibility engine
 */
function createAcquisitionEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Minimum age for property purchase
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'buyerAge',
          operator: 'lessThan',
          value: 18,
        },
      ],
    },
    event: {
      type: 'acquisition-ineligible',
      params: {
        reason: 'Acheteur doit avoir minimum 18 ans',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Debt ratio check for mortgage
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'debtRatio',
          operator: 'greaterThan',
          value: IMMOBILIER_CONSTANTS.MAX_DEBT_RATIO,
        },
      ],
    },
    event: {
      type: 'mortgage-risk',
      params: {
        reason: 'Taux d\'endettement supérieur à 33%',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: Minimum deposit requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isPrimoAccedant',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'depositPercentage',
          operator: 'lessThan',
          value: 0.10, // 10% minimum for first-time buyers
        },
      ],
    },
    event: {
      type: 'insufficient-deposit',
      params: {
        reason: 'Apport personnel insuffisant (minimum 10% pour primo-accédant)',
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 4: Non-primo accedant deposit requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isPrimoAccedant',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'depositPercentage',
          operator: 'lessThan',
          value: 0.20, // 20% for non-first-time buyers
        },
      ],
    },
    event: {
      type: 'insufficient-deposit',
      params: {
        reason: 'Apport personnel insuffisant (minimum 20% pour non primo-accédant)',
        priority: 8,
      },
    },
    priority: 8,
  });

  return engine;
}

// Singleton instance
const acquisitionEngineInstance = createAcquisitionEngine();

/**
 * Calculate mortgage capacity based on income and charges
 */
export function calculateMortgageCapacity(buyer: PropertyBuyer): MortgageCapacity {
  const totalMonthlyIncome = buyer.monthlyIncome + (buyer.partnerIncome || 0);
  const maxMonthlyPayment = totalMonthlyIncome * IMMOBILIER_CONSTANTS.MAX_DEBT_RATIO - buyer.existingCharges;

  // Assume average interest rate of 3.5% over 20 years for calculation
  const interestRate = 0.035 / 12;
  const numberOfPayments = 20 * 12;

  // Calculate max loan amount using mortgage formula
  const maxLoanAmount = maxMonthlyPayment * ((1 - Math.pow(1 + interestRate, -numberOfPayments)) / interestRate);

  // Calculate required deposit based on primo-accedant status
  const depositRate = buyer.isPrimoAccedant ? 0.10 : 0.20;
  const propertyValue = maxLoanAmount / (1 - depositRate);
  const requiredDeposit = propertyValue * depositRate;

  // Calculate acquisition costs
  const registrationRate = IMMOBILIER_CONSTANTS.REGISTRATION_FEES[buyer.region].standard;
  const registrationFees = propertyValue * registrationRate;
  const notaryFees = propertyValue * IMMOBILIER_CONSTANTS.NOTARY_FEES_RATE;

  return {
    maxLoanAmount: Math.round(maxLoanAmount),
    requiredDeposit: Math.round(requiredDeposit),
    maxMonthlyPayment: Math.round(maxMonthlyPayment),
    debtRatio: (maxMonthlyPayment + buyer.existingCharges) / totalMonthlyIncome,
    registrationFees: Math.round(registrationFees),
    notaryFees: Math.round(notaryFees),
    totalAcquisitionCost: Math.round(propertyValue + registrationFees + notaryFees),
  };
}

/**
 * Calculate acquisition costs including all fees and taxes
 */
export function calculateAcquisitionCosts(
  property: PropertyDetails,
  buyer: PropertyBuyer,
  isPrimaryResidence: boolean
): AcquisitionCosts {
  const region = property.region;
  const price = property.price;

  // Calculate registration fees with potential abatement
  let registrationFees = price * IMMOBILIER_CONSTANTS.REGISTRATION_FEES[region].standard;
  let registrationAbatement = 0;

  if (isPrimaryResidence && buyer.isPrimoAccedant) {
    const abatement = IMMOBILIER_CONSTANTS.REGISTRATION_FEES[region].abatement;

    if (region === 'wallonie') {
      // In Wallonia, first 20,000€ at reduced rate
      registrationAbatement = abatement * IMMOBILIER_CONSTANTS.REGISTRATION_FEES[region].standard;
      registrationFees = Math.max(0, (price - abatement) * IMMOBILIER_CONSTANTS.REGISTRATION_FEES[region].standard) +
                        Math.min(price, abatement) * 0.06;
    } else if (region === 'bruxelles') {
      // In Brussels, reduced rate on first 175,000€
      if (price <= 175000) {
        registrationFees = price * 0.06;
      } else {
        registrationFees = 175000 * 0.06 + (price - 175000) * IMMOBILIER_CONSTANTS.REGISTRATION_FEES[region].standard;
      }
      registrationAbatement = price * IMMOBILIER_CONSTANTS.REGISTRATION_FEES[region].standard - registrationFees;
    } else if (region === 'flandre') {
      // In Flanders, different system with lower base rate
      registrationFees = price * 0.06;
      registrationAbatement = price * 0.04; // Difference between 10% and 6%
    }
  }

  // Calculate notary fees (degressive scale, simplified)
  let notaryFees = 0;
  if (price <= 100000) {
    notaryFees = price * 0.025;
  } else if (price <= 250000) {
    notaryFees = 2500 + (price - 100000) * 0.02;
  } else {
    notaryFees = 5500 + (price - 250000) * 0.015;
  }

  // Add fixed costs
  const mortgageFileFees = 1500;
  const expertiseFees = 350;

  return {
    propertyPrice: price,
    registrationFees: Math.round(registrationFees),
    registrationAbatement: Math.round(registrationAbatement),
    notaryFees: Math.round(notaryFees),
    mortgageFileFees,
    expertiseFees,
    totalCosts: Math.round(price + registrationFees + notaryFees + mortgageFileFees + expertiseFees),
    region,
  };
}

/**
 * Check buyer eligibility for property acquisition
 */
export async function checkAcquisitionEligibility(
  buyer: PropertyBuyer,
  property: PropertyDetails
): Promise<{
  isEligible: boolean;
  mortgageCapacity: MortgageCapacity;
  affordablePrice: number;
  warnings: string[];
  recommendations: string[];
}> {
  const capacity = calculateMortgageCapacity(buyer);
  const costs = calculateAcquisitionCosts(property, buyer, true);

  const totalMonthlyIncome = buyer.monthlyIncome + (buyer.partnerIncome || 0);
  const debtRatio = (capacity.maxMonthlyPayment + buyer.existingCharges) / totalMonthlyIncome;
  const depositPercentage = buyer.savings / costs.totalCosts;

  // Run rules engine
  const facts = {
    buyerAge: buyer.age,
    debtRatio,
    depositPercentage,
    isPrimoAccedant: buyer.isPrimoAccedant,
  };

  const results = await acquisitionEngineInstance.run(facts);

  const warnings: string[] = [];
  const recommendations: string[] = [];

  results.events.forEach((event) => {
    if (event.type === 'acquisition-ineligible') {
      warnings.push(event.params?.reason);
    } else if (event.type === 'mortgage-risk') {
      warnings.push(event.params?.reason);
    } else if (event.type === 'insufficient-deposit') {
      warnings.push(event.params?.reason);
    }
  });

  // Add recommendations
  if (buyer.isPrimoAccedant) {
    recommendations.push('Vérifiez les avantages primo-accédant dans votre région');
    recommendations.push('Considérez le prêt social si éligible');
  }

  if (costs.totalCosts > capacity.maxLoanAmount + buyer.savings) {
    recommendations.push('Prix du bien supérieur à votre capacité actuelle');
    recommendations.push(`Budget maximum recommandé: ${Math.round(capacity.maxLoanAmount + buyer.savings)}€`);
  }

  if (property.energyClass === 'F' || property.energyClass === 'G') {
    recommendations.push('PEB défavorable - prévoir budget rénovation énergétique');
    recommendations.push('Vérifiez les primes rénovation disponibles');
  }

  const isEligible = warnings.length === 0 && costs.totalCosts <= capacity.maxLoanAmount + buyer.savings;

  return {
    isEligible,
    mortgageCapacity: capacity,
    affordablePrice: Math.round(capacity.maxLoanAmount + buyer.savings),
    warnings,
    recommendations,
  };
}

/**
 * Create a purchase offer (compromis de vente)
 */
export function createPurchaseOffer(
  buyer: PropertyBuyer,
  property: PropertyDetails,
  offerPrice: number,
  conditions: string[] = []
): CompromisVente {
  const standardConditions: CompromisVente['suspensiveConditions'] = [
    {
      type: 'mortgage',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
    {
      type: 'urbanism',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    },
    {
      type: 'servitudes',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  ];

  // Add soil pollution check for Flanders
  if (property.region === 'flandre') {
    standardConditions.push({
      type: 'soil_pollution',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    });
  }

  return {
    buyerId: buyer.id,
    sellerId: 'to-be-determined',
    propertyId: 'property-' + property.type,
    price: offerPrice,
    suspensiveConditions: standardConditions,
    deposit: offerPrice * 0.10, // 10% deposit
    notaryId: 'to-be-selected',
    signingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days for compromis
    completionDeadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months total
  };
}

/**
 * Calculate registration fees with all applicable reductions
 */
export function calculateDetailedRegistrationFees(calculation: RegistrationFeesCalculation): {
  baseFees: number;
  reductions: { type: string; amount: number }[];
  finalFees: number;
  notaryFees: number;
  totalCost: number;
} {
  const { propertyPrice, region, isPrimaryResidence, isPrimoAccedant } = calculation;

  const baseRate = IMMOBILIER_CONSTANTS.REGISTRATION_FEES[region].standard;
  const baseFees = propertyPrice * baseRate;
  const reductions: { type: string; amount: number }[] = [];
  let finalFees = baseFees;

  if (isPrimaryResidence) {
    reductions.push({
      type: 'Habitation propre',
      amount: 0,
    });

    if (region === 'wallonie' && isPrimoAccedant) {
      const abatement = IMMOBILIER_CONSTANTS.REGISTRATION_FEES.wallonie.abatement;
      const reduction = Math.min(propertyPrice, abatement) * (baseRate - 0.06);
      reductions.push({
        type: 'Abattement primo-accédant (20,000€)',
        amount: reduction,
      });
      finalFees -= reduction;
    } else if (region === 'bruxelles') {
      const reducedAmount = Math.min(propertyPrice, 175000);
      const reduction = reducedAmount * (baseRate - 0.06);
      reductions.push({
        type: 'Taux réduit premiers 175,000€',
        amount: reduction,
      });
      finalFees -= reduction;
    } else if (region === 'flandre' && isPrimoAccedant) {
      const reduction = propertyPrice * 0.04; // From 10% to 6%
      reductions.push({
        type: 'Réduction primo-accédant',
        amount: reduction,
      });
      finalFees -= reduction;
    }
  }

  // Calculate notary fees (simplified progressive scale)
  let notaryFees = 0;
  if (propertyPrice <= 100000) {
    notaryFees = propertyPrice * 0.025;
  } else if (propertyPrice <= 250000) {
    notaryFees = 2500 + (propertyPrice - 100000) * 0.02;
  } else if (propertyPrice <= 500000) {
    notaryFees = 5500 + (propertyPrice - 250000) * 0.015;
  } else {
    notaryFees = 9250 + (propertyPrice - 500000) * 0.01;
  }

  // Add administrative fees
  notaryFees += 1500; // Fixed administrative costs

  return {
    baseFees: Math.round(baseFees),
    reductions,
    finalFees: Math.round(finalFees),
    notaryFees: Math.round(notaryFees),
    totalCost: Math.round(propertyPrice + finalFees + notaryFees),
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const ACQUISITION_RULES_JSON = {
  legalFramework: {
    civilCode: {
      title: 'Code Civil Belge - De la vente',
      book: 'Livre III',
      title_number: 'Titre VI',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032133&table_name=loi',
    },
    mortgageLaw: {
      title: 'Loi hypothécaire',
      date: '16 décembre 1851',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1851121650&table_name=loi',
    },
  },
  rules: [
    {
      id: 'age-requirement',
      description: 'Âge minimum pour acheter',
      condition: 'age >= 18',
      legalBasis: 'Code Civil art. 1123',
    },
    {
      id: 'debt-ratio',
      description: 'Taux d\'endettement maximum',
      condition: 'debt_ratio <= 33%',
      legalBasis: 'Directive crédit hypothécaire',
    },
    {
      id: 'deposit-requirement',
      description: 'Apport personnel minimum',
      condition: 'deposit >= 10% (primo) ou 20% (non-primo)',
      legalBasis: 'Pratique bancaire standard',
    },
  ],
  registrationFees: IMMOBILIER_CONSTANTS.REGISTRATION_FEES,
  maxDebtRatio: IMMOBILIER_CONSTANTS.MAX_DEBT_RATIO,
};