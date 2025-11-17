/**
 * Business Rules for Trademark (Marque) Procedures in Belgium/Benelux
 *
 * BASE JURIDIQUE:
 * - Convention Benelux en matière de propriété intellectuelle (CBPI)
 *   https://www.boip.int/fr/convention-benelux
 * - Règlement (UE) 2017/1001 sur la marque de l'Union européenne
 *   https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32017R1001
 * - Code de droit économique, Livre XI, Titre 5
 */

import { Engine } from 'json-rules-engine';
import { TrademarkApplication, TrademarkType, TrademarkStatus, IP_CONSTANTS } from '../modele-metier/proprieteIntellectuelleTypes';

/**
 * Create trademark eligibility rules engine
 */
function createTrademarkEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Distinctive character
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasDistinctiveCharacter',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isDescriptive',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'trademark-distinctive',
      params: {
        message: 'La marque possède un caractère distinctif',
        requirement: 'Article 2.2bis CBPI',
      },
    },
    priority: 10,
  });

  // Rule 2: Not generic or descriptive
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'isGeneric',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isDescriptive',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isUsualInTrade',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'trademark-ineligible',
      params: {
        reason: 'Marque descriptive, générique ou usuelle dans le commerce',
        legalBasis: 'Article 2.2bis(1)(b-d) CBPI',
      },
    },
    priority: 10,
  });

  // Rule 3: No conflict with prior rights
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasIdenticalPriorMark',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasSimilarPriorMark',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'trademark-conflict',
      params: {
        reason: 'Conflit avec une marque antérieure',
        action: 'Opposition probable dans les 2 mois',
      },
    },
    priority: 9,
  });

  // Rule 4: Public order and morality
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'againstPublicOrder',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'againstMorality',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'trademark-ineligible',
      params: {
        reason: 'Contraire à l\'ordre public ou aux bonnes mœurs',
        legalBasis: 'Article 2.2bis(1)(e) CBPI',
      },
    },
    priority: 10,
  });

  // Rule 5: Misleading character
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'isMisleading',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isDeceptive',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'trademark-ineligible',
      params: {
        reason: 'Marque trompeuse sur la nature, qualité ou origine',
        legalBasis: 'Article 2.2bis(1)(f) CBPI',
      },
    },
    priority: 9,
  });

  // Rule 6: Opposition deadline
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isPublished',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'monthsSincePublication',
          operator: 'greaterThan',
          value: IP_CONSTANTS.DEADLINES.OPPOSITION_FILING,
        },
      ],
    },
    event: {
      type: 'opposition-period-expired',
      params: {
        message: 'Période d\'opposition de 2 mois expirée',
        canRegister: true,
      },
    },
    priority: 7,
  });

  // Rule 7: Use requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isRegistered',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'yearsSinceRegistration',
          operator: 'greaterThanInclusive',
          value: 5,
        },
        {
          fact: 'hasGenuineUse',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'trademark-vulnerable-cancellation',
      params: {
        reason: 'Marque susceptible de déchéance pour non-usage (5 ans)',
        legalBasis: 'Article 2.26 CBPI',
      },
    },
    priority: 8,
  });

  return engine;
}

// Singleton instance
const trademarkEngineInstance = createTrademarkEngine();

/**
 * Check trademark application eligibility
 */
