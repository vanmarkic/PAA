/**
 * Business Rules for Insertion Professionnelle
 *
 * Implements the Gherkin specifications from features/benefits/insertion-professionnelle.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Loi du 26 mai 2002 concernant le droit à l'intégration sociale (Article 60§7)
 * - Arrêté royal du 9 juin 1997 relatif aux programmes de transition professionnelle
 * - Loi du 3 juillet 2005 relative aux droits des volontaires (titres-services)
 * - Arrêté royal du 19 décembre 2001 relatif à l'activation des allocations de chômage (Activa)
 * - Loi du 7 avril 1999 relative au contrat de travail ALE
 * - Décret du 10 juillet 2013 relatif à l'insertion professionnelle (Région wallonne)
 * - Ordonnance du 23 juin 2017 relative aux aides à l'emploi (Région Bruxelles-Capitale)
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * InsertionProfessionnelle Rules Version Metadata
 * This version MUST match the specification version in features/benefits/insertion-professionnelle.feature
 */
export const INSERTION_PROFESSIONNELLE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/insertion-professionnelle.feature',
  generatedFrom: 'features/benefits/insertion-professionnelle.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law
export const INSERTION_CONSTANTS = {
  // Age limits
  MIN_AGE_GENERAL: 18,
  MAX_AGE_STAGE_FIRST: 30,
  MIN_AGE_ACTIVA_SENIOR: 45,

  // Duration limits (in months)
  ARTICLE_60_MAX_DURATION: 24,
  PTP_MAX_DURATION: 24,
  STAGE_FIRST_MIN_DURATION: 3,
  STAGE_FIRST_MAX_DURATION: 6,
  FPI_MAX_DURATION_WEEKS: 26,
  ACTIVA_REDUCTION_DURATION: 30,

  // Unemployment duration thresholds (in months)
  LONG_TERM_UNEMPLOYED: 12,
  VERY_LONG_TERM_UNEMPLOYED: 24,

  // Financial amounts
  STAGE_FIRST_MONTHLY_ALLOWANCE: 200,
  STAGE_FIRST_EMPLOYER_BONUS: 500,
  ACTIVA_MONTHLY_REDUCTION: 1000,
  TITRES_SERVICES_MIN_HOURLY_WAGE: 11.99,
  TITRES_SERVICES_MIN_WEEKLY_HOURS: 19,

  // Disability threshold
  DISABILITY_PERCENTAGE_ETA: 35,

  // Employment retention rates
  STAGE_FIRST_EMPLOYMENT_RATE: 0.70,

  // RIS minimum duration for Article 60
  RIS_MIN_DURATION_MONTHS: 3,
};

export type InsertionDevice =
  | 'article-60'
  | 'article-61'
  | 'ptp'
  | 'sine'
  | 'activa'
  | 'impulsion'
  | 'stage-first'
  | 'fpi-ibo'
  | 'titres-services'
  | 'eta';

export type QualificationLevel = 'aucune' | 'faible' | 'moyenne' | 'elevee' | 'adaptee';

export type ProfileType =
  | 'beneficiaire-ris'
  | 'chomeur-longue-duree'
  | 'jeune-sans-diplome'
  | 'parent-isole'
  | 'personne-handicapee'
  | 'tres-eloigne-emploi';

export interface InsertionUser {
  age: number;
  isBeneficiaireRIS: boolean;
  risDurationMonths: number;
  unemploymentDurationMonths: number;
  qualificationLevel: QualificationLevel;
  hasDisability: boolean;
  disabilityPercentage: number;
  isParentIsole: boolean;
  numberOfChildren: number;
  yearsWithoutWork: number;
  isRegisteredActiris: boolean;
  actirisRegistrationMonths: number;
  hasSocialProblems: boolean;
  profileType: ProfileType;
  proposedDevice: InsertionDevice;
  proposedSector: string;
  currentSalary?: number;
}

export interface InsertionEligibilityResult {
  device: InsertionDevice;
  isEligible: boolean;
  reason?: string;
  maxDuration?: string;
  benefits: string[];
  employerBenefits: string[];
  obligations: string[];
  calculatedAmount?: number;
}

