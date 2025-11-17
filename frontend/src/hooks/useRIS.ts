/**
 * React hooks for RIS operations
 */

import { useState, useCallback, useEffect } from 'react';
import api, { APIError, RISEligibilityRequest, RISApplication } from '../services/api';

// ==================== Types ====================

export interface UseRISEligibilityResult {
  checkEligibility: (data: RISEligibilityRequest) => Promise<any>;
  result: any | null;
  loading: boolean;
  error: APIError | null;
  reset: () => void;
}

export interface UseRISApplicationsResult {
  applications: RISApplication[];
  loading: boolean;
  error: APIError | null;
  refetch: () => Promise<void>;
  createApplication: (data: RISEligibilityRequest) => Promise<any>;
}

export interface UseRISApplicationDetailResult {
  application: RISApplication | null;
  loading: boolean;
  error: APIError | null;
  refetch: () => Promise<void>;
  updateApplication: (data: any) => Promise<any>;
}

// ==================== Hooks ====================

/**
 * Hook to check RIS eligibility
 */
export function useRISEligibility(): UseRISEligibilityResult {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const checkEligibility = useCallback(async (data: RISEligibilityRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.ris.checkEligibility(data);
      setResult(response);
      return response;
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError('RIS eligibility check failed', 0);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    checkEligibility,
    result,
    loading,
    error,
    reset
  };
}

/**
 * Hook to manage RIS applications
 */
export function useRISApplications(): UseRISApplicationsResult {
  const [applications, setApplications] = useState<RISApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.ris.getMyApplications();
      if (response.success) {
        setApplications(response.applications);
      }
    } catch (err) {
      // Don't set error if user is not authenticated
      if (err instanceof APIError && err.statusCode === 401) {
        setApplications([]);
      } else {
        setError(err instanceof APIError ? err : new APIError('Failed to fetch RIS applications', 0));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createApplication = useCallback(async (data: RISEligibilityRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.ris.createApplication(data);
      // Refetch applications after creating a new one
      await fetchApplications();
      return response;
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError('Failed to create RIS application', 0);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [fetchApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    createApplication
  };
}

/**
 * Hook to get RIS application detail
 */
export function useRISApplicationDetail(id: string | null): UseRISApplicationDetailResult {
  const [application, setApplication] = useState<RISApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!id) {
      setApplication(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.ris.getApplicationById(id);
      if (response.success) {
        setApplication(response.application);
      }
    } catch (err) {
      setError(err instanceof APIError ? err : new APIError('Failed to fetch RIS application', 0));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateApplication = useCallback(async (data: any) => {
    if (!id) {
      throw new Error('No application ID provided');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.ris.updateApplication(id, data);
      // Refetch application after update
      await fetchApplication();
      return response;
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError('Failed to update RIS application', 0);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [id, fetchApplication]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return {
    application,
    loading,
    error,
    refetch: fetchApplication,
    updateApplication
  };
}

/**
 * Hook for batch RIS eligibility check (for CPAS workers)
 */
export function useRISBatchCheck() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const batchCheck = useCallback(async (users: any[]) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await api.ris.batchCheck(users);
      if (response.success) {
        setResults(response.results);
      }
      return response;
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError('Batch check failed', 0);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    batchCheck,
    results,
    loading,
    error,
    reset
  };
}