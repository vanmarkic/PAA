/**
 * Business Rules for Rental Properties in Belgium
 * Implements procedures 11-20 from location.feature
 *
 * BASE JURIDIQUE:
 * - Loi sur les baux d'habitation (intégrée dans Code Civil)
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991022050&table_name=loi
 * - Ordonnance bruxelloise du 27 juillet 2017 (Bruxelles)
 * - Décret wallon du 15 mars 2018 (Wallonie)
 * - Vlaams Woninghuurdecreet (Flandre)
 */

import { Engine } from 'json-rules-engine';
import {
  RentalContract,
  TenantRights,
  RentIndexation,
  BelgianRegion,
  IMMOBILIER_CONSTANTS,
  RentalDispute,
} from '../../domain/immobilierTypes';

/**
 * Create the rental eligibility and compliance engine
 */
function createRentalEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Maximum deposit allowed
  engine.addRule({
    conditions: {
      any: [
        {
          all: [
            {
              fact: 'region',
              operator: 'in',
              value: ['wallonie', 'bruxelles'],
            },
            {
              fact: 'depositMonths',
              operator: 'greaterThan',
              value: 2,
            },
          ],
        },
        {
          all: [
            {
              fact: 'region',
              operator: 'equal',
              value: 'flandre',
            },
            {
              fact: 'depositMonths',
              operator: 'greaterThan',
              value: 3,
            },
          ],
        },
      ],
    },
    event: {
      type: 'illegal-deposit',
      params: {
        reason: 'Garantie locative dépasse le maximum légal',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Rent indexation timing
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'monthsSinceLastIndexation',
          operator: 'lessThan',
          value: 12,
        },
        {
          fact: 'indexationRequested',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'indexation-too-early',
      params: {
        reason: 'Indexation possible uniquement après 12 mois',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: Written notice requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'noticeGiven',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'noticeType',
          operator: 'notEqual',
          value: 'registered_mail',
        },
      ],
    },
    event: {
      type: 'invalid-notice',
      params: {
        reason: 'Préavis doit être donné par recommandé',
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 4: Winter eviction protection
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'evictionMonth',
          operator: 'in',
          value: [12, 1, 2, 3], // December to March
        },
        {
          fact: 'hasMinorChildren',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'winter-eviction-prohibited',
      params: {
        reason: 'Expulsion interdite en période hivernale avec enfants mineurs',
        priority: 10,
      },
    },
    priority: 10,
  });

  return engine;
}

// Singleton instance
const rentalEngineInstance = createRentalEngine();

/**
 * Calculate rent indexation according to Belgian law
 */
