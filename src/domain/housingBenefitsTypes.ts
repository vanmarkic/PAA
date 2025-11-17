/**
 * Housing and Energy Benefits Types
 * Comprehensive type definitions for Belgian housing assistance programs
 */

export enum Region {
  BRUSSELS = 'brussels',
  WALLONIA = 'wallonia',
  FLANDERS = 'flanders'
}

export enum HousingStatus {
  OWNER = 'owner',
  TENANT = 'tenant',
  SOCIAL_TENANT = 'social-tenant',
  HOMELESS = 'homeless',
  TEMPORARY_HOUSING = 'temporary-housing'
}

export enum RenovationType {
  INSULATION = 'insulation',
  HEATING = 'heating',
  SOLAR_PANELS = 'solar-panels',
  ROOF = 'roof',
  WINDOWS = 'windows',
  ELECTRICITY = 'electricity',
  PLUMBING = 'plumbing'
}

export enum EnergyMeterType {
  STANDARD = 'standard',
  BUDGET = 'budget',
  PREPAID = 'prepaid',
  SOCIAL = 'social'
}

export enum BuildingAge {
  LESS_THAN_10_YEARS = '<10',
  BETWEEN_10_AND_20 = '10-20',
  BETWEEN_20_AND_30 = '20-30',
  MORE_THAN_30 = '>30'
}

export interface HousingApplicant {
  id: string;
  region: Region;
  age: number;
  householdMembers: number;
  childrenUnder18: number;
  monthlyIncome: number;
  annualIncome: number;
  housingStatus: HousingStatus;
  currentRent?: number;
  propertyValue?: number;
  isDisabled: boolean;
  isElderly: boolean; // 65+
  isSingleParent: boolean;
  hasLargeFamily: boolean; // 3+ children
  isStudentOrTrainee: boolean;
}

export interface SocialHousingApplication {
  applicantId: string;
  region: Region;
  applicationDate: Date;
  priority: 'standard' | 'priority' | 'urgent';
  points: number;
  waitingPosition?: number;
  estimatedWaitTime?: number; // in months
  preferredMunicipalities: string[];
  requiredBedrooms: number;
}

export interface RenovationProject {
  type: RenovationType;
  estimatedCost: number;
  quotes: number;
  workStartDate?: Date;
  workEndDate?: Date;
  contractorVAT?: string;
  isEnergyEfficient: boolean;
  expectedEnergyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
}

export interface EnergyConsumption {
  electricity: {
    monthlyKWh: number;
    annualKWh: number;
    provider: string;
    hasSocialTariff: boolean;
  };
  gas: {
    monthlyKWh: number;
    annualKWh: number;
    provider: string;
    hasSocialTariff: boolean;
  };
  meterType: EnergyMeterType;
  hasEnergyDebt: boolean;
  debtAmount?: number;
}

// Regional Housing Aid Amounts
export interface HousingAidAmounts {
  brussels: {
    single: number;
    family: number;
    maxMonthly: number;
    incomeLimit: {
      single: number;
      couple: number;
      perChild: number;
    };
  };
  wallonia: {
    base: number;
    perChild: number;
    maxMonthly: number;
    incomeLimit: {
      single: number;
      couple: number;
      perChild: number;
    };
  };
  flanders: {
    base: number;
    supplement: number;
    maxMonthly: number;
    incomeLimit: {
      single: number;
      couple: number;
      perChild: number;
    };
  };
}

// Social Housing Income Limits
export interface SocialHousingLimits {
  brussels: {
    single: number;
    couple: number;
    perDependent: number;
    priorityThreshold: number; // Very low income
  };
  wallonia: {
    category1: number; // Lowest income
    category2: number; // Low income
    category3: number; // Modest income
    perDependent: number;
  };
  flanders: {
    single: number;
    singleDisabled: number;
    couple: number;
    perDependent: number;
  };
}

// Renovation Premium Rates
export interface RenovationPremiumRates {
  brussels: {
    maxAmount: number;
    incomeCategories: {
      category1: { limit: number; rate: number }; // Lowest income, highest rate
      category2: { limit: number; rate: number };
      category3: { limit: number; rate: number };
    };
    bonuses: {
      energyEfficiency: number;
      heritage: number;
      disability: number;
    };
  };
  wallonia: {
    baseAmount: number;
    incomeMultiplier: {
      c1: number; // Income < 23000
      c2: number; // Income 23000-32700
      c3: number; // Income 32700-43200
      c4: number; // Income 43200-97700
    };
    maxPerWork: Record<RenovationType, number>;
  };
  flanders: {
    maxAmount: number;
    standardRate: number;
    socialRate: number; // For protected customers
    premiumPerType: Record<RenovationType, number>;
  };
}

// Energy Tariff Structure
export interface EnergyTariffRates {
  standard: {
    electricity: {
      dayRate: number; // cents/kWh
      nightRate: number;
      fixedCharge: number; // EUR/year
    };
    gas: {
      rate: number; // cents/kWh
      fixedCharge: number;
    };
  };
  social: {
    electricity: {
      rate: number; // Reduced social tariff
      maxKWh: number; // Maximum at social rate
    };
    gas: {
      rate: number;
      maxKWh: number;
    };
  };
}

