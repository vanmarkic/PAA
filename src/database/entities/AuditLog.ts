/**
 * Audit Log Entity
 * Comprehensive audit trail for GDPR compliance and fraud detection
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'state-transition'
  | 'rule-evaluation'
  | 'login'
  | 'logout';

export type ResourceType =
  | 'user'
  | 'ris-application'
  | 'agr-check'
  | 'conversion'
  | 'rule';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Index()
  timestamp: Date;

  // Actor (who performed the action)
  @Column({ type: 'uuid' })
  @Index()
  actorId: string;

  @Column({ type: 'varchar' })
  actorRole: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string | null;

  // Action details
  @Column({ type: 'varchar' })
  @Index()
  action: AuditAction;

  @Column({ type: 'varchar' })
  @Index()
  resourceType: ResourceType;

  @Column({ type: 'uuid' })
  @Index()
  resourceId: string;

  // Changes (before/after comparison)
  @Column({ type: 'jsonb', default: '[]' })
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];

  // Optional reason/comment
  @Column({ type: 'text', nullable: true })
  reason: string | null;

  // Context (additional metadata)
  @Column({ type: 'jsonb', default: '{}' })
  context: {
    organizationId?: string;
    sessionId?: string;
    requestId?: string;
    [key: string]: any;
  };

  // For searching and filtering
  @Index()
  @Column({ type: 'varchar', array: true, default: '{}' })
  tags: string[];
}
