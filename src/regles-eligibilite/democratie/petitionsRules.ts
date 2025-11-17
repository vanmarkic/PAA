/**
 * Business Rules for Petitions and Citizen Initiatives
 *
 * BASE JURIDIQUE:
 * - Loi du 28 mars 1932 sur les pétitions
 * - Règlement (UE) 2019/788 relatif à l'initiative citoyenne européenne
 * - Règlements communaux sur le droit d'interpellation
 * - Ordonnance bruxelloise du 18 juillet 2013 sur les consultations populaires
 */

import { Engine } from 'json-rules-engine';
import {
  Petition,
  PetitionType,
  SignaturePetition,
  DemocraticCitizen,
  InitiativeCitoyenne,
  ReponsePetition,
  DEMOCRATIE_CONSTANTS,
  canSignPetition,
} from '../modele-metier/democratieTypes';

/**
 * Petition signature thresholds by level
 */
const PETITION_THRESHOLDS = {
  'petition-federale': DEMOCRATIE_CONSTANTS.PETITION_FEDERALE_MIN_SIGNATURES,
  'petition-regionale': DEMOCRATIE_CONSTANTS.PETITION_REGIONALE_MIN_SIGNATURES,
  'petition-communale': DEMOCRATIE_CONSTANTS.PETITION_COMMUNALE_MIN_SIGNATURES,
  'petition-europeenne': DEMOCRATIE_CONSTANTS.INITIATIVE_CITOYENNE_UE_SIGNATURES,
  'initiative-citoyenne': DEMOCRATIE_CONSTANTS.INITIATIVE_CITOYENNE_UE_SIGNATURES,
};

/**
 * Create the petition rules engine
 */
function createPetitionEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement for signing petitions
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'signerAge',
          operator: 'lessThan',
          value: 16, // Minimum age for local petitions
        },
      ],
    },
    event: {
      type: 'signature-ineligible',
      params: {
        reason: 'Âge minimum non atteint (16 ans pour pétitions locales)',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Federal petition - Belgian citizens only
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'petitionType',
          operator: 'equal',
          value: 'petition-federale',
        },
        {
          fact: 'signerNationalite',
          operator: 'notEqual',
          value: 'belge',
        },
      ],
    },
    event: {
      type: 'signature-ineligible',
      params: {
        reason: 'Pétitions fédérales réservées aux citoyens belges',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: EU petition - EU citizens only
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'petitionType',
          operator: 'in',
          value: ['petition-europeenne', 'initiative-citoyenne'],
        },
        {
          fact: 'signerNationalite',
          operator: 'notIn',
          value: ['belge', 'eu-citoyen'],
        },
      ],
    },
    event: {
      type: 'signature-ineligible',
      params: {
        reason: 'Initiatives européennes réservées aux citoyens UE',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 4: Local petition - residence requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'petitionType',
          operator: 'equal',
          value: 'petition-communale',
        },
        {
          fact: 'signerCommune',
          operator: 'notEqual',
          value: { fact: 'petitionCommune' },
        },
      ],
    },
    event: {
      type: 'signature-ineligible',
      params: {
        reason: 'Vous devez résider dans la commune concernée',
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 5: Duplicate signature prevention
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasAlreadySigned',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'signature-duplicate',
      params: {
        reason: 'Vous avez déjà signé cette pétition',
        priority: 11,
      },
    },
    priority: 11,
  });

  // Rule 6: Petition closed
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'petitionStatus',
          operator: 'notEqual',
          value: 'ouverte',
        },
      ],
    },
    event: {
      type: 'petition-closed',
      params: {
        reason: 'Cette pétition n\'accepte plus de signatures',
        priority: 12,
      },
    },
    priority: 12,
  });

  // Rule 7: Deadline expired
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'deadlineExpired',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'petition-expired',
      params: {
        reason: 'Le délai de collecte des signatures est expiré',
        priority: 12,
      },
    },
    priority: 12,
  });

  // Rule 8: Minimum signatures reached
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'verifiedSignatures',
          operator: 'greaterThanInclusive',
          value: { fact: 'requiredSignatures' },
        },
      ],
    },
    event: {
      type: 'threshold-reached',
      params: {
        message: 'Le seuil de signatures requis est atteint',
        nextStep: 'Soumission aux autorités compétentes',
      },
    },
    priority: 5,
  });

  // Rule 9: European initiative - country quota
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'petitionType',
          operator: 'equal',
          value: 'initiative-citoyenne',
        },
        {
          fact: 'countriesWithMinimum',
          operator: 'lessThan',
          value: DEMOCRATIE_CONSTANTS.INITIATIVE_CITOYENNE_UE_PAYS_MIN,
        },
      ],
    },
    event: {
      type: 'eu-quota-incomplete',
      params: {
        message: `Minimum ${DEMOCRATIE_CONSTANTS.INITIATIVE_CITOYENNE_UE_PAYS_MIN} pays membres requis`,
        priority: 7,
      },
    },
    priority: 7,
  });

  return engine;
}

