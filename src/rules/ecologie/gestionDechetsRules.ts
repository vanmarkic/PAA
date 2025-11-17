/**
 * Business Rules for Waste Management and Recycling
 *
 * BASE JURIDIQUE:
 * - Directive 2008/98/CE relative aux déchets (Directive-cadre déchets)
 *   https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32008L0098
 * - Décret wallon du 27 juin 1996 relatif aux déchets
 *   https://wallex.wallonie.be/eli/decret/1996/06/27/1996027438
 * - VLAREMA (Vlaams Reglement voor Afvalstoffenbeheer)
 *   https://navigator.emis.vito.be/mijn-navigator?woId=75692
 * - Ordonnance du 14 juin 2012 relative aux déchets (Bruxelles)
 *   http://www.ejustice.just.fgov.be/eli/ordonnance/2012/06/14/2012031319
 */

import { Engine } from 'json-rules-engine';
import {
  WasteCategory,
  WastePermitApplication,
  EcologieEligibilityResult,
  Region,
  ECOLOGIE_CONSTANTS,
  ECOLOGIE_LEGAL_REFERENCES,
} from '../../domain/ecologieTypes';

interface WasteManagementFacts {
  wasteType: WasteCategory;
  annualVolume: number; // tons
  treatmentMethod: string;
  hasStorageFacility: boolean;
  storageCapacity: number; // tons
  hasTransportLicense: boolean;
  isHazardous: boolean;
  recyclingRate: number; // percentage
  region: Region;
  applicantType: 'particulier' | 'entreprise' | 'collectivité';
  employeeCount?: number;
  wasteFlows?: string[];
}

/**
 * Create waste management rules engine
 */
function createWasteManagementEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Hazardous waste special requirements
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'wasteType',
          operator: 'equal',
          value: 'déchets-dangereux',
        },
      ],
    },
    event: {
      type: 'hazardous-waste-permit',
      params: {
        requirements: [
          'Autorisation ADR pour le transport',
          'Plan de gestion des risques',
          'Formation du personnel spécialisée',
          'Système de traçabilité complet',
          'Assurance responsabilité civile environnementale',
          'Audit de sécurité annuel',
        ],
        inspectionFrequency: 'trimestrielle',
        priority: 20,
      },
    },
    priority: 20,
  });

  // Rule 2: Large volume waste processing
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'annualVolume',
          operator: 'greaterThan',
          value: 5000, // tons/year
        },
      ],
    },
    event: {
      type: 'large-volume-processing',
      params: {
        permitClass: 'classe-B',
        requirements: [
          'Étude d\'incidences environnementales',
          'Plan de gestion des déchets détaillé',
          'Garantie financière de 100000€',
          'Certificat de capacité technique',
          'Enquête publique obligatoire',
        ],
        processingTime: 180,
        priority: 15,
      },
    },
    priority: 15,
  });

  // Rule 3: Electronic waste (DEEE) specific rules
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'wasteType',
          operator: 'equal',
          value: 'déchets-électroniques',
        },
      ],
    },
    event: {
      type: 'deee-processing',
      params: {
        requirements: [
          'Contrat avec organisme agréé (Recupel)',
          'Système de dépollution conforme',
          'Traçabilité complète des composants',
          'Taux de recyclage minimum 65%',
          'Certification ISO 14001 ou équivalent',
          'Formation du personnel à la dépollution',
        ],
        auditFrequency: 'annuelle',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 4: Composting facility requirements
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'treatmentMethod',
          operator: 'equal',
          value: 'compostage',
        },
        {
          fact: 'annualVolume',
          operator: 'greaterThan',
          value: 100,
        },
      ],
    },
    event: {
      type: 'composting-facility',
      params: {
        requirements: [
          'Analyse de la qualité du compost',
          'Gestion des odeurs et lixiviats',
          'Formation de maîtres-composteurs',
          'Plan de valorisation du compost',
          'Contrôle de la température et humidité',
        ],
        subsidy: 0.6, // 60% subsidy available
        priority: 5,
      },
    },
    priority: 5,
  });

  // Rule 5: Mandatory 5-stream sorting for businesses
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'applicantType',
          operator: 'equal',
          value: 'entreprise',
        },
        {
          fact: 'employeeCount',
          operator: 'greaterThan',
          value: 20,
        },
      ],
    },
    event: {
      type: 'mandatory-sorting',
      params: {
        streams: ['papier', 'PMC', 'verre', 'organique', 'résiduel'],
        requirements: [
          'Conteneurs séparés pour chaque flux',
          'Signalétique claire et visible',
          'Registre des déchets obligatoire',
          'Déclaration annuelle des flux',
          'Formation du personnel au tri',
        ],
        penalty: 500, // EUR per missing stream
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 6: Recycling center authorization
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'treatmentMethod',
          operator: 'equal',
          value: 'recyclage',
        },
        {
          fact: 'hasStorageFacility',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'recycling-center',
      params: {
        requirements: [
          'Plan de prévention incendie',
          'Système de pesage certifié',
          'Aire de stockage imperméabilisée',
          'Séparation des flux de matériaux',
          'Accès contrôlé et sécurisé',
        ],
        minimumRecyclingRate: 70,
        priority: 7,
      },
    },
    priority: 7,
  });

  return engine;
}