/**
 * Create the InsertionProfessionnelle eligibility rules engine
 */
function createInsertionProfessionnelleEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Article 60§7 - Bénéficiaire RIS
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isBeneficiaireRIS',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'risDurationMonths',
          operator: 'greaterThanInclusive',
          value: INSERTION_CONSTANTS.RIS_MIN_DURATION_MONTHS,
        },
        {
          fact: 'proposedDevice',
          operator: 'equal',
          value: 'article-60',
        },
      ],
    },
    event: {
      type: 'insertion-eligible',
      params: {
        device: 'article-60',
        message: 'Éligible pour Article 60§7',
        maxDuration: '24 mois',
        benefits: [
          'Contrat de travail avec le CPAS',
          'Reconstitution des droits au chômage',
          'Salaire minimum barème de la fonction',
          'Tous les avantages sociaux',
          'Accompagnement social',
          'Ouverture des droits aux allocations de chômage à la fin',
        ],
        employerBenefits: ['Subvention salariale du fédéral'],
        obligations: [
          'Respecter les horaires de travail',
          'Suivre les formations obligatoires',
          'Collaborer avec le référent social',
          'Signaler tout changement de situation',
          'Participer aux évaluations régulières',
          'Chercher activement un emploi durable',
          'Respecter le règlement de travail',
        ],
      },
    },
    priority: 100,
  });

  // Rule 2: PTP - Programme de Transition Professionnelle
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'unemploymentDurationMonths',
          operator: 'greaterThanInclusive',
          value: INSERTION_CONSTANTS.LONG_TERM_UNEMPLOYED,
        },
        {
          fact: 'qualificationLevel',
          operator: 'in',
          value: ['faible', 'aucune'],
        },
        {
          fact: 'proposedDevice',
          operator: 'equal',
          value: 'ptp',
        },
      ],
    },
    event: {
      type: 'insertion-eligible',
      params: {
        device: 'ptp',
        message: 'Éligible pour Programme de Transition Professionnelle',
        maxDuration: '24 mois maximum',
        benefits: [
          'Contrat à durée déterminée de 24 mois maximum',
          'Formation complémentaire possible',
          'Salaire selon barèmes du secteur',
          'Priorité pour un CDI après le PTP',
        ],
        employerBenefits: ['Subvention salariale importante'],
        obligations: [
          'Respecter les horaires de travail',
          'Suivre les formations obligatoires',
          'Collaborer avec le référent social',
        ],
      },
    },
    priority: 90,
  });

  // Rule 3: Stage First - Jeune peu qualifié
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThanInclusive',
          value: INSERTION_CONSTANTS.MAX_AGE_STAGE_FIRST,
        },
        {
          fact: 'qualificationLevel',
          operator: 'in',
          value: ['aucune', 'faible'],
        },
        {
          fact: 'isRegisteredActiris',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'actirisRegistrationMonths',
          operator: 'greaterThanInclusive',
          value: 3,
        },
        {
          fact: 'proposedDevice',
          operator: 'equal',
          value: 'stage-first',
        },
      ],
    },
    event: {
      type: 'insertion-eligible',
      params: {
        device: 'stage-first',
        message: 'Éligible pour Stage First',
        maxDuration: '3 à 6 mois',
        benefits: [
          'Indemnité de stage de 200€ par mois',
          'Maintien des allocations d\'insertion',
          '70% de chances d\'être embauché après',
        ],
        employerBenefits: ['Prime de 500€ par mois'],
        obligations: [
          'Respecter les horaires de travail',
          'Suivre les formations obligatoires',
        ],
        monthlyAllowance: INSERTION_CONSTANTS.STAGE_FIRST_MONTHLY_ALLOWANCE,
      },
    },
    priority: 85,
  });

  // Rule 4: ETA - Personne handicapée
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasDisability',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'disabilityPercentage',
          operator: 'greaterThanInclusive',
          value: INSERTION_CONSTANTS.DISABILITY_PERCENTAGE_ETA,
        },
        {
          fact: 'proposedDevice',
          operator: 'equal',
          value: 'eta',
        },
      ],
    },
    event: {
      type: 'insertion-eligible',
      params: {
        device: 'eta',
        message: 'Éligible pour Entreprise de Travail Adapté',
        maxDuration: 'illimitée',
        benefits: [
          'Contrat de travail ordinaire',
          'Poste adapté au handicap',
          'Encadrement spécialisé',
          'Possibilité d\'évolution vers l\'emploi ordinaire',
        ],
        employerBenefits: ['Subsides spécifiques ETA'],
        obligations: [
          'Respecter le règlement de travail',
          'Collaborer avec l\'encadrement',
        ],
      },
    },
    priority: 95,
  });

  // Rule 5: Titres-services
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'yearsWithoutWork',
          operator: 'greaterThanInclusive',
          value: 1,
        },
        {
          fact: 'proposedDevice',
          operator: 'equal',
          value: 'titres-services',
        },
      ],
    },
    event: {
      type: 'insertion-eligible',
      params: {
        device: 'titres-services',
        message: 'Éligible pour emploi Titres-services',
        maxDuration: 'illimitée',
        benefits: [
          'Contrat de travail standard',
          'Minimum mi-temps (19h/semaine)',
          'Salaire minimum 11.99€ brut/heure',
          'Accès aux formations du Fonds de formation',
          'CDI possible après 3 mois',
          'Horaires compatibles avec la vie familiale',
        ],
        employerBenefits: ['Subvention titres-services'],
        obligations: [
          'Respecter les horaires de travail',
          'Suivre les formations obligatoires',
        ],
        minHourlyWage: INSERTION_CONSTANTS.TITRES_SERVICES_MIN_HOURLY_WAGE,
      },
    },
    priority: 70,
  });

  // Rule 6: Activa - Chômeur longue durée
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'unemploymentDurationMonths',
          operator: 'greaterThanInclusive',
          value: INSERTION_CONSTANTS.VERY_LONG_TERM_UNEMPLOYED,
        },
        {
          fact: 'proposedDevice',
          operator: 'equal',
          value: 'activa',
        },
      ],
    },
    event: {
      type: 'insertion-eligible',
      params: {
        device: 'activa',
        message: 'Éligible pour Activa avec carte',
        maxDuration: 'illimitée (réduction ONSS pendant 30 mois)',
        benefits: [
          'Salaire de la fonction',
          'Contrat à durée indéterminée obligatoire',
          'Tous les avantages du secteur',
        ],
        employerBenefits: [
          'Réduction ONSS de 1000€ par mois pendant 30 mois',
        ],
        obligations: [
          'Respecter le contrat CDI',
          'Signaler tout changement de situation',
        ],
        monthlyReduction: INSERTION_CONSTANTS.ACTIVA_MONTHLY_REDUCTION,
        reductionDuration: INSERTION_CONSTANTS.ACTIVA_REDUCTION_DURATION,
      },
    },
    priority: 80,
  });

  // Rule 7: FPI/IBO - Formation Professionnelle Individuelle
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'unemploymentDurationMonths',
          operator: 'greaterThanInclusive',
          value: 0,
        },
        {
          fact: 'proposedDevice',
          operator: 'equal',
          value: 'fpi-ibo',
        },
      ],
    },
    event: {
      type: 'insertion-eligible',
      params: {
        device: 'fpi-ibo',
        message: 'Éligible pour Formation Professionnelle Individuelle',
        maxDuration: '26 semaines',
        benefits: [
          'Maintien des allocations de chômage',
          'Prime de productivité progressive',
          'Garantie d\'embauche en CDI après',
        ],
        employerBenefits: [
          'Pas de charges sociales pendant la formation',
        ],
        obligations: [
          'Suivre la formation complète',
          'Respecter les horaires',
          'Participer aux évaluations',
        ],
      },
    },
    priority: 75,
  });

  // Rule 8: SINE - Économie sociale d'insertion
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'profileType',
          operator: 'equal',
          value: 'tres-eloigne-emploi',
        },
        {
          fact: 'hasSocialProblems',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'proposedDevice',
          operator: 'equal',
          value: 'sine',
        },
      ],
    },
    event: {
      type: 'insertion-eligible',
      params: {
        device: 'sine',
        message: 'Éligible pour SINE - Économie sociale d\'insertion',
        maxDuration: 'illimitée',
        benefits: [
          'Contrat de travail à durée indéterminée',
          'Accompagnement psychosocial',
          'Formations pendant le temps de travail',
          'Objectif de réinsertion progressive',
        ],
        employerBenefits: ['Subvention importante'],
        obligations: [
          'Collaborer avec l\'accompagnement psychosocial',
          'Participer aux évaluations régulières',
        ],
      },
    },
    priority: 85,
  });

  // Rule 9: Age minimum non respecté
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: INSERTION_CONSTANTS.MIN_AGE_GENERAL,
        },
      ],
    },
    event: {
      type: 'insertion-ineligible',
      params: {
        reason: `Âge minimum non atteint (${INSERTION_CONSTANTS.MIN_AGE_GENERAL} ans requis)`,
      },
    },
    priority: 200,
  });

  // Rule 10: Stage First - Âge maximum dépassé
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'proposedDevice',
          operator: 'equal',
          value: 'stage-first',
        },
        {
          fact: 'age',
          operator: 'greaterThan',
          value: INSERTION_CONSTANTS.MAX_AGE_STAGE_FIRST,
        },
      ],
    },
    event: {
      type: 'insertion-ineligible',
      params: {
        reason: `Âge maximum dépassé pour Stage First (${INSERTION_CONSTANTS.MAX_AGE_STAGE_FIRST} ans maximum)`,
      },
    },
    priority: 150,
  });

  return engine;
}

