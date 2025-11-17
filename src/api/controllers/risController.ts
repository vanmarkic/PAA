/**
 * RIS Application Controller
 * Handles RIS eligibility checks and application management
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../../database/data-source';
import { RISApplication } from '../../database/entities/RISApplication';
import { checkRISEligibility } from '../regles-eligibilite/risRules';
import { RISUser, RISCategory, ResidencyStatus } from '../modele-metier/risTypes';
import { createAuditLog } from '../../utils/auditService';
import { AuthenticatedUser } from '../../middleware/auth';
import { checkRISEligibilityBatch } from '../../batch/batchService';

interface CreateRISApplicationRequest {
  Body: {
    age: number;
    category: RISCategory;
    residencyStatus: ResidencyStatus;
    monthlyIncome: number;
    householdIncome?: number;
    patrimonyValue: number;
    isFullTimeStudent: boolean;
    childrenInCharge: number;
  };
}

/**
 * Check RIS eligibility without creating an application
 */
export async function checkEligibility(
  request: FastifyRequest<CreateRISApplicationRequest>,
  reply: FastifyReply
) {
  const user = (request as any).user as AuthenticatedUser;
  const risUser: RISUser = {
    id: user.id,
    ...request.body,
    isCurrentlyReceivingRIS: false,
  };

  try {
    const result = await checkRISEligibility(risUser);

    // Audit log
    await createAuditLog({
      action: 'rule-evaluation',
      resourceType: 'ris-application',
      resourceId: user.id,
      context: {
        actorId: user.id,
        actorRole: user.role,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
      tags: ['ris', 'eligibility-check'],
    });

    return reply.send({
      success: true,
      result,
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Create a new RIS application
 */
export async function createApplication(
  request: FastifyRequest<CreateRISApplicationRequest>,
  reply: FastifyReply
) {
  const user = (request as any).user as AuthenticatedUser;
  const risApplicationRepository = AppDataSource.getRepository(RISApplication);

  // Check eligibility first
  const risUser: RISUser = {
    id: user.id,
    ...request.body,
    isCurrentlyReceivingRIS: false,
  };

  const eligibilityResult = await checkRISEligibility(risUser);

  // Create application
  const application = risApplicationRepository.create({
    userId: user.id,
    organizationId: user.organizationId || 'default',
    status: eligibilityResult.isEligible ? 'eligible' : 'ineligible',
    ...request.body,
    eligibilityResult,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await risApplicationRepository.save(application);

  // Audit log
  await createAuditLog({
    action: 'create',
    resourceType: 'ris-application',
    resourceId: application.id,
    context: {
      actorId: user.id,
      actorRole: user.role,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    },
    tags: ['ris', 'application-created'],
  });

  return reply.status(201).send({
    success: true,
    application,
  });
}

/**
 * Get all applications for current user
 */
export async function getMyApplications(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user as AuthenticatedUser;
  const risApplicationRepository = AppDataSource.getRepository(RISApplication);

  const applications = await risApplicationRepository.find({
    where: { userId: user.id },
    order: { createdAt: 'DESC' },
  });

  return reply.send({
    success: true,
    applications,
  });
}

/**
 * Get application by ID
 */
export async function getApplicationById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = (request as any).user as AuthenticatedUser;
  const risApplicationRepository = AppDataSource.getRepository(RISApplication);

  const application = await risApplicationRepository.findOne({
    where: { id: request.params.id },
  });

  if (!application) {
    return reply.status(404).send({
      success: false,
      error: 'Application not found',
    });
  }

  // Check access
  if (
    application.userId !== user.id &&
    user.role !== 'admin' &&
    !(user.role === 'social-worker' && application.organizationId === user.organizationId)
  ) {
    return reply.status(403).send({
      success: false,
      error: 'Access denied',
    });
  }

  return reply.send({
    success: true,
    application,
  });
}

/**
 * Update application (with optimistic locking)
 */
export async function updateApplication(
  request: FastifyRequest<{
    Params: { id: string };
    Body: Partial<RISApplication> & { expectedVersion: number };
  }>,
  reply: FastifyReply
) {
  const user = (request as any).user as AuthenticatedUser;
  const risApplicationRepository = AppDataSource.getRepository(RISApplication);

  const application = await risApplicationRepository.findOne({
    where: { id: request.params.id },
  });

  if (!application) {
    return reply.status(404).send({
      success: false,
      error: 'Application not found',
    });
  }

  // Optimistic locking check
  if (application.version !== request.body.expectedVersion) {
    return reply.status(409).send({
      success: false,
      error: 'Concurrency conflict',
      message: `Application was modified by another user. Expected version ${request.body.expectedVersion}, current version ${application.version}`,
      currentApplication: application,
    });
  }

  // Check access
  if (
    application.userId !== user.id &&
    user.role !== 'admin' &&
    !(user.role === 'social-worker' && application.organizationId === user.organizationId)
  ) {
    return reply.status(403).send({
      success: false,
      error: 'Access denied',
    });
  }

  // Track changes for audit
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

  // Update fields
  const { expectedVersion: _expectedVersion, ...updates } = request.body;
  Object.keys(updates).forEach((key) => {
    const oldValue = (application as any)[key];
    const newValue = (updates as any)[key];
    if (oldValue !== newValue) {
      changes.push({ field: key, oldValue, newValue });
      (application as any)[key] = newValue;
    }
  });

  application.updatedBy = user.id;

  await risApplicationRepository.save(application);

  // Audit log
  await createAuditLog({
    action: 'update',
    resourceType: 'ris-application',
    resourceId: application.id,
    context: {
      actorId: user.id,
      actorRole: user.role,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    },
    changes,
    tags: ['ris', 'application-updated'],
  });

  return reply.send({
    success: true,
    application,
  });
}

/**
 * Batch eligibility check (for CPAS workers)
 */
export async function batchEligibilityCheck(
  request: FastifyRequest<{
    Body: {
      users: RISUser[];
    };
  }>,
  reply: FastifyReply
) {
  const user = (request as any).user as AuthenticatedUser;

  // Only social workers and admins can do batch checks
  if (user.role !== 'social-worker' && user.role !== 'admin') {
    return reply.status(403).send({
      success: false,
      error: 'Only social workers and admins can perform batch checks',
    });
  }

  const results = await checkRISEligibilityBatch({
    users: request.body.users,
    onProgress: (completed, total) => {
      // In production, this could emit WebSocket events for real-time progress
      console.log(`Batch progress: ${completed}/${total}`);
    },
  });

  return reply.send({
    success: true,
    results,
    total: results.length,
  });
}
