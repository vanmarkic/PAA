/**
 * Business Rules for Congé Parental
 *
 * Implements the Gherkin specifications from features/benefits/conge-parental.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Arrêté royal du 29 octobre 1997 relatif à l'introduction d'un droit au congé parental
 * - Loi du 22 janvier 1985 de redressement contenant des dispositions sociales (crédit-temps)
 * - Convention collective de travail n°64 du 29 avril 1997
 * - Réglementation ONEM sur les allocations d'interruption
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * CongeParental Rules Version Metadata
 * This version MUST match the specification version in features/benefits/conge-parental.feature
 */
export const CONGE_PARENTAL_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/conge-parental.feature',
  generatedFrom: 'features/benefits/conge-parental.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2025-12-13',
};

// Constants from Belgian social law - ONEM 2024 rates
export const CONGE_PARENTAL_CONSTANTS = {
  MIN_ANCIENNETE_MOIS: 12,
  AGE_LIMITE_ENFANT: 12,
  AGE_LIMITE_ENFANT_HANDICAP: 21,
  TAUX_HANDICAP_MINIMUM: 66,
  DELAI_NOTIFICATION_MOIS: 2,
  DELAI_NOTIFICATION_PME_MOIS: 3,
  PROTECTION_APRES_CONGE_MOIS: 3,
  PERIODE_MINIMUM_FRACTIONNEMENT_MOIS: 1,
};

export const CONGE_PARENTAL_FORMULES = {
  TEMPS_PLEIN: {
    code: 'temps_plein',
    dureeMois: 4,
    description: 'Suspension complète du travail',
    reductionHoraire: 100,
  },
  MI_TEMPS: {
    code: 'mi_temps',
    dureeMois: 8,
    description: 'Réduction à 50% du temps',
    reductionHoraire: 50,
  },
  UN_CINQUIEME: {
    code: '1/5_temps',
    dureeMois: 20,
    description: "Réduction d'1 jour par semaine",
    reductionHoraire: 20,
  },
  UN_DIXIEME: {
    code: '1/10_temps',
    dureeMois: 40,
    description: "Réduction d'1 demi-jour/semaine",
    reductionHoraire: 10,
  },
};

export const ALLOCATIONS_ONEM_2024 = {
  temps_plein: {
    parent_couple: 879.15,
    parent_isole: 1000.0,
  },
  mi_temps: {
    parent_couple: 439.58,
    parent_isole: 500.0,
  },
  '1/5_temps': {
    parent_couple: 148.74,
    parent_isole: 170.0,
  },
  '1/10_temps': {
    parent_couple: 74.37,
    parent_isole: 85.0,
  },
};

export type FormuleCongeParental = 'temps_plein' | 'mi_temps' | '1/5_temps' | '1/10_temps';
export type SituationFamiliale = 'parent_couple' | 'parent_isole';
export type TypeContrat = 'temps_plein' | 'temps_partiel';

export interface CongeParentalUser {
  ageEnfant: number;
  enfantHandicape: boolean;
  tauxHandicap?: number;
  ancienneteMois: number;
  typeContrat: TypeContrat;
  heuresParSemaine?: number;
  situationFamiliale: SituationFamiliale;
  gardeExclusive?: boolean;
  formuleChoisie: FormuleCongeParental;
  congeParentalDejaPris: boolean;
  moisCongeParentalPris?: number;
  enfantAdopte?: boolean;
  dateAdoption?: Date;
  enCongeParental?: boolean;
  notificationEmployeur?: boolean;
  demandeCoronaCongé?: boolean;
  anneeEnCours?: number;
}

/**
 * Create the CongeParental eligibility rules engine
 */
function createCongeParentalEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age enfant - non éligible si enfant de plus de 12 ans (sans handicap)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'ageEnfant',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT,
        },
        {
          fact: 'enfantHandicape',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'congeParental-ineligible',
      params: {
        reason: 'enfant de plus de 12 ans',
        suggestion: 'explorer d\'autres formes de crédit-temps',
      },
    },
    priority: 100,
  });

  // Rule 2: Age enfant handicapé - non éligible si plus de 21 ans
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'ageEnfant',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT_HANDICAP,
        },
        {
          fact: 'enfantHandicape',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeParental-ineligible',
      params: {
        reason: 'enfant handicapé de plus de 21 ans',
      },
    },
    priority: 99,
  });

  // Rule 3: Ancienneté insuffisante
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'ancienneteMois',
          operator: 'lessThan',
          value: CONGE_PARENTAL_CONSTANTS.MIN_ANCIENNETE_MOIS,
        },
      ],
    },
    event: {
      type: 'congeParental-ineligible',
      params: {
        reason: 'ancienneté insuffisante (12 mois requis)',
        moisRestants: true,
      },
    },
    priority: 98,
  });

  // Rule 4: Congé corona - mesure expirée
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'demandeCoronaCongé',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'anneeEnCours',
          operator: 'greaterThanInclusive',
          value: 2024,
        },
      ],
    },
    event: {
      type: 'congeParental-ineligible',
      params: {
        reason: 'congé parental corona - mesure temporaire expirée',
        suggestion: 'utiliser le congé parental classique',
        mesureExpiree: true,
      },
    },
    priority: 97,
  });

  // Rule 5: Temps partiel - options limitées pour 1/5 temps
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeContrat',
          operator: 'equal',
          value: 'temps_partiel',
        },
        {
          fact: 'formuleChoisie',
          operator: 'equal',
          value: '1/5_temps',
        },
      ],
    },
    event: {
      type: 'congeParental-ineligible',
      params: {
        reason: 'temps partiel incompatible avec formule 1/5 temps',
        suggestion: 'opter pour un congé complet ou mi-temps adapté',
        optionsLimitees: true,
      },
    },
    priority: 96,
  });

  // Rule 6: Temps partiel - options limitées pour 1/10 temps
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeContrat',
          operator: 'equal',
          value: 'temps_partiel',
        },
        {
          fact: 'formuleChoisie',
          operator: 'equal',
          value: '1/10_temps',
        },
      ],
    },
    event: {
      type: 'congeParental-ineligible',
      params: {
        reason: 'temps partiel incompatible avec formule 1/10 temps',
        suggestion: 'opter pour un congé complet ou mi-temps adapté',
        optionsLimitees: true,
      },
    },
    priority: 95,
  });

  // Rule 7: Protection contre licenciement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'enCongeParental',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'notificationEmployeur',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeParental-protection',
      params: {
        protectionActive: true,
        message: 'protection contre le licenciement active',
        dureeProtectionApresCongeMois: CONGE_PARENTAL_CONSTANTS.PROTECTION_APRES_CONGE_MOIS,
        exceptions: ['motif grave', 'raisons économiques'],
      },
    },
    priority: 50,
  });

  // Rule 8: Éligibilité parent temps plein - congé temps plein
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeContrat',
          operator: 'equal',
          value: 'temps_plein',
        },
        {
          fact: 'ageEnfant',
          operator: 'lessThan',
          value: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT,
        },
        {
          fact: 'enfantHandicape',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.MIN_ANCIENNETE_MOIS,
        },
        {
          fact: 'formuleChoisie',
          operator: 'equal',
          value: 'temps_plein',
        },
      ],
    },
    event: {
      type: 'congeParental-eligible',
      params: {
        formule: 'temps_plein',
        dureeMois: CONGE_PARENTAL_FORMULES.TEMPS_PLEIN.dureeMois,
        contratSuspenduMaisProtege: true,
      },
    },
    priority: 10,
  });

  // Rule 9: Éligibilité parent temps plein - congé mi-temps
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeContrat',
          operator: 'equal',
          value: 'temps_plein',
        },
        {
          fact: 'ageEnfant',
          operator: 'lessThan',
          value: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT,
        },
        {
          fact: 'enfantHandicape',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.MIN_ANCIENNETE_MOIS,
        },
        {
          fact: 'formuleChoisie',
          operator: 'equal',
          value: 'mi_temps',
        },
      ],
    },
    event: {
      type: 'congeParental-eligible',
      params: {
        formule: 'mi_temps',
        dureeMois: CONGE_PARENTAL_FORMULES.MI_TEMPS.dureeMois,
        reductionHoraire: 50,
      },
    },
    priority: 9,
  });

  // Rule 10: Éligibilité parent temps plein - congé 1/5 temps
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeContrat',
          operator: 'equal',
          value: 'temps_plein',
        },
        {
          fact: 'ageEnfant',
          operator: 'lessThan',
          value: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT,
        },
        {
          fact: 'enfantHandicape',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.MIN_ANCIENNETE_MOIS,
        },
        {
          fact: 'formuleChoisie',
          operator: 'equal',
          value: '1/5_temps',
        },
      ],
    },
    event: {
      type: 'congeParental-eligible',
      params: {
        formule: '1/5_temps',
        dureeMois: CONGE_PARENTAL_FORMULES.UN_CINQUIEME.dureeMois,
        joursParSemaine: 4,
      },
    },
    priority: 8,
  });

  // Rule 11: Éligibilité parent temps plein - congé 1/10 temps
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeContrat',
          operator: 'equal',
          value: 'temps_plein',
        },
        {
          fact: 'ageEnfant',
          operator: 'lessThan',
          value: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT,
        },
        {
          fact: 'enfantHandicape',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.MIN_ANCIENNETE_MOIS,
        },
        {
          fact: 'formuleChoisie',
          operator: 'equal',
          value: '1/10_temps',
        },
      ],
    },
    event: {
      type: 'congeParental-eligible',
      params: {
        formule: '1/10_temps',
        dureeMois: CONGE_PARENTAL_FORMULES.UN_DIXIEME.dureeMois,
      },
    },
    priority: 7,
  });

  // Rule 12: Éligibilité enfant handicapé jusqu'à 21 ans
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'enfantHandicape',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'tauxHandicap',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.TAUX_HANDICAP_MINIMUM,
        },
        {
          fact: 'ageEnfant',
          operator: 'lessThan',
          value: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT_HANDICAP,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.MIN_ANCIENNETE_MOIS,
        },
      ],
    },
    event: {
      type: 'congeParental-eligible',
      params: {
        enfantHandicape: true,
        ageLimite: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT_HANDICAP,
        amenagementsSupplémentaires: true,
      },
    },
    priority: 15,
  });

  // Rule 13: Parent isolé avec majoration
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'parent_isole',
        },
        {
          fact: 'gardeExclusive',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.MIN_ANCIENNETE_MOIS,
        },
        {
          fact: 'ageEnfant',
          operator: 'lessThan',
          value: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT,
        },
      ],
    },
    event: {
      type: 'congeParental-majoration',
      params: {
        majoration: true,
        raison: 'parent isolé avec garde exclusive',
        compensationMonoparentale: true,
      },
    },
    priority: 20,
  });

  // Rule 14: Adoption - mêmes droits
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'enfantAdopte',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'ageEnfant',
          operator: 'lessThan',
          value: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.MIN_ANCIENNETE_MOIS,
        },
      ],
    },
    event: {
      type: 'congeParental-eligible',
      params: {
        adoption: true,
        memeDroits: true,
        ageLimite: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT,
      },
    },
    priority: 12,
  });

  // Rule 15: Temps partiel - éligible pour temps plein ou mi-temps adapté
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeContrat',
          operator: 'equal',
          value: 'temps_partiel',
        },
        {
          fact: 'ageEnfant',
          operator: 'lessThan',
          value: CONGE_PARENTAL_CONSTANTS.AGE_LIMITE_ENFANT,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CONGE_PARENTAL_CONSTANTS.MIN_ANCIENNETE_MOIS,
        },
        {
          any: [
            {
              fact: 'formuleChoisie',
              operator: 'equal',
              value: 'temps_plein',
            },
            {
              fact: 'formuleChoisie',
              operator: 'equal',
              value: 'mi_temps',
            },
          ],
        },
      ],
    },
    event: {
      type: 'congeParental-eligible',
      params: {
        tempsPartiel: true,
        optionsLimitees: true,
        allocationsProportionnelles: true,
      },
    },
    priority: 6,
  });

  return engine;
}

