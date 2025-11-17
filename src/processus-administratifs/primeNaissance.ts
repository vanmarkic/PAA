/**
 * Machine XState pour la Prime de Naissance
 *
 * Cette machine d'état représente le flux de traitement de la prime de naissance,
 * incluant la déclaration, vérification et paiement.
 */

import { createMachine, assign } from 'xstate';

interface Naissance {
  dateNaissance: Date;
  nomEnfant: string;
  numeroRegistreNational: string;
  rangEnfant: number;
  naissanceMultiple: boolean;
}

interface Parent {
  nom: string;
  numeroRegistreNational: string;
  numeroCompte: string;
  region: 'Flandre' | 'Wallonie' | 'Bruxelles';
  revenus: number;
}

interface MontantPrime {
  montantBase: number;
  supplementMultiple: number;
  montantTotal: number;
}

interface PrimeNaissanceContext {
  naissance: Naissance | null;
  parent: Parent | null;
  montantPrime: MontantPrime | null;
  documentsFournis: boolean;
  verificationEffectuee: boolean;
}

export const primeNaissanceMachine = createMachine({
  id: 'primeNaissance',
  initial: 'inactif',

  schemas: {
    context: {} as PrimeNaissanceContext,
    events: {} as
      | { type: 'DECLARER_NAISSANCE'; naissance: Naissance; parent: Parent }
      | { type: 'DOCUMENTS_FOURNIS' }
      | { type: 'VERIFICATION_COMPLETE' }
      | { type: 'MONTANT_CALCULE'; montant: MontantPrime }
      | { type: 'PAIEMENT_EFFECTUE' }
      | { type: 'DOCUMENTS_MANQUANTS' }
      | { type: 'IRREGULARITE_DETECTEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    naissance: null,
    parent: null,
    montantPrime: null,
    documentsFournis: false,
    verificationEffectuee: false,
  },

  states: {
    inactif: {
      on: {
        DECLARER_NAISSANCE: {
          target: 'declarationRecue',
          actions: assign({
            naissance: ({ event }) => event.naissance,
            parent: ({ event }) => event.parent,
          }),
        },
      },

      meta: {
        description: 'En attente de la déclaration de naissance',
      },
    },

    declarationRecue: {
      on: {
        DOCUMENTS_FOURNIS: {
          target: 'verificationDocuments',
          actions: assign({
            documentsFournis: true,
          }),
        },
      },

      meta: {
        description: 'Déclaration de naissance reçue - en attente des documents justificatifs',
      },
    },

    verificationDocuments: {
      on: {
        VERIFICATION_COMPLETE: {
          target: 'calculMontant',
          actions: assign({
            verificationEffectuee: true,
          }),
        },
        DOCUMENTS_MANQUANTS: {
          target: 'attentDocumentsSupplementaires',
        },
        IRREGULARITE_DETECTEE: {
          target: 'demandeRejetee',
        },
      },

      meta: {
        description: 'Vérification de l\'acte de naissance et identité des parents',
      },
    },

    attentDocumentsSupplementaires: {
      on: {
        DOCUMENTS_FOURNIS: {
          target: 'verificationDocuments',
        },
      },

      meta: {
        description: 'En attente de documents supplémentaires manquants',
      },
    },

    calculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'paiementEnCours',
          actions: assign({
            montantPrime: ({ event }) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Calcul du montant selon la région et le rang de l\'enfant',
      },
    },

    paiementEnCours: {
      on: {
        PAIEMENT_EFFECTUE: {
          target: 'paiementEffectue',
        },
      },

      meta: {
        description: 'Paiement de la prime en cours de traitement',
      },
    },

    paiementEffectue: {
      type: 'final',

      meta: {
        description: 'Prime de naissance versée avec succès',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée suite à irrégularité détectée',
      },
    },
  },
});

/**
 * Visualisation du flux de la prime de naissance:
 *
 * inactif
 *   → declarationRecue
 *   → verificationDocuments
 *       ↓ (documents OK)
 *     calculMontant
 *       ↓
 *     paiementEnCours
 *       ↓
 *     paiementEffectue ✓
 *       ↓ (documents manquants)
 *     attentDocumentsSupplementaires → verificationDocuments
 *       ↓ (irrégularité)
 *     demandeRejetee ✗
 */