export async function checkTrademarkEligibility(application: Partial<TrademarkApplication>): Promise<{
  isEligible: boolean;
  requirements?: string[];
  risks?: string[];
}> {
  const facts = {
    hasDistinctiveCharacter: (application as any).hasDistinctiveCharacter !== false,
    isDescriptive: (application as any).isDescriptive ?? false,
    isGeneric: (application as any).isGeneric ?? false,
    isUsualInTrade: (application as any).isUsualInTrade ?? false,
    hasIdenticalPriorMark: (application as any).hasIdenticalConflict ?? false,
    hasSimilarPriorMark: (application as any).hasSimilarConflict ?? false,
    againstPublicOrder: (application as any).againstPublicOrder ?? false,
    againstMorality: (application as any).againstMorality ?? false,
    isMisleading: (application as any).isMisleading ?? false,
    isDeceptive: (application as any).isDeceptive ?? false,
    isPublished: application.status === 'publie',
    monthsSincePublication: (application as any).monthsSincePublication ?? 0,
    isRegistered: application.status === 'enregistre',
    yearsSinceRegistration: (application as any).yearsSinceRegistration ?? 0,
    hasGenuineUse: (application as any).hasGenuineUse !== false,
  };

  const results = await trademarkEngineInstance.run(facts);

  const positiveEvents = results.events.filter(e =>
    e.type === 'trademark-distinctive' || e.type === 'opposition-period-expired'
  );

  const negativeEvents = results.events.filter(e =>
    e.type === 'trademark-ineligible' || e.type === 'trademark-conflict'
  );

  const risks = results.events.filter(e =>
    e.type === 'trademark-vulnerable-cancellation'
  );

  return {
    isEligible: negativeEvents.length === 0,
    requirements: positiveEvents.map(e => e.params?.message).filter(Boolean),
    risks: [...negativeEvents, ...risks].map(e => e.params?.reason).filter(Boolean),
  };
}

/**
 * Calculate trademark fees
 */
export function calculateTrademarkFees(
  territory: 'benelux' | 'eu' | 'international',
  numberOfClasses: number,
  isRenewal: boolean = false
): {
  baseFee: number;
  additionalClassFees: number;
  totalFee: number;
} {
  let baseFee = 0;
  let additionalClassFees = 0;

  if (territory === 'benelux') {
    if (isRenewal) {
      baseFee = IP_CONSTANTS.FEES.TRADEMARK.RENEWAL;
    } else {
      baseFee = IP_CONSTANTS.FEES.TRADEMARK.FILING_BENELUX;
    }

    // Additional classes beyond 3
    if (numberOfClasses > 3) {
      additionalClassFees = (numberOfClasses - 3) * IP_CONSTANTS.FEES.TRADEMARK.CLASS_ADDITIONAL;
    }
  } else if (territory === 'eu') {
    baseFee = IP_CONSTANTS.FEES.TRADEMARK.FILING_EU;
    // EU includes 1 class, additional from 2nd
    if (numberOfClasses > 1) {
      additionalClassFees = (numberOfClasses - 1) * 150; // EU additional class fee
    }
  } else if (territory === 'international') {
    // Madrid system
    baseFee = 653; // Basic fee CHF converted to EUR
    additionalClassFees = numberOfClasses * 100; // Per class in Madrid
  }

  return {
    baseFee,
    additionalClassFees,
    totalFee: baseFee + additionalClassFees,
  };
}

/**
 * Check trademark renewal requirements
 */
