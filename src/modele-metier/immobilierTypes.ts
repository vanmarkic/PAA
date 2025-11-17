/**
 * Domain types for Belgian Real Estate (Immobilier) procedures
 * Covers 50 procedures across acquisition, rental, social housing, permits, and renovation
 *
 * Legal basis:
 * - Code Civil Belge (property law)
 * - Loi sur les baux d'habitation
 * - Code du Développement Territorial (CoDT) - Wallonie
 * - Code Bruxellois de l'Aménagement du Territoire (CoBAT)
 * - Vlaamse Codex Ruimtelijke Ordening (VCRO) - Flandre
 */

// ============= COMMON TYPES =============

export type BelgianRegion = 'wallonie' | 'bruxelles' | 'flandre';

export type PropertyType =
  | 'maison'
  | 'appartement'
  | 'terrain'
  | 'immeuble'
  | 'commerce'
  | 'bureau'
  | 'garage'
  | 'autre';

export type ResidenceType = 'principale' | 'secondaire' | 'investissement';

export interface LegalReference {
  title: string;
  articleNumber?: string;
  date: string;
  officialUrl: string;
  lastAmended?: string;
}

// ============= ACQUISITION TYPES =============

export interface PropertyBuyer {
  id: string;
  firstName: string;
  lastName: string;
  nationalNumber: string;
  monthlyIncome: number;
  hasPartner: boolean;
  partnerIncome?: number;
  savings: number;
  existingCharges: number;
  isPrimoAccedant: boolean;
  age: number;
  region: BelgianRegion;
}

export interface PropertyDetails {
  type: PropertyType;
  price: number;
  surface: number;
  bedrooms: number;
  energyClass: 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  cadastralIncome: number;
  yearBuilt: number;
  region: BelgianRegion;
  hasGarden: boolean;
  hasGarage: boolean;
  isNewBuild: boolean;
}

export interface MortgageCapacity {
  maxLoanAmount: number;
  requiredDeposit: number;
  maxMonthlyPayment: number;
  debtRatio: number;
  registrationFees: number;
  notaryFees: number;
  totalAcquisitionCost: number;
}

export interface AcquisitionCosts {
  propertyPrice: number;
  registrationFees: number;
  registrationAbatement?: number;
  notaryFees: number;
  mortgageFileFees: number;
  expertiseFees: number;
  totalCosts: number;
  region: BelgianRegion;
}

export type AcquisitionStatus =
  | 'recherche'
  | 'offre_soumise'
  | 'offre_acceptee'
  | 'compromis_signe'
  | 'credit_demande'
  | 'credit_approuve'
  | 'acte_programme'
  | 'acte_signe'
  | 'complete';

// ============= RENTAL TYPES =============

export interface RentalContract {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  monthlyRent: number;
  charges: number;
  deposit: number;
  depositType: 'bank_guarantee' | 'blocked_account' | 'cpas';
  duration: '9_years' | '3_years' | 'short_term';
  startDate: Date;
  registrationDate?: Date;
  indexationDate?: Date;
  currentRent?: number;
}

export interface TenantRights {
  canSublet: boolean;
  canMakeMiMinorModifications: boolean;
  hasRightToRenewal: boolean;
  protectedAgainstWinterEviction: boolean;
  requiredNotice: number; // in months
  penaltyForEarlyTermination?: number;
}

export interface RentalDispute {
  type: 'unpaid_rent' | 'damage' | 'illegal_eviction' | 'deposit_return' | 'repairs_needed';
  description: string;
  amountInDispute?: number;
  dateReported: Date;
  status: 'pending' | 'mediation' | 'court' | 'resolved';
}

export interface RentIndexation {
  baseRent: number;
  baseIndex: number;
  currentIndex: number;
  newRent: number;
  effectiveDate: Date;
  notificationRequired: boolean;
}

// ============= SOCIAL HOUSING TYPES =============

export interface SocialHousingApplicant {
  id: string;
  householdSize: number;
  annualIncome: number;
  numberOfChildren: number;
  hasDisability: boolean;
  disabilityPercentage?: number;
  isHomeless: boolean;
  hasUnsanitaryHousing: boolean;
  isSingleParent: boolean;
  age: number;
  region: BelgianRegion;
}

export interface SocialHousingEligibility {
  isEligible: boolean;
  incomeCeiling: number;
  priorityPoints: number;
  priorityCategory?: string;
  estimatedWaitTime?: string;
  reason?: string;
}

export interface SocialHousingAllocation {
  applicantId: string;
  propertyId: string;
  monthlyRent: number;
  socialRentCalculation: {
    referenceIncome: number;
    effortRate: number;
    baseRent: number;
    finalRent: number;
    charges: number;
  };
  allocationDate: Date;
}

export interface AISProperty {
  id: string;
  ownerPrivate: boolean;
  marketRent: number;
  aisRent: number;
  tenantProfile: 'social' | 'modest_income';
  managementFee: number;
  taxExemption: boolean;
}

