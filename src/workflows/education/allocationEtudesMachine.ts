/**
 * Machine XState pour Allocation d'Études (Bourse)
 * Terminologie: Allocation d'études (non "bourse" officiellement en FWB)
 */

import { createMachine, assign } from 'xstate';

interface DemandeAllocation {
  etudiant: string;
  niveauEtudes: 'secondaire' | 'superieur';
  revenusFamiliaux: number; // Revenu cadastral total
  pointsAPE: number; // Points allocation études
  fratrie: number; // Enfants à charge
}

interface AllocationEtudesContext {
  demande: DemandeAllocation | null;
  dossierComplet: boolean;
  pointsCalcules: number;
  montantAllocation: number;
  exonerationMinerval: boolean;
  allocationAccordee: boolean;
}

export const allocationEtudesMachine = createMachine({
  id: 'allocationEtudes',
  initial: 'depotDemande',
  schemas: {
    context: {} as AllocationEtudesContext,
    events: {} as
      | { type: 'DEPOSER_DEMANDE'; demande: DemandeAllocation }
      | { type: 'COMPLETER_DOSSIER' }
      | { type: 'CALCULER_POINTS'; points: number }
      | { type: 'ALLOCATION_CALCULEE'; montant: number; exoneration: boolean }
      | { type: 'DECISION_FAVORABLE' }
      | { type: 'DECISION_DEFAVORABLE' }
  },
  context: {
    demande: null,
    dossierComplet: false,
    pointsCalcules: 0,
    montantAllocation: 0,
    exonerationMinerval: false,
    allocationAccordee: false,
  },
  states: {
    depotDemande: {
      on: {
        DEPOSER_DEMANDE: {
          target: 'completudeDossier',
          actions: assign({ demande: (_, event) => event.demande }),
        },
      },
      meta: {
        description: 'Demande via formulaire électronique',
        plateforme: 'monespace.fw-b.be (Fédération Wallonie-Bruxelles)',
        delai: 'Avant 31 octobre de l\'année académique',
      },
    },
    completudeDossier: {
      on: {
        COMPLETER_DOSSIER: {
          target: 'calculPoints',
          actions: assign({ dossierComplet: true }),
        },
      },
      meta: {
        description: 'Vérification complétude dossier',
        documents: [
          'Avertissement-extrait de rôle parents',
          'Composition de ménage',
          'Preuve inscription enseignement',
          'Relevé notes année précédente',
        ],
      },
    },
    calculPoints: {
      on: {
        CALCULER_POINTS: {
          target: 'evaluationEligibilite',
          actions: assign({ pointsCalcules: (_, event) => event.points }),
        },
      },
      meta: {
        description: 'Calcul points APE (Allocation Études)',
        criteres: {
          revenus: 'Revenus imposables parents (points négatifs)',
          charges: 'Enfants à charge, isolé, handicap (points positifs)',
          patrimoine: 'Revenu cadastral (points négatifs)',
        },
      },
    },
    evaluationEligibilite: {
      on: {
        ALLOCATION_CALCULEE: {
          target: 'decisionAllocation',
          actions: assign({
            montantAllocation: (_, event) => event.montant,
            exonerationMinerval: (_, event) => event.exoneration,
          }),
        },
      },
      meta: {
        description: 'Évaluation éligibilité selon barème points',
      },
    },
    decisionAllocation: {
      on: {
        DECISION_FAVORABLE: {
          target: 'allocationOctroyee',
          actions: assign({ allocationAccordee: true }),
        },
        DECISION_DEFAVORABLE: { target: 'refus' },
      },
      meta: {
        description: 'Décision service allocations FWB',
      },
    },
    allocationOctroyee: {
      type: 'final',
      meta: {
        description: 'Allocation octroyée',
        montants: {
          min: '1 607€ (2024-2025)',
          max: '5 686€',
          moyen: '2 000-3 000€',
        },
        paiement: 'Versement fin année scolaire',
        exoneration: 'Minerval gratuit si supérieur',
      },
    },
    refus: {
      type: 'final',
      meta: {
        description: 'Allocation refusée (points insuffisants)',
        recours: 'Commission recours (délai 30 jours)',
      },
    },
  },
});
