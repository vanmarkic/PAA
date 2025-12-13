/**
 * Generic Eligibility Routes
 */

import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth';
import { checkGenericEligibility } from '../controllers/eligibilityController';

export default async function eligibilityRoutes(server: FastifyInstance) {
  /**
   * Generic eligibility check for any supported benefit type.
   *
   * Example body for housing aid:
   * {
   *   "benefitType": "aide-logement",
   *   "facts": {
   *     "region": "brussels",
   *     "annualIncome": 20000,
   *     "monthlyRent": 750,
   *     "adults": 1,
   *     "children": 2,
   *     "singleParent": true,
   *     "onWaitingList": true,
   *     "waitingListMonths": 24,
   *     "priorityPoints": 6,
   *     "isOwner": false,
   *     "isRenting": true
   *   }
   * }
   */
  server.post<{ Body: any }>(
    '/check',
    {
      onRequest: [authenticate],
      schema: {
        tags: ['eligibility'],
        description: 'Generic eligibility check for any benefit type',
        security: [{ bearerAuth: [] }],
      },
    },
    checkGenericEligibility
  );
}
