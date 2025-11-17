/**
 * Business Rules for Residence Permits in Belgium
 *
 * BASE JURIDIQUE:
 * - Loi du 15 décembre 1980 sur l'accès au territoire, le séjour, l'établissement et l'éloignement des étrangers
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1980121530&table_name=loi
 * - Arrêté royal du 8 octobre 1981 sur l'accès au territoire, le séjour, l'établissement et l'éloignement des étrangers
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1981100831&table_name=loi
 */

import { Engine } from 'json-rules-engine';
import {
  ForeignerProfile,
  ResidencePermitApplication,
  EligibilityResult,
  ResidenceCardType,
  ResidenceStatus,
  RESIDENCE_PERMIT_FEES,
  PROCESSING_TIMES,
  RequirementCheck,
} from '../modele-metier/etrangersTypes';

/**
 * Create rules engine for residence permit eligibility
 */
function createResidencePermitEngine(): Engine {
  const engine = new Engine();

  // Rule: Valid entry and current legal status
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'currentResidenceStatus',
          operator: 'equal',
          value: 'no-status',
        },
        {
          fact: 'hasValidEntry',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'residence-ineligible',
      params: {
        reason: 'Pas de statut de séjour valide ou entrée irrégulière',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule: Card A eligibility (temporary residence)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestedCardType',
          operator: 'equal',
          value: 'A',
        },
        {
          fact: 'hasValidVisa',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasPurposeOfStay',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasSufficientMeans',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'card-a-eligible',
      params: {
        message: 'Éligible pour carte A (séjour temporaire)',
      },
    },
    priority: 8,
  });

  // Rule: Card B eligibility (unlimited residence)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestedCardType',
          operator: 'equal',
          value: 'B',
        },
        {
          fact: 'yearsOfResidence',
          operator: 'greaterThanInclusive',
          value: 5,
        },
        {
          fact: 'hasUninterruptedResidence',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasStableIncome',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasNoConvictions',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'card-b-eligible',
      params: {
        message: 'Éligible pour carte B (séjour illimité)',
      },
    },
    priority: 8,
  });

  // Rule: Card E eligibility (EU citizen)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationality',
          operator: 'in',
          value: ['eu-citizen', 'eea-citizen', 'swiss'],
        },
        {
          fact: 'hasEmploymentOrSufficientResources',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasHealthInsurance',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'card-e-eligible',
      params: {
        message: 'Éligible pour carte E (citoyen UE)',
      },
    },
    priority: 9,
  });

  // Rule: Card F eligibility (EU family member)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestedCardType',
          operator: 'equal',
          value: 'F',
        },
        {
          fact: 'hasFamilyLinkWithEU',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'sponsorHasCardE',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasProofOfRelationship',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'card-f-eligible',
      params: {
        message: 'Éligible pour carte F (membre famille UE)',
      },
    },
    priority: 8,
  });

  // Rule: Blue Card eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestedCardType',
          operator: 'equal',
          value: 'H',
        },
        {
          fact: 'hasHighQualificationDiploma',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'annualSalary',
          operator: 'greaterThanInclusive',
          value: 58000,
        },
        {
          fact: 'hasWorkContract',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'blue-card-eligible',
      params: {
        message: 'Éligible pour carte bleue européenne',
      },
    },
    priority: 8,
  });

  // Rule: Public order check
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasPublicOrderIssues',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasEntryBan',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'residence-ineligible',
      params: {
        reason: 'Problèmes d\'ordre public ou interdiction d\'entrée',
        priority: 10,
      },
    },
    priority: 10,
  });

  return engine;
}

const residencePermitEngineInstance = createResidencePermitEngine();

/**
 * Check residence permit eligibility
 */
