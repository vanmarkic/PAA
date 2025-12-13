/**
 * Fastify API Server
 * Production-ready REST API with security, caching, and rate limiting
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { initializeDatabase, closeDatabase } from '../database/data-source';
import { closeCacheConnections } from '../cache/cacheService';
import { closeQueue } from '../queue/conversionQueue';

// Import routes
import risRoutes from './routes/risRoutes';
import authRoutes from './routes/authRoutes';
import workflowRoutes from './routes/workflowRoutes';
import eligibilityRoutes from './routes/eligibilityRoutes';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Create and configure Fastify server
 */
export async function createServer() {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
    trustProxy: true,
  });

  // Register plugins
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  await server.register(helmet, {
    contentSecurityPolicy: false, // Allow Swagger UI
  });

  await server.register(rateLimit, {
    max: 100, // Max requests per time window
    timeWindow: '1 minute',
    // Use in-memory cache for rate limiting (Redis can be added later if needed)
  });

  await server.register(jwt, {
    secret: JWT_SECRET,
  });

  // Swagger documentation
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'PAA API',
        description: 'Plateforme d\'Aide Administrative - API for eligibility checks and benefit management',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'ris', description: 'RIS (Revenu d\'Intégration Sociale) endpoints' },
        { name: 'agr', description: 'AGR (Allocation de Garantie de Revenus) endpoints' },
        { name: 'conversion', description: 'Legal text conversion endpoints' },
        { name: 'eligibility', description: 'Generic eligibility endpoints (all benefits)' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Health check
  server.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Register routes
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(risRoutes, { prefix: '/api/ris' });
  await server.register(workflowRoutes, { prefix: '/api/workflows' });
  await server.register(eligibilityRoutes, { prefix: '/api/eligibility' });

  // Error handler
  server.setErrorHandler((error, request, reply) => {
    server.log.error(error);

    reply.status(error.statusCode || 500).send({
      success: false,
      error: error.message || 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    });
  });

  return server;
}

/**
 * Start server
 */
export async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Create and start server
    const server = await createServer();

    await server.listen({ port: PORT, host: HOST });

    console.log(`
╔════════════════════════════════════════════════════════╗
║  PAA API Server                                        ║
║  Version: 1.0.0                                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║  --------------------------------------------------------║
║  🚀 Server running on: http://${HOST}:${PORT}         ║
║  📚 API Documentation: http://${HOST}:${PORT}/docs    ║
║  💚 Health check: http://${HOST}:${PORT}/health        ║
╚════════════════════════════════════════════════════════╝
    `);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      await server.close();
      await closeDatabase();
      await closeCacheConnections();
      await closeQueue();

      console.log('✅ Server stopped');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
