/**
 * Machine d'état XState pour la Déduction véhicule électrique
 *
 * Cette machine d'état représente le flux de travail pour demander la déduction
 * fiscale pour l'achat ou la location d'un véhicule électrique, incluant la
 * vérification du véhicule et le calcul de la déduction.
 */

import { createMachine, assign } from 'xstate';

interface Acquereur {
  id: string;
  nom: string;
  revenus: number;
  typeAcquisition: 'achat' | 'leasing';
}

interface VehiculeElectrique {
  id: string;
  marque: string;
  modele: string;
  typeVehicule: 'electrique' | 'hybride_rechargeable';
  autonomieElectrique: number;
  prixAchat: number;
  dateAcquisition: Date;
  immatriculationBelge: boolean;
}

interface DeductionVehicule {
  estEligible: boolean;
  montantDeduction: number;
  tauxDeduction: number;
  periodeAmortissement: number;
  motifRefus?: string;
}

interface DeductionVehiculeElectriqueContext {
  acquereur: Acquereur | null;
  vehicule: VehiculeElectrique | null;
  deduction: DeductionVehicule | null;
  documentsVehicule: string[];
  montantDeductAnnuel: number;
  anneesRestantes: number;
}

export const deductionVehiculeElectriqueMachine = createMachine({
  id: 'deductionVehiculeElectrique',
  initial: 'inactif',

  schemas: {
    context: {} as DeductionVehiculeElectriqueContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; acquereur: Acquereur; vehicule: VehiculeElectrique }
      | { type: 'VERIFIER_ELIGIBILITE' }
      | { type: 'ELIGIBILITE_VERIFIEE'; deduction: DeductionVehicule }
      | { type: 'ACCEPTER_DEDUCTION' }
      | { type: 'REFUSER_DEDUCTION' }
      | { type: 'SOUMETTRE_DOCUMENTS'; documents: string[] }
      | { type: 'DOCUMENTS_VALIDES' }
      | { type: 'DOCUMENTS_INVALIDES' }
      | { type: 'DEDUCTION_ACCORDEE' }
      | { type: 'ANNEE_ECOULEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    acquereur: null as Acquereur | null,
    vehicule: null as VehiculeElectrique | null,
    deduction: null as DeductionVehicule | null,
    documentsVehicule: [] as string[],
    montantDeductAnnuel: 0,
    anneesRestantes: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationEligibilite',
          actions: assign({
            acquereur: ({ event }) => event.acquereur,
            vehicule: ({ event }) => event.vehicule,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une demande de déduction pour véhicule électrique',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'eligible',
            guard: ({ event }) => event.deduction.estEligible,
            actions: assign({
              deduction: ({ event }) => event.deduction,
              anneesRestantes: ({ event }) => event.deduction.periodeAmortissement,
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
        description: 'Vérification de l\'éligibilité du véhicule (type, autonomie, prix)',
      },
    },

    eligible: {
      on: {
        ACCEPTER_DEDUCTION: {
          target: 'soumissionDocuments',
        },
        REFUSER_DEDUCTION: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Véhicule éligible à la déduction fiscale',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Véhicule non éligible à la déduction',
      },
    },

    refuse: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Déduction refusée par l\'acquéreur',
      },
    },

    soumissionDocuments: {
      on: {
        SOUMETTRE_DOCUMENTS: {
          target: 'validationDocuments',
          actions: assign({
            documentsVehicule: ({ event }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission de la facture d\'achat et du certificat d\'immatriculation',
      },
    },

    validationDocuments: {
      on: {
        DOCUMENTS_VALIDES: {
          target: 'deductionAccordee',
          actions: assign({
            montantDeductAnnuel: ({ context }) =>
              (context.deduction?.montantDeduction || 0) / (context.anneesRestantes || 1),
          }),
        },
        DOCUMENTS_INVALIDES: {
          target: 'soumissionDocuments',
        },
      },

      meta: {
        description: 'Validation des documents du véhicule',
      },
    },

    deductionAccordee: {
      on: {
        DEDUCTION_ACCORDEE: {
          target: 'actif',
        },
      },

      meta: {
        description: 'Déduction accordée - amortissement sur plusieurs années',
      },
    },

    actif: {
      on: {
        ANNEE_ECOULEE: [
          {
            target: 'actif',
            guard: ({ context }) => context.anneesRestantes > 1,
            actions: assign({
              anneesRestantes: ({ context }) => context.anneesRestantes - 1,
            }),
          },
          {
            target: 'termine',
          },
        ],
      },

      meta: {
        description: 'Déduction active - amortissement annuel en cours',
      },
    },

    termine: {
      type: 'final',

      meta: {
        description: 'Période d\'amortissement terminée',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la déduction véhicule électrique:
 *
 * inactif
 *   → verificationEligibilite
 *       ↓ (si éligible)
 *     eligible → soumissionDocuments → validationDocuments
 *       ↓                                     ↓
 *     nonEligible                      deductionAccordee
 *                                             ↓
 *                                          actif
 *                                             ↓
 *                                      (année écoulée)
 *                                             ↓
 *                                      actif ou termine ✓
 */
