/**
 * XState machine for Aide aux Victimes (Victim Assistance) Workflow
 *
 * This state machine represents the workflow for victim assistance services,
 * including support, counseling, legal guidance, and compensation claims.
 */

import { createMachine, assign } from 'xstate';

interface Victime {
  nom: string;
  typeInfraction: string;
  dateInfraction: Date;
  traumatisme: string;
}

interface DossierVictime {
  soutienPsychologique: boolean;
  accompagnementJuridique: boolean;
  demandeIndemnisation: boolean;
}

interface AideVictimesContext {
  victime: Victime | null;
  dossier: DossierVictime | null;
  depotPlainte: boolean;
  suiviPsychologique: boolean;
  indemnisationObtenue: boolean;
  seancesSoutien: number;
}

export const aideVictimesMachine = createMachine({
  id: 'aideVictimes',
  initial: 'attente',

  schemas: {
    context: {} as AideVictimesContext,
    events: {} as
      | { type: 'SIGNALER_VICTIME'; victime: Victime }
      | { type: 'ACCUEIL_ECOUTE' }
      | { type: 'EVALUER_BESOINS' }
      | { type: 'BESOINS_IDENTIFIES'; dossier: DossierVictime }
      | { type: 'DEPOSER_PLAINTE' }
      | { type: 'PLAINTE_DEPOSEE' }
      | { type: 'COMMENCER_SOUTIEN_PSYCHO' }
      | { type: 'SEANCE_SOUTIEN' }
      | { type: 'DEMANDER_INDEMNISATION' }
      | { type: 'INDEMNISATION_ACCORDEE' }
      | { type: 'INDEMNISATION_REFUSEE' }
      | { type: 'ACCOMPAGNEMENT_TERMINE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    victime: null,
    dossier: null,
    depotPlainte: false,
    suiviPsychologique: false,
    indemnisationObtenue: false,
    seancesSoutien: 0,
  },

  states: {
    attente: {
      on: {
        SIGNALER_VICTIME: {
          target: 'accueilVictime',
          actions: assign({
            victime: ({ event }) => event.victime,
          }),
        },
      },

      meta: {
        description: 'En attente d\'un nouveau signalement de victime',
      },
    },

    accueilVictime: {
      on: {
        ACCUEIL_ECOUTE: {
          target: 'evaluationBesoins',
        },
      },

      meta: {
        description: 'Accueil et écoute de la victime - premier contact',
      },
    },

    evaluationBesoins: {
      on: {
        BESOINS_IDENTIFIES: {
          target: 'orientationServices',
          actions: assign({
            dossier: ({ event }) => event.dossier,
          }),
        },
      },

      meta: {
        description: 'Évaluation des besoins (psychologique, juridique, social)',
      },
    },

    orientationServices: {
      on: {
        DEPOSER_PLAINTE: {
          target: 'accompagnementJuridique',
        },
        COMMENCER_SOUTIEN_PSYCHO: {
          target: 'soutienPsychologique',
        },
        DEMANDER_INDEMNISATION: {
          target: 'procedureIndemnisation',
        },
      },

      meta: {
        description: 'Orientation vers les services adaptés aux besoins',
      },
    },

    accompagnementJuridique: {
      on: {
        PLAINTE_DEPOSEE: {
          target: 'suiviProcedure',
          actions: assign({
            depotPlainte: true,
          }),
        },
      },

      meta: {
        description: 'Accompagnement pour dépôt de plainte et procédure judiciaire',
      },
    },

    soutienPsychologique: {
      on: {
        SEANCE_SOUTIEN: {
          target: 'soutienPsychologique',
          actions: assign({ seancesSoutien: ({ context }) => context.seancesSoutien + 1,
            suiviPsychologique: true,
          }),
        },
        ACCOMPAGNEMENT_TERMINE: {
          target: 'suiviTermine',
        },
      },

      meta: {
        description: 'Soutien psychologique et thérapie post-traumatique',
      },
    },

    procedureIndemnisation: {
      on: {
        INDEMNISATION_ACCORDEE: {
          target: 'indemnisationAccordee',
          actions: assign({
            indemnisationObtenue: true,
          }),
        },
        INDEMNISATION_REFUSEE: {
          target: 'suiviProcedure',
        },
      },

      meta: {
        description: 'Demande d\'indemnisation auprès de la Commission d\'aide aux victimes',
      },
    },

    suiviProcedure: {
      on: {
        COMMENCER_SOUTIEN_PSYCHO: {
          target: 'soutienPsychologique',
        },
        DEMANDER_INDEMNISATION: {
          target: 'procedureIndemnisation',
        },
        ACCOMPAGNEMENT_TERMINE: {
          target: 'suiviTermine',
        },
      },

      meta: {
        description: 'Suivi de la procédure judiciaire et accompagnement',
      },
    },

    indemnisationAccordee: {
      on: {
        ACCOMPAGNEMENT_TERMINE: {
          target: 'suiviTermine',
        },
      },

      meta: {
        description: 'Indemnisation accordée - versement aux victimes',
      },
    },

    suiviTermine: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Accompagnement terminé - victime stabilisée',
      },
    },
  },
});

/**
 * Visualization of the victim assistance workflow:
 *
 * attente
 *   → accueilVictime
 *   → evaluationBesoins
 *   → orientationServices
 *       ↓
 *     [accompagnementJuridique / soutienPsychologique / procedureIndemnisation]
 *       ↓
 *     suiviProcedure
 *       ↓
 *     suiviTermine ✓
 */