/**
 * Singleton instance of the CongeParental rules engine
 */
const congeParentalEngineInstance = createCongeParentalEngine();

/**
 * Calculate Congé Parental amount
 */
export function calculateCongeParentalAmount(
  formule: FormuleCongeParental,
  situationFamiliale: SituationFamiliale,
  typeContrat: TypeContrat = 'temps_plein',
  heuresParSemaine?: number
): number {
  const allocations = ALLOCATIONS_ONEM_2024[formule];
  
  if (!allocations) {
    return 0;
  }

  let montantBase = allocations[situationFamiliale];

  // Calcul proportionnel pour temps partiel
  if (typeContrat === 'temps_partiel' && heuresParSemaine) {
    const heuresTempsPlein = 38; // Semaine légale en Belgique
    const ratio = heuresParSemaine / heuresTempsPlein;
    montantBase = Math.round(montantBase * ratio * 100) / 100;
  }

  return montantBase;
}

/**
 * Get duration for formula
 */
export function getDureeConge(formule: FormuleCongeParental): number {
  switch (formule) {
    case 'temps_plein':
      return CONGE_PARENTAL_FORMULES.TEMPS_PLEIN.dureeMois;
    case 'mi_temps':
      return CONGE_PARENTAL_FORMULES.MI_TEMPS.dureeMois;
    case '1/5_temps':
      return CONGE_PARENTAL_FORMULES.UN_CINQUIEME.dureeMois;
    case '1/10_temps':
      return CONGE_PARENTAL_FORMULES.UN_DIXIEME.dureeMois;
    default:
      return 0;
  }
}