export function calculateRentIndexation(
  baseRent: number,
  baseIndex: number,
  currentIndex: number,
  contractStartDate: Date
): RentIndexation {
  // Check if at least one year has passed
  const monthsSinceStart = Math.floor((Date.now() - contractStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  if (monthsSinceStart < 12) {
    throw new Error('Indexation not allowed before 12 months');
  }

  // Calculate new rent
  const newRent = baseRent * (currentIndex / baseIndex);
  const increaseAmount = newRent - baseRent;
  const increasePercentage = (increaseAmount / baseRent) * 100;

  return {
    baseRent,
    baseIndex,
    currentIndex,
    newRent: Math.round(newRent * 100) / 100,
    effectiveDate: new Date(),
    notificationRequired: true,
  };
}

/**
 * Calculate notice period and penalties for early termination
 */
export function calculateNoticeAndPenalties(
  contract: RentalContract,
  isLandlord: boolean,
  reasonForTermination?: string
): {
  noticePeriod: number; // in months
  penalty: number; // in euros
  effectiveDate: Date;
  legalBasis: string;
} {
  const monthsOccupied = Math.floor((Date.now() - contract.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  let noticePeriod = 3; // Default 3 months for tenant
  let penalty = 0;
  let legalBasis = '';

  if (!isLandlord) {
    // Tenant giving notice
    if (contract.duration === '9_years') {
      if (monthsOccupied < 6) {
        penalty = contract.monthlyRent * 3;
        legalBasis = 'Indemnité 3 mois (occupation < 6 mois)';
      } else if (monthsOccupied < 12) {
        penalty = contract.monthlyRent * 2;
        legalBasis = 'Indemnité 2 mois (occupation 6-12 mois)';
      } else if (monthsOccupied < 18) {
        penalty = contract.monthlyRent;
        legalBasis = 'Indemnité 1 mois (occupation 12-18 mois)';
      } else {
        penalty = 0;
        legalBasis = 'Pas d\'indemnité (occupation > 18 mois)';
      }
    } else if (contract.duration === '3_years' || contract.duration === 'short_term') {
      penalty = 0;
      legalBasis = 'Pas d\'indemnité pour bail court terme';
    }
  } else {
    // Landlord giving notice
    if (contract.duration === '9_years') {
      if (reasonForTermination === 'personal_use') {
        noticePeriod = 6;
        legalBasis = 'Occupation personnelle - préavis 6 mois';
      } else if (reasonForTermination === 'renovation') {
        noticePeriod = 6;
        legalBasis = 'Travaux importants - préavis 6 mois';
        if (monthsOccupied < 36) {
          penalty = contract.monthlyRent * 3; // Compensation if less than 3 years
        }
      } else {
        // No valid reason for early termination by landlord in 9-year lease
        throw new Error('Propriétaire ne peut résilier sans motif légal');
      }
    }
  }

  // Calculate effective date (first day of month following notice period)
  const effectiveDate = new Date();
  effectiveDate.setMonth(effectiveDate.getMonth() + noticePeriod + 1);
  effectiveDate.setDate(1);

  return {
    noticePeriod,
    penalty,
    effectiveDate,
    legalBasis,
  };
}

/**
 * Validate rental contract compliance
 */
export async function validateRentalContract(
  region: BelgianRegion,
  monthlyRent: number,
  deposit: number,
  contractType: RentalContract['duration']
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requirements: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const requirements: string[] = [];

  // Check deposit limits
  const depositMonths = deposit / monthlyRent;
  const maxDeposit = IMMOBILIER_CONSTANTS.RENTAL_DEPOSIT[region];

  const facts = {
    region,
    depositMonths,
    indexationRequested: false,
    monthsSinceLastIndexation: 999,
    noticeGiven: false,
    noticeType: 'none',
    evictionMonth: 0,
    hasMinorChildren: false,
  };

  const results = await rentalEngineInstance.run(facts);

  results.events.forEach((event) => {
    if (event.type === 'illegal-deposit') {
      errors.push(`Garantie locative maximum: ${maxDeposit} mois de loyer`);
    }
  });

  // Add mandatory requirements
  requirements.push('Contrat écrit obligatoire');
  requirements.push('État des lieux contradictoire requis');
  requirements.push('Enregistrement dans les 2 mois (gratuit)');
  requirements.push('Certificat PEB à annexer');
  requirements.push('Assurance incendie locataire obligatoire');

  // Add warnings
  if (contractType === 'short_term') {
    warnings.push('Bail courte durée: maximum 3 ans, non renouvelable');
  }

  if (monthlyRent > 2000) {
    warnings.push('Loyer élevé: vérifier la conformité avec les prix du marché');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    requirements,
  };
}

/**
 * Calculate tenant rights based on contract and occupation
 */
export function calculateTenantRights(
  contract: RentalContract,
  monthsOccupied: number
): TenantRights {
  const rights: TenantRights = {
    canSublet: false,
    canMakeMiMinorModifications: true,
    hasRightToRenewal: false,
    protectedAgainstWinterEviction: true,
    requiredNotice: 3,
  };

  // Subletting rights
  if (contract.duration === '9_years' && monthsOccupied > 24) {
    rights.canSublet = true; // With landlord agreement
  }

  // Renewal rights
  if (contract.duration === '3_years') {
    rights.hasRightToRenewal = true; // Once, for 3 years
  } else if (contract.duration === '9_years') {
    rights.hasRightToRenewal = false; // Automatic continuation
  }

  // Early termination penalty
  if (contract.duration === '9_years' && monthsOccupied < 18) {
    const penaltyMonths = monthsOccupied < 6 ? 3 : monthsOccupied < 12 ? 2 : 1;
    rights.penaltyForEarlyTermination = contract.monthlyRent * penaltyMonths;
  }

  return rights;
}

/**
 * Process rental dispute
 */
export function processRentalDispute(dispute: RentalDispute): {
  nextSteps: string[];
  estimatedResolutionTime: string;
  legalOptions: string[];
  costEstimate: number;
} {
  const nextSteps: string[] = [];
  const legalOptions: string[] = [];
  let estimatedResolutionTime = '1-3 mois';
  let costEstimate = 0;

  switch (dispute.type) {
    case 'unpaid_rent':
      nextSteps.push('Envoi mise en demeure par recommandé');
      nextSteps.push('Si non-paiement après 15 jours, citation justice de paix');
      legalOptions.push('Médiation CPAS');
      legalOptions.push('Procédure judiciaire');
      legalOptions.push('Saisie sur salaire/compte');
      costEstimate = 250; // Justice de paix fees
      estimatedResolutionTime = '2-4 mois';
      break;

    case 'deposit_return':
      nextSteps.push('Demande écrite au propriétaire');
      nextSteps.push('État des lieux de sortie contradictoire');
      nextSteps.push('Si désaccord, justice de paix');
      legalOptions.push('Conciliation gratuite');
      legalOptions.push('Procédure justice de paix');
      costEstimate = 90; // Reduced fees for deposit disputes
      estimatedResolutionTime = '1-2 mois';
      break;

    case 'repairs_needed':
      nextSteps.push('Notification écrite au propriétaire');
      nextSteps.push('Si urgence, mise en demeure');
      nextSteps.push('Possibilité de consigner le loyer');
      legalOptions.push('Inspection communale salubrité');
      legalOptions.push('Justice de paix pour travaux');
      costEstimate = 150;
      estimatedResolutionTime = '1-3 mois';
      break;

    case 'illegal_eviction':
      nextSteps.push('Contact police immédiat');
      nextSteps.push('Référé justice de paix en urgence');
      legalOptions.push('Réintégration immédiate');
      legalOptions.push('Dommages et intérêts');
      costEstimate = 500; // Urgent procedure
      estimatedResolutionTime = '1-2 semaines';
      break;

    default:
      nextSteps.push('Tentative de résolution amiable');
      nextSteps.push('Médiation');
      nextSteps.push('Justice de paix si échec');
  }

  return {
    nextSteps,
    estimatedResolutionTime,
    legalOptions,
    costEstimate,
  };
}

/**
 * Check eviction legality
 */
export function checkEvictionLegality(
  hasArrears: boolean,
  monthsOfArrears: number,
  currentMonth: number,
  hasMinorChildren: boolean,
  hasDisability: boolean
): {
  isLegal: boolean;
  reasons: string[];
  protections: string[];
  requiredProcedure: string[];
} {
  const reasons: string[] = [];
  const protections: string[] = [];
  const requiredProcedure: string[] = [];

  // Check winter eviction
  const isWinter = [12, 1, 2, 3].includes(currentMonth);
  if (isWinter && (hasMinorChildren || hasDisability)) {
    protections.push('Protection hivernale active (décembre-mars)');
  }

  // Required procedure
  requiredProcedure.push('Mise en demeure par recommandé');
  requiredProcedure.push('Citation devant justice de paix');
  requiredProcedure.push('Jugement d\'expulsion');
  requiredProcedure.push('Signification par huissier');
  requiredProcedure.push('Délai de grâce possible (1-12 mois)');

  if (hasArrears && monthsOfArrears >= 2) {
    reasons.push(`Arriérés de ${monthsOfArrears} mois de loyer`);
  }

  // Special protections
  if (hasDisability) {
    protections.push('Protection personne handicapée - délai de grâce probable');
  }

  if (hasMinorChildren) {
    protections.push('Présence enfants mineurs - CPAS doit être informé');
  }

  const isLegal = hasArrears && monthsOfArrears >= 2 && !isWinter;

  return {
    isLegal,
    reasons,
    protections,
    requiredProcedure,
  };
}

/**
 * Export rules in JSON format
 */
export const LOCATION_RULES_JSON = {
  legalFramework: {
    federalLaw: {
      title: 'Loi sur les baux d\'habitation',
      date: '20 février 1991',
      integration: 'Code Civil Livre III, Titre VIII, Chapitre II, Section 2',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991022050&table_name=loi',
    },
    regionalLaws: {
      wallonie: 'Décret wallon du 15 mars 2018',
      bruxelles: 'Ordonnance du 27 juillet 2017',
      flandre: 'Vlaams Woninghuurdecreet',
    },
  },
  rules: [
    {
      id: 'deposit-limit',
      description: 'Garantie locative maximum',
      wallonie: '2 mois',
      bruxelles: '2 mois',
      flandre: '3 mois',
    },
    {
      id: 'indexation',
      description: 'Indexation annuelle du loyer',
      formula: 'loyer × (nouvel indice / indice de base)',
      frequency: 'Maximum 1× par an',
    },
    {
      id: 'notice-period',
      description: 'Préavis locataire',
      standard: '3 mois',
      method: 'Recommandé',
    },
    {
      id: 'registration',
      description: 'Enregistrement bail',
      deadline: '2 mois',
      cost: 'Gratuit',
    },
  ],
  depositTypes: ['blocked_account', 'bank_guarantee', 'cpas'],
  contractDurations: ['9_years', '3_years', 'short_term'],
};