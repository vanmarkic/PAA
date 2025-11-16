import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Règlement Collectif de Dettes (RCD)
 *
 * Base légale: Loi du 12 juin 1991 relative au crédit à la consommation (Titre VII)
 * Compétence: Tribunal du travail
 * Durée: Plan généralement 3-5-7 ans
 *
 * Terminologie consacrée:
 * - "Règlement Collectif de Dettes" - RCD (non "faillite personnelle")
 * - "Surendettement" (état légal: impossibilité durable de payer)
 * - "Médiateur de dettes" (professionnel désigné par tribunal)
 * - "Plan d'apurement" (échéancier remboursement sur durée déterminée)
 */

interface RCDContext {
  debiteur: {
    nom: string;
    revenus_mensuels: number;
    composition_menage: number;
  };
  dettes: {
    montant_total: number;
    nombre_creanciers: number;
    types?: string[]; // Loyers, crédits, factures
  };
  plan?: {
    duree_annees?: number;
    mensualite?: number;
    remise_partielle?: boolean;
  };
}

type RCDEvent =
  | { type: 'DEMANDER_RCD'; data: RCDContext }
  | { type: 'ADMISSIBILITE_FAVORABLE' }
  | { type: 'ADMISSIBILITE_DEFAVORABLE' }
  | { type: 'PLAN_ACCEPTE'; duree: number; mensualite: number }
  | { type: 'PLAN_REFUSE' }
  | { type: 'EXECUTION_TERMINEE' };

