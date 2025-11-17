/**
 * Business Rules for Council of State Appeals
 *
 * Implements rules for all Council of State procedures based on
 * the coordinated laws on the Council of State.
 *
 * BASE JURIDIQUE:
 * - Lois coordonnées sur le Conseil d'État (12 janvier 1973)
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1973011201
 * - Arrêté royal du 5 décembre 1991 (Procédure)
 * - Arrêté royal du 25 avril 2007 (Greffe électronique)
 */

import { Engine } from 'json-rules-engine';
import {
  AppealApplication,
  AppealProcedureType,
  DeadlineCalculation,
  AdmissibilityCheck,
  AdmissibilityIssue,
  APPEAL_DEADLINES,
  FILING_FEES
} from '../../domain/recoursEtatTypes';

/**
 * Create rules engine for Council of State procedures
 */
function createConseilEtatEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Deadline verification (60 days for annulment)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'equal',
          value: 'conseil-etat-annulation',
        },
        {
          fact: 'daysElapsed',
          operator: 'greaterThan',
          value: 60,
        },
      ],
    },
    event: {
      type: 'deadline-expired',
      params: {
        issue: 'Délai de recours dépassé (60 jours)',
        isFatal: true,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Extreme urgency deadline (5 days)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'equal',
          value: 'conseil-etat-extreme-urgence',
        },
        {
          fact: 'daysElapsed',
          operator: 'greaterThan',
          value: 5,
        },
      ],
    },
    event: {
      type: 'deadline-expired',
      params: {
        issue: 'Délai d\'extrême urgence dépassé (5 jours)',
        isFatal: true,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 3: Standing requirement (intérêt à agir)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasDirectInterest',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'interestDescription',
          operator: 'equal',
          value: '',
        },
      ],
    },
    event: {
      type: 'standing-missing',
      params: {
        issue: 'Absence d\'intérêt à agir démontré',
        isFatal: true,
        correctionPossible: true,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 4: Administrative act requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'in',
          value: ['conseil-etat-annulation', 'conseil-etat-suspension'],
        },
        {
          fact: 'hasAdministrativeAct',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'no-administrative-act',
      params: {
        issue: 'Pas d\'acte administratif attaquable',
        isFatal: true,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 5: Filing fee payment
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'feeRequired',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'feePaid',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'feeExemption',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'fee-not-paid',
      params: {
        issue: 'Droit de timbre non payé',
        isFatal: false,
        correctionPossible: true,
        priority: 7,
      },
    },
    priority: 7,
  });

  // Rule 6: Lawyer requirement for cassation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'equal',
          value: 'conseil-etat-cassation',
        },
        {
          fact: 'hasLawyer',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'lawyer-required',
      params: {
        issue: 'Avocat au Conseil d\'État obligatoire pour la cassation',
        isFatal: true,
        correctionPossible: true,
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 7: Language requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestLanguage',
          operator: 'notIn',
          value: ['fr', 'nl', 'de'],
        },
      ],
    },
    event: {
      type: 'invalid-language',
      params: {
        issue: 'Langue de procédure non valide (FR, NL ou DE requis)',
        isFatal: false,
        correctionPossible: true,
        priority: 6,
      },
    },
    priority: 6,
  });

  // Rule 8: Provisional damage for suspension
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'in',
          value: ['conseil-etat-suspension', 'conseil-etat-extreme-urgence'],
        },
        {
          fact: 'hasProvisionalDamage',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'no-provisional-damage',
      params: {
        issue: 'Préjudice grave difficilement réparable non démontré',
        isFatal: true,
        correctionPossible: true,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 9: Serious grounds requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'in',
          value: ['conseil-etat-annulation', 'conseil-etat-suspension'],
        },
        {
          fact: 'hasSeriousGrounds',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'no-serious-grounds',
      params: {
        issue: 'Moyens sérieux non développés',
        isFatal: false,
        correctionPossible: true,
        priority: 7,
      },
    },
    priority: 7,
  });

  // Rule 10: Prior administrative appeal when required
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'priorAppealRequired',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'priorAppealDone',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'no-prior-appeal',
      params: {
        issue: 'Recours administratif préalable obligatoire non exercé',
        isFatal: true,
        priority: 10,
      },
    },
    priority: 10,
  });

  return engine;
}

