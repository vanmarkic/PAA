import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Droits de succession
 *
 * Base légale: Code des droits de succession (régional)
 * Compétence: Région du dernier domicile du défunt
 * Taux 2024: 3% à 80% selon montant, lien familial et région
 *
 * Terminologie consacrée:
 * - "Droits de succession" (taxe régionale sur héritage)
 * - "Déclaration de succession" (dépôt obligatoire dans 4-5 mois)
 * - "Actif net" (actif - passif déductible)
 * - "Réserve héréditaire" (part minimale héritiers réservataires)
 */

interface DroitsSuccessionContext {
  defunt: {
    nom: string;
    dateDecès: string;
    dernierDomicile: 'wallonie' | 'flandre' | 'bruxelles';
  };
  heritage: {
    actifBrut: number;
    passifDeductible: number;
    actifNet?: number;
  };
  heritier: {
    nom: string;
    lienParente: 'ligne_directe' | 'entre_epoux' | 'frere_soeur' | 'autre';
    part: number; // %
  };
  droitsCalcules?: number;
  delaiDeclaration?: string;
}

type DroitsSuccessionEvent =
  | { type: 'CALCULER_DROITS'; data: DroitsSuccessionContext }
  | { type: 'DEPOSER_DECLARATION' }
  | { type: 'PAYER_DROITS'; montant: number }
  | { type: 'DEMANDER_ECHEANCIER' };

export const droitsSuccessionMachine = createMachine<
  DroitsSuccessionContext,
  DroitsSuccessionEvent
