/**
 * Business Rules for Artist Status (Statut d'Artiste)
 *
 * BASE JURIDIQUE:
 * - Arrêté royal du 16 novembre 2009 relatif à la protection sociale des artistes
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2009111603
 * - Loi-programme du 24 décembre 2002, article 1bis
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002122445
 * - Arrêté royal du 26 mars 2003 portant création de la Commission Artistes
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2003032638
 */

import { Engine } from 'json-rules-engine';
import {
  Artist,
  ArtistStatusEligibility,
  ARTIST_STATUS_CONSTANTS,
  ArtistFactsForRules,
  ArtistRulesResult,
  ArtistCategory,
  ArtistStatus
} from '../modele-metier/statutArtisteTypes';

/**
 * Create the Artist Status eligibility rules engine
 */
function createArtistStatusEngine(): Engine {
  const engine = new Engine();

  // ========== ELIGIBILITY RULES ==========

  // Rule 1: Minimum age requirement (18+)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: 18,
        },
      ],
    },
    event: {
      type: 'artist-ineligible',
      params: {
        reason: 'Âge minimum de 18 ans requis pour le statut d\'artiste',
        priority: 10,
        category: 'age',
      },
    },
    priority: 10,
  });

  // Rule 2: Residency requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'hors-UE sans permis',
        },
      ],
    },
    event: {
      type: 'artist-ineligible',
      params: {
        reason: 'Permis de travail requis pour les artistes hors-UE',
        priority: 10,
        category: 'residency',
      },
    },
    priority: 10,
  });

  // Rule 3: Minimum days worked (standard)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'daysWorkedArtistic',
          operator: 'lessThan',
          value: ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD,
        },
        {
          fact: 'yearsExperience',
          operator: 'greaterThan',
          value: 0,
        },
      ],
    },
    event: {
      type: 'artist-ineligible',
      params: {
        reason: `Minimum ${ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD} jours de prestations artistiques requis (vous avez {daysWorkedArtistic} jours)`,
        priority: 9,
        category: 'days',
      },
    },
    priority: 9,
  });

  // Rule 4: Minimum days worked (debutant - reduced threshold)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'daysWorkedArtistic',
          operator: 'lessThan',
          value: ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_REDUCED,
        },
        {
          fact: 'yearsExperience',
          operator: 'equal',
          value: 0,
        },
      ],
    },
    event: {
      type: 'artist-ineligible',
      params: {
        reason: `Minimum ${ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_REDUCED} jours requis pour première demande (vous avez {daysWorkedArtistic} jours)`,
        priority: 9,
        category: 'days',
      },
    },
    priority: 9,
  });

  // Rule 5: Minimum artistic income
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'annualIncomeArtistic',
          operator: 'lessThan',
          value: ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME,
        },
      ],
    },
    event: {
      type: 'artist-ineligible',
      params: {
        reason: `Revenus artistiques insuffisants (minimum ${ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME}€ requis)`,
        priority: 8,
        category: 'income',
      },
    },
    priority: 8,
  });

  // Rule 6: Maximum non-artistic income
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'annualIncomeNonArtistic',
          operator: 'greaterThan',
          value: ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME,
        },
      ],
    },
    event: {
      type: 'artist-ineligible',
      params: {
        reason: `Revenus non-artistiques dépassent le plafond (${ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME}€ maximum)`,
        priority: 7,
        category: 'income',
      },
    },
    priority: 7,
  });

  // ========== STATUS DETERMINATION RULES ==========

  // Rule 7: Professional artist status
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'daysWorkedArtistic',
          operator: 'greaterThanInclusive',
          value: ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD,
        },
        {
          fact: 'annualIncomeArtistic',
          operator: 'greaterThanInclusive',
          value: 15000,
        },
        {
          fact: 'yearsExperience',
          operator: 'greaterThanInclusive',
          value: 2,
        },
      ],
    },
    event: {
      type: 'artist-status-professional',
      params: {
        status: 'professionnel',
        message: 'Statut d\'artiste professionnel accordé',
      },
    },
    priority: 5,
  });

  // Rule 8: Debutant artist status
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'daysWorkedArtistic',
          operator: 'greaterThanInclusive',
          value: ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_REDUCED,
        },
        {
          fact: 'annualIncomeArtistic',
          operator: 'greaterThanInclusive',
          value: ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME,
        },
        {
          fact: 'yearsExperience',
          operator: 'lessThan',
          value: 2,
        },
      ],
    },
    event: {
      type: 'artist-status-debutant',
      params: {
        status: 'débutant',
        message: 'Statut d\'artiste débutant accordé (première période)',
      },
    },
    priority: 5,
  });

  // Rule 9: Intermittent status
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employersCount',
          operator: 'greaterThanInclusive',
          value: 3,
        },
        {
          fact: 'daysWorkedArtistic',
          operator: 'greaterThanInclusive',
          value: ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD,
        },
      ],
    },
    event: {
      type: 'artist-status-intermittent',
      params: {
        status: 'intermittent',
        message: 'Statut d\'artiste intermittent accordé (multi-employeurs)',
      },
    },
    priority: 4,
  });

  // Rule 10: Mixed status (artistic + non-artistic income)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'annualIncomeArtistic',
          operator: 'greaterThanInclusive',
          value: ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME,
        },
        {
          fact: 'annualIncomeNonArtistic',
          operator: 'greaterThan',
          value: 5000,
        },
        {
          fact: 'annualIncomeNonArtistic',
          operator: 'lessThanInclusive',
          value: ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME,
        },
      ],
    },
    event: {
      type: 'artist-status-mixed',
      params: {
        status: 'mixte',
        message: 'Statut mixte accordé (revenus artistiques et non-artistiques)',
      },
    },
    priority: 4,
  });

  // ========== SPECIAL CATEGORY RULES ==========

  // Rule 11: Visual artist special calculation (exhibition days count double)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'category',
          operator: 'equal',
          value: 'plasticien',
        },
      ],
    },
    event: {
      type: 'artist-special-calculation',
      params: {
        calculation: 'exhibition-days-double',
        message: 'Jours d\'exposition comptent double pour artistes plasticiens',
      },
    },
    priority: 3,
  });

  // Rule 12: Writer/Author special regime
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'category',
          operator: 'equal',
          value: 'écrivain',
        },
      ],
    },
    event: {
      type: 'artist-special-calculation',
      params: {
        calculation: 'residence-days-double',
        message: 'Jours de résidence comptent double pour écrivains',
      },
    },
    priority: 3,
  });

  return engine;
}