/**
 * Singleton instance of the petition engine
 */
const petitionEngineInstance = createPetitionEngine();

/**
 * Validate petition signature
 */
export async function validatePetitionSignature(
  petition: Petition,
  signer: Partial<SignaturePetition['signataire']>,
  citizen?: DemocraticCitizen
): Promise<{ valid: boolean; reason?: string }> {
  // Check if petition is open
  if (petition.statut !== 'ouverte') {
    return { valid: false, reason: 'Pétition fermée aux signatures' };
  }

  // Check deadline
  if (petition.dateCloture && new Date() > petition.dateCloture) {
    return { valid: false, reason: 'Délai de signature expiré' };
  }

  // Check for duplicate signature
  const hasSigned = petition.signatures.some(
    (sig) => sig.signataire.numeroNational === signer.numeroNational && sig.valide
  );

  if (hasSigned) {
    return { valid: false, reason: 'Signature déjà enregistrée' };
  }

  // Run rules engine
  const facts = {
    signerAge: citizen?.age || calculateAgeFromNN(signer.numeroNational || ''),
    signerNationalite: citizen?.nationalite || 'belge',
    signerCommune: signer.commune,
    petitionType: petition.type,
    petitionCommune: extractCommuneFromPetition(petition),
    hasAlreadySigned: hasSigned,
    petitionStatus: petition.statut,
    deadlineExpired: petition.dateCloture ? new Date() > petition.dateCloture : false,
    verifiedSignatures: petition.signaturesVerifiees,
    requiredSignatures: petition.objectifSignatures,
  };

  try {
    const results = await petitionEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvent = results.events.find((e) =>
      ['signature-ineligible', 'signature-duplicate', 'petition-closed', 'petition-expired'].includes(e.type)
    );

    if (ineligibleEvent) {
      return { valid: false, reason: ineligibleEvent.params?.reason };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: `Erreur de validation: ${error}` };
  }
}

/**
 * Create a new petition
 */
export async function createPetition(
  organisateur: DemocraticCitizen,
  details: {
    type: PetitionType;
    titre: string;
    description: string;
    niveau: 'federal' | 'regional' | 'communal' | 'europeen';
    dureeCollecteMois?: number;
  }
): Promise<Petition> {
  // Validate organizer eligibility
  if (organisateur.age < 18) {
    throw new Error('L\'organisateur doit avoir au moins 18 ans');
  }

  // Determine signature threshold
  const objectifSignatures = PETITION_THRESHOLDS[details.type];

  // Calculate deadline based on petition level
  const dureeCollecte = details.dureeCollecteMois || getDefaultCollectionPeriod(details.niveau);
  const dateCloture = new Date();
  dateCloture.setMonth(dateCloture.getMonth() + dureeCollecte);

  return {
    id: generatePetitionId(),
    type: details.type,
    titre: details.titre,
    description: details.description,
    organisateurId: organisateur.id,
    dateCreation: new Date(),
    dateCloture,
    objectifSignatures,
    signaturesVerifiees: 0,
    signaturesRejetees: 0,
    niveau: details.niveau,
    statut: 'ouverte',
    signatures: [],
  };
}

/**
 * Process signature verification
 */
export async function verifySignature(
  signature: SignaturePetition,
  petition: Petition
): Promise<{ verified: boolean; reason?: string }> {
  // Verify national number format
  if (!isValidNationalNumber(signature.signataire.numeroNational)) {
    return { verified: false, reason: 'Numéro national invalide' };
  }

  // Verify residence for local petitions
  if (petition.niveau === 'communal') {
    const petitionCommune = extractCommuneFromPetition(petition);
    if (signature.signataire.commune !== petitionCommune) {
      return { verified: false, reason: 'Non-résident de la commune' };
    }
  }

  // Check age requirement
  const age = calculateAgeFromNN(signature.signataire.numeroNational);
  if (age < 16) {
    return { verified: false, reason: 'Âge minimum non atteint' };
  }

  return { verified: true };
}

/**
 * Check if petition threshold is reached
 */
