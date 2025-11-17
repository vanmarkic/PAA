/**
 * Business Rules for ECHR Special Procedures
 *
 * Covers: Grand Chamber, Revision, Advisory Opinions, Third-Party Interventions,
 * Pilot Judgments, Legal Aid, and other special procedures
 *
 * BASE JURIDIQUE:
 * - Articles 30, 36, 41, 43, 44 ECHR
 * - Rules 61, 79, 80, 105 of the Rules of Court
 * - Protocol 16 (Advisory Opinions)
 */

import { Engine } from 'json-rules-engine';
import {
  ECHRApplication,
  ECHRJudgment,
  ProcedureType,
  ViolationType,
  ThirdPartyIntervention,
  AdvisoryOpinion,
  ECHR_DEADLINES
} from '../../domain/courEuropeenneTypes';

// ============================================================================
// GRAND CHAMBER REFERRAL RULES
// ============================================================================

function createGrandChamberEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Serious Question of Interpretation
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'raisesNewInterpretation',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'conflictsWithPrecedent',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'affectsMultipleStates',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'accept-referral',
      params: {
        reason: 'Serious question affecting interpretation of Convention',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Serious Issue of General Importance
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'systemicProblem',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'numberOfAffectedPersons',
          operator: 'greaterThan',
          value: 1000,
        },
        {
          fact: 'fundamentalRightAtStake',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'accept-referral',
      params: {
        reason: 'Serious issue of general importance',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: Time Limit Check (3 months)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'daysSinceJudgment',
          operator: 'greaterThan',
          value: ECHR_DEADLINES.GRAND_CHAMBER_REFERRAL_MONTHS * 30,
        },
      ],
    },
    event: {
      type: 'reject-referral',
      params: {
        reason: 'Outside 3-month time limit',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 4: Insufficient Importance
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'routineApplication',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'wellEstablishedCaseLaw',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'reject-referral',
      params: {
        reason: 'Case does not raise sufficiently important issues',
        priority: 5,
      },
    },
    priority: 5,
  });

  return engine;
}

// ============================================================================
// REVISION REQUEST RULES
// ============================================================================

function createRevisionEngine(): Engine {
  const engine = new Engine();

  // Rule 1: New Decisive Fact Discovered
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasNewFact',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'factWasUnknownAtJudgment',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'factIsDecisive',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'notApplicantsFault',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'accept-revision',
      params: {
        reason: 'New decisive fact justifies revision',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Time Limit (6 months from discovery)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'monthsSinceDiscovery',
          operator: 'greaterThan',
          value: ECHR_DEADLINES.REVISION_REQUEST_MONTHS,
        },
      ],
    },
    event: {
      type: 'reject-revision',
      params: {
        reason: 'Request outside 6-month time limit',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 3: Fact Not Decisive
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'factIsDecisive',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'reject-revision',
      params: {
        reason: 'New fact would not affect outcome',
        priority: 8,
      },
    },
    priority: 8,
  });

  return engine;
}

// ============================================================================
// THIRD-PARTY INTERVENTION RULES
// ============================================================================

function createThirdPartyEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Other States - Automatic Right
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'intervenerType',
          operator: 'equal',
          value: 'state',
        },
        {
          fact: 'isNationalOfIntervener',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'grant-intervention',
      params: {
        reason: 'State has automatic right when national is applicant',
        scope: 'written-comments',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Council of Europe Commissioner
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'intervenerType',
          operator: 'equal',
          value: 'commissioner',
        },
      ],
    },
    event: {
      type: 'grant-intervention',
      params: {
        reason: 'Commissioner for Human Rights has right to intervene',
        scope: 'both',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 3: NGO with Relevant Expertise
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'intervenerType',
          operator: 'equal',
          value: 'ngo',
        },
        {
          fact: 'hasRelevantExpertise',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'wouldAssistCourt',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'grant-intervention',
      params: {
        reason: 'NGO can provide valuable expertise',
        scope: 'written-comments',
        priority: 7,
      },
    },
    priority: 7,
  });

  // Rule 4: No Proper Interest
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasProperInterest',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'refuse-intervention',
      params: {
        reason: 'No proper interest in the case',
        priority: 8,
      },
    },
    priority: 8,
  });

  return engine;
}

// ============================================================================
// LEGAL AID RULES
// ============================================================================

function createLegalAidEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Financial Need Established
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'annualIncome',
          operator: 'lessThan',
          value: 15000, // EUR
        },
        {
          fact: 'hasSignificantAssets',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'grant-legal-aid',
      params: {
        reason: 'Applicant lacks sufficient means',
        coverage: 'full',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 2: Partial Legal Aid
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'annualIncome',
          operator: 'between',
          value: [15000, 25000],
        },
        {
          fact: 'familySize',
          operator: 'greaterThan',
          value: 3,
        },
      ],
    },
    event: {
      type: 'grant-legal-aid',
      params: {
        reason: 'Partial financial need established',
        coverage: 'partial',
        priority: 7,
      },
    },
    priority: 7,
  });

  // Rule 3: Case Lacks Merit
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'caseHasMerit',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'refuse-legal-aid',
      params: {
        reason: 'Application lacks reasonable prospects of success',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 4: Already Represented
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasLegalRepresentative',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'representativeProBono',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'refuse-legal-aid',
      params: {
        reason: 'Applicant already has paid legal representation',
        priority: 8,
      },
    },
    priority: 8,
  });

  return engine;
}

