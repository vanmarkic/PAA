import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Tarif social énergie (électricité et gaz)
 *
 * Base légale: AR du 29 mars 2012 fixant les règles de détermination du coût de l'application du tarif social
 * Compétence: Fournisseurs énergie (application automatique)
 * Réduction 2024: ± 30-40% sur prix énergie
 *
 * Terminologie consacrée:
 * - "Tarif social" (réduction tarifaire pour clients vulnérables)
 * - "Client protégé" (bénéficiaire automatique tarif social)
 * - "Catégories de clients protégés" (BIM, OMNIO, etc.)
 * - "Application automatique" (pas de demande nécessaire)
 */

interface TarifSocialContext {
  client: {
    nom: string;
    statut?: string;
    categorie?: string;
  };
  eligibilite?: {
    critere: string;
    automatique: boolean;
  };
  avantage?: {
    reductionPourcentage: number;
    economieAnnuelle?: number;
  };
}

type TarifSocialEvent =
  | { type: 'VERIFIER_ELIGIBILITE'; data: TarifSocialContext }
  | { type: 'ELIGIBLE_AUTOMATIQUE' }
  | { type: 'NON_ELIGIBLE' }
  | { type: 'APPLIQUER_TARIF' };

export const tarifSocialEnergieMachine = createMachine({
  id: 'tarifSocialEnergie',
  initial: 'information',
  context: {
    client: {
      nom: '',
    },
  },
  states: {
    information: {
      meta: {
        description: 'Information sur le tarif social énergie',
        definition: {
          principe: 'Prix réduit électricité et gaz pour ménages vulnérables',
          reduction: '± 30-40% par rapport tarif normal',
          automatique: 'Application AUTOMATIQUE (pas de demande)',
        },
        avantages: {
          prix_reduit: 'Prix électricité et gaz fortement réduits',
          pas_demande: 'Pas de démarche (automatique)',
          retroactif: 'Rétroactif si oubli fournisseur',
        },
        montants2024: {
          electricite: 'Variable selon consommation (économie ± 200-500€/an)',
          gaz: 'Variable selon consommation (économie ± 300-700€/an)',
          total: 'Économie totale ± 500-1.200€/an',
        },
      },
      on: {
        VERIFIER_ELIGIBILITE: 'verification',
      },
    },
    verification: {
      meta: {
        description: 'Vérification éligibilité tarif social',
        categories_automatiques: {
          BIM: {
            titre: 'Bénéficiaires Intervention Majorée (BIM)',
            definition: 'Statut mutuelle (faibles revenus)',
            detection: 'Croisement données Banque Carrefour Sécurité Sociale',
          },
          OMNIO: {
            titre: 'Statut OMNIO',
            definition: 'Ancien système BIM (maintenu pour acquis)',
          },
          GRAPA: {
            titre: 'Bénéficiaires GRAPA',
            definition: 'Garantie Revenus Personnes Âgées',
          },
          RIS: {
            titre: 'Revenu Intégration Sociale (CPAS)',
            definition: 'Bénéficiaires RIS',
          },
          allocation_handicap: {
            titre: 'Allocations handicap',
            categories: [
              'Allocation Remplacement Revenus (ARR)',
              'Allocation Intégration catégorie III-IV-V (AI)',
            ],
          },
          aide_sociale: {
            titre: 'Aide sociale équivalente RIS',
            definition: 'Aide CPAS équivalente au RIS',
          },
          enfants_charge: {
            titre: 'Ménage ≥ 3 enfants à charge + allocations familiales majorées',
            conditions: 'Cumul conditions famille nombreuse + revenus faibles',
          },
          debiteur_energie: {
            titre: 'Débiteur alimentaire avec ménage 1+ enfant',
            rare: 'Catégorie spécifique',
          },
        },
        verification_automatique: {
          systeme: 'Croisement automatique bases données fédérales',
          banque_carrefour: 'BCSS vérifie statuts',
          transmission: 'Info transmise automatiquement fournisseurs',
          delai: 'Application sous 1-3 mois',
        },
      },
      on: {
        ELIGIBLE_AUTOMATIQUE: 'octroi',
        NON_ELIGIBLE: 'non_eligible',
      },
    },
    octroi: {
      meta: {
        description: 'Octroi automatique du tarif social',
        application: {
          automatique: 'Fournisseur applique AUTOMATIQUEMENT',
          notification: 'Mention sur facture',
          retroactivite: 'Maximum 5 ans en arrière si oubli',
        },
        facture: {
          mention: '« Tarif social » visible sur facture',
          prix_reduit: 'Prix kWh et m³ fortement réduits',
          verification: 'Vérifier application correcte',
        },
        montant_tarif2024: {
          electricite: {
            normal: '± 0,30-0,40€/kWh (variable marché)',
            tarif_social: '± 0,20€/kWh (plafonné)',
            economie: '± 30-40% moins cher',
          },
          gaz: {
            normal: '± 0,10-0,15€/kWh (variable marché)',
            tarif_social: '± 0,06€/kWh (plafonné)',
            economie: '± 40-50% moins cher',
          },
        },
        duree: {
          tant_que_statut: 'Tant que critère rempli',
          renouvellement: 'Renouvellement automatique',
          perte: 'Arrêt si perte statut (BIM, RIS, etc.)',
        },
        cumuls: {
          compteur_budget: 'Cumulable avec compteur à budget',
          protection_hiver: 'Cumulable avec protection hiver',
          credit_minimum: 'Crédit minimum garanti majoré',
        },
        reclamation: {
          si_non_applique: 'Contacter fournisseur',
          preuve: 'Fournir preuve statut si nécessaire',
          SPF_Economie: 'Plainte SPF Economie si refus',
          retroactif: 'Remboursement trop-payé jusqu\'à 5 ans',
        },
      },
      type: 'final',
    },
    non_eligible: {
      meta: {
        description: 'Non éligible au tarif social',
        raison: 'Aucun des critères automatiques remplis',
        alternatives: {
          demander_BIM: 'Vérifier éligibilité BIM (mutuelle)',
          CPAS: 'Aide ponctuelle CPAS pour factures',
          fonds_energie: 'Fonds social énergie (GRD)',
          prime_chauffage: 'Prime chauffage (régions)',
          compteur_budget: 'Compteur à budget (contrôle consommation)',
        },
        economie_energie: {
          conseils: 'Réduire consommation',
          primes_isolation: 'Primes rénovation énergétique',
          thermostats: 'Thermostat programmable',
        },
      },
      type: 'final',
    },
  },
});
