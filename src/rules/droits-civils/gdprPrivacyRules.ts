/**
 * Business Rules for GDPR and Privacy Rights
 *
 * BASE JURIDIQUE:
 * - Règlement (UE) 2016/679 (RGPD/GDPR)
 *   https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679
 * - Loi du 30 juillet 2018 relative à la protection des personnes physiques
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2018073046&table_name=loi
 * - Loi du 3 décembre 2017 portant création de l'Autorité de protection des données
 */

import { Engine } from 'json-rules-engine';
import {
  PrivacyRequest,
  PrivacyRightType,
  ValidationResult,
  CIVIL_RIGHTS_CONSTANTS
} from '../../domain/droitsCivilsTypes';

/**
 * Create the GDPR privacy rules engine
 */
function createGDPREngine(): Engine {
  const engine = new Engine();

  // Rule 1: Data access request - identity verification required
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestType',
          operator: 'equal',
          value: 'acces-donnees',
        },
        {
          fact: 'identityVerified',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'identity-verification-required',
      params: {
        reason: 'Vérification d\'identité requise pour accès aux données',
        requirement: 'Copie de carte d\'identité ou authentification sécurisée',
        legalBasis: 'Article 12 RGPD',
      },
    },
    priority: 10,
  });

  // Rule 2: Right to be forgotten - check legal obligations
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestType',
          operator: 'equal',
          value: 'effacement-donnees',
        },
        {
          fact: 'hasLegalObligation',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'erasure-denied-legal-obligation',
      params: {
        reason: 'Effacement impossible - obligation légale de conservation',
        examples: [
          'Données comptables (10 ans)',
          'Données fiscales (7 ans)',
          'Données médicales (30 ans)',
        ],
        legalBasis: 'Article 17.3(b) RGPD',
      },
    },
    priority: 9,
  });

  // Rule 3: Opposition to marketing - immediate effect
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestType',
          operator: 'equal',
          value: 'opposition-traitement',
        },
        {
          fact: 'processingPurpose',
          operator: 'equal',
          value: 'marketing',
        },
      ],
    },
    event: {
      type: 'marketing-opposition-immediate',
      params: {
        effect: 'Immédiat',
        requirement: 'Aucune justification nécessaire',
        permanent: true,
        legalBasis: 'Article 21.2 RGPD',
      },
    },
    priority: 10,
  });

  // Rule 4: Data portability - technical feasibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestType',
          operator: 'equal',
          value: 'portabilite-donnees',
        },
        {
          fact: 'processingBasis',
          operator: 'notIn',
          value: ['consent', 'contract'],
        },
      ],
    },
    event: {
      type: 'portability-not-applicable',
      params: {
        reason: 'Portabilité applicable uniquement pour traitement basé sur consentement ou contrat',
        legalBasis: 'Article 20.1(a) RGPD',
      },
    },
    priority: 8,
  });

  // Rule 5: Excessive requests
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestsInLast12Months',
          operator: 'greaterThan',
          value: 3,
        },
        {
          fact: 'requestType',
          operator: 'in',
          value: ['acces-donnees', 'copie-dossier-medical'],
        },
      ],
    },
    event: {
      type: 'excessive-requests-fee',
      params: {
        reason: 'Demandes excessives - frais administratifs applicables',
        fee: CIVIL_RIGHTS_CONSTANTS.GDPR_ADDITIONAL_COPY_FEE,
        legalBasis: 'Article 12.5 RGPD',
      },
    },
    priority: 6,
  });

  // Rule 6: Urgent data breach notification
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestType',
          operator: 'equal',
          value: 'notification-violation',
        },
        {
          fact: 'hoursSinceBreach',
          operator: 'greaterThan',
          value: CIVIL_RIGHTS_CONSTANTS.DATA_BREACH_NOTIFICATION,
        },
      ],
    },
    event: {
      type: 'breach-notification-late',
      params: {
        reason: `Notification tardive - délai de ${CIVIL_RIGHTS_CONSTANTS.DATA_BREACH_NOTIFICATION}h dépassé`,
        requirement: 'Justification du retard requise',
        penalty: 'Amendes possibles jusqu\'à 2% du CA mondial',
        legalBasis: 'Article 33 RGPD',
      },
    },
    priority: 10,
  });

  // Rule 7: CCTV footage access
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestType',
          operator: 'equal',
          value: 'acces-camera-surveillance',
        },
        {
          fact: 'daysSinceRecording',
          operator: 'greaterThan',
          value: 30,
        },
      ],
    },
    event: {
      type: 'cctv-footage-deleted',
      params: {
        reason: 'Images probablement effacées - conservation standard 30 jours',
        note: 'Sauf enquête judiciaire en cours',
      },
    },
    priority: 8,
  });

  // Rule 8: Medical records special rules
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestType',
          operator: 'equal',
          value: 'copie-dossier-medical',
        },
        {
          fact: 'requestorIsPatient',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'patientDeceased',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'medical-records-restricted',
      params: {
        reason: 'Accès au dossier médical limité au patient ou représentant légal',
        exceptions: [
          'Parent d\'enfant mineur',
          'Tuteur légal',
          'Personne de confiance désignée',
        ],
        legalBasis: 'Loi droits du patient 2002',
      },
    },
    priority: 9,
  });

  // Rule 9: Response deadline check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isComplex',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'extensionNotified',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'daysSinceRequest',
          operator: 'greaterThan',
          value: 25,
        },
      ],
    },
    event: {
      type: 'extension-notification-required',
      params: {
        reason: 'Extension de délai doit être notifiée avant 30 jours',
        maxExtension: CIVIL_RIGHTS_CONSTANTS.GDPR_COMPLEX_EXTENSION,
        legalBasis: 'Article 12.3 RGPD',
      },
    },
    priority: 7,
  });

  return engine;
}

