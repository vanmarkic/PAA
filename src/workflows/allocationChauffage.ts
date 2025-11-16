/**
 * Machine XState pour l'Allocation de Chauffage
 *
 * Cette machine d'état représente le flux de traitement de l'allocation de chauffage,
 * une aide financière pour les frais de chauffage des ménages à faibles revenus.
 */

import { createMachine, assign } from 'xstate';

interface Menage {
  adresse: string;
  nombrePersonnes: number;
  revenus: number;
  typeChauffage: 'mazout' | 'gaz' | 'électricité' | 'propane' | 'charbon';
  proprietaireOuLocataire: string;
}

interface DemandeurAllocation {
  nom: string;
  numeroRegistreNational: string;
  numeroClient: string;
  factureChauffage: number;
  periodeChauffe: string;
}

interface MontantAllocation {
  montantBase: number;
  supplementFamilial: number;
  montantTotal: number;
  plafondRevenuRespect: boolean;
}

interface AllocationChauffageContext {
  menage: Menage | null;
  demandeur: DemandeurAllocation | null;
  montantAllocation: MontantAllocation | null;
  factureVerifiee: boolean;
  periodeDemandeValide: boolean;
}

export const allocationChauffageMachine = createMachine({
  id: 'allocationChauffage',
  initial: 'inactif',

  schema: {
    context: {} as AllocationChauffageContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; demandeur: DemandeurAllocation; menage: Menage }
      | { type: 'PERIODE_VERIFIEE'; valide: boolean }
      | { type: 'REVENUS_VERIFIES'; eligible: boolean }
      | { type: 'FACTURE_VERIFIEE'; conforme: boolean }
      | { type: 'MONTANT_CALCULE'; montant: MontantAllocation }
      | { type: 'ALLOCATION_APPROUVEE' }
      | { type: 'PAIEMENT_EFFECTUE' }
      | { type: 'NOUVELLE_SAISON' }
      | { type: 'REINITIALISER' }
  },

  context: {
    menage: null,
    demandeur: null,
    montantAllocation: null,
    factureVerifiee: false,
    periodeDemandeValide: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationPeriode',
          actions: assign({
            demandeur: (_, event) => event.demandeur,
            menage: (_, event) => event.menage,
          }),
        },
      },

      meta: {
        description: 'En attente de demande d\'allocation de chauffage',
      },
    },

    verificationPeriode: {
      on: {
        PERIODE_VERIFIEE: [
          {
            target: 'verificationRevenus',
            cond: (_, event) => event.valide,
            actions: assign({
              periodeDemandeValide: true,
            }),
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification que la demande est dans la période autorisée (1er sept - 30 avril)',
      },
    },

    verificationRevenus: {
      on: {
        REVENUS_VERIFIES: [
          {
            target: 'verificationFacture',
            cond: (_, event) => event.eligible,
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification que les revenus sont sous les plafonds régionaux',
      },
    },

    verificationFacture: {
      on: {
        FACTURE_VERIFIEE: [
          {
            target: 'calculMontant',
            cond: (_, event) => event.conforme,
            actions: assign({
              factureVerifiee: true,
            }),
          },
          {
            target: 'complementDocuments',
          },
        ],
      },

      meta: {
        description: 'Vérification de la facture de chauffage ou attestation de livraison',
      },
    },

    complementDocuments: {
      on: {
        FACTURE_VERIFIEE: {
          target: 'calculMontant',
          cond: (_, event) => event.conforme,
          actions: assign({
            factureVerifiee: true,
          }),
        },
      },

      meta: {
        description: 'Demande de documents complémentaires',
      },
    },

    calculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'allocationApprouvee',
          actions: assign({
            montantAllocation: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Calcul selon type de chauffage, revenus et composition du ménage',
      },
    },

    allocationApprouvee: {
      on: {
        ALLOCATION_APPROUVEE: {
          target: 'paiementEnCours',
        },
      },

      meta: {
        description: 'Allocation approuvée par le SPF Économie',
      },
    },

    paiementEnCours: {
      on: {
        PAIEMENT_EFFECTUE: {
          target: 'allocationVersee',
        },
      },

      meta: {
        description: 'Paiement en cours de traitement',
      },
    },

    allocationVersee: {
      on: {
        NOUVELLE_SAISON: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Allocation de chauffage versée pour la saison',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - période, revenus ou documents non conformes',
      },
    },
  },
});

/**
 * Visualisation du flux de l'allocation de chauffage:
 *
 * inactif
 *   → verificationPeriode (1er sept - 30 avril)
 *   → verificationRevenus
 *   → verificationFacture
 *       ↓ (facture OK)
 *     calculMontant
 *       ↓
 *     allocationApprouvee
 *       ↓
 *     paiementEnCours
 *       ↓
 *     allocationVersee ✓
 *       ↓ (documents manquants)
 *     complementDocuments → calculMontant
 */
