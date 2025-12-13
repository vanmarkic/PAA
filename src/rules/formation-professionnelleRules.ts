/**
 * Business Rules for Formation Professionnelle
 *
 * Implements the Gherkin specifications from features/benefits/formation-professionnelle.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Décret wallon du 10 juillet 2013 relatif aux centres d'insertion socioprofessionnelle
 * - Ordonnance bruxelloise du 18 janvier 2001 portant organisation et fonctionnement d'Actiris
 * - Décret flamand du 7 mai 2004 relatif à la création de l'agence autonomisée externe de droit public VDAB
 * - Arrêté royal du 25 novembre 1991 portant réglementation du chômage (articles relatifs à la dispense)
 * - Loi du 22 janvier 1985 de redressement contenant des dispositions sociales (congé-éducation payé)
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * FormationProfessionnelle Rules Version Metadata
 * This version MUST match the specification version in features/benefits/formation-professionnelle.feature
 */
export const FORMATION_PROFESSIONNELLE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/formation-professionnelle.feature',
  generatedFrom: 'features/benefits/formation-professionnelle.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law
export const FORMATION_CONSTANTS = {
  MIN_AGE: 18,
  TRAINING_ALLOWANCE_PER_HOUR: 1, // 1€ par heure de formation
  SHORTAGE_PROFESSION_BONUS: 350, // 350€ après formation métier en pénurie
  YOUNG_QUALIFICATION_ALLOWANCE_MONTHLY: 200, // 200€ par mois pour jeunes sans diplôme
  CHILDCARE_REIMBURSEMENT_MAX_PER_DAY: 18, // 18€ par jour par enfant
  EDUCATION_LEAVE_HOURS_PER_YEAR: 120, // 120 heures par an de congé-éducation
  EDUCATION_LEAVE_SALARY_CAP: 3098, // 3098€ brut par mois plafond
  FPIE_MAX_DURATION_MONTHS: 6, // 6 mois maximum pour FPIE
  LANGUAGE_TRAINING_MAX_MONTHS: 3, // 3 mois maximum formation linguistique
  MIN_ATTENDANCE_RATE: 80, // 80% taux de présence minimum
  ENTREPRENEURSHIP_ALLOCATION_MONTHS: 6, // 6 mois maintien allocations pour entrepreneuriat
  SENIOR_AGE_THRESHOLD: 50, // Seuil âge programme 50+
};

export const REGIONAL_ORGANISMS = {
  WALLONIA: 'Forem',
  BRUSSELS: 'Actiris',
  BRUSSELS_FORMATION: 'Bruxelles Formation',
  FLANDERS: 'VDAB',
  IFAPME: 'IFAPME',
};

export type EmploymentStatus = 'demandeur_emploi' | 'travailleur' | 'jeune_sans_diplome' | 'parent_isole';
export type TrainingType = 'metier_en_penurie' | 'qualifiante' | 'reconversion' | 'alternance' | 'linguistique' | 'entrepreneuriat' | 'numerique' | 'non_agreee';
export type ContractType = 'FPIE' | 'standard' | 'alternance' | 'conge_education';

export interface FormationUser {
  age: number;
  employmentStatus: EmploymentStatus;
  registeredOrganism: string;
  hasUnemploymentBenefits: boolean;
  unemploymentBenefitAmount?: number;
  trainingType: TrainingType;
  trainingDurationMonths: number;
  isTrainingApproved: boolean;
  isShortageOccupation: boolean;
  hasSecondaryDiploma: boolean;
  hasHostCompany?: boolean;
  contractType?: ContractType;
  yearsInSameCompany?: number;
  isSingleParent: boolean;
  numberOfChildren: number;
  hasConditionalJobOffer?: boolean;
  languageLevel?: string;
  region: 'wallonia' | 'brussels' | 'flanders';
}

export interface FormationEligibilityResult {
  isEligible: boolean;
  isPriorityAccess: boolean;
  maintainsUnemploymentBenefits: boolean;
  trainingAllowance: number;
  trainingAllowanceType: string;
  shortageBonus: number;
  transportReimbursement: boolean;
  freePublicTransport: boolean;
  childcareReimbursement: number;
  educationLeaveHours: number;
  salaryCap: number;
  maxDurationMonths: number;
  additionalBenefits: string[];
  obligations: string[];
  reason?: string;
  warnings: string[];
}

/**
 * Create the FormationProfessionnelle eligibility rules engine
 */
function createFormationProfessionnelleEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement (must be 18+ with exceptions)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: FORMATION_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'trainingType',
          operator: 'notEqual',
          value: 'alternance',
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-ineligible',
      params: {
        reason: `âge minimum non atteint (${FORMATION_CONSTANTS.MIN_AGE} ans requis, sauf exceptions)`,
      },
    },
    priority: 100,
  });

  // Rule 2: Non-approved training warning
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isTrainingApproved',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'hasUnemploymentBenefits',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-warning',
      params: {
        warning: 'formation non compatible avec disponibilité',
        requiresOnemDispensation: true,
        riskLosingBenefits: true,
      },
    },
    priority: 90,
  });

  // Rule 3: Job seeker in shortage occupation training
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'demandeur_emploi',
        },
        {
          fact: 'isShortageOccupation',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isTrainingApproved',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: FORMATION_CONSTANTS.MIN_AGE,
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-eligible',
      params: {
        category: 'shortage_occupation',
        maintainsUnemploymentBenefits: true,
        trainingAllowancePerHour: FORMATION_CONSTANTS.TRAINING_ALLOWANCE_PER_HOUR,
        shortageBonus: FORMATION_CONSTANTS.SHORTAGE_PROFESSION_BONUS,
        transportReimbursement: true,
      },
    },
    priority: 80,
  });

  // Rule 4: Worker in professional reconversion (congé-éducation)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'travailleur',
        },
        {
          fact: 'contractType',
          operator: 'equal',
          value: 'conge_education',
        },
        {
          fact: 'isTrainingApproved',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-eligible',
      params: {
        category: 'education_leave',
        educationLeaveHours: FORMATION_CONSTANTS.EDUCATION_LEAVE_HOURS_PER_YEAR,
        salaryMaintained: true,
        salaryCap: FORMATION_CONSTANTS.EDUCATION_LEAVE_SALARY_CAP,
      },
    },
    priority: 75,
  });

  // Rule 5: Young person without qualification (priority access)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasSecondaryDiploma',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'age',
          operator: 'lessThanInclusive',
          value: 25,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: FORMATION_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'trainingType',
          operator: 'equal',
          value: 'qualifiante',
        },
        {
          fact: 'isTrainingApproved',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-eligible',
      params: {
        category: 'young_qualification',
        isPriorityAccess: true,
        monthlyAllowance: FORMATION_CONSTANTS.YOUNG_QUALIFICATION_ALLOWANCE_MONTHLY,
        freePublicTransport: true,
        receivesCompetenceAttestation: true,
      },
    },
    priority: 85,
  });

  // Rule 6: Alternance training with FPIE contract
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'demandeur_emploi',
        },
        {
          fact: 'trainingType',
          operator: 'equal',
          value: 'alternance',
        },
        {
          fact: 'contractType',
          operator: 'equal',
          value: 'FPIE',
        },
        {
          fact: 'hasHostCompany',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-eligible',
      params: {
        category: 'alternance_fpie',
        maintainsUnemploymentBenefits: true,
        progressiveProductivityAllowance: true,
        employmentCommitment: true,
        maxDurationMonths: FORMATION_CONSTANTS.FPIE_MAX_DURATION_MONTHS,
      },
    },
    priority: 70,
  });

  // Rule 7: Senior worker (50+) with priority access
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: FORMATION_CONSTANTS.SENIOR_AGE_THRESHOLD,
        },
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'demandeur_emploi',
        },
        {
          fact: 'isTrainingApproved',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-eligible',
      params: {
        category: 'senior_50plus',
        isPriorityAccess: true,
        personalizedSupport: true,
        maintainsIncreasedBenefits: true,
        program50Plus: true,
        extendedDuration: true,
      },
    },
    priority: 78,
  });

  // Rule 8: Single parent with children
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isSingleParent',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'numberOfChildren',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'isTrainingApproved',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-eligible',
      params: {
        category: 'single_parent',
        childcareReimbursementPerDay: FORMATION_CONSTANTS.CHILDCARE_REIMBURSEMENT_MAX_PER_DAY,
        adaptedSchedule: true,
        maintainsIncreasedFamilyAllowances: true,
      },
    },
    priority: 72,
  });

  // Rule 9: Language training for specific employment (Brussels)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'demandeur_emploi',
        },
        {
          fact: 'trainingType',
          operator: 'equal',
          value: 'linguistique',
        },
        {
          fact: 'hasConditionalJobOffer',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'region',
          operator: 'equal',
          value: 'brussels',
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-eligible',
      params: {
        category: 'language_training',
        freeLanguageVouchers: true,
        maxDurationMonths: FORMATION_CONSTANTS.LANGUAGE_TRAINING_MAX_MONTHS,
        selorCertification: true,
        maintainsUnemploymentBenefits: true,
        employerHiringBonus: true,
      },
    },
    priority: 68,
  });

  // Rule 10: Entrepreneurship training
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'demandeur_emploi',
        },
        {
          fact: 'trainingType',
          operator: 'equal',
          value: 'entrepreneuriat',
        },
        {
          fact: 'registeredOrganism',
          operator: 'equal',
          value: REGIONAL_ORGANISMS.IFAPME,
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-eligible',
      params: {
        category: 'entrepreneurship',
        maintainsBenefitsMonths: FORMATION_CONSTANTS.ENTREPRENEURSHIP_ALLOCATION_MONTHS,
        airbagAccess: true,
        tremplinIndependants: true,
        personalizedCoaching: true,
        microcreditAccess: true,
      },
    },
    priority: 65,
  });

  // Rule 11: Standard approved training for job seekers
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'demandeur_emploi',
        },
        {
          fact: 'isTrainingApproved',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: FORMATION_CONSTANTS.MIN_AGE,
        },
      ],
    },
    event: {
      type: 'formationProfessionnelle-eligible',
      params: {
        category: 'standard_approved',
        maintainsUnemploymentBenefits: true,
        trainingAllowancePerHour: FORMATION_CONSTANTS.TRAINING_ALLOWANCE_PER_HOUR,
        transportReimbursement: true,
      },
    },
    priority: 50,
  });

  return engine;
}