/**
 * Singleton instance for Council of State rules
 */
const conseilEtatEngine = createConseilEtatEngine();

/**
 * Calculate deadline for Council of State procedure
 */
export function calculateConseilEtatDeadline(
  procedureType: AppealProcedureType,
  notificationDate: Date,
  currentDate: Date = new Date()
): DeadlineCalculation {
  const deadlineInDays = APPEAL_DEADLINES[procedureType] || 60;

  // Calculate deadline date
  const deadlineDate = new Date(notificationDate);
  deadlineDate.setDate(deadlineDate.getDate() + deadlineInDays);

  // Calculate remaining days
  const timeDiff = deadlineDate.getTime() - currentDate.getTime();
  const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const warnings: string[] = [];

  if (remainingDays <= 7 && remainingDays > 0) {
    warnings.push('Attention: moins d\'une semaine avant l\'expiration du délai');
  }

  if (remainingDays <= 0) {
    warnings.push('Délai expiré - vérifier si force majeure applicable');
  }

  // Special warning for extreme urgency
  if (procedureType === 'conseil-etat-extreme-urgence' && remainingDays <= 2) {
    warnings.push('URGENT: Agir immédiatement - procédure d\'extrême urgence');
  }

  return {
    procedureType,
    notificationDate,
    deadlineInDays,
    calculatedDeadline: deadlineDate,
    remainingDays: Math.max(0, remainingDays),
    isExpired: remainingDays <= 0,
    warnings,
  };
}

/**
 * Check admissibility of Council of State appeal
 */
export async function checkConseilEtatAdmissibility(
  application: Partial<AppealApplication>
): Promise<AdmissibilityCheck> {
  const facts = {
    procedureType: application.procedureType,
    daysElapsed: application.deadline ?
      Math.floor((Date.now() - application.challengedDecision?.notificationDate?.getTime()!) / (1000 * 3600 * 24)) : 0,
    hasDirectInterest: application.standing?.verified || false,
    interestDescription: application.standing?.description || '',
    hasAdministrativeAct: !!application.challengedDecision,
    feeRequired: (FILING_FEES[application.procedureType!] || 0) > 0,
    feePaid: application.filingFee?.paid || false,
    feeExemption: application.filingFee?.exemptionGranted || false,
    hasLawyer: !!application.appellant?.lawyer,
    requestLanguage: application.language || 'fr',
    hasProvisionalDamage: application.requestedRelief?.some(r => r.urgency) || false,
    hasSeriousGrounds: (application.legalGrounds?.length || 0) > 0,
    priorAppealRequired: false, // Would need specific logic per case
    priorAppealDone: false,
  };

  try {
    const results = await conseilEtatEngine.run(facts);

    const issues: AdmissibilityIssue[] = results.events.map((event: any) => ({
      type: mapEventToIssueType(event.type),
      description: event.params?.issue || '',
      isFatal: event.params?.isFatal || false,
      correctionPossible: event.params?.correctionPossible || false,
    }));

    const fatalIssues = issues.filter(i => i.isFatal);
    const correctableIssues = issues.filter(i => i.correctionPossible);

    return {
      isAdmissible: fatalIssues.length === 0,
      issues,
      canBeCorrected: correctableIssues.length > 0 && fatalIssues.every(i => i.correctionPossible),
      correctionDeadline: correctableIssues.length > 0 ?
        new Date(Date.now() + 15 * 24 * 3600 * 1000) : undefined, // 15 days to correct
    };
  } catch (error) {
    throw new Error(`Error checking admissibility: ${error}`);
  }
}

/**
 * Map event type to issue type
 */
function mapEventToIssueType(eventType: string): AdmissibilityIssue['type'] {
  const mapping: Record<string, AdmissibilityIssue['type']> = {
    'deadline-expired': 'deadline',
    'standing-missing': 'standing',
    'no-administrative-act': 'competence',
    'fee-not-paid': 'fee',
    'lawyer-required': 'form',
    'invalid-language': 'language',
    'no-provisional-damage': 'standing',
    'no-serious-grounds': 'form',
    'no-prior-appeal': 'form',
  };

  return mapping[eventType] || 'form';
}

/**
 * Determine urgency level based on circumstances
 */
