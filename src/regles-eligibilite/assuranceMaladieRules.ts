/**
 * Business Rules for Assurance Maladie-Invalidité (AMI)
 *
 * Implements Belgian mandatory health insurance system (INAMI/RIZIV)
 * Covers healthcare reimbursements, BIM status, and Maximum à Facturer (MAF)
 *
 * BASE JURIDIQUE:
 * - Loi relative à l'assurance obligatoire soins de santé et indemnités coordonnée le 14 juillet 1994
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994071438&table_name=loi
 * - Arrêté royal du 3 juillet 1996 portant exécution de la loi AMI
 * - Autorité: Institut National d'Assurance Maladie-Invalidité (INAMI)
 * - Dernière mise à jour: janvier 2024
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck, LegalReference } from '../modele-metier/types';

// INAMI 2024 reimbursement rates
export const REIMBURSEMENT_RATES_2024 = {
  ordinaire: {
    consultationGeneraliste: 0.75,  // 75% remboursement
    consultationSpecialiste: 0.75,  // 75% remboursement
    medicamentsCatA: 1.00,          // 100% remboursement
    medicamentsCatB: 0.75,          // 75% remboursement
    medicamentsCatC: 0.50,          // 50% remboursement
    medicamentsCatCs: 0.40,         // 40% remboursement (gros conditionnement)
    medicamentsCatCx: 0.20,         // 20% remboursement (médicaments de confort)
    hospitalisationChambreCommune: 1.00, // 100% frais médicaux
  },
  BIM: {  // Bénéficiaire de l'Intervention Majorée
    consultationGeneraliste: 0.90,  // 90% remboursement
    consultationSpecialiste: 0.90,  // 90% remboursement
    medicamentsCatA: 1.00,          // 100% remboursement
    medicamentsCatB: 0.85,          // 85% remboursement
    medicamentsCatC: 0.50,          // 50% remboursement (inchangé)
    medicamentsCatCs: 0.40,         // 40% remboursement (inchangé)
    medicamentsCatCx: 0.20,         // 20% remboursement (inchangé)
    hospitalisationChambreCommune: 1.00, // 100% frais médicaux
  },
};

// BIM (Bénéficiaire de l'Intervention Majorée) thresholds 2024
export const BIM_THRESHOLDS_2024 = {
  revenus: {
    menageUnePersonne: 22251.48,    // Ménage d'une personne
    personneSupplementaire: 4116.62, // Par personne à charge supplémentaire
  },
  categoriesAutomatiques: [
    'Bénéficiaire GRAPA',
    'Bénéficiaire RIS (Revenu d\'Intégration Sociale)',
    'Bénéficiaire ARR (Allocation de Remplacement de Revenus)',
    'Enfant avec allocation handicap >66%',
    'Orphelin',
    'Mineur étranger non accompagné',
  ],
  description: 'Statut donnant droit à des remboursements majorés',
};

// Consultation fees 2024
export const CONSULTATION_FEES_2024 = {
  generaliste: {
    tarifConventionne: 29.00,
    tarifNonConventionne: 'Variable (suppléments possibles)',
    dmg: { // Dossier Médical Global
      bonus: 'Remboursement majoré de 5€',
      conditionsCompletes: '2 consultations minimum/an',
    },
  },
  specialiste: {
    tarifConventionne: 50.00,
    tarifNonConventionne: 'Variable (suppléments possibles)',
    avecRenvoi: 'Remboursement normal',
    sansRenvoi: 'Remboursement réduit',
  },
};

// Maximum à Facturer (MAF) 2024
export const MAF_THRESHOLDS_2024 = {
  categories: [
    {
      revenus: { min: 0, max: 11733.97 },
      plafond: 250.00,
      description: 'Catégorie 1 - Revenus les plus bas',
    },
    {
      revenus: { min: 11733.98, max: 20537.69 },
      plafond: 450.00,
      description: 'Catégorie 2 - Revenus bas',
    },
    {
      revenus: { min: 20537.70, max: 31767.36 },
      plafond: 650.00,
      description: 'Catégorie 3 - Revenus moyens',
    },
    {
      revenus: { min: 31767.37, max: 42996.99 },
      plafond: 1000.00,
      description: 'Catégorie 4 - Revenus moyens-élevés',
    },
    {
      revenus: { min: 42997.00, max: 'Illimité' },
      plafond: 1500.00,
      description: 'Catégorie 5 - Revenus élevés',
    },
  ],
  mafSocial: {
    plafond: 250.00,
    conditions: 'Ménages BIM ou revenus très faibles',
  },
  mafChronique: {
    plafond: 'Réduit de 100€',
    conditions: 'Dépenses >365€ pendant 2 ans consécutifs',
  },
};

// Hospitalization costs 2024
export const HOSPITALIZATION_COSTS_2024 = {
  interventionPersonnelle: {
    jour1: { ordinaire: 44.51, BIM: 6.32 },
    jours2_90: { ordinaire: 17.02, BIM: 6.32 },
    apres91jours: { ordinaire: 6.32, BIM: 6.32 },
  },
  chambre: {
    commune: 'Pas de suppléments d\'honoraires',
    individuelle: 'Suppléments possibles (100-300% selon hôpital)',
  },
};

// Sick leave indemnities 2024
export const SICK_LEAVE_2024 = {
  salarie: {
    salaryGuarantee: {
      employe: { days: 30, rate: 1.00 },
      ouvrier: {
        week1: { rate: 1.00 },
        week2: { rate: 0.8588 },
        weeks3_4: { rate: 0.2588, mutuelle: 0.60 },
      },
    },
    incapacite: {
      primaryIncapacity: { // Jours 31-365
        rate: 0.60,
        maxDaily: 170.66,
        minDaily: { isolé: 60.56, cohabitant: 51.93, chargesFamille: 76.42 },
      },
      invalidity: { // Après 365 jours
        chargesFamille: { rate: 0.65, min: 76.42, max: 114.41 },
        isolé: { rate: 0.55, min: 60.56, max: 96.81 },
        cohabitant: { rate: 0.40, min: 51.93, max: 70.41 },
      },
    },
  },
  independant: {
    carence: { days: 7, rate: 0 },
    partial: { days: '8-14', rate: 'Partielle' },
    complete: { fromDay: 15, amount: 'Selon catégorie familiale' },
  },
};

// Legal framework
export const HEALTH_INSURANCE_LEGAL_FRAMEWORK: LegalReference = {
  type: 'loi',
  title: 'Loi relative à l\'assurance obligatoire soins de santé et indemnités',
  date: '1994-07-14',
  officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994071438&table_name=loi',
  articles: ['37', '37bis', '37ter', '37quater', '50', '56', '100'],
  lastAmended: '2024-01',
  authority: 'Institut National d\'Assurance Maladie-Invalidité (INAMI)',
};

/**
 * Create the health insurance eligibility rules engine
 */
