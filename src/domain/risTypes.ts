/**
 * RIS-specific domain types
 */

export type RISCategory = 'isolé' | 'cohabitant' | 'famille monoparentale';

export type ResidencyStatus =
  | 'belgian-citizen'
  | 'eu-citizen'
  | 'long-term-resident'
  | 'refugee'
  | 'no-valid-status';

export interface RISUser {
  id: string;
  age: number;
  category: RISCategory;
  residencyStatus: ResidencyStatus;
  monthlyIncome: number;
  householdIncome?: number;
  patrimonyValue: number;
  isFullTimeStudent: boolean;
  childrenInCharge: number;
  isCurrentlyReceivingRIS: boolean;
}

export interface RISAmounts {
  isolé: number;
  cohabitant: number;
  familleMonoparentale: number;
  exonerationAmount: number; // For partial work income exemption
}

export interface RISEligibilityResult {
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
}

export interface PIISContract {
  userId: string;
  signedAt: Date;
  obligations: string[];
  goals: string[];
  followUpFrequency: 'monthly' | 'quarterly';
}

// Constants for 2024
export const RIS_AMOUNTS_2024: RISAmounts = {
  isolé: 1070.49,
  cohabitant: 713.66,
  familleMonoparentale: 1450.52,
  exonerationAmount: 252.00, // Approximate exemption for work income
};

export const RIS_CONSTANTS = {
  MIN_AGE: 18,
  MAX_PATRIMONY_MOVABLE: 6200, // EUR
  MAX_PATRIMONY_IMMOVABLE: 12500, // EUR (if inhabited)
  EXONERATION_RATE: 0.63, // 63% of work income exempt (approximate)
};
