/**
 * Generic Eligibility Service
 *
 * Provides a single entry point for eligibility checks across all benefits.
 * Each benefit type is responsible for mapping its own input facts and
 * translating rule engine results into a canonical EligibilityDecision.
 */

import { EligibilityRequest, EligibilityDecision, ExplanationStep, NextStep, BenefitType } from '../domain/types';
import { checkHousingAidEligibility, HousingAidRequest } from '../rules/aideLogementRules';

/**
 * Map benefit-specific request facts into a typed HousingAidRequest.
 * In production this would be validated with Zod or similar.
 */
function mapFactsToHousingAidRequest(facts: Record<string, unknown>): HousingAidRequest {
  return {
    region: (facts.region as HousingAidRequest['region']) || 'brussels',
    annualIncome: Number(facts.annualIncome ?? 0),
    monthlyRent: Number(facts.monthlyRent ?? 0),
    householdComposition: {
      adults: Number(facts.adults ?? 1),
      children: Number(facts.children ?? 0),
      singleParent: Boolean(facts.singleParent ?? false),
    },
    socialHousingStatus: {
      onWaitingList: Boolean(facts.onWaitingList ?? false),
      waitingListMonths: Number(facts.waitingListMonths ?? 0),
      priorityPoints: facts.priorityPoints !== undefined ? Number(facts.priorityPoints) : undefined,
    },
    currentHousing: {
      isOwner: Boolean(facts.isOwner ?? false),
      isRenting: Boolean(facts.isRenting ?? true),
      leavingUnsanitaryHousing: Boolean(facts.leavingUnsanitaryHousing ?? false),
      leavingOvercrowdedHousing: Boolean(facts.leavingOvercrowdedHousing ?? false),
      evicted: Boolean(facts.evicted ?? false),
    },
  };
}

/**
 * Map HousingAidResult (specialised) to generic EligibilityDecision.
 */
function mapHousingAidResultToDecision(result: Awaited<ReturnType<typeof checkHousingAidEligibility>>): EligibilityDecision {
  const explanationSteps: ExplanationStep[] = [];

  if (result.reason) {
    explanationSteps.push({
      code: result.isEligible ? 'ELIGIBLE_REASON' : 'INELIGIBLE_REASON',
      message: result.reason,
    });
  }

  const structuredNextSteps: NextStep[] = [];

  if (result.conditions && result.conditions.length > 0) {
    structuredNextSteps.push({
      label: 'Conditions à respecter',
      description: 'Conditions pour maintenir le droit à l\'aide au logement',
      requiredDocuments: result.conditions,
    });
  }

  if (result.duration) {
    structuredNextSteps.push({
      label: 'Durée de l\'aide',
      description: `Durée estimée de l'aide au logement: ${result.duration} mois`,
    });
  }

  return {
    benefitType: result.benefitType as BenefitType,
    isEligible: result.isEligible,
    calculatedAmount: result.monthlyAmount ?? result.calculatedAmount,
    reason: result.reason,
    category: 'housing',
    duration: result.duration,
    nextSteps: result.conditions,
    explanationSteps,
    structuredNextSteps,
    rawResult: result,
  };
}

/**
 * Central eligibility dispatcher.
 *
 * This function is intentionally simple: it delegates all domain-specific
 * logic to the underlying rules modules and only handles mapping to the
 * canonical EligibilityDecision shape.
 */
export async function checkEligibility(request: EligibilityRequest): Promise<EligibilityDecision> {
  switch (request.benefitType) {
    case 'aide-logement':
    case 'housing-allowance': {
      const housingRequest = mapFactsToHousingAidRequest(request.facts);
      const result = await checkHousingAidEligibility(housingRequest);
      return mapHousingAidResultToDecision(result);
    }

    // Additional benefit types will be added here (unemployment, family-allowance, etc.)

    default:
      return {
        benefitType: request.benefitType,
        isEligible: false,
        reason: `Eligibility dispatcher not implemented for benefit type: ${request.benefitType}`,
        explanationSteps: [
          {
            code: 'DISPATCHER_NOT_IMPLEMENTED',
            message: 'Le moteur d\'éligibilité n\'est pas encore configuré pour cette prestation.',
          },
        ],
      };
  }
}
