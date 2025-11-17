/**
 * Business Rules for Identity Documents
 *
 * BASE JURIDIQUE:
 * - Loi du 19 juillet 1991 relative aux registres de la population et aux cartes d'identité
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991071931&table_name=loi
 * - Arrêté royal du 25 mars 2003 relatif aux cartes d'identité
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2003032530&table_name=loi
 * - Règlement (UE) 2019/1157 relatif au renforcement de la sécurité des cartes d'identité
 */

import { Engine } from 'json-rules-engine';
import {
  IdentityDocument,
  PersonDetails,
  CivilRightsRequest,
  ValidationResult,
  CIVIL_RIGHTS_CONSTANTS
} from '../../domain/droitsCivilsTypes';

/**
 * Create the identity document rules engine
 */
function createIdentityDocumentEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement for ID card
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'documentType',
          operator: 'equal',
          value: 'carte-identite',
        },
        {
          fact: 'age',
          operator: 'lessThan',
          value: 12,
        },
      ],
    },
    event: {
      type: 'id-card-age-requirement',
      params: {
        recommendation: 'kids-id',
        message: 'Pour les enfants de moins de 12 ans, demandez une Kids-ID',
      },
    },
    priority: 10,
  });

  // Rule 2: Belgian nationality requirement for Belgian ID
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'documentType',
          operator: 'in',
          value: ['carte-identite', 'passeport'],
        },
        {
          fact: 'nationality',
          operator: 'notEqual',
          value: 'BE',
        },
      ],
    },
    event: {
      type: 'nationality-requirement-failed',
      params: {
        reason: 'Nationalité belge requise pour ce document',
        alternatives: ['carte-a', 'carte-b', 'carte-c', 'carte-f'],
      },
    },
    priority: 10,
  });

  // Rule 3: Document expiry check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'currentDocument',
          operator: 'equal',
          value: true,
          path: '.exists',
        },
        {
          fact: 'daysUntilExpiry',
          operator: 'greaterThan',
          value: 90,
        },
        {
          fact: 'documentStatus',
          operator: 'equal',
          value: 'valide',
        },
      ],
    },
    event: {
      type: 'renewal-not-yet-needed',
      params: {
        message: 'Renouvellement possible seulement dans les 3 mois avant expiration',
      },
    },
    priority: 8,
  });

  // Rule 4: Lost or stolen document requirements
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'documentStatus',
          operator: 'equal',
          value: 'perdu',
        },
        {
          fact: 'documentStatus',
          operator: 'equal',
          value: 'vole',
        },
      ],
    },
    event: {
      type: 'police-declaration-required',
      params: {
        requirement: 'Déclaration de perte ou vol à la police requise',
        documents: ['PV de police', 'Formulaire Doc Stop'],
      },
    },
    priority: 9,
  });

  // Rule 5: Photo requirements
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'photoProvided',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'photoAge',
          operator: 'greaterThan',
          value: 180, // 6 months in days
        },
      ],
    },
    event: {
      type: 'photo-too-old',
      params: {
        reason: 'Photo de plus de 6 mois',
        requirement: 'Photo récente requise (moins de 6 mois)',
      },
    },
    priority: 7,
  });

  // Rule 6: Urgent procedure eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'urgentProcedure',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'travelDate',
          operator: 'lessThanInclusive',
          value: 7,
          path: '.daysFromNow',
        },
      ],
    },
    event: {
      type: 'urgent-procedure-approved',
      params: {
        fee: CIVIL_RIGHTS_CONSTANTS.ID_CARD_URGENT_FEE,
        processingDays: CIVIL_RIGHTS_CONSTANTS.URGENT_PROCEDURE_DAYS,
        justification: 'Voyage imminent justifie la procédure urgente',
      },
    },
    priority: 6,
  });

  // Rule 7: Residence requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'registeredInCommune',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'documentType',
          operator: 'notIn',
          value: ['passeport'], // Passport can be obtained from consulate
        },
      ],
    },
    event: {
      type: 'residence-registration-required',
      params: {
        reason: 'Inscription au registre de la population requise',
        action: 'Inscrivez-vous d\'abord à votre commune de résidence',
      },
    },
    priority: 9,
  });

  // Rule 8: Parental consent for minors
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: 18,
        },
        {
          fact: 'parentalConsent',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'parental-consent-missing',
      params: {
        reason: 'Consentement parental requis pour les mineurs',
        requirement: 'Les deux parents doivent donner leur accord',
      },
    },
    priority: 10,
  });

  return engine;
}

/**
 * Singleton instance of the identity document rules engine
 */
const identityDocumentEngine = createIdentityDocumentEngine();

/**
 * Calculate document validity period
 */
export function calculateDocumentValidity(age: number, documentType: string): number {
  if (documentType === 'carte-identite' || documentType === 'carte-identite-enfant') {
    return age < 18
      ? CIVIL_RIGHTS_CONSTANTS.ID_CARD_VALIDITY_MINOR
      : CIVIL_RIGHTS_CONSTANTS.ID_CARD_VALIDITY_ADULT;
  }
  if (documentType === 'passeport') {
    return CIVIL_RIGHTS_CONSTANTS.PASSPORT_VALIDITY;
  }
  // Other documents have specific validity periods
  return 5; // Default
}

/**
 * Calculate fees for document request
 */
