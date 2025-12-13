/**
 * Business Rules for Garde d'Enfants et Aides Financières
 *
 * Implements the Gherkin specifications from features/benefits/garde-enfants.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Code des impôts sur les revenus 1992 (CIR 92), Article 145/35 - Réduction d'impôt pour frais de garde
 * - Arrêté du Gouvernement de la Communauté française du 27 février 2003 portant réglementation générale des milieux d'accueil
 * - Décret du 17 juillet 2002 portant réforme de l'Office de la Naissance et de l'Enfance (ONE)
 * - Loi du 26 mai 2002 concernant le droit à l'intégration sociale (pour statut BIM)
 * - Arrêté royal du 15 janvier 2014 relatif à l'intervention majorée de l'assurance
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * GardeEnfants Rules Version Metadata
 * This version MUST match the specification version in features/benefits/garde-enfants.feature
 */
export const GARDE_ENFANTS_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/garde-enfants.feature',
  generatedFrom: 'features/benefits/garde-enfants.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law
export const GARDE_ENFANTS_CONSTANTS = {
  // Réduction fiscale
  TAUX_REDUCTION_FISCALE: 0.45, // 45% des frais
  MAX_DEDUCTION_JOUR: 16.40, // €/jour/enfant
  AGE_MAX_DEDUCTION_FISCALE: 12, // ans

  // Tarifs ONE (Wallonie/Bruxelles)
  ONE_TARIF_MIN: 3.06, // €/jour
  ONE_TARIF_MAX: 43.14, // €/jour

  // Tarifs Kind en Gezin (Flandre)
  KIND_EN_GEZIN_TARIF_MIN: 6.24, // €/jour
  KIND_EN_GEZIN_TARIF_MAX: 34.64, // €/jour

  // Réductions
  REDUCTION_FAMILLE_NOMBREUSE: 0.30, // -30% à partir du 2ème enfant simultané
  REDUCTION_TEMPS_PARTIEL: 0.40, // -40% si présence ≤ 5h/jour
  REDUCTION_PARENT_ISOLE: 0.30, // -30%
  SEUIL_TEMPS_PARTIEL_HEURES: 5, // heures/jour

  // Seuils de revenus pour calcul tarif ONE (approximatifs)
  REVENUS_SEUIL_BAS: 20000, // €/an
  REVENUS_SEUIL_MOYEN: 35000, // €/an
  REVENUS_SEUIL_HAUT: 50000, // €/an

  // Garde enfant malade
  GARDE_MALADE_TARIF_MIN: 3, // €/heure
  GARDE_MALADE_TARIF_MAX: 5, // €/heure
  GARDE_MALADE_JOURS_MAX: 10, // jours/an

  // Intervention employeur secteur alimentaire (Alimento)
  INTERVENTION_ALIMENTO_MAX: 5, // €/jour

  // Nombre minimum d'enfants pour famille nombreuse
  SEUIL_FAMILLE_NOMBREUSE: 3,
};

/**
 * Types spécifiques pour la garde d'enfants
 */
export interface GardeEnfantsUser {
  age: number; // âge en mois de l'enfant
  ageAnnees?: number; // âge en années de l'enfant
  revenus_annuels_nets: number;
  statut_bim: boolean;
  nombre_enfants: number;
  nombre_enfants_creche: number;
  parent_isole: boolean;
  heures_presence_jour: number;
  type_garde: 'creche_one' | 'creche_kind_en_gezin' | 'gardienne_privee' | 'creche_entreprise' | 'accueillante_conventionnee' | 'accueillante_libre';
  garde_subventionnee: boolean;
  gardienne_agreee: boolean;
  tarif_journalier?: number;
  jours_garde_annuels?: number;
  intervention_employeur?: number;
  taux_subvention_employeur?: number;
  secteur_travail?: string;
  region: 'wallonie' | 'bruxelles' | 'flandre';
  reprise_activite?: boolean;
  enfant_malade?: boolean;
}

export interface GardeEnfantsResult {
  tarif_journalier_base: number;
  tarif_journalier_apres_reductions: number;
  cout_net_apres_deduction_fiscale: number;
  deduction_fiscale_jour: number;
  deduction_fiscale_annuelle: number;
  reduction_impot_annuelle: number;
  reductions_appliquees: string[];
  eligible_deduction_fiscale: boolean;
  motif_non_eligible?: string;
  gratuit: boolean;
  intervention_employeur: number;
}

/**
 * Calcule le tarif journalier ONE basé sur les revenus
 */
