/**
 * Business Rules for Asylum and International Protection in Belgium
 *
 * BASE JURIDIQUE:
 * - Convention de Genève du 28 juillet 1951 relative au statut des réfugiés
 * - Loi du 15 décembre 1980, articles 48/3 à 48/5 (protection internationale)
 * - Directive 2011/95/UE (Directive Qualification)
 * - Directive 2013/32/UE (Directive Procédures)
 * - Règlement Dublin III (UE) n° 604/2013
 *
 * AUTORITÉS COMPÉTENTES:
 * - Office des Étrangers (OE) - Enregistrement
 * - Commissariat général aux réfugiés et aux apatrides (CGRA) - Décision
 * - Conseil du Contentieux des Étrangers (CCE) - Recours
 */

import { Engine } from 'json-rules-engine';
import {
  ForeignerProfile,
  AsylumApplication,
  AsylumStatus,
  EligibilityResult,
  RequirementCheck,
  PROCESSING_TIMES,
} from '../../domain/etrangersTypes';

/**
 * Create rules engine for asylum procedures
 */
function createAsylumEngine(): Engine {
  const engine = new Engine();

  // Rule: Dublin III regulation check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasEurodacHit',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'responsibleCountry',
          operator: 'notEqual',
          value: 'belgium',
        },
      ],
    },
    event: {
      type: 'dublin-transfer',
      params: {
        reason: 'Un autre pays européen est responsable (Règlement Dublin III)',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule: Refugee status criteria (Convention de Genève)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasFearOfPersecution',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'persecutionReason',
          operator: 'in',
          value: ['race', 'religion', 'nationality', 'political-opinion', 'social-group'],
        },
        {
          fact: 'cannotReturnSafely',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isCredible',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'refugee-eligible',
      params: {
        message: 'Éligible au statut de réfugié (Convention de Genève)',
        protection: 'refugee-status',
      },
    },
    priority: 9,
  });

  // Rule: Subsidiary protection criteria
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasRiskOfSeriousHarm',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'harmType',
          operator: 'in',
          value: ['death-penalty', 'torture', 'indiscriminate-violence'],
        },
        {
          fact: 'cannotReturnSafely',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'subsidiary-protection-eligible',
      params: {
        message: 'Éligible à la protection subsidiaire',
        protection: 'subsidiary-protection',
      },
    },
    priority: 8,
  });

  // Rule: Manifestly unfounded application
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'previousApplications',
          operator: 'greaterThan',
          value: 2,
        },
        {
          fact: 'safeCountryOfOrigin',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasCommittedSeriousCrime',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'manifestly-unfounded',
      params: {
        reason: 'Demande manifestement infondée',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule: Vulnerable applicant special procedures
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'isUnaccompaniedMinor',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasTortureSigns',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasMentalHealthIssues',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isPregnant',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'vulnerable-applicant',
      params: {
        message: 'Demandeur vulnérable - procédures spéciales requises',
        specialProcedures: true,
      },
    },
    priority: 9,
  });

  // Rule: Exclusion clauses
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasCommittedWarCrime',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasCommittedCrimeAgainstHumanity',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasCommittedTerrorism',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'excluded-from-protection',
      params: {
        reason: 'Exclu de la protection internationale (crimes graves)',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule: Safe third country
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasTransitedSafeCountry',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'couldHaveAppliedThere',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'safe-third-country',
      params: {
        reason: 'Pays tiers sûr - aurait pu demander protection ailleurs',
        priority: 8,
      },
    },
    priority: 8,
  });

  return engine;
}

const asylumEngineInstance = createAsylumEngine();

/**
 * Check asylum eligibility
 */
