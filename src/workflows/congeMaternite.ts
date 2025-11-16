/**
 * Machine XState pour le Congé de Maternité
 *
 * Cette machine d'état représente le flux de traitement du congé de maternité,
 * incluant la déclaration, repos prénatal et postnatal.
 */

import { createMachine, assign } from 'xstate';

interface MereTravailleuse {
  nom: string;
  numeroRegistreNational: string;
  employeur: string;
  salaireMoyen: number;
  dateTermePrevu: Date;
  grossesseMultiple: boolean;
}

interface CertificatMedical {
  dateCertificat: Date;
  medecinNom: string;
  dateTermeConfirmee: Date;
  complicationsSignalees: boolean;
  reposObligatoire: boolean;
}

interface PlanCongeMaternite {
  semainesReposPrenatal: number;
  semainesReposPostnatal: number;
  dateDebutConge: Date;
  dateFinConge: Date;
  allocationJournaliere: number;
}

interface CongeMaterniteContext {
  mere: MereTravailleuse | null;
  certificatMedical: CertificatMedical | null;
  planConge: PlanCongeMaternite | null;
  datAccouchement: Date | null;
  prolongationMedicale: boolean;
}

export const congeMaterniteMachine = createMachine({
  id: 'congeMaternite',
  initial: 'inactif',

  schemas: {
    context: {} as CongeMaterniteContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; mere: MereTravailleuse }
      | { type: 'CERTIFICAT_FOURNI'; certificat: CertificatMedical }
      | { type: 'PLAN_CALCULE'; plan: PlanCongeMaternite }
      | { type: 'CONGE_DEMARRE' }
      | { type: 'REPOS_PRENATAL_FACULTATIF' }
      | { type: 'REPOS_PRENATAL_OBLIGATOIRE' }
      | { type: 'ACCOUCHEMENT'; date: Date }
      | { type: 'COMPLICATIONS_MEDICALES' }
      | { type: 'PROLONGATION_ACCORDEE' }
      | { type: 'CONGE_TERMINE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    mere: null,
    certificatMedical: null,
    planConge: null,
    datAccouchement: null,
    prolongationMedicale: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'declarationGrossesse',
          actions: assign({
            mere: ({ event }) => event.mere,
          }),
        },
      },

      meta: {
        description: 'En attente de déclaration de grossesse',
      },
    },

    declarationGrossesse: {
      on: {
        CERTIFICAT_FOURNI: {
          target: 'calculPlanConge',
          actions: assign({
            certificatMedical: ({ event }) => event.certificat,
          }),
        },
      },

      meta: {
        description: 'Déclaration de grossesse avec certificat médical',
      },
    },

    calculPlanConge: {
      on: {
        PLAN_CALCULE: {
          target: 'attenteReposPrenatal',
          actions: assign({
            planConge: ({ event }) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Calcul du congé: 15 semaines (6 prénatal + 9 postnatal minimum)',
      },
    },

    attenteReposPrenatal: {
      on: {
        REPOS_PRENATAL_FACULTATIF: {
          target: 'reposPrenatalFacultatif',
        },
        REPOS_PRENATAL_OBLIGATOIRE: {
          target: 'reposPrenatalObligatoire',
        },
      },

      meta: {
        description: 'Phase avant le repos prénatal obligatoire',
      },
    },

    reposPrenatalFacultatif: {
      on: {
        REPOS_PRENATAL_OBLIGATOIRE: {
          target: 'reposPrenatalObligatoire',
        },
        ACCOUCHEMENT: {
          target: 'reposPostnatal',
          actions: assign({
            datAccouchement: ({ event }) => event.date,
          }),
        },
      },

      meta: {
        description: 'Repos prénatal facultatif (jusqu\'à 6 semaines avant terme)',
      },
    },

    reposPrenatalObligatoire: {
      on: {
        ACCOUCHEMENT: {
          target: 'reposPostnatal',
          actions: assign({
            datAccouchement: ({ event }) => event.date,
          }),
        },
      },

      meta: {
        description: 'Repos prénatal obligatoire (1 semaine avant terme minimum)',
      },
    },

    reposPostnatal: {
      on: {
        COMPLICATIONS_MEDICALES: {
          target: 'prolongationMedicale',
        },
        CONGE_TERMINE: {
          target: 'congeTermine',
        },
      },

      meta: {
        description: 'Repos postnatal obligatoire (9 semaines minimum)',
      },
    },

    prolongationMedicale: {
      on: {
        PROLONGATION_ACCORDEE: {
          target: 'reposPostnatal',
          actions: assign({
            prolongationMedicale: true,
          }),
        },
      },

      meta: {
        description: 'Prolongation du congé pour raisons médicales',
      },
    },

    congeTermine: {
      type: 'final',

      meta: {
        description: 'Fin du congé de maternité - reprise possible du travail',
      },
    },
  },
});

/**
 * Visualisation du flux du congé de maternité:
 *
 * inactif
 *   → declarationGrossesse
 *   → calculPlanConge (15 semaines min)
 *   → attenteReposPrenatal
 *   → reposPrenatalFacultatif (optionnel)
 *   → reposPrenatalObligatoire (1 semaine min)
 *   → [accouchement]
 *   → reposPostnatal (9 semaines min)
 *       ↓ (complications)
 *     prolongationMedicale → reposPostnatal
 *       ↓
 *     congeTermine ✓
 */
