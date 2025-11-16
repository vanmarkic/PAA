/**
 * XState machine for Logement Social (Social Housing) Application Workflow
 *
 * This state machine represents the workflow for applying to social housing in Belgium,
 * including eligibility checking, priority assessment, and housing assignment.
 */

import { createMachine, assign } from 'xstate';

interface LogementSocialUser {
  nom: string;
  revenus: number;
  tailleFamily: number;
  situationActuelle: string;
}

interface DossierLogement {
  dateInscription: Date;
  priorite: number;
  zoneGeographique: string;
}

interface LogementSocialContext {
  demandeur: LogementSocialUser | null;
  dossier: DossierLogement | null;
  estEligible: boolean;
  raisonIneligibilite: string[];
  listeAttente: number;
}

export const logementSocialMachine = createMachine({
  id: 'logementSocial',
  initial: 'attente',

  schemas: {
    context: {} as LogementSocialContext,
    events: {} as
      | { type: 'DEMANDER_LOGEMENT'; demandeur: LogementSocialUser }
      | { type: 'ELIGIBILITE_VERIFIEE'; eligible: boolean; raisons?: string[] }
      | { type: 'PRIORITE_CALCULEE'; priorite: number }
      | { type: 'INSCRIPTION_CONFIRMEE'; dossier: DossierLogement }
      | { type: 'LOGEMENT_DISPONIBLE' }
      | { type: 'ACCEPTER_LOGEMENT' }
      | { type: 'REFUSER_LOGEMENT' }
      | { type: 'ACTUALISER_SITUATION' }
      | { type: 'RETIRER_DEMANDE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    demandeur: null,
    dossier: null,
    estEligible: false,
    raisonIneligibilite: [],
    listeAttente: 0,
  },

  states: {
    attente: {
      on: {
        DEMANDER_LOGEMENT: {
          target: 'verificationEligibilite',
          actions: assign({
            demandeur: ({ event }: { event: any }) => event.demandeur,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de logement social',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'calculPriorite',
            guard: ({ event }: { event: any }) => event.eligible,
            actions: assign({
              estEligible: true,
            }),
          },
          {
            target: 'ineligible',
            actions: assign({
              estEligible: false,
              raisonIneligibilite: ({ event }: { event: any }) => event.raisons || [],
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification des critères d\'éligibilité (revenus, nationalité, résidence)',
      },
    },

    calculPriorite: {
      on: {
        PRIORITE_CALCULEE: {
          target: 'inscriptionListeAttente',
          actions: assign({
            dossier: ({ context, event }: { context: any; event: any }) => ({
              dateInscription: new Date(),
              priorite: event.priorite,
              zoneGeographique: '',
            }),
          }),
        },
      },

      meta: {
        description: 'Calcul du niveau de priorité basé sur la situation familiale et urgence',
      },
    },

    inscriptionListeAttente: {
      on: {
        INSCRIPTION_CONFIRMEE: {
          target: 'enAttente',
          actions: assign({
            dossier: ({ event }: { event: any }) => event.dossier,
          }),
        },
      },

      meta: {
        description: 'Inscription sur la liste d\'attente avec priorité assignée',
      },
    },

    enAttente: {
      on: {
        LOGEMENT_DISPONIBLE: {
          target: 'propositionLogement',
        },
        ACTUALISER_SITUATION: {
          target: 'calculPriorite',
        },
        RETIRER_DEMANDE: {
          target: 'retiree',
        },
      },

      meta: {
        description: 'Demande active sur liste d\'attente - notification si logement disponible',
      },
    },

    propositionLogement: {
      on: {
        ACCEPTER_LOGEMENT: {
          target: 'attributionLogement',
        },
        REFUSER_LOGEMENT: {
          target: 'enAttente',
        },
      },

      meta: {
        description: 'Logement proposé au demandeur - attente de réponse',
      },
    },

    attributionLogement: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Logement attribué - signature du bail et remise des clés',
      },
    },

    ineligible: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Demandeur non éligible - affichage des raisons et alternatives',
      },
    },

    retiree: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Demande retirée par le demandeur',
      },
    },
  },
});

/**
 * Visualization of the social housing workflow:
 *
 * attente
 *   → verificationEligibilite
 *       ↓ (si eligible)
 *     calculPriorite
 *       ↓
 *     inscriptionListeAttente
 *       ↓
 *     enAttente → [logement disponible] → propositionLogement
 *       ↓                                        ↓
 *     [actualiser]                         [accepter/refuser]
 *       ↓                                        ↓
 *     calculPriorite                       attributionLogement
 */