/**
 * Singleton instance of the InsertionProfessionnelle rules engine
 */
const insertionProfessionnelleEngineInstance = createInsertionProfessionnelleEngine();

/**
 * Calculate Insertion Professionnelle amount based on device type
 */
export function calculateInsertionProfessionnelleAmount(
  device: InsertionDevice,
  durationMonths: number = 1
): number {
  switch (device) {
    case 'stage-first':
      return INSERTION_CONSTANTS.STAGE_FIRST_MONTHLY_ALLOWANCE * durationMonths;
    case 'activa':
      const effectiveDuration = Math.min(durationMonths, INSERTION_CONSTANTS.ACTIVA_REDUCTION_DURATION);
      return INSERTION_CONSTANTS.ACTIVA_MONTHLY_REDUCTION * effectiveDuration;
    case 'titres-services':
      const weeklyHours = INSERTION_CONSTANTS.TITRES_SERVICES_MIN_WEEKLY_HOURS;
      const hourlyWage = INSERTION_CONSTANTS.TITRES_SERVICES_MIN_HOURLY_WAGE;
      return weeklyHours * hourlyWage * 4 * durationMonths;
    default:
      return 0;
  }
}

/**
 * Calculate employer benefits for insertion device
 */
export function calculateEmployerBenefits(
  device: InsertionDevice,
  durationMonths: number = 1
): number {
  switch (device) {
    case 'stage-first':
      const effectiveDuration = Math.min(durationMonths, INSERTION_CONSTANTS.STAGE_FIRST_MAX_DURATION);
      return INSERTION_CONSTANTS.STAGE_FIRST_EMPLOYER_BONUS * effectiveDuration;
    case 'activa':
      const activaDuration = Math.min(durationMonths, INSERTION_CONSTANTS.ACTIVA_REDUCTION_DURATION);
      return INSERTION_CONSTANTS.ACTIVA_MONTHLY_REDUCTION * activaDuration;
    default:
      return 0;
  }
}

