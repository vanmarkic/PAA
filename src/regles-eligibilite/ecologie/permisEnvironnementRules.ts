/**
 * Business Rules for Environmental Permits
 *
 * BASE JURIDIQUE:
 * - Directive 2010/75/UE relative aux émissions industrielles (IED)
 *   https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32010L0075
 * - Code de l'Environnement wallon - Livre Ier
 *   http://environnement.wallonie.be/legis/Codeenvironnement/codeLIEnvDispcommunesintro.htm
 * - VLAREM I & II (Flandre)
 *   https://navigator.emis.vito.be/mijn-navigator?woId=75690
 * - Ordonnance du 5 juin 1997 relative aux permis d'environnement (Bruxelles)
 *   http://www.ejustice.just.fgov.be/eli/ordonnance/1997/06/05/1997031238
 */

import { Engine } from 'json-rules-engine';
import {
  PermitType,
  Region,
  EcologieEligibilityResult,
  EmissionPermit,
  ECOLOGIE_CONSTANTS,
  ECOLOGIE_LEGAL_REFERENCES,
} from '../modele-metier/ecologieTypes';

interface PermitApplication {
  facilityType: string;
  power: number; // kW
  emissions: {
    CO2: number; // tons/year
    NOx?: number; // kg/year
    SO2?: number; // kg/year
  };
  region: Region;
  natura2000: boolean;
  seveso: 'non' | 'seuil-bas' | 'seuil-haut';
  surface: number; // m²
  dangerousSubstances: number; // tons
}

/**
 * Create the environmental permit rules engine
 */
function createPermitEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Class 1 - Major environmental impact
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'power',
          operator: 'greaterThan',
          value: 1000, // kW
        },
        {
          fact: 'emissions.CO2',
          operator: 'greaterThan',
          value: 50, // tons/year
        },
        {
          fact: 'seveso',
          operator: 'in',
          value: ['seuil-bas', 'seuil-haut'],
        },
      ],
    },
    event: {
      type: 'permit-class-1',
      params: {
        permitType: 'classe-1' as PermitType,
        requirements: [
          'Étude d\'incidences environnementales complète',
          'Enquête publique obligatoire (30 jours)',
          'Application des Meilleures Techniques Disponibles (MTD)',
          'Plan de surveillance environnemental',
          'Garantie financière',
        ],
        processingTime: 90,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Class 2 - Moderate environmental impact
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'power',
          operator: 'greaterThan',
          value: 100,
        },
        {
          fact: 'power',
          operator: 'lessThanInclusive',
          value: 1000,
        },
        {
          fact: 'emissions.CO2',
          operator: 'lessThanInclusive',
          value: 50,
        },
        {
          fact: 'seveso',
          operator: 'equal',
          value: 'non',
        },
      ],
    },
    event: {
      type: 'permit-class-2',
      params: {
        permitType: 'classe-2' as PermitType,
        requirements: [
          'Notice d\'évaluation des incidences',
          'Consultation publique simplifiée',
          'Respect des conditions sectorielles',
          'Rapport annuel simplifié',
        ],
        processingTime: 60,
        priority: 5,
      },
    },
    priority: 5,
  });

  // Rule 3: Class 3 - Low environmental impact (declaration)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'power',
          operator: 'lessThanInclusive',
          value: 100,
        },
        {
          fact: 'emissions.CO2',
          operator: 'lessThan',
          value: 10,
        },
        {
          fact: 'surface',
          operator: 'lessThan',
          value: 500,
        },
        {
          fact: 'seveso',
          operator: 'equal',
          value: 'non',
        },
      ],
    },
    event: {
      type: 'permit-class-3',
      params: {
        permitType: 'classe-3' as PermitType,
        requirements: [
          'Déclaration environnementale simple',
          'Respect des conditions générales',
          'Récépissé automatique sous 30 jours',
        ],
        processingTime: 30,
        priority: 1,
      },
    },
    priority: 1,
  });

  // Rule 4: Natura 2000 - Additional requirements
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'natura2000',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'natura2000-requirements',
      params: {
        additionalRequirements: [
          'Évaluation appropriée des incidences Natura 2000',
          'Inventaire faune-flore sur 4 saisons',
          'Mesures compensatoires obligatoires',
          'Avis du Département Nature et Forêts requis',
        ],
        canRefuse: true,
        priority: 15,
      },
    },
    priority: 15,
  });

  // Rule 5: Seveso establishments
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'seveso',
          operator: 'equal',
          value: 'seuil-haut',
        },
      ],
    },
    event: {
      type: 'seveso-high-threshold',
      params: {
        specialRequirements: [
          'Rapport de sécurité détaillé',
          'Plan d\'urgence interne (PUI)',
          'Plan particulier d\'intervention (PPI)',
          'Zone de protection définie',
          'Inspection annuelle obligatoire',
          'Assurance responsabilité civile spécifique',
        ],
        priority: 20,
      },
    },
    priority: 20,
  });

  return engine;
}

/**
 * Singleton instance of the permit rules engine
 */
const permitEngineInstance = createPermitEngine();

/**
 * Calculate financial guarantee based on risk
 */
export function calculateFinancialGuarantee(
  permitType: PermitType,
  riskLevel: 'faible' | 'modéré' | 'élevé',
  seveso: string
): number {
  const baseAmounts = {
    'classe-1': { faible: 20000, modéré: 30000, élevé: 50000 },
    'classe-2': { faible: 5000, modéré: 10000, élevé: 20000 },
    'classe-3': { faible: 0, modéré: 0, élevé: 0 },
    'unique': { faible: 15000, modéré: 25000, élevé: 40000 },
    'environnement': { faible: 10000, modéré: 20000, élevé: 30000 },
    'declassé': { faible: 0, modéré: 0, élevé: 0 },
  };

  let amount = baseAmounts[permitType][riskLevel];

  // Seveso multiplier
  if (seveso === 'seuil-bas') amount *= 1.5;
  if (seveso === 'seuil-haut') amount *= 2;

  return Math.round(amount);
}