export async function checkAsylumEligibility(
  profile: ForeignerProfile,
  application: AsylumApplication
): Promise<EligibilityResult> {
  const facts = {
    hasEurodacHit: false, // Would be checked against Eurodac database
    responsibleCountry: 'belgium', // Would be determined by Dublin check
    hasFearOfPersecution: !!application.fearOfPersecution,
    persecutionReason: determinePersecutionReason(application.fearOfPersecution),
    cannotReturnSafely: true, // Would be assessed based on country situation
    isCredible: true, // Would be assessed during interview
    hasRiskOfSeriousHarm: checkSeriousHarm(application.countryOfPersecution),
    harmType: determineHarmType(application.fearOfPersecution),
    previousApplications: countPreviousApplications(profile),
    safeCountryOfOrigin: isFromSafeCountry(application.countryOfPersecution),
    hasCommittedSeriousCrime: profile.hasConvictions,
    isUnaccompaniedMinor: calculateAge(profile.dateOfBirth) < 18 && profile.familyMembers.length === 0,
    hasTortureSigns: application.vulnerabilities.includes('torture'),
    hasMentalHealthIssues: application.vulnerabilities.includes('mental-health'),
    isPregnant: application.vulnerabilities.includes('pregnant'),
    hasCommittedWarCrime: false, // Would be checked against databases
    hasCommittedCrimeAgainstHumanity: false,
    hasCommittedTerrorism: false,
    hasTransitedSafeCountry: false, // Would be checked from travel history
    couldHaveAppliedThere: false,
  };

  try {
    const results = await asylumEngineInstance.run(facts);

    // Check for exclusion or inadmissibility
    const excludedEvent = results.events.find((e) =>
      ['dublin-transfer', 'manifestly-unfounded', 'excluded-from-protection', 'safe-third-country'].includes(e.type)
    );

    if (excludedEvent) {
      return {
        isEligible: false,
        procedure: 'asylum',
        requirements: [],
        warnings: [excludedEvent.params?.reason],
        alternativeProcedures: getAlternativeProcedures(excludedEvent.type),
      };
    }

    // Check for protection eligibility
    const protectionEvent = results.events.find((e) =>
      ['refugee-eligible', 'subsidiary-protection-eligible'].includes(e.type)
    );

    if (protectionEvent) {
      const isVulnerable = results.events.some((e) => e.type === 'vulnerable-applicant');
      const requirements = getAsylumRequirements(application.applicationType);
      const processingTime = getAsylumProcessingTime(application.applicationType, isVulnerable);

      return {
        isEligible: true,
        procedure: 'asylum',
        requirements,
        estimatedProcessingTime: processingTime,
        nextSteps: getAsylumNextSteps(protectionEvent.params?.protection, isVulnerable),
        warnings: isVulnerable ? ['Procédures spéciales pour demandeur vulnérable'] : undefined,
      };
    }

    return {
      isEligible: false,
      procedure: 'asylum',
      requirements: [],
      warnings: ['Conditions de protection internationale non remplies'],
      alternativeProcedures: ['Régularisation 9bis', 'Régularisation 9ter médicale'],
    };
  } catch (error) {
    throw new Error(`Error checking asylum eligibility: ${error}`);
  }
}

/**
 * Helper functions
 */
function calculateAge(dateOfBirth: Date): number {
  return Math.floor((Date.now() - dateOfBirth.getTime()) / (365 * 24 * 60 * 60 * 1000));
}

function determinePersecutionReason(fearDescription: string): string {
  // Simplified - would use NLP or structured input
  const reasons = ['race', 'religion', 'nationality', 'political-opinion', 'social-group'];
  return reasons[0]; // Default to first reason
}

function checkSeriousHarm(country: string): boolean {
  // Would check against country reports
  const conflictCountries = ['syria', 'afghanistan', 'yemen', 'somalia'];
  return conflictCountries.includes(country.toLowerCase());
}

function determineHarmType(fearDescription: string): string {
  // Simplified categorization
  if (fearDescription.includes('death') || fearDescription.includes('execution')) {
    return 'death-penalty';
  }
  if (fearDescription.includes('torture') || fearDescription.includes('inhuman')) {
    return 'torture';
  }
  return 'indiscriminate-violence';
}

function countPreviousApplications(profile: ForeignerProfile): number {
  return profile.documents.filter(d => d.type === 'asylum-application').length;
}

function isFromSafeCountry(country: string): boolean {
  const safeCountries = ['albania', 'bosnia', 'kosovo', 'macedonia', 'montenegro', 'serbia'];
  return safeCountries.includes(country.toLowerCase());
}

/**
 * Get asylum requirements
 */
