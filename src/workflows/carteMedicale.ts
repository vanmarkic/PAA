/**
 * Machine XState pour la Carte Médicale
 *
 * Cette machine d'état représente le flux de traitement de la carte médicale
 * donnant accès gratuit aux soins de santé pour personnes en difficulté.
 */

import { createMachine, assign } from 'xstate';

interface Demandeur {
  nom: string;
  numeroRegistreNational: string;
  age: number;
  revenus: number;
  situationFamiliale: string;
  residenceLegale: boolean;
  inscriptionMutuelle: boolean;
}

interface EnqueteSociale {
  situationFinanciere: any;
  besoinsMedicaux: string[];
  urgenceSanitaire: boolean;
  accesAutresAides: boolean;
}

interface CarteMedicaleInfo {
  numeroCarte: string;
  dateEmission: Date;
  dateExpiration: Date;
  typeAcces: 'complet' | 'partiel';
  servicesCouvert: string[];
}

interface CarteMedicaleContext {
  demandeur: Demandeur | null;
  enquete: EnqueteSociale | null;
  carteMedicale: CarteMedicaleInfo | null;
  validite: number; // mois
  renouvellementAuto: boolean;
}

export const cartemedicaleMachine = createMachine({
  id: 'carteMedicale',
  initial: 'inactif',

  schemas: {
    context: {} as CarteMedicaleContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; demandeur: Demandeur }
      | { type: 'URGENCE_SANITAIRE' }
      | { type: 'ENQUETE_COMPLETE'; enquete: EnqueteSociale }
      | { type: 'ELIGIBILITE_CONFIRMEE' }
      | { type: 'CARTE_EMISE'; carte: CarteMedicaleInfo }
      | { type: 'CARTE_ACTIVEE' }
      | { type: 'SOINS_UTILISES' }
      | { type: 'EXPIRATION_PROCHE' }
      | { type: 'RENOUVELLEMENT_DEMANDE' }
      | { type: 'SITUATION_AMELIOREE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    demandeur: null,
    enquete: null,
    carteMedicale: null,
    validite: 12,
    renouvellementAuto: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationPrerequis',
          actions: assign({
            demandeur: ({ event }) => event.demandeur,
          }),
        },
      },

      meta: {
        description: 'En attente de demande de carte médicale',
      },
    },

    verificationPrerequis: {
      on: {
        URGENCE_SANITAIRE: {
          target: 'emissionProvisoire',
        },
        ENQUETE_COMPLETE: {
          target: 'enqueteSociale',
        },
      },

      meta: {
        description: 'Vérification mutuelle et résidence légale en Belgique',
      },
    },

    emissionProvisoire: {
      on: {
        CARTE_EMISE: {
          target: 'enqueteSociale',
          actions: assign({
            carteMedicale: ({ event }) => event.carte,
          }),
        },
      },

      meta: {
        description: 'Émission provisoire immédiate en cas d\'urgence sanitaire',
      },
    },

    enqueteSociale: {
      on: {
        ENQUETE_COMPLETE: {
          target: 'evaluationEligibilite',
          actions: assign({
            enquete: ({ event }) => event.enquete,
          }),
        },
      },

      meta: {
        description: 'Enquête sociale par le CPAS sur la situation financière',
      },
    },

    evaluationEligibilite: {
      on: {
        ELIGIBILITE_CONFIRMEE: {
          target: 'emissionCarte',
        },
      },

      meta: {
        description: 'Évaluation des revenus et besoins médicaux',
      },
    },

    emissionCarte: {
      on: {
        CARTE_EMISE: {
          target: 'carteActive',
          actions: assign({
            carteMedicale: ({ event }) => event.carte,
          }),
        },
      },

      meta: {
        description: 'Émission de la carte médicale valable 12 mois',
      },
    },

    carteActive: {
      on: {
        SOINS_UTILISES: {
          target: 'carteActive',
        },
        EXPIRATION_PROCHE: {
          target: 'procedureRenouvellement',
        },
        SITUATION_AMELIOREE: {
          target: 'carteExpiree',
        },
      },

      meta: {
        description: 'Carte active - accès gratuit aux consultations et médicaments essentiels',
      },
    },

    procedureRenouvellement: {
      on: {
        RENOUVELLEMENT_DEMANDE: {
          target: 'enqueteSociale',
        },
      },

      meta: {
        description: 'Procédure de renouvellement - 2 mois avant expiration',
      },
    },

    carteExpiree: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Carte expirée - situation améliorée ou non renouvelée',
      },
    },
  },
});

/**
 * Visualisation du flux de la carte médicale:
 *
 * inactif
 *   → verificationPrerequis
 *       ↓ (urgence)
 *     emissionProvisoire → enqueteSociale
 *       ↓
 *     enqueteSociale
 *       ↓
 *     evaluationEligibilite
 *       ↓
 *     emissionCarte (validité 12 mois)
 *       ↓
 *     carteActive
 *       ↓ (expiration proche)
 *     procedureRenouvellement → enqueteSociale
 */
