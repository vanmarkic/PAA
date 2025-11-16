/**
 * Machine XState pour la Garantie Locative
 *
 * Cette machine d'état représente le flux de traitement de la garantie locative sociale,
 * permettant aux locataires de ne pas avancer la caution.
 */

import { createMachine, assign } from 'xstate';

interface LocataireGarantie {
  nom: string;
  numeroRegistreNational: string;
  revenus: number;
  compositionMenage: number;
  premierLogement: boolean;
}

interface LogementLoue {
  adresse: string;
  loyer: number;
  montantGarantie: number; // généralement 2 ou 3 mois de loyer
  proprietaire: string;
  etatDesLieux: any;
}

interface ConventionGarantie {
  montantCouvert: number;
  dureeEngagement: number;
  conditionsSpecifiques: string[];
  dateSignature: Date;
}

interface GarantieLocativeContext {
  locataire: LocataireGarantie | null;
  logement: LogementLoue | null;
  convention: ConventionGarantie | null;
  fpcl: boolean; // Fonds Public de Caution Locative
  etatDesLieuxEntree: any;
  etatDesLieuxSortie: any;
}

export const garantieLocativeMachine = createMachine({
  id: 'garantieLocative',
  initial: 'inactif',

  schemas: {
    context: {} as GarantieLocativeContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; locataire: LocataireGarantie; logement: LogementLoue }
      | { type: 'ELIGIBILITE_VERIFIEE'; eligible: boolean }
      | { type: 'CONVENTION_ETABLIE'; convention: ConventionGarantie }
      | { type: 'BAIL_SIGNE' }
      | { type: 'ETAT_LIEUX_ENTREE'; etat: any }
      | { type: 'GARANTIE_ACTIVEE' }
      | { type: 'FIN_BAIL' }
      | { type: 'ETAT_LIEUX_SORTIE'; etat: any }
      | { type: 'DEGATS_DETECTES'; montant: number }
      | { type: 'AUCUN_DEGAT' }
      | { type: 'GARANTIE_LIBEREE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    locataire: null,
    logement: null,
    convention: null,
    fpcl: false,
    etatDesLieuxEntree: null,
    etatDesLieuxSortie: null,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationEligibilite',
          actions: assign({
            locataire: ({ event }) => event.locataire,
            logement: ({ event }) => event.logement,
          }),
        },
      },

      meta: {
        description: 'En attente de demande de garantie locative',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'etablissementConvention',
            guard: ({ event }) => event.eligible,
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification revenus et conditions pour FPCL ou CPAS',
      },
    },

    etablissementConvention: {
      on: {
        CONVENTION_ETABLIE: {
          target: 'signatureBail',
          actions: assign({
            convention: ({ event }) => event.convention,
            fpcl: true,
          }),
        },
      },

      meta: {
        description: 'Établissement convention tripartite (locataire, propriétaire, FPCL/CPAS)',
      },
    },

    signatureBail: {
      on: {
        BAIL_SIGNE: {
          target: 'etatDesLieuxEntree',
        },
      },

      meta: {
        description: 'Signature du bail de location',
      },
    },

    etatDesLieuxEntree: {
      on: {
        ETAT_LIEUX_ENTREE: {
          target: 'garantieActive',
          actions: assign({
            etatDesLieuxEntree: ({ event }) => event.etat,
          }),
        },
      },

      meta: {
        description: 'Réalisation état des lieux d\'entrée détaillé',
      },
    },

    garantieActive: {
      on: {
        FIN_BAIL: {
          target: 'etatDesLieuxSortie',
        },
      },

      meta: {
        description: 'Garantie locative active pendant toute la durée du bail',
      },
    },

    etatDesLieuxSortie: {
      on: {
        ETAT_LIEUX_SORTIE: {
          target: 'evaluationDegats',
          actions: assign({
            etatDesLieuxSortie: ({ event }) => event.etat,
          }),
        },
      },

      meta: {
        description: 'Réalisation état des lieux de sortie',
      },
    },

    evaluationDegats: {
      on: {
        AUCUN_DEGAT: {
          target: 'garantieLiberee',
        },
        DEGATS_DETECTES: {
          target: 'interventionGarantie',
        },
      },

      meta: {
        description: 'Comparaison états des lieux et évaluation des dégâts',
      },
    },

    interventionGarantie: {
      on: {
        GARANTIE_LIBEREE: {
          target: 'garantieLiberee',
        },
      },

      meta: {
        description: 'Le FPCL/CPAS paie les dégâts, le locataire rembourse progressivement',
      },
    },

    garantieLiberee: {
      type: 'final',

      meta: {
        description: 'Garantie libérée - fin de la convention',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - revenus trop élevés ou conditions non remplies',
      },
    },
  },
});

/**
 * Visualisation du flux de la garantie locative:
 *
 * inactif
 *   → verificationEligibilite
 *   → etablissementConvention (tripartite)
 *   → signatureBail
 *   → etatDesLieuxEntree
 *   → garantieActive
 *       ↓ (fin bail)
 *     etatDesLieuxSortie
 *       ↓
 *     evaluationDegats
 *       ↓ (dégâts)      ↓ (aucun dégât)
 *   interventionGarantie → garantieLiberee ✓
 */
