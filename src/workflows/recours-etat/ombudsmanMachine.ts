/**
 * XState machine for Ombudsman/Mediator Procedures
 *
 * This state machine represents the workflow for filing complaints
 * with various ombudsman services in Belgium.
 */

import { createMachine, assign } from 'xstate';
import {
  OmbudsmanComplaint,
  Appellant,
  PublicAuthority,
} from '../../domain/recoursEtatTypes';

interface OmbudsmanContext {
  complaint: OmbudsmanComplaint | null;
  priorContactAttempts: string[];
  investigationNotes: string[];
  recommendations: string[];
  authorityResponse: string | null;
  resolutionAchieved: boolean;
  errors: string[];
  retryCount: number;
}

export const ombudsmanMachine = createMachine({
  id: 'ombudsmanProcedure',
  initial: 'idle',

  schemas: {
    context: {} as OmbudsmanContext,
    events: {} as
      | { type: 'START_COMPLAINT'; complaint: OmbudsmanComplaint }
      | { type: 'VERIFY_PRIOR_CONTACT' }
      | { type: 'PRIOR_CONTACT_CONFIRMED'; attempts: string[] }
      | { type: 'PRIOR_CONTACT_MISSING' }
      | { type: 'SUBMIT_COMPLAINT' }
      | { type: 'COMPLAINT_RECEIVED' }
      | { type: 'START_INVESTIGATION' }
      | { type: 'REQUEST_INFORMATION'; from: 'complainant' | 'administration' }
      | { type: 'INFORMATION_RECEIVED'; notes: string }
      | { type: 'ATTEMPT_MEDIATION' }
      | { type: 'MEDIATION_SUCCESSFUL'; resolution: string }
      | { type: 'MEDIATION_FAILED' }
      | { type: 'ISSUE_RECOMMENDATIONS'; recommendations: string[] }
      | { type: 'AUTHORITY_RESPONDS'; response: string }
      | { type: 'CLOSE_FILE' }
      | { type: 'WITHDRAW' }
      | { type: 'ESCALATE' }
  },

  context: {
    complaint: null,
    priorContactAttempts: [],
    investigationNotes: [],
    recommendations: [],
    authorityResponse: null,
    resolutionAchieved: false,
    errors: [],
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        START_COMPLAINT: {
          target: 'checkingPriorContact',
          actions: assign({
            complaint: ({ event }) => event.complaint,
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'En attente d\'une nouvelle plainte',
      },
    },

    checkingPriorContact: {
      on: {
        PRIOR_CONTACT_CONFIRMED: {
          target: 'receivingComplaint',
          actions: assign({
            priorContactAttempts: ({ event }) => event.attempts,
          }),
        },
        PRIOR_CONTACT_MISSING: {
          target: 'requiresPriorContact',
        },
      },
      meta: {
        description: 'Vérification du contact préalable avec l\'administration',
      },
    },

    requiresPriorContact: {
      on: {
        VERIFY_PRIOR_CONTACT: {
          target: 'checkingPriorContact',
        },
        WITHDRAW: {
          target: 'withdrawn',
        },
      },
      meta: {
        description: 'Contact préalable avec l\'administration requis avant médiation',
      },
    },

    receivingComplaint: {
      on: {
        SUBMIT_COMPLAINT: {
          target: 'examiningAdmissibility',
        },
        WITHDRAW: {
          target: 'withdrawn',
        },
      },
      meta: {
        description: 'Réception et enregistrement de la plainte',
      },
    },

    examiningAdmissibility: {
      on: {
        COMPLAINT_RECEIVED: [
          {
            target: 'investigating',
            guard: ({ context }) => {
              // Check if complaint is admissible
              return !!(
                context.complaint?.complainant?.firstName ||
                context.complaint?.complainant?.companyName
              ) && context.priorContactAttempts.length > 0;
            },
          },
          {
            target: 'inadmissible',
          },
        ],
      },
      meta: {
        description: 'Examen de la recevabilité de la plainte',
      },
    },

    inadmissible: {
      type: 'final',
      meta: {
        description: 'Plainte irrecevable - orientation vers autre procédure',
      },
    },

    investigating: {
      initial: 'collectingInformation',
      states: {
        collectingInformation: {
          on: {
            REQUEST_INFORMATION: {
              target: 'awaitingInformation',
            },
            START_INVESTIGATION: {
              target: 'analyzingCase',
            },
          },
          meta: {
            description: 'Collecte d\'informations auprès des parties',
          },
        },

        awaitingInformation: {
          on: {
            INFORMATION_RECEIVED: {
              target: 'analyzingCase',
              actions: assign({
                investigationNotes: ({ context, event }) => [
                  ...context.investigationNotes,
                  event.notes,
                ],
              }),
            },
          },
          meta: {
            description: 'En attente d\'informations complémentaires',
          },
        },

        analyzingCase: {
          on: {
            ATTEMPT_MEDIATION: {
              target: 'mediating',
            },
            ISSUE_RECOMMENDATIONS: {
              target: 'recommendationsIssued',
              actions: assign({
                recommendations: ({ event }) => event.recommendations,
              }),
            },
          },
          meta: {
            description: 'Analyse du dossier et recherche de solutions',
          },
        },

        mediating: {
          on: {
            MEDIATION_SUCCESSFUL: {
              target: '#ombudsmanProcedure.resolved',
              actions: assign({
                resolutionAchieved: true,
              }),
            },
            MEDIATION_FAILED: {
              target: 'recommendationsIssued',
            },
          },
          meta: {
            description: 'Tentative de médiation entre les parties',
          },
        },

        recommendationsIssued: {
          on: {
            AUTHORITY_RESPONDS: {
              target: 'followingUp',
              actions: assign({
                authorityResponse: ({ event }) => event.response,
              }),
            },
          },
          after: {
            60000: 'followingUp', // 60 days timeout
          },
          meta: {
            description: 'Recommandations émises à l\'administration',
          },
        },

        followingUp: {
          on: {
            CLOSE_FILE: {
              target: '#ombudsmanProcedure.closed',
            },
            ESCALATE: {
              target: '#ombudsmanProcedure.escalated',
            },
          },
          meta: {
            description: 'Suivi de la mise en œuvre des recommandations',
          },
        },
      },
    },

    resolved: {
      on: {
        CLOSE_FILE: {
          target: 'closed',
        },
      },
      meta: {
        description: 'Résolution amiable obtenue par médiation',
      },
    },

    escalated: {
      type: 'final',
      meta: {
        description: 'Dossier escaladé au Parlement ou autre autorité',
      },
    },

    closed: {
      type: 'final',
      meta: {
        description: 'Dossier clôturé',
      },
    },

    withdrawn: {
      type: 'final',
      meta: {
        description: 'Plainte retirée par le plaignant',
      },
    },
  },
});

/**
 * Determine which ombudsman to contact based on the authority
 */
export function selectAppropriateOmbudsman(
  authority: PublicAuthority
): {
  ombudsmanType: string;
  name: string;
  competence: string;
  contactMethod: string[];
} {
  const authorityType = authority.type;
  const authorityName = authority.name.toLowerCase();

  // Federal matters
  if (authorityType === 'federal' || authorityName.includes('spf')) {
    return {
      ombudsmanType: 'mediateur-federal',
      name: 'Médiateur fédéral',
      competence: 'Administrations et services publics fédéraux',
      contactMethod: ['online', 'courrier', 'telephone', 'permanence'],
    };
  }

  // Regional matters
  if (authorityType === 'regional') {
    if (authorityName.includes('wallon')) {
      return {
        ombudsmanType: 'mediateur-regional',
        name: 'Médiateur de la Wallonie',
        competence: 'Services du Gouvernement wallon',
        contactMethod: ['online', 'courrier', 'telephone'],
      };
    }
    if (authorityName.includes('bruxelles')) {
      return {
        ombudsmanType: 'mediateur-regional',
        name: 'Médiateur de la Région de Bruxelles-Capitale',
        competence: 'Administration régionale bruxelloise',
        contactMethod: ['online', 'courrier', 'telephone'],
      };
    }
  }

  // Municipal matters
  if (authorityType === 'municipal' || authorityName.includes('commune')) {
    return {
      ombudsmanType: 'mediateur-communal',
      name: 'Médiateur communal (si existant)',
      competence: 'Services communaux et CPAS',
      contactMethod: ['permanence', 'courrier', 'email'],
    };
  }

  // Specific sectors
  if (authorityName.includes('pension') || authorityName.includes('sfp')) {
    return {
      ombudsmanType: 'mediateur-pensions',
      name: 'Service de médiation Pensions',
      competence: 'Pensions légales et complémentaires',
      contactMethod: ['online', 'courrier', 'telephone'],
    };
  }

  if (authorityName.includes('energie') || authorityName.includes('creg')) {
    return {
      ombudsmanType: 'mediateur-energie',
      name: 'Service de médiation de l\'Énergie',
      competence: 'Fournisseurs d\'énergie et gestionnaires de réseau',
      contactMethod: ['online', 'courrier', 'telephone'],
    };
  }

  // Default to federal mediator
  return {
    ombudsmanType: 'mediateur-federal',
    name: 'Médiateur fédéral',
    competence: 'Compétence générale résiduelle',
    contactMethod: ['online', 'courrier', 'telephone', 'permanence'],
  };
}

/**
 * Generate timeline for ombudsman procedure
 */
export function estimateOmbudsmanTimeline(): {
  phase: string;
  estimatedDuration: string;
  description: string;
}[] {
  return [
    {
      phase: 'Contact préalable',
      estimatedDuration: '1-4 semaines',
      description: 'Contact initial avec l\'administration concernée',
    },
    {
      phase: 'Dépôt de la plainte',
      estimatedDuration: '1 semaine',
      description: 'Soumission de la plainte au médiateur',
    },
    {
      phase: 'Examen de recevabilité',
      estimatedDuration: '1-2 semaines',
      description: 'Vérification des conditions de recevabilité',
    },
    {
      phase: 'Investigation',
      estimatedDuration: '1-3 mois',
      description: 'Collecte d\'informations et analyse du dossier',
    },
    {
      phase: 'Médiation/Recommandations',
      estimatedDuration: '1-2 mois',
      description: 'Tentative de médiation ou émission de recommandations',
    },
    {
      phase: 'Suivi',
      estimatedDuration: '1-6 mois',
      description: 'Suivi de la mise en œuvre des recommandations',
    },
  ];
}

/**
 * Check if a complaint requires prior contact
 */
export function requiresPriorContact(
  ombudsmanType: string,
  urgency: boolean = false
): {
  required: boolean;
  exceptions: string[];
  alternativeProcedures: string[];
} {
  // Most ombudsmen require prior contact
  const generalRequirement = {
    required: true,
    exceptions: [
      'Situation d\'urgence extrême',
      'Risque de représailles',
      'Administration refuse tout dialogue',
      'Délai de recours court',
    ],
    alternativeProcedures: [
      'Recours gracieux',
      'Recours hiérarchique',
      'Contact direct avec le service',
    ],
  };

  // Some specific ombudsmen have different rules
  if (ombudsmanType === 'mediateur-energie') {
    return {
      required: true,
      exceptions: ['Coupure imminente', 'Danger pour la santé'],
      alternativeProcedures: ['Service clientèle du fournisseur'],
    };
  }

  if (urgency) {
    generalRequirement.required = false;
  }

  return generalRequirement;
}

/**
 * Generate ombudsman complaint template
 */
export function generateComplaintTemplate(
  ombudsmanType: string,
  authority: string,
  subject: string
): string {
  return `
Objet: Plainte concernant ${subject}

Madame, Monsieur le Médiateur,

Je me permets de vous soumettre la présente plainte concernant ${authority}.

1. DÉMARCHES PRÉALABLES EFFECTUÉES:
[Décrire les contacts avec l'administration, dates, personnes contactées, réponses reçues]

2. OBJET DE LA PLAINTE:
[Exposer clairement le problème rencontré]

3. PRÉJUDICE SUBI:
[Décrire l'impact de la situation]

4. SOLUTION SOUHAITÉE:
[Indiquer le résultat attendu]

5. PIÈCES JOINTES:
- Copie de la correspondance avec l'administration
- Documents pertinents
- Preuves du préjudice

Je reste à votre disposition pour tout complément d'information.

Respectueusement,
[Signature]
`;
}