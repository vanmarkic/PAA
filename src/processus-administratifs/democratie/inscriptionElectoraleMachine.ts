/**
 * XState machine for Electoral Registration Workflow
 *
 * This state machine manages the complete electoral registration process
 * for Belgian citizens, EU citizens, and non-EU residents.
 */

import { createMachine, assign } from 'xstate';
import {
  DemocraticCitizen,
  InscriptionElectorale,
  DemandeInscription,
  DocumentElectoral,
  ElectoralRight,
  EligibilityResult,
} from '../modele-metier/democratieTypes';

interface InscriptionContext {
  citizen: DemocraticCitizen | null;
  demande: DemandeInscription | null;
  inscription: InscriptionElectorale | null;
  eligibilityResult: EligibilityResult | null;
  documents: DocumentElectoral[];
  verificationAttempts: number;
  errors: string[];
  retryCount: number;
  maxRetries: number;
}

export const inscriptionElectoraleMachine = createMachine({
  id: 'inscriptionElectorale',
  initial: 'idle',

  schemas: {
    context: {} as InscriptionContext,
    events: {} as
      | { type: 'START_REGISTRATION'; citizen: DemocraticCitizen; electionType: ElectoralRight }
      | { type: 'ELIGIBILITY_CHECKED'; result: EligibilityResult }
      | { type: 'SUBMIT_DOCUMENTS'; documents: DocumentElectoral[] }
      | { type: 'DOCUMENTS_VERIFIED'; valid: boolean; reason?: string }
      | { type: 'RESIDENCE_VERIFIED'; verified: boolean }
      | { type: 'APPROVE_REGISTRATION' }
      | { type: 'REJECT_REGISTRATION'; reason: string }
      | { type: 'SEND_CONVOCATION' }
      | { type: 'UPDATE_ADDRESS'; newAddress: string }
      | { type: 'SUSPEND_RIGHTS'; reason: string; duration?: number }
      | { type: 'RESTORE_RIGHTS' }
      | { type: 'PAY_FINE'; amount: number }
      | { type: 'RETRY' }
      | { type: 'CANCEL' }
      | { type: 'RESET' }
  },

  context: {
    citizen: null as DemocraticCitizen | null,
    demande: null as DemandeInscription | null,
    inscription: null as InscriptionElectorale | null,
    eligibilityResult: null as EligibilityResult | null,
    documents: [] as DocumentElectoral[],
    verificationAttempts: 0,
    errors: [] as string[],
    retryCount: 0,
    maxRetries: 3,
  },

  states: {
    idle: {
      on: {
        START_REGISTRATION: {
          target: 'checkingEligibility',
          actions: assign({
            citizen: ({ event }) => event.citizen,
            retryCount: 0,
            errors: [],
          }),
        },
      },

      meta: {
        description: 'En attente du début du processus d\'inscription',
      },
    },

    checkingEligibility: {
      on: {
        ELIGIBILITY_CHECKED: [
          {
            target: 'automaticRegistration',
            guard: ({ event }) =>
              event.result.eligible &&
              event.result.droitsActifs.includes('elections-federales' as ElectoralRight),
            actions: assign({
              eligibilityResult: ({ event }) => event.result,
            }),
          },
          {
            target: 'voluntaryRegistration',
            guard: ({ event }) =>
              event.result.eligible &&
              !event.result.droitsActifs.includes('elections-federales' as ElectoralRight),
            actions: assign({
              eligibilityResult: ({ event }) => event.result,
            }),
          },
          {
            target: 'blockedByFines',
            guard: ({ event }) =>
              event.result.restrictions.some((r: any) => r.raison?.includes('amendes')),
            actions: assign({
              eligibilityResult: ({ event }) => event.result,
            }),
          },
          {
            target: 'ineligible',
            actions: assign({
              eligibilityResult: ({ event }) => event.result,
              errors: ({ event }) => [event.result.restrictions[0]?.raison || 'Inéligible'],
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification de l\'éligibilité selon nationalité, âge, résidence',
      },
    },

    automaticRegistration: {
      entry: assign(({ context }) => ({
        inscription: context.citizen ? {
          citoyenId: context.citizen.id,
          typeElection: 'elections-federales' as ElectoralRight,
          commune: context.citizen.residenceLegale.commune,
          bureauVote: `${context.citizen.residenceLegale.commune}-BV001`,
          numeroElecteur: generateElectoralNumber(context.citizen),
          dateInscription: new Date(),
          statut: 'active' as const,
        } : null,
      })),

      on: {
        SEND_CONVOCATION: {
          target: 'active',
        },
      },

      meta: {
        description: 'Inscription automatique pour citoyens belges majeurs',
      },
    },

    voluntaryRegistration: {
      initial: 'collectingDocuments',

      states: {
        collectingDocuments: {
          on: {
            SUBMIT_DOCUMENTS: {
              target: 'verifyingDocuments',
              actions: assign({
                documents: ({ event }) => event.documents,
              }),
            },
          },

          meta: {
            description: 'Collecte des documents requis (preuve résidence, déclaration)',
          },
        },

        verifyingDocuments: {
          on: {
            DOCUMENTS_VERIFIED: [
              {
                target: 'verifyingResidence',
                guard: ({ event }) => event.valid,
              },
              {
                target: 'documentsRejected',
                actions: assign({
                  errors: ({ context, event }) =>
                    [...context.errors, event.reason || 'Documents invalides'],
                }),
              },
            ],
          },

          meta: {
            description: 'Vérification des documents soumis',
          },
        },

        verifyingResidence: {
          on: {
            RESIDENCE_VERIFIED: [
              {
                target: 'approved',
                guard: ({ event }) => event.verified,
              },
              {
                target: 'residenceRejected',
                actions: assign({
                  errors: ({ context }) =>
                    [...context.errors, 'Vérification de résidence échouée'],
                }),
              },
            ],
          },

          meta: {
            description: 'Vérification de la résidence principale',
          },
        },

        documentsRejected: {
          on: {
            RETRY: {
              target: 'collectingDocuments',
              guard: ({ context }) => context.retryCount < context.maxRetries,
              actions: assign({
                retryCount: ({ context }) => context.retryCount + 1,
                documents: [],
              }),
            },
            CANCEL: {
              target: '#inscriptionElectorale.cancelled',
            },
          },

          meta: {
            description: 'Documents rejetés - nouvelle soumission requise',
          },
        },

        residenceRejected: {
          on: {
            UPDATE_ADDRESS: {
              target: 'verifyingResidence',
              actions: assign(({ context, event }) => ({
                citizen: context.citizen ? {
                  ...context.citizen,
                  residenceLegale: {
                    ...context.citizen.residenceLegale,
                    commune: event.newAddress,
                  },
                } : null,
              })),
            },
            CANCEL: {
              target: '#inscriptionElectorale.cancelled',
            },
          },

          meta: {
            description: 'Résidence non confirmée - mise à jour requise',
          },
        },

        approved: {
          entry: assign(({ context }) => ({
            inscription: context.citizen && context.eligibilityResult ? {
              citoyenId: context.citizen.id,
              typeElection: context.eligibilityResult.droitsActifs[0],
              commune: context.citizen.residenceLegale.commune,
              bureauVote: `${context.citizen.residenceLegale.commune}-BV001`,
              numeroElecteur: generateElectoralNumber(context.citizen),
              dateInscription: new Date(),
              statut: 'active' as const,
            } : null,
          })),

          on: {
            SEND_CONVOCATION: {
              target: '#inscriptionElectorale.active',
            },
          },

          meta: {
            description: 'Inscription volontaire approuvée',
          },
        },
      },
    },

    blockedByFines: {
      on: {
        PAY_FINE: {
          target: 'checkingEligibility',
          actions: assign(({ context, event }) => ({
            citizen: context.citizen ? {
              ...context.citizen,
              sanctionsElectorales: context.citizen.sanctionsElectorales.filter(
                (s: any) => s.type !== 'amende' || (s.montantEuros && s.montantEuros > event.amount)
              ),
            } : null,
            errors: [],
          })),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },

      meta: {
        description: 'Inscription bloquée - amendes électorales impayées',
      },
    },

    ineligible: {
      on: {
        RETRY: {
          target: 'checkingEligibility',
          guard: ({ context }) => context.retryCount < context.maxRetries,
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
            errors: [],
          }),
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Non éligible - conditions non remplies',
      },
    },

    active: {
      on: {
        UPDATE_ADDRESS: {
          target: 'updatingRegistration',
          actions: assign(({ context, event }) => ({
            citizen: context.citizen ? {
              ...context.citizen,
              residenceLegale: {
                ...context.citizen.residenceLegale,
                commune: event.newAddress,
              },
            } : null,
          })),
        },
        SUSPEND_RIGHTS: {
          target: 'suspended',
          actions: assign(({ context, event }) => ({
            inscription: context.inscription ? {
              ...context.inscription,
              statut: 'suspendue' as const,
              motifRadiation: event.reason,
            } : null,
          })),
        },
      },

      meta: {
        description: 'Inscription active - citoyen peut voter',
      },
    },

    updatingRegistration: {
      on: {
        RESIDENCE_VERIFIED: {
          target: 'active',
          actions: assign(({ context }) => ({
            inscription: context.inscription && context.citizen ? {
              ...context.inscription,
              commune: context.citizen.residenceLegale.commune,
              bureauVote: `${context.citizen.residenceLegale.commune}-BV001`,
            } : null,
          })),
        },
      },

      meta: {
        description: 'Mise à jour de l\'inscription suite à changement d\'adresse',
      },
    },

    suspended: {
      on: {
        RESTORE_RIGHTS: {
          target: 'active',
          actions: assign(({ context }) => ({
            inscription: context.inscription ? {
              ...context.inscription,
              statut: 'active' as const,
              motifRadiation: undefined,
            } : null,
          })),
        },
        PAY_FINE: {
          target: 'active',
          guard: ({ context }) =>
            context.inscription?.motifRadiation?.includes('amendes') || false,
          actions: assign(({ context }) => ({
            inscription: context.inscription ? {
              ...context.inscription,
              statut: 'active' as const,
              motifRadiation: undefined,
            } : null,
          })),
        },
      },

      meta: {
        description: 'Droits électoraux suspendus temporairement',
      },
    },

    cancelled: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Processus d\'inscription annulé',
      },
    },
  },
});

// Helper function to generate electoral number
function generateElectoralNumber(citizen: DemocraticCitizen): string {
  const year = new Date().getFullYear();
  const postal = citizen.residenceLegale.codePostal;
  const random = Math.floor(Math.random() * 100000);
  return `${year}-${postal}-${random.toString().padStart(5, '0')}`;
}

/**
 * Visualization of the electoral registration workflow:
 *
 * idle
 *   → checkingEligibility
 *       ├─→ automaticRegistration (Belgian citizens)
 *       │     → active
 *       ├─→ voluntaryRegistration (EU/non-EU residents)
 *       │     → collectingDocuments
 *       │     → verifyingDocuments
 *       │     → verifyingResidence
 *       │     → approved
 *       │     → active
 *       ├─→ blockedByFines
 *       │     → [pay] → checkingEligibility
 *       └─→ ineligible
 *
 * active states:
 *   - Can update address → updatingRegistration → active
 *   - Can be suspended → suspended → [restore/pay] → active
 */