/**
 * XState machine for Inscription École (School Enrollment) Workflow
 *
 * This state machine represents the workflow for enrolling a child in school in Belgium,
 * including document verification, school assignment, and enrollment confirmation.
 */

import { createMachine, assign } from 'xstate';

interface Enfant {
  nom: string;
  prenom: string;
  dateNaissance: Date;
  adresse: string;
}

interface DocumentsInscription {
  carteIdentite: boolean;
  certificatNaissance: boolean;
  preuveResidence: boolean;
  carnetVaccination: boolean;
}

interface InscriptionEcoleContext {
  enfant: Enfant | null;
  documents: DocumentsInscription | null;
  ecoleChoisie: string | null;
  documentsValides: boolean;
  placeDisponible: boolean;
  erreurs: string[];
}

export const inscriptionEcoleMachine = createMachine({
  id: 'inscriptionEcole',
  initial: 'attente',

  schema: {
    context: {} as InscriptionEcoleContext,
    events: {} as
      | { type: 'COMMENCER_INSCRIPTION'; enfant: Enfant }
      | { type: 'CHOISIR_ECOLE'; ecole: string }
      | { type: 'SOUMETTRE_DOCUMENTS'; documents: DocumentsInscription }
      | { type: 'DOCUMENTS_VALIDES' }
      | { type: 'DOCUMENTS_INCOMPLETS'; erreurs: string[] }
      | { type: 'VERIFIER_DISPONIBILITE' }
      | { type: 'PLACE_DISPONIBLE' }
      | { type: 'PLACE_INDISPONIBLE' }
      | { type: 'CONFIRMER_INSCRIPTION' }
      | { type: 'ANNULER' }
      | { type: 'REINITIALISER' }
  },

  context: {
    enfant: null,
    documents: null,
    ecoleChoisie: null,
    documentsValides: false,
    placeDisponible: false,
    erreurs: [],
  },

  states: {
    attente: {
      on: {
        COMMENCER_INSCRIPTION: {
          target: 'selectionEcole',
          actions: assign({
            enfant: (_, event) => event.enfant,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande d\'inscription scolaire',
      },
    },

    selectionEcole: {
      on: {
        CHOISIR_ECOLE: {
          target: 'verificationDocuments',
          actions: assign({
            ecoleChoisie: (_, event) => event.ecole,
          }),
        },
        ANNULER: {
          target: 'annulee',
        },
      },

      meta: {
        description: 'Sélection de l\'école souhaitée par les parents',
      },
    },

    verificationDocuments: {
      on: {
        SOUMETTRE_DOCUMENTS: {
          target: 'validationDocuments',
          actions: assign({
            documents: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Collecte des documents requis pour l\'inscription',
      },
    },

    validationDocuments: {
      on: {
        DOCUMENTS_VALIDES: {
          target: 'verificationDisponibilite',
          actions: assign({
            documentsValides: true,
          }),
        },
        DOCUMENTS_INCOMPLETS: {
          target: 'verificationDocuments',
          actions: assign({
            documentsValides: false,
            erreurs: (_, event) => event.erreurs,
          }),
        },
      },

      meta: {
        description: 'Validation de l\'authenticité et complétude des documents',
      },
    },

    verificationDisponibilite: {
      on: {
        PLACE_DISPONIBLE: {
          target: 'inscriptionConfirmee',
          actions: assign({
            placeDisponible: true,
          }),
        },
        PLACE_INDISPONIBLE: {
          target: 'listeAttente',
          actions: assign({
            placeDisponible: false,
          }),
        },
      },

      meta: {
        description: 'Vérification de la disponibilité des places dans l\'école choisie',
      },
    },

    listeAttente: {
      on: {
        PLACE_DISPONIBLE: {
          target: 'inscriptionConfirmee',
        },
        CHOISIR_ECOLE: {
          target: 'verificationDisponibilite',
          actions: assign({
            ecoleChoisie: (_, event) => event.ecole,
          }),
        },
        ANNULER: {
          target: 'annulee',
        },
      },

      meta: {
        description: 'Inscription sur liste d\'attente - possibilité de choisir une autre école',
      },
    },

    inscriptionConfirmee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Inscription confirmée - envoi de la confirmation aux parents',
      },
    },

    annulee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Demande d\'inscription annulée',
      },
    },
  },
});

/**
 * Visualization of the school enrollment workflow:
 *
 * attente
 *   → selectionEcole
 *   → verificationDocuments
 *   → validationDocuments
 *       ↓ (si valides)
 *     verificationDisponibilite
 *       ↓ (si place disponible)
 *     inscriptionConfirmee ✓
 *       ↓ (si pas de place)
 *     listeAttente → [choisir autre école ou attendre]
 */