/**
 * Singleton instance of the FormationProfessionnelle rules engine
 */
const formationProfessionnelleEngineInstance = createFormationProfessionnelleEngine();

/**
 * Calculate Formation Professionnelle amount and benefits
 */
export function calculateFormationProfessionnelleAmount(
  user: FormationUser,
  category: string,
  eventParams: Record<string, unknown>
): {
  trainingAllowance: number;
  trainingAllowanceType: string;
  shortageBonus: number;
  childcareReimbursement: number;
  educationLeaveHours: number;
  salaryCap: number;
} {
  let trainingAllowance = 0;
  let trainingAllowanceType = '';
  let shortageBonus = 0;
  let childcareReimbursement = 0;
  let educationLeaveHours = 0;
  let salaryCap = 0;

  switch (category) {
    case 'shortage_occupation':
      // 1€ per hour of training + 350€ bonus at end
      trainingAllowance = FORMATION_CONSTANTS.TRAINING_ALLOWANCE_PER_HOUR;
      trainingAllowanceType = '1€/heure + 350€';
      shortageBonus = FORMATION_CONSTANTS.SHORTAGE_PROFESSION_BONUS;
      break;

    case 'education_leave':
      // Salary maintained with cap
      trainingAllowanceType = 'salaire maintenu';
      educationLeaveHours = FORMATION_CONSTANTS.EDUCATION_LEAVE_HOURS_PER_YEAR;
      salaryCap = FORMATION_CONSTANTS.EDUCATION_LEAVE_SALARY_CAP;
      break;

    case 'young_qualification':
      // 200€ per month
      trainingAllowance = FORMATION_CONSTANTS.YOUNG_QUALIFICATION_ALLOWANCE_MONTHLY;
      trainingAllowanceType = '200€/mois';
      break;

    case 'alternance_fpie':
      trainingAllowanceType = 'progressive';
      break;

    case 'single_parent':
      trainingAllowance = FORMATION_CONSTANTS.TRAINING_ALLOWANCE_PER_HOUR;
      trainingAllowanceType = '1€/heure';
      childcareReimbursement = user.numberOfChildren * FORMATION_CONSTANTS.CHILDCARE_REIMBURSEMENT_MAX_PER_DAY;
      break;

    case 'senior_50plus':
    case 'standard_approved':
      trainingAllowance = FORMATION_CONSTANTS.TRAINING_ALLOWANCE_PER_HOUR;
      trainingAllowanceType = '1€/heure';
      break;

    case 'language_training':
    case 'entrepreneurship':
      trainingAllowanceType = 'maintien allocations';
      break;

    default:
      trainingAllowanceType = 'non défini';
  }

  return {
    trainingAllowance,
    trainingAllowanceType,
    shortageBonus,
    childcareReimbursement,
    educationLeaveHours,
    salaryCap,
  };
}

/**
 * Get training obligations
 */
