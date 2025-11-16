/**
 * Machine XState pour la GRAPA (Garantie de Revenus aux Personnes Âgées)
 *
 * Cette machine d'état représente le flux de traitement de la GRAPA,
 * incluant la vérification d'âge, enquête sur les ressources et versement.
 */

import { createMachine, assign } from 'xstate';

interface DemandeurGRAPA {
  nom: string;
  age: number;
  numeroRegistreNational: string;
  residenceBelgique: number; // années
  revenus: number;
  patrimoine: number;
  situationFamiliale: string;
  enfantsACharge: number;
}

interface EnqueteRessources {
  revenusPropres: number;
  revenusConjoint: number;
  patrimoine: number;
  autresAides: number;
  totalRessources: number;
}

interface MontantGRAPA {
  categorie: 'isolé' | 'ménage';
  montantMaximal: number;
  ressourcesComptabilisees: number;
  montantDû: number;
}

interface GRAPAContext {
  demandeur: DemandeurGRAPA | null;
  enqueteRessources: EnqueteRessources | null;
  montantGRAPA: MontantGRAPA | null;
  enqueteAnnuelle: boolean;
  dateProchainControle: Date | null;
}

export const grapaMachine = createMachine({
  id: 'grapa',
  initial: 'inactif',

  schema: {
    context: {} as GRAPAContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; demandeur: DemandeurGRAPA }
      | { type: 'AGE_VERIFIE'; eligible: boolean }
      | { type: 'ENQUETE_COMPLETE'; enquete: EnqueteRessources }
      | { type: 'MONTANT_CALCULE'; montant: MontantGRAPA }
      | { type: 'GRAPA_APPROUVEE' }
      | { type: 'ENQUETE_ANNUELLE' }
      | { type: 'CHANGEMENT_RESSOURCES'; nouvelles: EnqueteRessources }
      | { type: 'PENSION_OCTROYEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    demandeur: null,
    enqueteRessources: null,
    montantGRAPA: null,
    enqueteAnnuelle: false,
    dateProchainControle: null,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationAge',
          actions: assign({
            demandeur: (_, event) => event.demandeur,
          }),
        },
      },

      meta: {
        description: 'En attente de demande de GRAPA',
      },
    },

    verificationAge: {
      on: {
        AGE_VERIFIE: [
          {
            target: 'verificationResidence',
            cond: (_, event) => event.eligible,
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification de l\'âge minimum (65 ans)',
      },
    },

    verificationResidence: {
      on: {
        ENQUETE_COMPLETE: {
          target: 'enqueteRessources',
        },
      },

      meta: {
        description: 'Vérification de la résidence effective en Belgique',
      },
    },

    enqueteRessources: {
      on: {
        ENQUETE_COMPLETE: {
          target: 'calculMontant',
          actions: assign({
            enqueteRessources: (_, event) => event.enquete,
          }),
        },
      },

      meta: {
        description: 'Enquête sur les ressources: revenus, patrimoine, cohabitation',
      },
    },

    calculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'verificationDroits',
          actions: assign({
            montantGRAPA: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Calcul selon catégorie (isolé/ménage) et ressources',
      },
    },

    verificationDroits: {
      on: {
        GRAPA_APPROUVEE: {
          target: 'grapaActive',
        },
      },

      meta: {
        description: 'Vérification finale et approbation du dossier',
      },
    },

    grapaActive: {
      on: {
        ENQUETE_ANNUELLE: {
          target: 'enqueteAnnuelleRessources',
        },
        CHANGEMENT_RESSOURCES: {
          target: 'recalculMontant',
          actions: assign({
            enqueteRessources: (_, event) => event.nouvelles,
          }),
        },
        PENSION_OCTROYEE: {
          target: 'grapaSuspendue',
        },
      },

      meta: {
        description: 'GRAPA versée mensuellement - enquête annuelle obligatoire',
      },
    },

    enqueteAnnuelleRessources: {
      on: {
        ENQUETE_COMPLETE: {
          target: 'recalculMontant',
          actions: assign({
            enqueteRessources: (_, event) => event.enquete,
            enqueteAnnuelle: true,
          }),
        },
      },

      meta: {
        description: 'Enquête annuelle sur l\'évolution des ressources',
      },
    },

    recalculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'grapaActive',
          actions: assign({
            montantGRAPA: (_, event) => event.montant,
            enqueteAnnuelle: false,
          }),
        },
      },

      meta: {
        description: 'Recalcul suite à changement de ressources ou enquête annuelle',
      },
    },

    grapaSuspendue: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'GRAPA suspendue car pension de retraite octroyée',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - âge ou résidence insuffisants',
      },
    },
  },
});

/**
 * Visualisation du flux de la GRAPA:
 *
 * inactif
 *   → verificationAge (65 ans)
 *   → verificationResidence
 *   → enqueteRessources
 *   → calculMontant
 *   → verificationDroits
 *   → grapaActive
 *       ↓ (enquête annuelle)
 *     enqueteAnnuelleRessources
 *       ↓
 *     recalculMontant → grapaActive
 *       ↓ (pension octroyée)
 *     grapaSuspendue
 */
