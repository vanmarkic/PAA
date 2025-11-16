/**
 * Machine XState pour l'Abonnement Social Transport
 *
 * Cette machine d'état représente le flux de traitement de l'abonnement social
 * pour les transports en commun à tarif réduit.
 */

import { createMachine, assign } from 'xstate';

interface Demandeur {
  nom: string;
  numeroRegistreNational: string;
  age: number;
  adresse: string;
  region: 'Flandre' | 'Wallonie' | 'Bruxelles';
}

interface ConditionsSpeciales {
  beneficiaireBIM: boolean;
  beneficiaireRIS: boolean;
  invalide: boolean;
  ancienCombattant: boolean;
  plus65ans: boolean;
  etudiant: boolean;
}

interface AbonnementSocial {
  typeAbonnement: string;
  tarifReduit: number;
  tarifNormal: number;
  reduction: number;
  validite: number; // mois
  reseaux: string[];
}

interface AbonnementSocialTransportContext {
  demandeur: Demandeur | null;
  conditionsSpeciales: ConditionsSpeciales | null;
  abonnement: AbonnementSocial | null;
  carteEmise: boolean;
  renouvellementAuto: boolean;
}

export const abonnementSocialTransportMachine = createMachine({
  id: 'abonnementSocialTransport',
  initial: 'inactif',

  schemas: {
    context: {} as AbonnementSocialTransportContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; demandeur: Demandeur }
      | { type: 'CONDITIONS_VERIFIEES'; conditions: ConditionsSpeciales }
      | { type: 'ATTESTATION_FOURNIE' }
      | { type: 'ABONNEMENT_CALCULE'; abonnement: AbonnementSocial }
      | { type: 'CARTE_EMISE' }
      | { type: 'ABONNEMENT_ACTIVE' }
      | { type: 'RENOUVELLEMENT_MENSUEL' }
      | { type: 'CHANGEMENT_SITUATION' }
      | { type: 'PERTE_ELIGIBILITE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    demandeur: null,
    conditionsSpeciales: null,
    abonnement: null,
    carteEmise: false,
    renouvellementAuto: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationConditions',
          actions: assign({
            demandeur: ({ event }) => event.demandeur,
          }),
        },
      },

      meta: {
        description: 'En attente de demande d\'abonnement social transport',
      },
    },

    verificationConditions: {
      on: {
        CONDITIONS_VERIFIEES: [
          {
            target: 'demandeAttestation',
            guard: ({ event }) =>
              event.conditions.beneficiaireBIM ||
              event.conditions.beneficiaireRIS ||
              event.conditions.invalide ||
              event.conditions.ancienCombattant ||
              event.conditions.plus65ans,
            actions: assign({
              conditionsSpeciales: ({ event }) => event.conditions,
            }),
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification des conditions spéciales (BIM, RIS, invalide, +65 ans)',
      },
    },

    demandeAttestation: {
      on: {
        ATTESTATION_FOURNIE: {
          target: 'calculAbonnement',
        },
      },

      meta: {
        description: 'Fourniture de l\'attestation de la mutuelle ou du CPAS',
      },
    },

    calculAbonnement: {
      on: {
        ABONNEMENT_CALCULE: {
          target: 'emissionCarte',
          actions: assign({
            abonnement: ({ event }) => event.abonnement,
          }),
        },
      },

      meta: {
        description: 'Calcul du tarif social selon la région (STIB, TEC, De Lijn, SNCB)',
      },
    },

    emissionCarte: {
      on: {
        CARTE_EMISE: {
          target: 'activationAbonnement',
          actions: assign({
            carteEmise: true,
          }),
        },
      },

      meta: {
        description: 'Émission de la carte de transport social',
      },
    },

    activationAbonnement: {
      on: {
        ABONNEMENT_ACTIVE: {
          target: 'abonnementActif',
          actions: assign({
            renouvellementAuto: true,
          }),
        },
      },

      meta: {
        description: 'Activation de l\'abonnement social',
      },
    },

    abonnementActif: {
      on: {
        RENOUVELLEMENT_MENSUEL: {
          target: 'abonnementActif',
        },
        CHANGEMENT_SITUATION: {
          target: 'verificationConditions',
        },
        PERTE_ELIGIBILITE: {
          target: 'abonnementSuspendu',
        },
      },

      meta: {
        description: 'Abonnement actif - accès aux transports en commun à tarif réduit',
      },
    },

    abonnementSuspendu: {
      on: {
        CONDITIONS_VERIFIEES: {
          target: 'activationAbonnement',
          guard: ({ event }) =>
            event.conditions.beneficiaireBIM ||
            event.conditions.beneficiaireRIS,
        },
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Abonnement suspendu - conditions non remplies',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - aucune condition spéciale reconnue',
      },
    },
  },
});

/**
 * Visualisation du flux de l'abonnement social transport:
 *
 * inactif
 *   → verificationConditions (BIM/RIS/invalide/+65)
 *   → demandeAttestation
 *   → calculAbonnement (STIB/TEC/De Lijn/SNCB)
 *   → emissionCarte
 *   → activationAbonnement
 *   → abonnementActif
 *       ↓ (renouvellement mensuel)
 *     abonnementActif
 *       ↓ (perte éligibilité)
 *     abonnementSuspendu
 */
