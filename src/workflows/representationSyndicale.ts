/**
 * Machine XState pour la Représentation Syndicale
 *
 * Cette machine d'état représente le processus de représentation syndicale en entreprise
 * en Belgique, incluant les élections sociales et les délégations syndicales.
 */

import { createMachine, assign } from 'xstate';

interface RepresentationSyndicaleContext {
  entreprise: string | null;
  nombreTravailleurs: number;
  syndicatsPresents: string[];
  typeElections: 'CE' | 'CPPT' | 'les_deux' | null;
  dateElections: Date | null;
  deleguesSyndicaux: number;
  mandatsActifs: number;
  conventionsCollectives: string[];
  reunionsAnnuelles: number;
  retryCount: number;
}

export const representationSyndicaleMachine = createMachine({
  id: 'representationSyndicale',
  initial: 'idle',

  schemas: {
    context: {} as RepresentationSyndicaleContext,
    events: {} as
      | { type: 'VERIFIER_SEUIL'; entreprise: string; nombreTravailleurs: number }
      | { type: 'SEUIL_ATTEINT' }
      | { type: 'SEUIL_NON_ATTEINT' }
      | { type: 'PREPARER_ELECTIONS'; typeElections: 'CE' | 'CPPT' | 'les_deux' }
      | { type: 'IDENTIFIER_SYNDICATS'; syndicatsPresents: string[] }
      | { type: 'ORGANISER_ELECTIONS'; dateElections: Date }
      | { type: 'ELECTIONS_TENUES' }
      | { type: 'RESULTATS_PROCLAMES'; deleguesSyndicaux: number }
      | { type: 'DESIGNER_DELEGUES' }
      | { type: 'INSTALLER_DELEGATION' }
      | { type: 'NEGOCIER_CCE'; sujet: string }
      | { type: 'CCE_SIGNEE'; convention: string }
      | { type: 'ORGANISER_REUNION' }
      | { type: 'REUNION_TENUE' }
      | { type: 'CONFLIT_SOCIAL' }
      | { type: 'CONFLIT_RESOLU' }
      | { type: 'RENOUVELLEMENT_MANDATS' }
      | { type: 'NOUVELLES_ELECTIONS' }
      | { type: 'RESET' }
  },

  context: {
    entreprise: null,
    nombreTravailleurs: 0,
    syndicatsPresents: [],
    typeElections: null,
    dateElections: null,
    deleguesSyndicaux: 0,
    mandatsActifs: 0,
    conventionsCollectives: [],
    reunionsAnnuelles: 0,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        VERIFIER_SEUIL: {
          target: 'verificationSeuil',
          actions: assign({
            entreprise: (_, event) => event.entreprise,
            nombreTravailleurs: (_, event) => event.nombreTravailleurs,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de représentation syndicale établie',
      },
    },

    verificationSeuil: {
      on: {
        SEUIL_ATTEINT: {
          target: 'preparationElections',
        },
        SEUIL_NON_ATTEINT: {
          target: 'seuilNonAtteint',
        },
      },

      meta: {
        description: 'Vérification du seuil (50 travailleurs pour CE, 50 pour CPPT)',
      },
    },

    seuilNonAtteint: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Seuil non atteint - pas d\'obligation d\'élections sociales',
      },
    },

    preparationElections: {
      on: {
        IDENTIFIER_SYNDICATS: {
          target: 'organisationElections',
          actions: assign({
            syndicatsPresents: (_, event) => event.syndicatsPresents,
            typeElections: (_, event) => event.typeElections || 'les_deux',
          }),
        },
      },

      meta: {
        description: 'Préparation des élections sociales (tous les 4 ans)',
      },
    },

    organisationElections: {
      on: {
        ORGANISER_ELECTIONS: {
          target: 'electionsEnCours',
          actions: assign({
            dateElections: (_, event) => event.dateElections,
          }),
        },
      },

      meta: {
        description: 'Organisation des élections (CE et/ou CPPT)',
      },
    },

    electionsEnCours: {
      on: {
        RESULTATS_PROCLAMES: {
          target: 'designationDelegues',
          actions: assign({
            deleguesSyndicaux: (_, event) => event.deleguesSyndicaux,
          }),
        },
      },

      meta: {
        description: 'Élections en cours - vote des travailleurs',
      },
    },

    designationDelegues: {
      on: {
        DESIGNER_DELEGUES: {
          target: 'installationDelegation',
        },
      },

      meta: {
        description: 'Désignation des délégués syndicaux élus',
      },
    },

    installationDelegation: {
      on: {
        INSTALLER_DELEGATION: {
          target: 'representationActive',
          actions: assign({
            mandatsActifs: (context) => context.deleguesSyndicaux,
          }),
        },
      },

      meta: {
        description: 'Installation officielle de la délégation syndicale',
      },
    },

    representationActive: {
      on: {
        NEGOCIER_CCE: {
          target: 'negociationCCE',
        },
        ORGANISER_REUNION: {
          target: 'reunion',
        },
        CONFLIT_SOCIAL: {
          target: 'gestionConflit',
        },
        RENOUVELLEMENT_MANDATS: {
          target: 'preparationElections',
        },
      },

      meta: {
        description: 'Représentation syndicale active avec délégués élus',
      },
    },

    negociationCCE: {
      on: {
        CCE_SIGNEE: {
          target: 'representationActive',
          actions: assign({
            conventionsCollectives: (context, event) => [...context.conventionsCollectives, event.convention],
          }),
        },
      },

      meta: {
        description: 'Négociation de Convention Collective d\'Entreprise (CCE)',
      },
    },

    reunion: {
      on: {
        REUNION_TENUE: {
          target: 'representationActive',
          actions: assign({
            reunionsAnnuelles: (context) => context.reunionsAnnuelles + 1,
          }),
        },
      },

      meta: {
        description: 'Réunion du Conseil d\'Entreprise ou CPPT',
      },
    },

    gestionConflit: {
      on: {
        CONFLIT_RESOLU: {
          target: 'representationActive',
        },
      },

      meta: {
        description: 'Gestion d\'un conflit social par la délégation',
      },
    },
  },
});

/**
 * Visualisation du workflow de la représentation syndicale:
 *
 * idle
 *   → verificationSeuil
 *       ↓ (atteint)
 *     preparationElections
 *       ↓
 *     organisationElections
 *       ↓
 *     electionsEnCours
 *       ↓
 *     designationDelegues
 *       ↓
 *     installationDelegation
 *       ↓
 *     representationActive
 *       ↓
 *   [négociations CCE/réunions/conflits]
 *       ↓
 *   [renouvellement tous les 4 ans]
 */
