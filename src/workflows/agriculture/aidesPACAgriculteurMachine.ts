/**
 * Machine XState pour Aides PAC Agriculteur
 * Terminologie: Politique Agricole Commune (PAC), droits au paiement, conditionnalité
 */

import { createMachine, assign } from 'xstate';

interface ExploitationAgricole {
  numeroAgriculteur: string; // Numéro BCE ou agriculteur
  surfaceAdmissible: number; // hectares
  typeProduction: 'grandes-cultures' | 'elevage' | 'maraichage' | 'arboriculture' | 'mixte';
  bio: boolean;
  droitsPaiement: number; // Nombre droits PAC
}

interface AidesPACContext {
  exploitation: ExploitationAgricole | null;
  declarationSurfaceEffectuee: boolean;
  controlesConditionnalite: boolean;
  montantAidesPremierPilier: number; // Aides directes
  montantAidesSecondPilier: number; // Développement rural
  paiementVerse: boolean;
}

export const aidesPACAgriculteurMachine = createMachine({
  id: 'aidesPACAgriculteur',
  initial: 'inscriptionAgriculteur',
  schemas: {
    context: {} as AidesPACContext,
    events: {} as
      | { type: 'INSCRIRE'; exploitation: ExploitationAgricole }
      | { type: 'DECLARER_SURFACES' }
      | { type: 'DEMANDE_AIDES_PAC' }
      | { type: 'CONTROLES_EFFECTUES' }
      | { type: 'AIDES_CALCULEES'; premierPilier: number; secondPilier: number }
      | { type: 'PAIEMENT_VERSE' }
  },
  context: {
    exploitation: null,
    declarationSurfaceEffectuee: false,
    controlesConditionnalite: false,
    montantAidesPremierPilier: 0,
    montantAidesSecondPilier: 0,
    paiementVerse: false,
  },
  states: {
    inscriptionAgriculteur: {
      on: {
        INSCRIRE: {
          target: 'declarationPAC',
          actions: assign({ exploitation: (_, event) => event.exploitation }),
        },
      },
      meta: {
        description: 'Inscription comme agriculteur auprès Organisme Payeur (SPW)',
        conditions: {
          agriculteurActif: 'Définition agriculteur actif (PAC 2023-2027)',
          surfaceMinimum: '0,5 hectare minimum admissible',
        },
      },
    },
    declarationPAC: {
      on: {
        DECLARER_SURFACES: {
          target: 'demandeAides',
          actions: assign({ declarationSurfaceEffectuee: true }),
        },
      },
      meta: {
        description: 'Déclaration annuelle surfaces (PAC-on-Web)',
        delai: 'Avant 31 mai (délai strict)',
        contenu: 'Déclaration parcelles graphiques + cultures',
      },
    },
    demandeAides: {
      on: {
        DEMANDE_AIDES_PAC: { target: 'controlesConditionnalite' },
      },
      meta: {
        description: 'Demande aides PAC (couplée à déclaration)',
        aidesDisponibles: {
          paiementBase: '±160€/ha (droits au paiement)',
          paiementVert: '±50€/ha (pratiques agricoles durables)',
          paiementJeunesAgriculteurs: '+25% si < 40 ans',
          paiementRedistributif: 'Surprime premiers hectares',
          aidesBio: '+100-300€/ha si agriculture biologique',
        },
      },
    },
    controlesConditionnalite: {
      on: {
        CONTROLES_EFFECTUES: {
          target: 'calculMontantAides',
          actions: assign({ controlesConditionnalite: true }),
        },
      },
      meta: {
        description: 'Contrôles conditionnalité (BCAE + exigences réglementaires)',
        BCAE: 'Bonnes Conditions Agricoles et Environnementales',
        controles: [
          'Utilisation phytosanitaires',
          'Bien-être animal',
          'Haies et arbres',
          'Couverture sols hiver',
        ],
        sanction: 'Réduction aides si non-conformités',
      },
    },
    calculMontantAides: {
      on: {
        AIDES_CALCULEES: {
          target: 'versementAides',
          actions: assign({
            montantAidesPremierPilier: (_, event) => event.premierPilier,
            montantAidesSecondPilier: (_, event) => event.secondPilier,
          }),
        },
      },
      meta: {
        description: 'Calcul montant aides selon déclaration et droits',
      },
    },
    versementAides: {
      on: {
        PAIEMENT_VERSE: {
          target: 'termine',
          actions: assign({ paiementVerse: true }),
        },
      },
      meta: {
        description: 'Versement aides PAC',
        calendrier: {
          avance: '16 octobre (70% aides)',
          solde: '1er décembre (30% restants)',
        },
      },
    },
    termine: {
      type: 'final',
      meta: {
        description: 'Aides PAC versées pour année culturale',
      },
    },
  },
});
