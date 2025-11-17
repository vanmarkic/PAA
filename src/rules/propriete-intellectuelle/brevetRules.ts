/**
 * Business Rules for Patent (Brevet) Procedures in Belgium
 *
 * BASE JURIDIQUE:
 * - Loi du 28 mars 1984 sur les brevets d'invention
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1984032830&table_name=loi
 * - Convention sur le brevet européen (CBE)
 *   https://www.epo.org/law-practice/legal-texts/epc_fr.html
 * - Code de droit économique, Livre XI
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2013022819&table_name=loi
 */

import { Engine } from 'json-rules-engine';
import { PatentApplication, PatentStatus, PatentType, IP_CONSTANTS } from '../../domain/proprieteIntellectuelleTypes';

/**
 * Create patent eligibility rules engine
 */
function createPatentEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Novelty requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasAbsoluteNovelty',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'priorArtExists',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'patent-novelty-satisfied',
      params: {
        message: 'L\'invention présente une nouveauté absolue',
        requirement: 'Article 3 CBE - Nouveauté',
      },
    },
    priority: 10,
  });

  // Rule 2: Inventive step requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasInventiveStep',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isObviousToSkilledPerson',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'patent-inventive-step-satisfied',
      params: {
        message: 'L\'invention implique une activité inventive',
        requirement: 'Article 56 CBE - Activité inventive',
      },
    },
    priority: 9,
  });

  // Rule 3: Industrial applicability
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasIndustrialApplication',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'patent-industrial-application-satisfied',
      params: {
        message: 'L\'invention est susceptible d\'application industrielle',
        requirement: 'Article 57 CBE - Application industrielle',
      },
    },
    priority: 8,
  });

  // Rule 4: Non-patentable subject matter
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'subjectMatter',
          operator: 'in',
          value: ['business-method', 'software-as-such', 'mathematical-method', 'aesthetic-creation'],
        },
      ],
    },
    event: {
      type: 'patent-ineligible',
      params: {
        reason: 'Matière non brevetable selon Article 52(2) CBE',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 5: Priority claim deadline
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasPriorityClaim',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'monthsSincePriorityDate',
          operator: 'greaterThan',
          value: IP_CONSTANTS.PATENT_PRIORITY_PERIOD,
        },
      ],
    },
    event: {
      type: 'priority-claim-invalid',
      params: {
        reason: `Délai de priorité de ${IP_CONSTANTS.PATENT_PRIORITY_PERIOD} mois dépassé`,
        legalBasis: 'Article 87 CBE',
      },
    },
    priority: 8,
  });

  // Rule 6: PCT national phase deadline
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isPCTApplication',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'monthsSincePCTFiling',
          operator: 'greaterThan',
          value: IP_CONSTANTS.PATENT_PCT_PERIOD,
        },
      ],
    },
    event: {
      type: 'pct-deadline-missed',
      params: {
        reason: `Délai PCT de ${IP_CONSTANTS.PATENT_PCT_PERIOD} mois pour phase nationale dépassé`,
        legalBasis: 'Article 22 PCT',
      },
    },
    priority: 9,
  });

  // Rule 7: Annual fee payment
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'annuityDue',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'monthsSinceDueDate',
          operator: 'greaterThan',
          value: IP_CONSTANTS.PATENT_GRACE_PERIOD,
        },
      ],
    },
    event: {
      type: 'patent-lapsed',
      params: {
        reason: 'Annuité non payée après délai de grâce',
        canRestore: true,
        restorePeriod: '12 mois',
      },
    },
    priority: 7,
  });

  return engine;
}

// Singleton instance
const patentEngineInstance = createPatentEngine();

/**
 * Check patent application eligibility
 */
export async function checkPatentEligibility(application: Partial<PatentApplication>): Promise<{
  isEligible: boolean;
  requirements?: string[];
  issues?: string[];
}> {
  const facts = {
    hasAbsoluteNovelty: (application as any).hasNovelty ?? false,
    priorArtExists: (application as any).priorArtFound ?? false,
    hasInventiveStep: (application as any).hasInventiveStep ?? false,
    isObviousToSkilledPerson: (application as any).isObvious ?? false,
    hasIndustrialApplication: (application as any).industriallyApplicable ?? false,
    subjectMatter: (application as any).subjectMatterType ?? 'technical',
    hasPriorityClaim: !!(application as any).priorityDate,
    monthsSincePriorityDate: (application as any).monthsSincePriority ?? 0,
    isPCTApplication: application.type === 'brevet-pct',
    monthsSincePCTFiling: (application as any).monthsSincePCT ?? 0,
  };

  const results = await patentEngineInstance.run(facts);

  const eligibilityEvents = results.events.filter(e =>
    e.type.includes('satisfied') || e.type === 'patent-eligible'
  );

  const ineligibilityEvents = results.events.filter(e =>
    e.type.includes('ineligible') || e.type.includes('invalid') || e.type.includes('missed')
  );

  return {
    isEligible: ineligibilityEvents.length === 0 && eligibilityEvents.length >= 3,
    requirements: eligibilityEvents.map(e => e.params?.message).filter(Boolean),
    issues: ineligibilityEvents.map(e => e.params?.reason).filter(Boolean),
  };
}

/**
 * Calculate patent fees
 */
