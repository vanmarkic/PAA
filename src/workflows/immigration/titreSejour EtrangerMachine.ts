/**
 * Machine XState pour Titre de Séjour Étranger
 * Terminologie: Titre de séjour, Office des Étrangers (OE), attestation d'immatriculation
 */

import { createMachine, assign } from 'xstate';

interface DemandeSejourEtranger {
  nom: string;
  nationalite: string;
  motifSejour: 'etudes' | 'travail' | 'familial' | 'refugie' | 'autre';
  documentsPossedes: string[];
}

interface TitreSejourContext {
  demande: DemandeSejourEtranger | null;
  typePermis: 'A' | 'B' | 'C' | 'F' | 'F+' | null; // Cartes de séjour
  attestationImmatriculation: boolean;
  decisionOE: 'favorable' | 'defavorable' | 'en-attente' | null;
  carteSejourDelivree: boolean;
}

type TitreSejourEvents =
  | { type: 'ENTREE_BELGIQUE'; demande: DemandeSejourEtranger }
  | { type: 'DECLARATION_COMMUNE' }
  | { type: 'DEMANDE_OFFICE_ETRANGERS' }
  | { type: 'ATTESTATION_DELIVREE' }
  | { type: 'DECISION_OE'; decision: 'favorable' | 'defavorable'; typePermis?: 'A' | 'B' | 'C' | 'F' | 'F+' }
  | { type: 'CARTE_SEJOUR_DELIVREE' }
  | { type: 'RECOURS_INTRODUIT' };

export const titreSejourEtrangerMachine = createMachine({
  id: 'titreSejourEtranger',
  initial: 'entreeTerritoire',
  types: {} as {
    context: TitreSejourContext;
    events: TitreSejourEvents;
  },
  context: {
    demande: null,
    typePermis: null,
    attestationImmatriculation: false,
    decisionOE: null,
    carteSejourDelivree: false,
  },
  states: {
    entreeTerritoire: {
      on: {
        ENTREE_BELGIQUE: {
          target: 'declarationCommune',
          actions: assign({ demande: (_, event) => event.demande }),
        },
      },
      meta: {
        description: 'Entrée sur territoire belge',
        visa: 'Visa requis selon nationalité (sauf UE/EEE)',
      },
    },
    declarationCommune: {
      on: {
        DECLARATION_COMMUNE: { target: 'depotDemandeSejour' },
      },
      meta: {
        description: 'Déclaration à la commune (dans 8 jours ouvrables)',
        sanctionRetard: 'Amende si dépassement délai',
      },
    },
    depotDemandeSejour: {
      on: {
        DEMANDE_OFFICE_ETRANGERS: { target: 'instructionDemande' },
      },
      meta: {
        description: 'Dépôt demande autorisation séjour',
        ou: 'Administration communale → transmission Office des Étrangers',
      },
    },
    instructionDemande: {
      on: {
        ATTESTATION_DELIVREE: {
          target: 'decisionOE',
          actions: assign({ attestationImmatriculation: true }),
        },
      },
      meta: {
        description: 'Instruction par Office des Étrangers',
        attente: 'Attestation d\'immatriculation (annexe) en attente décision',
        duree: 'Variable: 4 mois (regroupement familial) à 6+ mois',
      },
    },
    decisionOE: {
      on: {
        DECISION_OE: [
          {
            target: 'delivranceCarte',
            guard: (_, event) => event.decision === 'favorable',
            actions: assign({
              decisionOE: (_, event) => event.decision,
              typePermis: (_, event) => event.typePermis || null,
            }),
          },
          {
            target: 'ordreQuitter',
            actions: assign({ decisionOE: (_, event) => event.decision }),
          },
        ],
      },
      meta: {
        description: 'Décision Office des Étrangers',
      },
    },
    delivranceCarte: {
      on: {
        CARTE_SEJOUR_DELIVREE: {
          target: 'termine',
          actions: assign({ carteSejourDelivree: true }),
        },
      },
      meta: {
        description: 'Délivrance carte de séjour',
        types: {
          A: 'Séjour temporaire (< 3 mois)',
          B: 'Séjour limité (études, travail temporaire)',
          C: 'Résident de longue durée (UE)',
          F: 'Carte séjour membre famille UE',
          'F+': 'Carte séjour permanent membre famille UE (5 ans)',
        },
      },
    },
    ordreQuitter: {
      on: {
        RECOURS_INTRODUIT: { target: 'procedureRecours' },
      },
      meta: {
        description: 'Ordre de quitter le territoire (OQT)',
        recours: 'Conseil du Contentieux des Étrangers (CCE) - délai 30 jours',
      },
    },
    procedureRecours: {
      on: {
        DECISION_OE: [
          {
            target: 'delivranceCarte',
            guard: (_, event) => event.decision === 'favorable',
          },
        ],
      },
      meta: {
        description: 'Recours devant Conseil du Contentieux des Étrangers',
      },
    },
    termine: {
      type: 'final',
      meta: {
        description: 'Titre de séjour obtenu',
        renouvellement: 'À renouveler avant expiration (délai variable selon type)',
      },
    },
  },
});