export function checkThresholdReached(petition: Petition): {
  reached: boolean;
  percentage: number;
  remaining: number;
} {
  const percentage = (petition.signaturesVerifiees / petition.objectifSignatures) * 100;
  const reached = petition.signaturesVerifiees >= petition.objectifSignatures;
  const remaining = Math.max(0, petition.objectifSignatures - petition.signaturesVerifiees);

  return { reached, percentage, remaining };
}

/**
 * Submit petition to authorities
 */
export async function submitPetitionToAuthorities(
  petition: Petition
): Promise<{ submitted: boolean; authority: string; referenceNumber: string }> {
  const threshold = checkThresholdReached(petition);

  if (!threshold.reached) {
    throw new Error(`Seuil non atteint: ${threshold.remaining} signatures manquantes`);
  }

  // Determine receiving authority
  let authority = '';
  switch (petition.niveau) {
    case 'federal':
      authority = 'Chambre des Représentants';
      break;
    case 'regional':
      authority = getRegionalParliament(petition);
      break;
    case 'communal':
      authority = `Conseil communal de ${extractCommuneFromPetition(petition)}`;
      break;
    case 'europeen':
      authority = 'Commission Européenne';
      break;
  }

  const referenceNumber = generateSubmissionReference(petition);

  return {
    submitted: true,
    authority,
    referenceNumber,
  };
}

/**
 * Process authority response to petition
 */
export function processAuthorityResponse(
  petition: Petition,
  response: Omit<ReponsePetition, 'dateReponse'>
): ReponsePetition {
  return {
    ...response,
    dateReponse: new Date(),
  };
}

// Helper functions
function calculateAgeFromNN(numeroNational: string): number {
  if (!numeroNational || numeroNational.length < 6) return 0;

  const yearPart = parseInt(numeroNational.substr(0, 2));
  const monthPart = parseInt(numeroNational.substr(2, 2));
  const dayPart = parseInt(numeroNational.substr(4, 2));

  // Determine century (simplified)
  const currentYear = new Date().getFullYear();
  const century = yearPart > (currentYear % 100) ? 1900 : 2000;
  const birthYear = century + yearPart;

  const birthDate = new Date(birthYear, monthPart - 1, dayPart);
  const ageDiff = Date.now() - birthDate.getTime();
  return Math.floor(ageDiff / (365.25 * 24 * 60 * 60 * 1000));
}

function isValidNationalNumber(nn: string): boolean {
  if (!nn || nn.length !== 11) return false;

  // Basic validation (simplified)
  const checkDigits = parseInt(nn.substr(9, 2));
  const number = parseInt(nn.substr(0, 9));
  const modulo = 97 - (number % 97);

  return modulo === checkDigits;
}

function extractCommuneFromPetition(petition: Petition): string {
  // Extract commune from petition context
  // This would be stored in petition metadata in production
  return 'Bruxelles'; // Default for example
}

function getDefaultCollectionPeriod(niveau: string): number {
  switch (niveau) {
    case 'federal':
      return 12;
    case 'regional':
      return 9;
    case 'communal':
      return 6;
    case 'europeen':
      return 12;
    default:
      return 6;
  }
}

function generatePetitionId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `PET-${timestamp}-${random}`;
}

function generateSubmissionReference(petition: Petition): string {
  const year = new Date().getFullYear();
  const type = petition.type.substr(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 100000);
  return `${year}/${type}/${random.toString().padStart(5, '0')}`;
}

function getRegionalParliament(petition: Petition): string {
  // Determine regional parliament based on petition context
  // This would check the region from petition metadata
  return 'Parlement Wallon'; // Default for example
}

/**
 * Export petition rules in JSON format
 */
export const PETITION_RULES_JSON = {
  legalFramework: {
    federal: {
      title: 'Loi du 28 mars 1932 sur les pétitions',
      url: 'https://www.ejustice.just.fgov.be',
    },
    european: {
      title: 'Règlement (UE) 2019/788',
      description: 'Initiative citoyenne européenne',
    },
  },
  thresholds: PETITION_THRESHOLDS,
  ageRequirements: {
    local: 16,
    federal: 18,
    organizer: 18,
  },
  collectionPeriods: {
    federal: '12 mois',
    regional: '9 mois',
    communal: '6 mois',
    european: '12 mois',
  },
  verificationCriteria: [
    'Numéro national valide',
    'Âge minimum respecté',
    'Résidence vérifiée (pour pétitions locales)',
    'Pas de signature en double',
    'Délai non expiré',
  ],
};