/**
 * Machine XState pour le Droit de Grève
 *
 * Cette machine d'état représente le processus d'exercice du droit de grève en Belgique,
 * incluant le préavis, les conditions légales et la protection des grévistes.
 */

import { createMachine, assign } from 'xstate';

interface DroitGreveContext {
  syndicat: string | null;
  entreprise: string | null;
  motifGreve: string | null;
  typeGreve: 'generale' | 'sectorielle' | 'entreprise' | 'sauvage' | null;
  dateDebut: Date | null;
  preavisDonne: boolean;
  negociationTentee: boolean;
  participants: number;
  servicesMinimums: string[];
  graveEnCours: boolean;
  retryCount: number;
}

export const droitGreveMachine = createMachine({
  id: 'droitGreve',
  initial: 'idle',

  schemas: {
    context: {} as DroitGreveContext,
    events: {} as
      | { type: 'DECLARER_CONFLIT'; syndicat: string; entreprise: string; motifGreve: string }
      | { type: 'CHOISIR_TYPE_GREVE'; typeGreve: 'generale' | 'sectorielle' | 'entreprise' | 'sauvage' }
      | { type: 'TENTER_NEGOCIATION' }
      | { type: 'NEGOCIATION_REUSSIE' }
      | { type: 'NEGOCIATION_ECHOUEE' }
      | { type: 'DEPOSER_PREAVIS'; dateDebut: Date }
      | { type: 'ORGANISER_VOTE' }
      | { type: 'VOTE_FAVORABLE'; participants: number }
      | { type: 'VOTE_DEFAVORABLE' }
      | { type: 'DECLARER_GREVE' }
      | { type: 'VERIFIER_SERVICES_MINIMUMS'; servicesMinimums: string[] }
      | { type: 'COMMENCER_GREVE' }
      | { type: 'NOUVELLE_NEGOCIATION' }
      | { type: 'ACCORD_TROUVE' }
      | { type: 'AUCUN_ACCORD' }
      | { type: 'REQUISITION' }
      | { type: 'SUSPENSION_GREVE' }
      | { type: 'REPRENDRE_GREVE' }
      | { type: 'METTRE_FIN_GREVE' }
      | { type: 'REPRISE_TRAVAIL' }
      | { type: 'RESET' }
  },

  context: {
    syndicat: null,
    entreprise: null,
    motifGreve: null,
    typeGreve: null,
    dateDebut: null,
    preavisDonne: false,
    negociationTentee: false,
    participants: 0,
    servicesMinimums: [],
    graveEnCours: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DECLARER_CONFLIT: {
          target: 'conflitDeclare',
          actions: assign({
            syndicat: (_, event) => event.syndicat,
            entreprise: (_, event) => event.entreprise,
            motifGreve: (_, event) => event.motifGreve,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de conflit social en cours',
      },
    },

    conflitDeclare: {
      on: {
        CHOISIR_TYPE_GREVE: {
          target: 'tentativeNegociation',
          actions: assign({
            typeGreve: (_, event) => event.typeGreve,
          }),
        },
      },

      meta: {
        description: 'Conflit social déclaré',
      },
    },

    tentativeNegociation: {
      on: {
        NEGOCIATION_REUSSIE: {
          target: 'conflitResolu',
        },
        NEGOCIATION_ECHOUEE: {
          target: 'depotPreavis',
          actions: assign({
            negociationTentee: true,
          }),
        },
      },

      meta: {
        description: 'Tentative de négociation préalable obligatoire',
      },
    },

    depotPreavis: {
      on: {
        DEPOSER_PREAVIS: {
          target: 'organisationVote',
          actions: assign({
            preavisDonne: true,
            dateDebut: (_, event) => event.dateDebut,
          }),
        },
      },

      meta: {
        description: 'Dépôt du préavis de grève (délai variable selon secteur)',
      },
    },

    organisationVote: {
      on: {
        VOTE_FAVORABLE: {
          target: 'declarationGreve',
          actions: assign({
            participants: (_, event) => event.participants,
          }),
        },
        VOTE_DEFAVORABLE: {
          target: 'greveAnnulee',
        },
      },

      meta: {
        description: 'Organisation du vote de grève parmi les travailleurs',
      },
    },

    greveAnnulee: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Grève annulée suite au vote défavorable',
      },
    },

    declarationGreve: {
      on: {
        DECLARER_GREVE: {
          target: 'verificationServicesMinimums',
        },
      },

      meta: {
        description: 'Déclaration officielle de la grève',
      },
    },

    verificationServicesMinimums: {
      on: {
        VERIFIER_SERVICES_MINIMUMS: {
          target: 'greveEnCours',
          actions: assign({
            servicesMinimums: (_, event) => event.servicesMinimums,
          }),
        },
      },

      meta: {
        description: 'Vérification et mise en place des services minimums (secteurs essentiels)',
      },
    },

    greveEnCours: {
      on: {
        NOUVELLE_NEGOCIATION: {
          target: 'negociationPendantGreve',
        },
        REQUISITION: {
          target: 'requisition',
        },
        SUSPENSION_GREVE: {
          target: 'suspension',
        },
        METTRE_FIN_GREVE: {
          target: 'finGreve',
        },
      },

      meta: {
        description: 'Grève en cours avec protection des grévistes',
      },
    },

    negociationPendantGreve: {
      on: {
        ACCORD_TROUVE: {
          target: 'accordObtenu',
        },
        AUCUN_ACCORD: {
          target: 'greveEnCours',
        },
      },

      meta: {
        description: 'Négociations pendant la grève',
      },
    },

    accordObtenu: {
      on: {
        METTRE_FIN_GREVE: {
          target: 'finGreve',
        },
      },

      meta: {
        description: 'Accord obtenu suite aux négociations',
      },
    },

    requisition: {
      on: {
        REPRENDRE_GREVE: {
          target: 'greveEnCours',
        },
        METTRE_FIN_GREVE: {
          target: 'finGreve',
        },
      },

      meta: {
        description: 'Réquisition de certains travailleurs par les autorités',
      },
    },

    suspension: {
      on: {
        REPRENDRE_GREVE: {
          target: 'greveEnCours',
        },
        METTRE_FIN_GREVE: {
          target: 'finGreve',
        },
      },

      meta: {
        description: 'Suspension temporaire de la grève',
      },
    },

    finGreve: {
      on: {
        REPRISE_TRAVAIL: {
          target: 'conflitResolu',
        },
      },

      meta: {
        description: 'Fin de la grève décidée',
      },
    },

    conflitResolu: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Conflit résolu - reprise du travail',
      },
    },
  },
});

/**
 * Visualisation du workflow du droit de grève:
 *
 * idle
 *   → conflitDeclare
 *   → tentativeNegociation
 *       ↓ (échec)
 *     depotPreavis
 *       ↓
 *     organisationVote
 *       ↓ (favorable)
 *     declarationGreve
 *       ↓
 *     verificationServicesMinimums
 *       ↓
 *     greveEnCours
 *       ↓
 *   [négociations/suspension/réquisition]
 *       ↓
 *     finGreve
 *       ↓
 *     conflitResolu
 */
