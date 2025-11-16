/**
 * Machine d'état XState pour la Prime rénovation
 *
 * Cette machine d'état représente le flux de travail pour demander une prime de
 * rénovation, incluant la vérification des travaux éligibles, le calcul de la prime,
 * et le suivi du versement.
 */

import { createMachine, assign } from 'xstate';

interface Proprietaire {
  id: string;
  nom: string;
  revenus: number;
  adresseHabitation: string;
}

interface TravauxRenovation {
  id: string;
  type: 'isolation' | 'chauffage' | 'toiture' | 'fenetres' | 'ventilation' | 'energie_renouvelable';
  description: string;
  montantDevis: number;
  montantFacture: number;
  dateDebut: Date;
  dateFin: Date;
  entrepreneurAgree: boolean;
}

interface PrimeRenovation {
  estEligible: boolean;
  montantPrime: number;
  tauxPrime: number;
  categorieRevenu: 'faible' | 'moyen' | 'eleve';
  motifRefus?: string;
}

interface PrimeRenovationContext {
  proprietaire: Proprietaire | null;
  travaux: TravauxRenovation[];
  prime: PrimeRenovation | null;
  devis: string[];
  factures: string[];
  totalPrime: number;
}

export const primeRenovationMachine = createMachine({
  id: 'primeRenovation',
  initial: 'inactif',

  schemas: {
    context: {} as PrimeRenovationContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; proprietaire: Proprietaire }
      | { type: 'AJOUTER_TRAVAUX'; travaux: TravauxRenovation }
      | { type: 'SOUMETTRE_DEVIS'; documents: string[] }
      | { type: 'DEVIS_APPROUVES' }
      | { type: 'DEVIS_REJETES'; raison: string }
      | { type: 'TRAVAUX_TERMINES' }
      | { type: 'SOUMETTRE_FACTURES'; documents: string[] }
      | { type: 'FACTURES_VALIDEES' }
      | { type: 'FACTURES_INVALIDES' }
      | { type: 'CALCULER_PRIME' }
      | { type: 'PRIME_CALCULEE'; prime: PrimeRenovation }
      | { type: 'PRIME_VERSEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    proprietaire: null,
    travaux: [],
    prime: null,
    devis: [],
    factures: [],
    totalPrime: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'saisieInformations',
          actions: assign({
            proprietaire: ({ event }: { event: any }) => event.proprietaire,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une demande de prime de rénovation',
      },
    },

    saisieInformations: {
      on: {
        AJOUTER_TRAVAUX: {
          target: 'soumissionDevis',
          actions: assign({
            travaux: ({ context, event }: { context: any; event: any }) => [...context.travaux, event.travaux],
          }),
        },
      },

      meta: {
        description: 'Saisie des informations sur les travaux de rénovation prévus',
      },
    },

    soumissionDevis: {
      on: {
        SOUMETTRE_DEVIS: {
          target: 'validationDevis',
          actions: assign({
            devis: ({ event }: { event: any }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission des devis des entrepreneurs agréés',
      },
    },

    validationDevis: {
      on: {
        DEVIS_APPROUVES: {
          target: 'travauxEnCours',
        },
        DEVIS_REJETES: {
          target: 'soumissionDevis',
        },
      },

      meta: {
        description: 'Validation des devis par l\'administration régionale',
      },
    },

    travauxEnCours: {
      on: {
        TRAVAUX_TERMINES: {
          target: 'soumissionFactures',
        },
      },

      meta: {
        description: 'Travaux de rénovation en cours - accord préalable obtenu',
      },
    },

    soumissionFactures: {
      on: {
        SOUMETTRE_FACTURES: {
          target: 'validationFactures',
          actions: assign({
            factures: ({ event }: { event: any }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission des factures finales des travaux terminés',
      },
    },

    validationFactures: {
      on: {
        FACTURES_VALIDEES: {
          target: 'calculPrime',
        },
        FACTURES_INVALIDES: {
          target: 'soumissionFactures',
        },
      },

      meta: {
        description: 'Validation des factures et de la conformité des travaux',
      },
    },

    calculPrime: {
      on: {
        PRIME_CALCULEE: [
          {
            target: 'primeAccordee',
            guard: ({ event }: { event: any }) => event.prime.estEligible,
            actions: assign({
              prime: ({ event }: { event: any }) => event.prime,
              totalPrime: ({ event }: { event: any }) => event.prime.montantPrime,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              prime: ({ event }: { event: any }) => event.prime,
            }),
          },
        ],
      },

      meta: {
        description: 'Calcul du montant de la prime selon les revenus et les travaux',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Non éligible à la prime de rénovation',
      },
    },

    primeAccordee: {
      on: {
        PRIME_VERSEE: {
          target: 'versee',
        },
      },

      meta: {
        description: 'Prime de rénovation accordée - en attente de versement',
      },
    },

    versee: {
      type: 'final',

      meta: {
        description: 'Prime de rénovation versée avec succès',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la prime rénovation:
 *
 * inactif
 *   → saisieInformations
 *   → soumissionDevis
 *   → validationDevis
 *   → travauxEnCours
 *   → soumissionFactures
 *   → validationFactures
 *   → calculPrime
 *       ↓ (si éligible)
 *     primeAccordee → versee ✓
 *       ↓ (si non éligible)
 *     nonEligible
 */
