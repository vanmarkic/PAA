/**
 * Script to generate rules files for all machines
 *
 * This script generates basic rule structures for machines that don't have rules yet.
 */

import * as fs from 'fs';
import * as path from 'path';

// Machines that already have rules
const EXISTING_RULES = [
  'ris',
  'agr',
  'allocationsFamiliales',
  'allocationsChomage',
  'primeNaissance',
  'allocationHandicapes',
  'grapa',
  'aideLogement',
  'creditImpot',
];

// Machine registry from workflows/index.ts
const MACHINES = [
  // Social Benefits
  'pensionRetraite',
  'pensionSurvie',
  'allocationIntegration',
  'aideSociale',
  'assuranceMaladie',
  'congeParental',
  'congeMaternite',
  'allocationsEtudes',
  'bourseEtudes',
  'garantieLocative',
  'aidePersonnesAgees',
  'gardeEnfants',
  'carteMedicale',
  'aideJuridique',
  'fondsSecuriteExistence',
  'allocationChauffage',
  'tarifSocialEnergie',
  'abonnementSocialTransport',
  'revenuCadastralExoneration',

  // Fiscal Rights
  'deductionHabitation',
  'deductionInvestissement',
  'reductionEpargnePension',
  'chequesRepas',
  'ecoCheque',
  'avantagesNature',
  'tvaReduite',
  'exonerationPrecompte',
  'bonusLogement',
  'deductionFraisGarde',
  'creditImpotServiceLocal',
  'quotientConjugal',
  'renteAlimentaire',
  'deductionDons',
  'fraisProfessionnels',
  'deductionVehiculeElectrique',
  'primeRenovation',
  'deductionIsolation',
  'creditImpotInvestissementDurable',
  'exonerationPlusValue',
  'deductionEmpruntHypothecaire',
  'abattementSuccession',
  'droitsDonationReduits',
  'exonerationRevenusMobiliers',

  // Social Services
  'logementSocial',
  'inscriptionEcole',
  'repasScolairesGratuits',
  'transportScolaire',
  'aideAlimentaire',
  'banqueAlimentaire',
  'restaurantsSociaux',
  'mediationDettes',
  'budgetEnergetique',
  'fondsCreances',
  'protectionJuridique',
  'accompagnementSocial',
  'insertionProfessionnelle',
  'formationProfessionnelle',
  'servicePublicEmploi',
  'aideMobilite',
  'soinsSanteMentale',
  'aideSansAbri',
  'centreAccueil',
  'mediationFamiliale',
  'aideVictimes',
  'protectionEnfance',
  'teleAssistance',
  'aideMenagere',
  'repasDomicile',

  // Employment Rights
  'contratTravail',
  'preavis',
  'licenciement',
  'demission',
  'creditTemps',
  'congeMaladie',
  'accidentTravail',
  'maladieProfessionnelle',
  'harcelementTravail',
  'discriminationEmploi',
  'egaliteSalariale',
  'travailEtudiant',
  'stage',
  'flexiJob',
  'travailInterimaire',
  'contratDureeDeterminee',
  'contratDureeIndeterminee',
  'tempsPartiel',
  'horaireFlexible',
  'teletravail',
  'droitGreve',
  'representationSyndicale',
  'formationEntreprise',
  'outplacement',
  'pensionComplementaire',
];

/**
 * Generate a rules file template for a machine
 */
function generateRulesFile(machineName: string, category: string): string {
  const className = machineName
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const functionName = machineName.charAt(0).toLowerCase() + machineName.slice(1);

  return `/**
 * Business Rules for ${className}
 *
 * Implements eligibility rules for ${className}.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

/**
 * Create the ${className} eligibility rules engine
 */
function create${className}Engine(): Engine {
  const engine = new Engine();

  // Rule 1: Basic eligibility check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'meetsBasicConditions',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: '${functionName}-eligible',
      params: {
        message: 'Éligible pour ${className}',
      },
    },
    priority: 5,
  });

  // Rule 2: Ineligibility check
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'meetsBasicConditions',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: '${functionName}-ineligible',
      params: {
        reason: 'conditions de base non remplies',
        priority: 10,
      },
    },
    priority: 10,
  });

  return engine;
}

/**
 * Singleton instance of the ${className} rules engine
 */
const ${functionName}EngineInstance = create${className}Engine();

/**
 * Calculate ${className} amount
 */
export function calculate${className}Amount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check ${className} eligibility
 */
export async function check${className}Eligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await ${functionName}EngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === '${functionName}-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === '${functionName}-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'housing-allowance', // To be updated with correct type
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent) {
      return {
        benefitType: 'housing-allowance', // To be updated with correct type
        isEligible: true,
        calculatedAmount: 0,
      };
    }

    return {
      benefitType: 'housing-allowance', // To be updated with correct type
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(\`Error checking ${className} eligibility: \${error}\`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const ${machineName.toUpperCase()}_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: '${functionName}-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
`;
}

/**
 * Main function to generate all rules files
 */
function main() {
  const rulesDir = path.join(__dirname, '../src/rules');
  
  // Ensure directory exists
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
  }

  let generated = 0;
  let skipped = 0;

  for (const machine of MACHINES) {
    const fileName = `${machine}Rules.ts`;
    const filePath = path.join(rulesDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`Skipping ${fileName} (already exists)`);
      skipped++;
      continue;
    }

    // Skip if rules already exist
    if (EXISTING_RULES.includes(machine)) {
      console.log(`Skipping ${fileName} (rules already exist)`);
      skipped++;
      continue;
    }

    // Determine category (simplified)
    let category = 'social_benefits';
    if (machine.includes('credit') || machine.includes('deduction') || machine.includes('exoneration') || machine.includes('fiscal')) {
      category = 'fiscal_rights';
    } else if (machine.includes('contrat') || machine.includes('licenciement') || machine.includes('travail') || machine.includes('conge')) {
      category = 'employment_rights';
    } else if (machine.includes('logement') || machine.includes('aide') || machine.includes('service')) {
      category = 'social_services';
    }

    const content = generateRulesFile(machine, category);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Generated ${fileName}`);
    generated++;
  }

  console.log(`\nGeneration complete:`);
  console.log(`  Generated: ${generated} files`);
  console.log(`  Skipped: ${skipped} files`);
}

if (require.main === module) {
  main();
}

export { generateRulesFile };

