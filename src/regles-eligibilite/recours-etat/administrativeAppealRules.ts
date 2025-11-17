/**
 * Business Rules for Administrative Appeals
 *
 * Implements rules for gracious appeals, hierarchical appeals,
 * ombudsman procedures, and access to documents.
 *
 * BASE JURIDIQUE:
 * - Loi du 29 juillet 1991 relative à la motivation formelle des actes administratifs
 * - Loi du 11 avril 1994 relative à la publicité de l'administration
 * - Loi du 22 mars 1995 instaurant des médiateurs fédéraux
 * - Charte de l'utilisateur des services publics (1992)
 */

import { Engine } from 'json-rules-engine';
import {
  AppealApplication,
  AppealProcedureType,
  AdmissibilityCheck,
  OmbudsmanComplaint,
  AccessToDocumentsRequest,
  ProcedureRecommendation,
  APPEAL_DEADLINES,
} from '../modele-metier/recoursEtatTypes';

/**
 * Create rules engine for administrative appeals
 */
function createAdministrativeAppealEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Prior contact requirement for ombudsman
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'in',
          value: [
            'mediateur-federal',
            'mediateur-regional',
            'mediateur-communal',
            'mediateur-pensions',
            'mediateur-energie',
          ],
        },
        {
          fact: 'priorContactAttempted',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'no-prior-contact',
      params: {
        issue: 'Contact préalable avec l\'administration requis',
        isFatal: true,
        correctionPossible: true,
        recommendation: 'Contactez d\'abord l\'administration concernée',
      },
    },
    priority: 10,
  });

  // Rule 2: Time limit for ombudsman (1 year recommended)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'in',
          value: ['mediateur-federal', 'mediateur-regional'],
        },
        {
          fact: 'daysSinceIncident',
          operator: 'greaterThan',
          value: 365,
        },
      ],
    },
    event: {
      type: 'delay-exceeded',
      params: {
        issue: 'Délai d\'un an recommandé dépassé',
        isFatal: false,
        warning: 'La plainte reste recevable mais son traitement peut être refusé',
      },
    },
    priority: 7,
  });

  // Rule 3: Anonymous complaints not accepted
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isAnonymous',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'anonymous-complaint',
      params: {
        issue: 'Les plaintes anonymes ne sont pas recevables',
        isFatal: true,
        correctionPossible: true,
      },
    },
    priority: 10,
  });

  // Rule 4: Judicial proceedings exclusion
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'judicialProceedingsOngoing',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'procedureType',
          operator: 'in',
          value: ['mediateur-federal', 'mediateur-regional'],
        },
      ],
    },
    event: {
      type: 'judicial-proceedings',
      params: {
        issue: 'Irrecevable si une procédure judiciaire est en cours',
        isFatal: true,
        correctionPossible: false,
      },
    },
    priority: 10,
  });

  // Rule 5: Access to documents - clear identification required
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'equal',
          value: 'acces-documents-administratifs',
        },
        {
          fact: 'documentIdentified',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'document-not-identified',
      params: {
        issue: 'Le document demandé n\'est pas clairement identifié',
        isFatal: false,
        correctionPossible: true,
        recommendation: 'Précisez le document souhaité',
      },
    },
    priority: 8,
  });

  // Rule 6: Tax complaint deadline (6 months)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'equal',
          value: 'reclamation-fiscale',
        },
        {
          fact: 'daysSinceAssessment',
          operator: 'greaterThan',
          value: 180,
        },
      ],
    },
    event: {
      type: 'tax-deadline-expired',
      params: {
        issue: 'Délai de réclamation fiscale dépassé (6 mois)',
        isFatal: true,
        correctionPossible: false,
        exception: 'Sauf circonstances exceptionnelles prouvées',
      },
    },
    priority: 10,
  });

  // Rule 7: Hierarchical appeal availability
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'equal',
          value: 'recours-administratif-hierarchique',
        },
        {
          fact: 'hierarchicalSuperiorExists',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'no-hierarchical-superior',
      params: {
        issue: 'Pas de supérieur hiérarchique identifiable',
        isFatal: true,
        alternative: 'Considérez un recours gracieux ou contentieux',
      },
    },
    priority: 9,
  });

  // Rule 8: Gracious appeal - no strict deadline but reasonable time
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'equal',
          value: 'recours-administratif-gracieux',
        },
        {
          fact: 'daysSinceDecision',
          operator: 'greaterThan',
          value: 120,
        },
      ],
    },
    event: {
      type: 'late-gracious-appeal',
      params: {
        issue: 'Délai déraisonnable pour un recours gracieux',
        isFatal: false,
        warning: 'L\'administration peut rejeter pour délai déraisonnable',
      },
    },
    priority: 6,
  });

  // Rule 9: CPAS appeals to labor court
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'equal',
          value: 'recours-cpas',
        },
        {
          fact: 'daysSinceDecision',
          operator: 'greaterThan',
          value: 90,
        },
      ],
    },
    event: {
      type: 'cpas-deadline-expired',
      params: {
        issue: 'Délai de recours CPAS dépassé (3 mois)',
        isFatal: true,
        tribunal: 'Tribunal du travail',
      },
    },
    priority: 10,
  });

  // Rule 10: Building permit appeal deadline
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'in',
          value: ['recours-permis-urbanisme', 'recours-permis-environnement'],
        },
        {
          fact: 'daysSinceNotification',
          operator: 'greaterThan',
          value: 30,
        },
      ],
    },
    event: {
      type: 'permit-deadline-expired',
      params: {
        issue: 'Délai de recours permis dépassé (30 jours)',
        isFatal: true,
      },
    },
    priority: 10,
  });

  return engine;
}

