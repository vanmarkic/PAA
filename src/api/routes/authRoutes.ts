/**
 * Authentication Routes
 */

import { FastifyInstance } from 'fastify';
import { login, register } from '../../middleware/auth';

export default async function authRoutes(server: FastifyInstance) {
  /**
   * Login
   */
  server.post<{
    Body: {
      email: string;
      password: string;
    };
  }>(
    '/login',
    {
      schema: {
        tags: ['auth'],
        description: 'Login with email and password',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              token: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { email, password } = request.body;
        const result = await login(email, password);

        return reply.send({
          success: true,
          ...result,
        });
      } catch (error) {
        return reply.status(401).send({
          success: false,
          error: error instanceof Error ? error.message : 'Login failed',
        });
      }
    }
  );

  /**
   * Register
   */
  server.post<{
    Body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
  }>(
    '/register',
    {
      schema: {
        tags: ['auth'],
        description: 'Register a new user account',
        body: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            firstName: { type: 'string', minLength: 1 },
            lastName: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await register(request.body);

        return reply.status(201).send({
          success: true,
          ...result,
        });
      } catch (error) {
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Registration failed',
        });
      }
    }
  );
}
