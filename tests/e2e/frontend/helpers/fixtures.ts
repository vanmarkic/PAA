/**
 * Test Fixtures for E2E Frontend Tests
 *
 * Provides comprehensive mock data for testing:
 * - Machine/Workflow data
 * - User authentication data
 * - API responses
 * - Test constants and utilities
 */

import { Machine } from '../../../frontend/src/App';

// ==================== Types ====================

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'citizen' | 'social-worker' | 'developer' | 'admin';
}

export interface MockAuthToken {
  token: string;
  user: AuthUser;
}

export interface MockAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

// ==================== Test Constants ====================

export const TEST_CONSTANTS = {
  // API Configuration
  API_BASE_URL: 'http://localhost:3000/api',
  API_HEALTH_CHECK_URL: 'http://localhost:3000/health',

  // Timeouts
  DEFAULT_TIMEOUT: 5000,
  LONG_TIMEOUT: 15000,
  SHORT_TIMEOUT: 2000,

  // Test Data IDs
  VALID_WORKFLOW_IDS: [
    'revenuIntegrationSociale',
    'allocationGarantieRevenu',
    'tariffSocialEnergie'
  ] as const,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,

  // Test environment
  TEST_ENV: {
    nodeEnv: 'test',
    logLevel: 'error',
  }
};

// ==================== Mock Users ====================

export const MOCK_USERS = {
  // Citizen user applying for benefits
  citizen: {
    id: 'user-citizen-001',
    email: 'citizen@example.be',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'citizen' as const
  },

  // Social worker at CPAS
  socialWorker: {
    id: 'user-sw-001',
    email: 'assistant.social@cpas.be',
    firstName: 'Marie',
    lastName: 'Marchal',
    role: 'social-worker' as const
  },

  // Developer for testing admin features
  developer: {
    id: 'user-dev-001',
    email: 'dev@paa.local',
    firstName: 'Alex',
    lastName: 'Developer',
    role: 'developer' as const
  },

  // Admin user
  admin: {
    id: 'user-admin-001',
    email: 'admin@paa.local',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const
  }
};

// ==================== Mock Authentication ====================

export const MOCK_AUTH_TOKENS = {
  citizen: {
    token: 'mock_jwt_token_citizen_001_' + Buffer.from('citizen:secret').toString('base64'),
    user: MOCK_USERS.citizen
  },

  socialWorker: {
    token: 'mock_jwt_token_sw_001_' + Buffer.from('sw:secret').toString('base64'),
    user: MOCK_USERS.socialWorker
  },

  developer: {
    token: 'mock_jwt_token_dev_001_' + Buffer.from('dev:secret').toString('base64'),
    user: MOCK_USERS.developer
  },

  admin: {
    token: 'mock_jwt_token_admin_001_' + Buffer.from('admin:secret').toString('base64'),
    user: MOCK_USERS.admin
  },

  invalid: {
    token: 'invalid_token_does_not_exist_xyz123',
    user: null
  }
};

// ==================== Mock Workflows ====================

/**
 * RIS - Revenu d'Intégration Sociale (Social Integration Income)
 * Base légale: Loi du 26 mai 2002 concernant le droit à l'intégration sociale
 * Montants 2024: Isolé 1.070,49€ - Cohabitant 713,66€ - Famille monoparentale 1.450,52€
 */
export const MOCK_WORKFLOW_RIS: Machine = {
  id: 'revenuIntegrationSociale',
  name: 'Revenu d\'Intégration Sociale',
  category: 'Social Integration',
  description: 'Demande d\'aide sociale auprès du CPAS pour les personnes en situation de besoin',
  plainLanguage: 'Le Revenu d\'Intégration Sociale (RIS) est une aide financière destinée aux personnes en situation de précarité financière qui résident en Belgique. Elle est accordée après une enquête sociale effectuée par le CPAS (Centre Public d\'Action Sociale) de votre commune.',
  states: [
    'idle',
    'demande',
    'enquete',
    'validation',
    'octroi',
    'piis',
    'completed',
    'failed'
  ],
  events: [
    'SUBMIT_APPLICATION',
    'START_INVESTIGATION',
    'VALIDATE_ELIGIBILITY',
    'GRANT_RIS',
    'SIGN_PIIS',
    'COMPLETE',
    'REJECT'
  ],
  initialState: 'demande',
  complexity: 'Complex',
  stateCount: 8,
  eventCount: 7,
  legalReferences: [
    {
      type: 'loi',
      name: 'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=20020526&table_name=loi',
      articles: ['1', '2', '3', '4', '5']
    },
    {
      type: 'arrete_royal',
      name: 'Arrêté royal du 15 juillet 2004 d\'exécution de la loi du 26 mai 2002',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=20040715&table_name=loi',
      articles: ['10', '11', '12']
    }
  ],
  keywords: [
    'revenu',
    'intégration',
    'sociale',
    'cpas',
    'aide',
    'besoin',
    'belgique'
  ],
  lastModified: '2024-11-15T10:30:00Z',
  version: '2024.1.0',
  gherkinFile: 'features/benefits/ris.feature'
};

