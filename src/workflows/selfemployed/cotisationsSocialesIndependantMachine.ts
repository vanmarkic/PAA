import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Cotisations sociales indépendant
 *
 * Base légale: AR n°38 statut social indépendants
 * Compétence: ONSS (Office National Sécurité Sociale) via caisses
 * Taux 2024: 20,5% des revenus nets professionnels
 *
 * Terminologie consacrée:
 * - "Cotisations sociales provisoires" (basées revenus estimés)
 * - "Cotisations sociales définitives" (basées revenus réels N-3)
 * - "Revenus professionnels nets" (base taxable - déductions)
 * - "Régularisation" (ajustement provisoire → définitif)
 */

interface CotisationsIndependantContext {
  independant: {
    nom: string;
    statut: 'principal' | 'complementaire';
    debutActivite: string;
  };
  revenus?: {
    estimes?: number;
    reels?: number;
  };
  cotisations?: {
    provisoires_trimestre?: number;
    definitives_annee?: number;
    regularisation?: number;
  };
}

type CotisationsIndependantEvent =
  | { type: 'DECLARER_REVENUS_ESTIMES'; montant: number }
  | { type: 'CALCULER_PROVISOIRES' }
  | { type: 'REVENUS_REELS_CONNUS'; montant: number }
  | { type: 'REGULARISATION' };

export const cotisationsSocialesIndependantMachine = createMachine({
  id: 'cotisationsSocialesIndependant',
  initial: 'estimation',
  context: {
    independant: {
      nom: '',
      statut: 'principal',
      debutActivite: '',
    },
  },
  states: {
    estimation: {
      meta: {
        description: 'Estimation revenus et calcul cotisations provisoires',
        principe: {
          provisoires: 'Cotisations basées sur revenus ESTIMÉS ou forfait',
          trimestrielles: 'Paiement tous les 3 mois',
          definitives: 'Régularisation ultérieure (3 ans plus tard)',
        },
        taux2024: {
          taux_global: '20,5% des revenus nets professionnels',
          decomposition: {
            pension: '± 16,48%',
            maladie_invalidite: '± 3,21%',
            allocations_familiales: '± 0,44%',
            faillite: '± 0,08%',
            gestion: '± 0,29%',
          },
        },
        revenus_base_calcul: {
          definition: 'Revenus professionnels nets (après déductions)',
          revenus_bruts: 'Chiffre affaires ou honoraires',
          moins: 'Frais professionnels déductibles',
          egal: 'Revenus nets professionnels',
        },
        estimation_premiere_annee: {
          forfait: 'Souvent basé sur cotisations minimales',
          estimation_propre: 'Ou estimation personnelle',
          prudence: 'Attention sous-estimation (régularisation douloureuse)',
        },
      },
      on: {
        DECLARER_REVENUS_ESTIMES: 'cotisations_provisoires',
      },
    },
    cotisations_provisoires: {
      meta: {
        description: 'Paiement cotisations provisoires trimestrielles',
        montants_minimaux_2024: {
          activite_principale: {
            revenus_min: '15.293,39€/an (plancher)',
            cotisations: '15.293,39 × 20,5% = 3.135,14€/an',
            par_trimestre: '± 784€/trimestre',
            remarque: 'Même si revenus inférieurs',
          },
          activite_complementaire: {
            revenus_min: '1.762,96€/an (plancher)',
            cotisations: '1.762,96 × 20,5% = 361,41€/an',
            par_trimestre: '± 90€/trimestre',
          },
        },
        plafond_cotisations: {
          revenus_max: '104.534,00€/an (plafond 2024)',
          cotisations_max: '104.534 × 20,5% = 21.429,47€/an',
          remarque: 'Au-delà, pas de cotisations supplémentaires',
        },
        calcul_exemple: {
          revenus_estimes: '40.000€ nets/an',
          cotisations_annee: '40.000 × 20,5% = 8.200€',
          par_trimestre: '8.200 ÷ 4 = 2.050€',
        },
        echeances: {
          T1: '31 mars (cotisations janvier-mars)',
          T2: '30 juin (cotisations avril-juin)',
          T3: '30 septembre (cotisations juillet-septembre)',
          T4: '31 décembre (cotisations octobre-décembre)',
        },
        domiciliation: {
          recommande: 'Domiciliation bancaire fortement recommandée',
          automatique: 'Prélèvement automatique',
          oubli: 'Évite oublis et majorations',
        },
        reductions_possibles: {
          debut_activite: {
            premiere_annee: 'Cotisations réduites possibles',
            conditions: 'Jamais été indépendant avant',
            montant: 'Cotisations minimales réduites (demande)',
          },
          etudiant_independant: {
            conditions: '< 25 ans, étudiant, revenus < seuil',
            avantage: 'Cotisations très réduites ou nulles',
            seuil2024: 'Revenus < 8.109,89€ → 0€ cotisations',
          },
          pensionnés: 'Plafond revenus sans perte pension',
        },
      },
      on: {
        REVENUS_REELS_CONNUS: 'regularisation',
      },
    },
    regularisation: {
      meta: {
        description: 'Régularisation cotisations (définitives)',
        principe: {
          delai: 'Régularisation basée sur revenus réels année N-3',
          exemple: 'En 2024 → régularisation revenus 2021',
          raison: 'Déclaration impôts finalisée avec délai',
        },
        calcul_definitif: {
          base: 'Revenus nets RÉELS selon déclaration fiscale',
          taux: '20,5% des revenus réels',
          comparaison: 'Comparaison avec provisoires payées',
        },
        scenarios: {
          revenus_superieurs: {
            cas: 'Revenus réels > revenus estimés',
            consequence: 'Supplément à payer',
            exemple: 'Estimé 30.000€, réel 40.000€ → 2.050€ supplément',
          },
          revenus_inferieurs: {
            cas: 'Revenus réels < revenus estimés',
            consequence: 'Remboursement par caisse',
            exemple: 'Estimé 40.000€, réel 30.000€ → 2.050€ remboursés',
          },
          revenus_identiques: {
            cas: 'Estimation correcte',
            consequence: 'Aucun ajustement',
          },
        },
        echelonnement: {
          supplement: 'Possibilité étaler supplément (sur demande)',
          plan: 'Plan paiement si montant important',
          interets: 'Éviter intérêts retard',
        },
        exemple_complet: {
          annee2021: {
            provisoires: 'Payé 8.200€ (basé estimation 40.000€)',
          },
          annee2024: {
            revenus_reels: '45.000€ (déclaration impôts finalisée)',
            definitives: '45.000 × 20,5% = 9.225€',
            regularisation: '9.225 - 8.200 = 1.025€ à payer',
          },
        },
        impact_droits: {
          pension: 'Droits pension calculés sur cotisations définitives',
          maladie: 'Indemnités basées revenus réels',
          important: 'Sous-estimation nuit droits futurs',
        },
      },
      type: 'final',
    },
  },
});
