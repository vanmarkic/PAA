/**
 * Machine d'état XState pour la Déduction fiscale habitation
 *
 * Cette machine d'état représente le flux de travail pour demander une déduction
 * fiscale pour l'habitation, incluant la vérification de propriété, le calcul
 * de la déduction, et la validation annuelle.
 */

import { createMachine, assign } from 'xstate';

interface Proprietaire {
  id: string;
  nom: string;
  revenus: number;
  adresseHabitation: string;
  valeurCadastrale: number;
  dateAcquisition: Date;
}

interface DeductionResult {
  estEligible: boolean;
  montantDeduction: number;
  plafondAtteint: boolean;
  motifRefus?: string;
}

interface DeductionHabitationContext {
  proprietaire: Proprietaire | null;
  resultatDeduction: DeductionResult | null;
  preuvesPropriete: string[];
  montantAnnuel: number;
  anneeFiscale: number;
}

export const deductionHabitationMachine = createMachine({
  id: 'deductionHabitation',
  initial: 'inactif',

  schemas: {
    context: {} as DeductionHabitationContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; proprietaire: Proprietaire; annee: number }
      | { type: 'PROPRIETE_VERIFIEE'; estProprietaire: boolean }
      | { type: 'DEDUCTION_CALCULEE'; resultat: DeductionResult }
      | { type: 'DOCUMENTS_SOUMIS'; documents: string[] }
      | { type: 'VALIDATION_REUSSIE' }
      | { type: 'VALIDATION_ECHOUEE'; raison: string }
      | { type: 'ACCEPTER_DEDUCTION' }
      | { type: 'ANNEE_SUIVANTE'; nouvelleAnnee: number }
      | { type: 'REINITIALISER' }
  },

  context: {
    proprietaire: null as Proprietaire | null,
    resultatDeduction: null as DeductionResult | null,
    preuvesPropriete: [] as string[],
    montantAnnuel: 0,
    anneeFiscale: new Date().getFullYear(),
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationPropriete',
          actions: assign({
            proprietaire: ({ event }) => event.proprietaire,
            anneeFiscale: ({ event }) => event.annee,
          }),
        },
      },

      meta: {
        description: 'En attente du démarrage d\'une demande de déduction habitation',
      },
    },

    verificationPropriete: {
      on: {
        PROPRIETE_VERIFIEE: [
          {
            target: 'calculDeduction',
            guard: ({ event }) => event.estProprietaire,
          },
          {
            target: 'nonProprietaire',
          },
        ],
      },

      meta: {
        description: 'Vérification du statut de propriétaire et de l\'habitation principale',
      },
    },

    nonProprietaire: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demandeur n\'est pas propriétaire de l\'habitation principale',
      },
    },

    calculDeduction: {
      on: {
        DEDUCTION_CALCULEE: [
          {
            target: 'eligible',
            guard: ({ event }) => event.resultat.estEligible,
            actions: assign({
              resultatDeduction: ({ event }) => event.resultat,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              resultatDeduction: ({ event }) => event.resultat,
            }),
          },
        ],
      },

      meta: {
        description: 'Calcul du montant de la déduction basé sur la valeur cadastrale',
      },
    },

    eligible: {
      on: {
        DOCUMENTS_SOUMIS: {
          target: 'validationDocuments',
          actions: assign({
            preuvesPropriete: ({ event }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Éligible à la déduction - soumission des preuves de propriété',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Non éligible à la déduction habitation',
      },
    },

    validationDocuments: {
      on: {
        VALIDATION_REUSSIE: {
          target: 'deductionActive',
          actions: assign({
            montantAnnuel: ({ context }) => context.resultatDeduction?.montantDeduction || 0,
          }),
        },
        VALIDATION_ECHOUEE: {
          target: 'eligible',
        },
      },

      meta: {
        description: 'Validation des documents de propriété par l\'administration fiscale',
      },
    },

    deductionActive: {
      on: {
        ANNEE_SUIVANTE: {
          target: 'verificationAnnuelle',
          actions: assign({
            anneeFiscale: ({ event }) => event.nouvelleAnnee,
          }),
        },
      },

      meta: {
        description: 'Déduction active - renouvellement automatique annuel',
      },
    },

    verificationAnnuelle: {
      on: {
        PROPRIETE_VERIFIEE: [
          {
            target: 'deductionActive',
            guard: ({ event }) => event.estProprietaire,
          },
          {
            target: 'termine',
          },
        ],
      },

      meta: {
        description: 'Vérification annuelle de l\'éligibilité continue',
      },
    },

    termine: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Déduction terminée - changement de situation',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la déduction habitation:
 *
 * inactif
 *   → verificationPropriete
 *       ↓ (si propriétaire)
 *     calculDeduction
 *       ↓ (si éligible)
 *     eligible → validationDocuments → deductionActive
 *                                          ↓
 *                                   (année suivante)
 *                                          ↓
 *                                   verificationAnnuelle → deductionActive
 */