/**
 * Singleton instance
 */
const administrativeAppealEngine = createAdministrativeAppealEngine();

/**
 * Check admissibility of administrative appeal
 */
export async function checkAdministrativeAppealAdmissibility(
  application: Partial<AppealApplication>
): Promise<AdmissibilityCheck> {
  const notificationDate = application.challengedDecision?.notificationDate || new Date();
  const daysSince = Math.floor((Date.now() - notificationDate.getTime()) / (1000 * 3600 * 24));

  const facts = {
    procedureType: application.procedureType,
    priorContactAttempted: true, // Would need specific check
    daysSinceIncident: daysSince,
    daysSinceDecision: daysSince,
    daysSinceAssessment: daysSince,
    daysSinceNotification: daysSince,
    isAnonymous: !application.appellant?.firstName && !application.appellant?.companyName,
    judicialProceedingsOngoing: false, // Would need specific check
    documentIdentified: true, // For document access requests
    hierarchicalSuperiorExists: true, // Would need org chart lookup
  };

  try {
    const results = await administrativeAppealEngine.run(facts);

    const issues = results.events.map((event: any) => ({
      type: 'form' as const,
      description: event.params?.issue || '',
      isFatal: event.params?.isFatal || false,
      correctionPossible: event.params?.correctionPossible || false,
    }));

    return {
      isAdmissible: !issues.some(i => i.isFatal),
      issues,
      canBeCorrected: issues.some(i => i.correctionPossible),
    };
  } catch (error) {
    throw new Error(`Error checking administrative appeal admissibility: ${error}`);
  }
}

/**
 * Recommend appropriate procedure based on situation
 */
export function recommendAppealProcedure(
  decisionType: string,
  authority: string,
  hasTriedInternally: boolean,
  urgency: boolean
): ProcedureRecommendation {
  // Tax matters
  if (decisionType === 'tax-assessment' || authority.includes('SPF Finances')) {
    return {
      recommendedProcedure: 'reclamation-fiscale',
      reason: 'Réclamation fiscale obligatoire avant recours judiciaire',
      alternativeProcedures: ['procedure-amiable-fiscale'],
      estimatedDuration: '6-9 mois',
      estimatedCost: 0,
      successLikelihood: 'medium',
    };
  }

  // Social security matters
  if (authority.includes('CPAS') || authority.includes('ONEM')) {
    return {
      recommendedProcedure: 'recours-cpas',
      reason: 'Compétence du tribunal du travail pour les matières sociales',
      alternativeProcedures: ['mediateur-federal'],
      estimatedDuration: '3-6 mois',
      estimatedCost: 0,
      successLikelihood: 'medium',
    };
  }

  // Administrative decisions with hierarchy
  if (!hasTriedInternally && !urgency) {
    return {
      recommendedProcedure: 'recours-administratif-hierarchique',
      reason: 'Tentez d\'abord un recours hiérarchique amiable',
      alternativeProcedures: ['recours-administratif-gracieux', 'mediateur-federal'],
      estimatedDuration: '2-3 mois',
      estimatedCost: 0,
      successLikelihood: 'medium',
    };
  }

  // Urgent matters requiring suspension
  if (urgency) {
    return {
      recommendedProcedure: 'conseil-etat-suspension',
      reason: 'Suspension urgente nécessaire pour éviter un préjudice',
      alternativeProcedures: ['conseil-etat-extreme-urgence'],
      estimatedDuration: '1-3 mois',
      estimatedCost: 200,
      successLikelihood: 'low',
    };
  }

  // Default: Council of State annulment
  return {
    recommendedProcedure: 'conseil-etat-annulation',
    reason: 'Recours en annulation pour acte administratif illégal',
    alternativeProcedures: ['mediateur-federal', 'recours-administratif-gracieux'],
    estimatedDuration: '12-24 mois',
    estimatedCost: 200,
    successLikelihood: 'medium',
  };
}

