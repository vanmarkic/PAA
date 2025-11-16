/**
 * Machine XState pour Réclamation Consommation
 */

import { createMachine, assign } from 'xstate';

interface Reclamation {
  consommateur: string;
  vendeur: string;
  produitService: string;
  montantLitige: number;
  typeProbleme: 'defaut' | 'livraison' | 'garantie' | 'publicite-trompeuse';
}

interface ReclamationConsommationContext {
  reclamation: Reclamation | null;
  reclamationDeposeAupresVendeur: boolean;
  reponseVendeurFavorable: boolean;
  mediationAcceptee: boolean;
  accordTrouve: boolean;
  procedureJudiciaire: boolean;
}

export const reclamationConsommationMachine = createMachine({
  id: 'reclamationConsommation',
  initial: 'inactif',

  schemas: {
    context: {} as ReclamationConsommationContext,
    events: {} as
      | { type: 'DEPOSER_RECLAMATION'; reclamation: Reclamation }
      | { type: 'REPONSE_VENDEUR_FAVORABLE' }
      | { type: 'REPONSE_VENDEUR_DEFAVORABLE' }
      | { type: 'SAISIR_MEDIATION' }
      | { type: 'ACCORD_MEDIATION' }
      | { type: 'ECHEC_MEDIATION' }
      | { type: 'SAISIR_TRIBUNAL' }
      | { type: 'JUGEMENT_RENDU' }
  },

  context: {
    reclamation: null,
    reclamationDeposeAupresVendeur: false,
    reponseVendeurFavorable: false,
    mediationAcceptee: false,
    accordTrouve: false,
    procedureJudiciaire: false,
  },

  states: {
    inactif: {
      on: {
        DEPOSER_RECLAMATION: {
          target: 'reclamationVendeur',
          actions: assign({
            reclamation: ({ event }) => event.reclamation,
            reclamationDeposeAupresVendeur: true,
          }),
        },
      },
      meta: { description: 'Pas de réclamation en cours' },
    },

    reclamationVendeur: {
      on: {
        REPONSE_VENDEUR_FAVORABLE: {
          target: 'resolu',
          actions: assign({ reponseVendeurFavorable: true }),
        },
        REPONSE_VENDEUR_DEFAVORABLE: { target: 'contactServiceMediationConsommateur' },
      },
      meta: { description: 'Réclamation écrite auprès du vendeur (délai 30 jours)' },
    },

    contactServiceMediationConsommateur: {
      on: {
        SAISIR_MEDIATION: {
          target: 'mediation',
          actions: assign({ mediationAcceptee: true }),
        },
      },
      meta: { description: 'Contact Service de Médiation pour les Consommateurs (gratuit)' },
    },

    mediation: {
      on: {
        ACCORD_MEDIATION: {
          target: 'resolu',
          actions: assign({ accordTrouve: true }),
        },
        ECHEC_MEDIATION: { target: 'saisieJustice' },
      },
      meta: { description: 'Médiation entre consommateur et vendeur' },
    },

    saisieJustice: {
      on: {
        SAISIR_TRIBUNAL: {
          target: 'procedureJudiciaire',
          actions: assign({ procedureJudiciaire: true }),
        },
      },
      meta: { description: 'Saisie Justice de Paix (<5000€) ou Tribunal (<50 000€)' },
    },

    procedureJudiciaire: {
      on: {
        JUGEMENT_RENDU: { target: 'termine' },
      },
      meta: { description: 'Procédure judiciaire en cours' },
    },

    resolu: {
      type: 'final',
      meta: { description: 'Litige résolu à l\'amiable' },
    },

    termine: {
      type: 'final',
      meta: { description: 'Procédure terminée' },
    },
  },
});
