/**
 * Machine XState pour l'Aide Sociale
 *
 * Cette machine d'état représente le flux de traitement de l'aide sociale du CPAS,
 * incluant l'analyse de la situation, détermination du type d'aide et suivi.
 */

import { createMachine, assign } from 'xstate';

interface DemandeurAideSociale {
  nom: string;
  age: number;
  numeroRegistreNational: string;
  residenceLegale: boolean;
  situationFamiliale: string;
  revenus: number;
  logement: string;
  enfantsACharge: number;
}

interface EnqueteSociale {
  situationFinanciere: any;
  situationLogement: any;
  situationFamiliale: any;
  urgenceSociale: boolean;
  besoinsPrioritaires: string[];
}

interface PlanAide {
  typeAide: 'financière' | 'matérielle' | 'administrative' | 'mixte';
  montantMensuel?: number;
  aidesSpecifiques: string[];
  accompagnement: boolean;
  dureeProvisoire: number;
}

interface AideSocialeContext {
  demandeur: DemandeurAideSociale | null;
  enqueteSociale: EnqueteSociale | null;
  planAide: PlanAide | null;
  assistantSocial: string | null;
  suiviEnCours: boolean;
}

export const aideSocialeMachine = createMachine({
  id: 'aideSociale',
  initial: 'inactif',

  schemas: {
    context: {} as AideSocialeContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; demandeur: DemandeurAideSociale }
      | { type: 'URGENCE_DETECTEE' }
      | { type: 'ENQUETE_COMPLETE'; enquete: EnqueteSociale }
      | { type: 'PLAN_ETABLI'; plan: PlanAide }
      | { type: 'AIDE_APPROUVEE' }
      | { type: 'AIDE_REFUSEE'; raison: string }
      | { type: 'SITUATION_AMELIOREE' }
      | { type: 'SITUATION_DEGRADEE' }
      | { type: 'REEVALUATION_TRIMESTRIELLE' }
      | { type: 'AUTONOMIE_ATTEINTE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    demandeur: null,
    enqueteSociale: null,
    planAide: null,
    assistantSocial: null,
    suiviEnCours: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'accueilDemande',
          actions: assign({
            demandeur: ({ event }) => event.demandeur,
          }),
        },
      },

      meta: {
        description: 'En attente de demande d\'aide sociale au CPAS',
      },
    },

    accueilDemande: {
      on: {
        URGENCE_DETECTEE: {
          target: 'aideUrgence',
        },
        ENQUETE_COMPLETE: {
          target: 'enqueteSociale',
        },
      },

      meta: {
        description: 'Accueil et premier entretien avec assistant social',
      },
    },

    aideUrgence: {
      on: {
        ENQUETE_COMPLETE: {
          target: 'enqueteSociale',
        },
      },

      meta: {
        description: 'Aide d\'urgence immédiate (nourriture, hébergement temporaire)',
      },
    },

    enqueteSociale: {
      on: {
        ENQUETE_COMPLETE: {
          target: 'analyseBesoins',
          actions: assign({
            enqueteSociale: ({ event }) => event.enquete,
          }),
        },
      },

      meta: {
        description: 'Enquête sociale complète: finances, logement, famille, santé',
      },
    },

    analyseBesoins: {
      on: {
        PLAN_ETABLI: {
          target: 'etablissementPlan',
          actions: assign({
            planAide: ({ event }) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Analyse des besoins et détermination du type d\'aide approprié',
      },
    },

    etablissementPlan: {
      on: {
        AIDE_APPROUVEE: {
          target: 'aideActive',
        },
        AIDE_REFUSEE: {
          target: 'demandeRejetee',
        },
      },

      meta: {
        description: 'Établissement du plan d\'aide personnalisé',
      },
    },

    aideActive: {
      on: {
        REEVALUATION_TRIMESTRIELLE: {
          target: 'reevaluationSituation',
        },
        SITUATION_DEGRADEE: {
          target: 'renforcement',
        },
        AUTONOMIE_ATTEINTE: {
          target: 'accompagnementSortie',
        },
      },

      meta: {
        description: 'Aide sociale active avec suivi régulier par assistant social',
      },
    },

    reevaluationSituation: {
      on: {
        ENQUETE_COMPLETE: {
          target: 'analyseBesoins',
          actions: assign({
            enqueteSociale: ({ event }) => event.enquete,
          }),
        },
      },

      meta: {
        description: 'Réévaluation trimestrielle de la situation',
      },
    },

    renforcement: {
      on: {
        PLAN_ETABLI: {
          target: 'aideActive',
          actions: assign({
            planAide: ({ event }) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Renforcement de l\'aide suite à dégradation de la situation',
      },
    },

    accompagnementSortie: {
      on: {
        SITUATION_AMELIOREE: {
          target: 'aideTerminee',
        },
      },

      meta: {
        description: 'Accompagnement vers l\'autonomie et sortie progressive de l\'aide',
      },
    },

    aideTerminee: {
      type: 'final',

      meta: {
        description: 'Aide sociale terminée - autonomie retrouvée',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - orientation vers autres services si nécessaire',
      },
    },
  },
});

/**
 * Visualisation du flux de l'aide sociale:
 *
 * inactif
 *   → accueilDemande
 *       ↓ (si urgence)
 *     aideUrgence
 *       ↓
 *     enqueteSociale
 *       ↓
 *     analyseBesoins
 *       ↓
 *     etablissementPlan
 *       ↓
 *     aideActive
 *       ↓ (réévaluation trimestrielle)
 *     reevaluationSituation → analyseBesoins
 *       ↓ (autonomie)
 *     accompagnementSortie → aideTerminee
 */