export function calculatePatentFees(
  type: PatentType,
  year?: number,
  classes?: number
): number {
  let totalFees = 0;

  // Basic filing fees
  totalFees += IP_CONSTANTS.FEES.PATENT.FILING;
  totalFees += IP_CONSTANTS.FEES.PATENT.SEARCH;

  if (type === 'brevet-europeen') {
    // European patent has additional fees
    totalFees += IP_CONSTANTS.FEES.PATENT.EXAMINATION;
    totalFees += 800; // EP designation fees
  }

  // Annual fees if applicable
  if (year && year >= 3) {
    if (year <= 5) {
      totalFees += IP_CONSTANTS.FEES.PATENT.ANNUITY_YEAR_3;
    } else if (year <= 10) {
      totalFees += IP_CONSTANTS.FEES.PATENT.ANNUITY_YEAR_10;
    } else if (year <= 20) {
      totalFees += IP_CONSTANTS.FEES.PATENT.ANNUITY_YEAR_20;
    }
  }

  return totalFees;
}

/**
 * Check patent maintenance requirements
 */
export function checkPatentMaintenance(
  grantDate: Date,
  lastPaymentDate?: Date
): {
  annuityDue: boolean;
  dueDate?: Date;
  amount?: number;
  yearNumber?: number;
} {
  const now = new Date();
  const yearsSinceGrant = Math.floor(
    (now.getTime() - grantDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  if (yearsSinceGrant < 3) {
    return { annuityDue: false };
  }

  const currentYear = yearsSinceGrant + 1;
  const dueDate = new Date(grantDate);
  dueDate.setFullYear(dueDate.getFullYear() + yearsSinceGrant);

  // Check if payment is due
  const isDue = !lastPaymentDate || lastPaymentDate < dueDate;

  let amount = IP_CONSTANTS.FEES.PATENT.ANNUITY_YEAR_3;
  if (currentYear > 10) {
    amount = IP_CONSTANTS.FEES.PATENT.ANNUITY_YEAR_20;
  } else if (currentYear > 5) {
    amount = IP_CONSTANTS.FEES.PATENT.ANNUITY_YEAR_10;
  }

  return {
    annuityDue: isDue,
    dueDate,
    amount,
    yearNumber: currentYear,
  };
}

/**
 * Validate patent claims
 */
export function validatePatentClaims(claims: any[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!claims || claims.length === 0) {
    errors.push('Au moins une revendication est requise');
  }

  const hasIndependentClaim = claims.some(c => c.type === 'independent');
  if (!hasIndependentClaim) {
    errors.push('Au moins une revendication indépendante est requise');
  }

  // Check dependent claims reference valid claims
  claims.forEach(claim => {
    if (claim.type === 'dependent' && claim.dependsOn) {
      claim.dependsOn.forEach((ref: number) => {
        if (!claims.find(c => c.number === ref)) {
          errors.push(`Revendication ${claim.number} fait référence à une revendication inexistante ${ref}`);
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if supplementary protection certificate (SPC) is available
 */
export function checkSPCEligibility(
  patentGrantDate: Date,
  marketingAuthorizationDate: Date,
  productType: 'medicament' | 'plant-protection'
): {
  eligible: boolean;
  maxDuration?: number;
  reason?: string;
} {
  const timeDiff = marketingAuthorizationDate.getTime() - patentGrantDate.getTime();
  const yearsDiff = timeDiff / (365.25 * 24 * 60 * 60 * 1000);

  if (yearsDiff < 5) {
    return {
      eligible: false,
      reason: 'Moins de 5 ans entre délivrance du brevet et AMM',
    };
  }

  const maxDuration = Math.min(5, yearsDiff - 5);

  return {
    eligible: true,
    maxDuration,
  };
}

/**
 * Export rules for transparency
 */
export const PATENT_RULES_JSON = {
  legalFramework: {
    belgianLaw: {
      title: 'Loi du 28 mars 1984 sur les brevets d\'invention',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1984032830&table_name=loi',
    },
    europeanConvention: {
      title: 'Convention sur le brevet européen',
      url: 'https://www.epo.org/law-practice/legal-texts/epc_fr.html',
    },
    economicCode: {
      title: 'Code de droit économique, Livre XI',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2013022819&table_name=loi',
    },
  },
  requirements: {
    novelty: 'Nouveauté absolue mondiale (Article 54 CBE)',
    inventiveStep: 'Activité inventive non évidente (Article 56 CBE)',
    industrialApplication: 'Application industrielle (Article 57 CBE)',
    sufficientDisclosure: 'Description suffisante (Article 83 CBE)',
  },
  exclusions: [
    'Méthodes commerciales',
    'Programmes d\'ordinateur en tant que tels',
    'Méthodes mathématiques',
    'Créations esthétiques',
    'Méthodes thérapeutiques',
  ],
  deadlines: {
    priority: `${IP_CONSTANTS.PATENT_PRIORITY_PERIOD} mois`,
    pctNationalPhase: `${IP_CONSTANTS.PATENT_PCT_PERIOD} mois`,
    response: `${IP_CONSTANTS.DEADLINES.PATENT_RESPONSE} mois`,
    gracePeriod: `${IP_CONSTANTS.PATENT_GRACE_PERIOD} mois`,
  },
  fees: IP_CONSTANTS.FEES.PATENT,
};