export async function checkResidencePermitEligibility(
  profile: ForeignerProfile,
  application: ResidencePermitApplication
): Promise<EligibilityResult> {
  const facts = {
    currentResidenceStatus: profile.currentResidenceStatus,
    hasValidEntry: profile.dateOfEntry && !profile.hasOQT,
    requestedCardType: application.requestedCardType,
    hasValidVisa: true, // Would be checked against visa database
    hasPurposeOfStay: !!profile.purposeOfStay,
    hasSufficientMeans: profile.monthlyIncome ? profile.monthlyIncome >= 730 : false,
    yearsOfResidence: profile.dateOfEntry
      ? Math.floor((Date.now() - profile.dateOfEntry.getTime()) / (365 * 24 * 60 * 60 * 1000))
      : 0,
    hasUninterruptedResidence: true, // Would be checked against residence history
    hasStableIncome: profile.employmentStatus !== 'unemployed',
    hasNoConvictions: !profile.hasConvictions,
    nationality: profile.nationality,
    hasEmploymentOrSufficientResources:
      profile.employmentStatus === 'employed' || (profile.monthlyIncome && profile.monthlyIncome >= 1500),
    hasHealthInsurance: true, // Would be checked
    hasFamilyLinkWithEU: profile.familyMembers.some((m) => m.nationality === 'eu-citizen'),
    sponsorHasCardE: true, // Would be checked
    hasProofOfRelationship: true, // Would be checked
    hasHighQualificationDiploma: true, // Would be checked
    annualSalary: profile.monthlyIncome ? profile.monthlyIncome * 12 : 0,
    hasWorkContract: profile.employmentStatus === 'employed',
    hasPublicOrderIssues: profile.hasPublicOrderIssues,
    hasEntryBan: profile.hasEntryBan,
  };

  try {
    const results = await residencePermitEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvent = results.events.find((e) => e.type === 'residence-ineligible');
    if (ineligibleEvent) {
      return {
        isEligible: false,
        procedure: 'residence-permit',
        requirements: [],
        warnings: [ineligibleEvent.params?.reason],
      };
    }

    // Check for specific card eligibility
    const eligibleEvent = results.events.find((e) => e.type.includes('eligible'));
    if (eligibleEvent) {
      const requirements = getRequirementsForCard(application.requestedCardType);
      const fees = calculateFees(application);
      const processingTime = getProcessingTime(application.requestedCardType);

      return {
        isEligible: true,
        procedure: 'residence-permit',
        requirements,
        fees,
        estimatedProcessingTime: processingTime,
        nextSteps: getNextSteps(application.requestedCardType),
      };
    }

    return {
      isEligible: false,
      procedure: 'residence-permit',
      requirements: [],
      warnings: ['Conditions non remplies'],
    };
  } catch (error) {
    throw new Error(`Error checking residence permit eligibility: ${error}`);
  }
}

/**
 * Get requirements for specific card type
 */
function getRequirementsForCard(cardType: ResidenceCardType): RequirementCheck[] {
  const requirementsMap: Record<string, RequirementCheck[]> = {
    A: [
      { requirement: 'Visa D valide', met: false, documents: ['Visa dans passeport'] },
      { requirement: 'Moyens de subsistance (730€/mois)', met: false, documents: ['Relevés bancaires', 'Attestation de bourse'] },
      { requirement: 'Assurance maladie', met: false, documents: ['Attestation assurance'] },
      { requirement: 'Logement', met: false, documents: ['Bail', 'Attestation hébergement'] },
      { requirement: 'Inscription commune', met: false, documents: ['Annexe 15'] },
    ],
    B: [
      { requirement: '5 ans de résidence légale', met: false, documents: ['Historique de séjour'] },
      { requirement: 'Séjour ininterrompu', met: false, documents: ['Preuves de présence continue'] },
      { requirement: 'Revenus stables', met: false, documents: ['Contrat de travail', 'Fiches de paie'] },
      { requirement: 'Intégration (langue A2)', met: false, documents: ['Certificat de langue'] },
      { requirement: 'Pas de condamnations', met: false, documents: ['Casier judiciaire'] },
    ],
    E: [
      { requirement: 'Citoyenneté UE/EEE/Suisse', met: false, documents: ['Passeport ou carte d\'identité'] },
      { requirement: 'Activité économique ou ressources', met: false, documents: ['Contrat travail ou preuves financières'] },
      { requirement: 'Assurance maladie', met: false, documents: ['Mutuelle ou assurance privée'] },
      { requirement: 'Inscription commune', met: false, documents: ['Déclaration d\'arrivée'] },
    ],
    F: [
      { requirement: 'Lien familial avec citoyen UE', met: false, documents: ['Acte de mariage/naissance'] },
      { requirement: 'Sponsor avec carte E/E+', met: false, documents: ['Copie carte du sponsor'] },
      { requirement: 'Vie commune ou dépendance', met: false, documents: ['Preuves de cohabitation'] },
      { requirement: 'Assurance maladie', met: false, documents: ['Attestation assurance'] },
    ],
    H: [
      { requirement: 'Diplôme enseignement supérieur', met: false, documents: ['Diplôme + équivalence'] },
      { requirement: 'Contrat travail hautement qualifié', met: false, documents: ['Contrat avec description poste'] },
      { requirement: 'Salaire minimum (58000€/an)', met: false, documents: ['Promesse salariale'] },
      { requirement: 'Assurance maladie', met: false, documents: ['Attestation assurance'] },
    ],
  };

  return requirementsMap[cardType] || [];
}