function calculerTarifONE(revenus_annuels: number): number {
  const min = GARDE_ENFANTS_CONSTANTS.ONE_TARIF_MIN;
  const max = GARDE_ENFANTS_CONSTANTS.ONE_TARIF_MAX;

  if (revenus_annuels <= 0) {
    return min;
  }

  // Formule approximative basée sur les barèmes ONE
  // Le tarif varie linéairement entre le min et le max selon les revenus
  const revenus_min = 15000;
  const revenus_max = 60000;

  if (revenus_annuels <= revenus_min) {
    return min;
  }
  if (revenus_annuels >= revenus_max) {
    return max;
  }

  const ratio = (revenus_annuels - revenus_min) / (revenus_max - revenus_min);
  return Math.round((min + ratio * (max - min)) * 100) / 100;
}

/**
 * Calcule le tarif journalier Kind en Gezin basé sur les revenus
 */
function calculerTarifKindEnGezin(revenus_annuels: number): number {
  const min = GARDE_ENFANTS_CONSTANTS.KIND_EN_GEZIN_TARIF_MIN;
  const max = GARDE_ENFANTS_CONSTANTS.KIND_EN_GEZIN_TARIF_MAX;

  if (revenus_annuels <= 0) {
    return min;
  }

  const revenus_min = 15000;
  const revenus_max = 55000;

  if (revenus_annuels <= revenus_min) {
    return min;
  }
  if (revenus_annuels >= revenus_max) {
    return max;
  }

  const ratio = (revenus_annuels - revenus_min) / (revenus_max - revenus_min);
  return Math.round((min + ratio * (max - min)) * 100) / 100;
}

/**
 * Create the GardeEnfants eligibility rules engine
 */
function createGardeEnfantsEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Statut BIM - Gratuité totale
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut_bim',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'garde_subventionnee',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-gratuit-bim',
      params: {
        message: 'Garde gratuite avec statut BIM depuis janvier 2023',
        gratuit: true,
        documents_requis: ['attestation BIM'],
      },
    },
    priority: 100, // Priorité maximale - vérifié en premier
  });

  // Rule 2: Enfant trop âgé pour déduction fiscale (> 12 ans)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'ageAnnees',
          operator: 'greaterThan',
          value: GARDE_ENFANTS_CONSTANTS.AGE_MAX_DEDUCTION_FISCALE,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-ineligible-deduction',
      params: {
        reason: 'enfant de plus de 12 ans',
        eligible_deduction_fiscale: false,
      },
    },
    priority: 90,
  });

  // Rule 3: Garde temps partiel (≤ 5h/jour) - réduction 40%
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'heures_presence_jour',
          operator: 'lessThanInclusive',
          value: GARDE_ENFANTS_CONSTANTS.SEUIL_TEMPS_PARTIEL_HEURES,
        },
        {
          fact: 'heures_presence_jour',
          operator: 'greaterThan',
          value: 0,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-reduction-temps-partiel',
      params: {
        message: 'Réduction temps partiel applicable',
        taux_reduction: GARDE_ENFANTS_CONSTANTS.REDUCTION_TEMPS_PARTIEL,
        documents_requis: ['déclaration heures de présence'],
      },
    },
    priority: 70,
  });

  // Rule 4: Parent isolé - réduction 30%
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'parent_isole',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-reduction-parent-isole',
      params: {
        message: 'Réduction parent isolé applicable',
        taux_reduction: GARDE_ENFANTS_CONSTANTS.REDUCTION_PARENT_ISOLE,
      },
    },
    priority: 60,
  });

  // Rule 5: Famille nombreuse (3+ enfants) - réduction 30%
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nombre_enfants',
          operator: 'greaterThanInclusive',
          value: GARDE_ENFANTS_CONSTANTS.SEUIL_FAMILLE_NOMBREUSE,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-reduction-famille-nombreuse',
      params: {
        message: 'Réduction famille nombreuse (3+ enfants) applicable',
        taux_reduction: GARDE_ENFANTS_CONSTANTS.REDUCTION_FAMILLE_NOMBREUSE,
      },
    },
    priority: 55,
  });

  // Rule 6: Plusieurs enfants en crèche simultanément - réduction 30% sur 2ème+
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nombre_enfants_creche',
          operator: 'greaterThanInclusive',
          value: 2,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-reduction-enfants-simultanes',
      params: {
        message: 'Réduction pour enfants simultanés en crèche',
        taux_reduction: GARDE_ENFANTS_CONSTANTS.REDUCTION_FAMILLE_NOMBREUSE,
        applique_sur: 'enfants à partir du 2ème',
      },
    },
    priority: 50,
  });

  // Rule 7: Gardienne privée agréée - éligible à déduction fiscale
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'type_garde',
          operator: 'equal',
          value: 'gardienne_privee',
        },
        {
          fact: 'gardienne_agreee',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'ageAnnees',
          operator: 'lessThanInclusive',
          value: GARDE_ENFANTS_CONSTANTS.AGE_MAX_DEDUCTION_FISCALE,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-eligible-deduction-privee',
      params: {
        message: 'Garde privée agréée éligible à la déduction fiscale',
        eligible_deduction_fiscale: true,
        max_deduction_jour: GARDE_ENFANTS_CONSTANTS.MAX_DEDUCTION_JOUR,
        taux_reduction_fiscale: GARDE_ENFANTS_CONSTANTS.TAUX_REDUCTION_FISCALE,
      },
    },
    priority: 45,
  });

  // Rule 8: Gardienne privée non agréée - non éligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'type_garde',
          operator: 'equal',
          value: 'gardienne_privee',
        },
        {
          fact: 'gardienne_agreee',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-ineligible-non-agreee',
      params: {
        reason: 'gardienne non agréée ONE/Kind en Gezin',
        eligible_deduction_fiscale: false,
      },
    },
    priority: 44,
  });

  // Rule 9: Crèche d'entreprise avec subvention employeur
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'type_garde',
          operator: 'equal',
          value: 'creche_entreprise',
        },
        {
          fact: 'taux_subvention_employeur',
          operator: 'greaterThan',
          value: 0,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-creche-entreprise',
      params: {
        message: 'Crèche d\'entreprise avec participation employeur',
        deduction_sur_part_payee: true,
      },
    },
    priority: 40,
  });

  // Rule 10: Secteur alimentaire - intervention Alimento
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'secteur_travail',
          operator: 'equal',
          value: 'alimentaire',
        },
      ],
    },
    event: {
      type: 'gardeEnfants-intervention-alimento',
      params: {
        message: 'Intervention Alimento disponible',
        montant_max_jour: GARDE_ENFANTS_CONSTANTS.INTERVENTION_ALIMENTO_MAX,
        documents_requis: ['attestations de paiement'],
      },
    },
    priority: 35,
  });

  // Rule 11: Garde crèche subventionnée ONE - éligible standard
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'garde_subventionnee',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'type_garde',
          operator: 'in',
          value: ['creche_one', 'accueillante_conventionnee'],
        },
        {
          fact: 'ageAnnees',
          operator: 'lessThanInclusive',
          value: GARDE_ENFANTS_CONSTANTS.AGE_MAX_DEDUCTION_FISCALE,
        },
        {
          fact: 'statut_bim',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-eligible',
      params: {
        message: 'Éligible aux aides pour garde d\'enfants',
        tarif_selon_revenus: true,
        eligible_deduction_fiscale: true,
        organisme: 'ONE',
      },
    },
    priority: 30,
  });

  // Rule 12: Garde crèche Kind en Gezin - éligible standard
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'garde_subventionnee',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'type_garde',
          operator: 'equal',
          value: 'creche_kind_en_gezin',
        },
        {
          fact: 'ageAnnees',
          operator: 'lessThanInclusive',
          value: GARDE_ENFANTS_CONSTANTS.AGE_MAX_DEDUCTION_FISCALE,
        },
        {
          fact: 'statut_bim',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-eligible',
      params: {
        message: 'Éligible aux aides pour garde d\'enfants',
        tarif_selon_revenus: true,
        eligible_deduction_fiscale: true,
        organisme: 'Kind en Gezin',
      },
    },
    priority: 30,
  });

  // Rule 13: Enfant malade - garde à domicile
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'enfant_malade',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-garde-malade',
      params: {
        message: 'Service garde enfants malades disponible via mutuelle',
        tarif_horaire_min: GARDE_ENFANTS_CONSTANTS.GARDE_MALADE_TARIF_MIN,
        tarif_horaire_max: GARDE_ENFANTS_CONSTANTS.GARDE_MALADE_TARIF_MAX,
        jours_max_an: GARDE_ENFANTS_CONSTANTS.GARDE_MALADE_JOURS_MAX,
      },
    },
    priority: 25,
  });

  // Rule 14: Chèques garde d'enfants Région wallonne
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'wallonie',
        },
        {
          fact: 'ageAnnees',
          operator: 'lessThan',
          value: 3,
        },
        {
          fact: 'reprise_activite',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-cheques-regionaux',
      params: {
        message: 'Chèques garde d\'enfants Région wallonne disponibles',
        duree_max_mois: 12,
        condition: 'reprise formation ou emploi',
      },
    },
    priority: 20,
  });

  // Rule 15: Cumul BIM + intervention employeur
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut_bim',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'intervention_employeur',
          operator: 'greaterThan',
          value: 0,
        },
      ],
    },
    event: {
      type: 'gardeEnfants-cumul-bim-employeur',
      params: {
        message: 'Garde gratuite (BIM) + intervention employeur acquise',
        gratuit: true,
        intervention_employeur_en_net: true,
        pas_de_deduction_fiscale: true,
      },
    },
    priority: 95,
  });

  return engine;
}

