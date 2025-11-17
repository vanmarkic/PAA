/**
 * Machine XState pour Subvention Association Culturelle
 * Terminologie: Décret relatif au soutien de la vie associative (FWB)
 */

import { createMachine, assign } from 'xstate';

interface AssociationCulturelle {
  nom: string;
  formeJuridique: 'ASBL' | 'association-de-fait';
  domaine: 'theatre' | 'musique' | 'arts-plastiques' | 'danse' | 'patrimoine' | 'pluridisciplinaire';
  budgetAnnuel: number;
  membresActifs: number;
}

interface SubventionCultureContext {
  association: AssociationCulturelle | null;
  dossierSubside: boolean;
  montantDemande: number;
  montantAccorde: number;
  conventionnement: boolean; // Reconnaissance FWB
}

type SubventionCultureEvents =
  | { type: 'DEPOSER_DOSSIER'; association: AssociationCulturelle; montant: number }
  | { type: 'DOSSIER_COMPLET' }
  | { type: 'EVALUATION_COMMISSION' }
  | { type: 'SUBSIDE_ACCORDE'; montant: number }
  | { type: 'DEMANDE_CONVENTIONNEMENT' }
  | { type: 'CONVENTIONNEMENT_ACCORDE' };

export const subventionAssociationCulturelleMachine = createMachine({
  id: 'subventionAssociationCulturelle',
  initial: 'depotDossierSubside',
  types: {} as {
    context: SubventionCultureContext;
    events: SubventionCultureEvents;
  },
  context: {
    association: null,
    dossierSubside: false,
    montantDemande: 0,
    montantAccorde: 0,
    conventionnement: false,
  },
  states: {
    depotDossierSubside: {
      on: {
        DEPOSER_DOSSIER: {
          target: 'instructionDossier',
          actions: assign({
            association: ({ event }) => event.association,
            montantDemande: ({ event }) => event.montant,
          }),
        },
      },
      meta: {
        description: 'Dépôt dossier subvention',
        organismes: {
          FWB: 'Fédération Wallonie-Bruxelles (Culture)',
          Wallonie: 'Direction Culture - SPW',
          Bruxelles: 'Commission Communautaire Française (COCOF)',
        },
      },
    },
    instructionDossier: {
      on: {
        DOSSIER_COMPLET: { target: 'evaluationProjet' },
      },
      meta: {
        description: 'Instruction administrative complétude dossier',
        pieces: [
          'Statuts ASBL publiés Moniteur',
          'Dernier rapport activités',
          'Comptes annuels approuvés',
          'Budget prévisionnel',
          'Projet culturel détaillé',
        ],
      },
    },
    evaluationProjet: {
      on: {
        EVALUATION_COMMISSION: { target: 'decisionSubside' },
      },
      meta: {
        description: 'Évaluation par commission consultative',
        criteres: [
          'Qualité artistique',
          'Rayonnement territorial',
          'Accessibilité publics',
          'Gestion administrative et financière',
        ],
      },
    },
    decisionSubside: {
      on: {
        SUBSIDE_ACCORDE: {
          target: 'subsidePonctuel',
          actions: assign({ montantAccorde: ({ event }) => event.montant }),
        },
        DEMANDE_CONVENTIONNEMENT: { target: 'procedureConventionnement' },
      },
      meta: {
        description: 'Décision octroi subside',
        montants: {
          ponctuel: '500€ - 10 000€ (projet)',
          structurel: '> 25 000€ (si conventionnement)',
        },
      },
    },
    subsidePonctuel: {
      type: 'final',
      meta: {
        description: 'Subside ponctuel accordé',
        justification: 'Reddition comptes obligatoire',
      },
    },
    procedureConventionnement: {
      on: {
        CONVENTIONNEMENT_ACCORDE: {
          target: 'subsideStructurel',
          actions: assign({ conventionnement: true }),
        },
      },
      meta: {
        description: 'Demande reconnaissance/conventionnement pluriannuel',
        avantages: 'Subside structurel pluriannuel + visibilité',
        duree: 'Contrat-programme 5 ans',
      },
    },
    subsideStructurel: {
      type: 'final',
      meta: {
        description: 'Subventionnement structurel obtenu',
      },
    },
  },
});