export const reglementCollectifDettesMachine = createMachine({
  id: 'reglementCollectifDettes',
  initial: 'evaluation',
  context: {
    debiteur: {
      nom: '',
      revenus_mensuels: 0,
      composition_menage: 1,
    },
    dettes: {
      montant_total: 0,
      nombre_creanciers: 0,
    },
  },
  states: {
    evaluation: {
      meta: {
        description: 'Évaluation situation surendettement',
        definition_surendettement: {
          legal: 'Impossibilité manifeste et durable pour débiteur de payer dettes',
          criteres: [
            'Dettes multiples (≥ 2 créanciers généralement)',
            'Impossibilité durable de payer (pas temporaire)',
            'Bonne foi du débiteur (pas fraude)',
          ],
        },
        types_dettes: {
          incluses: [
            'Crédits à la consommation',
            'Prêts hypothécaires',
            'Loyers arriérés',
            'Factures énergie, eau',
            'Taxes communales',
            'Dettes alimentaires (pensions)',
            'Dettes sociales (ONSS)',
          ],
          exclues: [
            'Amendes pénales',
            'Dettes contractées après requête RCD',
          ],
        },
        conditions_acces: {
          residenceBelgique: 'Résidence habituelle en Belgique',
          bonne_foi: 'Surendettement involontaire (pas fraude)',
          caractere_civil: 'Dettes non professionnelles',
        },
        premieresEtapes: {
          mediation_volontaire: 'Essayer médiation amiable (CPAS, service médiation)',
          budget: 'Établir budget détaillé',
          inventaire: 'Lister toutes les dettes',
        },
      },
      on: {
        DEMANDER_RCD: 'requete',
      },
    },
    requete: {
      meta: {
        description: 'Dépôt requête RCD au Tribunal du travail',
        ou: 'Greffe Tribunal du travail du domicile',
        comment: {
          seul: 'Débiteur peut déposer seul',
          avocat: 'Avec avocat (recommandé mais pas obligatoire)',
          gratuit: 'Pas de frais de greffe',
        },
        documentsNecessaires: [
          'Requête motivée (formulaire tribunal)',
          'Budget détaillé (revenus et dépenses)',
          'Liste complète des dettes (créanciers, montants)',
          'Preuves revenus (fiches paie, allocations)',
          'Preuves dettes (factures, mises en demeure)',
          'Composition de ménage',
        ],
        effets_immediats: {
          protection: 'Protection contre saisies (sous conditions)',
          suspension: 'Suspension poursuites individuelles',
          gel: 'Gel dettes (plus d\'intérêts de retard)',
        },
      },
      on: {
        ADMISSIBILITE_FAVORABLE: 'admissibilite',
        ADMISSIBILITE_DEFAVORABLE: 'rejet_admissibilite',
      },
    },
    admissibilite: {
      meta: {
        description: 'Décision d\'admissibilité par tribunal',
        verification: {
          surendettement: 'Impossibilité manifeste et durable',
          bonne_foi: 'Pas de fraude ou dépenses excessives volontaires',
          competence: 'Compétence territoriale',
        },
        audition: 'Convocation débiteur au tribunal',
        delai: '1-3 mois après dépôt',
        decision: {
          admissible: 'Débiteur déclaré admissible → désignation médiateur',
          irrecevable: 'Requête rejetée',
        },
        mediateur: {
          designation: 'Tribunal désigne médiateur de dettes agréé',
          role: 'Établir plan apurement et gérer exécution',
          gratuit: 'Services du médiateur gratuits pour débiteur',
        },
      },
      on: {
        PLAN_ACCEPTE: 'plan_apurement',
      },
    },
    plan_apurement: {
      meta: {
        description: 'Élaboration et homologation plan d\'apurement',
        role_mediateur: {
          inventaire: 'Inventaire complet dettes et revenus',
          negociation: 'Négociation avec créanciers',
          plan: 'Proposition plan apurement',
        },
        contenu_plan: {
          montant_quotite: {
            principe: 'Part quotité saisissable des revenus',
            calcul: 'Revenus - montant insaisissable (RMI élargi)',
            quotite2024: '± 1.400-1.600€/mois insaisissable (isolé)',
            mensualite: 'Mensualité = revenus - quotité insaisissable',
          },
          duree: {
            generale: '3, 5 ou 7 ans selon montant dettes',
            critere: 'Proportionnalité dettes/capacité remboursement',
          },
          repartition: {
            privileges: 'Créanciers privilégiés payés en priorité (loyer, énergie)',
            chirographaires: 'Autres créanciers au prorata (au marc le franc)',
          },
        },
        types_plans: {
          remboursement_integral: 'Si capacité payer toutes dettes étalées',
          remboursement_partiel: 'Si capacité insuffisante → remise partielle',
          effacement: 'Rarement: effacement si aucune capacité (plan "0€")',
        },
        homologation: {
          audience: 'Présentation plan au tribunal',
          creanciers: 'Créanciers peuvent s\'opposer',
          jugement: 'Jugement homologation (force exécutoire)',
        },
        exemple: {
          revenus: 'Revenus nets 2.000€/mois, isolé',
          quotite_insaisissable: '1.450€ (quotité protégée)',
          mensualite: '550€/mois disponible',
          dettes: '30.000€',
          duree_plan: '5 ans (60 mois × 550€ = 33.000€)',
          resultat: 'Remboursement intégral possible',
        },
      },
      on: {
        EXECUTION_TERMINEE: 'execution',
      },
    },
    execution: {
      meta: {
        description: 'Exécution du plan d\'apurement',
        paiements: {
          mensualite: 'Paiement mensualité au médiateur',
          repartition: 'Médiateur redistribue aux créanciers',
          regularite: 'Paiements réguliers OBLIGATOIRES',
        },
        obligations: {
          payer: 'Payer mensualités à temps',
          revenus: 'Ne pas contracter nouvelles dettes',
          notification: 'Notifier changements situation (revenus, emploi)',
          collaboration: 'Collaborer avec médiateur',
        },
        sanctions: {
          defaut_paiement: 'Révocation plan si non-paiement',
          consequence: 'Créanciers retrouvent droits poursuites',
        },
        duree: '3-7 ans selon plan',
        fin: {
          liberation: 'Libération dettes (même si remboursement partiel)',
          quitus: 'Certificat fin plan',
          effacement: 'Dettes résiduelles effacées (si plan partiel)',
        },
      },
      on: {
        EXECUTION_TERMINEE: 'finalisation',
      },
    },
    finalisation: {
      meta: {
        description: 'Fin du RCD - libération des dettes',
        conditions: {
          respect_plan: 'Plan exécuté intégralement',
          duree_respectee: 'Durée respectée',
        },
        effets: {
          liberation: 'Libération TOTALE des dettes (même si remboursement partiel)',
          effacement: 'Dettes résiduelles effacées définitivement',
          nouveau_depart: 'Fresh start financier',
        },
        fichiers: {
          BNB: 'Retrait Centrale des Crédits (BNB) après 1 an',
          mentions: 'Mentions négatives effacées',
        },
        prevention: {
          gestion_budget: 'Maintenir gestion rigoureuse budget',
          credit: 'Éviter nouveaux crédits inconsidérés',
          conseil: 'Suivi possible service médiation dettes',
        },
      },
      type: 'final',
    },
    rejet_admissibilite: {
      meta: {
        description: 'Requête RCD rejetée',
        motifs: [
          'Pas de surendettement caractérisé',
          'Surendettement temporaire (pas durable)',
          'Mauvaise foi (fraude, dépenses excessives)',
          'Dettes professionnelles',
          'Résidence hors Belgique',
        ],
        recours: {
          appel: 'Appel devant Cour du travail',
          delai: '1 mois',
        },
        alternatives: {
          mediation_volontaire: 'Médiation amiable (CPAS)',
          negociation: 'Négociation directe créanciers',
          plan_paiement: 'Plans de paiement individuels',
        },
      },
      type: 'final',
    },
  },
});