/**
 * Singleton instance
 */
const gdprEngine = createGDPREngine();

/**
 * Calculate response deadline
 */
export function calculateResponseDeadline(
  requestType: PrivacyRightType,
  isComplex: boolean = false,
  urgency: string = 'normal'
): {
  standardDeadline: number;
  maxDeadline: number;
  unit: string;
} {
  // Special cases
  if (requestType === 'notification-violation') {
    return {
      standardDeadline: CIVIL_RIGHTS_CONSTANTS.DATA_BREACH_NOTIFICATION,
      maxDeadline: CIVIL_RIGHTS_CONSTANTS.DATA_BREACH_NOTIFICATION,
      unit: 'hours',
    };
  }

  if (requestType === 'opposition-traitement' && urgency === 'immediate') {
    return {
      standardDeadline: 0,
      maxDeadline: 0,
      unit: 'immediate',
    };
  }

  if (requestType === 'copie-dossier-medical') {
    return {
      standardDeadline: 15,
      maxDeadline: 15,
      unit: 'days',
    };
  }

  // Standard GDPR requests
  const standardDeadline = CIVIL_RIGHTS_CONSTANTS.GDPR_RESPONSE_DAYS;
  const maxDeadline = isComplex
    ? standardDeadline + CIVIL_RIGHTS_CONSTANTS.GDPR_COMPLEX_EXTENSION
    : standardDeadline;

  return {
    standardDeadline,
    maxDeadline,
    unit: 'days',
  };
}

/**
 * Calculate fees for privacy requests
 */
export function calculatePrivacyRequestFees(
  requestType: PrivacyRightType,
  requestsInLast12Months: number,
  numberOfCopies: number = 1
): number {
  // First request is always free
  if (requestsInLast12Months === 0) {
    return 0;
  }

  // Opposition to marketing is always free
  if (requestType === 'opposition-traitement') {
    return 0;
  }

  // Medical records have specific fees
  if (requestType === 'copie-dossier-medical') {
    return Math.min(25, numberOfCopies * 0.10); // Max 25€
  }

  // Excessive requests
  if (requestsInLast12Months > 3) {
    return CIVIL_RIGHTS_CONSTANTS.GDPR_ADDITIONAL_COPY_FEE * (requestsInLast12Months - 3);
  }

  return 0;
}

/**
 * Check GDPR request validity
 */