function createHealthInsuranceEngine(): Engine {
  const engine = new Engine();

  // Rule 1: BIM automatic eligibility
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasGRAPA',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasRIS',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasARR',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isOrphan',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'bim-eligible-automatic',
      params: {
        message: 'Éligible BIM automatique',
        reason: 'Catégorie automatique',
      },
    },
    priority: 10,
  });

  // Rule 2: BIM income-based eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'yearlyIncome',
          operator: 'lessThanInclusive',
          value: BIM_THRESHOLDS_2024.revenus.menageUnePersonne,
          path: '.base',
        },
      ],
    },
    event: {
      type: 'bim-eligible-income',
      params: {
        message: 'Éligible BIM sur base des revenus',
        reason: 'Revenus sous le seuil',
      },
    },
    priority: 9,
  });

  // Rule 3: Mutuelle membership required
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasMutuelle',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'health-insurance-ineligible',
      params: {
        reason: 'Affiliation à une mutuelle obligatoire',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 4: Basic health insurance eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'paidContributions',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'health-insurance-eligible',
      params: {
        message: 'Éligible assurance maladie',
      },
    },
    priority: 5,
  });

  // Rule 5: MAF category determination
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'ticketModerateur',
          operator: 'greaterThan',
          value: 0,
        },
      ],
    },
    event: {
      type: 'maf-calculation-required',
      params: {
        message: 'Calcul MAF requis',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the health insurance rules engine
 */
const healthInsuranceEngineInstance = createHealthInsuranceEngine();

/**
 * Calculate reimbursement amount for medical services
 */
export function calculateReimbursement(
  serviceType: string,
  cost: number,
  hasBIM: boolean = false,
  hasDMG: boolean = false
): {
  reimbursed: number;
  ticketModerateur: number;
  details: string;
} {
  const rates = hasBIM ? REIMBURSEMENT_RATES_2024.BIM : REIMBURSEMENT_RATES_2024.ordinaire;
  let reimbursementRate = 0;

  switch (serviceType) {
    case 'consultation_generaliste':
      reimbursementRate = rates.consultationGeneraliste;
      break;
    case 'consultation_specialiste':
      reimbursementRate = rates.consultationSpecialiste;
      break;
    case 'medicament_catA':
      reimbursementRate = rates.medicamentsCatA;
      break;
    case 'medicament_catB':
      reimbursementRate = rates.medicamentsCatB;
      break;
    case 'medicament_catC':
      reimbursementRate = rates.medicamentsCatC;
      break;
    case 'hospitalisation':
      reimbursementRate = rates.hospitalisationChambreCommune;
      break;
    default:
      reimbursementRate = 0.75; // Default rate
  }

  // Apply DMG bonus for GP consultations
  let dmgBonus = 0;
  if (serviceType === 'consultation_generaliste' && hasDMG) {
    dmgBonus = 5; // 5€ bonus remboursement with DMG
  }

  const reimbursed = Math.min(cost * reimbursementRate + dmgBonus, cost);
  const ticketModerateur = cost - reimbursed;

  return {
    reimbursed: Math.round(reimbursed * 100) / 100,
    ticketModerateur: Math.round(ticketModerateur * 100) / 100,
    details: `Taux remboursement: ${(reimbursementRate * 100)}%${hasDMG ? ' + DMG bonus' : ''}${hasBIM ? ' (BIM)' : ''}`,
  };
}

/**
 * Calculate MAF (Maximum à Facturer) threshold
 */
export function calculateMAFThreshold(yearlyIncome: number, householdSize: number): number {
  // Adjust income for household size
  const adjustedIncome = yearlyIncome + (householdSize - 1) * BIM_THRESHOLDS_2024.revenus.personneSupplementaire;

  for (const category of MAF_THRESHOLDS_2024.categories) {
    const maxIncome = category.revenus.max === 'Illimité' ? Infinity : category.revenus.max as number;
    if (adjustedIncome >= category.revenus.min && adjustedIncome <= maxIncome) {
      return category.plafond;
    }
  }

  return MAF_THRESHOLDS_2024.categories[MAF_THRESHOLDS_2024.categories.length - 1].plafond;
}

/**
 * Calculate sick leave indemnity
 */
export function calculateSickLeaveIndemnity(
  dailySalary: number,
  daysSick: number,
  employmentType: 'salarie' | 'independant',
  familySituation: 'isolé' | 'cohabitant' | 'chargesFamille'
): number {
  if (employmentType === 'independant') {
    if (daysSick <= 7) return 0; // Carence period
    if (daysSick <= 14) return dailySalary * 0.5; // Partial indemnity
    // Full indemnity based on family situation
    const baseRates = { isolé: 38.44, cohabitant: 31.37, chargesFamille: 57.52 };
    return baseRates[familySituation];
  }

  // Employee sick leave
  if (daysSick <= 30) {
    return dailySalary; // Salary guarantee period
  }

  // Primary incapacity (days 31-365)
  if (daysSick <= 365) {
    const indemnity = dailySalary * SICK_LEAVE_2024.salarie.incapacite.primaryIncapacity.rate;
    const max = SICK_LEAVE_2024.salarie.incapacite.primaryIncapacity.maxDaily;
    const min = SICK_LEAVE_2024.salarie.incapacite.primaryIncapacity.minDaily[familySituation];
    return Math.max(Math.min(indemnity, max), min);
  }

  // Invalidity (after 365 days)
  const invalidityRates = SICK_LEAVE_2024.salarie.incapacite.invalidity[familySituation === 'chargesFamille' ? 'chargesFamille' :
                          familySituation === 'isolé' ? 'isolé' : 'cohabitant'];
  const indemnity = dailySalary * invalidityRates.rate;
  return Math.max(Math.min(indemnity, invalidityRates.max), invalidityRates.min);
}

/**
 * Interface for health insurance user
 */
export interface HealthInsuranceUser {
  hasMutuelle: boolean;
  paidContributions: boolean;
  yearlyIncome: number;
  householdSize: number;
  hasGRAPA?: boolean;
  hasRIS?: boolean;
  hasARR?: boolean;
  isOrphan?: boolean;
  medicalExpenses?: number;
  employmentType?: 'salarie' | 'independant' | 'chomeur' | 'pensione';
}

/**
 * Check health insurance eligibility and calculate benefits
 */
export async function checkHealthInsuranceEligibility(
  user: HealthInsuranceUser
): Promise<EligibilityCheck> {
  const facts = {
    hasMutuelle: user.hasMutuelle,
    paidContributions: user.paidContributions,
    yearlyIncome: { base: user.yearlyIncome },
    hasGRAPA: user.hasGRAPA || false,
    hasRIS: user.hasRIS || false,
    hasARR: user.hasARR || false,
    isOrphan: user.isOrphan || false,
    ticketModerateur: user.medicalExpenses || 0,
  };

  try {
    const results = await healthInsuranceEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'health-insurance-ineligible');
    if (ineligibleEvent) {
      return {
        benefitType: 'family-allowance', // Placeholder
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    const eligibleEvent = results.events.find((e) => e.type === 'health-insurance-eligible');
    const bimEvent = results.events.find((e) => e.type.startsWith('bim-eligible'));

    if (eligibleEvent) {
      const hasBIM = !!bimEvent;
      const mafThreshold = calculateMAFThreshold(user.yearlyIncome, user.householdSize);

      return {
        benefitType: 'family-allowance', // Placeholder
        isEligible: true,
        optimizationSuggestion: `${hasBIM ? 'Statut BIM actif - remboursements majorés' : 'Statut ordinaire'}. MAF annuel: ${mafThreshold}€`,
        calculatedAmount: mafThreshold,
      };
    }

    return {
      benefitType: 'family-allowance',
      isEligible: false,
      reason: 'Conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking health insurance eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const HEALTH_INSURANCE_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: HEALTH_INSURANCE_LEGAL_FRAMEWORK.title,
      date: HEALTH_INSURANCE_LEGAL_FRAMEWORK.date,
      officialUrl: HEALTH_INSURANCE_LEGAL_FRAMEWORK.officialUrl,
      authority: HEALTH_INSURANCE_LEGAL_FRAMEWORK.authority,
      articles: HEALTH_INSURANCE_LEGAL_FRAMEWORK.articles,
      lastAmended: HEALTH_INSURANCE_LEGAL_FRAMEWORK.lastAmended,
    },
    implementingDecrees: [
      {
        title: 'Arrêté royal portant exécution de la loi AMI',
        date: '1996-07-03',
        officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1996070350&table_name=loi',
      },
    ],
  },
  reimbursementRates: REIMBURSEMENT_RATES_2024,
  bimStatus: {
    thresholds: BIM_THRESHOLDS_2024,
    advantages: [
      'Remboursements majorés (90% au lieu de 75%)',
      'Ticket modérateur réduit',
      'MAF social (plafond 250€)',
      'Tarifs sociaux énergie et télécom',
      'Réductions transports publics',
    ],
  },
  mafSystem: {
    categories: MAF_THRESHOLDS_2024.categories,
    principe: 'Protection contre dépenses médicales excessives',
    remboursement: 'Automatique au-delà du plafond annuel',
  },
  consultationFees: CONSULTATION_FEES_2024,
  hospitalization: HOSPITALIZATION_COSTS_2024,
  sickLeave: SICK_LEAVE_2024,
  obligations: [
    'Affiliation obligatoire à une mutuelle',
    'Paiement des cotisations sociales',
    'Déclaration changement situation (emploi, adresse, état civil)',
    'Utilisation carte eID/ISI+',
    'Respect parcours de soins (DMG, renvoi spécialiste)',
  ],
  lastUpdate: '2024-01-01',
  source: 'INAMI - Institut National d\'Assurance Maladie-Invalidité',
};