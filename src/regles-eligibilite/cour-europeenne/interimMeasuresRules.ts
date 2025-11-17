/**
 * Business Rules for ECHR Interim Measures (Rule 39)
 *
 * BASE JURIDIQUE:
 * - Rules of Court, Rule 39
 *   https://www.echr.coe.int/documents/rules_court_eng.pdf
 * - Practice Direction on Interim Measures
 *   https://www.echr.coe.int/documents/pd_interim_measures_eng.pdf
 * - ECHR Case Law: Mamatkulov v. Turkey, M.S.S. v. Belgium and Greece
 */

import { Engine } from 'json-rules-engine';
import {
  InterimMeasure,
  InterimMeasuresAssessment,
  ECHRApplication,
  ViolationType
} from '../../domain/courEuropeenneTypes';

/**
 * Create the interim measures eligibility rules engine
 */
function createInterimMeasuresEngine(): Engine {
  const engine = new Engine();

  // ============================================================================
  // Rule 1: Life-Threatening Situations (Article 2)
  // ============================================================================
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'riskType',
          operator: 'equal',
          value: 'death-penalty',
        },
        {
          fact: 'riskType',
          operator: 'equal',
          value: 'execution',
        },
        {
          fact: 'riskType',
          operator: 'equal',
          value: 'assassination',
        },
      ],
    },
    event: {
      type: 'grant-immediate',
      params: {
        urgency: 'critical',
        reason: 'Imminent risk to life under Article 2',
        priority: 10,
        responseTime: '6 hours',
      },
    },
    priority: 10,
  });

  // ============================================================================
  // Rule 2: Torture and Inhuman Treatment (Article 3)
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          any: [
            {
              fact: 'riskType',
              operator: 'equal',
              value: 'torture',
            },
            {
              fact: 'riskType',
              operator: 'equal',
              value: 'inhuman-treatment',
            },
          ],
        },
        {
          fact: 'imminence',
          operator: 'lessThanInclusive',
          value: 48, // hours
        },
      ],
    },
    event: {
      type: 'grant-urgent',
      params: {
        urgency: 'critical',
        reason: 'Imminent risk of torture or inhuman treatment under Article 3',
        priority: 10,
        responseTime: '24 hours',
      },
    },
    priority: 10,
  });

  // ============================================================================
  // Rule 3: Expulsion/Deportation to Dangerous Countries
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'procedureType',
          operator: 'in',
          value: ['expulsion', 'deportation', 'extradition'],
        },
        {
          fact: 'destinationCountryRisk',
          operator: 'greaterThanInclusive',
          value: 7, // Risk score 0-10
        },
        {
          fact: 'expulsionScheduled',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'grant-likely',
      params: {
        urgency: 'high',
        reason: 'Risk of irreversible harm upon expulsion',
        priority: 9,
        responseTime: '48 hours',
      },
    },
    priority: 9,
  });

  // ============================================================================
  // Rule 4: Medical Emergency in Detention
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'applicantDetained',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'medicalCondition',
          operator: 'in',
          value: ['life-threatening', 'critical', 'deteriorating'],
        },
        {
          fact: 'treatmentDenied',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'grant-medical',
      params: {
        urgency: 'high',
        reason: 'Denial of urgent medical treatment in detention',
        priority: 9,
        responseTime: '24 hours',
      },
    },
    priority: 9,
  });

  // ============================================================================
  // Rule 5: Child Abduction/Separation
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'involvesChildren',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'riskType',
          operator: 'in',
          value: ['abduction', 'forced-separation', 'trafficking'],
        },
        {
          fact: 'imminentAction',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'grant-child-protection',
      params: {
        urgency: 'high',
        reason: 'Risk to child welfare and family life',
        priority: 8,
        responseTime: '24 hours',
      },
    },
    priority: 8,
  });

  // ============================================================================
  // Rule 6: Witness/Journalist Protection
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'applicantRole',
          operator: 'in',
          value: ['witness', 'journalist', 'human-rights-defender'],
        },
        {
          fact: 'threatLevel',
          operator: 'greaterThanInclusive',
          value: 8,
        },
        {
          fact: 'stateProtectionDenied',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'grant-protection',
      params: {
        urgency: 'high',
        reason: 'Protection of witness/journalist at risk',
        priority: 8,
        responseTime: '48 hours',
      },
    },
    priority: 8,
  });

  // ============================================================================
  // Rule 7: Property Demolition with Homelessness Risk
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'riskType',
          operator: 'equal',
          value: 'home-demolition',
        },
        {
          fact: 'alternativeHousing',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'vulnerableOccupants',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'consider-measures',
      params: {
        urgency: 'medium',
        reason: 'Risk of homelessness for vulnerable persons',
        priority: 6,
        responseTime: '1 week',
      },
    },
    priority: 6,
  });

  // ============================================================================
  // Rule 8: Insufficient Urgency - Refuse
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'irreversibleHarm',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'compensableByMoney',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'refuse-measures',
      params: {
        reason: 'No risk of irreversible harm - damage compensable',
        priority: 3,
      },
    },
    priority: 3,
  });

  // ============================================================================
  // Rule 9: No Imminent Risk - Refuse
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'imminence',
          operator: 'greaterThan',
          value: 720, // 30 days
        },
      ],
    },
    event: {
      type: 'refuse-measures',
      params: {
        reason: 'No imminent risk - sufficient time for normal procedure',
        priority: 3,
      },
    },
    priority: 3,
  });

  // ============================================================================
  // Rule 10: Domestic Remedies Available - Refuse
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'domesticRemediesAvailable',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'domesticRemediesEffective',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'refuse-measures',
      params: {
        reason: 'Effective domestic remedies available',
        priority: 4,
      },
    },
    priority: 4,
  });

  return engine;
}

