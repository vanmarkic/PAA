/**
 * Business Rules for Family Reunification in Belgium
 *
 * BASE JURIDIQUE:
 * - Article 10 et suivants de la loi du 15 décembre 1980 (regroupement familial ressortissants pays tiers)
 * - Article 40bis et 40ter de la loi du 15 décembre 1980 (regroupement familial citoyens UE et Belges)
 * - Directive 2003/86/CE du 22 septembre 2003 relative au droit au regroupement familial
 *   https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=celex%3A32003L0086
 */

import { Engine } from 'json-rules-engine';
import {
  ForeignerProfile,
  FamilyReunificationApplication,
  EligibilityResult,
  FamilyRelationship,
  INCOME_REQUIREMENTS,
  PROCESSING_TIMES,
  RequirementCheck,
} from '../../domain/etrangersTypes';

/**
 * Create rules engine for family reunification
 */
function createFamilyReunificationEngine(): Engine {
  const engine = new Engine();

  // Rule: Income requirement for sponsor
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'sponsorIncome',
          operator: 'lessThan',
          value: INCOME_REQUIREMENTS.FAMILY_REUNIFICATION_SPONSOR,
        },
        {
          fact: 'isRefugee',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'family-ineligible',
      params: {
        reason: `Revenus insuffisants (minimum ${INCOME_REQUIREMENTS.FAMILY_REUNIFICATION_SPONSOR}€/mois requis)`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule: Spouse/partner eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'relationship',
          operator: 'in',
          value: ['spouse', 'registered-partner'],
        },
        {
          fact: 'bothOver21',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'marriageRecognized',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'spouse-eligible',
      params: {
        message: 'Éligible comme conjoint/partenaire',
      },
    },
    priority: 8,
  });

  // Rule: Minor child eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'relationship',
          operator: 'equal',
          value: 'minor-child',
        },
        {
          fact: 'childAge',
          operator: 'lessThan',
          value: 18,
        },
        {
          fact: 'hasParentalAuthority',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'child-eligible',
      params: {
        message: 'Éligible comme enfant mineur',
      },
    },
    priority: 9,
  });

  // Rule: Dependent ascendant eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'relationship',
          operator: 'in',
          value: ['parent', 'grandparent'],
        },
        {
          fact: 'isFinanciallyDependent',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasProofOfSupport',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'sponsorIsBelgianOrEU',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'ascendant-eligible',
      params: {
        message: 'Éligible comme ascendant à charge',
      },
    },
    priority: 7,
  });

  // Rule: Housing requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasAdequateHousing',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'isRefugee',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'family-ineligible',
      params: {
        reason: 'Logement inadéquat ou non conforme',
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule: Health insurance requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasHealthInsurance',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'family-ineligible',
      params: {
        reason: 'Assurance maladie manquante ou insuffisante',
        priority: 7,
      },
    },
    priority: 7,
  });

  // Rule: Refugee family reunification (facilitated)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'sponsorIsRefugee',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'applicationWithinOneYear',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'nuclearFamily',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'refugee-family-eligible',
      params: {
        message: 'Procédure facilitée pour famille de réfugié',
        noIncomeRequired: true,
        noHousingRequired: true,
        freeOfCharge: true,
      },
    },
    priority: 10,
  });

  // Rule: De facto partner requirements
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'relationship',
          operator: 'equal',
          value: 'de-facto-partner',
        },
        {
          fact: 'relationshipDuration',
          operator: 'greaterThanInclusive',
          value: 2,
        },
        {
          fact: 'cohabitationPeriod',
          operator: 'greaterThanInclusive',
          value: 1,
        },
        {
          fact: 'bothSingle',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'defacto-partner-eligible',
      params: {
        message: 'Éligible comme partenaire de fait',
      },
    },
    priority: 7,
  });

  return engine;
}

const familyReunificationEngineInstance = createFamilyReunificationEngine();

/**
 * Check family reunification eligibility
 */