// ============================================================================
// PILOT JUDGMENT PROCEDURE RULES
// ============================================================================

function createPilotJudgmentEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Systemic or Structural Problem
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isSystemicProblem',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'numberOfSimilarCases',
          operator: 'greaterThan',
          value: 10,
        },
        {
          fact: 'problemAffectsLegislation',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'apply-pilot-procedure',
      params: {
        reason: 'Systemic problem requiring general measures',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Repetitive Cases Pattern
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'repetitiveCases',
          operator: 'greaterThan',
          value: 50,
        },
        {
          fact: 'sameViolationType',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'apply-pilot-procedure',
      params: {
        reason: 'Large number of repetitive cases',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: Individual Case Only
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isIsolatedCase',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'noSystemicIssue',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'standard-procedure',
      params: {
        reason: 'Individual case without systemic implications',
        priority: 5,
      },
    },
    priority: 5,
  });

  return engine;
}

// ============================================================================
// ADVISORY OPINION RULES (Protocol 16)
// ============================================================================

function createAdvisoryOpinionEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Highest Court Request
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'requestingCourtLevel',
          operator: 'equal',
          value: 'highest',
        },
        {
          fact: 'stateRatifiedProtocol16',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'questionsConcernConvention',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'accept-request',
      params: {
        reason: 'Valid request from highest court of Protocol 16 state',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Question of Principle
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'raisesQuestionOfPrinciple',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'relatedToPendingCase',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'accept-request',
      params: {
        reason: 'Question of principle relating to Convention interpretation',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: State Not Party to Protocol 16
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'stateRatifiedProtocol16',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'reject-request',
      params: {
        reason: 'State has not ratified Protocol 16',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 4: Question Too Abstract
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'questionIsAbstract',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'notLinkedToCase',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'reject-request',
      params: {
        reason: 'Question too abstract or hypothetical',
        priority: 8,
      },
    },
    priority: 8,
  });

  return engine;
}

// ============================================================================
// ENGINE INSTANCES
// ============================================================================

const grandChamberEngine = createGrandChamberEngine();
const revisionEngine = createRevisionEngine();
const thirdPartyEngine = createThirdPartyEngine();
const legalAidEngine = createLegalAidEngine();
const pilotJudgmentEngine = createPilotJudgmentEngine();
const advisoryOpinionEngine = createAdvisoryOpinionEngine();

// ============================================================================
// EXPORTED CHECK FUNCTIONS
// ============================================================================

/**
 * Check Grand Chamber referral eligibility
 */
export async function checkGrandChamberEligibility(
  judgment: ECHRJudgment,
  application: ECHRApplication
): Promise<{ accept: boolean; reason: string }> {
  const facts = {
    daysSinceJudgment: Math.floor(
      (Date.now() - judgment.date.getTime()) / (1000 * 60 * 60 * 24)
    ),
    raisesNewInterpretation: checkNewInterpretation(judgment, application),
    conflictsWithPrecedent: checkConflictWithPrecedent(judgment),
    affectsMultipleStates: checkMultiStateImpact(application),
    systemicProblem: judgment.pilotJudgment,
    numberOfAffectedPersons: estimateAffectedPersons(application),
    fundamentalRightAtStake: checkFundamentalRight(application.violations),
    routineApplication: isRoutineCase(application),
    wellEstablishedCaseLaw: checkEstablishedCaseLaw(application.violations),
  };

  const results = await grandChamberEngine.run(facts);
  const acceptEvents = results.events.filter((e: any) => e.type === 'accept-referral');
  const rejectEvents = results.events.filter((e: any) => e.type === 'reject-referral');

  if (rejectEvents.length > 0) {
    return { accept: false, reason: rejectEvents[0].params.reason };
  }

  if (acceptEvents.length > 0) {
    return { accept: true, reason: acceptEvents[0].params.reason };
  }

  return { accept: false, reason: 'Does not meet criteria for Grand Chamber referral' };
}

/**
 * Check revision request eligibility
 */
