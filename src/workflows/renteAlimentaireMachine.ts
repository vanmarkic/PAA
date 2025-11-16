/**
 * Machine d'état XState pour la Rente alimentaire
 *
 * Cette machine d'état représente le flux de travail pour la gestion fiscale des
 * rentes alimentaires, incluant la déduction pour le payeur et l'imposition pour
 * le bénéficiaire.
 */

import { createMachine, assign } from 'xstate';

interface Payeur {
  id: string;
  nom: string;
  revenus: number;
  montantVerse: number;
}

interface Beneficiaire {
  id: string;
  nom: string;
  lienFamilial: 'ex_conjoint' | 'enfant' | 'parent' | 'autre';
  montantRecu: number;
}

interface RenteAlimentaire {
  id: string;
  payeurId: string;
  beneficiaireId: string;
  montantMensuel: number;
  montantAnnuel: number;
  dateDebut: Date;
  jugementId: string;
}

interface FiscaliteRente {
  deductionPayeur: number;
  impositionBeneficiaire: number;
  documentsValides: boolean;
}

interface RenteAlimentaireContext {
  payeur: Payeur | null;
  beneficiaire: Beneficiaire | null;
  rente: RenteAlimentaire | null;
  fiscalite: FiscaliteRente | null;
  jugement: string | null;
  attestationsVersement: string[];
}

export const renteAlimentaireMachine = createMachine({
  id: 'renteAlimentaire',
  initial: 'inactif',

  schema: {
    context: {} as RenteAlimentaireContext,
    events: {} as
      | { type: 'DEMARRER_DECLARATION'; payeur: Payeur; beneficiaire: Beneficiaire; rente: RenteAlimentaire }
      | { type: 'SOUMETTRE_JUGEMENT'; jugementId: string }
      | { type: 'JUGEMENT_VALIDE' }
      | { type: 'JUGEMENT_INVALIDE'; raison: string }
      | { type: 'CALCULER_FISCALITE' }
      | { type: 'FISCALITE_CALCULEE'; fiscalite: FiscaliteRente }
      | { type: 'SOUMETTRE_ATTESTATIONS'; documents: string[] }
      | { type: 'ATTESTATIONS_VALIDEES' }
      | { type: 'ATTESTATIONS_INVALIDES' }
      | { type: 'DECLARATION_APPROUVEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    payeur: null,
    beneficiaire: null,
    rente: null,
    fiscalite: null,
    jugement: null,
    attestationsVersement: [],
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DECLARATION: {
          target: 'verificationJugement',
          actions: assign({
            payeur: (_, event) => event.payeur,
            beneficiaire: (_, event) => event.beneficiaire,
            rente: (_, event) => event.rente,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une déclaration de rente alimentaire',
      },
    },

    verificationJugement: {
      on: {
        JUGEMENT_VALIDE: {
          target: 'jugementValide',
        },
        JUGEMENT_INVALIDE: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Vérification de l\'existence et de la validité du jugement',
      },
    },

    jugementValide: {
      on: {
        CALCULER_FISCALITE: {
          target: 'calculFiscalite',
        },
      },

      meta: {
        description: 'Jugement validé - préparation du calcul fiscal',
      },
    },

    calculFiscalite: {
      on: {
        FISCALITE_CALCULEE: {
          target: 'fiscaliteCalculee',
          actions: assign({
            fiscalite: (_, event) => event.fiscalite,
          }),
        },
      },

      meta: {
        description: 'Calcul de la déduction pour le payeur et l\'imposition pour le bénéficiaire',
      },
    },

    fiscaliteCalculee: {
      on: {
        SOUMETTRE_ATTESTATIONS: {
          target: 'validationAttestations',
          actions: assign({
            attestationsVersement: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Fiscalité calculée - soumission des preuves de versement',
      },
    },

    validationAttestations: {
      on: {
        ATTESTATIONS_VALIDEES: {
          target: 'declarationValidee',
        },
        ATTESTATIONS_INVALIDES: {
          target: 'fiscaliteCalculee',
        },
      },

      meta: {
        description: 'Validation des attestations de versement de la rente',
      },
    },

    declarationValidee: {
      on: {
        DECLARATION_APPROUVEE: {
          target: 'approuve',
        },
      },

      meta: {
        description: 'Déclaration de rente alimentaire validée',
      },
    },

    approuve: {
      type: 'final',

      meta: {
        description: 'Rente alimentaire approuvée - déduction et imposition appliquées',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la rente alimentaire:
 *
 * inactif
 *   → verificationJugement → jugementValide
 *                                ↓
 *                          calculFiscalite
 *                                ↓
 *                          fiscaliteCalculee
 *                                ↓
 *                        validationAttestations
 *                                ↓
 *                        declarationValidee
 *                                ↓
 *                            approuve ✓
 */