/**
 * Process ombudsman complaint
 */
export function processOmbudsmanComplaint(
  complaint: OmbudsmanComplaint
): {
  isAdmissible: boolean;
  issues: string[];
  nextSteps: string[];
} {
  const issues: string[] = [];
  const nextSteps: string[] = [];

  // Check prior contact
  if (!complaint.previousSteps || complaint.previousSteps.length === 0) {
    issues.push('Contact préalable avec l\'administration requis');
    nextSteps.push('Contactez d\'abord le service concerné');
  }

  // Check identification
  if (!complaint.complainant.firstName && !complaint.complainant.companyName) {
    issues.push('Identification du plaignant requise');
    nextSteps.push('Fournir vos coordonnées complètes');
  }

  // Provide next steps based on status
  if (complaint.status === 'received') {
    nextSteps.push('Le médiateur examinera la recevabilité');
    nextSteps.push('Vous serez contacté pour information complémentaire si nécessaire');
  } else if (complaint.status === 'under-investigation') {
    nextSteps.push('Enquête en cours auprès de l\'administration');
    nextSteps.push('Un rapport sera établi avec recommandations');
  }

  return {
    isAdmissible: issues.length === 0,
    issues,
    nextSteps,
  };
}

/**
 * Process access to documents request
 */
export function processDocumentAccessRequest(
  request: AccessToDocumentsRequest
): {
  exceptions: string[];
  estimatedResponseTime: number;
  appealPossible: boolean;
} {
  const exceptions: string[] = [];

  // Check common exceptions
  request.documentsRequested.forEach(doc => {
    if (doc.includes('personnel') || doc.includes('RH')) {
      exceptions.push('Protection de la vie privée possible');
    }
    if (doc.includes('délibération') || doc.includes('préparatoire')) {
      exceptions.push('Documents préparatoires possiblement exclus');
    }
    if (doc.includes('sécurité') || doc.includes('défense')) {
      exceptions.push('Sécurité publique peut justifier refus');
    }
  });

  return {
    exceptions,
    estimatedResponseTime: 30, // days
    appealPossible: request.status === 'refused',
  };
}

/**
 * Calculate silence valant décision (administrative silence)
 */
export function calculateAdministrativeSilence(
  requestDate: Date,
  specificDelay?: number
): {
  silenceDate: Date;
  isImplicitRefusal: boolean;
  canAppeal: boolean;
} {
  const delayInDays = specificDelay || 120; // 4 months default
  const silenceDate = new Date(requestDate);
  silenceDate.setDate(silenceDate.getDate() + delayInDays);

  const now = new Date();
  const isImplicitRefusal = now > silenceDate;

  return {
    silenceDate,
    isImplicitRefusal,
    canAppeal: isImplicitRefusal,
  };
}

/**
 * Export administrative appeal configuration
 */
export const ADMINISTRATIVE_APPEAL_CONFIG = {
  graciousAppeal: {
    deadline: 'Pas de délai strict mais délai raisonnable',
    cost: 0,
    authority: 'Auteur de l\'acte',
    suspensive: false,
  },
  hierarchicalAppeal: {
    deadline: 30,
    cost: 0,
    authority: 'Supérieur hiérarchique',
    suspensive: 'Parfois',
  },
  ombudsman: {
    deadline: 365,
    cost: 0,
    requiresPriorContact: true,
    binding: false,
  },
  documentAccess: {
    responseTime: 30,
    cost: 'Frais de copie uniquement',
    exceptions: [
      'Vie privée',
      'Sécurité publique',
      'Documents préparatoires',
      'Secret commercial',
      'Procédures judiciaires en cours',
    ],
  },
  fiscalComplaint: {
    deadline: 180,
    mandatory: true,
    suspensive: 'Sur demande',
  },
};