export async function checkRevisionEligibility(
  newFact: any,
  originalJudgment: ECHRJudgment
): Promise<{ accept: boolean; reason: string }> {
  const facts = {
    hasNewFact: !!newFact,
    factWasUnknownAtJudgment: newFact?.unknownAtJudgment || false,
    factIsDecisive: newFact?.decisive || false,
    notApplicantsFault: newFact?.notApplicantsFault || false,
    monthsSinceDiscovery: newFact?.discoveryDate
      ? Math.floor((Date.now() - newFact.discoveryDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0,
  };

  const results = await revisionEngine.run(facts);
  const acceptEvents = results.events.filter((e: any) => e.type === 'accept-revision');
  const rejectEvents = results.events.filter((e: any) => e.type === 'reject-revision');

  if (rejectEvents.length > 0) {
    return { accept: false, reason: rejectEvents[0].params.reason };
  }

  if (acceptEvents.length > 0) {
    return { accept: true, reason: acceptEvents[0].params.reason };
  }

  return { accept: false, reason: 'Revision criteria not met' };
}

/**
 * Check third-party intervention eligibility
 */
export async function checkThirdPartyIntervention(
  intervention: ThirdPartyIntervention,
  application: ECHRApplication
): Promise<{ grant: boolean; scope?: string; reason: string }> {
  const facts = {
    intervenerType: intervention.type,
    isNationalOfIntervener: checkNationality(intervention, application),
    hasRelevantExpertise: checkExpertise(intervention),
    wouldAssistCourt: true, // Simplified
    hasProperInterest: checkProperInterest(intervention, application),
  };

  const results = await thirdPartyEngine.run(facts);
  const grantEvents = results.events.filter((e: any) => e.type === 'grant-intervention');
  const refuseEvents = results.events.filter((e: any) => e.type === 'refuse-intervention');

  if (refuseEvents.length > 0) {
    return { grant: false, reason: refuseEvents[0].params.reason };
  }

  if (grantEvents.length > 0) {
    return {
      grant: true,
      scope: grantEvents[0].params.scope,
      reason: grantEvents[0].params.reason,
    };
  }

  return { grant: false, reason: 'Intervention not granted' };
}

/**
 * Check legal aid eligibility
 */
export async function checkLegalAidEligibility(
  applicant: any,
  application: ECHRApplication
): Promise<{ grant: boolean; coverage?: string; reason: string }> {
  const facts = {
    annualIncome: applicant.annualIncome || 0,
    hasSignificantAssets: applicant.assets > 50000,
    familySize: applicant.familySize || 1,
    caseHasMerit: application.violations.length > 0,
    hasLegalRepresentative: applicant.hasLegalRepresentative,
    representativeProBono: applicant.legalRepresentative?.proBono || false,
  };

  const results = await legalAidEngine.run(facts);
  const grantEvents = results.events.filter((e: any) => e.type === 'grant-legal-aid');
  const refuseEvents = results.events.filter((e: any) => e.type === 'refuse-legal-aid');

  if (refuseEvents.length > 0) {
    return { grant: false, reason: refuseEvents[0].params.reason };
  }

  if (grantEvents.length > 0) {
    return {
      grant: true,
      coverage: grantEvents[0].params.coverage,
      reason: grantEvents[0].params.reason,
    };
  }

  return { grant: false, reason: 'Legal aid criteria not met' };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function checkNewInterpretation(judgment: ECHRJudgment, application: ECHRApplication): boolean {
  // Check if case raises novel legal questions
  return application.priorityReason?.includes('novel') || false;
}

function checkConflictWithPrecedent(judgment: ECHRJudgment): boolean {
  // Check if judgment conflicts with established case law
  return judgment.separateOpinions?.some(o => o.type === 'dissenting') || false;
}

function checkMultiStateImpact(application: ECHRApplication): boolean {
  // Check if issue affects multiple member states
  return application.type === 'pilot-judgment' ||
         application.priorityReason?.includes('systemic') || false;
}

function estimateAffectedPersons(application: ECHRApplication): number {
  // Estimate number of people affected by the issue
  if (application.type === 'pilot-judgment') return 1000;
  if (application.type === 'group') return application.applicants.length * 10;
  return 1;
}

function checkFundamentalRight(violations: any[]): boolean {
  // Check if fundamental rights are at stake
  const fundamental: ViolationType[] = ['article-2', 'article-3', 'article-4'];
  return violations.some(v => fundamental.includes(v.article));
}

function isRoutineCase(application: ECHRApplication): boolean {
  // Check if case is routine
  return !application.priorityRequested && application.type === 'individual';
}

function checkEstablishedCaseLaw(violations: any[]): boolean {
  // Check if violations concern well-established principles
  return violations.every(v => v.caseReferences.length > 5);
}

function checkNationality(intervention: ThirdPartyIntervention, application: ECHRApplication): boolean {
  // Check if intervening state's national is applicant
  if (intervention.type !== 'government') return false;
  // Simplified check
  return true;
}

function checkExpertise(intervention: ThirdPartyIntervention): boolean {
  // Check if intervener has relevant expertise
  return intervention.type === 'ngo' || intervention.type === 'international-org';
}

function checkProperInterest(intervention: ThirdPartyIntervention, application: ECHRApplication): boolean {
  // Check if intervener has proper interest in case
  return intervention.type !== 'individual' || false;
}