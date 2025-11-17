/**
 * XState machine for Charges Payment Workflow
 *
 * This state machine manages the payment lifecycle of copropriété charges
 * from invoicing to collection or legal action
 */

import { createMachine, assign } from 'xstate';
import {
  Coproprietaire,
  AppelFonds,
  DetailAppelFonds,
  Rappel,
  PaiementStatus
} from '../../domain/coproprieteTypes';

interface ChargesPaymentContext {
  coproprietaire: Coproprietaire | null;
  appelFonds: AppelFonds | null;
  montantDu: number;
  montantPaye: number;
  joursRetard: number;
  rappelsEnvoyes: Rappel[];
  fraisSupplementaires: number;
  interets: number;
  status: PaiementStatus;
  actionJudiciaire: boolean;
  errors: string[];
  retryCount: number;
}

export const chargesPaymentMachine = createMachine({
  id: 'chargesPayment',
  initial: 'idle',

  schemas: {
    context: {} as ChargesPaymentContext,
    events: {} as
      | { type: 'EMETTRE_APPEL'; coproprietaire: Coproprietaire; appelFonds: AppelFonds; montant: number }
      | { type: 'PAIEMENT_RECU'; montant: number; date: Date }
      | { type: 'PAIEMENT_PARTIEL'; montant: number; date: Date }
      | { type: 'ECHEANCE_DEPASSEE' }
      | { type: 'ENVOYER_RAPPEL' }
      | { type: 'RAPPEL_ENVOYE'; rappel: Rappel }
      | { type: 'CALCULER_PENALITES' }
      | { type: 'MISE_DEMEURE' }
      | { type: 'LANCER_PROCEDURE_JUDICIAIRE' }
      | { type: 'SAISIE_CONSERVATOIRE' }
      | { type: 'ACCORD_ECHELONNEMENT'; duree: number; conditions: string }
      | { type: 'ANNULER_CREANCE'; motif: string }
      | { type: 'RESET' }
  },

  context: {
    coproprietaire: null,
    appelFonds: null,
    montantDu: 0,
    montantPaye: 0,
    joursRetard: 0,
    rappelsEnvoyes: [],
    fraisSupplementaires: 0,
    interets: 0,
    status: 'a_jour',
    actionJudiciaire: false,
    errors: [],
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        EMETTRE_APPEL: {
          target: 'appel_emis',
          actions: assign({
            coproprietaire: ({ event }: { event: any }) => event.coproprietaire,
            appelFonds: ({ event }: { event: any }) => event.appelFonds,
            montantDu: ({ event }: { event: any }) => event.montant,
            status: 'a_jour',
          }),
        },
      },
      meta: {
        description: 'En attente d\'émission d\'appel de fonds',
      },
    },

    appel_emis: {
      on: {
        PAIEMENT_RECU: {
          target: 'paye',
          actions: assign({
            montantPaye: ({ event }: { event: any }) => event.montant,
            status: 'a_jour',
          }),
        },
        PAIEMENT_PARTIEL: {
          target: 'paiement_partiel',
          actions: assign({
            montantPaye: ({ context, event }: { context: any; event: any }) =>
              context.montantPaye + event.montant,
            montantDu: ({ context, event }: { context: any; event: any }) =>
              context.montantDu - event.montant,
          }),
        },
        ECHEANCE_DEPASSEE: {
          target: 'retard_paiement',
        },
      },
      meta: {
        description: 'Appel de fonds émis, en attente de paiement',
      },
    },

    retard_paiement: {
      entry: assign({
        status: 'retard_leger',
      }),
      on: {
        ENVOYER_RAPPEL: {
          target: 'rappel_en_cours',
        },
        PAIEMENT_RECU: {
          target: 'paye_avec_retard',
          actions: assign({
            montantPaye: ({ event }: { event: any }) => event.montant,
          }),
        },
        CALCULER_PENALITES: {
          actions: assign({
            joursRetard: ({ context }) => {
              const aujourdhui = new Date();
              const echeance = context.appelFonds?.dateEcheance || new Date();
              return Math.floor((aujourdhui.getTime() - echeance.getTime()) / (1000 * 60 * 60 * 24));
            },
          }),
        },
      },
      meta: {
        description: 'Paiement en retard, premier niveau d\'action',
      },
    },

    rappel_en_cours: {
      on: {
        RAPPEL_ENVOYE: [
          {
            target: 'retard_avec_rappels',
            guard: ({ context }) => context.rappelsEnvoyes.length < 2,
            actions: assign({
              rappelsEnvoyes: ({ context, event }: { context: any; event: any }) =>
                [...context.rappelsEnvoyes, event.rappel],
              fraisSupplementaires: ({ context, event }: { context: any; event: any }) =>
                context.fraisSupplementaires + event.rappel.fraisRappel,
            }),
          },
          {
            target: 'mise_en_demeure',
            actions: assign({
              status: 'retard_important',
            }),
          },
        ],
        PAIEMENT_RECU: {
          target: 'paye_avec_penalites',
        },
      },
      meta: {
        description: 'Envoi de rappel en cours',
      },
    },

    retard_avec_rappels: {
      on: {
        ENVOYER_RAPPEL: {
          target: 'rappel_en_cours',
        },
        PAIEMENT_RECU: {
          target: 'paye_avec_penalites',
        },
        ACCORD_ECHELONNEMENT: {
          target: 'echelonnement',
        },
      },
      after: {
        30000: { // 30 jours simulés
          target: 'mise_en_demeure',
        },
      },
      meta: {
        description: 'Plusieurs rappels envoyés, situation préoccupante',
      },
    },

    mise_en_demeure: {
      entry: assign({
        status: 'impayes_graves',
        fraisSupplementaires: ({ context }) => context.fraisSupplementaires + 30,
      }),
      on: {
        PAIEMENT_RECU: {
          target: 'paye_avec_penalites',
        },
        ACCORD_ECHELONNEMENT: {
          target: 'echelonnement',
        },
        LANCER_PROCEDURE_JUDICIAIRE: {
          target: 'procedure_judiciaire',
        },
      },
      after: {
        30000: { // 30 jours après mise en demeure
          target: 'procedure_judiciaire',
        },
      },
      meta: {
        description: 'Mise en demeure envoyée, dernière chance avant action judiciaire',
      },
    },

    procedure_judiciaire: {
      entry: assign({
        status: 'procedure_recouvrement',
        actionJudiciaire: true,
      }),
      on: {
        SAISIE_CONSERVATOIRE: {
          target: 'saisie',
        },
        PAIEMENT_RECU: {
          target: 'paye_apres_procedure',
        },
        ACCORD_ECHELONNEMENT: {
          target: 'echelonnement',
        },
      },
      meta: {
        description: 'Procédure judiciaire en cours',
      },
    },

    saisie: {
      entry: assign({
        status: 'saisie',
      }),
      on: {
        PAIEMENT_RECU: {
          target: 'paye_apres_saisie',
        },
        ANNULER_CREANCE: {
          target: 'creance_annulee',
        },
      },
      meta: {
        description: 'Saisie conservatoire ou exécution sur les biens',
      },
    },

    echelonnement: {
      on: {
        PAIEMENT_PARTIEL: {
          actions: assign({
            montantPaye: ({ context, event }: { context: any; event: any }) =>
              context.montantPaye + event.montant,
            montantDu: ({ context, event }: { context: any; event: any }) =>
              context.montantDu - event.montant,
          }),
        },
        PAIEMENT_RECU: {
          target: 'paye',
        },
        ECHEANCE_DEPASSEE: {
          target: 'echelonnement_rompu',
        },
      },
      meta: {
        description: 'Plan d\'échelonnement en cours',
      },
    },

    echelonnement_rompu: {
      on: {
        LANCER_PROCEDURE_JUDICIAIRE: {
          target: 'procedure_judiciaire',
        },
      },
      meta: {
        description: 'Échelonnement non respecté, retour à la procédure',
      },
    },

    paiement_partiel: {
      on: {
        PAIEMENT_RECU: {
          target: 'paye',
          guard: ({ context, event }: { context: any; event: any }) =>
            event.montant >= context.montantDu,
        },
        ECHEANCE_DEPASSEE: {
          target: 'retard_paiement',
        },
      },
      meta: {
        description: 'Paiement partiel reçu, solde en attente',
      },
    },

    paye: {
      entry: assign({
        status: 'a_jour',
        montantDu: 0,
      }),
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Charges payées intégralement',
      },
    },

    paye_avec_retard: {
      entry: assign({
        status: 'a_jour',
      }),
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Payé avec retard mais sans pénalités',
      },
    },

    paye_avec_penalites: {
      entry: assign({
        status: 'a_jour',
      }),
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Payé avec frais et intérêts de retard',
      },
    },

    paye_apres_procedure: {
      entry: assign({
        status: 'a_jour',
        actionJudiciaire: false,
      }),
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Payé suite à procédure judiciaire',
      },
    },

    paye_apres_saisie: {
      entry: assign({
        status: 'a_jour',
      }),
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Recouvré par saisie',
      },
    },

    creance_annulee: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Créance annulée (prescription, accord, etc.)',
      },
    },
  },
});

/**
 * Workflow visualization:
 *
 * idle → appel_emis → paye (si paiement immédiat)
 *            ↓
 *    retard_paiement → rappel_en_cours → retard_avec_rappels
 *            ↓                                    ↓
 *    mise_en_demeure → procedure_judiciaire → saisie
 *            ↓              ↓                     ↓
 *    echelonnement    paye_apres_X         paye_apres_saisie
 */