/**
 * Calculate months remaining before eligibility
 */
export function calculateMoisRestantsAvantEligibilite(ancienneteMois: number): number {
  const moisManquants = CONGE_PARENTAL_CONSTANTS.MIN_ANCIENNETE_MOIS - ancienneteMois;
  return moisManquants > 0 ? moisManquants : 0;
}

/**
 * Check Congé Parental eligibility
 */
export async function checkCongeParentalEligibility(
  user: CongeParentalUser
): Promise<EligibilityCheck> {
  const facts = {
    ageEnfant: user.ageEnfant,
    enfantHandicape: user.enfantHandicape,
    tauxHandicap: user.tauxHandicap || 0,
    ancienneteMois: user.ancienneteMois,
    typeContrat: user.typeContrat,
    heuresParSemaine: user.heuresParSemaine || 38,
    situationFamiliale: user.situationFamiliale,
    gardeExclusive: user.gardeExclusive || false,
    formuleChoisie: user.formuleChoisie,
    congeParentalDejaPris: user.congeParentalDejaPris,
    moisCongeParentalPris: user.moisCongeParentalPris || 0,
    enfantAdopte: user.enfantAdopte || false,
    enCongeParental: user.enCongeParental || false,
    notificationEmployeur: user.notificationEmployeur || false,
    demandeCoronaCongé: user.demandeCoronaCongé || false,
    anneeEnCours: user.anneeEnCours || new Date().getFullYear(),
  };

  try {
    const results = await congeParentalEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'congeParental-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'congeParental-eligible');
    const majorationEvent = results.events.find((e) => e.type === 'congeParental-majoration');
    const protectionEvent = results.events.find((e) => e.type === 'congeParental-protection');

    if (ineligibleEvent) {
      const params = ineligibleEvent.params as Record<string, unknown>;
      const result: EligibilityCheck = {
        benefitType: 'conge-parental' as any,
        isEligible: false,
        reason: params?.reason as string,
      };

      // Add remaining months info if ancienneté is the issue
      if (params?.moisRestants) {
        (result as any).moisRestantsAvantEligibilite = calculateMoisRestantsAvantEligibilite(user.ancienneteMois);
      }

      // Add suggestion if available
      if (params?.suggestion) {
        (result as any).suggestion = params.suggestion;
      }

      return result;
    }

    if (eligibleEvent) {
      const params = eligibleEvent.params as Record<string, unknown>;
      const montant = calculateCongeParentalAmount(
        user.formuleChoisie,
        user.situationFamiliale,
        user.typeContrat,
        user.heuresParSemaine
      );

      const result: EligibilityCheck = {
        benefitType: 'conge-parental' as any,
        isEligible: true,
        calculatedAmount: montant,
      };

      // Add additional info
      (result as any).formule = user.formuleChoisie;
      (result as any).dureeMois = getDureeConge(user.formuleChoisie);
      (result as any).allocationMensuelle = montant;

      // Add majoration info if applicable
      if (majorationEvent) {
        const majorationParams = majorationEvent.params as Record<string, unknown>;
        (result as any).majoration = true;
        (result as any).raisonMajoration = majorationParams?.raison;
      }

      // Add protection info if applicable
      if (protectionEvent) {
        const protectionParams = protectionEvent.params as Record<string, unknown>;
        (result as any).protectionContreLicenciement = true;
        (result as any).dureeProtectionApresCongeMois = protectionParams?.dureeProtectionApresCongeMois;
        (result as any).exceptionsProtection = protectionParams?.exceptions;
      }

      // Add formula-specific info
      if (params?.contratSuspenduMaisProtege) {
        (result as any).contratSuspenduMaisProtege = true;
      }
      if (params?.reductionHoraire) {
        (result as any).reductionHoraire = params.reductionHoraire;
      }
      if (params?.joursParSemaine) {
        (result as any).joursParSemaine = params.joursParSemaine;
      }
      if (params?.enfantHandicape) {
        (result as any).enfantHandicape = true;
        (result as any).ageLimiteEnfant = params.ageLimite;
        (result as any).amenagementsSupplémentaires = params.amenagementsSupplémentaires;
      }
      if (params?.adoption) {
        (result as any).adoption = true;
        (result as any).memeDroitsQueEnfantBiologique = params.memeDroits;
      }
      if (params?.tempsPartiel) {
        (result as any).tempsPartiel = true;
        (result as any).allocationsProportionnelles = params.allocationsProportionnelles;
      }

      return result;
    }

    return {
      benefitType: 'conge-parental' as any,
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Congé Parental eligibility: ${error}`);
  }
}

/**
 * Get procedure steps for parental leave application
 */
export function getProcedureCongeParental(isPME: boolean = false): Array<{ etape: string; delai: string }> {
  const delaiNotification = isPME 
    ? `${CONGE_PARENTAL_CONSTANTS.DELAI_NOTIFICATION_PME_MOIS} mois avant`
    : `${CONGE_PARENTAL_CONSTANTS.DELAI_NOTIFICATION_MOIS} mois avant`;

  return [
    { etape: 'Avertir l\'employeur par écrit', delai: delaiNotification },
    { etape: 'Préciser la formule choisie', delai: 'Dans la demande initiale' },
    { etape: 'Fournir preuve de filiation', delai: 'Acte de naissance ou adoption' },
    { etape: 'Remplir formulaire ONEM C61', delai: 'Au début du congé' },
    { etape: 'Faire compléter partie par employeur', delai: 'Avant envoi à l\'ONEM' },
  ];
}

/**
 * Check fractionnement eligibility
 */
export function checkFractionnementEligibility(
  dureeTotaleMois: number,
  periodesDemandees: number[]
): { eligible: boolean; raison?: string } {
  // Each period must be at least 1 month
  const periodeTropCourte = periodesDemandees.some(
    p => p < CONGE_PARENTAL_CONSTANTS.PERIODE_MINIMUM_FRACTIONNEMENT_MOIS
  );
  
  if (periodeTropCourte) {
    return {
      eligible: false,
      raison: `Chaque période doit être d'au moins ${CONGE_PARENTAL_CONSTANTS.PERIODE_MINIMUM_FRACTIONNEMENT_MOIS} mois`,
    };
  }

  // Total cannot exceed entitled duration
  const totalDemande = periodesDemandees.reduce((a, b) => a + b, 0);
  if (totalDemande > dureeTotaleMois) {
    return {
      eligible: false,
      raison: `Le total (${totalDemande} mois) ne peut excéder ${dureeTotaleMois} mois`,
    };
  }

  return {
    eligible: true,
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const CONGE_PARENTAL_RULES_JSON = {
  legalFramework: {
    primaryLaw: 'Arrêté royal du 29 octobre 1997 relatif à l\'introduction d\'un droit au congé parental',
    supplementaryLaws: [
      'Loi du 22 janvier 1985 de redressement contenant des dispositions sociales',
      'Convention collective de travail n°64 du 29 avril 1997',
    ],
  },
};