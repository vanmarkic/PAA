/**
 * Business Rules for Crédit-temps et Interruption de Carrière
 *
 * Implements the Gherkin specifications from features/benefits/credit-temps.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Loi du 10 août 2001 relative à la conciliation entre l'emploi et la qualité de vie
 * - Arrêté royal du 12 décembre 2001 pris en exécution du chapitre IV de la loi du 10 août 2001
 * - CCT n°103 du 27 juin 2012 instaurant un système de crédit-temps
 * - Arrêté royal du 2 janvier 1991 relatif à l'interruption de carrière (secteur public)
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * CreditTemps Rules Version Metadata
 * This version MUST match the specification version in features/benefits/credit-temps.feature
 */
export const CREDIT_TEMPS_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/credit-temps.feature',
  generatedFrom: 'features/benefits/credit-temps.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law
export const CREDIT_TEMPS_CONSTANTS = {
  // Age requirements
  MIN_AGE_FIN_CARRIERE_1_5: 55,
  MIN_AGE_FIN_CARRIERE_1_2: 60,
  
  // Seniority requirements
  MIN_ANCIENNETE_EMPLOYEUR_MOIS: 24,
  MIN_CARRIERE_FIN_CARRIERE_ANNEES: 25,
  
  // Duration limits (months)
  MAX_CREDIT_TEMPS_AVEC_MOTIF: 51,
  MAX_CONGE_PARENTAL_PAR_ENFANT: 4,
  MAX_CONGE_SOINS: 51,
  MAX_ASSISTANCE_MEDICALE: 12,
  MAX_ASSISTANCE_MEDICALE_PROLONGE: 24,
  MAX_SOINS_PALLIATIFS: 1,
  MAX_SOINS_PALLIATIFS_PROLONGE: 2,
  MAX_INTERRUPTION_CARRIERE_PUBLIC: 60,
  MAX_CREDIT_TEMPS_FORMATION: 36,
  
  // Age limits for parental leave
  MAX_AGE_ENFANT_CONGE_PARENTAL: 12,
  MAX_AGE_ENFANT_HANDICAPE: 21,
  
  // Employer thresholds
  SEUIL_PME: 10,
  MAX_REPORT_PME_MOIS: 6,
  
  // Processing time
  DELAI_TRAITEMENT_JOURS: 30,
  
  // Protection period (months)
  PROTECTION_LICENCIEMENT_MOIS: 3,
};

// Allocation amounts (2024 - net monthly)
export const CREDIT_TEMPS_ALLOCATIONS = {
  congeParental: {
    tempPlein: {
      isole: 899.20,
      cohabitant: 899.20,
    },
    miTemps: {
      isole: 449.60,
      cohabitant: 449.60,
    },
    unCinquieme: {
      isole: 179.84,
      cohabitant: 179.84,
    },
  },
  assistanceMedicale: {
    tempPlein: {
      isole: 1328.20,
      cohabitant: 1062.56,
    },
    miTemps: {
      isole: 664.10,
      cohabitant: 531.28,
    },
    unCinquieme: {
      isole: 179.84,
      cohabitant: 143.87,
    },
  },
  soinsPalliatifs: {
    tempPlein: {
      isole: 1528.78,
      cohabitant: 1528.78,
    },
    miTemps: {
      isole: 764.39,
      cohabitant: 764.39,
    },
    unCinquieme: {
      isole: 305.76,
      cohabitant: 305.76,
    },
  },
  finCarriere: {
    miTemps: {
      isole: 664.10,
      cohabitant: 531.28,
    },
    unCinquieme: {
      isole: 271.15,
      cohabitant: 216.92,
    },
  },
  interruptionCarrierePublic: {
    tempPlein: {
      isole: 766.42,
      cohabitant: 613.14,
    },
    miTemps: {
      isole: 383.21,
      cohabitant: 306.57,
    },
    unCinquieme: {
      isole: 153.28,
      cohabitant: 122.63,
    },
  },
  creditTempsFormation: {
    miTemps: {
      isole: 664.10,
      cohabitant: 531.28,
    },
    unCinquieme: {
      isole: 179.84,
      cohabitant: 143.87,
    },
  },
};

// Leave types
export type TypeConge = 
  | 'conge_parental'
  | 'assistance_medicale'
  | 'soins_palliatifs'
  | 'fin_carriere'
  | 'interruption_carriere'
  | 'credit_temps_formation'
  | 'credit_temps_sans_motif';

export type TypeReduction = 'temps_plein' | 'mi_temps' | 'un_cinquieme';

export type SituationFamiliale = 'isole' | 'cohabitant';

