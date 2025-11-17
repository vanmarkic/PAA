/**
 * Workflow Routes
 * Exposes state machine workflow information for the frontend
 */

import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import * as workflowController from '../controllers/workflowController';

export default async function workflowRoutes(server: FastifyInstance) {
  /**
   * Get all workflows
   */
  server.get(
    '/',
    {
      schema: {
        tags: ['workflows'],
        description: 'Get all available workflows with metadata',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              workflows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    category: { type: 'string' },
                    description: { type: 'string' },
                    plainLanguage: { type: 'string' },
                    states: { type: 'array', items: { type: 'string' } },
                    events: { type: 'array', items: { type: 'string' } },
                    initialState: { type: 'string' },
                    complexity: { type: 'string', enum: ['Simple', 'Medium', 'Complex'] },
                    stateCount: { type: 'number' },
                    eventCount: { type: 'number' },
                    legalReferences: { type: 'array' },
                    keywords: { type: 'array', items: { type: 'string' } },
                    lastModified: { type: 'string' },
                    version: { type: 'string' },
                    gherkinFile: { type: 'string' }
                  }
                }
              },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    count: { type: 'number' },
                    color: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    workflowController.getAllWorkflows
  );

  /**
   * Get workflow by ID
   */
  server.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['workflows'],
        description: 'Get a specific workflow by ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              workflow: { type: 'object' }
            }
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean', enum: [false] },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    workflowController.getWorkflowById
  );

  /**
   * Check eligibility for a specific workflow
   */
  server.post<{ Params: { id: string }; Body: any }>(
    '/:id/check-eligibility',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['workflows'],
        description: 'Check eligibility for a specific workflow',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        }
      }
    },
    workflowController.checkWorkflowEligibility
  );

  /**
   * Get workflow categories
   */
  server.get(
    '/categories/all',
    {
      schema: {
        tags: ['workflows'],
        description: 'Get all workflow categories',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    count: { type: 'number' },
                    color: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    workflowController.getCategories
  );

  /**
   * Search workflows
   */
  server.get<{ Querystring: { q?: string; category?: string; complexity?: string } }>(
    '/search',
    {
      schema: {
        tags: ['workflows'],
        description: 'Search workflows by keyword, category, or complexity',
        querystring: {
          type: 'object',
          properties: {
            q: { type: 'string', description: 'Search query' },
            category: { type: 'string', description: 'Filter by category' },
            complexity: { type: 'string', enum: ['Simple', 'Medium', 'Complex'], description: 'Filter by complexity' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              workflows: { type: 'array' },
              totalCount: { type: 'number' }
            }
          }
        }
      }
    },
    workflowController.searchWorkflows
  );
}