/**
 * AGR - Allocation de Garantie de Revenus (Income Guarantee Allowance)
 * Base légale: Arrêté royal du 25 novembre 1991 portant réglementation du chômage
 * Seuil 2025: 2.111,89€ brut mensuel
 */
export const MOCK_WORKFLOW_AGR: Machine = {
  id: 'allocationGarantieRevenu',
  name: 'Allocation de Garantie de Revenus',
  category: 'Employment Support',
  description: 'Allocation versée aux demandeurs d\'emploi en travail à temps partiel volontaire ou involontaire qui maintiennent leurs droits',
  plainLanguage: 'L\'AGR (Allocation de Garantie de Revenus) est une allocation mensuelle destinée aux personnes qui travaillent à temps partiel et qui gagnent moins que le revenu minimum garanti. Elle complète votre salaire pour atteindre un montant minimum défini par la loi.',
  states: [
    'idle',
    'eligibility-check',
    'verification',
    'calculation',
    'approval',
    'payment',
    'completed',
    'rejected'
  ],
  events: [
    'CHECK_ELIGIBILITY',
    'REQUEST_VERIFICATION',
    'CALCULATE_AMOUNT',
    'APPROVE',
    'PROCESS_PAYMENT',
    'COMPLETE',
    'DENY'
  ],
  initialState: 'eligibility-check',
  complexity: 'Medium',
  stateCount: 8,
  eventCount: 7,
  legalReferences: [
    {
      type: 'arrete_royal',
      name: 'Arrêté royal du 25 novembre 1991 portant réglementation du chômage',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550&table_name=loi',
      articles: ['28', '29', '33', '131bis']
    }
  ],
  keywords: [
    'allocation',
    'garantie',
    'revenus',
    'travail',
    'partiel',
    'onem',
    'salaire'
  ],
  lastModified: '2024-10-22T14:15:00Z',
  version: '2025.1.0',
  gherkinFile: 'features/benefits/income-guarantee.feature'
};

/**
 * Tarif Social Énergie - Energy Social Tariff
 * Support for household energy costs
 */
export const MOCK_WORKFLOW_ENERGY_TARIFF: Machine = {
  id: 'tariffSocialEnergie',
  name: 'Tarif Social Énergie',
  category: 'Housing & Energy',
  description: 'Accès à un tarif social pour l\'électricité et le gaz naturel pour les ménages en situation de précarité énergétique',
  plainLanguage: 'Le Tarif Social Énergie est un tarif réduit pour l\'électricité et le gaz destiné aux ménages qui ont des difficultés à payer leurs factures d\'énergie. Vous devez être client d\'un fournisseur d\'énergie agréé et remplir certaines conditions de revenus.',
  states: [
    'idle',
    'application',
    'income-verification',
    'energy-check',
    'approval',
    'activation',
    'completed',
    'denied'
  ],
  events: [
    'SUBMIT_REQUEST',
    'VERIFY_INCOME',
    'CHECK_ENERGY_PROVIDER',
    'APPROVE_TARIFF',
    'ACTIVATE_REDUCTION',
    'COMPLETE',
    'REJECT'
  ],
  initialState: 'application',
  complexity: 'Simple',
  stateCount: 8,
  eventCount: 7,
  legalReferences: [
    {
      type: 'decret',
      name: 'Décret du 28 avril 2004 relatif à l\'organisation du marché régional de l\'électricité',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=20040428&table_name=loi',
      articles: ['15', '16']
    }
  ],
  keywords: [
    'énergie',
    'tarif',
    'social',
    'électricité',
    'gaz',
    'précarité',
    'ménage'
  ],
  lastModified: '2024-11-10T09:45:00Z',
  version: '2024.2.0',
  gherkinFile: 'features/benefits/energy-tariff.feature'
};