export type Secteur = 'prive' | 'public';

export interface CreditTempsUser {
  age: number;
  ancienneteMois: number;
  carriereAnnees: number;
  secteur: Secteur;
  situationFamiliale: SituationFamiliale;
  tempsPlein: boolean;
  ageEnfant?: number;
  enfantHandicape?: boolean;
  certificatMedical?: boolean;
  parentMalade?: boolean;
  parentEnPhaseTerminale?: boolean;
  formationReconnue?: boolean;
  motifValable?: boolean;
  nombreEmployeur: number;
  fonctionnaireStatutaire?: boolean;
  accordEmployeur?: boolean;
  congeParentalDejaPris?: number;
  creditTempsDejaPris?: number;
  applicationBreakAtWork?: boolean;
  datesDemande?: Date;
}

export interface CreditTempsEligibilityResult extends EligibilityCheck {
  typeConge?: TypeConge;
  reduction?: TypeReduction;
  dureeMaximale?: string;
  montantMensuel?: number;
  protectionLicenciement?: boolean;
  dureeProtection?: string;
  employeurPeutRefuser?: boolean;
  delaiReport?: string;
  obligations?: string[];
  documentsRequis?: string[];
}

/**
 * Create the CreditTemps eligibility rules engine
 */
function createCreditTempsEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Credit-temps sans motif - REFUSED since 2017
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'credit_temps_sans_motif',
        },
        {
          fact: 'motifValable',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'creditTemps-ineligible',
      params: {
        reason: 'absence de motif valable depuis la réforme 2017',
        message: 'Le crédit-temps sans motif est supprimé depuis avril 2017',
      },
    },
    priority: 100,
  });

  // Rule 2: Congé parental - Basic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'conge_parental',
        },
        {
          fact: 'ageEnfant',
          operator: 'lessThanInclusive',
          value: CREDIT_TEMPS_CONSTANTS.MAX_AGE_ENFANT_CONGE_PARENTAL,
        },
        {
          fact: 'congeParentalDejaPris',
          operator: 'lessThan',
          value: CREDIT_TEMPS_CONSTANTS.MAX_CONGE_PARENTAL_PAR_ENFANT,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CREDIT_TEMPS_CONSTANTS.MIN_ANCIENNETE_EMPLOYEUR_MOIS,
        },
      ],
    },
    event: {
      type: 'creditTemps-eligible',
      params: {
        typeConge: 'conge_parental',
        dureeMaximale: '4 mois',
        employeurPeutRefuser: false,
        protectionLicenciement: true,
        dureeProtection: '3 mois après la fin du congé',
        message: 'Éligible au congé parental',
      },
    },
    priority: 90,
  });

  // Rule 3: Congé parental - PME can defer
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'conge_parental',
        },
        {
          fact: 'nombreEmployeur',
          operator: 'lessThan',
          value: CREDIT_TEMPS_CONSTANTS.SEUIL_PME,
        },
      ],
    },
    event: {
      type: 'creditTemps-pme-defer',
      params: {
        employeurPeutReporter: true,
        delaiReport: '6 mois maximum',
        justification: 'organisation du travail',
        message: 'Employeur PME peut reporter la demande',
      },
    },
    priority: 89,
  });

  // Rule 4: Assistance médicale eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'assistance_medicale',
        },
        {
          fact: 'certificatMedical',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'parentMalade',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CREDIT_TEMPS_CONSTANTS.MIN_ANCIENNETE_EMPLOYEUR_MOIS,
        },
      ],
    },
    event: {
      type: 'creditTemps-eligible',
      params: {
        typeConge: 'assistance_medicale',
        dureeMaximale: '12 mois (prolongeable à 24)',
        documentsRequis: ['certificat médical tous les 3 mois'],
        protectionLicenciement: true,
        message: 'Éligible au crédit-temps pour assistance médicale',
      },
    },
    priority: 85,
  });

  // Rule 5: Soins palliatifs eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'soins_palliatifs',
        },
        {
          fact: 'certificatMedical',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'parentEnPhaseTerminale',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'creditTemps-eligible',
      params: {
        typeConge: 'soins_palliatifs',
        dureeMaximale: '1 mois (prolongeable 1 fois)',
        employeurPeutRefuser: false,
        protectionLicenciement: true,
        fractionnable: true,
        message: 'Éligible au congé pour soins palliatifs',
      },
    },
    priority: 95,
  });

  // Rule 6: Fin de carrière 1/5 temps (55+)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'fin_carriere',
        },
        {
          fact: 'reduction',
          operator: 'equal',
          value: 'un_cinquieme',
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: CREDIT_TEMPS_CONSTANTS.MIN_AGE_FIN_CARRIERE_1_5,
        },
        {
          fact: 'carriereAnnees',
          operator: 'greaterThanInclusive',
          value: CREDIT_TEMPS_CONSTANTS.MIN_CARRIERE_FIN_CARRIERE_ANNEES,
        },
        {
          fact: 'secteur',
          operator: 'equal',
          value: 'prive',
        },
        {
          fact: 'accordEmployeur',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'creditTemps-eligible',
      params: {
        typeConge: 'fin_carriere',
        reduction: 'un_cinquieme',
        dureeMaximale: "jusqu'à pension",
        cumulSalaireReduit: true,
        message: 'Éligible au crédit-temps fin de carrière 1/5 temps',
      },
    },
    priority: 80,
  });

  // Rule 7: Fin de carrière 1/2 temps (60+)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'fin_carriere',
        },
        {
          fact: 'reduction',
          operator: 'equal',
          value: 'mi_temps',
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: CREDIT_TEMPS_CONSTANTS.MIN_AGE_FIN_CARRIERE_1_2,
        },
        {
          fact: 'carriereAnnees',
          operator: 'greaterThanInclusive',
          value: CREDIT_TEMPS_CONSTANTS.MIN_CARRIERE_FIN_CARRIERE_ANNEES,
        },
        {
          fact: 'secteur',
          operator: 'equal',
          value: 'prive',
        },
      ],
    },
    event: {
      type: 'creditTemps-eligible',
      params: {
        typeConge: 'fin_carriere',
        reduction: 'mi_temps',
        dureeMaximale: "jusqu'à pension",
        message: 'Éligible au crédit-temps fin de carrière mi-temps',
      },
    },
    priority: 79,
  });

  // Rule 8: Interruption de carrière secteur public
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'interruption_carriere',
        },
        {
          fact: 'secteur',
          operator: 'equal',
          value: 'public',
        },
        {
          fact: 'fonctionnaireStatutaire',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: 60, // 5 ans
        },
      ],
    },
    event: {
      type: 'creditTemps-eligible',
      params: {
        typeConge: 'interruption_carriere',
        dureeMaximale: '60 mois sur ma carrière',
        emploiGarantiRetour: true,
        droitsPromotionConserves: true,
        compteePension: true,
        message: 'Éligible à l\'interruption de carrière ordinaire (secteur public)',
      },
    },
    priority: 75,
  });

  // Rule 9: Credit-temps formation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'credit_temps_formation',
        },
        {
          fact: 'formationReconnue',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'ancienneteMois',
          operator: 'greaterThanInclusive',
          value: CREDIT_TEMPS_CONSTANTS.MIN_ANCIENNETE_EMPLOYEUR_MOIS,
        },
      ],
    },
    event: {
      type: 'creditTemps-eligible',
      params: {
        typeConge: 'credit_temps_formation',
        dureeMaximale: '36 mois maximum sur ma carrière',
        documentsRequis: ['attestation d\'inscription', 'preuves de participation régulière'],
        obligations: ['suivre la formation régulièrement', 'réussir pour continuer l\'année suivante'],
        message: 'Éligible au crédit-temps pour formation reconnue',
      },
    },
    priority: 70,
  });

  // Rule 10: Break@work mandatory since October 2024
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'datesDemande',
          operator: 'greaterThanInclusive',
          value: new Date('2024-10-01').getTime(),
        },
        {
          fact: 'applicationBreakAtWork',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'creditTemps-procedure-error',
      params: {
        reason: 'Application Break@work obligatoire depuis octobre 2024',
        message: 'Les demandes papier ne sont plus acceptées',
        delaiTraitement: '30 jours maximum',
      },
    },
    priority: 98,
  });

  // Rule 11: Age check for fin de carrière 1/5
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'fin_carriere',
        },
        {
          fact: 'reduction',
          operator: 'equal',
          value: 'un_cinquieme',
        },
        {
          fact: 'age',
          operator: 'lessThan',
          value: CREDIT_TEMPS_CONSTANTS.MIN_AGE_FIN_CARRIERE_1_5,
        },
      ],
    },
    event: {
      type: 'creditTemps-ineligible',
      params: {
        reason: `Âge minimum non atteint (${CREDIT_TEMPS_CONSTANTS.MIN_AGE_FIN_CARRIERE_1_5} ans requis pour réduction 1/5 temps fin de carrière)`,
      },
    },
    priority: 81,
  });

  // Rule 12: Age check for fin de carrière 1/2
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'fin_carriere',
        },
        {
          fact: 'reduction',
          operator: 'equal',
          value: 'mi_temps',
        },
        {
          fact: 'age',
          operator: 'lessThan',
          value: CREDIT_TEMPS_CONSTANTS.MIN_AGE_FIN_CARRIERE_1_2,
        },
      ],
    },
    event: {
      type: 'creditTemps-ineligible',
      params: {
        reason: `Âge minimum non atteint (${CREDIT_TEMPS_CONSTANTS.MIN_AGE_FIN_CARRIERE_1_2} ans requis pour réduction mi-temps fin de carrière)`,
      },
    },
    priority: 78,
  });

  // Rule 13: Seniority check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'ancienneteMois',
          operator: 'lessThan',
          value: CREDIT_TEMPS_CONSTANTS.MIN_ANCIENNETE_EMPLOYEUR_MOIS,
        },
        {
          any: [
            {
              fact: 'typeConge',
              operator: 'equal',
              value: 'conge_parental',
            },
            {
              fact: 'typeConge',
              operator: 'equal',
              value: 'assistance_medicale',
            },
            {
              fact: 'typeConge',
              operator: 'equal',
              value: 'credit_temps_formation',
            },
          ],
        },
      ],
    },
    event: {
      type: 'creditTemps-ineligible',
      params: {
        reason: `Ancienneté insuffisante (${CREDIT_TEMPS_CONSTANTS.MIN_ANCIENNETE_EMPLOYEUR_MOIS} mois requis)`,
      },
    },
    priority: 92,
  });

  // Rule 14: Career length check for fin de carrière
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'fin_carriere',
        },
        {
          fact: 'carriereAnnees',
          operator: 'lessThan',
          value: CREDIT_TEMPS_CONSTANTS.MIN_CARRIERE_FIN_CARRIERE_ANNEES,
        },
      ],
    },
    event: {
      type: 'creditTemps-ineligible',
      params: {
        reason: `Carrière insuffisante (${CREDIT_TEMPS_CONSTANTS.MIN_CARRIERE_FIN_CARRIERE_ANNEES} ans de carrière salariée requis)`,
      },
    },
    priority: 77,
  });

  // Rule 15: Congé parental - child too old
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeConge',
          operator: 'equal',
          value: 'conge_parental',
        },
        {
          fact: 'ageEnfant',
          operator: 'greaterThan',
          value: CREDIT_TEMPS_CONSTANTS.MAX_AGE_ENFANT_CONGE_PARENTAL,
        },
        {
          fact: 'enfantHandicape',
          operator: 'notEqual',
          value: true,
        },
      ],
    },
    event: {
      type: 'creditTemps-ineligible',
      params: {
        reason: `Enfant trop âgé (maximum ${CREDIT_TEMPS_CONSTANTS.MAX_AGE_ENFANT_CONGE_PARENTAL} ans, ou ${CREDIT_TEMPS_CONSTANTS.MAX_AGE_ENFANT_HANDICAPE} ans si handicapé)`,
      },
    },
    priority: 91,
  });

  // Rule 16: Maximum total credit-temps with motive reached
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'creditTempsDejaPris',
          operator: 'greaterThanInclusive',
          value: CREDIT_TEMPS_CONSTANTS.MAX_CREDIT_TEMPS_AVEC_MOTIF,
        },
        {
          any: [
            {
              fact: 'typeConge',
              operator: 'equal',
              value: 'assistance_medicale',
            },
            {
              fact: 'typeConge',
              operator: 'equal',
              value: 'credit_temps_formation',
            },
          ],
        },
      ],
    },
    event: {
      type: 'creditTemps-ineligible',
      params: {
        reason: `Maximum de ${CREDIT_TEMPS_CONSTANTS.MAX_CREDIT_TEMPS_AVEC_MOTIF} mois de crédit-temps avec motif déjà atteint`,
      },
    },
    priority: 88,
  });

  return engine;
}

