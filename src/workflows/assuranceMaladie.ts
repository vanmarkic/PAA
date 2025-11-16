/**
 * Machine XState pour l'Assurance Maladie (Mutuelle)
 *
 * Cette machine d'état représente le flux de traitement de l'assurance maladie obligatoire,
 * incluant l'affiliation, remboursements et suivi des soins.
 */

import { createMachine, assign } from 'xstate';

interface Assure {
  nom: string;
  numeroRegistreNational: string;
  dateNaissance: Date;
  mutuelleChoisie: string;
  situationProfessionnelle: string;
  personnesACharge: number;
}

interface RemboursementSoins {
  typePrestation: string;
  montantDepense: number;
  tauxRemboursement: number;
  montantRembourse: number;
  ticketModerateur: number;
}

interface DMG {
  medecinGeneraliste: string;
  dateOuverture: Date;
  avantagesTarifs: boolean;
}

interface AssuranceMaladieContext {
  assure: Assure | null;
  dmg: DMG | null;
  remboursements: RemboursementSoins[];
  maximumFacture: number;
  interventionMajoree: boolean;
  cotisationsAJour: boolean;
}

export const assuranceMaladieMachine = createMachine({
  id: 'assuranceMaladie',
  initial: 'inactif',

  schemas: {
    context: {} as AssuranceMaladieContext,
    events: {} as
      | { type: 'DEMARRER_AFFILIATION'; assure: Assure }
      | { type: 'MUTUELLE_CHOISIE'; mutuelle: string }
      | { type: 'AFFILIATION_COMPLETE' }
      | { type: 'DMG_OUVERT'; dmg: DMG }
      | { type: 'PRESTATION_SOINS'; remboursement: RemboursementSoins }
      | { type: 'DEMANDE_REMBOURSEMENT' }
      | { type: 'REMBOURSEMENT_EFFECTUE' }
      | { type: 'MAXIMUM_FACTURE_ATTEINT' }
      | { type: 'INTERVENTION_MAJOREE_ACCORDEE' }
      | { type: 'COTISATIONS_IMPAYEES' }
      | { type: 'REGULARISATION' }
      | { type: 'REINITIALISER' }
  },

  context: {
    assure: null,
    dmg: null,
    remboursements: [],
    maximumFacture: 0,
    interventionMajoree: false,
    cotisationsAJour: true,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_AFFILIATION: {
          target: 'choixMutuelle',
          actions: assign({
            assure: (_, event) => event.assure,
          }),
        },
      },

      meta: {
        description: 'En attente d\'affiliation à une mutuelle',
      },
    },

    choixMutuelle: {
      on: {
        MUTUELLE_CHOISIE: {
          target: 'affiliationEnCours',
        },
      },

      meta: {
        description: 'Choix de la mutuelle parmi les options disponibles',
      },
    },

    affiliationEnCours: {
      on: {
        AFFILIATION_COMPLETE: {
          target: 'assureActif',
        },
      },

      meta: {
        description: 'Traitement de l\'affiliation et création du dossier',
      },
    },

    assureActif: {
      on: {
        DMG_OUVERT: {
          target: 'assureAvecDMG',
          actions: assign({
            dmg: (_, event) => event.dmg,
          }),
        },
        PRESTATION_SOINS: {
          target: 'traitementRemboursement',
        },
        INTERVENTION_MAJOREE_ACCORDEE: {
          target: 'assureAvecInterventionMajoree',
          actions: assign({
            interventionMajoree: true,
          }),
        },
        COTISATIONS_IMPAYEES: {
          target: 'suspensionDroits',
        },
      },

      meta: {
        description: 'Assuré actif - accès aux soins et remboursements de base',
      },
    },

    assureAvecDMG: {
      on: {
        PRESTATION_SOINS: {
          target: 'traitementRemboursement',
        },
        MAXIMUM_FACTURE_ATTEINT: {
          target: 'exemptionTicketModerateur',
        },
        COTISATIONS_IMPAYEES: {
          target: 'suspensionDroits',
        },
      },

      meta: {
        description: 'Assuré avec DMG - tarifs réduits et meilleurs remboursements',
      },
    },

    assureAvecInterventionMajoree: {
      on: {
        PRESTATION_SOINS: {
          target: 'traitementRemboursement',
        },
        MAXIMUM_FACTURE_ATTEINT: {
          target: 'exemptionTicketModerateur',
        },
      },

      meta: {
        description: 'Assuré avec intervention majorée - remboursements augmentés',
      },
    },

    traitementRemboursement: {
      on: {
        DEMANDE_REMBOURSEMENT: {
          target: 'calculRemboursement',
        },
      },

      meta: {
        description: 'Enregistrement de la prestation de soins',
      },
    },

    calculRemboursement: {
      on: {
        REMBOURSEMENT_EFFECTUE: {
          target: 'assureActif',
          actions: assign({
            remboursements: (context, event) => [
              ...context.remboursements,
              event as any,
            ],
          }),
        },
      },

      meta: {
        description: 'Calcul et versement du remboursement selon barème',
      },
    },

    exemptionTicketModerateur: {
      on: {
        PRESTATION_SOINS: {
          target: 'traitementRemboursement',
        },
      },

      meta: {
        description: 'Maximum à facturer atteint - exemption de ticket modérateur',
      },
    },

    suspensionDroits: {
      on: {
        REGULARISATION: {
          target: 'assureActif',
          actions: assign({
            cotisationsAJour: true,
          }),
        },
      },

      meta: {
        description: 'Droits suspendus suite à cotisations impayées',
      },
    },
  },
});

/**
 * Visualisation du flux de l'assurance maladie:
 *
 * inactif
 *   → choixMutuelle
 *   → affiliationEnCours
 *   → assureActif
 *       ↓ (ouverture DMG)
 *     assureAvecDMG
 *       ↓ (prestation soins)
 *     traitementRemboursement
 *       ↓
 *     calculRemboursement → assureActif
 *       ↓ (maximum facture atteint)
 *     exemptionTicketModerateur
 */