/**
 * Singleton instance of the interim measures rules engine
 */
const interimMeasuresEngineInstance = createInterimMeasuresEngine();

/**
 * Check eligibility for interim measures
 */
export async function checkInterimMeasuresEligibility(
  request: InterimMeasure,
  application: ECHRApplication
): Promise<InterimMeasuresAssessment> {
  const facts = extractInterimMeasuresFacts(request, application);
  const results = await interimMeasuresEngineInstance.run(facts);

  return processInterimMeasuresResults(results, request);
}

/**
 * Extract facts for interim measures assessment
 */
function extractInterimMeasuresFacts(
  request: InterimMeasure,
  application: ECHRApplication
): Record<string, any> {
  const riskType = categorizeRisk(request);
  const imminence = calculateImminence(request);
  const threatLevel = assessThreatLevel(request);

  return {
    riskType,
    imminence,
    procedureType: detectProcedureType(request),
    destinationCountryRisk: assessDestinationRisk(request),
    expulsionScheduled: request.urgencyReason.includes('expulsion'),
    applicantDetained: application.applicants.some(a =>
      a.victimStatus.harmDescription.includes('detention')
    ),
    medicalCondition: detectMedicalCondition(request),
    treatmentDenied: request.urgencyReason.includes('denied'),
    involvesChildren: application.applicants.some(a =>
      a.dateOfBirth && calculateAge(a.dateOfBirth) < 18
    ),
    imminentAction: imminence <= 72,
    applicantRole: detectApplicantRole(application),
    threatLevel,
    stateProtectionDenied: request.urgencyReason.includes('protection denied'),
    alternativeHousing: false, // Would need more context
    vulnerableOccupants: detectVulnerability(application),
    irreversibleHarm: request.irreparableHarm.length > 0,
    compensableByMoney: !request.irreparableHarm.includes('life') &&
                       !request.irreparableHarm.includes('torture'),
    domesticRemediesAvailable: application.domesticRemedies.some(r =>
      r.outcome === 'pending'
    ),
    domesticRemediesEffective: !application.domesticRemedies.every(r =>
      r.ineffectiveReason
    ),
  };
}

/**
 * Categorize the type of risk
 */
function categorizeRisk(request: InterimMeasure): string {
  const urgency = request.urgencyReason.toLowerCase();
  const harm = request.irreparableHarm.toLowerCase();

  if (urgency.includes('death') || harm.includes('death')) return 'death-penalty';
  if (urgency.includes('execution')) return 'execution';
  if (urgency.includes('torture') || harm.includes('torture')) return 'torture';
  if (urgency.includes('inhuman') || harm.includes('degrading')) return 'inhuman-treatment';
  if (urgency.includes('expulsion') || urgency.includes('deportation')) return 'expulsion';
  if (urgency.includes('extradition')) return 'extradition';
  if (urgency.includes('abduction')) return 'abduction';
  if (urgency.includes('separation')) return 'forced-separation';
  if (urgency.includes('demolition')) return 'home-demolition';
  if (urgency.includes('medical')) return 'medical-emergency';

  return 'other';
}

/**
 * Calculate imminence in hours
 */
function calculateImminence(request: InterimMeasure): number {
  const urgency = request.urgencyReason.toLowerCase();

  if (urgency.includes('today') || urgency.includes('hours')) return 6;
  if (urgency.includes('tomorrow')) return 24;
  if (urgency.includes('48 hours')) return 48;
  if (urgency.includes('week')) return 168;
  if (urgency.includes('month')) return 720;

  // Check if duration specified
  if (request.duration?.start) {
    const hours = Math.floor(
      (request.duration.start.getTime() - Date.now()) / (1000 * 60 * 60)
    );
    return Math.max(0, hours);
  }

  return 72; // Default 3 days
}

/**
 * Assess threat level (0-10 scale)
 */