function getTrainingObligations(isApproved: boolean, hasUnemploymentBenefits: boolean): string[] {
  const obligations: string[] = [];

  if (isApproved && hasUnemploymentBenefits) {
    obligations.push(`Taux de présence minimum de ${FORMATION_CONSTANTS.MIN_ATTENDANCE_RATE}%`);
    obligations.push('Justifier toute absence');
    obligations.push('Participer activement aux cours');
    obligations.push('Réussir les évaluations intermédiaires');
    obligations.push('Rester inscrit comme demandeur d\'emploi');
    obligations.push('Informer l\'ONEM du début et fin de formation');
    obligations.push('Rester disponible pour un emploi convenable');
  }

  return obligations;
}

/**
 * Check Formation Professionnelle eligibility
 */
export async function checkFormationProfessionnelleEligibility(
  user: FormationUser
): Promise<FormationEligibilityResult> {
  const facts = {
    age: user.age,
    employmentStatus: user.employmentStatus,
    registeredOrganism: user.registeredOrganism,
    hasUnemploymentBenefits: user.hasUnemploymentBenefits,
    unemploymentBenefitAmount: user.unemploymentBenefitAmount || 0,
    trainingType: user.trainingType,
    trainingDurationMonths: user.trainingDurationMonths,
    isTrainingApproved: user.isTrainingApproved,
    isShortageOccupation: user.isShortageOccupation,
    hasSecondaryDiploma: user.hasSecondaryDiploma,
    hasHostCompany: user.hasHostCompany || false,
    contractType: user.contractType || 'standard',
    yearsInSameCompany: user.yearsInSameCompany || 0,
    isSingleParent: user.isSingleParent,
    numberOfChildren: user.numberOfChildren,
    hasConditionalJobOffer: user.hasConditionalJobOffer || false,
    languageLevel: user.languageLevel || '',
    region: user.region,
  };

  try {
    const results = await formationProfessionnelleEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'formationProfessionnelle-ineligible');
    const warningEvent = results.events.find((e) => e.type === 'formationProfessionnelle-warning');
    const eligibleEvents = results.events.filter((e) => e.type === 'formationProfessionnelle-eligible');

    const warnings: string[] = [];

    if (warningEvent && warningEvent.params) {
      warnings.push(warningEvent.params.warning as string);
      if (warningEvent.params.requiresOnemDispensation) {
        warnings.push('Une dispense ONEM est requise');
      }
      if (warningEvent.params.riskLosingBenefits) {
        warnings.push('Risque de perte des allocations de chômage');
      }
    }

    if (ineligibleEvent) {
      return {
        isEligible: false,
        isPriorityAccess: false,
        maintainsUnemploymentBenefits: false,
        trainingAllowance: 0,
        trainingAllowanceType: '',
        shortageBonus: 0,
        transportReimbursement: false,
        freePublicTransport: false,
        childcareReimbursement: 0,
        educationLeaveHours: 0,
        salaryCap: 0,
        maxDurationMonths: 0,
        additionalBenefits: [],
        obligations: [],
        reason: ineligibleEvent.params?.reason as string,
        warnings,
      };
    }

    if (eligibleEvents.length > 0) {
      // Combine benefits from all matching rules
      const additionalBenefits: string[] = [];
      let isPriorityAccess = false;
      let maintainsUnemploymentBenefits = false;
      let transportReimbursement = false;
      let freePublicTransport = false;
      let maxDurationMonths = user.trainingDurationMonths;
      let primaryCategory = '';

      for (const event of eligibleEvents) {
        const params = event.params || {};
        
        if (!primaryCategory) {
          primaryCategory = params.category as string;
        }

        if (params.isPriorityAccess) isPriorityAccess = true;
        if (params.maintainsUnemploymentBenefits || params.maintainsIncreasedBenefits) {
          maintainsUnemploymentBenefits = true;
        }
        if (params.transportReimbursement) transportReimbursement = true;
        if (params.freePublicTransport) freePublicTransport = true;
        if (params.maxDurationMonths) {
          maxDurationMonths = params.maxDurationMonths as number;
        }

        // Collect additional benefits
        if (params.personalizedSupport) additionalBenefits.push('Accompagnement personnalisé');
        if (params.program50Plus) additionalBenefits.push('Programme 50+');
        if (params.extendedDuration) additionalBenefits.push('Durée de formation extensible');
        if (params.adaptedSchedule) additionalBenefits.push('Horaires de formation adaptés');
        if (params.maintainsIncreasedFamilyAllowances) additionalBenefits.push('Allocations familiales majorées maintenues');
        if (params.freeLanguageVouchers) additionalBenefits.push('Chèques-langues gratuits');
        if (params.selorCertification) additionalBenefits.push('Certification Selor possible');
        if (params.employerHiringBonus) additionalBenefits.push('Prime à l\'embauche pour l\'employeur');
        if (params.airbagAccess) additionalBenefits.push('Accompagnement Airbag UCM');
        if (params.tremplinIndependants) additionalBenefits.push('Plan Tremplin-indépendants');
        if (params.personalizedCoaching) additionalBenefits.push('Coaching personnalisé');
        if (params.microcreditAccess) additionalBenefits.push('Accès aux microcrédits');
        if (params.progressiveProductivityAllowance) additionalBenefits.push('Indemnité de productivité progressive');
        if (params.employmentCommitment) additionalBenefits.push('Engagement d\'embauche de l\'entreprise');
        if (params.receivesCompetenceAttestation) additionalBenefits.push('Attestation de compétences');
      }

      const amounts = calculateFormationProfessionnelleAmount(
        user,
        primaryCategory,
        eligibleEvents[0].params || {}
      );

      const obligations = getTrainingObligations(user.isTrainingApproved, user.hasUnemploymentBenefits);

      return {
        isEligible: true,
        isPriorityAccess,
        maintainsUnemploymentBenefits,
        trainingAllowance: amounts.trainingAllowance,
        trainingAllowanceType: amounts.trainingAllowanceType,
        shortageBonus: amounts.shortageBonus,
        transportReimbursement,
        freePublicTransport,
        childcareReimbursement: amounts.childcareReimbursement,
        educationLeaveHours: amounts.educationLeaveHours,
        salaryCap: amounts.salaryCap,
        maxDurationMonths,
        additionalBenefits: [...new Set(additionalBenefits)],
        obligations,
        warnings,
      };
    }

    return {
      isEligible: false,
      isPriorityAccess: false,
      maintainsUnemploymentBenefits: false,
      trainingAllowance: 0,
      trainingAllowanceType: '',
      shortageBonus: 0,
      transportReimbursement: false,
      freePublicTransport: false,
      childcareReimbursement: 0,
      educationLeaveHours: 0,
      salaryCap: 0,
      maxDurationMonths: 0,
      additionalBenefits: [],
      obligations: [],
      reason: 'conditions non remplies',
      warnings,
    };
  } catch (error) {
    throw new Error(`Error checking Formation Professionnelle eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const FORMATION_PROFESSIONNELLE_RULES_JSON = {
  legalFramework: {
    note: 'Formation professionnelle en Belgique',
    sources: [
      'Décret wallon du 10 juillet 2013 relatif aux centres d\'insertion socioprofessionnelle',
      'Ordonnance bruxelloise du 18 janvier 2001 portant organisation et fonctionnement d\'Actiris',
      'Décret flamand du 7 mai 2004 relatif à la création de VDAB',
      'Arrêté royal du 25 novembre 1991 portant réglementation du chômage',
      'Loi du 22 janvier 1985 (congé-éducation payé)',
    ],
    regionalOrganisms: REGIONAL_ORGANISMS,
  },
  rules: [
    {
      id: 'age-requirement',
      description: 'Âge minimum de 18 ans requis (sauf exceptions pour alternance)',
      condition: 'age >= 18 OU trainingType == alternance',
      priority: 100,
    },
    {
      id: 'non-approved-training-warning',
      description: 'Formation non agréée risque de faire perdre les allocations',
      condition: 'isTrainingApproved == false ET hasUnemploymentBenefits == true',
      consequence: 'Dispense ONEM requise, risque perte allocations',
      priority: 90,
    },
    {
      id: 'shortage-occupation',
      description: 'Formation métier en pénurie',
      condition: 'employmentStatus == demandeur_emploi ET isShortageOccupation == true ET isTrainingApproved == true',
      benefits: {
        trainingAllowance: '1€/heure',
        shortageBonus: '350€ à la fin',
        transportReimbursement: true,
        maintainsUnemploymentBenefits: true,
      },
      priority: 80,
    },
    {
      id: 'education-leave',
      description: 'Congé-éducation payé pour travailleurs',
      condition: 'employmentStatus == travailleur ET contractType == conge_education ET isTrainingApproved == true',
      benefits: {
        educationLeaveHours: 120,
        salaryCap: 3098,
        salaryMaintained: true,
      },
      priority: 75,
    },
    {
      id: 'young-without-diploma',
      description: 'Jeune sans qualification en formation qualifiante',
      condition: 'hasSecondaryDiploma == false ET age <= 25 ET age >= 18 ET trainingType == qualifiante',
      benefits: {
        monthlyAllowance: 200,
        freePublicTransport: true,
        isPriorityAccess: true,
      },
      priority: 85,
    },
    {
      id: