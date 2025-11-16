/**
 * Machine XState pour la Pension Complémentaire
 *
 * Cette machine d'état représente le processus de constitution et de gestion
 * d'une pension complémentaire (deuxième pilier) en Belgique.
 */

import { createMachine, assign } from 'xstate';

interface PensionComplementaireContext {
  employe: string | null;
  employeur: string | null;
  typePlan: 'contribution_definie' | 'prestation_definie' | null;
  cotisationEmployeur: number;
  cotisationPersonnelle: number;
  capitalAccumule: number;
  ageAdhesion: number;
  agePension: number;
  organismeAssurance: string | null;
  rendementAnnuel: number;
  beneficiaire: string | null;
  retryCount: number;
}

export const pensionComplementaireMachine = createMachine({
  id: 'pensionComplementaire',
  initial: 'idle',

  schemas: {
    context: {} as PensionComplementaireContext,
    events: {} as
      | { type: 'ADHERER_PLAN'; employe: string; employeur: string; typePlan: 'contribution_definie' | 'prestation_definie'; ageAdhesion: number }
      | { type: 'CHOISIR_ORGANISME'; organismeAssurance: string }
      | { type: 'DEFINIR_COTISATIONS'; cotisationEmployeur: number; cotisationPersonnelle: number }
      | { type: 'DESIGNER_BENEFICIAIRE'; beneficiaire: string }
      | { type: 'SIGNER_ADHESION' }
      | { type: 'ACTIVER_PLAN' }
      | { type: 'VERSER_COTISATION'; montant: number }
      | { type: 'CALCULER_RENDEMENT'; rendementAnnuel: number }
      | { type: 'CONSULTER_CAPITAL'; capitalAccumule: number }
      | { type: 'MODIFIER_COTISATIONS'; nouvelleCotisation: number }
      | { type: 'CHANGER_BENEFICIAIRE'; nouveauBeneficiaire: string }
      | { type: 'CHANGER_EMPLOYEUR' }
      | { type: 'TRANSFERER_CAPITAL'; nouvelOrganisme: string }
      | { type: 'RACHETER_CAPITAL'; motif: string }
      | { type: 'ATTEINDRE_AGE_PENSION'; agePension: number }
      | { type: 'CHOISIR_MODE_PAIEMENT'; mode: 'capital' | 'rente' | 'mixte' }
      | { type: 'PERCEVOIR_PENSION' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    employeur: null,
    typePlan: null,
    cotisationEmployeur: 0,
    cotisationPersonnelle: 0,
    capitalAccumule: 0,
    ageAdhesion: 0,
    agePension: 65,
    organismeAssurance: null,
    rendementAnnuel: 0,
    beneficiaire: null,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        ADHERER_PLAN: {
          target: 'choixOrganisme',
          actions: assign({
            employe: ({ event }) => event.employe,
            employeur: ({ event }) => event.employeur,
            typePlan: ({ event }) => event.typePlan,
            ageAdhesion: ({ event }) => event.ageAdhesion,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de plan de pension complémentaire',
      },
    },

    choixOrganisme: {
      on: {
        CHOISIR_ORGANISME: {
          target: 'definitionCotisations',
          actions: assign({
            organismeAssurance: ({ event }) => event.organismeAssurance,
          }),
        },
      },

      meta: {
        description: 'Choix de l\'organisme de pension (assurance groupe ou fonds de pension)',
      },
    },

    definitionCotisations: {
      on: {
        DEFINIR_COTISATIONS: {
          target: 'designationBeneficiaire',
          actions: assign({
            cotisationEmployeur: ({ event }) => event.cotisationEmployeur,
            cotisationPersonnelle: ({ event }) => event.cotisationPersonnelle,
          }),
        },
      },

      meta: {
        description: 'Définition des cotisations patronales et personnelles',
      },
    },

    designationBeneficiaire: {
      on: {
        DESIGNER_BENEFICIAIRE: {
          target: 'signatureAdhesion',
          actions: assign({
            beneficiaire: ({ event }) => event.beneficiaire,
          }),
        },
      },

      meta: {
        description: 'Désignation du bénéficiaire en cas de décès',
      },
    },

    signatureAdhesion: {
      on: {
        SIGNER_ADHESION: {
          target: 'planActif',
        },
      },

      meta: {
        description: 'Signature du bulletin d\'adhésion',
      },
    },

    planActif: {
      on: {
        VERSER_COTISATION: {
          target: 'gestionCotisations',
        },
        CONSULTER_CAPITAL: {
          target: 'consultationCapital',
        },
        MODIFIER_COTISATIONS: {
          target: 'modificationCotisations',
        },
        CHANGER_BENEFICIAIRE: {
          target: 'planActif',
          actions: assign({
            beneficiaire: ({ event }) => event.nouveauBeneficiaire,
          }),
        },
        CHANGER_EMPLOYEUR: {
          target: 'changementEmployeur',
        },
        RACHETER_CAPITAL: {
          target: 'rachatCapital',
        },
        ATTEINDRE_AGE_PENSION: {
          target: 'agePensionAtteint',
        },
      },

      meta: {
        description: 'Plan de pension complémentaire actif avec cotisations régulières',
      },
    },

    gestionCotisations: {
      on: {
        VERSER_COTISATION: {
          target: 'calculRendement',
          actions: assign({
            capitalAccumule: ({ context, event }) => context.capitalAccumule + event.montant,
          }),
        },
      },

      meta: {
        description: 'Gestion des versements de cotisations',
      },
    },

    calculRendement: {
      on: {
        CALCULER_RENDEMENT: {
          target: 'planActif',
          actions: assign({
            rendementAnnuel: ({ event }) => event.rendementAnnuel,
          }),
        },
      },

      meta: {
        description: 'Calcul du rendement annuel sur le capital accumulé',
      },
    },

    consultationCapital: {
      on: {
        CONSULTER_CAPITAL: {
          target: 'planActif',
          actions: assign({
            capitalAccumule: ({ event }) => event.capitalAccumule,
          }),
        },
      },

      meta: {
        description: 'Consultation du capital constitué (via MyPension.be)',
      },
    },

    modificationCotisations: {
      on: {
        MODIFIER_COTISATIONS: {
          target: 'planActif',
          actions: assign({
            cotisationPersonnelle: ({ event }) => event.nouvelleCotisation,
          }),
        },
      },

      meta: {
        description: 'Modification des cotisations personnelles volontaires',
      },
    },

    changementEmployeur: {
      on: {
        TRANSFERER_CAPITAL: {
          target: 'planActif',
          actions: assign({
            organismeAssurance: ({ event }) => event.nouvelOrganisme,
          }),
        },
      },

      meta: {
        description: 'Changement d\'employeur - transfert ou maintien du capital',
      },
    },

    rachatCapital: {
      on: {
        RACHETER_CAPITAL: {
          target: 'planTermine',
        },
      },

      meta: {
        description: 'Rachat anticipé du capital (conditions strictes: achat résidence, etc.)',
      },
    },

    agePensionAtteint: {
      on: {
        CHOISIR_MODE_PAIEMENT: {
          target: 'perceptionPension',
        },
      },

      meta: {
        description: 'Âge légal de la pension atteint',
      },
    },

    perceptionPension: {
      on: {
        PERCEVOIR_PENSION: {
          target: 'planTermine',
        },
      },

      meta: {
        description: 'Perception de la pension complémentaire (capital, rente ou mixte)',
      },
    },

    planTermine: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Plan de pension terminé',
      },
    },
  },
});

/**
 * Visualisation du workflow de la pension complémentaire:
 *
 * idle
 *   → choixOrganisme
 *   → definitionCotisations
 *   → designationBeneficiaire
 *   → signatureAdhesion
 *   → planActif
 *       ↓
 *   [cotisations/consultations/modifications]
 *       ↓
 *   gestionCotisations
 *       ↓
 *   calculRendement
 *       ↓
 *   agePensionAtteint
 *       ↓
 *   perceptionPension
 *       ↓
 *   planTermine
 */