// ============= URBAN PLANNING TYPES =============

export interface UrbanPermit {
  id: string;
  type: 'construction' | 'renovation' | 'demolition' | 'subdivision' | 'change_use';
  propertyAddress: string;
  applicantId: string;
  submissionDate: Date;
  status: UrbanPermitStatus;
  publicInquiryRequired: boolean;
  publicInquiryDates?: {
    start: Date;
    end: Date;
  };
  decisionDeadline: Date;
  decision?: 'approved' | 'approved_conditions' | 'refused';
  conditions?: string[];
}

export type UrbanPermitStatus =
  | 'draft'
  | 'submitted'
  | 'incomplete'
  | 'complete'
  | 'public_inquiry'
  | 'under_review'
  | 'decision_pending'
  | 'approved'
  | 'refused'
  | 'appealed';

export interface UrbanViolation {
  type: 'no_permit' | 'non_conforming' | 'illegal_division';
  description: string;
  dateDiscovered: Date;
  fineAmount?: number;
  regularizationPossible: boolean;
  demolitionOrdered: boolean;
}

export interface SubdivisionProject {
  totalArea: number;
  numberOfLots: number;
  publicSpacePercentage: number;
  greenSpacePercentage: number;
  infrastructureCost: number;
  bankGuaranteeRequired: number;
  approvalStatus: 'planning' | 'submitted' | 'approved' | 'in_progress' | 'completed';
}

// ============= RENOVATION TYPES =============

export interface RenovationProject {
  propertyId: string;
  ownerId: string;
  projectType: RenovationType[];
  estimatedCost: number;
  contractorQuotes: ContractorQuote[];
  subsidiesApplied: SubsidyApplication[];
  energyAuditRequired: boolean;
  currentEPC?: 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  targetEPC?: 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
}

export type RenovationType =
  | 'insulation_roof'
  | 'insulation_walls'
  | 'insulation_floor'
  | 'windows_replacement'
  | 'heating_system'
  | 'solar_panels'
  | 'heat_pump'
  | 'ventilation'
  | 'bathroom_adaptation'
  | 'accessibility';

export interface ContractorQuote {
  contractorId: string;
  contractorVAT: string;
  amount: number;
  vatRate: number;
  workDescription: string;
  validUntil: Date;
  isApproved: boolean;
}

export interface SubsidyApplication {
  type: 'prime_habitation' | 'renolution' | 'pae2' | 'adaptation_pmr';
  region: BelgianRegion;
  requestedAmount: number;
  approvedAmount?: number;
  status: 'preparing' | 'submitted' | 'under_review' | 'approved' | 'paid' | 'refused';
  submissionDate?: Date;
  paymentDate?: Date;
}

export interface EnergyAudit {
  auditType: 'PAE1' | 'PAE2' | 'PEB';
  auditorId: string;
  performanceActual: {
    consumptionKwhPerYear: number;
    co2Emissions: number;
    epcRating: string;
  };
  recommendations: {
    priority: number;
    measure: string;
    cost: number;
    savings: number;
    subsidyAvailable: number;
    roi: number;
  }[];
  validityYears: number;
  cost: number;
}

// ============= MORTGAGE TYPES =============

export interface MortgageApplication {
  applicantId: string;
  coApplicantId?: string;
  propertyId: string;
  loanAmount: number;
  duration: number; // in years
  interestRate: number;
  monthlyPayment: number;
  insuranceRequired: {
    fireInsurance: boolean;
    lifeInsurance: boolean;
    balanceInsurance: boolean;
  };
  bankName: string;
  status: 'pre_qualification' | 'application' | 'evaluation' | 'approved' | 'refused' | 'signed';
  loanToValue: number; // percentage
}

// ============= CO-OWNERSHIP TYPES =============

export interface Coproperty {
  buildingId: string;
  totalUnits: number;
  commonChargesAnnual: number;
  reserveFund: number;
  syndicId: string;
  lastGeneralAssembly: Date;
  nextGeneralAssembly: Date;
  majorWorksPlanned: {
    description: string;
    estimatedCost: number;
    votedDate?: Date;
    sharePerUnit: number;
  }[];
}

export interface CopropertyUnit {
  unitId: string;
  ownerId: string;
  shareQuotient: number; // e.g., 52/1000
  monthlyCharges: number;
  chargesArrears: number;
  votingRights: number;
}

// ============= CONSTANTS =============

