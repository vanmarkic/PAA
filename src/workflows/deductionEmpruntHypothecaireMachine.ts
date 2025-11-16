/**
 * Machine d'état XState pour la Déduction emprunt hypothécaire
 *
 * Cette machine d'état représente le flux de travail pour demander la déduction
 * fiscale des intérêts d'emprunt hypothécaire, incluant la vérification du prêt,
 * le calcul de la déduction, et le suivi annuel.
 */

import { createMachine, assign } from 'xstate';

interface Emprunteur {
  id: string;
  nom: string;
  revenus: number;
  situationFamiliale: string;
}

interface EmpruntHypothecaire {
  id: string;
  montantEmprunte: number;
  tauxInteret: number;
  dureeAnnees: number;
  dateContrat: Date;
  destinationPret: 'achat_habitation_principale' | 'construction' | 'renovation' | 'autres';
  interetsPayesAnnee: number;
  capitalRembourseAnnee: number;
}

interface DeductionEmprunt {
  estEligible: boolean;
  montantDeductible: number;
  plafondApplicable: number;
  pourcentageDeduction: number;
  motifRefus?: string;
}

interface DeductionEmpruntHypothecaireContext {
  emprunteur: Emprunteur | null;
  emprunt: EmpruntHypothecaire | null;
  deduction: DeductionEmprunt | null;
  attestationsBanque: string[];
  totalDeductAnnuel: number;
  anneeFiscale: number;
}

export const deductionEmpruntHypothecaireMachine = createMachine({
  id: 'deductionEmpruntHypothecaire',
  initial: 'inactif',

  schemas: {
    context: {} as DeductionEmpruntHypothecaireContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; emprunteur: Emprunteur; emprunt: EmpruntHypothecaire }
      | { type: 'VERIFIER_ELIGIBILITE' }
      | { type: 'ELIGIBILITE_VERIFIEE'; deduction: DeductionEmprunt }
      | { type: 'ACCEPTER_DEDUCTION' }
      | { type: 'REFUSER_DEDUCTION' }
      | { type: 'SOUMETTRE_ATTESTATIONS'; documents: string[] }
      | { type: 'ATTESTATIONS_VALIDEES' }
      | { type: 'ATTESTATIONS_INVALIDES' }
      | { type: 'DEDUCTION_ACCORDEE' }
      | { type: 'ANNEE_SUIVANTE'; annee: number }
      | { type: 'REINITIALISER' }
  },

  context: {
    emprunteur: null,
    emprunt: null,
    deduction: null,
    attestationsBanque: [],
    totalDeductAnnuel: 0,
    anneeFiscale: new Date().getFullYear(),
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationEligibilite',
          actions: assign({
            emprunteur: (_, event) => event.emprunteur,
            emprunt: (_, event) => event.emprunt,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une demande de déduction pour emprunt hypothécaire',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'eligible',
            guard: (_, event) => event.deduction.estEligible,
            actions: assign({
              deduction: (_, event) => event.deduction,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              deduction: (_, event) => event.deduction,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification de l\'éligibilité (habitation principale, date contrat)',
      },
    },

    eligible: {
      on: {
        ACCEPTER_DEDUCTION: {
          target: 'soumissionAttestations',
        },
        REFUSER_DEDUCTION: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Emprunt éligible à la déduction fiscale',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Emprunt non éligible à la déduction',
      },
    },

    refuse: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Déduction refusée par l\'emprunteur',
      },
    },

    soumissionAttestations: {
      on: {
        SOUMETTRE_ATTESTATIONS: {
          target: 'validationAttestations',
          actions: assign({
            attestationsBanque: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission des attestations bancaires d\'intérêts payés',
      },
    },

    validationAttestations: {
      on: {
        ATTESTATIONS_VALIDEES: {
          target: 'deductionAccordee',
          actions: assign({
            totalDeductAnnuel: (context) => context.deduction?.montantDeductible || 0,
          }),
        },
        ATTESTATIONS_INVALIDES: {
          target: 'soumissionAttestations',
        },
      },

      meta: {
        description: 'Validation des attestations par l\'administration fiscale',
      },
    },

    deductionAccordee: {
      on: {
        DEDUCTION_ACCORDEE: {
          target: 'active',
        },
      },

      meta: {
        description: 'Déduction pour emprunt hypothécaire accordée',
      },
    },

    active: {
      on: {
        ANNEE_SUIVANTE: {
          target: 'verificationAnnuelle',
          actions: assign({
            anneeFiscale: (_, event) => event.annee,
          }),
        },
      },

      meta: {
        description: 'Déduction active - renouvellement annuel requis',
      },
    },

    verificationAnnuelle: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'active',
            guard: (_, event) => event.deduction.estEligible,
            actions: assign({
              deduction: (_, event) => event.deduction,
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
        description: 'Déduction terminée - fin du prêt ou changement de situation',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la déduction emprunt hypothécaire:
 *
 * inactif
 *   → verificationEligibilite
 *       ↓ (si éligible)
 *     eligible → soumissionAttestations → validationAttestations
 *       ↓                                        ↓
 *     nonEligible                         deductionAccordee
 *                                                ↓
 *                                             active
 *                                                ↓
 *                                         verificationAnnuelle → active ou termine
 */
