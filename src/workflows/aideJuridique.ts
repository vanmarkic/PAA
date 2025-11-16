/**
 * Machine XState pour l'Aide Juridique
 *
 * Cette machine d'état représente le flux de traitement de l'aide juridique,
 * incluant assistance gratuite ou partiellement gratuite d'un avocat.
 */

import { createMachine, assign } from 'xstate';

interface Demandeur {
  nom: string;
  numeroRegistreNational: string;
  revenus: number;
  personnesACharge: number;
  situationFinanciere: string;
}

interface Litige {
  typeAffaire: string;
  domaineDroit: string;
  urgence: boolean;
  partieAdverse: string;
  description: string;
}

interface AideAccordee {
  typeAide: 'gratuite' | 'partiellement-gratuite' | 'pro-deo';
  avocatDesigne: string;
  barreauCompetent: string;
  montantContribution: number;
}

interface AideJuridiqueContext {
  demandeur: Demandeur | null;
  litige: Litige | null;
  aideAccordee: AideAccordee | null;
  bureauAssistance: string | null;
  dossierOuvert: boolean;
}

export const aideJuridiqueMachine = createMachine({
  id: 'aideJuridique',
  initial: 'inactif',

  schemas: {
    context: {} as AideJuridiqueContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; demandeur: Demandeur; litige: Litige }
      | { type: 'URGENCE_CONFIRMEE' }
      | { type: 'REVENUS_VERIFIES'; eligible: boolean }
      | { type: 'AIDE_EVALUEE'; aide: AideAccordee }
      | { type: 'AVOCAT_DESIGNE'; avocat: string }
      | { type: 'CONSULTATION_EFFECTUEE' }
      | { type: 'PROCEDURE_ENGAGEE' }
      | { type: 'AFFAIRE_REGLEE' }
      | { type: 'APPEL_NECESSAIRE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    demandeur: null,
    litige: null,
    aideAccordee: null,
    bureauAssistance: null,
    dossierOuvert: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'accueilDemande',
          actions: assign({
            demandeur: ({ event }) => event.demandeur,
            litige: ({ event }) => event.litige,
          }),
        },
      },

      meta: {
        description: 'En attente de demande d\'aide juridique',
      },
    },

    accueilDemande: {
      on: {
        URGENCE_CONFIRMEE: {
          target: 'designationUrgente',
        },
        REVENUS_VERIFIES: {
          target: 'verificationRevenus',
        },
      },

      meta: {
        description: 'Accueil au Bureau d\'Assistance Judiciaire (BAJ)',
      },
    },

    designationUrgente: {
      on: {
        AVOCAT_DESIGNE: {
          target: 'aideActive',
          actions: assign({
            aideAccordee: ({ event }) => ({
              typeAide: 'pro-deo' as const,
              avocatDesigne: event.avocat,
              barreauCompetent: '',
              montantContribution: 0,
            }),
          }) as any,
        },
      },

      meta: {
        description: 'Désignation urgente d\'avocat (garde, comparution immédiate)',
      },
    },

    verificationRevenus: {
      on: {
        REVENUS_VERIFIES: [
          {
            target: 'evaluationAide',
            guard: ({ event }) => event.eligible,
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification des revenus selon barèmes légaux',
      },
    },

    evaluationAide: {
      on: {
        AIDE_EVALUEE: {
          target: 'designationAvocat',
          actions: assign({
            aideAccordee: ({ event }) => event.aide,
          }),
        },
      },

      meta: {
        description: 'Détermination du type d\'aide (gratuite/partiellement gratuite)',
      },
    },

    designationAvocat: {
      on: {
        AVOCAT_DESIGNE: {
          target: 'aideActive',
          actions: assign({
            aideAccordee: ({ context, event }) => {
              if (!context.aideAccordee) {
                throw new Error('aideAccordee must be set before assigning avocat');
              }
              const current: AideAccordee = context.aideAccordee;
              return {
                ...current,
                avocatDesigne: event.avocat,
              };
            },
            dossierOuvert: true,
          }) as any,
        },
      },

      meta: {
        description: 'Désignation d\'un avocat par le Barreau',
      },
    },

    aideActive: {
      on: {
        CONSULTATION_EFFECTUEE: {
          target: 'consultationEffectuee',
        },
        PROCEDURE_ENGAGEE: {
          target: 'procedureEnCours',
        },
      },

      meta: {
        description: 'Aide juridique active - avocat désigné',
      },
    },

    consultationEffectuee: {
      on: {
        PROCEDURE_ENGAGEE: {
          target: 'procedureEnCours',
        },
        AFFAIRE_REGLEE: {
          target: 'dossierCloture',
        },
      },

      meta: {
        description: 'Consultation juridique effectuée - décision de poursuivre ou non',
      },
    },

    procedureEnCours: {
      on: {
        AFFAIRE_REGLEE: {
          target: 'dossierCloture',
        },
        APPEL_NECESSAIRE: {
          target: 'procedureAppel',
        },
      },

      meta: {
        description: 'Procédure judiciaire en cours avec assistance de l\'avocat',
      },
    },

    procedureAppel: {
      on: {
        AFFAIRE_REGLEE: {
          target: 'dossierCloture',
        },
      },

      meta: {
        description: 'Procédure d\'appel en cours',
      },
    },

    dossierCloture: {
      type: 'final',

      meta: {
        description: 'Dossier clôturé - affaire réglée',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - revenus trop élevés',
      },
    },
  },
});

/**
 * Visualisation du flux de l'aide juridique:
 *
 * inactif
 *   → accueilDemande (BAJ)
 *       ↓ (urgence)
 *     designationUrgente → aideActive
 *       ↓ (pas urgence)
 *     verificationRevenus
 *       ↓
 *     evaluationAide
 *       ↓
 *     designationAvocat
 *       ↓
 *     aideActive
 *       ↓
 *     consultationEffectuee
 *       ↓
 *     procedureEnCours → dossierCloture ✓
 */
