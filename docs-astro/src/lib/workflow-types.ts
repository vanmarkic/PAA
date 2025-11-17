/**
 * Maps workflow IDs to their context types
 * This provides type information for each workflow's data model
 */

export const workflowContextTypes: Record<string, string[]> = {
  // Legal Conversion
  'legalConversion': [
    'LegalText',
    'ConversionLevel',
    'Target Audience',
    'Extracted Structure',
    'Mapped Terms',
    'Validation Errors'
  ],

  // RIS Application
  'risApplication': [
    'RISUser',
    'Eligibility Result',
    'PIIS Contract',
    'Compliance Issues',
    'Retry Count'
  ],

  // Telework
  'teletravail': [
    'Employee Info',
    'Employer Info',
    'Telework Type',
    'Work Schedule',
    'Equipment List',
    'Agreement Status'
  ],

  // School Registration
  'inscriptionEcole': [
    'Child Info',
    'Registration Documents',
    'School Choice',
    'Document Validation',
    'Place Availability'
  ],

  // Home Help
  'aideMenagere': [
    'Beneficiary Info',
    'Care Plan',
    'Assigned Helper',
    'Service Status',
    'Interventions Count'
  ],

  // Pension Savings Reduction
  'reductionEpargnePension': [
    'Saver Info',
    'Savings Reduction',
    'Payment Certificates',
    'Total Payments',
    'Fiscal Year'
  ],

  // Housing Bonus
  'bonusLogement': [
    'Borrower Info',
    'Mortgage Loan',
    'Housing Bonus',
    'Mortgage Documents',
    'Total Amount Received'
  ],

  // Health Insurance
  'assuranceMaladie': [
    'Insured Person',
    'DMG Status',
    'Reimbursements',
    'Maximum Invoice',
    'Increased Intervention'
  ],

  // Eco Vouchers
  'ecoCheque': [
    'Employer Info',
    'Employee List',
    'Transactions',
    'Total Allocated',
    'Total Used'
  ],

  // Default types for unknown workflows
  'default': [
    'User Data',
    'Application State',
    'Processing Status',
    'Validation Results'
  ]
};

/**
 * Get context types for a specific workflow
 * Falls back to default types if workflow is not found
 */
export function getWorkflowContextTypes(workflowId: string): string[] {
  return workflowContextTypes[workflowId] || workflowContextTypes.default;
}

/**
 * Get a readable description for workflow context
 */
export function getContextDescription(workflowId: string): string {
  const descriptions: Record<string, string> = {
    'legalConversion': 'Legal text transformation and simplification data',
    'risApplication': 'Social integration income application data',
    'teletravail': 'Telework agreement and configuration data',
    'inscriptionEcole': 'School enrollment and registration data',
    'aideMenagere': 'Home care service management data',
    'reductionEpargnePension': 'Pension savings tax reduction data',
    'bonusLogement': 'Housing loan bonus calculation data',
    'assuranceMaladie': 'Health insurance coverage and reimbursement data',
    'ecoCheque': 'Eco-voucher distribution and usage data',
    'default': 'Application and processing data'
  };

  return descriptions[workflowId] || descriptions.default;
}