/**
 * Singleton instance of the CreditTemps rules engine
 */
const creditTempsEngineInstance = createCreditTempsEngine();

/**
 * Calculate Crédit-temps et Interruption de Carrière amount
 */
export function calculateCreditTempsAmount(
  typeConge: TypeConge,
  reduction: TypeReduction,
  situationFamiliale: SituationFamiliale,
  secteur: Secteur = 'prive'
): number {
  const situation = situationFamiliale === 'isole' ? 'isole' : 'cohabitant';
  
  let reductionKey: 'tempPlein' | 'miTemps' | 'unCinquieme';
  switch (reduction) {
    case 'temps_plein':
      reductionKey = 'tempPlein';
      break;
    case 'mi_temps':
      reductionKey = 'miTemps';
      break;
    case 'un_cinquieme':
      reductionKey = 'unCinquieme';
      break;
    default:
      reductionKey = 'miTemps';
  }

  switch (typeConge) {
    case 'conge_parental':
      return CREDIT_TEMPS_ALLOCATIONS.congeParental[reductionKey]?.[situation] ?? 0;
    
    case 'assistance_medicale':
      return CREDIT_TEMPS_ALLOCATIONS.assistanceMedicale[reductionKey]?.[situation] ?? 0;
    
    case 'soins_palliatifs':
      return CREDIT_TEMPS_ALLOCATIONS.soinsPalliatifs[reductionKey]?.[situation] ?? 0;
    
    case 'fin_carriere':
      if (reductionKey === 'tempPlein') return 0; // Not applicable
      return CREDIT_TEMPS_ALLOCATIONS.finCarriere[reductionKey]?.[situation] ?? 0;
    
    case 'interruption_carriere':
      if (secteur === 'public') {
        return CREDIT_TEMPS_ALLOCATIONS.interruptionCarrierePublic[reductionKey]?.[situation] ?? 0;
      }
      return 0;
    
    case 'credit_temps_formation':
      if (reductionKey === 'tempPlein') return 0; // Not applicable for formation
      return CREDIT_TEMPS_ALLOCATIONS.creditTempsFormation[reductionKey]?.[situation] ?? 0;
    
    case 'credit_temps_sans_motif':
      return 0; // Supprimé depuis 2017
    
    default:
      return 0;
  }
}

