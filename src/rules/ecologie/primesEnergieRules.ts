/**
 * Business Rules for Energy Subsidies and Renovations
 *
 * BASE JURIDIQUE:
 * - Wallonie: AGW du 26 mars 2015 - primes énergie
 *   https://wallex.wallonie.be/eli/arrete/2015/03/26/2015201732
 * - Flandre: Energiebesluit van 19 november 2010
 *   https://www.energiesparen.be/subsidies
 * - Bruxelles: Arrêté du 9 février 2023 - primes RENOLUTION
 *   https://environnement.brussels/thematiques/batiment-et-energie/primes-et-incitants
 */

import { Engine } from 'json-rules-engine';
import {
  EnergySubsidyType,
  EnergySubsidyRequest,
  EcologieEligibilityResult,
  Region,
  ECOLOGIE_CONSTANTS,
  ECOLOGIE_LEGAL_REFERENCES,
} from '../../domain/ecologieTypes';

interface IncomeCategory {
  category: 'base' | 'modeste' | 'précaire';
  multiplier: number;
}

/**
 * Determine income category based on annual income
 */
function determineIncomeCategory(income: number, region: Region): IncomeCategory {
  const thresholds = {
    wallonie: {
      précaire: 23000,
      modeste: 35000,
    },
    flandre: {
      précaire: 25000,
      modeste: 38000,
    },
    bruxelles: {
      précaire: 24000,
      modeste: 36000,
    },
    federal: {
      précaire: 24000,
      modeste: 36000,
    },
  };

  const regionThresholds = thresholds[region];

  if (income <= regionThresholds.précaire) {
    return { category: 'précaire', multiplier: 2.0 };
  } else if (income <= regionThresholds.modeste) {
    return { category: 'modeste', multiplier: 1.5 };
  } else {
    return { category: 'base', multiplier: 1.0 };
  }
}

/**
 * Create the energy subsidy rules engine
 */
function createEnergySubsidyEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Solar panels eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'type',
          operator: 'equal',
          value: 'panneaux-solaires',
        },
        {
          fact: 'propertyAge',
          operator: 'greaterThan',
          value: 10, // Building must be > 10 years old
        },
      ],
    },
    event: {
      type: 'solar-eligible',
      params: {
        baseSubsidy: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.SOLAR_PANELS.subsidy_per_kwc,
        maxPower: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.SOLAR_PANELS.max_power,
        maxSubsidy: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.SOLAR_PANELS.max_subsidy,
      },
    },
    priority: 10,
  });

  // Rule 2: Heat pump eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'type',
          operator: 'equal',
          value: 'pompe-chaleur',
        },
        {
          fact: 'energyPerformance',
          operator: 'notIn',
          value: ['A', 'B'], // Not already highly efficient
        },
      ],
    },
    event: {
      type: 'heat-pump-eligible',
      params: {
        baseSubsidy: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.HEAT_PUMP.base_subsidy,
        incomeBonus: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.HEAT_PUMP.income_bonus,
        maxSubsidy: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.HEAT_PUMP.max_subsidy,
      },
    },
    priority: 10,
  });

  // Rule 3: Insulation eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'type',
          operator: 'equal',
          value: 'isolation',
        },
        {
          fact: 'propertyAge',
          operator: 'greaterThan',
          value: 5,
        },
      ],
    },
    event: {
      type: 'insulation-eligible',
      params: {
        roofSubsidy: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.INSULATION.roof,
        wallSubsidy: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.INSULATION.wall,
        floorSubsidy: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.INSULATION.floor,
        maxSubsidy: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.INSULATION.max_subsidy,
      },
    },
    priority: 10,
  });

  // Rule 4: Energy audit requirement for major renovations
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estimatedCost',
          operator: 'greaterThan',
          value: 25000,
        },
        {
          fact: 'type',
          operator: 'in',
          value: ['rénovation-énergétique', 'isolation'],
        },
      ],
    },
    event: {
      type: 'audit-required',
      params: {
        requirement: 'Audit énergétique PAE2 obligatoire',
        auditSubsidy: 500, // Partial reimbursement of audit cost
      },
    },
    priority: 15,
  });

  // Rule 5: Property type restrictions
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'propertyType',
          operator: 'equal',
          value: 'commerce',
        },
        {
          fact: 'type',
          operator: 'in',
          value: ['panneaux-solaires', 'pompe-chaleur'],
        },
      ],
    },
    event: {
      type: 'commercial-bonus',
      params: {
        bonusMultiplier: 1.2,
        requirement: 'Engagement de performance énergétique sur 5 ans',
      },
    },
    priority: 5,
  });

  // Rule 6: Cumulative subsidy cap
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estimatedCost',
          operator: 'greaterThan',
          value: 50000,
        },
      ],
    },
    event: {
      type: 'subsidy-cap',
      params: {
        maxCumulativeSubsidy: 15000,
        note: 'Plafond cumulatif des primes énergétiques',
      },
    },
    priority: 20,
  });

  return engine;
}