>({
  id: 'droitsSuccession',
  initial: 'inventaire',
  context: {
    defunt: {
      nom: '',
      dateDecès: '',
      dernierDomicile: 'wallonie',
    },
    heritage: {
      actifBrut: 0,
      passifDeductible: 0,
    },
    heritier: {
      nom: '',
      lienParente: 'autre',
      part: 0,
    },
  },
  states: {
    inventaire: {
      meta: {
        description: 'Inventaire patrimoine du défunt',
        actif: {
          immobilier: 'Maisons, terrains, immeubles (valeur vénale)',
          mobilier: 'Meubles, véhicules (valeur estimée)',
          comptes_bancaires: 'Soldes au jour du décès',
          valeurs_mobilieres: 'Actions, obligations, fonds',
          assurances_vie: 'Selon bénéficiaire (parfois hors succession)',
          creances: 'Sommes dues au défunt',
        },
        passif_deductible: {
          dettes_prouvees: 'Prêts hypothécaires, crédits à la consommation',
          frais_funeraires: 'Plafonnés (± 4.000€)',
          frais_derniere_maladie: 'Plafonnés',
          impots_dus: 'Arriérés fiscaux',
        },
        passif_NON_deductible: {
          dettes_fiscales_succession: 'Droits de succession eux-mêmes',
          liberalites: 'Legs, donations non déductibles',
        },
        formule: 'Actif net = Actif brut - Passif déductible',
      },
      on: {
        CALCULER_DROITS: 'calcul',
      },
    },
    calcul: {
      meta: {
        description: 'Calcul droits de succession selon région et parenté',
        delaiDeclaration: {
          bruxelles_wallonie: '4 mois à partir du décès',
          flandre: '4 mois (parfois prolongé 5 mois)',
          prolongations: 'Possible sur demande motivée',
        },
        tauxWallonie2024: {
          ligne_directe: {
            titre: 'Enfants, petits-enfants (descendants)',
            tranches: [
              '0 - 12.500€: 3%',
              '12.500 - 25.000€: 4%',
              '25.000 - 50.000€: 5%',
              '50.000 - 100.000€: 7%',
              '100.000 - 150.000€: 10%',
              '150.000 - 200.000€: 14%',
              '200.000 - 250.000€: 18%',
              '250.000 - 500.000€: 24%',
              'Au-delà 500.000€: 30%',
            ],
          },
          entre_epoux: {
            titre: 'Conjoint survivant ou cohabitant légal',
            remarque: 'Mêmes tranches que ligne directe en Wallonie',
            quotite_exemptee: 'Habitation familiale souvent exonérée (sous conditions)',
          },
          freres_soeurs: {
            titre: 'Frères et sœurs',
            tranches: [
              '0 - 12.500€: 20%',
              '12.500 - 25.000€: 25%',
              '25.000 - 75.000€: 35%',
              'Au-delà 75.000€: 50-65%',
            ],
          },
          autres: {
            titre: 'Oncles, tantes, cousins, sans lien',
            tranches: [
              '0 - 12.500€: 30%',
              '12.500 - 25.000€: 35%',
              '25.000 - 50.000€: 60%',
              '50.000 - 100.000€: 70%',
              'Au-delà 100.000€: 80%',
            ],
          },
        },
        tauxFlandre2024: {
          ligne_directe: '3% à 27% (barème progressif plus doux)',
          entre_epoux: 'Exonération quasi totale conjoint survivant',
          freres_soeurs: '25% à 55%',
          autres: '45% à 65%',
        },
        tauxBruxelles2024: {
          ligne_directe: 'Similaire Wallonie',
          entre_epoux: 'Similaire Wallonie',
          remarque: 'Région généralement la plus taxée',
        },
        exonerations_reductions: {
          habitation_familiale: {
            wallonie: 'Exonération si conjoint/cohabitant/enfant < 21 ans occupe',
            flandre: 'Exonération étendue',
            conditions: 'Résidence principale + occupation 5 ans',
          },
          entreprise_familiale: 'Réduction transmission PME familiale (Flandre/Wallonie)',
          patrimoine_modeste: 'Succession < 5.000€ souvent exonérée',
        },
      },
      on: {
        DEPOSER_DECLARATION: 'declaration',
      },
    },
    declaration: {
      meta: {
        description: 'Dépôt déclaration de succession',
        ou: {
          bruxelles: 'Bureau Sécurité juridique - SPF Finances',
          wallonie: 'Bureau Sécurité juridique compétent',
          flandre: 'Vlabel (administration fiscale flamande)',
        },
        qui: 'Notaire (généralement) ou héritiers eux-mêmes',
        documents: [
          'Acte de décès',
          'Livret de famille (composition héritiers)',
          'Testament (si existe)',
          'Extraits comptes bancaires au décès',
          'Titres propriété immobiliers',
          'Preuves dettes (emprunts)',
          'Estimation meubles',
        ],
        controles: {
          comptes_bancaires: 'Croisement automatique banques',
          immobilier: 'Cadastre',
          assurances_vie: 'Déclarations assureurs',
          donations_anterieures: 'Vérification donations < 3 ans (rapport)',
        },
        sanctions_retard: {
          amende: 'Majoration 10% à 20% si dépôt tardif',
          interets_retard: 'Intérêts moratoires',
          prescription: '30 ans (fisc peut régulariser)',
        },
      },
      on: {
        PAYER_DROITS: 'paiement',
        DEMANDER_ECHEANCIER: 'echeancier',
      },
    },
    paiement: {
      meta: {
        description: 'Paiement droits de succession',
        modalites: {
          comptant: 'Paiement immédiat (recommandé)',
          echeancier: 'Possible sur demande (intérêts)',
          dation: 'Exceptionnellement: paiement en nature (œuvres d\'art)',
        },
        consequences_non_paiement: {
          blocage: 'Pas de transfert propriété sans paiement',
          saisie: 'Saisie biens succession',
          interets: 'Intérêts de retard cumulatifs',
        },
      },
      on: {
        PAYER_DROITS: 'finalisation',
      },
    },
    echeancier: {
      meta: {
        description: 'Demande plan de paiement échelonné',
        conditions: {
          montant_eleve: 'Généralement si droits > 10.000€',
          justification: 'Prouver impossibilité paiement comptant',
          garanties: 'Hypothèque ou caution bancaire parfois exigée',
        },
        duree: '2 à 5 ans maximum',
        interets: 'Intérêts légaux appliqués',
      },
      on: {
        PAYER_DROITS: 'finalisation',
      },
    },
    finalisation: {
      meta: {
        description: 'Droits payés - succession finalisée',
        certificat: 'Certificat délivré par SPF Finances / Vlabel',
        effets: {
          transfert_propriete: 'Héritiers deviennent propriétaires',
          opposabilite: 'Titres opposables aux tiers',
          vente_possible: 'Biens peuvent être vendus',
        },
        conseils: {
          notaire: 'Assistance notaire fortement recommandée',
          anticipation: 'Donations de son vivant peuvent réduire fiscalité',
          assurance_solde: 'Assurance solde restant dû (prêts hypothécaires)',
        },
      },
      type: 'final',
    },
  },
});
