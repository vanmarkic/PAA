/**
 * Comprehensive Type Definitions for Belgian Social and Fiscal Rights
 *
 * This file contains type definitions for 100 state machines covering:
 * - Social Benefits (Allocations sociales)
 * - Fiscal Rights (Droits fiscaux)
 * - Social Services (Services sociaux)
 * - Employment & Labor Rights (Droits du travail)
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export type Language = 'fr' | 'nl' | 'de';
export type Region = 'wallonie' | 'flandre' | 'bruxelles';
export type Gender = 'M' | 'F' | 'X';

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  nationalRegistryNumber: string; // Numéro de registre national
  dateOfBirth: Date;
  gender: Gender;
  address: Address;
  language: Language;
}

export interface Address {
  street: string;
  number: string;
  box?: string;
  postalCode: string;
  city: string;
  region: Region;
}

export interface Document {
  id: string;
  type: string;
  uploadedAt: Date;
  validUntil?: Date;
  status: 'pending' | 'validated' | 'rejected';
}

// ============================================================================
// SOCIAL BENEFITS TYPES (Allocations sociales)
// ============================================================================

// Unemployment Benefits (Allocations de chômage)
export interface UnemploymentContext {
  person: Person;
  lastEmploymentEndDate: Date;
  reasonForUnemployment: 'licenciement' | 'fin-contrat' | 'force-majeure' | 'autre';
  previousSalary: number;
  workingDays: number;
  isRegisteredONEM: boolean;
  allocationAmount?: number;
}

// Family Allowances (Allocations familiales)
export interface FamilyAllowanceContext {
  parent: Person;
  children: Child[];
  totalAmount: number;
  paymentFrequency: 'monthly' | 'quarterly';
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  isStudying: boolean;
  hasDisability: boolean;
  rank: number; // Birth order affects payment in some regions
}

// Birth Premium (Prime de naissance)
export interface BirthPremiumContext {
  mother: Person;
  expectedBirthDate: Date;
  isFirstChild: boolean;
  region: Region;
  amount: number;
}

// Disability Allowance (Allocation pour personnes handicapées)
export interface DisabilityAllowanceContext {
  person: Person;
  medicalEvaluationDate?: Date;
  disabilityPercentage?: number;
  autonomyReduction?: number; // ARR - Aide à la Réduction d'Autonomie
  category?: 1 | 2 | 3 | 4 | 5;
  monthlyAmount?: number;
}

// Pensions
export interface PensionContext {
  person: Person;
  retirementAge: number;
  careerYears: number;
  averageSalary: number;
  monthlyPensionAmount?: number;
}

export interface SurvivorPensionContext {
  survivor: Person;
  deceased: Person;
  dateOfDeath: Date;
  marriageDuration: number;
  monthlyPensionAmount?: number;
}

// GRAPA (Garantie de revenus aux personnes âgées)
export interface GrapaContext {
  person: Person;
  age: number;
  yearsOfResidency: number;
  monthlyIncome: number;
  patrimonyValue: number;
  isCohabiting: boolean;
  monthlyAmount?: number;
}

// Integration Allowance (Allocation d'intégration)
export interface IntegrationAllowanceContext {
  person: Person;
  needsAssessment: string[];
  integrationCategory?: 1 | 2 | 3 | 4 | 5;
  monthlyAmount?: number;
}

// Social Assistance (Aide sociale)
export interface SocialAssistanceContext {
  person: Person;
  household: Person[];
  monthlyIncome: number;
  socialWorkerReport?: string;
  assistancePlan?: AssistancePlan;
}

export interface AssistancePlan {
  needs: string[];
  actions: string[];
  timeline: string;
  followUpDate: Date;
}

// Health Insurance (Mutuelle/Assurance maladie)
export interface HealthInsuranceContext {
  person: Person;
  mutuelleId: string;
  hasDMG: boolean; // Dossier Médical Global
  lastCheckupDate?: Date;
  reimbursements: Reimbursement[];
}

export interface Reimbursement {
  date: Date;
  type: string;
  amount: number;
  reimbursedAmount: number;
}

// Parental Leave (Congé parental)
export interface ParentalLeaveContext {
  employee: Person;
  employer: string;
  childBirthDate: Date;
  leaveType: 'full-time' | 'half-time' | '1/5-time';
  startDate: Date;
  endDate: Date;
  approved: boolean;
}

// Maternity Leave (Congé de maternité)
export interface MaternityLeaveContext {
  mother: Person;
  employer: string;
  expectedBirthDate: Date;
  prenatalLeaveStart: Date;
  actualBirthDate?: Date;
  postnatalLeaveEnd?: Date;
  complication: boolean;
}

// Study Grants and Scholarships
export interface StudyGrantContext {
  student: Person;
  parents: Person[];
  householdIncome: number;
  studyLevel: 'secondaire' | 'supérieur';
  grantAmount?: number;
}

export interface ScholarshipContext {
  student: Person;
  academicResults: AcademicResults;
  householdIncome: number;
  scholarshipAmount?: number;
  renewalRequired: boolean;
}

export interface AcademicResults {
  year: string;
  percentage: number;
  creditsObtained: number;
  creditsTotal: number;
}

// Housing Assistance (Aide au logement)
export interface HousingAssistanceContext {
  tenant: Person;
  landlord: Person;
  rentalAddress: Address;
  monthlyRent: number;
  leaseDocument?: Document;
  assistanceAmount?: number;
}

// Rental Guarantee (Garantie locative)
export interface RentalGuaranteeContext {
  tenant: Person;
  landlord: Person;
  rentalAddress: Address;
  monthlyRent: number;
  guaranteeAmount: number;
  fpcl: boolean; // Fonds Public de la Caution Locative
}

// Elderly Care (Aide aux personnes âgées)
export interface ElderlyCareContext {
  person: Person;
  age: number;
  autonomyLevel: 'autonome' | 'semi-dépendant' | 'dépendant';
  servicesNeeded: string[];
  caregiver?: Person;
}

// Childcare Services (Services de garde d'enfants)
export interface ChildcareContext {
  parent: Person;
  children: Child[];
  householdIncome: number;
  childcareType: 'crèche' | 'gardienne' | 'ONE' | 'Kind en Gezin';
  monthlyFee?: number;
}

// Medical Card (Carte médicale)
export interface MedicalCardContext {
  person: Person;
  household: Person[];
  monthlyIncome: number;
  hasCard: boolean;
  validUntil?: Date;
}

// Legal Aid (Aide juridique)
export interface LegalAidContext {
  person: Person;
  monthlyIncome: number;
  legalIssue: string;
  assignedLawyer?: string;
  caseStatus: 'pending' | 'ongoing' | 'closed';
}

// Existence Security Fund (Fonds de sécurité d'existence)
export interface ExistenceFundContext {
  employee: Person;
  employer: string;
  sector: string;
  annualPremiums: number;
  rights: string[];
}

// Heating Allowance (Allocation de chauffage)
export interface HeatingAllowanceContext {
  person: Person;
  household: Person[];
  heatingType: 'mazout' | 'gaz' | 'électricité';
  invoice?: Document;
  seasonalAmount?: number;
}

// Social Energy Tariff (Tarif social énergie)
export interface SocialEnergyContext {
  person: Person;
  hasAutomaticRight: boolean; // BIM, RIS, etc.
  supplier: string;
  tariffActive: boolean;
}

// Social Transport Subscription (Abonnement social transport)
export interface SocialTransportContext {
  person: Person;
  transportType: 'STIB' | 'De Lijn' | 'TEC' | 'SNCB';
  eligibilityReason: string;
  subscriptionActive: boolean;
}

// ============================================================================
// FISCAL RIGHTS TYPES (Droits fiscaux)
// ============================================================================

// Tax Credit (Crédit d'impôt)
export interface TaxCreditContext {
  taxpayer: Person;
  taxYear: number;
  eligibilityReason: string;
  creditAmount?: number;
  documents: Document[];
}

// Housing Tax Deduction (Déduction fiscale habitation)
export interface HousingTaxDeductionContext {
  taxpayer: Person;
  property: Property;
  isPrimaryResidence: boolean;
  loanAmount: number;
  interestPaid: number;
  deductionAmount?: number;
}

export interface Property {
  cadastralIncome: number;
  address: Address;
  purchaseDate: Date;
  value: number;
}

// Investment Deduction (Déduction investissement)
export interface InvestmentDeductionContext {
  taxpayer: Person;
  company: string;
  investmentType: string;
  investmentAmount: number;
  taxYear: number;
  deductionAmount?: number;
}

// Pension Savings Tax Reduction (Réduction d'impôt épargne-pension)
export interface PensionSavingsContext {
  taxpayer: Person;
  taxYear: number;
  amountPaid: number;
  certificate?: Document;
  taxReductionAmount?: number;
}

// Meal Vouchers (Chèques repas)
export interface MealVouchersContext {
  employer: string;
  employees: Person[];
  voucherValue: number;
  employerContribution: number;
  employeeContribution: number;
  distributionFrequency: 'monthly' | 'quarterly';
}

// Eco Vouchers (Éco-chèques)
export interface EcoVouchersContext {
  employer: string;
  employee: Person;
  annualAmount: number;
  validProducts: string[];
  active: boolean;
}

// Benefits in Kind (Avantages de toute nature)
export interface BenefitsInKindContext {
  employee: Person;
  employer: string;
  benefits: BenefitInKind[];
  totalTaxableValue: number;
}

export interface BenefitInKind {
  type: 'voiture' | 'logement' | 'téléphone' | 'ordinateur' | 'autre';
  description: string;
  marketValue: number;
  taxableValue: number;
}

// Reduced VAT (TVA réduite)
export interface ReducedVATContext {
  person: Person;
  purchaseType: 'rénovation' | 'démolition-reconstruction' | 'services';
  propertyAge?: number;
  vatRate: 6 | 12 | 21;
  amount: number;
}

// Property Tax Exemption (Exonération précompte immobilier)
export interface PropertyTaxExemptionContext {
  owner: Person;
  property: Property;
  isPrimaryResidence: boolean;
  exemptionReason: string;
  exemptionAmount?: number;
}

// Housing Bonus (Bonus logement)
export interface HousingBonusContext {
  taxpayer: Person;
  property: Property;
  loanAmount: number;
  isPrimaryResidence: boolean;
  acquisitionDate: Date;
  bonusAmount?: number;
}

// Childcare Expense Deduction (Déduction frais de garde)
export interface ChildcareExpenseContext {
  parent: Person;
  children: Child[];
  childcareExpenses: number;
  certificates: Document[];
  deductionAmount?: number;
}

// Local Service Tax Credit (Crédit d'impôt service local)
export interface LocalServiceCreditContext {
  taxpayer: Person;
  taxYear: number;
  services: LocalService[];
  totalExpenses: number;
  creditAmount?: number;
}

export interface LocalService {
  provider: string;
  serviceType: string;
  amount: number;
  date: Date;
}

// Marriage Quotient (Quotient conjugal)
export interface MarriageQuotientContext {
  spouse1: Person;
  spouse2: Person;
  income1: number;
  income2: number;
  taxYear: number;
  applicable: boolean;
}

// Alimony (Rente alimentaire)
export interface AlimonyContext {
  payer: Person;
  receiver: Person;
  monthlyAmount: number;
  courtJudgment: Document;
  taxDeductible: boolean;
  taxable: boolean;
}

// Donation Deduction (Déduction dons)
export interface DonationDeductionContext {
  taxpayer: Person;
  taxYear: number;
  donations: Donation[];
  totalDeduction?: number;
}

export interface Donation {
  organization: string;
  isRecognized: boolean;
  amount: number;
  certificate: Document;
  date: Date;
}

// Professional Expenses (Frais professionnels)
export interface ProfessionalExpensesContext {
  taxpayer: Person;
  taxYear: number;
  expenseMode: 'forfaitaire' | 'réels';
  realExpenses?: RealExpense[];
  totalDeduction?: number;
}

export interface RealExpense {
  type: string;
  description: string;
  amount: number;
  justification: Document;
}

// Electric Vehicle Deduction (Déduction véhicule électrique)
export interface ElectricVehicleContext {
  taxpayer: Person;
  vehicle: Vehicle;
  purchaseDate: Date;
  purchasePrice: number;
  deductionAmount?: number;
}

export interface Vehicle {
  make: string;
  model: string;
  type: 'électrique' | 'hybride' | 'thermique';
  co2Emissions: number;
  licensePlate: string;
}

// Renovation Premium (Prime rénovation)
export interface RenovationPremiumContext {
  owner: Person;
  property: Property;
  renovationType: string[];
  quotes: Document[];
  invoices: Document[];
  premiumAmount?: number;
}

// Insulation Deduction (Déduction isolation)
export interface InsulationDeductionContext {
  owner: Person;
  property: Property;
  insulationType: 'toiture' | 'murs' | 'sols' | 'fenêtres';
  workAmount: number;
  meetsStandards: boolean;
  deductionAmount?: number;
}

// Sustainable Investment Tax Credit (Crédit d'impôt investissement durable)
export interface SustainableInvestmentContext {
  taxpayer: Person;
  investmentType: 'panneaux-solaires' | 'pompe-chaleur' | 'autre';
  investmentAmount: number;
  taxYear: number;
  creditAmount?: number;
}

// Capital Gains Exemption (Exonération plus-value)
export interface CapitalGainsContext {
  taxpayer: Person;
  asset: 'immobilier' | 'actions' | 'autre';
  acquisitionDate: Date;
  saleDate: Date;
  capitalGain: number;
  exemptionApplies: boolean;
}

// Mortgage Loan Deduction (Déduction emprunt hypothécaire)
export interface MortgageDeductionContext {
  taxpayer: Person;
  property: Property;
  loanAmount: number;
  interestPaid: number;
  isPrimaryResidence: boolean;
  deductionAmount?: number;
}

// Inheritance Allowance (Abattement succession)
export interface InheritanceContext {
  deceased: Person;
  heirs: Heir[];
  estate: Estate;
  allowanceAmount?: number;
}

export interface Heir {
  person: Person;
  relationship: 'conjoint' | 'enfant' | 'parent' | 'autre';
  inheritanceShare: number;
}

export interface Estate {
  realEstate: Property[];
  movableAssets: number;
  debts: number;
  totalValue: number;
}

// Reduced Donation Rights (Droits de donation réduits)
export interface DonationRightsContext {
  donor: Person;
  recipient: Person;
  relationship: string;
  donationType: 'argent' | 'immobilier' | 'mobilier';
  value: number;
  reducedRate: number;
}

// Movable Income Exemption (Exonération revenus mobiliers)
export interface MovableIncomeContext {
  taxpayer: Person;
  taxYear: number;
  dividends: number;
  interests: number;
  totalMovableIncome: number;
  exemptionThreshold: number;
  exemptionAmount?: number;
}

// ============================================================================
// SOCIAL SERVICES TYPES (Services sociaux)
// ============================================================================

// Social Housing (Logement social)
export interface SocialHousingContext {
  applicant: Person;
  household: Person[];
  householdIncome: number;
  region: Region;
  priorityPoints?: number;
  waitingListPosition?: number;
}

// School Enrollment (Inscription école)
export interface SchoolEnrollmentContext {
  child: Child;
  parents: Person[];
  school: School;
  enrollmentYear: number;
  documents: Document[];
}

export interface School {
  name: string;
  address: Address;
  network: 'communauté' | 'officiel' | 'libre';
  level: 'maternel' | 'primaire' | 'secondaire';
}

// Free School Meals (Repas scolaires gratuits)
export interface FreeSchoolMealsContext {
  child: Child;
  parents: Person[];
  householdIncome: number;
  school: School;
  eligible: boolean;
}

// School Transport (Transport scolaire)
export interface SchoolTransportContext {
  child: Child;
  parents: Person[];
  homeAddress: Address;
  school: School;
  distance: number;
  eligible: boolean;
}

// Food Assistance (Aide alimentaire)
export interface FoodAssistanceContext {
  person: Person;
  household: Person[];
  monthlyIncome: number;
  referralSource: string;
  approvedUntil?: Date;
}

// Food Bank (Banque alimentaire)
export interface FoodBankContext {
  person: Person;
  household: Person[];
  registrationDate: Date;
  pickupFrequency: 'weekly' | 'biweekly' | 'monthly';
  activeStatus: boolean;
}

// Social Restaurants (Restaurants sociaux)
export interface SocialRestaurantContext {
  person: Person;
  monthlyIncome: number;
  mealCard?: string;
  mealsPerWeek: number;
}

// Debt Mediation (Médiation de dettes)
export interface DebtMediationContext {
  debtor: Person;
  totalDebt: number;
  creditors: Creditor[];
  mediator?: string;
  repaymentPlan?: RepaymentPlan;
}

export interface Creditor {
  name: string;
  amountOwed: number;
  type: 'banque' | 'loyer' | 'énergie' | 'autre';
}

export interface RepaymentPlan {
  monthlyPayment: number;
  duration: number;
  startDate: Date;
  endDate: Date;
}

// Energy Budget (Budget énergétique)
export interface EnergyBudgetContext {
  person: Person;
  household: Person[];
  energySupplier: string;
  monthlyPayment: number;
  arrears: number;
  paymentPlanActive: boolean;
}

// Claims Fund (Fonds de créances)
export interface ClaimsFundContext {
  claimant: Person;
  claimType: 'aliments' | 'loyer' | 'autre';
  claimAmount: number;
  debtor: Person;
  paymentStatus: 'pending' | 'approved' | 'rejected';
}

// Legal Protection (Protection juridique)
export interface LegalProtectionContext {
  person: Person;
  protectionType: 'minorité prolongée' | 'administration provisoire';
  administrator?: Person;
  courtDecision: Document;
}

// Social Support (Accompagnement social)
export interface SocialSupportContext {
  person: Person;
  socialWorker: string;
  supportPlan: SupportPlan;
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
}

export interface SupportPlan {
  objectives: string[];
  actions: string[];
  startDate: Date;
  reviewDate: Date;
}

// Professional Integration (Insertion professionnelle)
export interface ProfessionalIntegrationContext {
  person: Person;
  education: string;
  experience: WorkExperience[];
  targetJob?: string;
  integrationPlan?: IntegrationPlan;
}

export interface WorkExperience {
  employer: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

export interface IntegrationPlan {
  training: string[];
  internships: string[];
  jobSearchSupport: boolean;
  duration: number;
}

// Professional Training (Formation professionnelle)
export interface ProfessionalTrainingContext {
  trainee: Person;
  trainingType: string;
  trainingProvider: string;
  startDate: Date;
  endDate: Date;
  certification?: string;
}

// Public Employment Service (Service public emploi)
export interface PublicEmploymentContext {
  jobSeeker: Person;
  registrationDate: Date;
  isActivelyLooking: boolean;
  jobOffers: JobOffer[];
  appointments: Appointment[];
}

export interface JobOffer {
  employer: string;
  position: string;
  contract: string;
  salary: number;
  postedDate: Date;
}

export interface Appointment {
  date: Date;
  type: 'entretien' | 'formation' | 'contrôle';
  counselor: string;
}

// Mobility Assistance (Aide à la mobilité)
export interface MobilityAssistanceContext {
  person: Person;
  mobilityNeed: string;
  assistanceType: 'transport adapté' | 'carte parking' | 'allocation';
  medicalCertificate?: Document;
}

// Mental Health Care (Soins de santé mentale)
export interface MentalHealthCareContext {
  patient: Person;
  referral: string;
  treatmentType: 'ambulatoire' | 'hospitalisation' | 'suivi';
  therapist?: string;
  startDate: Date;
}

// Homeless Assistance (Aide aux sans-abri)
export interface HomelessAssistanceContext {
  person: Person;
  shelterType: 'urgence' | 'transit' | 'insertion';
  admissionDate: Date;
  socialWorker: string;
  reinsertionPlan?: ReinsertionPlan;
}

export interface ReinsertionPlan {
  housingGoal: string;
  employmentGoal: string;
  healthGoal: string;
  timeline: string;
}

// Reception Center (Centre d'accueil)
export interface ReceptionCenterContext {
  person: Person;
  arrivalDate: Date;
  status: 'demandeur-asile' | 'réfugié' | 'sans-papiers';
  centerName: string;
  assignedRoom?: string;
}

// Family Mediation (Service de médiation familiale)
export interface FamilyMediationContext {
  party1: Person;
  party2: Person;
  conflictType: 'divorce' | 'garde' | 'aliments' | 'autre';
  mediator: string;
  sessions: MediationSession[];
}

export interface MediationSession {
  date: Date;
  duration: number;
  agreements: string[];
  nextSession?: Date;
}

// Victim Assistance (Aide aux victimes)
export interface VictimAssistanceContext {
  victim: Person;
  crimeType: string;
  reportDate: Date;
  policeReport: Document;
  supportType: 'psychologique' | 'juridique' | 'financier';
}

// Child Protection (Protection de l'enfance)
export interface ChildProtectionContext {
  child: Child;
  parents: Person[];
  protectionReason: string;
  measures: ProtectionMeasure[];
  socialWorker: string;
}

export interface ProtectionMeasure {
  type: 'suivi' | 'placement' | 'aide-éducative';
  startDate: Date;
  endDate?: Date;
  description: string;
}

// Tele-assistance (Télé-assistance)
export interface TeleAssistanceContext {
  person: Person;
  age: number;
  livesAlone: boolean;
  deviceInstalled: boolean;
  emergencyContacts: Person[];
}

// Home Help (Aide ménagère)
export interface HomeHelpContext {
  person: Person;
  age: number;
  autonomyLevel: 'autonome' | 'semi-dépendant' | 'dépendant';
  hoursPerWeek: number;
  helper?: string;
}

// Meal Delivery Service (Service de repas à domicile)
export interface MealDeliveryContext {
  person: Person;
  age: number;
  dietaryRestrictions: string[];
  deliveryFrequency: 'daily' | 'weekly';
  mealProvider: string;
}

// ============================================================================
// EMPLOYMENT & LABOR RIGHTS TYPES (Droits du travail)
// ============================================================================

// Employment Contract (Contrat de travail)
export interface EmploymentContractContext {
  employee: Person;
  employer: EmployerInfo;
  contractType: 'CDI' | 'CDD' | 'intérim' | 'étudiant';
  startDate: Date;
  endDate?: Date;
  salary: number;
  workingHours: number;
  signed: boolean;
}

export interface EmployerInfo {
  name: string;
  companyNumber: string;
  address: Address;
  sector: string;
}

// Notice Period (Préavis)
export interface NoticePeriodContext {
  employee: Person;
  employer: EmployerInfo;
  startDate: Date;
  seniority: number;
  noticePeriod: number; // in weeks
  initiatedBy: 'employee' | 'employer';
  severancePay?: number;
}

// Dismissal (Licenciement)
export interface DismissalContext {
  employee: Person;
  employer: EmployerInfo;
  dismissalType: 'faute-grave' | 'économique' | 'autre';
  dismissalDate: Date;
  noticePeriod?: number;
  severancePay?: number;
  reason: string;
}

// Resignation (Démission)
export interface ResignationContext {
  employee: Person;
  employer: EmployerInfo;
  resignationDate: Date;
  noticePeriod: number;
  reason?: string;
}

// Time Credit (Crédit-temps)
export interface TimeCreditContext {
  employee: Person;
  employer: EmployerInfo;
  creditType: 'fin-carrière' | 'soins' | 'formation';
  reduction: '1/5' | '1/2' | 'complet';
  startDate: Date;
  endDate: Date;
  approved: boolean;
}

// Sick Leave (Congé maladie)
export interface SickLeaveContext {
  employee: Person;
  employer: EmployerInfo;
  startDate: Date;
  endDate?: Date;
  medicalCertificate: Document;
  isPaidByEmployer: boolean;
  mutuellePayment?: number;
}

// Work Accident (Accident de travail)
export interface WorkAccidentContext {
  employee: Person;
  employer: EmployerInfo;
  accidentDate: Date;
  accidentLocation: string;
  injuries: string[];
  medicalReport: Document;
  workDaysLost: number;
  compensation?: number;
}

// Occupational Disease (Maladie professionnelle)
export interface OccupationalDiseaseContext {
  employee: Person;
  employer: EmployerInfo;
  disease: string;
  diagnosisDate: Date;
  exposurePeriod: string;
  recognized: boolean;
  compensation?: number;
}

// Workplace Harassment (Harcèlement au travail)
export interface WorkplaceHarassmentContext {
  victim: Person;
  employer: EmployerInfo;
  harassmentType: 'moral' | 'sexuel' | 'discrimination';
  incidentDates: Date[];
  complaintFiled: boolean;
  internalAdvisor?: string;
}

// Employment Discrimination (Discrimination emploi)
export interface EmploymentDiscriminationContext {
  person: Person;
  employer: EmployerInfo;
  discriminationType: 'âge' | 'genre' | 'origine' | 'handicap' | 'autre';
  incidentDate: Date;
  complaintFiled: boolean;
}

// Wage Equality (Égalité salariale)
export interface WageEqualityContext {
  employee: Person;
  employer: EmployerInfo;
  position: string;
  salary: number;
  comparableSalary: number;
  genderGap?: number;
  complaintFiled: boolean;
}

// Student Work (Travail étudiant)
export interface StudentWorkContext {
  student: Person;
  employer: EmployerInfo;
  contractType: 'étudiant';
  hoursWorked: number;
  remainingHours: number;
  socialContributionsReduced: boolean;
}

// Internship (Stage)
export interface InternshipContext {
  intern: Person;
  employer: EmployerInfo;
  school: School;
  internshipType: 'obligatoire' | 'optionnel';
  startDate: Date;
  endDate: Date;
  stipend?: number;
}

// Flexi-job
export interface FlexiJobContext {
  employee: Person;
  employer: EmployerInfo;
  sector: 'horeca' | 'commerce';
  hoursWorked: number;
  isPrimaryJob: boolean;
}

// Temporary Work (Travail intérimaire)
export interface TemporaryWorkContext {
  employee: Person;
  agency: string;
  employer: EmployerInfo;
  assignmentStartDate: Date;
  assignmentEndDate?: Date;
  reason: 'remplacement' | 'surcroît' | 'autre';
}

// Fixed-term Contract (Contrat à durée déterminée)
export interface FixedTermContext {
  employee: Person;
  employer: EmployerInfo;
  startDate: Date;
  endDate: Date;
  renewalCount: number;
  reason: string;
}

// Permanent Contract (Contrat à durée indéterminée)
export interface PermanentContractContext {
  employee: Person;
  employer: EmployerInfo;
  startDate: Date;
  probationPeriod?: number;
  salary: number;
  benefits: string[];
}

// Part-time Work (Temps partiel)
export interface PartTimeContext {
  employee: Person;
  employer: EmployerInfo;
  hoursPerWeek: number;
  schedule: WorkSchedule;
  hasMaintainedRights: boolean;
}

export interface WorkSchedule {
  monday?: number;
  tuesday?: number;
  wednesday?: number;
  thursday?: number;
  friday?: number;
  saturday?: number;
  sunday?: number;
}

// Flexible Schedule (Horaire flexible)
export interface FlexibleScheduleContext {
  employee: Person;
  employer: EmployerInfo;
  coreHours: string;
  flexibleHours: string;
  agreement: Document;
}

// Telework (Télétravail)
export interface TeleworkContext {
  employee: Person;
  employer: EmployerInfo;
  daysPerWeek: number;
  equipment: string[];
  agreement: Document;
  active: boolean;
}

// Right to Strike (Droit de grève)
export interface StrikeContext {
  employee: Person;
  employer: EmployerInfo;
  union?: string;
  strikeDate: Date;
  reason: string;
  protected: boolean;
}

// Union Representation (Représentation syndicale)
export interface UnionRepresentationContext {
  employee: Person;
  employer: EmployerInfo;
  union: string;
  delegateRole?: string;
  protectedStatus: boolean;
}

// In-company Training (Formation en entreprise)
export interface InCompanyTrainingContext {
  employee: Person;
  employer: EmployerInfo;
  trainingType: string;
  duration: number;
  certification?: string;
  paidTime: boolean;
}

// Outplacement
export interface OutplacementContext {
  employee: Person;
  employer: EmployerInfo;
  dismissalDate: Date;
  outplacementProvider: string;
  duration: number;
  services: string[];
}

// Supplementary Pension (Pension complémentaire)
export interface SupplementaryPensionContext {
  employee: Person;
  employer: EmployerInfo;
  pensionType: 'groupe' | 'individuel';
  employerContribution: number;
  employeeContribution: number;
  totalCapital?: number;
}