export const IMMOBILIER_CONSTANTS = {
  // Registration fees by region
  REGISTRATION_FEES: {
    wallonie: {
      standard: 0.125, // 12.5%
      primaryResidence: 0.06, // 6% with abatement
      abatement: 20000,
    },
    bruxelles: {
      standard: 0.125,
      primaryResidence: 0.06,
      abatement: 175000, // On first 175000€
    },
    flandre: {
      standard: 0.10,
      primaryResidence: 0.06,
      abatement: 0, // Different system
    },
  },

  // Notary fees (approximate)
  NOTARY_FEES_RATE: 0.02, // 2% average

  // Rental deposit limits
  RENTAL_DEPOSIT: {
    wallonie: 2, // months
    bruxelles: 2,
    flandre: 3,
  },

  // Social housing income ceilings 2024
  SOCIAL_HOUSING_CEILINGS: {
    wallonie: {
      single: 25300,
      couple: 30700,
      perChild: 2400,
    },
    bruxelles: {
      single: 24229,
      couple: 26921,
      perChild: 2692,
    },
    flandre: {
      single: 26184,
      couple: 39276,
      perChild: 3648,
    },
  },

  // Maximum debt ratio for mortgage
  MAX_DEBT_RATIO: 0.33, // 33%

  // Minimum surfaces
  MIN_APARTMENT_SURFACE: 28, // m² (varies by region)
  MIN_ROOM_HEIGHT: 2.5, // meters

  // Energy renovation VAT rates
  VAT_RATES: {
    newBuild: 0.21,
    renovation: 0.06, // if > 10 years old
  },

  // Urban permit processing times (days)
  PERMIT_DELAYS: {
    simple: 75,
    withPublicInquiry: 115,
    integrated: 140,
  },
};

// ============= CALCULATION HELPERS =============

export interface RegistrationFeesCalculation {
  propertyPrice: number;
  region: BelgianRegion;
  isPrimaryResidence: boolean;
  isPrimoAccedant: boolean;
  hasAbatement: boolean;
  registrationFees: number;
  notaryFees: number;
  totalAcquisitionCosts: number;
}

export interface RentIndexationCalculation {
  baseRent: number;
  baseIndexDate: Date;
  baseIndex: number;
  currentIndex: number;
  newRent: number;
  increaseAmount: number;
  increasePercentage: number;
}

export interface SocialRentCalculation {
  householdIncome: number;
  referenceIncome: number;
  numberOfDependents: number;
  baseRent: number;
  effortRate: number;
  calculatedRent: number;
  minimumRent: number;
  maximumRent: number;
  finalRent: number;
  charges: number;
  totalMonthly: number;
}

export interface SubsidyCalculation {
  workType: RenovationType;
  workCost: number;
  householdIncome: number;
  incomeCategory: string;
  baseSubsidy: number;
  bonuses: {
    type: string;
    amount: number;
  }[];
  totalSubsidy: number;
  maxSubsidyRate: number; // percentage of cost
  finalSubsidy: number;
}

// ============= LEGAL DOCUMENTS =============

export interface CompromisVente {
  buyerId: string;
  sellerId: string;
  propertyId: string;
  price: number;
  suspensiveConditions: {
    type: 'mortgage' | 'urbanism' | 'servitudes' | 'soil_pollution';
    deadline: Date;
    fulfilled?: boolean;
  }[];
  deposit: number;
  notaryId: string;
  signingDate: Date;
  completionDeadline: Date;
}

export interface LeaseAgreement {
  type: 'residential' | 'commercial' | 'student';
  duration: '9_years' | '3_years' | 'short_term' | '1_year';
  landlordId: string;
  tenantIds: string[];
  guarantors?: string[];
  propertyDescription: string;
  monthlyRent: number;
  charges: number;
  chargesType: 'provision' | 'forfait';
  deposit: number;
  inventoryDate?: Date;
  registrationRequired: boolean;
  specificClauses: string[];
}

// ============= WORKFLOW STATES =============

export type PropertyAcquisitionState =
  | 'searching'
  | 'viewing'
  | 'offering'
  | 'negotiating'
  | 'compromis_signing'
  | 'mortgage_application'
  | 'conditions_fulfillment'
  | 'notary_preparation'
  | 'final_signing'
  | 'completed'
  | 'cancelled';

export type RentalApplicationState =
  | 'searching'
  | 'viewing'
  | 'application_submitted'
  | 'documents_verification'
  | 'approved'
  | 'contract_preparation'
  | 'contract_signed'
  | 'deposit_paid'
  | 'keys_received'
  | 'active_tenancy'
  | 'notice_given'
  | 'terminated';

export type PermitApplicationState =
  | 'preparation'
  | 'submitted'
  | 'completeness_check'
  | 'public_inquiry'
  | 'technical_review'
  | 'decision_pending'
  | 'approved'
  | 'approved_with_conditions'
  | 'refused'
  | 'appealed'
  | 'executed'
  | 'completed';

export type RenovationProjectState =
  | 'planning'
  | 'audit_ordered'
  | 'audit_completed'
  | 'quotes_requested'
  | 'quotes_received'
  | 'subsidy_application'
  | 'subsidy_approved'
  | 'contractor_selected'
  | 'work_started'
  | 'work_in_progress'
  | 'work_completed'
  | 'inspection'
  | 'subsidy_payment'
  | 'project_closed';

// ============= API RESPONSE TYPES =============

export interface ImmobilierApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
  };
}

export interface ImmobilierValidationError {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}