/**
 * Determine the most suitable insertion device based on profile
 */
export function determineBestDevice(user: InsertionUser): InsertionDevice {
  if (user.isBeneficiaireRIS && user.risDurationMonths >= INSERTION_CONSTANTS.RIS_MIN_DURATION_MONTHS) {
    return 'article-60';
  }

  if (user.hasDisability && user.disabilityPercentage >= INSERTION_CONSTANTS.DISABILITY_PERCENTAGE_ETA) {
    return 'eta';
  }

  if (user.age <= INSERTION_CONSTANTS.MAX_AGE_STAGE_FIRST &&
      (user.qualificationLevel === 'aucune' || user.qualificationLevel === 'faible') &&
      user.isRegisteredActiris &&
      user.actirisRegistrationMonths >= 3) {
    return 'stage-first';
  }

  if (user.hasSocialProblems && user.profileType === 'tres-eloigne-emploi') {
    return 'sine';
  }

  if (user.unemploymentDurationMonths >= INSERTION_CONSTANTS.VERY_LONG_TERM_UNEMPLOYED) {
    return 'activa';
  }

  if (user.unemploymentDurationMonths >= INSERTION_CONSTANTS.LONG_TERM_UNEMPLOYED &&
      (user.qualificationLevel === 'faible' || user.qualificationLevel === 'aucune')) {
    return 'ptp';
  }

  if (user.isParentIsole || user.yearsWithoutWork >= 3) {
    return 'titres-services';
  }

  return 'fpi-ibo';
}