/**
 * Singleton instance of the Artist Status rules engine
 * Performance optimization: Reuse engine instance
 */
const artistStatusEngineInstance = createArtistStatusEngine();

/**
 * Check artist status eligibility
 */
export async function checkArtistStatusEligibility(
  artist: Artist
): Promise<ArtistStatusEligibility> {
  // Prepare facts for the rules engine
  const facts: ArtistFactsForRules = {
    age: calculateAge(artist.personalInfo.dateOfBirth),
    category: artist.artistProfile.category,
    yearsExperience: artist.artistProfile.yearsOfExperience,
    daysWorkedArtistic: artist.professionalActivity.daysWorkedArtistic,
    daysWorkedTotal: artist.professionalActivity.daysWorked,
    annualIncomeArtistic: artist.financials.annualIncomeArtistic,
    annualIncomeNonArtistic: artist.financials.annualIncomeNonArtistic,
    hasVisaArtist: !!artist.artistProfile.visaArtist,
    residencyStatus: artist.personalInfo.residencyStatus,
    employersCount: artist.professionalActivity.employersCount,
  };

  try {
    const results = await artistStatusEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvents = results.events.filter((e) => e.type === 'artist-ineligible');

    if (ineligibleEvents.length > 0) {
      const reasons = ineligibleEvents.map((e) => e.params?.reason || 'Condition non remplie');
      const missingConditions = ineligibleEvents.map((e) => e.params?.category || 'unknown');

      return {
        isEligible: false,
        reasons,
        missingConditions,
        recommendations: generateRecommendations(facts, ineligibleEvents),
      };
    }

    // Determine status type
    const statusEvents = results.events.filter((e) =>
      e.type.startsWith('artist-status-')
    );

    if (statusEvents.length > 0) {
      const statusEvent = statusEvents[0]; // Take highest priority status
      const statusType = statusEvent.params?.status as ArtistStatus;

      return {
        isEligible: true,
        statusType,
        category: artist.artistProfile.category,
        recommendations: [statusEvent.params?.message || 'Statut d\'artiste accordé'],
        detailedAnalysis: generateDetailedAnalysis(facts),
      };
    }

    // Basic eligibility if no specific status determined
    if (facts.daysWorkedArtistic >= ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_REDUCED &&
        facts.annualIncomeArtistic >= ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME) {
      return {
        isEligible: true,
        statusType: 'professionnel',
        category: artist.artistProfile.category,
        recommendations: ['Éligible au statut d\'artiste'],
        detailedAnalysis: generateDetailedAnalysis(facts),
      };
    }

    return {
      isEligible: false,
      reasons: ['Conditions de base non remplies'],
      recommendations: ['Vérifiez les conditions minimales requises'],
    };

  } catch (error) {
    throw new Error(`Erreur lors de la vérification du statut d'artiste: ${error}`);
  }
}