export function determineUrgencyLevel(
  executionDate?: Date,
  irreversibleDamage?: boolean,
  publicHealth?: boolean
): 'normal' | 'urgent' | 'extreme-urgent' {
  const daysUntilExecution = executionDate ?
    Math.ceil((executionDate.getTime() - Date.now()) / (1000 * 3600 * 24)) : Infinity;

  if (publicHealth || (irreversibleDamage && daysUntilExecution <= 5)) {
    return 'extreme-urgent';
  }

  if (irreversibleDamage || daysUntilExecution <= 30) {
    return 'urgent';
  }

  return 'normal';
}

/**
 * Calculate filing fees including additional costs
 */
export function calculateTotalFees(
  procedureType: AppealProcedureType,
  urgentProcedure: boolean = false,
  numberOfParties: number = 1
): { baseFee: number; additionalFees: number; total: number; breakdown: string[] } {
  const baseFee = FILING_FEES[procedureType] || 0;
  let additionalFees = 0;
  const breakdown: string[] = [`Droit de timbre: ${baseFee}€`];

  // Additional fee for urgent procedures
  if (urgentProcedure && procedureType === 'conseil-etat-suspension') {
    additionalFees += 200;
    breakdown.push('Procédure urgente: 200€');
  }

  // Additional parties (intervening parties)
  if (numberOfParties > 1) {
    const partyFees = (numberOfParties - 1) * 50;
    additionalFees += partyFees;
    breakdown.push(`Parties intervenantes (${numberOfParties - 1}): ${partyFees}€`);
  }

  return {
    baseFee,
    additionalFees,
    total: baseFee + additionalFees,
    breakdown,
  };
}

/**
 * Generate required documents checklist
 */
export function getRequiredDocuments(
  procedureType: AppealProcedureType
): { document: string; required: boolean; description: string }[] {
  const baseDocuments = [
    {
      document: 'Requête en annulation/suspension',
      required: true,
      description: 'Requête signée avec exposé des moyens',
    },
    {
      document: 'Décision attaquée',
      required: true,
      description: 'Copie de l\'acte administratif contesté',
    },
    {
      document: 'Preuve de notification',
      required: true,
      description: 'Preuve de la date de notification ou publication',
    },
    {
      document: 'Preuve d\'intérêt',
      required: true,
      description: 'Documents démontrant l\'intérêt à agir',
    },
    {
      document: 'Preuve de paiement',
      required: true,
      description: 'Justificatif du paiement du droit de timbre',
    },
  ];

  // Add specific documents based on procedure type
  if (procedureType === 'conseil-etat-suspension' ||
      procedureType === 'conseil-etat-extreme-urgence') {
    baseDocuments.push({
      document: 'Justification du préjudice',
      required: true,
      description: 'Preuves du préjudice grave difficilement réparable',
    });
  }

  if (procedureType === 'conseil-etat-cassation') {
    baseDocuments.push({
      document: 'Mandat d\'avocat',
      required: true,
      description: 'Procuration à un avocat au Conseil d\'État',
    });
  }

  return baseDocuments;
}

/**
 * Export comprehensive Council of State rules configuration
 */
export const CONSEIL_ETAT_RULES_CONFIG = {
  procedures: {
    annulation: {
      deadline: 60,
      fee: 200,
      lawyerRequired: false,
      suspensionPossible: true,
    },
    suspension: {
      deadline: 60,
      fee: 200,
      lawyerRequired: false,
      urgencyRequired: true,
    },
    extremeUrgence: {
      deadline: 5,
      fee: 400,
      lawyerRequired: false,
      hearingWithin: 3,
    },
    cassation: {
      deadline: 30,
      fee: 200,
      lawyerRequired: true,
      limitedGrounds: true,
    },
  },

  grounds: [
    'Incompétence de l\'auteur de l\'acte',
    'Vice de forme ou de procédure',
    'Violation de la loi',
    'Détournement de pouvoir',
    'Erreur manifeste d\'appréciation',
    'Défaut de motivation formelle',
    'Violation du principe d\'égalité',
    'Violation du principe de proportionnalité',
  ],

  exceptions: [
    'Force majeure',
    'Erreur invincible',
    'Vice de notification',
    'Fraude de l\'administration',
  ],
};