/**
 * Get maximum duration for a device
 */
export function getDeviceMaxDuration(device: InsertionDevice): string {
  switch (device) {
    case 'article-60':
      return '24 mois';
    case 'ptp':
      return '24 mois maximum';
    case 'stage-first':
      return '3 à 6 mois';
    case 'fpi-ibo':
      return '26 semaines';
    case 'activa':
    case 'titres-services':
    case 'eta':
    case 'sine':
      return 'illimitée';
    default:
      return 'variable';
  }
}

/**
 * Check Insertion Professionnelle eligibility
 */
export async function checkInsertionProfessionnelleEligibility(
  user: InsertionUser
): Promise<EligibilityCheck> {
  const facts = {
    age: user.age,
    isBeneficiaireRIS: user.isBeneficiaireRIS,
    risDurationMonths: user.risDurationMonths,
    unemploymentDurationMonths: user.unemploymentDurationMonths,
    qualificationLevel: user.qualificationLevel,
    hasDisability: user.hasDisability,
    disabilityPercentage: user.disabilityPercentage,
    isParentIsole: user.isParentIsole,
    numberOfChildren: user.numberOfChildren,
    yearsWithoutWork: user.yearsWithoutWork,
    isRegisteredActiris: user.isRegisteredActiris,
    actirisRegistrationMonths: user.actirisRegistrationMonths,
    hasSocialProblems: user.hasSocialProblems,
    profileType: user.profileType,
    proposedDevice: user.proposedDevice,
    proposedSector: user.proposedSector,
  };

  try {
    const results = await insertionProfessionnelleEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'insertion-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'insertion-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'insertion-professionnelle',
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    if (eligibleEvent) {
      const device = eligibleEvent.params?.device as InsertionDevice;
      return {
        benefitType: 'insertion-professionnelle',
        isEligible: true,
        calculatedAmount: calculateInsertionProfessionnelleAmount(device, 1),
        details: {
          device: device,
          maxDuration: eligibleEvent.params?.maxDuration,
          benefits: eligibleEvent.params?.benefits,
          employerBenefits: eligibleEvent.params?.employerBenefits,
          obligations: eligibleEvent.params?.obligations,
        },
      };
    }

    return {
      benefitType: 'insertion-professionnelle',
      isEligible: false,
      reason: 'Conditions non remplies pour le dispositif demandé',
    };
  } catch (error) {
    throw new Error(`Error checking Insertion Professionnelle eligibility: ${error}`);
  }
}

/**
 * Check cumulative benefits during insertion
 */
export function checkCumulativeBenefits(
  device: InsertionDevice,
  numberOfChildren: number,
  netSalary: number
): string[] {
  const benefits: string[] = [];

  benefits.push('Maintien des allocations familiales');

  if (device === 'article-60') {
    benefits.push('Prime d\'installation possible en cas de déménagement');
    benefits.push('Tarif social pour l\'énergie');
    benefits.push('Carte médicale CPAS maintenue pendant 1 an');
  }

  if (numberOfChildren > 0) {
    benefits.push('Intervention possible dans les frais de garde');
  }

  return benefits;
}

/**
 * Get transition options at end of insertion contract
 */