/**
 * Calculate unemployment benefits for artists
 */
export async function calculateArtistUnemploymentBenefits(
  artist: Artist,
  category: 'isolé' | 'cohabitant' | 'chef de famille',
  cachetIncome: number = 0
): Promise<{
  eligible: boolean;
  dailyAllowance?: number;
  monthlyEstimate?: number;
  cachetExemption?: number;
  netBenefit?: number;
  reason?: string;
}> {
  // Check minimum days for unemployment
  if (artist.professionalActivity.daysWorkedArtistic < ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD) {
    return {
      eligible: false,
      reason: `Minimum ${ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD} jours requis sur ${ARTIST_STATUS_CONSTANTS.REFERENCE_PERIOD_MONTHS} mois`,
    };
  }

  const dailyRates = {
    'isolé': 65.96,
    'cohabitant': 43.78,
    'chef de famille': 65.96,
  };

  const dailyAllowance = dailyRates[category];
  const monthlyBase = dailyAllowance * 26; // 26 days average

  // Apply cachet rule
  let netBenefit = monthlyBase;
  let cachetExemption = 0;

  if (cachetIncome > 0) {
    cachetExemption = Math.min(cachetIncome, ARTIST_STATUS_CONSTANTS.DAILY_CACHET_EXEMPTION);
    const deduction = cachetIncome - cachetExemption;
    netBenefit = Math.max(0, monthlyBase - deduction);
  }

  return {
    eligible: true,
    dailyAllowance,
    monthlyEstimate: monthlyBase,
    cachetExemption,
    netBenefit,
  };
}

/**
 * Generate recommendations based on missing conditions
 */