export async function checkGDPRRequestValidity(
  request: Partial<PrivacyRequest> & {
    identityVerified?: boolean;
    hasLegalObligation?: boolean;
    processingBasis?: string;
    processingPurpose?: string;
    requestsInLast12Months?: number;
    hoursSinceBreach?: number;
    daysSinceRecording?: number;
    requestorIsPatient?: boolean;
    patientDeceased?: boolean;
    isComplex?: boolean;
    extensionNotified?: boolean;
    daysSinceRequest?: number;
  }
): Promise<ValidationResult> {
  const facts = {
    requestType: request.type,
    identityVerified: request.identityVerified !== false,
    hasLegalObligation: request.hasLegalObligation || false,
    processingBasis: request.processingBasis || 'unknown',
    processingPurpose: request.processingPurpose || 'unknown',
    requestsInLast12Months: request.requestsInLast12Months || 0,
    hoursSinceBreach: request.hoursSinceBreach || 0,
    daysSinceRecording: request.daysSinceRecording || 0,
    requestorIsPatient: request.requestorIsPatient !== false,
    patientDeceased: request.patientDeceased || false,
    isComplex: request.isComplex || false,
    extensionNotified: request.extensionNotified || false,
    daysSinceRequest: request.daysSinceRequest || 0,
  };

  try {
    const results = await gdprEngine.run(facts);

    const errors: any[] = [];
    const warnings: string[] = [];
    const missingDocuments: string[] = [];

    // Process events
    for (const event of results.events) {
      switch (event.type) {
        case 'identity-verification-required':
          missingDocuments.push('Copie de carte d\'identité');
          errors.push({
            field: 'identity',
            message: event.params?.reason,
            code: event.type,
            severity: 'error',
          });
          break;

        case 'erasure-denied-legal-obligation':
        case 'portability-not-applicable':
        case 'medical-records-restricted':
          errors.push({
            field: event.type,
            message: event.params?.reason,
            code: event.type,
            severity: 'error',
          });
          break;

        case 'excessive-requests-fee':
        case 'breach-notification-late':
        case 'cctv-footage-deleted':
        case 'extension-notification-required':
          warnings.push(event.params?.reason || event.params?.note);
          break;

        case 'marketing-opposition-immediate':
          // This is positive feedback
          break;
      }
    }

    // Add required elements based on request type
    if (request.type === 'acces-donnees' && !facts.identityVerified) {
      missingDocuments.push('Preuve d\'identité');
    }

    if (request.type === 'effacement-donnees') {
      missingDocuments.push('Justification de la demande');
    }

    if (request.type === 'acces-camera-surveillance') {
      missingDocuments.push('Photo pour identification');
      missingDocuments.push('Date et heure précises');
    }

    // Calculate fees
    const estimatedFees = calculatePrivacyRequestFees(
      request.type as PrivacyRightType,
      facts.requestsInLast12Months,
      1
    );

    // Calculate processing time
    const deadline = calculateResponseDeadline(
      request.type as PrivacyRightType,
      facts.isComplex,
      request.urgency || 'normal'
    );

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingDocuments,
      estimatedFees,
      estimatedTime: deadline.standardDeadline,
    };
  } catch (error) {
    throw new Error(`Error checking GDPR request validity: ${error}`);
  }
}

/**
 * Export GDPR rules for transparency
 */
export const GDPR_RULES_JSON = {
  legalFramework: {
    euRegulation: {
      title: 'Règlement (UE) 2016/679 (RGPD)',
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679',
      effectiveDate: '2018-05-25',
    },
    belgianLaw: {
      title: 'Loi relative à la protection des personnes physiques',
      date: '2018-07-30',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2018073046&table_name=loi',
    },
    dataProtectionAuthority: {
      name: 'Autorité de protection des données',
      website: 'https://www.dataprotectionauthority.be',
    },
  },
  rights: {
    access: {
      article: '15',
      deadline: `${CIVIL_RIGHTS_CONSTANTS.GDPR_RESPONSE_DAYS} jours`,
      fee: 'Première copie gratuite',
    },
    rectification: {
      article: '16',
      deadline: `${CIVIL_RIGHTS_CONSTANTS.GDPR_RESPONSE_DAYS} jours`,
      requirement: 'Preuves des corrections',
    },
    erasure: {
      article: '17',
      deadline: `${CIVIL_RIGHTS_CONSTANTS.GDPR_RESPONSE_DAYS} jours`,
      exceptions: [
        'Liberté d\'expression',
        'Obligation légale',
        'Intérêt public',
        'Défense en justice',
      ],
    },
    restriction: {
      article: '18',
      cases: [
        'Contestation de l\'exactitude',
        'Traitement illicite',
        'Besoin pour défense en justice',
      ],
    },
    portability: {
      article: '20',
      conditions: [
        'Traitement basé sur consentement ou contrat',
        'Traitement automatisé',
      ],
      format: 'Structuré, couramment utilisé, lisible par machine',
    },
    objection: {
      article: '21',
      marketing: 'Opposition immédiate et définitive',
      other: 'Motifs légitimes requis',
    },
  },
  dataBreachNotification: {
    toAuthority: `${CIVIL_RIGHTS_CONSTANTS.DATA_BREACH_NOTIFICATION} heures`,
    toIndividuals: 'Sans délai injustifié si risque élevé',
    content: [
      'Nature de la violation',
      'Catégories de données',
      'Nombre de personnes concernées',
      'Mesures prises',
      'Contact DPO',
    ],
  },
  penalties: {
    administrative: {
      minor: 'Jusqu\'à 10 millions € ou 2% CA mondial',
      major: 'Jusqu\'à 20 millions € ou 4% CA mondial',
    },
  },
};