export async function checkFamilyReunificationEligibility(
  application: FamilyReunificationApplication
): Promise<EligibilityResult> {
  const sponsor = application.sponsor;
  const applicant = application.applicant;
  const relationship = application.relationship;

  // Calculate child age if applicable
  const childAge = relationship === 'minor-child' && applicant.dateOfBirth
    ? Math.floor((Date.now() - applicant.dateOfBirth.getTime()) / (365 * 24 * 60 * 60 * 1000))
    : 99;

  // Check if sponsor is refugee
  const isRefugee = sponsor.currentResidenceStatus === 'refugee-status';
  const refugeeRecognitionDate = sponsor.documents.find(d => d.type === 'refugee-recognition')?.issuedDate;
  const applicationWithinOneYear = isRefugee && refugeeRecognitionDate
    ? (Date.now() - refugeeRecognitionDate.getTime()) < (365 * 24 * 60 * 60 * 1000)
    : false;

  const facts = {
    sponsorIncome: sponsor.monthlyIncome ?? 0,
    isRefugee,
    relationship,
    bothOver21: calculateAge(sponsor.dateOfBirth) >= 21 && calculateAge(applicant.dateOfBirth) >= 21,
    marriageRecognized: application.proofOfRelationship.includes('marriage-certificate'),
    childAge,
    hasParentalAuthority: application.proofOfRelationship.includes('birth-certificate'),
    isFinanciallyDependent: (applicant.monthlyIncome ?? 0) === 0 || (applicant.monthlyIncome ?? 0) < 500,
    hasProofOfSupport: application.proofOfRelationship.includes('financial-support'),
    sponsorIsBelgianOrEU: sponsor.nationality === 'belgian' || sponsor.nationality === 'eu-citizen',
    hasAdequateHousing: application.housingProof.rooms >= 2 && application.housingProof.surface >= 50,
    hasHealthInsurance: !!application.healthInsurance,
    sponsorIsRefugee: isRefugee,
    applicationWithinOneYear,
    nuclearFamily: ['spouse', 'minor-child'].includes(relationship),
    relationshipDuration: 2, // Would be calculated from relationship proof
    cohabitationPeriod: 1, // Would be calculated from cohabitation proof
    bothSingle: sponsor.maritalStatus === 'single' && applicant.maritalStatus === 'single',
  };

  try {
    const results = await familyReunificationEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvent = results.events.find((e) => e.type === 'family-ineligible');
    if (ineligibleEvent) {
      return {
        isEligible: false,
        procedure: 'family-reunification',
        requirements: [],
        warnings: [ineligibleEvent.params?.reason],
      };
    }

    // Check for eligibility
    const eligibleEvent = results.events.find((e) => e.type.includes('eligible'));
    if (eligibleEvent) {
      const requirements = getRequirementsForRelationship(relationship, isRefugee);
      const processingTime = getProcessingTimeForFamily(sponsor.nationality, relationship);

      return {
        isEligible: true,
        procedure: 'family-reunification',
        requirements,
        estimatedProcessingTime: processingTime,
        nextSteps: getNextStepsForFamily(relationship, sponsor.nationality),
        fees: calculateFamilyFees(sponsor.nationality, isRefugee, applicationWithinOneYear),
      };
    }

    return {
      isEligible: false,
      procedure: 'family-reunification',
      requirements: [],
      warnings: ['Conditions non remplies'],
    };
  } catch (error) {
    throw new Error(`Error checking family reunification eligibility: ${error}`);
  }
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  return Math.floor((Date.now() - dateOfBirth.getTime()) / (365 * 24 * 60 * 60 * 1000));
}

/**
 * Get requirements for specific relationship type
 */
