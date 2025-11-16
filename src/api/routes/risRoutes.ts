/**
 * RIS Application Routes
 */

import { FastifyInstance } from 'fastify';
import { authenticate, authorize } from '../../middleware/auth';
import * as risController from '../controllers/risController';

export default async function risRoutes(server: FastifyInstance) {
  /**
   * Check RIS eligibility
   */
  server.post<{ Body: any }>(
    '/check-eligibility',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['ris'],
        description: 'Check RIS eligibility without creating an application',
        security: [{ bearerAuth: [] }],
      },
    },
    risController.checkEligibility
  );

  /**
   * Create RIS application
   */
  server.post<{ Body: any }>(
    '/applications',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['ris'],
        description: 'Create a new RIS application',
        security: [{ bearerAuth: [] }],
      },
    },
    risController.createApplication
  );

  /**
   * Get my applications
   */
  server.get(
    '/applications',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['ris'],
        description: 'Get all applications for the current user',
        security: [{ bearerAuth: [] }],
      },
    },
    risController.getMyApplications
  );

  /**
   * Get application by ID
   */
  server.get<{ Params: { id: string } }>(
    '/applications/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['ris'],
        description: 'Get a specific RIS application by ID',
        security: [{ bearerAuth: [] }],
      },
    },
    risController.getApplicationById
  );

  /**
   * Update application
   */
  server.patch<{ Params: { id: string }; Body: any }>(
    '/applications/:id',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['ris'],
        description: 'Update a RIS application (with optimistic locking)',
        security: [{ bearerAuth: [] }],
      },
    },
    risController.updateApplication
  );

  /**
   * Batch eligibility check (CPAS workers only)
   */
  server.post<{ Body: any }>(
    '/batch-check',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['ris'],
        description: 'Batch eligibility check for multiple users (CPAS workers only)',
        security: [{ bearerAuth: [] }],
      },
    },
    risController.batchEligibilityCheck
  );
}
