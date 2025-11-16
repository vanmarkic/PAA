import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Pension anticipée (retraite avant âge légal)
 *
 * Base légale: AR n°50 du 24 octobre 1967 relatif à la pension de retraite et de survie
 * Loi du 5 mai 2014 portant des dispositions diverses (carrière longue)
 * Compétence: SPF Pensions
 *
 * Terminologie consacrée:
 * - "Pension anticipée" (non "retraite anticipée")
 * - "Âge légal de la pension" (actuellement 65 ans, passage progressif à 66/67 ans)
 * - "Carrière longue" (régime spécial 42/43/44 ans carrière)
 * - "Bonification pour diplôme" (années d'études comptabilisées)
 */

interface PensionAnticipeeContext {
  demandeur: {
    nom: string;
    dateNaissance: string;
    age: number;
    sexe: 'H' | 'F';
  };
  carriere: {
    anneesCarriere?: number; // Années travaillées (équivalent temps plein)
    dateDebutCarriere?: string;
    anneesAvant20Ans?: number; // Années travaillées avant 20 ans (carrière longue)
    regimeTravailleur?: 'salarie' | 'independant' | 'mixte';
    periodesAssimilees?: number; // Chômage, maladie, crédit-temps
  };
  conditions: {
    ageMinimum?: number; // 60, 61, 63 selon année naissance
    carriereMininimum?: number; // 42, 43, 44, 45 ans selon situation
    eligible?: boolean;
    regimeApplicable?: 'classique' | 'carriereLongue' | 'ineligible';
  };
  montantEstime?: number;
}

type PensionAnticipeeEvent =
  | { type: 'CALCULER_ELIGIBILITE'; data: PensionAnticipeeContext }
  | { type: 'ELIGIBLE_CLASSIQUE'; ageMin: number; carriereMin: number }
  | { type: 'ELIGIBLE_CARRIERE_LONGUE'; ageMin: number }
  | { type: 'INELIGIBLE'; motif: string }
  | { type: 'SOUMETTRE_DEMANDE' }
  | { type: 'DEMANDE_ACCEPTEE'; montant: number }
  | { type: 'DEMANDE_REFUSEE'; motif: string };

export const pensionAnticipeeMachine = createMachine<
  PensionAnticipeeContext,
  PensionAnticipeeEvent
>({
  id: 'pensionAnticipee',
  initial: 'verification',
  context: {
    demandeur: {
      nom: '',
      dateNaissance: '',
      age: 0,
      sexe: 'H',
    },
    carriere: {},
    conditions: {},
  },
  states: {
    verification: {
      meta: {
        description: 'Vérification éligibilité pension anticipée',
        agesLegaux: {
          2024: '65 ans (nés en 1959)',
          2025: '66 ans (nés en 1960-1961)',
          2030: '67 ans (nés à partir de 1962)',
        },
        regimes: {
          classique: {
            titre: 'Pension anticipée classique',
            conditions2024: {
              age: '63 ans minimum',
              carriere: '42 ans minimum',
            },
            conditions2025: {
              age: '63 ans minimum',
              carriere: '43 ans minimum',
            },
            conditions2030: {
              age: '64 ans minimum',
              carriere: '44 ans minimum',
            },
          },
          carriereLongue: {
            titre: 'Pension anticipée carrière longue',
            avantage: 'Possibilité partir plus tôt (60-61 ans)',
            conditions: {
              debut: 'Avoir commencé à travailler très jeune',
              duree: '42, 43 ou 44 ans de carrière',
              preuveJeune: 'Prouver années travail avant 18/20 ans',
            },
            regles2024: [
              '60 ans + 44 ans carrière dont 2 ans avant 18 ans',
              '61 ans + 43 ans carrière',
              '63 ans + 42 ans carrière',
            ],
          },
        },
        calculCarriere: {
          periodesComptabilisees: [
            'Travail salarié (jours travaillés)',
            'Travail indépendant (trimestres cotisés)',
            'Périodes assimilées (chômage, maladie, crédit-temps)',
            'Bonification diplôme (max 3 ans si diplôme sup.)',
          ],
          exclusions: [
            'Interruption carrière non indemnisée > 1 an',
            'Périodes à l\'étranger hors UE/conventions',
          ],
        },
      },
      on: {
        CALCULER_ELIGIBILITE: [
          {
            target: 'eligibleClassique',
            guard: (context, event) => {
              const age = event.data.demandeur.age;
              const carriere = event.data.carriere.anneesCarriere || 0;
              // Simplifié: 2024-2025
              return age >= 63 && carriere >= 42;
            },
            actions: assign((context, event) => ({
              ...context,
              ...event.data,
              conditions: {
                eligible: true,
                regimeApplicable: 'classique',
              },
            })),
          },
          {
            target: 'eligibleCarriereLongue',
            guard: (context, event) => {
              const age = event.data.demandeur.age;
              const carriere = event.data.carriere.anneesCarriere || 0;
              const avantVingtAns = event.data.carriere.anneesAvant20Ans || 0;
              // Carrière longue: 60 ans + 44 ans dont années avant 20 ans
              return (
                (age >= 60 && carriere >= 44 && avantVingtAns >= 2) ||
                (age >= 61 && carriere >= 43)
              );
            },
            actions: assign((context, event) => ({
              ...context,
              ...event.data,
              conditions: {
                eligible: true,
                regimeApplicable: 'carriereLongue',
              },
            })),
          },
          {
            target: 'ineligible',
            actions: assign((context, event) => ({
              ...context,
              ...event.data,
              conditions: {
                eligible: false,
                regimeApplicable: 'ineligible',
              },
            })),
          },
        ],
      },
    },
    eligibleClassique: {
      meta: {
        description: 'Éligible pension anticipée classique (63 ans + 42 ans)',
        avantages: 'Pas de réduction (malus) si conditions remplies',
        inconvenients: 'Montant peut être inférieur à pension à 65 ans (moins années cotisées)',
        remarque: 'Calcul basé sur 45 ans carrière complète = 100%',
      },
      on: {
        SOUMETTRE_DEMANDE: 'traitementDemande',
      },
    },
    eligibleCarriereLongue: {
      meta: {
        description: 'Éligible pension anticipée carrière longue (60-61 ans)',
        avantage: 'Partir 2-3 ans plus tôt que régime classique',
        conditionsStrictes: [
          'Prouver années travail avant 18 ou 20 ans',
          'Attestations employeurs anciennes (difficile)',
          'Extraits de compte ONSS complets',
        ],
        documentsCritiques: {
          attestationsEmployeurs: 'Preuves emploi avant 18-20 ans (souvent difficiles à obtenir)',
          extraitsONSS: 'Compte carrière complet (demander via MyPension.be)',
          dimona: 'Déclarations emploi (disponibles depuis 2003 seulement)',
        },
        conseil: 'Demander simulation SPF Pensions AVANT 58 ans pour préparer dossier',
      },
      on: {
        SOUMETTRE_DEMANDE: 'traitementDemande',
      },
    },
    ineligible: {
      meta: {
        description: 'Non éligible pension anticipée',
        motifsFrequents: [
          'Âge insuffisant (< 60-63 ans selon régime)',
          'Carrière trop courte (< 42-44 ans)',
          'Pas assez années avant 20 ans (carrière longue)',
          'Périodes non cotisées importantes',
        ],
        alternatives: {
          creditTemps: 'Crédit-temps fin carrière (maintien cotisations)',
          travailTempsPartiel: 'Passage temps partiel avec maintien droits',
          RCC: 'Chômage avec complément entreprise (RCC - si CCT sectorielle)',
          continuerTravailler: 'Attendre âge légal (pension maximale)',
        },
        simulation: 'Utiliser MyPension.be pour calculs personnalisés',
      },
      type: 'final',
    },
    traitementDemande: {
      meta: {
        description: 'Traitement demande par SPF Pensions',
        procedureDemande: {
          quand: '6 mois AVANT date souhaitée de départ',
          comment: [
            'En ligne via MyPension.be (recommandé)',
            'Par courrier au SPF Pensions',
            'Auprès de commune (guichet pensions)',
          ],
          delaiTraitement: '3-6 mois',
        },
        documentsNecessaires: [
          'Carte d\'identité',
          'Compte carrière complet (extraits ONSS)',
          'Attestations employeurs (périodes manquantes)',
          'Preuves périodes à l\'étranger si applicable',
          'Diplômes (bonification)',
        ],
        verification: {
          carriere: 'Contrôle toutes périodes travaillées',
          lacunes: 'Signalement périodes manquantes (possibilité compléter)',
          periodes_etranger: 'Coordination UE/conventions bilatérales',
        },
      },
      on: {
        DEMANDE_ACCEPTEE: {
          target: 'pensionOctroyee',
          actions: assign({
            montantEstime: (context, event) => event.montant,
          }),
        },
        DEMANDE_REFUSEE: 'refus',
      },
    },
    pensionOctroyee: {
      meta: {
        description: 'Pension anticipée octroyée',
        paiement: {
          frequence: 'Mensuel (fin du mois)',
          virement: 'Compte bancaire belge',
          indexation: 'Adaptation bien-être + index santé',
        },
        montant: {
          calcul: 'Basé sur 60% salaires bruts (salariés) ou revenus professionnels (indépendants)',
          carriere_complete: '45 ans = 100% du montant',
          carriere_incomplete: 'Prorata (ex: 40 ans = 40/45 = 88,9%)',
          plafond_salarie: 'Salaire plafonné à ±70.000€/an',
        },
        fiscalite: {
          imposable: 'OUI - pension = revenu imposable',
          precompte: 'Précompte professionnel retenu à la source',
          declarationImpots: 'À déclarer annuellement',
        },
        cumuls: {
          travail_salarie: 'Limité première année (plafond ±8.620€ si < 65 ans)',
          travail_independant: 'Limité première année',
          apres_65_ans: 'Cumul libre si âge légal atteint',
        },
        obligations: {
          residence: 'Notifier déménagement à l\'étranger (impact paiement)',
          revenus: 'Déclarer revenus professionnels si cumul',
          etatCivil: 'Notifier mariage, divorce, décès conjoint',
        },
      },
      type: 'final',
    },
    refus: {
      meta: {
        description: 'Demande refusée',
        recours: {
          tribunal: 'Tribunal du travail',
          delai: '3 mois',
        },
      },
      type: 'final',
    },
  },
});