/**
 * Singleton instance of the GardeEnfants rules engine
 */
const gardeEnfantsEngineInstance = createGardeEnfantsEngine();

/**
 * Calculate Garde d'Enfants et Aides Financières amount
 */
export function calculateGardeEnfantsAmount(user: GardeEnfantsUser): GardeEnfantsResult {
  const reductions_appliquees: string[] = [];
  let gratuit = false;
  let eligible_deduction_fiscale = true;
  let motif_non_eligible: string | undefined;

  // Vérifier l'âge pour la déduction fiscale
  const ageAnnees = user.ageAnnees ?? Math.floor(user.age / 12);
  if (ageAnnees > GARDE_ENFANTS_CONSTANTS.AGE_MAX_DEDUCTION_FISCALE) {
    eligible_deduction_fiscale = false;
    motif_non_eligible = 'enfant de plus de 12 ans';
  }

  // Statut BIM = gratuit
  if (user.statut_bim && user.garde_subventionnee) {
    gratuit = true;
    reductions_appliquees.push('Gratuité statut BIM');

    return {
      tarif_journalier_base: 0,
      tarif_journalier_apres_reductions: 0,
      cout_net_apres_deduction_fiscale: 0,
      deduction_fiscale_jour: 0,
      deduction_fiscale_annuelle: 0,
      reduction_impot_annuelle: 0,
      reductions_appliquees,
      eligible_deduction_fiscale: false, // Déjà gratuit, pas de déduction
      gratuit: true,
      intervention_employeur: user.intervention_employeur || 0,
    };
  }

  // Calculer le tarif de base selon le type de garde
  let tarif_journalier_base: number;

  if (user.tarif_journalier !== undefined) {
    tarif_journalier_base = user.tarif_journalier;
  } else if (user.type_garde === 'creche_one' || user.type_garde === 'accueillante_conventionnee') {
    tarif_journalier_base = calculerTarifONE(user.revenus_annuels_nets);
  } else if (user.type_garde === 'creche_kind_en_gezin') {
    tarif_journalier_base = calculerTarifKindEnGezin(user.revenus_annuels_nets);
  } else if (user.type_garde === 'gardienne_privee') {
    tarif_journalier_base = 30; // Tarif moyen gardienne privée
  } else if (user.type_garde === 'accueillante_libre') {
    tarif_journalier_base = 32; // Tarif moyen accueillante libre
  } else {
    tarif_journalier_base = 25; // Défaut
  }

  let tarif_apres_reductions = tarif_journalier_base;

  // Crèche d'entreprise avec subvention
  if (user.type_garde === 'creche_entreprise' && user.taux_subvention_employeur) {
    const reduction_entreprise = tarif_journalier_base * user.taux_subvention_employeur;
    tarif_apres_reductions -= reduction_entreprise;
    reductions_appliquees.push(`Subvention employeur ${user.taux_subvention_employeur * 100}%`);
  }

  // Réduction temps partiel
  if (user.heures_presence_jour > 0 && user.heures_presence_jour <= GARDE_ENFANTS_CONSTANTS.SEUIL_TEMPS_PARTIEL_HEURES) {
    tarif_apres_reductions *= (1 - GARDE_ENFANTS_CONSTANTS.REDUCTION_TEMPS_PARTIEL);
    reductions_appliquees.push('Réduction temps partiel -40%');
  }

  // Réduction parent isolé
  if (user.parent_isole) {
    tarif_apres_reductions *= (1 - GARDE_ENFANTS_CONSTANTS.REDUCTION_PARENT_ISOLE);
    reductions_appliquees.push('Réduction parent isolé -30%');
  }

  // Réduction famille nombreuse (3+ enfants)
  if (user.nombre_enfants >= GARDE_ENFANTS_CONSTANTS.SEUIL_FAMILLE_NOMBREUSE) {
    tarif_apres_reductions *= (1 - GARDE_ENFANTS_CONSTANTS.REDUCTION_FAMILLE_NOMBREUSE);
    reductions_appliquees.push('Réduction famille nombreuse -30%');
  }

  // Arrondir à 2 décimales
  tarif_apres_reductions = Math.round(tarif_apres_reductions * 100) / 100;

  // Intervention employeur (Alimento ou autre)
  let intervention_employeur = user.intervention_employeur || 0;
  if (user.secteur_travail === 'alimentaire' && !user.intervention_employeur) {
    intervention_employeur = GARDE_ENFANTS_CONSTANTS.INTERVENTION_ALIMENTO_MAX;
    reductions_appliquees.push(`Intervention Alimento ${intervention_employeur}€/jour`);
  }

  // Calcul déduction fiscale
  let deduction_fiscale_jour = 0;
  let cout_net_apres_deduction = tarif_apres_reductions;

  if (eligible_deduction_fiscale && tarif_apres_reductions > 0) {
    // Vérifier si la gardienne est agréée pour garde privée
    if (user.type_garde === 'gardienne_privee' && !user.gardienne_agreee) {
      eligible_deduction_fiscale = false;
      motif_non_eligible = 'gardienne non agréée ONE/Kind en Gezin';
    } else {
      // La déduction est limitée au montant max
      deduction_fiscale_jour = Math.min(tarif_apres_reductions, GARDE_ENFANTS_CONSTANTS.MAX_DEDUCTION_JOUR);
      // Le coût net = tarif - (déduction × taux)
      const reduction_fiscale_jour = deduction_fiscale_jour * GARDE_ENFANTS_CONSTANTS.TAUX_REDUCTION_FISCALE;
      cout_net_apres_deduction = tarif_apres_reductions - reduction_fiscale_jour;
    }
  }

  cout_net_apres_deduction = Math.round(cout_net_apres_deduction * 100) / 100;

  // Calculs annuels
  const jours_garde = user.jours_garde_annuels || 220; // Défaut: 220 jours/an
  const deduction_fiscale_annuelle = Math.round(deduction_fiscale_jour * jours_garde * 100) / 100;
  const reduction_impot_annuelle = Math.round(deduction_fiscale_annuelle * GARDE_ENFANTS_CONSTANTS.TAUX_REDUCTION_FISCALE * 100) / 100;

  return {
    tarif_journalier_base,
    tarif_journalier_apres_reductions: tarif_apres_reductions,
    cout_net_apres_deduction_fiscale: cout_net_apres_deduction,
    deduction_fiscale_jour,
    deduction_fiscale_annuelle,
    reduction_impot_annuelle,
    reductions_appliquees,
    eligible_deduction_fiscale,
    motif_non_eligible,
    gratuit,
    intervention_employeur,
  };
}