/**
 * All mock workflows as an array
 */
export const MOCK_WORKFLOWS: Machine[] = [
  MOCK_WORKFLOW_RIS,
  MOCK_WORKFLOW_AGR,
  MOCK_WORKFLOW_ENERGY_TARIFF
];

// ==================== Mock API Responses ====================

/**
 * Mock response for /workflows endpoint (getAll)
 */
export const MOCK_WORKFLOWS_RESPONSE = {
  success: true,
  workflows: MOCK_WORKFLOWS,
  categories: [
    {
      id: 'social-integration',
      name: 'Social Integration',
      count: 3,
      color: '#3b82f6'
    },
    {
      id: 'employment',
      name: 'Employment Support',
      count: 2,
      color: '#10b981'
    },
    {
      id: 'housing-energy',
      name: 'Housing & Energy',
      count: 4,
      color: '#f59e0b'
    }
  ]
};

/**
 * Mock response for individual workflow detail endpoint
 */
export const MOCK_WORKFLOW_DETAIL_RIS = {
  success: true,
  workflow: {
    ...MOCK_WORKFLOW_RIS,
    detailedStates: [
      {
        name: 'demande',
        description: 'Demande RIS auprès du CPAS',
        transitions: [
          {
            event: 'SUBMIT_APPLICATION',
            target: 'enquete',
            guard: 'Formulaire complètement rempli'
          }
        ]
      },
      {
        name: 'enquete',
        description: 'Enquête sociale par assistant social CPAS',
        transitions: [
          {
            event: 'VALIDATE_ELIGIBILITY',
            target: 'validation',
            guard: 'Documents vérifiés'
          },
          {
            event: 'REJECT',
            target: 'failed',
            guard: 'Conditions non remplies'
          }
        ]
      },
      {
        name: 'validation',
        description: 'Vérification des conditions d\'éligibilité',
        transitions: [
          {
            event: 'GRANT_RIS',
            target: 'octroi',
            guard: 'Admissibilité confirmée'
          }
        ]
      },
      {
        name: 'octroi',
        description: 'Octroi du RIS au bénéficiaire',
        transitions: [
          {
            event: 'SIGN_PIIS',
            target: 'piis',
            guard: 'Décision d\'octroi signée'
          }
        ]
      },
      {
        name: 'piis',
        description: 'Signature du Projet Individualisé d\'Intégration Sociale',
        transitions: [
          {
            event: 'COMPLETE',
            target: 'completed',
            guard: 'PIIS signé par les deux parties'
          }
        ]
      },
      {
        name: 'completed',
        description: 'Demande complètement traitée',
        transitions: []
      },
      {
        name: 'failed',
        description: 'Demande refusée',
        transitions: []
      }
    ]
  }
};

/**
 * Mock response for RIS eligibility check
 */
export const MOCK_RIS_ELIGIBILITY_ELIGIBLE = {
  success: true,
  isEligible: true,
  category: 'isolé',
  monthlyAmount: 1070.49,
  reason: 'Tous les critères d\'éligibilité sont remplis',
  obligations: [
    'Participer à des activités d\'insertion professionnelle',
    'Informer le CPAS de tout changement de situation',
    'Accepter une offre d\'emploi appropriée'
  ],
  nextSteps: [
    'Signer le PIIS (Projet Individualisé d\'Intégration Sociale)',
    'Rencontrer votre assistant social',
    'Recevoir la première allocation'
  ]
};

/**
 * Mock response for RIS eligibility check - Ineligible
 */
export const MOCK_RIS_ELIGIBILITY_INELIGIBLE = {
  success: true,
  isEligible: false,
  reason: 'Patrimoine immobilier dépasse le plafond autorisé (15.000€)',
  obligations: [],
  nextSteps: [
    'Consulter votre CPAS pour discuter des options',
    'Revoir votre situation dans 6 mois'
  ]
};

/**
 * Mock response for AGR eligibility check - Eligible
 */
