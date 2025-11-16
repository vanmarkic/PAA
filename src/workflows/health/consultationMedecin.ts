/**
 * Machine XState pour Consultation Médecin
 *
 * Cette machine d'état représente le flux de consultation médicale,
 * incluant la prise de rendez-vous, le remboursement et le suivi.
 */

import { createMachine, assign } from 'xstate';

interface Patient {
  nom: string;
  numeroINAMI: string;
  mutuelleSouscrite: boolean;
  typeAssurance: 'ordinaire' | 'preferentiel' | 'aucune';
  age: number;
}

interface Consultation {
  typeMedecin: 'generaliste' | 'specialiste';
  coutConsultation: number;
  dateConsultation: Date;
  prescriptionOrdonnance: boolean;
}

interface ResultatRemboursement {
  montantRembourse: number;
  montantTicketModerateur: number;
  pourcentageRemboursement: number;
}

interface ConsultationMedecinContext {
  patient: Patient | null;
  consultation: Consultation | null;
  resultatRemboursement: ResultatRemboursement | null;
  rendezVousPris: boolean;
  tiersPayantApplique: boolean;
}

export const consultationMedecinMachine = createMachine({
  id: 'consultationMedecin',
  initial: 'inactif',

  schema: {
    context: {} as ConsultationMedecinContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; patient: Patient }
      | { type: 'PRENDRE_RDV'; consultation: Consultation }
      | { type: 'RDV_CONFIRME' }
      | { type: 'CONSULTATION_EFFECTUEE' }
      | { type: 'REMBOURSEMENT_CALCULE'; resultat: ResultatRemboursement }
      | { type: 'TIERS_PAYANT_ACTIVE' }
      | { type: 'PAIEMENT_DIRECT' }
      | { type: 'REINITIALISER' }
  },

  context: {
    patient: null,
    consultation: null,
    resultatRemboursement: null,
    rendezVousPris: false,
    tiersPayantApplique: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationCouverture',
          actions: assign({
            patient: (_, event) => event.patient,
          }),
        },
      },

      meta: {
        description: 'En attente de démarrage de la consultation',
      },
    },

    verificationCouverture: {
      on: {
        PRENDRE_RDV: {
          target: 'priseRendezVous',
          actions: assign({
            consultation: (_, event) => event.consultation,
          }),
        },
      },

      meta: {
        description: 'Vérification de la couverture mutuelle et droits au remboursement',
      },
    },

    priseRendezVous: {
      on: {
        RDV_CONFIRME: {
          target: 'rendezVousConfirme',
          actions: assign({
            rendezVousPris: true,
          }),
        },
      },

      meta: {
        description: 'Prise de rendez-vous avec le médecin',
      },
    },

    rendezVousConfirme: {
      on: {
        CONSULTATION_EFFECTUEE: {
          target: 'calculRemboursement',
        },
      },

      meta: {
        description: 'Rendez-vous confirmé - en attente de la consultation',
      },
    },

    calculRemboursement: {
      on: {
        REMBOURSEMENT_CALCULE: [
          {
            target: 'tiersPayant',
            cond: (context) => context.patient?.mutuelleSouscrite === true,
            actions: assign({
              resultatRemboursement: (_, event) => event.resultat,
            }),
          },
          {
            target: 'paiementDirect',
            actions: assign({
              resultatRemboursement: (_, event) => event.resultat,
            }),
          },
        ],
      },

      meta: {
        description: 'Calcul du montant remboursé par la mutuelle (75% généraliste, 60% spécialiste)',
      },
    },

    tiersPayant: {
      on: {
        TIERS_PAYANT_ACTIVE: {
          target: 'termine',
          actions: assign({
            tiersPayantApplique: true,
          }),
        },
        PAIEMENT_DIRECT: {
          target: 'paiementDirect',
        },
      },

      meta: {
        description: 'Tiers payant appliqué - patient ne paie que le ticket modérateur',
      },
    },

    paiementDirect: {
      on: {
        REINITIALISER: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Paiement direct - patient paie le tout et se fait rembourser',
      },
    },

    termine: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Consultation terminée et remboursement traité',
      },
    },
  },
});
