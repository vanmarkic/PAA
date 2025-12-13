/**
 * Generic Eligibility Controller
 *
 * Exposes a single endpoint for eligibility checks across all benefits.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { checkEligibility } from '../../services/eligibilityService';
import { EligibilityRequest } from '../../domain/types';
import { createAuditLog } from '../../utils/auditService';
import { AuthenticatedUser } from '../../middleware/auth';

interface EligibilityRequestBody extends EligibilityRequest {}

export async function checkGenericEligibility(
  request: FastifyRequest<{ Body: EligibilityRequestBody }>,
  reply: FastifyReply
) {
  const user = (request as any).user as AuthenticatedUser | undefined;

  try {
    const { benefitType, personId, facts } = request.body;

    const decision = await checkEligibility({
      benefitType,
      personId: personId || user?.id,
      facts,
    });

    // Audit log (best-effort)
    if (user) {
      await createAuditLog({
        action: 'rule-evaluation',
        resourceType: 'eligibility-check',
        resourceId: personId || user.id,
        context: {
          actorId: user.id,
          actorRole: user.role,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
        tags: [benefitType, 'generic-eligibility'],
      });
    }

    return reply.send({
      success: true,
      decision,
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Eligibility check failed',
    });
  }
}
