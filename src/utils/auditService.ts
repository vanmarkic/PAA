/**
 * Audit Service
 * Comprehensive audit trail for GDPR compliance
 */

import { AppDataSource } from '../database/data-source';
import { AuditLog, AuditAction, ResourceType } from '../database/entities/AuditLog';

export interface AuditContext {
  actorId: string;
  actorRole: string;
  ipAddress?: string;
  userAgent?: string;
  organizationId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: {
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  context: AuditContext;
  changes?: ChangeRecord[];
  reason?: string;
  tags?: string[];
}): Promise<void> {
  try {
    const auditLogRepository = AppDataSource.getRepository(AuditLog);

    const auditLog = auditLogRepository.create({
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      actorId: params.context.actorId,
      actorRole: params.context.actorRole,
      ipAddress: params.context.ipAddress || null,
      userAgent: params.context.userAgent || null,
      changes: params.changes || [],
      reason: params.reason || null,
      context: {
        organizationId: params.context.organizationId,
        sessionId: params.context.sessionId,
        requestId: params.context.requestId,
      },
      tags: params.tags || [],
    });

    await auditLogRepository.save(auditLog);
  } catch (error) {
    console.error('❌ Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Query audit logs
 */
export async function queryAuditLogs(filters: {
  actorId?: string;
  resourceType?: ResourceType;
  resourceId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const auditLogRepository = AppDataSource.getRepository(AuditLog);

  const query = auditLogRepository.createQueryBuilder('audit');

  if (filters.actorId) {
    query.andWhere('audit.actorId = :actorId', { actorId: filters.actorId });
  }

  if (filters.resourceType) {
    query.andWhere('audit.resourceType = :resourceType', {
      resourceType: filters.resourceType,
    });
  }

  if (filters.resourceId) {
    query.andWhere('audit.resourceId = :resourceId', {
      resourceId: filters.resourceId,
    });
  }

  if (filters.action) {
    query.andWhere('audit.action = :action', { action: filters.action });
  }

  if (filters.startDate) {
    query.andWhere('audit.timestamp >= :startDate', {
      startDate: filters.startDate,
    });
  }

  if (filters.endDate) {
    query.andWhere('audit.timestamp <= :endDate', { endDate: filters.endDate });
  }

  query
    .orderBy('audit.timestamp', 'DESC')
    .take(filters.limit || 100)
    .skip(filters.offset || 0);

  const [logs, total] = await query.getManyAndCount();

  return {
    logs,
    total,
    limit: filters.limit || 100,
    offset: filters.offset || 0,
  };
}

/**
 * Get audit trail for a specific resource
 */
export async function getResourceAuditTrail(
  resourceType: ResourceType,
  resourceId: string
) {
  return queryAuditLogs({
    resourceType,
    resourceId,
    limit: 1000, // Get all changes for the resource
  });
}

/**
 * Detect suspicious patterns (fraud detection)
 */
export async function detectSuspiciousActivity(params: {
  actorId?: string;
  organizationId?: string;
  timeWindow?: number; // minutes
}): Promise<{
  isSuspicious: boolean;
  reasons: string[];
}> {
  const auditLogRepository = AppDataSource.getRepository(AuditLog);
  const timeWindow = params.timeWindow || 60; // Default 60 minutes
  const since = new Date(Date.now() - timeWindow * 60 * 1000);

  const query = auditLogRepository
    .createQueryBuilder('audit')
    .where('audit.timestamp >= :since', { since });

  if (params.actorId) {
    query.andWhere('audit.actorId = :actorId', { actorId: params.actorId });
  }

  if (params.organizationId) {
    query.andWhere("audit.context->>'organizationId' = :orgId", {
      orgId: params.organizationId,
    });
  }

  const logs = await query.getMany();

  const reasons: string[] = [];
  let isSuspicious = false;

  // Check for rapid actions
  if (logs.length > 100) {
    isSuspicious = true;
    reasons.push(`Excessive actions: ${logs.length} in ${timeWindow} minutes`);
  }

  // Check for multiple IP addresses
  const ipAddresses = new Set(logs.map((l) => l.ipAddress).filter(Boolean));
  if (ipAddresses.size > 5) {
    isSuspicious = true;
    reasons.push(`Multiple IP addresses: ${ipAddresses.size}`);
  }

  // Check for failed actions
  const failedActions = logs.filter((l) => l.action === 'delete');
  if (failedActions.length > 10) {
    isSuspicious = true;
    reasons.push(`Excessive delete actions: ${failedActions.length}`);
  }

  return { isSuspicious, reasons };
}
