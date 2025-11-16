import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Allocation d'Intégration (AI)
 *
 * Base légale: Loi 27 février 1987 relative aux allocations aux personnes handicapées
 * Compétence: SPF Sécurité sociale - DG Personnes handicapées
 * Montants 2024: Catégorie I (129,05€), II (362,44€), III (575,02€), IV (906,47€), V (1.139,53€)
 *
 * Terminologie consacrée:
 * - "Allocation d'Intégration" - AI (non "allocation autonomie")
 * - "Manque d'autonomie" évalué en "points" (0-27 points)
 * - Catégories I à V selon points (9-11, 12-14, 15-16, 17-18, 19-27)
 */

interface AIContext {
  demandeur: {
    nom: string;
    dateNaissance: string;
    age?: number;
  };
  handicap: {
    pointsAutonomie?: number; // 0-27 points selon guide-barème
    categorie?: 'I' | 'II' | 'III' | 'IV' | 'V';
    domainesEvalues?: {
      seDplacer: number; // 0-4 points
      mangerPreparerNouriture: number; // 0-3 points
      hygieneCorporelle: number; // 0-3 points
      habillage: number; // 0-3 points
      entretienLogement: number; // 0-3 points
      vivreSansSupervision: number; // 0-5 points
      communiquer: number; // 0-3 points
      responsabilitesSecurite: number; // 0-3 points
    };
  };
  montantMensuel?: number;
}

type AIEvent =
  | { type: 'SOUMETTRE_DEMANDE'; data: AIContext }
  | { type: 'EVALUATION_FAVORABLE'; points: number; categorie: 'I' | 'II' | 'III' | 'IV' | 'V' }
  | { type: 'EVALUATION_DEFAVORABLE' }
  | { type: 'RECOURS' }
  | { type: 'REVISION'; nouveauxPoints: number };