export const MOCK_AGR_ELIGIBILITY_ELIGIBLE = {
  success: true,
  isEligible: true,
  monthlyAmount: 385.50,
  breakdown: {
    baseAmount: 2111.89,
    supplements: {
      familyBonus: 50.00
    },
    deductions: {
      partTimeWork: -1776.39
    },
    total: 385.50
  },
  reason: 'Revenu complété jusqu\'au seuil minimum garanti',
  nextSteps: [
    'Confirmer votre demande auprès de l\'ONEM',
    'Recevoir l\'allocation dans votre compte bancaire'
  ]
};

/**
 * Mock response for energy tariff eligibility - Eligible
 */
export const MOCK_ENERGY_TARIFF_ELIGIBLE = {
  success: true,
  isEligible: true,
  monthlyAmount: 45.00,
  category: 'electricity-gas',
  reason: 'Ménage conforme aux critères de précarité énergétique',
  breakdown: {
    electricityDiscount: 25.00,
    gasDiscount: 20.00
  },
  nextSteps: [
    'Contacter votre fournisseur d\'énergie',
    'Fournir la preuve d\'éligibilité',
    'La réduction sera appliquée à vos prochaines factures'
  ]
};

// ==================== Mock Error Responses ====================

export const MOCK_ERROR_RESPONSES = {
  // Authentication errors
  unauthorized: {
    success: false,
    error: 'Unauthorized: Missing or invalid authentication token',
    statusCode: 401
  },

  forbidden: {
    success: false,
    error: 'Forbidden: You do not have permission to access this resource',
    statusCode: 403
  },

  notFound: {
    success: false,
    error: 'Not Found: The requested workflow does not exist',
    statusCode: 404
  },

  serverError: {
    success: false,
    error: 'Internal Server Error: An unexpected error occurred',
    statusCode: 500
  },

  badRequest: {
    success: false,
    error: 'Bad Request: Invalid request parameters',
    statusCode: 400,
    details: {
      missingFields: ['age', 'residencyStatus']
    }
  },

  networkError: {
    success: false,
    error: 'Network Error: Unable to connect to the API server',
    statusCode: 0
  }
};

// ==================== Mock Eligibility Check Requests ====================

export const MOCK_RIS_ELIGIBILITY_REQUEST = {
  age: 35,
  category: 'isolé',
  residencyStatus: 'belgian-citizen',
  monthlyIncome: 200,
  householdIncome: 200,
  patrimonyValue: 5000,
  isFullTimeStudent: false,
  childrenInCharge: 0
};

export const MOCK_RIS_ELIGIBILITY_REQUEST_INELIGIBLE = {
  age: 35,
  category: 'isolé',
  residencyStatus: 'belgian-citizen',
  monthlyIncome: 200,
  householdIncome: 200,
  patrimonyValue: 20000, // Exceeds limit
  isFullTimeStudent: false,
  childrenInCharge: 0
};

export const MOCK_AGR_ELIGIBILITY_REQUEST = {
  employmentStatus: 'part-time',
  monthlySalaryGross: 1200,
  workingHoursPerWeek: 20,
  hasRightsMaintenance: true
};

export const MOCK_ENERGY_TARIFF_REQUEST = {
  monthlyHouseholdIncome: 1500,
  numberOfHouseholdMembers: 2,
  energyProvider: 'electrabel',
  hasHeatingSystem: true
};

// ==================== Mock User Scenarios ====================

export const MOCK_USER_SCENARIOS = {
  // Scenario 1: Unemployed person seeking RIS
  unemployedRIS: {
    user: {
      ...MOCK_USERS.citizen,
      id: 'user-scenario-ris-001',
      firstName: 'Marc',
      lastName: 'Lambert'
    },
    eligibilityData: MOCK_RIS_ELIGIBILITY_REQUEST,
    expectedOutcome: 'eligible'
  },

  // Scenario 2: Part-time worker seeking AGR
  partTimeWorkerAGR: {
    user: {
      ...MOCK_USERS.citizen,
      id: 'user-scenario-agr-001',
      firstName: 'Sophie',
      lastName: 'Martin'
    },
    eligibilityData: MOCK_AGR_ELIGIBILITY_REQUEST,
    expectedOutcome: 'eligible'
  },

  // Scenario 3: Low-income household seeking energy tariff
  lowIncomeEnergy: {
    user: {
      ...MOCK_USERS.citizen,
      id: 'user-scenario-energy-001',
      firstName: 'Pierre',
      lastName: 'Bernard'
    },
    eligibilityData: MOCK_ENERGY_TARIFF_REQUEST,
    expectedOutcome: 'eligible'
  }
};

