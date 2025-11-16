/**
 * Machine d'état XState pour le Bonus logement
 *
 * Cette machine d'état représente le flux de travail pour demander le bonus logement,
 * incluant la vérification d'éligibilité du prêt hypothécaire, le calcul du bonus,
 * et le suivi annuel des remboursements.
 */

import { createMachine, assign } from 'xstate';

interface Emprunteur {
  id: string;
  nom: string;
  age: number;
  revenus: number;
  situationFamiliale: string;
}

interface PretHypothecaire {
  id: string;
  montantEmprunte: number;
  tauxInteret: number;
  dureeAnnees: number;
  dateContrat: Date;
  montantRemboursementAnnuel: number;
}

interface BonusLogement {
  estEligible: boolean;
  montantBonusAnnuel: number;
  dureeBonus: number;
  totalBonus: number;
  motifRefus?: string;
}

interface BonusLogementContext {
  emprunteur: Emprunteur | null;
  pret: PretHypothecaire | null;
  bonus: BonusLogement | null;
  documentsHypothecaires: string[];
  montantTotalRecu: number;
  anneesRestantes: number;
}

export const bonusLogementMachine = createMachine({
  id: 'bonusLogement',
  initial: 'inactif',

  schemas: {
    context: {} as BonusLogementContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; emprunteur: Emprunteur; pret: PretHypothecaire }
      | { type: 'ELIGIBILITE_VERIFIEE'; bonus: BonusLogement }
      | { type: 'ACCEPTER_BONUS' }
      | { type: 'REFUSER_BONUS' }
      | { type: 'DOCUMENTS_SOUMIS'; documents: string[] }
      | { type: 'DOCUMENTS_VALIDES' }
      | { type: 'DOCUMENTS_INVALIDES' }
      | { type: 'BONUS_ACCORDE' }
      | { type: 'ANNEE_ECOULEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    emprunteur: null,
    pret: null,
    bonus: null,
    documentsHypothecaires: [],
    montantTotalRecu: 0,
    anneesRestantes: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationEligibilite',
          actions: assign({
            emprunteur: ({ event }) => event.emprunteur,
            pret: ({ event }) => event.pret,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une demande de bonus logement',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'eligible',
            guard: ({ event }) => event.bonus.estEligible,
            actions: assign({
              bonus: ({ event }) => event.bonus,
              anneesRestantes: ({ event }) => event.bonus.dureeBonus,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              bonus: ({ event }) => event.bonus,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification de l\'éligibilité au bonus logement (première acquisition, prêt valide)',
      },
    },

    eligible: {
      on: {
        ACCEPTER_BONUS: {
          target: 'soumissionDocuments',
        },
        REFUSER_BONUS: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Emprunteur éligible au bonus logement',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Emprunteur non éligible au bonus logement',
      },
    },

    refuse: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Bonus logement refusé par l\'emprunteur',
      },
    },

    soumissionDocuments: {
      on: {
        DOCUMENTS_SOUMIS: {
          target: 'validationDocuments',
          actions: assign({
            documentsHypothecaires: ({ event }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission du contrat de prêt et des justificatifs d\'acquisition',
      },
    },

    validationDocuments: {
      on: {
        DOCUMENTS_VALIDES: {
          target: 'bonusAccorde',
        },
        DOCUMENTS_INVALIDES: {
          target: 'soumissionDocuments',
        },
      },

      meta: {
        description: 'Validation des documents hypothécaires',
      },
    },

    bonusAccorde: {
      on: {
        BONUS_ACCORDE: {
          target: 'actif',
        },
      },

      meta: {
        description: 'Bonus logement accordé - paiement annuel activé',
      },
    },

    actif: {
      on: {
        ANNEE_ECOULEE: [
          {
            target: 'actif',
            guard: (context) => context.anneesRestantes > 1,
            actions: assign({ anneesRestantes: ({ context }) => context.anneesRestantes - 1,
              montantTotalRecu: (context) =>
                context.montantTotalRecu + (context.bonus?.montantBonusAnnuel || 0),
            }),
          },
          {
            target: 'termine',
            actions: assign({ montantTotalRecu: ({ context }) =>
                context.montantTotalRecu + (context.bonus?.montantBonusAnnuel || 0),
            }),
          },
        ],
      },

      meta: {
        description: 'Bonus logement actif - paiement annuel en cours',
      },
    },

    termine: {
      type: 'final',

      meta: {
        description: 'Période de bonus logement terminée',
      },
    },
  },
});

/**
 * Visualisation du flux de travail du bonus logement:
 *
 * inactif
 *   → verificationEligibilite
 *       ↓ (si éligible)
 *     eligible → soumissionDocuments → validationDocuments
 *       ↓                                     ↓
 *     nonEligible                        bonusAccorde
 *                                             ↓
 *                                          actif
 *                                             ↓
 *                                      (année écoulée)
 *                                             ↓
 *                                      actif ou termine ✓
 */