function assessThreatLevel(request: InterimMeasure): number {
  let score = 5; // Base score

  const factors = request.urgencyReason.toLowerCase();

  // Increase for serious threats
  if (factors.includes('death')) score += 5;
  if (factors.includes('torture')) score += 4;
  if (factors.includes('violence')) score += 3;
  if (factors.includes('persecution')) score += 2;
  if (factors.includes('threat')) score += 2;

  // Decrease for less serious
  if (factors.includes('property')) score -= 2;
  if (factors.includes('financial')) score -= 3;

  return Math.min(10, Math.max(0, score));
}

/**
 * Detect procedure type
 */
function detectProcedureType(request: InterimMeasure): string {
  const urgency = request.urgencyReason.toLowerCase();

  if (urgency.includes('expulsion')) return 'expulsion';
  if (urgency.includes('deportation')) return 'deportation';
  if (urgency.includes('extradition')) return 'extradition';
  if (urgency.includes('transfer')) return 'transfer';

  return 'other';
}

/**
 * Assess destination country risk
 */
function assessDestinationRisk(request: InterimMeasure): number {
  const high_risk_countries = [
    'syria', 'afghanistan', 'somalia', 'yemen', 'libya',
    'eritrea', 'north korea', 'iran', 'sudan',
  ];

  const urgency = request.urgencyReason.toLowerCase();

  for (const country of high_risk_countries) {
    if (urgency.includes(country)) return 9;
  }

  if (urgency.includes('war') || urgency.includes('conflict')) return 8;
  if (urgency.includes('persecution')) return 7;

  return 5; // Default medium risk
}

/**
 * Detect medical condition severity
 */
function detectMedicalCondition(request: InterimMeasure): string {
  const urgency = request.urgencyReason.toLowerCase();

  if (urgency.includes('dying') || urgency.includes('terminal')) return 'life-threatening';
  if (urgency.includes('critical') || urgency.includes('emergency')) return 'critical';
  if (urgency.includes('deteriorating') || urgency.includes('worsening')) return 'deteriorating';
  if (urgency.includes('medical') || urgency.includes('health')) return 'serious';

  return 'none';
}

/**
 * Detect applicant role
 */
function detectApplicantRole(application: ECHRApplication): string {
  const descriptions = application.applicants.map(a =>
    a.victimStatus.harmDescription.toLowerCase()
  ).join(' ');

  if (descriptions.includes('witness')) return 'witness';
  if (descriptions.includes('journalist')) return 'journalist';
  if (descriptions.includes('activist') || descriptions.includes('defender')) {
    return 'human-rights-defender';
  }

  return 'ordinary-citizen';
}

/**
 * Detect vulnerability
 */
function detectVulnerability(application: ECHRApplication): boolean {
  return application.applicants.some(a => {
    const age = a.dateOfBirth ? calculateAge(a.dateOfBirth) : 30;
    return age < 18 || age > 65 ||
           a.victimStatus.harmDescription.includes('disabled') ||
           a.victimStatus.harmDescription.includes('pregnant');
  });
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    return age - 1;
  }

  return age;
}

/**
 * Process rules engine results
 */
function processInterimMeasuresResults(
  results: any,
  request: InterimMeasure
): InterimMeasuresAssessment {
  const events = results.events;

  // Find highest priority event
  const grantEvents = events.filter((e: any) => e.type.startsWith('grant'));
  const refuseEvents = events.filter((e: any) => e.type === 'refuse-measures');

  if (grantEvents.length > 0) {
    const highestPriority = grantEvents.reduce((prev: any, curr: any) =>
      prev.params.priority > curr.params.priority ? prev : curr
    );

    return {
      urgencyLevel: highestPriority.params.urgency || 'high',
      immediateDanger: true,
      irreparableHarmRisk: true,
      recommendRule39: true,
      justification: highestPriority.params.reason,
    };
  }

  if (refuseEvents.length > 0) {
    return {
      urgencyLevel: 'low',
      immediateDanger: false,
      irreparableHarmRisk: false,
      recommendRule39: false,
      justification: refuseEvents[0].params.reason,
    };
  }

  // Default assessment
  return {
    urgencyLevel: 'medium',
    immediateDanger: false,
    irreparableHarmRisk: request.irreparableHarm.length > 0,
    recommendRule39: false,
    justification: 'Standard assessment - further review needed',
  };
}

/**
 * Quick assessment for urgent cases
 */
export function quickInterimAssessment(
  riskType: string,
  hoursUntilAction: number
): { recommend: boolean; urgency: string; action: string } {
  if (riskType === 'death' || riskType === 'torture') {
    return {
      recommend: true,
      urgency: 'critical',
      action: 'Grant immediately - contact duty judge',
    };
  }

  if (riskType === 'expulsion' && hoursUntilAction <= 48) {
    return {
      recommend: true,
      urgency: 'high',
      action: 'Urgent review required - suspend removal',
    };
  }

  if (hoursUntilAction <= 24) {
    return {
      recommend: true,
      urgency: 'high',
      action: 'Expedited review needed',
    };
  }

  return {
    recommend: false,
    urgency: 'normal',
    action: 'Follow standard procedure',
  };
}