// ==================== Mock Search & Filter Responses ====================

export const MOCK_SEARCH_RESPONSE_RIS = {
  success: true,
  workflows: [MOCK_WORKFLOW_RIS],
  categories: []
};

export const MOCK_SEARCH_RESPONSE_SOCIAL = {
  success: true,
  workflows: [MOCK_WORKFLOW_RIS],
  categories: [
    {
      id: 'social-integration',
      name: 'Social Integration',
      count: 1,
      color: '#3b82f6'
    }
  ]
};

export const MOCK_SEARCH_RESPONSE_COMPLEX = {
  success: true,
  workflows: [MOCK_WORKFLOW_RIS],
  categories: []
};

// ==================== Mock Login Responses ====================

export const MOCK_LOGIN_SUCCESS_CITIZEN = {
  success: true,
  token: MOCK_AUTH_TOKENS.citizen.token,
  user: MOCK_USERS.citizen
};

export const MOCK_LOGIN_SUCCESS_SOCIAL_WORKER = {
  success: true,
  token: MOCK_AUTH_TOKENS.socialWorker.token,
  user: MOCK_USERS.socialWorker
};

export const MOCK_LOGIN_FAILURE = {
  success: false,
  error: 'Invalid email or password',
  statusCode: 401
};

// ==================== Mock Registration Responses ====================

export const MOCK_REGISTER_SUCCESS = {
  success: true,
  token: MOCK_AUTH_TOKENS.citizen.token,
  user: {
    ...MOCK_USERS.citizen,
    id: 'user-new-citizen-001',
    email: 'newcitizen@example.be',
    firstName: 'Nouveau',
    lastName: 'Citoyen'
  }
};

export const MOCK_REGISTER_FAILURE_EXISTING_EMAIL = {
  success: false,
  error: 'Email already registered',
  statusCode: 400
};

// ==================== Utility Functions ====================

/**
 * Get a mock workflow by ID
 */
export function getMockWorkflowById(id: string): Machine | undefined {
  return MOCK_WORKFLOWS.find(w => w.id === id);
}

/**
 * Get a mock workflow by name
 */
export function getMockWorkflowByName(name: string): Machine | undefined {
  return MOCK_WORKFLOWS.find(w => w.name.toLowerCase().includes(name.toLowerCase()));
}

/**
 * Get workflows by category
 */
export function getMockWorkflowsByCategory(category: string): Machine[] {
  return MOCK_WORKFLOWS.filter(w => w.category === category);
}

/**
 * Get workflows by complexity level
 */
export function getMockWorkflowsByComplexity(
  complexity: 'Simple' | 'Medium' | 'Complex'
): Machine[] {
  return MOCK_WORKFLOWS.filter(w => w.complexity === complexity);
}

/**
 * Create a mock eligibility response based on criteria
 */
export function createMockEligibilityResponse(
  isEligible: boolean,
  monthlyAmount?: number,
  reason?: string
) {
  return {
    success: true,
    isEligible,
    monthlyAmount: isEligible ? monthlyAmount || 1000 : undefined,
    reason: reason || (isEligible ? 'Conditions remplies' : 'Conditions non remplies'),
    nextSteps: isEligible
      ? ['Confirmer votre demande', 'Recevoir l\'allocation']
      : ['Consulter votre CPAS', 'Revoir votre situation']
  };
}

/**
 * Create a mock workflow with custom properties
 */
export function createMockWorkflow(overrides: Partial<Machine>): Machine {
  const baseWorkflow = MOCK_WORKFLOW_RIS;
  return {
    ...baseWorkflow,
    ...overrides,
    id: overrides.id || `workflow-${Date.now()}`,
    name: overrides.name || baseWorkflow.name,
    category: overrides.category || baseWorkflow.category
  };
}

/**
 * Create a mock authentication token for testing
 */
export function createMockAuthToken(user: Partial<AuthUser> = {}): MockAuthToken {
  const fullUser: AuthUser = {
    id: user.id || `user-${Date.now()}`,
    email: user.email || 'test@example.be',
    firstName: user.firstName || 'Test',
    lastName: user.lastName || 'User',
    role: user.role || 'citizen'
  };

  return {
    token: `mock_token_${fullUser.id}_${Date.now()}`,
    user: fullUser
  };
}

/**
 * Create a mock API error response
 */
