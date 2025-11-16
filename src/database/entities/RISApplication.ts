/**
 * RIS Application Entity
 * Represents a RIS (Revenu d'Intégration Sociale) application with state tracking
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { User } from './User';

export type RISWorkflowState =
  | 'idle'
  | 'checkingEligibility'
  | 'eligible'
  | 'ineligible'
  | 'declined'
  | 'creatingPIIS'
  | 'active'
  | 'recalculating'
  | 'checkingCompliance'
  | 'complianceWarning'
  | 'terminated';

export type RISCategory = 'isolé' | 'cohabitant' | 'famille monoparentale';

export type ResidencyStatus =
  | 'belgian-citizen'
  | 'eu-citizen'
  | 'long-term-resident'
  | 'refugee'
  | 'no-valid-status';

@Entity('ris_applications')
export class RISApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User relationship
  @ManyToOne(() => User, (user) => user.risApplications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  // CPAS/Organization for multi-tenancy
  @Column({ type: 'uuid' })
  @Index()
  organizationId: string;

  // Assigned social worker
  @Column({ type: 'uuid', nullable: true })
  assignedTo: string | null;

  // Current workflow state
  @Column({ type: 'varchar' })
  @Index()
  status: RISWorkflowState;

  // RIS-specific data
  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar' })
  category: RISCategory;

  @Column({ type: 'varchar' })
  residencyStatus: ResidencyStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyIncome: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  householdIncome: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  patrimonyValue: number;

  @Column({ default: false })
  isFullTimeStudent: boolean;

  @Column({ type: 'int', default: 0 })
  childrenInCharge: number;

  // Eligibility result (stored as JSON)
  @Column({ type: 'jsonb', nullable: true })
  eligibilityResult: {
    isEligible: boolean;
    category?: RISCategory;
    monthlyAmount?: number;
    reason?: string;
    obligations?: string[];
    exoneration?: {
      workIncome: number;
      exemptedAmount: number;
      netIncome: number;
    };
  } | null;

  // PIIS Contract (Projet Individualisé d'Intégration Sociale)
  @Column({ type: 'jsonb', nullable: true })
  piisContract: {
    signedAt: Date;
    obligations: string[];
    goals: string[];
    followUpFrequency: 'monthly' | 'quarterly';
  } | null;

  // Compliance tracking
  @Column({ type: 'jsonb', default: '[]' })
  complianceIssues: {
    detectedAt: Date;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    resolved: boolean;
  }[];

  // Audit fields
  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid' })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  // Optimistic locking for concurrency control
  @VersionColumn()
  version: number;
}
