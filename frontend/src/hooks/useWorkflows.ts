/**
 * React hooks for workflow data fetching
 */

import { useState, useEffect, useCallback } from 'react';
import api, { APIError } from '../services/api';
import { Machine } from '../App';

// ==================== Types ====================

export interface UseWorkflowsResult {
  workflows: Machine[];
  categories: Array<{
    id: string;
    name: string;
    count: number;
    color: string;
  }>;
  loading: boolean;
  error: APIError | null;
  refetch: () => Promise<void>;
}

export interface UseWorkflowDetailResult {
  workflow: (Machine & { detailedStates?: any[] }) | null;
  loading: boolean;
  error: APIError | null;
  refetch: () => Promise<void>;
}

export interface UseEligibilityCheckResult {
  checkEligibility: (data: any) => Promise<any>;
  result: any | null;
  loading: boolean;
  error: APIError | null;
  reset: () => void;
}

export interface UseSearchWorkflowsResult {
  workflows: Machine[];
  totalCount: number;
  loading: boolean;
  error: APIError | null;
  search: (params: { q?: string; category?: string; complexity?: string }) => Promise<void>;
}

// ==================== Hooks ====================

/**
 * Hook to fetch all workflows
 */
export function useWorkflows(): UseWorkflowsResult {
  const [workflows, setWorkflows] = useState<Machine[]>([]);
  const [categories, setCategories] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.workflows.getAll();
      if (response.success) {
        setWorkflows(response.workflows);
        setCategories(response.categories);
      }
    } catch (err) {
      setError(err instanceof APIError ? err : new APIError('Failed to fetch workflows', 0));
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    workflows,
    categories,
    loading,
    error,
    refetch: fetchWorkflows
  };
}

/**
 * Hook to fetch a specific workflow by ID
 */
export function useWorkflowDetail(id: string | null): UseWorkflowDetailResult {
  const [workflow, setWorkflow] = useState<(Machine & { detailedStates?: any[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const fetchWorkflow = useCallback(async () => {
    if (!id) {
      setWorkflow(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.workflows.getById(id);
      if (response.success) {
        setWorkflow(response.workflow);
      }
    } catch (err) {
      setError(err instanceof APIError ? err : new APIError('Failed to fetch workflow', 0));
      console.error(`Error fetching workflow ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  return {
    workflow,
    loading,
    error,
    refetch: fetchWorkflow
  };
}

/**
 * Hook to check eligibility for a workflow
 */
export function useEligibilityCheck(workflowId: string): UseEligibilityCheckResult {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const checkEligibility = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.workflows.checkEligibility(workflowId, data);
      setResult(response);
      return response;
    } catch (err) {
      const apiError = err instanceof APIError ? err : new APIError('Eligibility check failed', 0);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

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
 * Hook to search workflows
 */
export function useSearchWorkflows(): UseSearchWorkflowsResult {
  const [workflows, setWorkflows] = useState<Machine[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const search = useCallback(async (params: { q?: string; category?: string; complexity?: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.workflows.search(params);
      if (response.success) {
        setWorkflows(response.workflows);
        setTotalCount(response.workflows.length);
      }
    } catch (err) {
      setError(err instanceof APIError ? err : new APIError('Search failed', 0));
      console.error('Error searching workflows:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    workflows,
    totalCount,
    loading,
    error,
    search
  };
}

/**
 * Hook to fetch workflow categories
 */
export function useWorkflowCategories() {
  const [categories, setCategories] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.workflows.getCategories();
      if (response.success) {
        setCategories(response.categories);
      }
    } catch (err) {
      setError(err instanceof APIError ? err : new APIError('Failed to fetch categories', 0));
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}