function getAsylumRequirements(applicationType: string): RequirementCheck[] {
  const requirements: RequirementCheck[] = [
    { requirement: 'Présence sur le territoire belge', met: false, documents: ['Preuve d\'entrée'] },
    { requirement: 'Demande dans les 8 jours ouvrables', met: false, documents: ['Annexe 26'] },
    { requirement: 'Enregistrement des empreintes digitales', met: false, documents: ['Confirmation Eurodac'] },
    { requirement: 'Déclaration de la langue de procédure', met: false, documents: ['Choix FR/NL'] },
    { requirement: 'Questionnaire CGRA complété', met: false, documents: ['Questionnaire'] },
  ];

  if (applicationType === 'subsequent') {
    requirements.push({
      requirement: 'Nouveaux éléments substantiels',
      met: false,
      documents: ['Preuves des nouveaux éléments'],
    });
  }

  return requirements;
}

/**
 * Get processing time for asylum
 */
function getAsylumProcessingTime(applicationType: string, isVulnerable: boolean): number {
  if (applicationType === 'first-time') {
    return isVulnerable ? 120 : PROCESSING_TIMES.ASYLUM_FIRST_INSTANCE;
  }
  if (applicationType === 'subsequent') {
    return 60;
  }
  return 30; // Accelerated procedure
}

/**
 * Get next steps for asylum procedure
 */
function getAsylumNextSteps(protectionType: string, isVulnerable: boolean): string[] {
  const steps = [
    'Enregistrement à l\'Office des Étrangers',
    'Réception de l\'annexe 26 (attestation)',
    'Attribution d\'un centre d\'accueil Fedasil',
    'Convocation pour interview CGRA',
    'Préparation avec avocat (aide juridique)',
    'Interview au CGRA',
    'Attente de la décision',
  ];

  if (isVulnerable) {
    steps.push('Désignation d\'un tuteur (si mineur)');
    steps.push('Support psychologique spécialisé');
  }

  if (protectionType === 'refugee-status') {
    steps.push('Si reconnu: carte A de 5 ans');
    steps.push('Droit au regroupement familial facilité');
  } else if (protectionType === 'subsidiary-protection') {
    steps.push('Si accordé: carte A d\'1 an renouvelable');
    steps.push('Après 5 ans: possibilité carte B');
  }

  return steps;
}

/**
 * Get alternative procedures
 */
function getAlternativeProcedures(exclusionType: string): string[] {
  const alternatives: Record<string, string[]> = {
    'dublin-transfer': [
      'Attendre le transfert Dublin',
      'Demander l\'application de la clause de souveraineté',
      'Invoquer les liens familiaux en Belgique',
    ],
    'manifestly-unfounded': [
      'Régularisation 9bis (circonstances exceptionnelles)',
      'Régularisation 9ter (raisons médicales)',
      'Retour volontaire avec OIM',
    ],
    'excluded-from-protection': [
      'Demander la protection nationale (très rare)',
      'Régularisation humanitaire',
      'Programme de réhabilitation',
    ],
    'safe-third-country': [
      'Prouver l\'impossibilité d\'obtenir protection là-bas',
      'Démontrer les liens avec la Belgique',
      'Invoquer l\'unité familiale',
    ],
  };

  return alternatives[exclusionType] || ['Consulter un avocat spécialisé'];
}

/**
 * Export asylum rules in JSON format
 */
export const ASYLUM_RULES_JSON = {
  legalFramework: {
    international: {
      genevaConvention: 'Convention de Genève de 1951',
      protocol1967: 'Protocole de 1967',
    },
    european: {
      qualificationDirective: 'Directive 2011/95/UE',
      proceduresDirective: 'Directive 2013/32/UE',
      dublinRegulation: 'Règlement Dublin III (604/2013)',
    },
    belgian: {
      law: 'Loi du 15 décembre 1980',
      articles: 'Articles 48/3 à 48/5',
    },
  },
  authorities: {
    OE: 'Office des Étrangers - Enregistrement',
    CGRA: 'Commissariat général aux réfugiés - Décision',
    CCE: 'Conseil du Contentieux - Recours',
    Fedasil: 'Accueil des demandeurs',
  },
  protectionTypes: {
    refugeeStatus: {
      duration: '5 ans renouvelable',
      card: 'Carte A puis B',
      familyReunification: 'Facilité dans l\'année',
    },
    subsidiaryProtection: {
      duration: '1 an renouvelable',
      card: 'Carte A',
      familyReunification: 'Conditions normales',
    },
  },
  processingTimes: {
    firstApplication: PROCESSING_TIMES.ASYLUM_FIRST_INSTANCE,
    subsequentApplication: 60,
    acceleratedProcedure: 30,
    appeal: 60,
  },
};