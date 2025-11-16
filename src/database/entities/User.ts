/**
 * User Entity
 * Represents both beneficiaries and administrative users (CPAS workers, legal experts)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { RISApplication } from './RISApplication';

export type UserRole = 'beneficiary' | 'social-worker' | 'legal-expert' | 'admin';

export type EmploymentStatus = 'part-time' | 'full-time' | 'unemployed' | 'student';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ select: false }) // Don't include in queries by default (security)
  passwordHash: string;

  @Column({ type: 'varchar' })
  role: UserRole;

  // CPAS/Organization for multi-tenancy
  @Column({ type: 'uuid', nullable: true })
  @Index()
  organizationId: string | null;

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  // Employment & eligibility data (for beneficiaries)
  @Column({ type: 'varchar', nullable: true })
  employmentStatus: EmploymentStatus | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlySalaryGross: number;

  @Column({ type: 'int', default: 0 })
  workingHoursPerWeek: number;

  @Column({ default: false })
  hasRightsMaintenance: boolean;

  // Permissions (JSON array of permission objects)
  @Column({ type: 'jsonb', default: '[]' })
  permissions: {
    resource: string;
    actions: string[];
    scope: 'own' | 'organization' | 'all';
  }[];

  // Relations
  @OneToMany(() => RISApplication, (application) => application.user)
  risApplications: RISApplication[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ default: true })
  isActive: boolean;
}