const wasteManagementEngineInstance = createWasteManagementEngine();

/**
 * Calculate waste management tax
 */
export function calculateWasteTax(
  wasteType: WasteCategory,
  volume: number, // tons
  applicantType: 'particulier' | 'entreprise' | 'collectivité'
): {
  tax: number;
  details: string;
} {
  const baseFees = ECOLOGIE_CONSTANTS.WASTE_FEES;

  let rate = 0;
  switch (wasteType) {
    case 'déchets-ménagers':
      rate = baseFees.household / 12; // Convert annual to per ton estimate
      break;
    case 'déchets-dangereux':
      rate = baseFees.dangerous;
      break;
    case 'déchets-électroniques':
      rate = baseFees.electronic * 10; // Convert per unit to per ton estimate
      break;
    case 'déchets-industriels':
      rate = baseFees.industrial;
      break;
    case 'déchets-inertes':
      rate = baseFees.industrial * 0.5; // 50% of industrial rate
      break;
    case 'déchets-médicaux':
      rate = baseFees.dangerous * 1.5; // 150% of dangerous rate
      break;
    default:
      rate = baseFees.industrial;
  }

  // Apply reductions for public entities
  if (applicantType === 'collectivité') {
    rate *= 0.7; // 30% reduction
  }

  // Volume discount for large quantities
  if (volume > 1000) {
    rate *= 0.9; // 10% discount
  } else if (volume > 5000) {
    rate *= 0.85; // 15% discount
  }

  const tax = Math.round(volume * rate);

  return {
    tax,
    details: `${volume} tonnes × ${rate}€/tonne${applicantType === 'collectivité' ? ' (réduction collectivité)' : ''}`,
  };
}

/**
 * Check waste permit eligibility
 */
export async function checkWastePermitEligibility(
  application: WastePermitApplication
): Promise<EcologieEligibilityResult> {
  try {
    const facts: WasteManagementFacts = {
      wasteType: application.wasteType,
      annualVolume: application.annualVolume,
      treatmentMethod: application.treatmentMethod,
      hasStorageFacility: application.storageCapacity > 0,
      storageCapacity: application.storageCapacity,
      hasTransportLicense: !!application.transportLicense,
      isHazardous: application.wasteType === 'déchets-dangereux' ||
                   application.wasteType === 'déchets-médicaux',
      recyclingRate: 0, // Default, would be calculated based on treatment method
      region: application.region,
      applicantType: application.applicantType,
    };

    const results = await wasteManagementEngineInstance.run(facts);

    // Collect all requirements from triggered rules
    const requirements: string[] = [];
    let processingTime = ECOLOGIE_CONSTANTS.PROCESSING_TIMES.simple_permit;
    let permitRequired = true;

    results.events.forEach(event => {
      if (event.params?.requirements) {
        requirements.push(...event.params.requirements);
      }
      if (event.params?.processingTime) {
        processingTime = Math.max(processingTime, event.params.processingTime);
      }
    });

    // Check for hazardous waste
    const hazardousEvent = results.events.find(e => e.type === 'hazardous-waste-permit');
    if (hazardousEvent) {
      requirements.push('Conseiller ADR certifié obligatoire');
    }

    // Check for large volume
    const largeVolumeEvent = results.events.find(e => e.type === 'large-volume-processing');
    if (largeVolumeEvent) {
      processingTime = largeVolumeEvent.params?.processingTime || 180;
    }

    // Small volumes may not need permit
    if (application.annualVolume < 10 && application.applicantType === 'particulier') {
      permitRequired = false;
      return {
        isEligible: true,
        reason: 'Volume faible - déclaration simple suffisante',
        processingTime: 15,
      };
    }

    // Calculate tax
    const taxInfo = calculateWasteTax(
      application.wasteType,
      application.annualVolume,
      application.applicantType
    );

    // Select legal reference based on region
    const legalRef = application.region === 'wallonie'
      ? {
          title: 'Décret wallon du 27 juin 1996 relatif aux déchets',
          url: 'https://wallex.wallonie.be/eli/decret/1996/06/27/1996027438',
        }
      : application.region === 'flandre'
      ? {
          title: 'VLAREMA',
          url: 'https://navigator.emis.vito.be/mijn-navigator?woId=75692',
        }
      : {
          title: 'Ordonnance du 14 juin 2012 relative aux déchets',
          url: 'http://www.ejustice.just.fgov.be/eli/ordonnance/2012/06/14/2012031319',
        };

    return {
      isEligible: true,
      requiredDocuments: requirements,
      processingTime,
      conditions: [
        'Respect de la hiérarchie des déchets',
        'Tenue d\'un registre des déchets',
        'Déclaration annuelle obligatoire',
        `Taxe annuelle: ${taxInfo.tax}€`,
        'Contrôle périodique par organisme agréé',
      ],
      legalReference: {
        law: legalRef.title,
        article: 'Chapitre III - Autorisations et agréments',
        url: legalRef.url,
      },
    };
  } catch (error) {
    throw new Error(`Error checking waste permit eligibility: ${error}`);
  }
}

