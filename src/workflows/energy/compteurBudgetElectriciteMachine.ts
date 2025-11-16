import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Compteur à budget électricité/gaz
 *
 * Base légale: Règlements régionaux énergie (CWaPE, VREG, Brugel)
 * Compétence: GRD (Gestionnaire Réseau Distribution) - ORES, RESA, Sibelga, Fluvius
 * Coût installation 2024: Gratuit si client protégé / ± 100-150€ sinon
 *
 * Terminologie consacrée:
 * - "Compteur à budget" (non "compteur à carte")
 * - "Client protégé" (statut protégé énergétique)
 * - "GRD" - Gestionnaire Réseau de Distribution
 * - "Rechargement" (achat crédit énergie)
 */

interface CompteurBudgetContext {
  client: {
    nom: string;
    statut?: 'protege' | 'normal';
    dettes_energie?: number;
  };
  installation?: {
    gratuite: boolean;
    frais?: number;
  };
  fonctionnement?: {
    creditMinimum: number;
    recharge_possible: boolean;
  };
}

type CompteurBudgetEvent =
  | { type: 'DEMANDER_COMPTEUR'; data: CompteurBudgetContext }
  | { type: 'INSTALLATION_PROGRAMMEE' }
  | { type: 'COMPTEUR_INSTALLE' }
  | { type: 'RECHARGER'; montant: number }
  | { type: 'CREDIT_EPUISE' };

export const compteurBudgetElectriciteMachine = createMachine<
  CompteurBudgetContext,
  CompteurBudgetEvent
>({
  id: 'compteurBudgetElectricite',
  initial: 'information',
  context: {
    client: {
      nom: '',
    },
  },
  states: {
    information: {
      meta: {
        description: 'Information sur compteur à budget',
        definition: {
          principe: 'Compteur avec prépaiement (payer AVANT consommer)',
          objectif: 'Contrôler consommation et éviter nouvelles dettes',
          public: 'Personnes en difficulté paiement factures énergie',
        },
        situations_installation: {
          dettes: 'Dettes énergie impayées (défaut paiement plan)',
          demande_volontaire: 'Demande du client (gestion budget)',
          fournisseur: 'Défaut paiement répété',
        },
        types_compteurs: {
          electricite: 'Compteur prépayé électricité',
          gaz: 'Compteur prépayé gaz',
          mixte: 'Parfois les deux',
        },
        client_protege: {
          definition: 'Statut clients vulnérables (revenus faibles, BIM, etc.)',
          avantages: [
            'Installation gratuite',
            'Tarif social énergie',
            'Crédit minimum garanti (±100€)',
            'Pas de coupure en hiver (oct-mars)',
          ],
        },
        client_normal: {
          installation: 'Frais installation ± 100-150€',
          credit_minimum: 'Crédit minimum réduit (±30€)',
          coupure: 'Coupure possible toute l\'année',
        },
      },
      on: {
        DEMANDER_COMPTEUR: 'demande',
      },
    },
    demande: {
      meta: {
        description: 'Demande installation compteur à budget',
        qui: {
          client: 'Client peut demander volontairement',
          fournisseur: 'Fournisseur peut imposer (défaut paiement)',
          GRD: 'GRD installe sur demande fournisseur ou client',
        },
        ou: 'Contacter GRD local (ORES, Sibelga, Fluvius, RESA, etc.)',
        procedure: {
          demande: 'Formulaire ou appel téléphonique',
          verification_statut: 'GRD vérifie si client protégé',
          rendez_vous: 'Prise RDV installation',
        },
        frais: {
          client_protege: 'GRATUIT',
          client_normal: '± 100-150€ (facturé ou plan paiement)',
        },
        delai: '2-4 semaines',
      },
      on: {
        INSTALLATION_PROGRAMMEE: 'installation',
      },
    },
    installation: {
      meta: {
        description: 'Installation compteur à budget par GRD',
        intervention: {
          technicien: 'Technicien GRD se déplace',
          duree: '1-2 heures',
          remplacement: 'Remplacement ancien compteur',
          gratuit: 'Gratuit si client protégé',
        },
        explication: {
          fonctionnement: 'Technicien explique fonctionnement',
          rechargement: 'Où et comment recharger',
          affichage: 'Lecture crédit restant',
        },
        premier_credit: {
          client_protege: 'Crédit minimum garanti (±100€)',
          client_normal: 'Crédit minimum réduit (±30€)',
          usage: 'Permet continuer consommer en attendant rechargement',
        },
      },
      on: {
        COMPTEUR_INSTALLE: 'actif',
      },
    },
    actif: {
      meta: {
        description: 'Compteur à budget actif',
        fonctionnement: {
          rechargement: {
            ou: [
              'Points de recharge (magasins, bureaux poste)',
              'Bornes automatiques',
              'En ligne (app/site GRD)',
              'Bancontact (certains GRD)',
            ],
            comment: 'Acheter code ou carte rechargeable',
            montant: 'Montant libre (généralement 10-100€)',
            immediat: 'Crédit disponible immédiatement ou quelques minutes',
          },
          consommation: {
            decompte: 'Compteur décompte crédit en temps réel',
            affichage: 'Écran montre crédit restant',
            alerte: 'Alerte sonore/visuelle si crédit faible',
          },
          tarification: {
            tarif_social: 'Si client protégé (≈ 30% moins cher)',
            tarif_normal: 'Tarif fournisseur si non protégé',
          },
        },
        credit_minimum: {
          definition: 'Crédit garanti même si solde = 0€',
          client_protege: '±100€ (électricité) + ±100€ (gaz)',
          client_normal: '±30€',
          usage: 'Éviter coupure brutale',
          remboursement: 'Déduit des prochains rechargements',
        },
        protection_hiver: {
          client_protege: 'Pas de coupure 1er octobre - 31 mars',
          garantie: 'Puissance minimale maintenue (10A élec, 3m³/jour gaz)',
          dette_accumulee: 'Dette cumulée sur crédit minimum',
        },
        avantages: {
          controle: 'Maîtrise consommation et budget',
          pas_facture_surprise: 'Pas de régularisation annuelle',
          pas_nouvelles_dettes: 'Impossible accumuler nouvelles dettes',
        },
        inconvenients: {
          contrainte: 'Devoir recharger régulièrement',
          deplacement: 'Se déplacer pour recharger (sauf online)',
          coupure_risque: 'Risque coupure si oubli rechargement',
        },
      },
      on: {
        RECHARGER: 'actif',
        CREDIT_EPUISE: 'credit_epuise',
      },
    },
    credit_epuise: {
      meta: {
        description: 'Crédit épuisé',
        client_protege: {
          hiver: 'Pas de coupure (oct-mars) - crédit minimum garanti',
          ete: 'Crédit minimum (±100€) puis coupure si épuisé',
        },
        client_normal: {
          credit_minimum: 'Crédit minimum ±30€',
          coupure: 'Coupure après épuisement crédit minimum',
        },
        retablissement: {
          rechargement: 'Recharger pour rétablir immédiatement',
          automatique: 'Rétablissement automatique après rechargement',
        },
        urgence: {
          CPAS: 'Aide CPAS possible (avance, don)',
          fonds_energie: 'Fonds social énergie (GRD)',
        },
      },
      on: {
        RECHARGER: 'actif',
      },
    },
  },
});