function getRequirementsForRelationship(
  relationship: FamilyRelationship,
  isRefugee: boolean
): RequirementCheck[] {
  const baseRequirements: RequirementCheck[] = [
    { requirement: 'Preuve du lien familial', met: false, documents: ['Acte de mariage/naissance légalisé'] },
    { requirement: 'Passeport valide', met: false, documents: ['Passeport du demandeur'] },
    { requirement: 'Certificat médical', met: false, documents: ['Certificat médical récent'] },
    { requirement: 'Casier judiciaire', met: false, documents: ['Casier judiciaire apostillé'] },
  ];

  if (!isRefugee) {
    baseRequirements.push(
      { requirement: `Revenus stables (min ${INCOME_REQUIREMENTS.FAMILY_REUNIFICATION_SPONSOR}€)`, met: false, documents: ['Fiches de paie', 'Contrat de travail'] },
      { requirement: 'Logement adéquat', met: false, documents: ['Bail', 'Certificat de conformité'] },
      { requirement: 'Assurance maladie', met: false, documents: ['Attestation mutuelle'] }
    );
  }

  const specificRequirements: Record<string, RequirementCheck[]> = {
    'spouse': [
      { requirement: 'Âge minimum 21 ans', met: false, documents: ['Acte de naissance'] },
      { requirement: 'Mariage reconnu', met: false, documents: ['Acte de mariage légalisé'] },
    ],
    'registered-partner': [
      { requirement: 'Partenariat équivalent au mariage', met: false, documents: ['Certificat de partenariat'] },
      { requirement: 'Preuve de vie commune', met: false, documents: ['Attestation de cohabitation'] },
    ],
    'de-facto-partner': [
      { requirement: 'Relation stable de 2 ans minimum', met: false, documents: ['Preuves de relation'] },
      { requirement: 'Cohabitation de 1 an minimum', met: false, documents: ['Baux communs', 'Factures'] },
      { requirement: 'Célibataires tous les deux', met: false, documents: ['Certificats de célibat'] },
    ],
    'minor-child': [
      { requirement: 'Enfant de moins de 18 ans', met: false, documents: ['Acte de naissance'] },
      { requirement: 'Autorité parentale', met: false, documents: ['Jugement si divorce'] },
    ],
    'parent': [
      { requirement: 'Dépendance financière', met: false, documents: ['Preuves de virements'] },
      { requirement: 'Absence de ressources propres', met: false, documents: ['Attestation de non-revenus'] },
    ],
  };

  return [...baseRequirements, ...(specificRequirements[relationship] || [])];
}

/**
 * Get processing time for family reunification
 */
function getProcessingTimeForFamily(sponsorNationality: string, relationship: FamilyRelationship): number {
  if (sponsorNationality === 'belgian' || sponsorNationality === 'eu-citizen') {
    return PROCESSING_TIMES.FAMILY_REUNIFICATION_EU;
  }
  return PROCESSING_TIMES.FAMILY_REUNIFICATION_NON_EU;
}

/**
 * Calculate fees for family reunification
 */
function calculateFamilyFees(sponsorNationality: string, isRefugee: boolean, withinOneYear: boolean) {
  if (isRefugee && withinOneYear) {
    return {
      baseFee: 0,
      totalFee: 0,
      paid: false,
    };
  }

  const baseFee = sponsorNationality === 'eu-citizen' ? 0 : 180;
  return {
    baseFee,
    additionalFees: 20, // Biometric card
    totalFee: baseFee + 20,
    paid: false,
  };
}

/**
 * Get next steps for family reunification
 */
function getNextStepsForFamily(relationship: FamilyRelationship, sponsorNationality: string): string[] {
  const steps = [
    'Rassembler tous les documents requis',
    'Faire légaliser/apostiller les documents étrangers',
    'Faire traduire les documents par traducteur juré',
    'Déposer la demande au consulat ou commune',
    'Payer les frais de dossier',
    'Attendre la décision',
  ];

  if (relationship === 'spouse' || relationship === 'registered-partner') {
    steps.push('Préparer l\'entretien si convoqué');
    steps.push('Prouver la sincérité de la relation');
  }

  if (relationship === 'parent' || relationship === 'grandparent') {
    steps.push('Démontrer la dépendance financière continue');
    steps.push('Prouver l\'absence de ressources dans le pays d\'origine');
  }

  return steps;
}

/**
 * Export family reunification rules in JSON format
 */
export const FAMILY_REUNIFICATION_RULES_JSON = {
  legalFramework: {
    thirdCountry: {
      title: 'Articles 10 et suivants - Loi du 15 décembre 1980',
      description: 'Regroupement familial ressortissants pays tiers',
    },
    euCitizens: {
      title: 'Articles 40bis et 40ter - Loi du 15 décembre 1980',
      description: 'Regroupement familial citoyens UE et Belges',
    },
    directive: {
      title: 'Directive 2003/86/CE',
      description: 'Droit au regroupement familial',
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=celex%3A32003L0086',
    },
  },
  eligibleRelationships: [
    'Conjoint (marié)',
    'Partenaire enregistré',
    'Enfant mineur',
    'Enfant majeur handicapé',
    'Ascendant à charge (Belges/UE)',
  ],
  incomeRequirements: {
    standard: INCOME_REQUIREMENTS.FAMILY_REUNIFICATION_SPONSOR,
    exemptions: ['Réfugiés dans l\'année', 'Citoyens UE actifs'],
  },
  processingTimes: {
    belgian_eu: PROCESSING_TIMES.FAMILY_REUNIFICATION_EU,
    third_country: PROCESSING_TIMES.FAMILY_REUNIFICATION_NON_EU,
  },
};