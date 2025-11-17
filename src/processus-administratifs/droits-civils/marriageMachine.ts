/**
 * XState machine for Marriage Procedure Workflow
 *
 * This state machine manages the complete marriage process in Belgium,
 * from initial declaration to celebration and registration.
 */

import { createMachine, assign } from 'xstate';
import {
  MarriageProcedure,
  PersonDetails,
  RequestStatus,
  ValidationResult,
  RequiredDocument
} from '../modele-metier/droitsCivilsTypes';

interface MarriageContext {
  procedure: MarriageProcedure | null;
  validationResult: ValidationResult | null;
  documents: RequiredDocument[];
  bannsPublishedDate: Date | null;
  parquetApproval: boolean | null; // For foreign partners
  oppositions: Opposition[];
  ceremonyDate: Date | null;
  marriageRegistered: boolean;
  status: RequestStatus;
  retryCount: number;
  errors: string[];
}

interface Opposition {
  opposer: string;
  reason: string;
  date: Date;
  resolved: boolean;
}

export const marriageMachine = createMachine({
  id: 'marriage',
  initial: 'idle',

  schemas: {
    context: {} as MarriageContext,
    events: {} as
      | { type: 'START_DECLARATION'; procedure: MarriageProcedure }
      | { type: 'SUBMIT_DOCUMENTS'; documents: RequiredDocument[] }
      | { type: 'DOCUMENTS_VALIDATED'; result: ValidationResult }
      | { type: 'DOCUMENTS_INCOMPLETE'; missing: string[] }
      | { type: 'BANNS_PUBLISHED'; date: Date }
      | { type: 'OPPOSITION_FILED'; opposer: string; reason: string }
      | { type: 'OPPOSITION_RESOLVED'; oppositionId: number }
      | { type: 'PARQUET_APPROVAL_RECEIVED'; approved: boolean }
      | { type: 'SCHEDULE_CEREMONY'; date: Date }
      | { type: 'CEREMONY_COMPLETED' }
      | { type: 'MARRIAGE_REGISTERED'; certificateNumber: string }
      | { type: 'CANCEL' }
      | { type: 'RETRY' }
      | { type: 'RESET' }
  },

  context: {
    procedure: null as MarriageProcedure | null,
    validationResult: null as ValidationResult | null,
    documents: [] as RequiredDocument[],
    bannsPublishedDate: null as Date | null,
    parquetApproval: null as boolean | null,
    oppositions: [] as Opposition[],
    ceremonyDate: null as Date | null,
    marriageRegistered: false,
    status: 'draft' as RequestStatus,
    retryCount: 0,
    errors: [] as string[],
  },

  states: {
    idle: {
      on: {
        START_DECLARATION: {
          target: 'documentPreparation',
          actions: assign({
            procedure: ({ event }) => event.procedure,
            status: 'submitted',
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'En attente de déclaration de mariage',
      },
    },

    documentPreparation: {
      on: {
        SUBMIT_DOCUMENTS: {
          target: 'documentVerification',
          actions: assign({
            documents: ({ event }) => event.documents,
          }),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Préparation des documents requis pour le mariage',
      },
    },

    documentVerification: {
      on: {
        DOCUMENTS_VALIDATED: [
          {
            target: 'parquetReview',
            guard: ({ context }) => needsParquetReview(context.procedure),
            actions: assign({
              validationResult: ({ event }) => event.result,
              status: 'under-review',
            }),
          },
          {
            target: 'bannsPublication',
            actions: assign({
              validationResult: ({ event }) => event.result,
              status: 'under-review',
            }),
          },
        ],
        DOCUMENTS_INCOMPLETE: {
          target: 'documentCorrection',
          actions: assign({
            errors: ({ event }) => event.missing,
            retryCount: ({ context }) => context.retryCount + 1,
          }),
        },
      },
      meta: {
        description: 'Vérification des documents (actes, certificats, etc.)',
      },
    },

    documentCorrection: {
      on: {
        SUBMIT_DOCUMENTS: {
          target: 'documentVerification',
          actions: assign({
            documents: ({ event }) => event.documents,
            errors: [],
          }),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      after: {
        180000: { // 3 months timeout
          target: 'expired',
        },
      },
      meta: {
        description: 'Correction des documents manquants ou non conformes',
      },
    },

    parquetReview: {
      on: {
        PARQUET_APPROVAL_RECEIVED: [
          {
            target: 'bannsPublication',
            guard: ({ event }) => event.approved,
            actions: assign({
              parquetApproval: ({ event }) => event.approved,
            }),
          },
          {
            target: 'rejected',
            actions: assign({
              parquetApproval: ({ event }) => event.approved,
              status: 'rejected',
              errors: ['Avis défavorable du parquet - mariage suspect'],
            }),
          },
        ],
      },
      after: {
        150000: { // 5 months maximum for parquet review
          target: 'bannsPublication',
          actions: assign(({ context }) => ({
            parquetApproval: true, // Silence vaut acceptation
          })),
        },
      },
      meta: {
        description: 'Examen par le parquet (mariages avec étrangers)',
      },
    },

    bannsPublication: {
      on: {
        BANNS_PUBLISHED: {
          target: 'waitingPeriod',
          actions: assign({
            bannsPublishedDate: ({ event }) => event.date,
          }),
        },
      },
      meta: {
        description: 'Publication des bans de mariage à la commune',
      },
    },

    waitingPeriod: {
      on: {
        OPPOSITION_FILED: {
          target: 'oppositionHandling',
          actions: assign({
            oppositions: ({ context, event }) => [
              ...context.oppositions,
              {
                opposer: event.opposer,
                reason: event.reason,
                date: new Date(),
                resolved: false,
              },
            ],
          }),
        },
        SCHEDULE_CEREMONY: {
          target: 'ceremonyScheduled',
          guard: ({ context }) => canScheduleCeremony(context),
          actions: assign({
            ceremonyDate: ({ event }) => event.date,
          }),
        },
      },
      after: {
        14000: { // 14 days minimum
          target: 'readyForCeremony',
        },
      },
      meta: {
        description: 'Période d\'attente de 14 jours après publication',
      },
    },

    oppositionHandling: {
      on: {
        OPPOSITION_RESOLVED: {
          target: 'waitingPeriod',
          actions: assign({
            oppositions: ({ context, event }) =>
              context.oppositions.map((opp, idx) =>
                idx === event.oppositionId ? { ...opp, resolved: true } : opp
              ),
          }),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      after: {
        180000: { // 6 months maximum for opposition resolution
          target: 'rejected',
          actions: assign({
            status: 'rejected',
            errors: ['Opposition non résolue dans les délais'],
          }),
        },
      },
      meta: {
        description: 'Traitement des oppositions au mariage',
      },
    },

    readyForCeremony: {
      on: {
        SCHEDULE_CEREMONY: {
          target: 'ceremonyScheduled',
          actions: assign({
            ceremonyDate: ({ event }) => event.date,
          }),
        },
      },
      after: {
        365000: { // 1 year maximum after banns
          target: 'expired',
        },
      },
      meta: {
        description: 'Prêt pour la célébration du mariage',
      },
    },

    ceremonyScheduled: {
      on: {
        CEREMONY_COMPLETED: {
          target: 'registration',
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Cérémonie de mariage planifiée',
      },
    },

    registration: {
      on: {
        MARRIAGE_REGISTERED: {
          target: 'completed',
          actions: assign({
            marriageRegistered: true,
            status: 'completed',
          }),
        },
      },
      meta: {
        description: 'Enregistrement du mariage dans les registres',
      },
    },

    completed: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Mariage célébré et enregistré avec succès',
      },
    },

    rejected: {
      on: {
        RETRY: {
          target: 'documentPreparation',
          guard: ({ context }) => context.retryCount < 2,
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
            errors: [],
            status: 'submitted',
          }),
        },
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Mariage refusé (conditions non remplies ou opposition)',
      },
    },

    cancelled: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Procédure de mariage annulée',
      },
    },

    expired: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Délai de validité dépassé - nouvelle déclaration requise',
      },
    },
  },
});

/**
 * Check if parquet review is needed
 */
function needsParquetReview(procedure: MarriageProcedure | null): boolean {
  if (!procedure) return false;

  // Foreign partner requires parquet review
  return (
    procedure.partner1.nationality !== 'BE' ||
    procedure.partner2.nationality !== 'BE'
  );
}

/**
 * Check if ceremony can be scheduled
 */
function canScheduleCeremony(context: MarriageContext): boolean {
  if (!context.bannsPublishedDate) return false;

  // Calculate days since banns publication
  const daysSinceBanns = Math.floor(
    (Date.now() - context.bannsPublishedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Must wait at least 14 days
  if (daysSinceBanns < 14) return false;

  // Check no unresolved oppositions
  const unresolvedOppositions = context.oppositions.filter(opp => !opp.resolved);
  if (unresolvedOppositions.length > 0) return false;

  // Check parquet approval if needed
  if (needsParquetReview(context.procedure) && context.parquetApproval === false) {
    return false;
  }

  return true;
}

/**
 * Get required documents for marriage
 */
export function getMarriageRequiredDocuments(
  partner: PersonDetails,
  isForeign: boolean
): RequiredDocument[] {
  const documents: RequiredDocument[] = [
    {
      name: 'Acte de naissance (moins de 3 mois)',
      type: 'birth-certificate',
      mandatory: true,
      submitted: false,
    },
    {
      name: 'Preuve d\'identité',
      type: 'identity',
      mandatory: true,
      submitted: false,
    },
    {
      name: 'Certificat de résidence',
      type: 'residence',
      mandatory: true,
      submitted: false,
    },
    {
      name: 'Preuve de célibat ou acte de divorce',
      type: 'civil-status',
      mandatory: true,
      submitted: false,
    },
  ];

  if (isForeign) {
    documents.push(
      {
        name: 'Certificat de coutume',
        type: 'certificate-custom',
        mandatory: true,
        submitted: false,
      },
      {
        name: 'Certificat de célibat du pays d\'origine',
        type: 'foreign-single-certificate',
        mandatory: true,
        submitted: false,
      },
      {
        name: 'Documents traduits et légalisés',
        type: 'translated-documents',
        mandatory: true,
        submitted: false,
      }
    );
  }

  return documents;
}

/**
 * Calculate marriage timeline
 */
export function calculateMarriageTimeline(
  hasForeignPartner: boolean,
  hasOpposition: boolean
): {
  minDays: number;
  maxDays: number;
  phases: { name: string; duration: string }[];
} {
  const phases = [
    { name: 'Préparation documents', duration: '1-2 semaines' },
    { name: 'Vérification documents', duration: '1 semaine' },
  ];

  if (hasForeignPartner) {
    phases.push({ name: 'Examen parquet', duration: '1-5 mois' });
  }

  phases.push(
    { name: 'Publication des bans', duration: '1 jour' },
    { name: 'Période d\'attente', duration: '14 jours minimum' }
  );

  if (hasOpposition) {
    phases.push({ name: 'Résolution opposition', duration: '1-6 mois' });
  }

  phases.push(
    { name: 'Célébration', duration: '1 jour' },
    { name: 'Enregistrement', duration: '1-3 jours' }
  );

  const minDays = hasForeignPartner ? 45 : 21;
  const maxDays = hasForeignPartner ? 180 : (hasOpposition ? 200 : 30);

  return {
    minDays,
    maxDays,
    phases,
  };
}