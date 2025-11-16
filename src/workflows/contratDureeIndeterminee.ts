/**
 * Machine XState pour le Contrat à Durée Indéterminée (CDI)
 *
 * Cette machine d'état représente le processus de gestion d'un contrat à durée indéterminée
 * en Belgique, la forme de contrat la plus stable et protectrice.
 */

import { createMachine, assign } from 'xstate';

interface ContratDureeIndetermineeContext {
  employe: string | null;
  employeur: string | null;
  dateDebut: Date | null;
  salaire: number;
  fonction: string | null;
  periodeEssai: boolean;
  dureePeriodeEssai: number;
  anciennete: number;
  avenants: number;
  suspensions: string[];
  retryCount: number;
}

export const contratDureeIndetermineeMachine = createMachine({
  id: 'contratDureeIndeterminee',
  initial: 'idle',

  schema: {
    context: {} as ContratDureeIndetermineeContext,
    events: {} as
      | { type: 'CREER_CDI'; employe: string; employeur: string; fonction: string; salaire: number }
      | { type: 'DEFINIR_PERIODE_ESSAI'; dureePeriodeEssai: number }
      | { type: 'SIGNER_CONTRAT'; dateDebut: Date }
      | { type: 'COMMENCER_PERIODE_ESSAI' }
      | { type: 'VALIDER_PERIODE_ESSAI' }
      | { type: 'ECHEC_PERIODE_ESSAI' }
      | { type: 'ACTIVER_CDI' }
      | { type: 'AVENANT_CONTRACTUEL'; type: string }
      | { type: 'AUGMENTATION_SALARIALE'; nouveauSalaire: number }
      | { type: 'PROMOTION'; nouvelleFonction: string }
      | { type: 'SUSPENSION_TEMPORAIRE'; motif: string }
      | { type: 'REPRENDRE_ACTIVITE' }
      | { type: 'DEMISSION' }
      | { type: 'LICENCIEMENT' }
      | { type: 'DEPART_RETRAITE' }
      | { type: 'RUPTURE_COMMUN_ACCORD' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    employeur: null,
    dateDebut: null,
    salaire: 0,
    fonction: null,
    periodeEssai: true,
    dureePeriodeEssai: 0,
    anciennete: 0,
    avenants: 0,
    suspensions: [],
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        CREER_CDI: {
          target: 'preparationContrat',
          actions: assign({
            employe: (_, event) => event.employe,
            employeur: (_, event) => event.employeur,
            fonction: (_, event) => event.fonction,
            salaire: (_, event) => event.salaire,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de CDI en cours',
      },
    },

    preparationContrat: {
      on: {
        DEFINIR_PERIODE_ESSAI: {
          target: 'signatureContrat',
          actions: assign({
            periodeEssai: true,
            dureePeriodeEssai: (_, event) => event.dureePeriodeEssai,
          }),
        },
        SIGNER_CONTRAT: {
          target: 'signatureContrat',
          actions: assign({
            periodeEssai: false,
          }),
        },
      },

      meta: {
        description: 'Préparation du contrat à durée indéterminée',
      },
    },

    signatureContrat: {
      on: {
        SIGNER_CONTRAT: {
          target: 'periodeEssaiOuActif',
          actions: assign({
            dateDebut: (_, event) => event.dateDebut,
          }),
        },
      },

      meta: {
        description: 'Signature du contrat à durée indéterminée',
      },
    },

    periodeEssaiOuActif: {
      always: [
        {
          target: 'periodeEssai',
          cond: (context) => context.periodeEssai,
        },
        {
          target: 'cdiActif',
        },
      ],

      meta: {
        description: 'Routing vers période d\'essai ou CDI actif',
      },
    },

    periodeEssai: {
      on: {
        VALIDER_PERIODE_ESSAI: {
          target: 'cdiActif',
          actions: assign({
            periodeEssai: false,
          }),
        },
        ECHEC_PERIODE_ESSAI: {
          target: 'echecEssai',
        },
      },

      meta: {
        description: 'Période d\'essai en cours (max 12 mois)',
      },
    },

    echecEssai: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Échec de la période d\'essai - fin du contrat',
      },
    },

    cdiActif: {
      on: {
        AVENANT_CONTRACTUEL: {
          target: 'modificationContrat',
        },
        AUGMENTATION_SALARIALE: {
          target: 'cdiActif',
          actions: assign({
            salaire: (_, event) => event.nouveauSalaire,
            avenants: (context) => context.avenants + 1,
          }),
        },
        PROMOTION: {
          target: 'cdiActif',
          actions: assign({
            fonction: (_, event) => event.nouvelleFonction,
            avenants: (context) => context.avenants + 1,
          }),
        },
        SUSPENSION_TEMPORAIRE: {
          target: 'suspensionContrat',
        },
        DEMISSION: {
          target: 'procedureDemission',
        },
        LICENCIEMENT: {
          target: 'procedureLicenciement',
        },
        DEPART_RETRAITE: {
          target: 'retraite',
        },
        RUPTURE_COMMUN_ACCORD: {
          target: 'ruptureAmiable',
        },
      },

      meta: {
        description: 'CDI actif - relation de travail stable et continue',
      },
    },

    modificationContrat: {
      on: {
        AVENANT_CONTRACTUEL: {
          target: 'cdiActif',
          actions: assign({
            avenants: (context) => context.avenants + 1,
          }),
        },
      },

      meta: {
        description: 'Modification du contrat par avenant',
      },
    },

    suspensionContrat: {
      on: {
        REPRENDRE_ACTIVITE: {
          target: 'cdiActif',
        },
        SUSPENSION_TEMPORAIRE: {
          target: 'suspensionContrat',
          actions: assign({
            suspensions: (context, event) => [...context.suspensions, event.motif],
          }),
        },
      },

      meta: {
        description: 'Suspension temporaire (congé parental, maladie longue durée, etc.)',
      },
    },

    procedureDemission: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Procédure de démission en cours',
      },
    },

    procedureLicenciement: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Procédure de licenciement en cours',
      },
    },

    ruptureAmiable: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Rupture de commun accord du contrat',
      },
    },

    retraite: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Départ à la retraite - fin du CDI',
      },
    },
  },
});

/**
 * Visualisation du workflow du CDI:
 *
 * idle
 *   → preparationContrat
 *   → signatureContrat
 *   → [avec/sans période d'essai]
 *       ↓
 *     periodeEssai
 *       ↓ (validée)
 *     cdiActif
 *       ↓
 *   [modifications/suspensions/fin]
 *       ↓
 *   [demission/licenciement/retraite/rupture]
 */