const energySubsidyEngineInstance = createEnergySubsidyEngine();

/**
 * Calculate solar panel subsidy
 */
export function calculateSolarSubsidy(
  power: number, // kWc
  income: number,
  region: Region
): { subsidy: number; details: string } {
  const incomeCategory = determineIncomeCategory(income, region);
  const constants = ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.SOLAR_PANELS;

  // Limit power to maximum eligible
  const eligiblePower = Math.min(power, constants.max_power);

  // Calculate base subsidy
  let subsidy = eligiblePower * constants.subsidy_per_kwc * incomeCategory.multiplier;

  // Apply regional bonus (default to 1 if region not found)
  let regionalBonus = 1;
  if (region === 'wallonie') {
    regionalBonus = ECOLOGIE_CONSTANTS.REGIONAL_BONUSES.wallonie.solar_bonus;
  } else if (region === 'flandre') {
    regionalBonus = ECOLOGIE_CONSTANTS.REGIONAL_BONUSES.flandre.solar_bonus;
  }
  subsidy *= regionalBonus;

  // Apply maximum cap
  subsidy = Math.min(subsidy, constants.max_subsidy * incomeCategory.multiplier);

  return {
    subsidy: Math.round(subsidy),
    details: `${eligiblePower} kWc × ${constants.subsidy_per_kwc}€ × ${incomeCategory.multiplier} (${incomeCategory.category}) × ${regionalBonus} (bonus régional)`,
  };
}

/**
 * Calculate insulation subsidy
 */
export function calculateInsulationSubsidy(
  surface: number, // m²
  type: 'roof' | 'wall' | 'floor',
  income: number,
  region: Region
): { subsidy: number; details: string } {
  const incomeCategory = determineIncomeCategory(income, region);
  const constants = ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.INSULATION;

  // Get base rate
  const baseRate = constants[type];
  const rate = baseRate * incomeCategory.multiplier;

  // Calculate subsidy
  let subsidy = surface * rate;

  // Apply regional bonus for insulation
  if (region === 'wallonie') {
    subsidy *= ECOLOGIE_CONSTANTS.REGIONAL_BONUSES.wallonie.insulation_bonus;
  }

  // Apply maximum cap
  subsidy = Math.min(subsidy, constants.max_subsidy);

  return {
    subsidy: Math.round(subsidy),
    details: `${surface} m² × ${rate}€/m² (${incomeCategory.category})`,
  };
}

/**
 * Check energy subsidy eligibility
 */