export function calculateDocumentFees(
  documentType: string,
  urgentProcedure: boolean,
  replacementReason?: string
): number {
  let baseFee = 0;

  // Base fees by document type
  switch (documentType) {
    case 'carte-identite':
      baseFee = CIVIL_RIGHTS_CONSTANTS.ID_CARD_FEE;
      break;
    case 'passeport':
      baseFee = CIVIL_RIGHTS_CONSTANTS.PASSPORT_FEE;
      break;
    case 'carte-identite-enfant':
      baseFee = 10; // Kids-ID is cheaper
      break;
    default:
      baseFee = 20; // Default fee
  }

  // Add urgent procedure fees
  if (urgentProcedure) {
    if (documentType === 'carte-identite') {
      return CIVIL_RIGHTS_CONSTANTS.ID_CARD_URGENT_FEE;
    }
    if (documentType === 'passeport') {
      return CIVIL_RIGHTS_CONSTANTS.PASSPORT_URGENT_FEE;
    }
  }

  // Replacement for loss/theft might have additional fees
  if (replacementReason === 'vole' || replacementReason === 'perdu') {
    baseFee += 10; // Additional administrative fee
  }

  return baseFee;
}

/**
 * Check identity document eligibility
 */
export async function checkIdentityDocumentEligibility(
  request: Partial<CivilRightsRequest>
): Promise<ValidationResult> {
  const facts = {
    documentType: request.type,
    age: calculateAge(request.applicant?.birthDate),
    nationality: request.applicant?.nationality,
    documentStatus: (request as any).currentDocument?.status,
    daysUntilExpiry: calculateDaysUntilExpiry((request as any).currentDocument?.expiryDate),
    photoProvided: !!(request as any).photoProvided,
    photoAge: (request as any).photoAgeDays || 0,
    urgentProcedure: (request as any).urgentProcedure || false,
    travelDate: (request as any).travelDate,
    registeredInCommune: (request as any).registeredInCommune !== false,
    parentalConsent: (request as any).parentalConsent !== false,
  };

  try {
    const results = await identityDocumentEngine.run(facts);

    const errors: any[] = [];
    const warnings: string[] = [];
    const missingDocuments: string[] = [];

    // Process events
    for (const event of results.events) {
      switch (event.type) {
        case 'nationality-requirement-failed':
        case 'residence-registration-required':
        case 'parental-consent-missing':
          errors.push({
            field: event.type,
            message: event.params?.reason || event.params?.message,
            code: event.type,
            severity: 'error',
          });
          break;

        case 'police-declaration-required':
          missingDocuments.push(...(event.params?.documents || []));
          break;

        case 'photo-too-old':
          errors.push({
            field: 'photo',
            message: event.params?.reason,
            code: event.type,
            severity: 'error',
          });
          break;

        case 'renewal-not-yet-needed':
        case 'id-card-age-requirement':
          warnings.push(event.params?.message);
          break;
      }
    }

    // Add standard required documents if no blocking errors
    if (errors.length === 0) {
      if (!facts.photoProvided) {
        missingDocuments.push('Photo d\'identité conforme ICAO');
      }
      if ((request as any).firstRequest) {
        missingDocuments.push('Acte de naissance');
        missingDocuments.push('Certificat de résidence');
      }
    }

    // Calculate fees
    const estimatedFees = calculateDocumentFees(
      request.type || '',
      (request as any).urgentProcedure,
      (request as any).currentDocument?.status
    );

    // Calculate processing time
    const estimatedTime = (request as any).urgentProcedure
      ? CIVIL_RIGHTS_CONSTANTS.URGENT_PROCEDURE_DAYS
      : 7;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingDocuments,
      estimatedFees,
      estimatedTime,
    };
  } catch (error) {
    throw new Error(`Error checking identity document eligibility: ${error}`);
  }
}

/**
 * Helper functions
 */
function calculateAge(birthDate?: Date): number {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function calculateDaysUntilExpiry(expiryDate?: Date): number {
  if (!expiryDate) return 999999; // No expiry
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - today.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Export rules in JSON format for transparency
 */
export const IDENTITY_DOCUMENT_RULES_JSON = {
  legalFramework: {
    primaryLaw: {
      title: 'Loi relative aux registres de la population et aux cartes d\'identité',
      date: '1991-07-19',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991071931&table_name=loi',
    },
    implementingDecree: {
      title: 'Arrêté royal relatif aux cartes d\'identité',
      date: '2003-03-25',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2003032530&table_name=loi',
    },
    euRegulation: {
      title: 'Règlement (UE) 2019/1157',
      description: 'Renforcement de la sécurité des cartes d\'identité',
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32019R1157',
    },
  },
  documentTypes: {
    belgianId: {
      minAge: 12,
      validity: {
        minor: CIVIL_RIGHTS_CONSTANTS.ID_CARD_VALIDITY_MINOR,
        adult: CIVIL_RIGHTS_CONSTANTS.ID_CARD_VALIDITY_ADULT,
      },
      fees: {
        normal: CIVIL_RIGHTS_CONSTANTS.ID_CARD_FEE,
        urgent: CIVIL_RIGHTS_CONSTANTS.ID_CARD_URGENT_FEE,
      },
      processingTime: {
        normal: 7,
        urgent: CIVIL_RIGHTS_CONSTANTS.URGENT_PROCEDURE_DAYS,
      },
    },
    passport: {
      validity: CIVIL_RIGHTS_CONSTANTS.PASSPORT_VALIDITY,
      fees: {
        normal: CIVIL_RIGHTS_CONSTANTS.PASSPORT_FEE,
        urgent: CIVIL_RIGHTS_CONSTANTS.PASSPORT_URGENT_FEE,
      },
    },
    kidsId: {
      maxAge: 12,
      validity: 3,
      fee: 10,
      requiresParentalConsent: true,
    },
  },
};