// Calculation Results
export interface HousingAidResult {
  isEligible: boolean;
  benefit: 'housing-aid' | 'rent-supplement' | 'moving-aid';
  monthlyAmount?: number;
  duration?: number; // months
  conditions?: string[];
  reason?: string;
}

export interface SocialHousingResult {
  isEligible: boolean;
  incomeCategory?: string;
  estimatedRent?: number;
  points?: number;
  priority?: 'standard' | 'priority' | 'urgent';
  estimatedWaitTime?: number; // months
  reason?: string;
}

export interface RenovationPremiumResult {
  isEligible: boolean;
  estimatedPremium?: number;
  applicableRate?: number;
  bonuses?: string[];
  maxAmount?: number;
  conditions?: string[];
  reason?: string;
}

export interface EnergyAssistanceResult {
  isEligible: boolean;
  type?: 'social-tariff' | 'energy-premium' | 'budget-meter' | 'debt-plan';
  monthlyReduction?: number;
  annualSavings?: number;
  additionalSupport?: string[];
  reason?: string;
}

export interface InsulationPremiumResult {
  isEligible: boolean;
  premiumAmount?: number;
  coverageRate?: number; // percentage
  maxSurface?: number; // m²
  energyImpact?: string; // Expected improvement
  reason?: string;
}

export interface SolarGrantResult {
  isEligible: boolean;
  grantAmount?: number;
  installationCapacity?: number; // kWp
  paybackPeriod?: number; // years
  taxBenefits?: number;
  reason?: string;
}

// 2024 Constants and Thresholds
export const HOUSING_AID_AMOUNTS_2024: HousingAidAmounts = {
  brussels: {
    single: 186,
    family: 140,
    maxMonthly: 250,
    incomeLimit: {
      single: 17000,
      couple: 24000,
      perChild: 3000
    }
  },
  wallonia: {
    base: 100,
    perChild: 20,
    maxMonthly: 180,
    incomeLimit: {
      single: 14500,
      couple: 19500,
      perChild: 2700
    }
  },
  flanders: {
    base: 150,
    supplement: 30,
    maxMonthly: 220,
    incomeLimit: {
      single: 18000,
      couple: 27000,
      perChild: 3500
    }
  }
};

export const SOCIAL_HOUSING_LIMITS_2024: SocialHousingLimits = {
  brussels: {
    single: 25167,
    couple: 27963,
    perDependent: 2796,
    priorityThreshold: 15100
  },
  wallonia: {
    category1: 14500,
    category2: 19300,
    category3: 38600,
    perDependent: 2700
  },
  flanders: {
    single: 25550,
    singleDisabled: 27694,
    couple: 38325,
    perDependent: 2144
  }
};

export const RENOVATION_PREMIUM_RATES_2024: RenovationPremiumRates = {
  brussels: {
    maxAmount: 35000,
    incomeCategories: {
      category1: { limit: 23725, rate: 0.70 },
      category2: { limit: 34767, rate: 0.40 },
      category3: { limit: 71473, rate: 0.20 }
    },
    bonuses: {
      energyEfficiency: 0.10,
      heritage: 0.25,
      disability: 0.20
    }
  },
  wallonia: {
    baseAmount: 2000,
    incomeMultiplier: {
      c1: 6,
      c2: 4,
      c3: 2,
      c4: 1
    },
    maxPerWork: {
      [RenovationType.INSULATION]: 3000,
      [RenovationType.HEATING]: 4000,
      [RenovationType.SOLAR_PANELS]: 4000,
      [RenovationType.ROOF]: 6000,
      [RenovationType.WINDOWS]: 3500,
      [RenovationType.ELECTRICITY]: 2000,
      [RenovationType.PLUMBING]: 2500
    }
  },
  flanders: {
    maxAmount: 30000,
    standardRate: 0.35,
    socialRate: 0.50,
    premiumPerType: {
      [RenovationType.INSULATION]: 4000,
      [RenovationType.HEATING]: 3500,
      [RenovationType.SOLAR_PANELS]: 3750,
      [RenovationType.ROOF]: 5000,
      [RenovationType.WINDOWS]: 3000,
      [RenovationType.ELECTRICITY]: 1500,
      [RenovationType.PLUMBING]: 2000
    }
  }
};

export const ENERGY_TARIFF_2024: EnergyTariffRates = {
  standard: {
    electricity: {
      dayRate: 22.773, // cents/kWh
      nightRate: 18.214,
      fixedCharge: 125 // EUR/year
    },
    gas: {
      rate: 4.745, // cents/kWh
      fixedCharge: 95
    }
  },
  social: {
    electricity: {
      rate: 13.254,
      maxKWh: 2000
    },
    gas: {
      rate: 2.867,
      maxKWh: 4000
    }
  }
};

export const HOUSING_CONSTANTS = {
  MIN_INCOME_HOUSING_AID: 500,
  MAX_RENT_PERCENTAGE: 0.33, // Max 33% of income for rent
  SOCIAL_HOUSING_MAX_WAIT: 120, // months
  RENOVATION_PREMIUM_VALIDITY: 24, // months to complete work
  ENERGY_DEBT_THRESHOLD: 250,
  INSULATION_MIN_R_VALUE: 4.5,
  SOLAR_MIN_CAPACITY: 2.5, // kWp
  LARGE_FAMILY_THRESHOLD: 3, // children
  ELDERLY_AGE: 65,
  DISABILITY_PREMIUM_BONUS: 1.2 // 20% bonus
};