/**
 * Calcule le coût net pour plusieurs enfants en crèche
 */
export function calculateCoutMultipleEnfants(user: GardeEnfantsUser): {
  cout_total_jour: number;
  cout_net_total: number;
  details_par_enfant: Array<{ enfant: number; tarif: number; reductions: string[] }>;
} {
  const details: Array<{ enfant: number; tarif: number; reductions: string[] }> = [];
  let cout_total_jour = 0;

  for (let i = 0; i < user.nombre_enfants_creche; i++) {
    let tarif_enfant: number;
    const reductions: string[] = [];

    if (user.type_garde === 'creche_one' || user.type_garde === 'accueillante_conventionnee') {
      tarif_enfant = calculerTarifONE(user.revenus_annuels_nets);
    } else if (user.type_garde === 'creche_kind_en_gezin') {
      tarif_enfant = calculerTarifKindEnGezin(user.revenus_annuels_nets);
    } else {
      tarif_enfant = user.tarif_journalier || 20;
    }

    // Réduction pour 2ème enfant et suivants
    if (i >= 1) {
      tarif_enfant *= (1 - GARDE_ENFANTS_CONSTANTS.REDUCTION_FAMILLE_NOMBREUSE);
      reductions.push('Réduction 2ème enfant simultané -30%');
    }

    tarif_enfant = Math.round(tarif_enfant * 100) / 100;
    cout_total_jour += tarif_enfant;

    details.push({
      enfant: i + 1,
      tarif: tarif_enfant,
      reductions,
    });
  }

  // Calcul du coût net après déduction fiscale
  const deduction_totale = Math.min(cout_total_jour, GARDE_ENFANTS_CONSTANTS.MAX_DEDUCTION_JOUR * user.nombre_enfants_creche);
  const cout_net_total = cout_total_jour - (deduction_totale * GARDE_ENFANTS_CONSTANTS.TAUX_REDUCTION_FISCALE);

  return {
    cout_total_jour: Math.round(cout_total_jour * 100) / 100,
    cout_net_total: Math.round(cout_net_total * 100) / 100,
    details_par_enfant: details,
  };
}

/**
 * Check Garde d'Enfants et Aides Financières eligibility
 */
export async function checkGardeEnfantsEligibility(