export function createMockAPIError(
  statusCode: number,
  message: string,
  details?: any
): MockAPIResponse<never> {
  return {
    success: false,
    error: message,
    statusCode,
    ...details
  };
}

// ==================== Mock Application Requests ====================

/**
 * Complete mock RIS application data
 */
export const MOCK_RIS_APPLICATION_DATA = {
  // Personal information
  firstName: 'Jean',
  lastName: 'Dupont',
  dateOfBirth: '1988-05-15',
  nationality: 'belgian',
  nationalRegisterNumber: '88051500123',

  // Contact information
  email: 'jean.dupont@example.be',
  phone: '+32 492 123 456',
  address: {
    street: 'Rue de la Paix',
    number: '42',
    postal: '1000',
    city: 'Bruxelles',
    region: 'bruxelles'
  },

  // Household situation
  householdComposition: 'single',
  numberOfChildren: 0,
  householdIncome: 200,

  // Financial situation
  monthlyIncome: 200,
  patrimonyMovable: 3000,
  patrimonyImmovable: 0,

  // Employment status
  employmentStatus: 'unemployed',
  isFullTimeStudent: false,

  // Residency
  residencyStatus: 'belgian-citizen',
  yearsInBelgium: 35
};

/**
 * Complete mock AGR application data
 */
export const MOCK_AGR_APPLICATION_DATA = {
  // Personal information
  firstName: 'Sophie',
  lastName: 'Martin',
  dateOfBirth: '1990-03-22',
  nationalRegisterNumber: '90032200456',

  // Employment information
  employmentStatus: 'part-time',
  employer: 'Carrefour Belgium',
  contractType: 'cdi',
  monthlySalaryGross: 1200,
  workingHoursPerWeek: 20,
  startDate: '2023-01-15',

  // Rights maintenance
  hasRightsMaintenance: true,
  rightMaintenanceStartDate: '2023-06-01',

  // Family situation
  maritalStatus: 'single',
  numberOfChildren: 1,
  childrenSupport: 150,

  // Banking information
  bankAccount: 'BE12 1234 5678 9012'
};

export default {
  // Constants
  TEST_CONSTANTS,

  // Users
  MOCK_USERS,
  MOCK_AUTH_TOKENS,

  // Workflows
  MOCK_WORKFLOW_RIS,
  MOCK_WORKFLOW_AGR,
  MOCK_WORKFLOW_ENERGY_TARIFF,
  MOCK_WORKFLOWS,

  // API Responses
  MOCK_WORKFLOWS_RESPONSE,
  MOCK_WORKFLOW_DETAIL_RIS,
  MOCK_RIS_ELIGIBILITY_ELIGIBLE,
  MOCK_RIS_ELIGIBILITY_INELIGIBLE,
  MOCK_AGR_ELIGIBILITY_ELIGIBLE,
  MOCK_ENERGY_TARIFF_ELIGIBLE,

  // Error Responses
  MOCK_ERROR_RESPONSES,

  // Eligibility Check Requests
  MOCK_RIS_ELIGIBILITY_REQUEST,
  MOCK_RIS_ELIGIBILITY_REQUEST_INELIGIBLE,
  MOCK_AGR_ELIGIBILITY_REQUEST,
  MOCK_ENERGY_TARIFF_REQUEST,

  // User Scenarios
  MOCK_USER_SCENARIOS,

  // Search Responses
  MOCK_SEARCH_RESPONSE_RIS,
  MOCK_SEARCH_RESPONSE_SOCIAL,
  MOCK_SEARCH_RESPONSE_COMPLEX,

  // Auth Responses
  MOCK_LOGIN_SUCCESS_CITIZEN,
  MOCK_LOGIN_SUCCESS_SOCIAL_WORKER,
  MOCK_LOGIN_FAILURE,
  MOCK_REGISTER_SUCCESS,
  MOCK_REGISTER_FAILURE_EXISTING_EMAIL,

  // Application Data
  MOCK_RIS_APPLICATION_DATA,
  MOCK_AGR_APPLICATION_DATA,

  // Utility Functions
  getMockWorkflowById,
  getMockWorkflowByName,
  getMockWorkflowsByCategory,
  getMockWorkflowsByComplexity,
  createMockEligibilityResponse,
  createMockWorkflow,
  createMockAuthToken,
  createMockAPIError
};