export async function checkEnergySubsidyEligibility(
  request: EnergySubsidyRequest
): Promise<EcologieEligibilityResult> {
  try {
    const results = await energySubsidyEngineInstance.run(request);

    // Check for audit requirement
    const auditRequired = results.events.find(e => e.type === 'audit-required');

    // Check for specific subsidy eligibility
    const subsidyEvent = results.events.find(e =>
      e.type.includes('-eligible')
    );

    if (!subsidyEvent) {
      return {
        isEligible: false,
        reason: 'Type de prime non éligible ou conditions non remplies',
      };
    }

    let subsidyAmount = 0;
    const details: string[] = [];

    // Calculate specific subsidy based on type
    switch (request.type) {
      case 'panneaux-solaires':
        const solarCalc = calculateSolarSubsidy(
          request.estimatedCost / 1500, // Rough estimate of kWc from cost
          request.applicantIncome,
          request.region
        );
        subsidyAmount = solarCalc.subsidy;
        details.push(solarCalc.details);
        break;

      case 'isolation':
        const insulationCalc = calculateInsulationSubsidy(
          150, // Default surface estimate
          'roof',
          request.applicantIncome,
          request.region
        );
        subsidyAmount = insulationCalc.subsidy;
        details.push(insulationCalc.details);
        break;

      case 'pompe-chaleur':
        const incomeCategory = determineIncomeCategory(
          request.applicantIncome,
          request.region
        );
        const heatPumpConstants = ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.HEAT_PUMP;
        subsidyAmount = heatPumpConstants.base_subsidy * incomeCategory.multiplier;
        if (incomeCategory.category !== 'base') {
          subsidyAmount += heatPumpConstants.income_bonus;
        }
        subsidyAmount = Math.min(subsidyAmount, heatPumpConstants.max_subsidy);
        details.push(`Prime forfaitaire: ${subsidyAmount}€ (${incomeCategory.category})`);
        break;

      default:
        subsidyAmount = request.estimatedCost * 0.3; // Default 30% subsidy
    }

    // Check for commercial bonus
    const commercialBonus = results.events.find(e => e.type === 'commercial-bonus');
    if (commercialBonus) {
      subsidyAmount *= commercialBonus.params?.bonusMultiplier || 1;
      details.push('Bonus commercial appliqué: +20%');
    }

    // Check subsidy cap
    const subsidyCap = results.events.find(e => e.type === 'subsidy-cap');
    if (subsidyCap && subsidyAmount > (subsidyCap.params?.maxCumulativeSubsidy ?? 15000)) {
      subsidyAmount = subsidyCap.params?.maxCumulativeSubsidy ?? 15000;
      details.push(`Plafond cumulatif appliqué: ${subsidyAmount}€`);
    }

    const requiredDocuments = [
      'Facture détaillée des travaux',
      'Attestation de conformité de l\'entrepreneur',
      'Photos avant/après travaux',
      'Certificat PEB si applicable',
    ];

    if (auditRequired) {
      requiredDocuments.unshift('Rapport d\'audit énergétique PAE2');
    }

    // Select legal reference based on region
    const legalRef = request.region === 'wallonie'
      ? ECOLOGIE_LEGAL_REFERENCES.wallonie.agw_subsidies
      : request.region === 'flandre'
      ? ECOLOGIE_LEGAL_REFERENCES.flandre.energiebesluit
      : ECOLOGIE_LEGAL_REFERENCES.bruxelles.primes_energie;

    return {
      isEligible: true,
      subsidyAmount: Math.round(subsidyAmount),
      conditions: [
        'Travaux réalisés par entrepreneur agréé',
        'Maintien de la propriété pendant 5 ans',
        'Respect des normes techniques en vigueur',
        ...details,
      ],
      requiredDocuments,
      processingTime: ECOLOGIE_CONSTANTS.PROCESSING_TIMES.subsidy_request,
      legalReference: {
        law: legalRef.title,
        article: 'Chapitre III - Conditions d\'octroi',
        url: legalRef.url,
      },
    };
  } catch (error) {
    throw new Error(`Error checking energy subsidy eligibility: ${error}`);
  }
}

/**
 * Calculate cumulative renovation bonus
 */
export function calculateRenovationBonus(
  works: Array<{ type: EnergySubsidyType; cost: number }>,
  finalPEB: string,
  initialPEB: string
): number {
  let bonus = 0;

  // Bonus for complete renovation (3+ measures)
  if (works.length >= 3) {
    bonus += 1000;
  }

  // Bonus for exceptional performance improvement
  const pebLevels = ['G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const initialIndex = pebLevels.indexOf(initialPEB);
  const finalIndex = pebLevels.indexOf(finalPEB);
  const improvement = initialIndex - finalIndex;

  if (improvement >= 3) {
    bonus += improvement * 500;
  }

  // Bonus for reaching A label
  if (finalPEB === 'A') {
    bonus += 2000;
  }

  return bonus;
}

/**
 * Export energy subsidy rules in JSON format
 */
export const ENERGY_SUBSIDY_RULES_JSON = {
  subsidyTypes: {
    solarPanels: {
      baseRate: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.SOLAR_PANELS.subsidy_per_kwc,
      maxPower: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.SOLAR_PANELS.max_power,
      maxSubsidy: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.SOLAR_PANELS.max_subsidy,
    },
    heatPump: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.HEAT_PUMP,
    insulation: ECOLOGIE_CONSTANTS.ENERGY_SUBSIDIES.INSULATION,
  },
  incomeCategories: {
    précaire: { threshold: 23000, multiplier: 2.0 },
    modeste: { threshold: 35000, multiplier: 1.5 },
    base: { threshold: 'above 35000', multiplier: 1.0 },
  },
  regionalBonuses: ECOLOGIE_CONSTANTS.REGIONAL_BONUSES,
  processingTime: `${ECOLOGIE_CONSTANTS.PROCESSING_TIMES.subsidy_request} days`,
  legalFramework: {
    wallonie: ECOLOGIE_LEGAL_REFERENCES.wallonie.agw_subsidies,
    flandre: ECOLOGIE_LEGAL_REFERENCES.flandre.energiebesluit,
    bruxelles: ECOLOGIE_LEGAL_REFERENCES.bruxelles.primes_energie,
  },
};