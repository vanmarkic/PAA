/**
 * Machine d'état XState pour la Déduction frais de garde
 *
 * Cette machine d'état représente le flux de travail pour demander la déduction
 * des frais de garde d'enfants, incluant la vérification d'éligibilité, le calcul
 * de la déduction, et la validation annuelle.
 */

import { createMachine, assign } from 'xstate';

interface Parent {
  id: string;
  nom: string;
  revenus: number;
  situationFamiliale: string;
}

interface Enfant {
  id: string;
  nom: string;
  age: number;
  dateNaissance: Date;
}

interface FraisGarde {
  id: string;
  enfantId: string;
  typeGarde: 'creche' | 'garderie' | 'accueil_extrascolaire' | 'garde_domicile';
  organismeAgree: boolean;
  montantMensuel: number;
  periodeDebut: Date;
  periodeFin: Date;
}

interface DeductionFraisGarde {
  estEligible: boolean;
  montantDeductible: number;
  plafondAtteint: boolean;
  fraisNonDeductibles: number;
  motifRefus?: string;
}

interface DeductionFraisGardeContext {
  parent: Parent | null;
  enfants: Enfant[];
  fraisGarde: FraisGarde[];
  deduction: DeductionFraisGarde | null;
  attestations: string[];
  anneeFiscale: number;
}

export const deductionFraisGardeMachine = createMachine({
  id: 'deductionFraisGarde',
  initial: 'inactif',

  schemas: {
    context: {} as DeductionFraisGardeContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; parent: Parent; enfants: Enfant[] }
      | { type: 'AJOUTER_FRAIS'; frais: FraisGarde }
      | { type: 'CALCULER_DEDUCTION' }
      | { type: 'DEDUCTION_CALCULEE'; deduction: DeductionFraisGarde }
      | { type: 'SOUMETTRE_ATTESTATIONS'; documents: string[] }
      | { type: 'ATTESTATIONS_VALIDEES' }
      | { type: 'ATTESTATIONS_INVALIDES' }
      | { type: 'DEDUCTION_APPROUVEE' }
      | { type: 'NOUVELLE_ANNEE'; annee: number }
      | { type: 'REINITIALISER' }
  },

  context: {
    parent: null,
    enfants: [],
    fraisGarde: [],
    deduction: null,
    attestations: [],
    anneeFiscale: new Date().getFullYear(),
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'saisieInformations',
          actions: assign({
            parent: ({ event }) => event.parent,
            enfants: ({ event }) => event.enfants,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une demande de déduction pour frais de garde',
      },
    },

    saisieInformations: {
      on: {
        AJOUTER_FRAIS: {
          target: 'saisieInformations',
          actions: assign({
            fraisGarde: ({ context, event }) => [...context.fraisGarde, event.frais],
          }),
        },
        CALCULER_DEDUCTION: {
          target: 'calculDeduction',
        },
      },

      meta: {
        description: 'Saisie des informations sur les enfants et les frais de garde',
      },
    },

    calculDeduction: {
      on: {
        DEDUCTION_CALCULEE: [
          {
            target: 'eligible',
            guard: ({ event }) => event.deduction.estEligible,
            actions: assign({
              deduction: ({ event }) => event.deduction,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              deduction: ({ event }) => event.deduction,
            }),
          },
        ],
      },

      meta: {
        description: 'Calcul de la déduction selon les plafonds légaux et l\'âge des enfants',
      },
    },

    eligible: {
      on: {
        SOUMETTRE_ATTESTATIONS: {
          target: 'validationAttestations',
          actions: assign({
            attestations: ({ event }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Éligible à la déduction - soumission des attestations de garde',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Non éligible à la déduction pour frais de garde',
      },
    },

    validationAttestations: {
      on: {
        ATTESTATIONS_VALIDEES: {
          target: 'deductionApprouvee',
        },
        ATTESTATIONS_INVALIDES: {
          target: 'eligible',
        },
      },

      meta: {
        description: 'Validation des attestations des organismes de garde agréés',
      },
    },

    deductionApprouvee: {
      on: {
        DEDUCTION_APPROUVEE: {
          target: 'active',
        },
      },

      meta: {
        description: 'Déduction pour frais de garde approuvée',
      },
    },

    active: {
      on: {
        NOUVELLE_ANNEE: {
          target: 'inactif',
          actions: assign({
            anneeFiscale: ({ event }) => event.annee,
            fraisGarde: [],
          }),
        },
      },

      meta: {
        description: 'Déduction active pour l\'année fiscale - renouvellement annuel requis',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la déduction frais de garde:
 *
 * inactif
 *   → saisieInformations → calculDeduction
 *          ↑ (ajouter)           ↓
 *          └──────────      (si éligible)
 *                                ↓
 *                            eligible
 *                                ↓
 *                        validationAttestations
 *                                ↓
 *                        deductionApprouvee
 *                                ↓
 *                            active
 *                                ↓
 *                        (nouvelle année)
 *                                ↓
 *                            inactif
 */
