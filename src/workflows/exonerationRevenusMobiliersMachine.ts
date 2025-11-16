/**
 * Machine d'état XState pour l'Exonération revenus mobiliers
 *
 * Cette machine d'état représente le flux de travail pour demander l'exonération
 * des revenus mobiliers (intérêts, dividendes), incluant la vérification des
 * plafonds, le calcul de l'exonération, et la déclaration.
 */

import { createMachine, assign } from 'xstate';

interface Contribuable {
  id: string;
  nom: string;
  revenus: number;
  situationFamiliale: string;
}

interface RevenuMobilier {
  id: string;
  type: 'interets_epargne' | 'dividendes' | 'obligations' | 'fonds_placement';
  source: string;
  montant: number;
  datePerception: Date;
  precompteRetenu: number;
}

interface ExonerationRevenusMobiliers {
  montantExonere: number;
  montantImposable: number;
  plafondExoneration: number;
  plafondUtilise: number;
  precompteRecuperable: number;
  estExonere: boolean;
}

interface ExonerationRevenusMobiliersContext {
  contribuable: Contribuable | null;
  revenus: RevenuMobilier[];
  exoneration: ExonerationRevenusMobiliers | null;
  attestationsFiscales: string[];
  totalRevenusMobiliers: number;
  anneeFiscale: number;
}

export const exonerationRevenusMobiliersMachine = createMachine({
  id: 'exonerationRevenusMobiliers',
  initial: 'inactif',

  schemas: {
    context: {} as ExonerationRevenusMobiliersContext,
    events: {} as
      | { type: 'DEMARRER_DECLARATION'; contribuable: Contribuable }
      | { type: 'AJOUTER_REVENU'; revenu: RevenuMobilier }
      | { type: 'CALCULER_TOTAL' }
      | { type: 'TOTAL_CALCULE'; total: number }
      | { type: 'VERIFIER_EXONERATION' }
      | { type: 'EXONERATION_VERIFIEE'; exoneration: ExonerationRevenusMobiliers }
      | { type: 'SOUMETTRE_ATTESTATIONS'; documents: string[] }
      | { type: 'ATTESTATIONS_VALIDEES' }
      | { type: 'ATTESTATIONS_INVALIDES' }
      | { type: 'EXONERATION_APPROUVEE' }
      | { type: 'NOUVELLE_ANNEE'; annee: number }
      | { type: 'REINITIALISER' }
  },

  context: {
    contribuable: null,
    revenus: [],
    exoneration: null,
    attestationsFiscales: [],
    totalRevenusMobiliers: 0,
    anneeFiscale: new Date().getFullYear(),
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DECLARATION: {
          target: 'saisieRevenus',
          actions: assign({
            contribuable: (_, event) => event.contribuable,
            anneeFiscale: new Date().getFullYear(),
          }),
        },
      },

      meta: {
        description: 'En attente d\'une déclaration de revenus mobiliers',
      },
    },

    saisieRevenus: {
      on: {
        AJOUTER_REVENU: {
          target: 'saisieRevenus',
          actions: assign({
            revenus: (context, event) => [...context.revenus, event.revenu],
          }),
        },
        CALCULER_TOTAL: {
          target: 'calculTotal',
        },
      },

      meta: {
        description: 'Saisie des revenus mobiliers perçus durant l\'année',
      },
    },

    calculTotal: {
      on: {
        TOTAL_CALCULE: {
          target: 'verificationExoneration',
          actions: assign({
            totalRevenusMobiliers: (_, event) => event.total,
          }),
        },
      },

      meta: {
        description: 'Calcul du total des revenus mobiliers',
      },
    },

    verificationExoneration: {
      on: {
        EXONERATION_VERIFIEE: [
          {
            target: 'exonere',
            guard: (_, event) => event.exoneration.estExonere,
            actions: assign({
              exoneration: (_, event) => event.exoneration,
            }),
          },
          {
            target: 'imposable',
            actions: assign({
              exoneration: (_, event) => event.exoneration,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification de l\'exonération selon le plafond légal',
      },
    },

    exonere: {
      on: {
        SOUMETTRE_ATTESTATIONS: {
          target: 'validationAttestations',
          actions: assign({
            attestationsFiscales: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Revenus éligibles à l\'exonération - soumission des attestations',
      },
    },

    imposable: {
      on: {
        SOUMETTRE_ATTESTATIONS: {
          target: 'validationAttestations',
          actions: assign({
            attestationsFiscales: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Revenus dépassent le plafond - imposition partielle ou totale',
      },
    },

    validationAttestations: {
      on: {
        ATTESTATIONS_VALIDEES: {
          target: 'exonerationApprouvee',
        },
        ATTESTATIONS_INVALIDES: {
          target: 'exonere',
        },
      },

      meta: {
        description: 'Validation des attestations fiscales (fiches 273)',
      },
    },

    exonerationApprouvee: {
      on: {
        EXONERATION_APPROUVEE: {
          target: 'active',
        },
      },

      meta: {
        description: 'Exonération approuvée pour l\'année fiscale',
      },
    },

    active: {
      on: {
        NOUVELLE_ANNEE: {
          target: 'inactif',
          actions: assign({
            anneeFiscale: (_, event) => event.annee,
            revenus: [],
            totalRevenusMobiliers: 0,
          }),
        },
      },

      meta: {
        description: 'Exonération active - renouvellement annuel requis',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de l'exonération revenus mobiliers:
 *
 * inactif
 *   → saisieRevenus → calculTotal
 *       ↑ (ajouter)       ↓
 *       └──────────  verificationExoneration
 *                          ↓       ↓
 *                   (exonéré)   (imposable)
 *                          ↓       ↓
 *                      exonere   imposable
 *                          ↓       ↓
 *                      validationAttestations
 *                              ↓
 *                      exonerationApprouvee
 *                              ↓
 *                          active
 *                              ↓
 *                      (nouvelle année)
 *                              ↓
 *                          inactif
 */