/**
 * Calculate composting subsidy
 */
export function calculateCompostingSubsidy(
  type: 'individuel' | 'collectif' | 'entreprise',
  capacity: number, // liters for individual, tons/year for collective
  cost: number
): {
  subsidy: number;
  percentage: number;
  maxAmount: number;
} {
  let percentage = 0;
  let maxAmount = 0;

  switch (type) {
    case 'individuel':
      percentage = 0.5; // 50%
      maxAmount = 50;
      break;
    case 'collectif':
      percentage = 0.6; // 60%
      maxAmount = 5000;
      break;
    case 'entreprise':
      percentage = 0.4; // 40%
      maxAmount = 10000;
      break;
  }

  const subsidy = Math.min(cost * percentage, maxAmount);

  return {
    subsidy: Math.round(subsidy),
    percentage: percentage * 100,
    maxAmount,
  };
}

/**
 * Determine waste collection frequency
 */
export function determineCollectionFrequency(
  wasteType: WasteCategory,
  volume: number, // m³/week
  season: 'été' | 'hiver'
): {
  frequency: string;
  justification: string;
} {
  if (wasteType === 'déchets-ménagers') {
    if (volume > 10 || season === 'été') {
      return {
        frequency: 'bi-hebdomadaire',
        justification: 'Volume important ou période estivale',
      };
    }
    return {
      frequency: 'hebdomadaire',
      justification: 'Fréquence standard',
    };
  }

  if (wasteType === 'déchets-dangereux' || wasteType === 'déchets-médicaux') {
    return {
      frequency: 'hebdomadaire',
      justification: 'Déchets dangereux - collecte fréquente obligatoire',
    };
  }

  if (wasteType === 'déchets-électroniques') {
    return {
      frequency: 'mensuelle',
      justification: 'Collecte DEEE programmée',
    };
  }

  return {
    frequency: 'hebdomadaire',
    justification: 'Fréquence par défaut',
  };
}

/**
 * Export waste management rules in JSON format
 */
export const WASTE_MANAGEMENT_RULES_JSON = {
  wasteHierarchy: [
    'Prévention',
    'Réutilisation',
    'Recyclage',
    'Valorisation énergétique',
    'Élimination',
  ],
  mandatorySorting: {
    businesses: {
      threshold: '20+ employés',
      streams: ['papier', 'PMC', 'verre', 'organique', 'résiduel'],
      penalty: '500€ par flux manquant',
    },
  },
  recyclingTargets: {
    municipal: '65% by 2035',
    packaging: '70% by 2030',
    electronic: '65% minimum',
    construction: '70% minimum',
  },
  fees: ECOLOGIE_CONSTANTS.WASTE_FEES,
  legalFramework: {
    eu: ECOLOGIE_LEGAL_REFERENCES.europe.directive_waste,
    regional: {
      wallonie: 'Décret du 27 juin 1996',
      flandre: 'VLAREMA',
      bruxelles: 'Ordonnance du 14 juin 2012',
    },
  },
};