/**
 * Check environmental permit eligibility
 */
export async function checkEnvironmentalPermitEligibility(
  application: PermitApplication
): Promise<EcologieEligibilityResult> {
  try {
    const facts = {
      ...application,
      'emissions.CO2': application.emissions.CO2,
      'emissions.NOx': application.emissions.NOx || 0,
      'emissions.SO2': application.emissions.SO2 || 0,
    };

    const results = await permitEngineInstance.run(facts);

    // Process events to determine permit type and requirements
    const events = results.events;

    // Check for Natura 2000 blocking
    const natura2000Event = events.find(e => e.type === 'natura2000-requirements');
    if (natura2000Event && application.natura2000) {
      // Special evaluation needed
      const impactTooHigh = application.power > 500 || application.emissions.CO2 > 25;
      if (impactTooHigh) {
        return {
          isEligible: false,
          reason: 'Impact inacceptable sur zone Natura 2000 - mesures compensatoires insuffisantes',
          legalReference: {
            law: 'Directive Habitats 92/43/CEE',
            article: 'Article 6.3 et 6.4',
            url: ECOLOGIE_LEGAL_REFERENCES.europe.directive_habitats.url,
          },
        };
      }
    }

    // Find the main permit class
    const permitEvent = events.find(e =>
      e.type.startsWith('permit-class') ||
      e.type === 'seveso-high-threshold'
    );

    if (permitEvent) {
      const params = permitEvent.params as any;
      const requirements: string[] = params.requirements || [];

      // Add additional requirements from other events
      events.forEach(event => {
        if (event.params?.additionalRequirements) {
          requirements.push(...event.params.additionalRequirements);
        }
        if (event.params?.specialRequirements) {
          requirements.push(...event.params.specialRequirements);
        }
      });

      // Calculate guarantee
      const riskLevel = application.seveso === 'seuil-haut' ? 'élevé' :
                        application.seveso === 'seuil-bas' ? 'modéré' : 'faible';
      const guarantee = calculateFinancialGuarantee(
        params.permitType || 'environnement',
        riskLevel,
        application.seveso
      );

      // Select appropriate legal reference based on region
      const legalRef = application.region === 'wallonie'
        ? ECOLOGIE_LEGAL_REFERENCES.wallonie.decret_permis
        : application.region === 'flandre'
        ? ECOLOGIE_LEGAL_REFERENCES.flandre.vlarem_i
        : ECOLOGIE_LEGAL_REFERENCES.bruxelles.ordonnance_permis;

      return {
        isEligible: true,
        permitType: params.permitType,
        requiredDocuments: requirements,
        processingTime: params.processingTime,
        conditions: [
          `Garantie financière: ${guarantee}€`,
          'Respect permanent des normes d\'émission',
          'Contrôle annuel par organisme agréé',
          'Déclaration annuelle des émissions',
        ],
        legalReference: {
          law: legalRef.title,
          article: 'Titre II - Classification des installations',
          url: legalRef.url,
        },
      };
    }

    return {
      isEligible: false,
      reason: 'Installation non classée - pas de permis requis',
    };
  } catch (error) {
    throw new Error(`Error checking permit eligibility: ${error}`);
  }
}

/**
 * Determine monitoring frequency based on permit type
 */
export function determineMonitoringFrequency(
  permitType: PermitType,
  seveso: string
): {
  emissions: string;
  waste: string;
  water: string;
  inspection: string;
} {
  if (seveso === 'seuil-haut') {
    return {
      emissions: 'continue',
      waste: 'mensuelle',
      water: 'hebdomadaire',
      inspection: 'trimestrielle',
    };
  }

  if (permitType === 'classe-1') {
    return {
      emissions: 'mensuelle',
      waste: 'trimestrielle',
      water: 'mensuelle',
      inspection: 'annuelle',
    };
  }

  if (permitType === 'classe-2') {
    return {
      emissions: 'trimestrielle',
      waste: 'semestrielle',
      water: 'trimestrielle',
      inspection: 'bisannuelle',
    };
  }

  return {
    emissions: 'annuelle',
    waste: 'annuelle',
    water: 'semestrielle',
    inspection: 'quinquennale',
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const PERMIT_RULES_JSON = {
  classification: {
    class1: {
      criteria: 'Power > 1000 kW OR CO2 > 50 t/year OR Seveso',
      processingTime: '90 days',
      publicInquiry: 'Required (30 days)',
      environmentalStudy: 'Full EIA required',
    },
    class2: {
      criteria: '100 < Power ≤ 1000 kW AND CO2 ≤ 50 t/year',
      processingTime: '60 days',
      publicInquiry: 'Simplified consultation',
      environmentalStudy: 'Impact notice',
    },
    class3: {
      criteria: 'Power ≤ 100 kW AND CO2 < 10 t/year',
      processingTime: '30 days',
      publicInquiry: 'Not required',
      environmentalStudy: 'Simple declaration',
    },
  },
  emissionLimits: ECOLOGIE_CONSTANTS.EMISSION_LIMITS,
  legalFramework: {
    eu: ECOLOGIE_LEGAL_REFERENCES.europe.directive_ied,
    regional: {
      wallonie: ECOLOGIE_LEGAL_REFERENCES.wallonie.decret_permis,
      flandre: ECOLOGIE_LEGAL_REFERENCES.flandre.vlarem_ii,
      bruxelles: ECOLOGIE_LEGAL_REFERENCES.bruxelles.ordonnance_permis,
    },
  },
};