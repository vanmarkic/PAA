/**
 * Machine XState pour le Harcèlement au Travail
 *
 * Cette machine d'état représente le processus de signalement et de traitement
 * du harcèlement au travail en Belgique, conformément à la loi sur le bien-être au travail.
 */

import { createMachine, assign } from 'xstate';

interface HarcelementTravailContext {
  victime: string | null;
  typeHarcelement: 'moral' | 'sexuel' | 'mixte' | null;
  datesPremiersFaits: Date | null;
  harceleur: string | null;
  temoins: string[];
  preuves: string[];
  interventionInterne: boolean;
  signalementFait: boolean;
  mesuresProtection: string[];
  sanctionAppliquee: boolean;
  retryCount: number;
}

export const harcelementTravailMachine = createMachine({
  id: 'harcelementTravail',
  initial: 'idle',

  schema: {
    context: {} as HarcelementTravailContext,
    events: {} as
      | { type: 'SIGNALER_HARCELEMENT'; victime: string; typeHarcelement: 'moral' | 'sexuel' | 'mixte'; harceleur: string }
      | { type: 'DOCUMENTER_FAITS'; datesPremiersFaits: Date; preuves: string[] }
      | { type: 'AJOUTER_TEMOINS'; temoins: string[] }
      | { type: 'CONTACTER_PERSONNE_CONFIANCE' }
      | { type: 'SAISIR_CONSEILLER_PREVENTION' }
      | { type: 'DEMANDER_INTERVENTION_FORMELLE' }
      | { type: 'ENQUETE_INTERNE' }
      | { type: 'HARCELEMENT_AVERE' }
      | { type: 'HARCELEMENT_NON_AVERE' }
      | { type: 'MESURES_PROTECTION'; mesures: string[] }
      | { type: 'SANCTION_DISCIPLINAIRE' }
      | { type: 'RECOURS_EXTERNE' }
      | { type: 'PLAINTE_INSPECTION' }
      | { type: 'PLAINTE_PENALE' }
      | { type: 'MEDIATION_REUSSIE' }
      | { type: 'MEDIATION_ECHOUEE' }
      | { type: 'SITUATION_RESOLUE' }
      | { type: 'RESET' }
  },

  context: {
    victime: null,
    typeHarcelement: null,
    datesPremiersFaits: null,
    harceleur: null,
    temoins: [],
    preuves: [],
    interventionInterne: false,
    signalementFait: false,
    mesuresProtection: [],
    sanctionAppliquee: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        SIGNALER_HARCELEMENT: {
          target: 'documentationFaits',
          actions: assign({
            victime: (_, event) => event.victime,
            typeHarcelement: (_, event) => event.typeHarcelement,
            harceleur: (_, event) => event.harceleur,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de signalement de harcèlement',
      },
    },

    documentationFaits: {
      on: {
        DOCUMENTER_FAITS: {
          target: 'collecteTemoignages',
          actions: assign({
            datesPremiersFaits: (_, event) => event.datesPremiersFaits,
            preuves: (_, event) => event.preuves,
          }),
        },
      },

      meta: {
        description: 'Documentation des faits de harcèlement (dates, lieux, circonstances)',
      },
    },

    collecteTemoignages: {
      on: {
        AJOUTER_TEMOINS: {
          target: 'choixProcedure',
          actions: assign({
            temoins: (_, event) => event.temoins,
          }),
        },
      },

      meta: {
        description: 'Collecte des témoignages de collègues',
      },
    },

    choixProcedure: {
      on: {
        CONTACTER_PERSONNE_CONFIANCE: {
          target: 'interventionInformelle',
        },
        SAISIR_CONSEILLER_PREVENTION: {
          target: 'interventionFormelle',
        },
        RECOURS_EXTERNE: {
          target: 'procedureExterne',
        },
      },

      meta: {
        description: 'Choix de la procédure (informelle, formelle, externe)',
      },
    },

    interventionInformelle: {
      on: {
        MEDIATION_REUSSIE: {
          target: 'resolu',
        },
        MEDIATION_ECHOUEE: {
          target: 'interventionFormelle',
        },
      },

      meta: {
        description: 'Intervention informelle via la personne de confiance',
      },
    },

    interventionFormelle: {
      on: {
        DEMANDER_INTERVENTION_FORMELLE: {
          target: 'enqueteInterne',
          actions: assign({
            interventionInterne: true,
            signalementFait: true,
          }),
        },
      },

      meta: {
        description: 'Demande d\'intervention formelle au conseiller en prévention',
      },
    },

    enqueteInterne: {
      on: {
        HARCELEMENT_AVERE: {
          target: 'mesuresProtection',
        },
        HARCELEMENT_NON_AVERE: {
          target: 'nonAvere',
        },
      },

      meta: {
        description: 'Enquête interne menée par le conseiller en prévention',
      },
    },

    mesuresProtection: {
      on: {
        MESURES_PROTECTION: {
          target: 'sanctionDisciplinaire',
          actions: assign({
            mesuresProtection: (_, event) => event.mesures,
          }),
        },
      },

      meta: {
        description: 'Mise en place de mesures de protection pour la victime',
      },
    },

    sanctionDisciplinaire: {
      on: {
        SANCTION_DISCIPLINAIRE: {
          target: 'resolu',
          actions: assign({
            sanctionAppliquee: true,
          }),
        },
      },

      meta: {
        description: 'Application de sanctions disciplinaires contre le harceleur',
      },
    },

    procedureExterne: {
      on: {
        PLAINTE_INSPECTION: {
          target: 'inspectionTravail',
        },
        PLAINTE_PENALE: {
          target: 'plainteJudiciaire',
        },
      },

      meta: {
        description: 'Choix de recours externe (inspection du travail ou justice)',
      },
    },

    inspectionTravail: {
      on: {
        HARCELEMENT_AVERE: {
          target: 'resolu',
        },
        SITUATION_RESOLUE: {
          target: 'resolu',
        },
      },

      meta: {
        description: 'Intervention de l\'inspection du travail (Contrôle du bien-être)',
      },
    },

    plainteJudiciaire: {
      on: {
        SITUATION_RESOLUE: {
          target: 'resolu',
        },
      },

      meta: {
        description: 'Plainte pénale au tribunal correctionnel',
      },
    },

    nonAvere: {
      on: {
        RECOURS_EXTERNE: {
          target: 'procedureExterne',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Harcèlement non avéré par l\'enquête - possibilité de recours',
      },
    },

    resolu: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Situation de harcèlement résolue',
      },
    },
  },
});

/**
 * Visualisation du workflow du harcèlement au travail:
 *
 * idle
 *   → documentationFaits
 *   → collecteTemoignages
 *   → choixProcedure
 *       ↓                    ↓                  ↓
 *   informelle          formelle          externe
 *       ↓                    ↓                  ↓
 *   [médiation]         enqueteInterne    [inspection/justice]
 *       ↓                    ↓                  ↓
 *   (réussie/échouée)   (avéré/non)        resolu
 *       ↓                    ↓
 *   resolu          mesuresProtection
 *                            ↓
 *                   sanctionDisciplinaire
 *                            ↓
 *                         resolu
 */