function generateRecommendations(
  facts: ArtistFactsForRules,
  ineligibleEvents: any[]
): string[] {
  const recommendations: string[] = [];

  ineligibleEvents.forEach((event) => {
    const category = event.params?.category;

    switch (category) {
      case 'days':
        const daysNeeded = facts.yearsExperience === 0
          ? ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_REDUCED
          : ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD;
        const daysMissing = daysNeeded - facts.daysWorkedArtistic;
        recommendations.push(
          `Il vous manque ${daysMissing} jours de prestations artistiques. ` +
          `Continuez votre activité artistique et conservez vos preuves de prestations.`
        );
        break;

      case 'income':
        if (facts.annualIncomeArtistic < ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME) {
          recommendations.push(
            `Augmentez vos revenus artistiques (minimum ${ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME}€). ` +
            `Considérez plus de prestations ou l'augmentation de vos tarifs.`
          );
        }
        if (facts.annualIncomeNonArtistic > ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME) {
          recommendations.push(
            `Réduisez vos revenus non-artistiques ou optez pour le statut d'indépendant complémentaire.`
          );
        }
        break;

      case 'residency':
        recommendations.push(
          `Obtenez un permis de travail artistique auprès des autorités compétentes.`
        );
        break;

      case 'age':
        recommendations.push(
          `Attendez d'avoir 18 ans pour demander le statut d'artiste.`
        );
        break;
    }
  });

  // Add general recommendations
  if (facts.yearsExperience === 0) {
    recommendations.push(
      `En tant que débutant, vous bénéficiez de seuils réduits (${ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_REDUCED} jours).`
    );
  }

  if (!facts.hasVisaArtist) {
    recommendations.push(
      `Considérez de demander le visa artiste auprès de la Commission des Artistes pour faciliter vos démarches.`
    );
  }

  return recommendations;
}

/**
 * Generate detailed analysis
 */
function generateDetailedAnalysis(facts: ArtistFactsForRules) {
  const daysRequired = facts.yearsExperience === 0
    ? ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_REDUCED
    : ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD;

  return {
    daysRequirement: {
      required: daysRequired,
      actual: facts.daysWorkedArtistic,
      met: facts.daysWorkedArtistic >= daysRequired,
      derogationPossible: facts.yearsExperience === 0,
    },
    incomeRequirement: {
      minimumArtistic: ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME,
      actual: facts.annualIncomeArtistic,
      met: facts.annualIncomeArtistic >= ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME,
    },
    maxNonArtisticIncome: {
      maximum: ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME,
      actual: facts.annualIncomeNonArtistic,
      met: facts.annualIncomeNonArtistic <= ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME,
    },
  };
}

/**
 * Helper function to calculate age
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Export rules in JSON format for transparency
 */
export const ARTIST_STATUS_RULES_JSON = {
  legalFramework: {
    primaryLaw: {
      title: "Arrêté royal du 16 novembre 2009 relatif à la protection sociale des artistes",
      date: "2009-11-16",
      url: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2009111603",
    },
    supportingLaws: [
      {
        title: "Loi-programme du 24 décembre 2002, article 1bis",
        url: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002122445",
      },
      {
        title: "Arrêté royal du 26 mars 2003 portant création de la Commission Artistes",
        url: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2003032638",
      },
    ],
  },
  eligibilityRules: [
    {
      id: 'artist-age-minimum',
      description: 'Âge minimum de 18 ans',
      condition: 'age >= 18',
      priority: 10,
    },
    {
      id: 'artist-days-standard',
      description: `Minimum ${ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD} jours prestés`,
      condition: `daysWorkedArtistic >= ${ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD}`,
      priority: 9,
    },
    {
      id: 'artist-days-debutant',
      description: `Minimum ${ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_REDUCED} jours pour débutants`,
      condition: `daysWorkedArtistic >= ${ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_REDUCED} AND yearsExperience == 0`,
      priority: 9,
    },
    {
      id: 'artist-income-minimum',
      description: `Revenus artistiques minimum ${ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME}€`,
      condition: `annualIncomeArtistic >= ${ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME}`,
      priority: 8,
    },
    {
      id: 'artist-income-ceiling',
      description: `Revenus non-artistiques maximum ${ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME}€`,
      condition: `annualIncomeNonArtistic <= ${ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME}`,
      priority: 7,
    },
  ],
  statusTypes: {
    professionnel: 'Artiste professionnel à titre principal',
    débutant: 'Artiste débutant (première période)',
    intermittent: 'Artiste intermittent du spectacle',
    mixte: 'Statut mixte (revenus artistiques et non-artistiques)',
    indépendantComplémentaire: 'Artiste indépendant complémentaire',
  },
  constants: ARTIST_STATUS_CONSTANTS,
};