export function checkTrademarkRenewal(
  registrationDate: Date,
  lastRenewalDate?: Date
): {
  renewalDue: boolean;
  dueDate?: Date;
  gracePeriodEnd?: Date;
  fees?: number;
} {
  const now = new Date();
  const yearsSinceRegistration = Math.floor(
    (now.getTime() - registrationDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  const periods = Math.floor(yearsSinceRegistration / IP_CONSTANTS.TRADEMARK_TERM);
  const nextRenewalDate = new Date(registrationDate);
  nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + (periods + 1) * IP_CONSTANTS.TRADEMARK_TERM);

  // Grace period of 6 months
  const gracePeriodEnd = new Date(nextRenewalDate);
  gracePeriodEnd.setMonth(gracePeriodEnd.getMonth() + IP_CONSTANTS.TRADEMARK_GRACE_PERIOD);

  const isDue = now >= new Date(nextRenewalDate.getTime() - 6 * 30 * 24 * 60 * 60 * 1000); // 6 months before

  return {
    renewalDue: isDue,
    dueDate: nextRenewalDate,
    gracePeriodEnd,
    fees: IP_CONSTANTS.FEES.TRADEMARK.RENEWAL,
  };
}

/**
 * Validate Nice classification
 */
export function validateNiceClasses(classes: number[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!classes || classes.length === 0) {
    errors.push('Au moins une classe de Nice doit être sélectionnée');
  }

  classes.forEach(cls => {
    if (cls < 1 || cls > 45) {
      errors.push(`Classe ${cls} invalide (doit être entre 1 et 45)`);
    }
  });

  // Check for duplicates
  const uniqueClasses = new Set(classes);
  if (uniqueClasses.size !== classes.length) {
    errors.push('Classes en double détectées');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check likelihood of confusion
 */
export function assessConfusionRisk(
  mark1: string,
  mark2: string,
  sameClasses: boolean
): {
  risk: 'high' | 'medium' | 'low';
  factors: string[];
} {
  const factors: string[] = [];
  let riskScore = 0;

  // Visual similarity
  const visualSimilarity = calculateSimilarity(mark1.toLowerCase(), mark2.toLowerCase());
  if (visualSimilarity > 0.8) {
    factors.push('Forte similarité visuelle');
    riskScore += 3;
  } else if (visualSimilarity > 0.6) {
    factors.push('Similarité visuelle modérée');
    riskScore += 2;
  }

  // Phonetic similarity (simplified)
  if (soundsLike(mark1, mark2)) {
    factors.push('Similarité phonétique');
    riskScore += 2;
  }

  // Same classes
  if (sameClasses) {
    factors.push('Mêmes classes de produits/services');
    riskScore += 3;
  }

  // Length similarity
  if (Math.abs(mark1.length - mark2.length) <= 2) {
    factors.push('Longueur similaire');
    riskScore += 1;
  }

  let risk: 'high' | 'medium' | 'low';
  if (riskScore >= 6) {
    risk = 'high';
  } else if (riskScore >= 3) {
    risk = 'medium';
  } else {
    risk = 'low';
  }

  return { risk, factors };
}

// Helper functions
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function soundsLike(str1: string, str2: string): boolean {
  // Simplified phonetic comparison
  const normalize = (s: string) => s.toLowerCase()
    .replace(/ph/g, 'f')
    .replace(/[aeiou]/g, '')
    .replace(/(.)\1+/g, '$1');

  return normalize(str1) === normalize(str2);
}

/**
 * Export rules for transparency
 */
export const TRADEMARK_RULES_JSON = {
  legalFramework: {
    benelux: {
      title: 'Convention Benelux en matière de propriété intellectuelle',
      url: 'https://www.boip.int/fr/convention-benelux',
    },
    european: {
      title: 'Règlement (UE) 2017/1001 sur la marque de l\'Union européenne',
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32017R1001',
    },
  },
  requirements: {
    distinctiveness: 'Caractère distinctif (Article 2.2bis CBPI)',
    availability: 'Absence de droits antérieurs',
    lawfulness: 'Conformité à l\'ordre public et aux bonnes mœurs',
    nonDeceptive: 'Caractère non trompeur',
  },
  absoluteGrounds: [
    'Signes descriptifs',
    'Termes génériques',
    'Signes usuels dans le commerce',
    'Signes trompeurs',
    'Signes contraires à l\'ordre public',
  ],
  fees: IP_CONSTANTS.FEES.TRADEMARK,
  deadlines: {
    opposition: `${IP_CONSTANTS.TRADEMARK_OPPOSITION_PERIOD} mois après publication`,
    renewal: `Tous les ${IP_CONSTANTS.TRADEMARK_TERM} ans`,
    grace: `${IP_CONSTANTS.TRADEMARK_GRACE_PERIOD} mois après expiration`,
    use: '5 ans pour éviter déchéance',
  },
};