export const allocationIntegrationMachine = createMachine<AIContext, AIEvent>({
  id: 'allocationIntegration',
  initial: 'preparation',
  context: {
    demandeur: {
      nom: '',
      dateNaissance: '',
    },
    handicap: {},
  },
  states: {
    preparation: {
      meta: {
        description: 'Préparation demande Allocation d\'Intégration',
        conditionsAcces: {
          age: 'Minimum 21 ans (sauf émancipation)',
          ageMaximum: 'Pas de limite d\'âge (contrairement à l\'ARR)',
          handicap: 'Minimum 9 points d\'autonomie sur échelle de 27',
          residence: 'Résidence effective en Belgique',
        },
        documentsNecessaires: [
          'Formulaire demande SPF',
          'Rapports médicaux récents',
          'Copie carte d\'identité',
          'Composition de ménage',
        ],
        differentiation: {
          ARR: 'Compense perte REVENUS (capacité gain)',
          AI: 'Compense perte AUTONOMIE (vie quotidienne)',
          cumul: 'NON cumulables - choix allocation plus favorable',
        },
      },
      on: {
        SOUMETTRE_DEMANDE: {
          target: 'evaluationAutonomie',
          actions: assign(({ context, event }) => ({
            ...context,
            ...event.data,
          })),
        },
      },
    },
    evaluationAutonomie: {
      meta: {
        description: 'Évaluation manque autonomie par médecin SPF',
        guideBareme: {
          seDeplacer: {
            points: '0-4 points',
            criteres: [
              '0 = Se déplace seul normalement',
              '1 = Difficulté se déplacer hors domicile',
              '2 = Ne se déplace qu\'avec aide technique',
              '3 = Ne se déplace qu\'avec aide tierce',
              '4 = Grabataire permanent',
            ],
          },
          mangerPreparer: {
            points: '0-3 points',
            criteres: [
              '0 = Mange et prépare seul normalement',
              '1 = Aide technique nécessaire',
              '2 = Aide tierce partielle',
              '3 = Dépendance totale',
            ],
          },
          hygieneCorporelle: {
            points: '0-3 points',
            criteres: 'Toilette, bain, douche, soins corporels',
          },
          shabiller: {
            points: '0-3 points',
            criteres: 'S\'habiller, se déshabiller, choisir vêtements',
          },
          entretienLogement: {
            points: '0-3 points',
            criteres: 'Ménage, lessive, repassage, vaisselle',
          },
          vivreSansSupervision: {
            points: '0-5 points',
            criteres: 'Dangers, jugement, orientation temporelle/spatiale',
            maximum: 'Domaine avec le plus de points (dangers)',
          },
          communiquer: {
            points: '0-3 points',
            criteres: 'Comprendre, s\'exprimer, téléphone, courrier',
          },
          responsabilitesSecurite: {
            points: '0-3 points',
            criteres: 'Gérer budget, administratif, décisions',
          },
        },
        totalMaximum: '27 points (somme des 8 domaines)',
        seuilMinimum: '9 points requis pour catégorie I',
        examen: 'Convocation examen médical SPF obligatoire',
      },
      on: {
        EVALUATION_FAVORABLE: {
          target: 'octroi',
          actions: assign({
            handicap: ({ context, event }) => ({
              ...context.handicap,
              pointsAutonomie: event.points,
              categorie: event.categorie,
            }),
            montantMensuel: ({ context, event }) => {
              const montants = {
                I: 129.05,
                II: 362.44,
                III: 575.02,
                IV: 906.47,
                V: 1139.53,
              };
              return montants[event.categorie];
            },
          }),
        },
        EVALUATION_DEFAVORABLE: 'refus',
      },
    },
    octroi: {
      meta: {
        description: 'Allocation d\'Intégration octroyée',
        montantsCategories2024: {
          categorieI: {
            points: '9 à 11 points',
            montant: '129,05 € / mois',
            profil: 'Handicap léger - autonomie légèrement réduite',
          },
          categorieII: {
            points: '12 à 14 points',
            montant: '362,44 € / mois',
            profil: 'Handicap modéré - besoin aide ponctuelle',
          },
          categorieIII: {
            points: '15 à 16 points',
            montant: '575,02 € / mois',
            profil: 'Handicap important - aide régulière nécessaire',
          },
          categorieIV: {
            points: '17 à 18 points',
            montant: '906,47 € / mois',
            profil: 'Handicap sévère - dépendance importante',
          },
          categorieV: {
            points: '19 à 27 points',
            montant: '1.139,53 € / mois',
            profil: 'Handicap très sévère - dépendance quasi totale',
          },
        },
        paiement: {
          frequence: 'Mensuel (le 5 du mois)',
          virement: 'Compte bancaire IBAN',
          indexation: 'Automatique selon index santé',
        },
        caracteristiques: {
          conditionsRevenus: 'PAS de condition de revenus (contrairement à ARR)',
          cumulARR: 'NON cumulable avec ARR',
          cumulPension: 'OUI cumulable avec pension',
          cumulMutuelle: 'OUI cumulable avec indemnités mutuelle',
          fiscalite: 'NON IMPOSABLE (exonéré impôts)',
        },
        obligations: {
          changementSituation: 'Notifier amélioration/aggravation handicap',
          revisionsPerodiques: 'Possible tous les 2-5 ans selon situation',
          domicile: 'Maintenir résidence effective en Belgique',
        },
        avantagesLies: {
          tarifSocialEnergie: 'Accès automatique si catégorie III-IV-V',
          reductionTransports: 'Tarifs réduits De Lijn, STIB, TEC',
          carteStationnement: 'Facilite obtention si mobilité réduite',
        },
      },
      on: {
        REVISION: {
          target: 'evaluationAutonomie',
        },
      },
    },
    refus: {
      meta: {
        description: 'Refus AI - points insuffisants',
        motifPrincipal: 'Moins de 9 points d\'autonomie',
        remarque: 'Seuil strict - 8 points = 0 allocation',
        recours: 'Possible dans les 3 mois',
      },
      on: {
        RECOURS: 'recours',
      },
    },
    recours: {
      meta: {
        description: 'Recours Tribunal du travail',
        delai: '3 mois à dater notification',
        procedure: {
          requete: 'Au greffe Tribunal du travail domicile',
          expertise: 'Expertise médicale judiciaire possible',
          gratuite: 'Pas de frais de justice',
          jugement: 'Contraignant pour administration',
        },
        conseilPratique: [
          'Joindre TOUS rapports médicaux (spécialistes)',
          'Décrire concrètement difficultés vie quotidienne',
          'Témoignages famille/aidants utiles',
          'Demander expertise médicale si évaluation SPF contestable',
        ],
      },
      on: {
        EVALUATION_FAVORABLE: 'octroi',
      },
    },
  },
});
