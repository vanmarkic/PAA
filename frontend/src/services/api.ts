/**
 * API Client Service
 * Handles all communication with the PAA backend API
 */

import { Machine } from '../App';

// API configuration
// Use relative URL in development to leverage Vite's proxy, absolute URL in production
const API_BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000/api')
  : '/api';

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

/**
 * API Error class for better error handling
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Generic fetch wrapper with error handling and auth
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// ==================== Auth API ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Authentication service
 */
export const authAPI = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetchAPI<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token if login successful
    if (response.success && response.token) {
      authToken = response.token;
      localStorage.setItem('auth_token', response.token);
    }

    return response;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await fetchAPI<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store token if registration successful
    if (response.success && response.token) {
      authToken = response.token;
      localStorage.setItem('auth_token', response.token);
    }

    return response;
  },

  /**
   * Logout user
   */
  logout() {
    authToken = null;
    localStorage.removeItem('auth_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return authToken !== null;
  },

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return authToken;
  }
};

// ==================== Workflow API ====================

export interface WorkflowResponse {
  success: boolean;
  workflows: Machine[];
  categories: Array<{
    id: string;
    name: string;
    count: number;
    color: string;
  }>;
}

export interface WorkflowDetailResponse {
  success: boolean;
  workflow: Machine & {
    detailedStates?: Array<{
      name: string;
      description?: string;
      transitions: Array<{
        event: string;
        target?: string;
        guard?: string;
      }>;
    }>;
  };
}

export interface SearchWorkflowsParams {
  q?: string;
  category?: string;
  complexity?: 'Simple' | 'Medium' | 'Complex';
}

/**
 * Workflow service
 */
export const workflowAPI = {
  /**
   * Get all workflows
   */
  async getAll(): Promise<WorkflowResponse> {
    return fetchAPI<WorkflowResponse>('/workflows');
  },

  /**
   * Get workflow by ID
   */
  async getById(id: string): Promise<WorkflowDetailResponse> {
    return fetchAPI<WorkflowDetailResponse>(`/workflows/${id}`);
  },

  /**
   * Search workflows
   */
  async search(params: SearchWorkflowsParams): Promise<WorkflowResponse> {
    const queryString = new URLSearchParams(params as any).toString();
    return fetchAPI<WorkflowResponse>(`/workflows/search?${queryString}`);
  },

  /**
   * Get workflow categories
   */
  async getCategories(): Promise<{ success: boolean; categories: Array<any> }> {
    return fetchAPI<{ success: boolean; categories: Array<any> }>('/workflows/categories/all');
  },

  /**
   * Check eligibility for a workflow (requires auth)
   */
  async checkEligibility(workflowId: string, data: any): Promise<any> {
    if (!authAPI.isAuthenticated()) {
      throw new APIError('Authentication required', 401);
    }

    return fetchAPI<any>(`/workflows/${workflowId}/check-eligibility`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

// ==================== RIS API ====================

export interface RISEligibilityRequest {
  age: number;
  category: string;
  residencyStatus: string;
  monthlyIncome: number;
  householdIncome?: number;
  patrimonyValue: number;
  isFullTimeStudent: boolean;
  childrenInCharge: number;
}

export interface RISApplication {
  id: string;
  userId: string;
  status: string;
  eligibilityResult: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * RIS service
 */
export const risAPI = {
  /**
   * Check RIS eligibility
   */
  async checkEligibility(data: RISEligibilityRequest): Promise<any> {
    if (!authAPI.isAuthenticated()) {
      throw new APIError('Authentication required', 401);
    }

    return fetchAPI<any>('/ris/check-eligibility', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Create RIS application
   */
  async createApplication(data: RISEligibilityRequest): Promise<any> {
    if (!authAPI.isAuthenticated()) {
      throw new APIError('Authentication required', 401);
    }

    return fetchAPI<any>('/ris/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get user's RIS applications
   */
  async getMyApplications(): Promise<{ success: boolean; applications: RISApplication[] }> {
    if (!authAPI.isAuthenticated()) {
      throw new APIError('Authentication required', 401);
    }

    return fetchAPI<{ success: boolean; applications: RISApplication[] }>('/ris/applications');
  },

  /**
   * Get RIS application by ID
   */
  async getApplicationById(id: string): Promise<{ success: boolean; application: RISApplication }> {
    if (!authAPI.isAuthenticated()) {
      throw new APIError('Authentication required', 401);
    }

    return fetchAPI<{ success: boolean; application: RISApplication }>(`/ris/applications/${id}`);
  },

  /**
   * Update RIS application
   */
  async updateApplication(id: string, data: any): Promise<any> {
    if (!authAPI.isAuthenticated()) {
      throw new APIError('Authentication required', 401);
    }

    return fetchAPI<any>(`/ris/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Batch eligibility check (for CPAS workers)
   */
  async batchCheck(users: any[]): Promise<any> {
    if (!authAPI.isAuthenticated()) {
      throw new APIError('Authentication required', 401);
    }

    return fetchAPI<any>('/ris/batch-check', {
      method: 'POST',
      body: JSON.stringify({ users }),
    });
  }
};

// ==================== Health Check ====================

/**
 * Check API health status
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    // For health check, we need to go to the root, not the API base
    const healthUrl = import.meta.env.PROD
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/health`
      : '/api/health';
    const response = await fetch(healthUrl);
    return response.ok;
  } catch {
    return false;
  }
}

// Export main API object for convenience
const api = {
  auth: authAPI,
  workflows: workflowAPI,
  ris: risAPI,
  checkHealth: checkAPIHealth,
};

export default api;