export function getTransitionOptions(device: InsertionDevice): string[] {
  const options: string[] = [];

  switch (device) {
    case 'article-60':
      options.push('Accompagnement à la recherche d\'emploi');
      options.push('CV valorisé avec l\'expérience acquise');
      options.push('Bilan de compétences');
      options.push('Candidature possible en interne à la commune');
      options.push('Ouverture des droits complets au chômage');
      options.push('Accès aux emplois ACS/APE');
      break;
    case 'ptp':
      options.push('Priorité pour un CDI chez l\'employeur');
      options.push('Expérience valorisée');
      break;
    case 'stage-first':
      options.push('70% de chances d\'embauche');
      options.push('Formation reconnue');
      break;
    case 'fpi-ibo':
      options.push('Garantie d\'embauche en CDI');
      options.push('Qualification professionnelle acquise');
      break;
    default:
      options.push('Accompagnement vers l\'emploi durable');
  }

  return options;
}

/**
 * Check if restart is possible after interrupted insertion
 */
export function canRestartAfterInterruption(
  interruptionReason: 'medical' | 'personal' | 'employer' | 'abandonment',
  isJustified: boolean
): { canRestart: boolean; conditions: string[] } {
  if (interruptionReason === 'medical' && isJustified) {
    return {
      canRestart: true,
      conditions: [
        'Accès à un nouveau dispositif possible',
        'Historique pris en compte positivement',
        'Accompagnement renforcé',
        'Période d\'interruption non pénalisante',
        'Possibilité de choisir un autre secteur d\'activité',
      ],
    };
  }

  if (interruptionReason === 'employer' || (interruptionReason === 'personal' && isJustified)) {
    return {
      canRestart: true,
      conditions: [
        'Réinscription comme demandeur d\'emploi requise',
        'Évaluation de la situation',
        'Accompagnement adapté',
      ],
    };
  }

  if (interruptionReason === 'abandonment' && !isJustified) {
    return {
      canRestart: false,
      conditions: [
        'Délai de carence possible',
        'Justification requise',
        'Évaluation sociale préalable',
      ],
    };
  }

  return {
    canRestart: true,
    conditions: ['Évaluation au cas par cas'],
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const INSERTION_PROFESSIONNELLE_RULES_JSON = {
  legalFramework: {
    mainLaws: [
      'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale (Article 60§7)',
      'Arrêté royal du 9 juin 1997 relatif aux programmes de transition professionnelle',
      'Arrêté royal du 19 décembre 2001 relatif à l\'activation des allocations de chômage (Activa)',
    ],
    regions: {
      wallonie: 'Décret du 10 juillet 2013 relatif à l\'insertion professionnelle',
      bruxelles: 'Ordonnance du 23 juin 2017 relative aux aides à l\'emploi',
    },
  },
  devices: [
    {
      name: 'Article 60§7',
      targetGroup: 'Bénéficiaires RIS',
      maxDuration: '24 mois',
      mainBenefit: 'Reconstitution des droits au chômage',
      conditions: ['Bénéficiaire RIS depuis minimum 3 mois'],
    },
    {
      name: 'Programme de Transition Professionnelle',
      targetGroup: 'Chômeurs longue durée peu qualifiés',
      maxDuration: '24 mois',
      mainBenefit: 'Formation et expérience professionnelle',
      conditions: ['Chômage >= 12 mois', 'Qualification faible ou aucune'],
    },
    {
      name: 'Stage First',
      targetGroup: 'Jeunes sans diplôme',
      maxDuration: '3-6 mois',
      mainBenefit: 'Formation + indemnité 200€/mois',
      conditions: ['Âge <= 30 ans', 'Inscrit Actiris >= 3 mois', 'Sans diplôme'],
    },
    {
      name: 'Activa',
      targetGroup: 'Chômeurs très longue durée',
      maxDuration: 'Illimitée',
      mainBenefit: 'CDI avec réduction ONSS 1000€/mois pendant 30 mois',
      conditions: ['Chômage >= 24 mois'],
    },
    {
      name: 'Titres-services',
      targetGroup: 'Personnes éloignées de l\'emploi',
      maxDuration: 'Illimitée',
      mainBenefit: 'Emploi dans les services de proximité',
      conditions: ['Personne éloignée de l\'emploi'],
    },
  ],
};