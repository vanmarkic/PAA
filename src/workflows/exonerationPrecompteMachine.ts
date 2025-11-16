/**
 * Machine d'état XState pour l'Exonération précompte immobilier
 *
 * Cette machine d'état représente le flux de travail pour demander une exonération
 * du précompte immobilier, incluant la vérification d'éligibilité, le calcul de
 * l'exonération, et le suivi annuel.
 */

import { createMachine, assign } from 'xstate';

interface ProprietaireImmobilier {
  id: string;
  nom: string;
  biensImmobiliers: BienImmobilier[];
  situationFamiliale: string;
  revenus: number;
}

interface BienImmobilier {
  id: string;
  adresse: string;
  typeHabitation: 'principale' | 'secondaire';
  valeurCadastrale: number;
  dateConstruction: Date;
  performanceEnergetique?: string;
}

interface ExonerationPrecompte {
  estEligible: boolean;
  montantPrecompte: number;
  montantExoneration: number;
  pourcentageExoneration: number;
  motifRefus?: string;
}

interface ExonerationPrecompteContext {
  proprietaire: ProprietaireImmobilier | null;
  bienConcerne: BienImmobilier | null;
  exoneration: ExonerationPrecompte | null;
  documentsPropriety: string[];
  anneeFiscale: number;
}

export const exonerationPrecompteMachine = createMachine({
  id: 'exonerationPrecompte',
  initial: 'inactif',

  schemas: {
    context: {} as ExonerationPrecompteContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; proprietaire: ProprietaireImmobilier; bien: BienImmobilier }
      | { type: 'ELIGIBILITE_VERIFIEE'; exoneration: ExonerationPrecompte }
      | { type: 'ACCEPTER_EXONERATION' }
      | { type: 'REFUSER_EXONERATION' }
      | { type: 'DOCUMENTS_SOUMIS'; documents: string[] }
      | { type: 'DOCUMENTS_VALIDES' }
      | { type: 'DOCUMENTS_INVALIDES' }
      | { type: 'EXONERATION_ACCORDEE' }
      | { type: 'ANNEE_SUIVANTE'; annee: number }
      | { type: 'REINITIALISER' }
  },

  context: {
    proprietaire: null,
    bienConcerne: null,
    exoneration: null,
    documentsPropriety: [],
    anneeFiscale: new Date().getFullYear(),
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationEligibilite',
          actions: assign({
            proprietaire: ({ event }) => event.proprietaire,
            bienConcerne: ({ event }) => event.bien,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une demande d\'exonération de précompte immobilier',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'eligible',
            guard: ({ event }) => event.exoneration.estEligible,
            actions: assign({
              exoneration: ({ event }) => event.exoneration,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              exoneration: ({ event }) => event.exoneration,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification des critères d\'exonération (habitation principale, revenus, etc.)',
      },
    },

    eligible: {
      on: {
        ACCEPTER_EXONERATION: {
          target: 'soumissionDocuments',
        },
        REFUSER_EXONERATION: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Propriétaire éligible à l\'exonération de précompte immobilier',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Propriétaire non éligible à l\'exonération',
      },
    },

    refuse: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Exonération refusée par le propriétaire',
      },
    },

    soumissionDocuments: {
      on: {
        DOCUMENTS_SOUMIS: {
          target: 'validationDocuments',
          actions: assign({
            documentsPropriety: ({ event }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission des documents de propriété et de domiciliation',
      },
    },

    validationDocuments: {
      on: {
        DOCUMENTS_VALIDES: {
          target: 'exonerationAccordee',
        },
        DOCUMENTS_INVALIDES: {
          target: 'soumissionDocuments',
        },
      },

      meta: {
        description: 'Validation des documents par l\'administration communale',
      },
    },

    exonerationAccordee: {
      on: {
        EXONERATION_ACCORDEE: {
          target: 'active',
        },
      },

      meta: {
        description: 'Exonération de précompte immobilier accordée',
      },
    },

    active: {
      on: {
        ANNEE_SUIVANTE: {
          target: 'verificationAnnuelle',
          actions: assign({
            anneeFiscale: ({ event }) => event.annee,
          }),
        },
      },

      meta: {
        description: 'Exonération active - vérification annuelle de l\'éligibilité',
      },
    },

    verificationAnnuelle: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'active',
            guard: ({ event }) => event.exoneration.estEligible,
            actions: assign({
              exoneration: ({ event }) => event.exoneration,
            }),
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
        description: 'Exonération terminée - changement de situation',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de l'exonération précompte immobilier:
 *
 * inactif
 *   → verificationEligibilite
 *       ↓ (si éligible)
 *     eligible → soumissionDocuments → validationDocuments
 *       ↓                                     ↓
 *     nonEligible                      exonerationAccordee
 *                                             ↓
 *                                          active
 *                                             ↓
 *                                      verificationAnnuelle → active ou termine
 */