/**
 * Calculate fees for residence permit application
 */
function calculateFees(application: ResidencePermitApplication) {
  const baseFee = application.applicationType === 'renewal'
    ? RESIDENCE_PERMIT_FEES[`CARD_${application.requestedCardType}_RENEWAL` as keyof typeof RESIDENCE_PERMIT_FEES] || 60
    : RESIDENCE_PERMIT_FEES[`CARD_${application.requestedCardType}_NEW` as keyof typeof RESIDENCE_PERMIT_FEES] || 180;

  const biometricFee = RESIDENCE_PERMIT_FEES.BIOMETRIC_CARD_FEE;
  const expeditedFee = application.supportingDocuments.includes('expedited') ? RESIDENCE_PERMIT_FEES.EXPEDITED_PROCESSING : 0;

  return {
    baseFee,
    additionalFees: biometricFee,
    expeditedProcessing: expeditedFee,
    totalFee: baseFee + biometricFee + expeditedFee,
    paid: false,
  };
}

/**
 * Get processing time for card type
 */
function getProcessingTime(cardType: ResidenceCardType): number {
  const times: Record<string, number> = {
    A: PROCESSING_TIMES.RESIDENCE_PERMIT_NEW,
    B: PROCESSING_TIMES.RESIDENCE_PERMIT_NEW,
    C: PROCESSING_TIMES.RESIDENCE_PERMIT_NEW,
    D: PROCESSING_TIMES.RESIDENCE_PERMIT_NEW,
    E: 45, // EU citizen faster
    F: PROCESSING_TIMES.FAMILY_REUNIFICATION_EU,
    H: PROCESSING_TIMES.BLUE_CARD,
  };

  return times[cardType] || PROCESSING_TIMES.RESIDENCE_PERMIT_NEW;
}

/**
 * Get next steps for application
 */
function getNextSteps(cardType: ResidenceCardType): string[] {
  const commonSteps = [
    'Prendre rendez-vous à la commune',
    'Rassembler tous les documents requis',
    'Payer les frais de dossier',
    'Attendre le contrôle de résidence',
  ];

  const specificSteps: Record<string, string[]> = {
    A: ['Maintenir le statut légal pendant le traitement', 'Renouveler avant expiration'],
    B: ['Prouver l\'intégration sociale', 'Fournir certificat de langue A2'],
    E: ['Déclaration d\'arrivée dans les 3 mois', 'Enregistrement automatique si conditions remplies'],
    F: ['Prouver le lien familial', 'Démontrer la dépendance si ascendant'],
    H: ['Obtenir l\'approbation de l\'employeur', 'Validation du diplôme'],
  };

  return [...commonSteps, ...(specificSteps[cardType] || [])];
}

/**
 * Export residence permit rules in JSON format
 */
export const RESIDENCE_PERMIT_RULES_JSON = {
  legalFramework: {
    primaryLaw: {
      title: 'Loi du 15 décembre 1980 sur l\'accès au territoire',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1980121530&table_name=loi',
    },
    implementingDecree: {
      title: 'Arrêté royal du 8 octobre 1981',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1981100831&table_name=loi',
    },
  },
  cardTypes: {
    A: 'Séjour temporaire limité',
    B: 'Séjour illimité',
    C: 'Carte d\'identité d\'étranger',
    D: 'Résident de longue durée-UE',
    E: 'Citoyen UE - attestation d\'enregistrement',
    F: 'Membre famille citoyen UE',
    H: 'Carte bleue européenne',
  },
  fees: RESIDENCE_PERMIT_FEES,
  processingTimes: PROCESSING_TIMES,
};