/**
 * Get maximum duration for a leave type
 */
export function getMaximumDuration(typeConge: TypeConge): string {
  switch (typeConge) {
    case 'conge_parental':
      return '4 mois';
    case 'assistance_medicale':
      return '24 mois max';
    case 'soins_palliatifs':
      return '2 mois max';
    case 'fin_carriere':
      return "jusqu'à pension";
    case 'interruption_carriere':
      return '60 mois sur la carrière';
    case 'credit_temps_formation':
      return '36 mois sur la carrière';
    case 'credit_temps_sans_motif':
      return 'Non applicable (supprimé)';
    default:
      return 'Non défini';
  }
}

/**
 * Check Crédit-temps et Interruption de Carrière eligibility
 */
export async function checkCreditTempsEligibility(
  user: CreditTempsUser,
  typeConge: TypeConge,
  reduction: TypeReduction
): Promise<CreditTempsEligibilityResult> {
  const facts = {
    age: user.age,
    ancienneteMois: user.ancienneteMois,
    carriereAnnees: user.carriereAnnees,
    secteur: user.secteur,
    situationFamiliale: user.situationFamiliale,
    tempsPlein: user.tempsPlein,
    ageEnfant: user.ageEnfant ?? 99,
    enfantHandicape: user.enfantHandicape ?? false,
    certificatMedical: user.certificatMedical ?? false,
    parentMalade: user.parentMalade ?? false,
    parentEnPhaseTerminale: user.parentEnPhaseTerminale ?? false,
    formationReconnue: user.formationReconnue ?? false,
    motifValable: typeConge !== 'credit_temps_sans_motif',
    nombreEmployeur: user.nombreEmployeur,
    fonctionnaireStatutaire: user.fonctionnaireStatutaire ?? false,
    accordEmployeur: user.accordEmployeur ?? false,
    congeParentalDejaPris: user.congeParentalDejaPris ?? 0,
    creditTempsDejaPris: user.creditTempsDejaPris ?? 0,
    applicationBreakAtWork: user.applicationBreakAtWork ?? true,
    datesDemande: user.datesDemande ? user.datesDemande.getTime() : Date.now(),
    typeConge: typeConge,
    reduction: reduction,
  };

  try {
    const results = await creditTempsEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'creditTemps-ineligible');
    const procedureErrorEvent = results.events.find((e) => e.type === 'creditTemps-procedure-error');
    const eligibleEvent = results.events.find((e) => e.type === 'creditTemps-eligible');
    const pmeDeferEvent = results.events.find((e) => e.type === 'creditTemps-pme-defer');

    if (procedureErrorEvent) {
      return {
        benefitType: 'time-credit',
        isEligible: false,
        reason: procedureErrorEvent.params?.reason as string,
        typeConge: typeConge,
        reduction: reduction,
      };
    }

    if (ineligibleEvent) {
      return {
        benefitType: 'time-credit',
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    return {
      benefitType: 'time-credit',
      isEligible: false,
      reason: 'Conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Credit Temps eligibility: ${error}`);
  }
};