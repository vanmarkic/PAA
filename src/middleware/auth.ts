/**
 * Authentication & Authorization Middleware
 * JWT-based authentication with RBAC
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../database/data-source';
import { User, UserRole } from '../database/entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  permissions: {
    resource: string;
    actions: string[];
    scope: 'own' | 'organization' | 'all';
  }[];
}

export interface JWTPayload extends AuthenticatedUser {
  iat: number;
  exp: number;
}

/**
 * Generate JWT token for a user
 */
export function generateToken(user: User): string {
  const payload: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    permissions: user.permissions,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Fastify authentication hook
 * Extracts and verifies JWT from Authorization header
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyToken(token);

    // Attach user to request
    (request as any).user = payload;
  } catch (error) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
}

/**
 * Authorization check - verify user has required permissions
 */
export function authorize(
  requiredResource: string,
  requiredAction: string,
  requiredScope: 'own' | 'organization' | 'all' = 'own'
) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = (request as any).user as AuthenticatedUser;

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Admin has access to everything
    if (user.role === 'admin') {
      return;
    }

    // Check permissions
    const hasPermission = user.permissions.some((perm) => {
      const resourceMatch = perm.resource === requiredResource || perm.resource === '*';
      const actionMatch = perm.actions.includes(requiredAction) || perm.actions.includes('*');
      const scopeMatch = getScopeLevel(perm.scope) >= getScopeLevel(requiredScope);

      return resourceMatch && actionMatch && scopeMatch;
    });

    if (!hasPermission) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Missing permission: ${requiredAction} on ${requiredResource}`,
      });
    }
  };
}

/**
 * Get numeric scope level for comparison
 */
function getScopeLevel(scope: 'own' | 'organization' | 'all'): number {
  switch (scope) {
    case 'own':
      return 1;
    case 'organization':
      return 2;
    case 'all':
      return 3;
    default:
      return 0;
  }
}

/**
 * Check if user can access a specific resource
 */
export function canAccessResource(
  user: AuthenticatedUser,
  resourceOwnerId: string,
  resourceOrganizationId: string | null
): boolean {
  // Admin can access everything
  if (user.role === 'admin') {
    return true;
  }

  // Check if user owns the resource
  if (resourceOwnerId === user.id) {
    return true;
  }

  // Check if user is in the same organization and has organization scope
  if (
    user.organizationId &&
    resourceOrganizationId === user.organizationId &&
    user.permissions.some((p) => p.scope === 'organization' || p.scope === 'all')
  ) {
    return true;
  }

  return false;
}

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<{
  token: string;
  user: AuthenticatedUser;
}> {
  const userRepository = AppDataSource.getRepository(User);

  // Find user with password (normally excluded)
  const user = await userRepository
    .createQueryBuilder('user')
    .addSelect('user.passwordHash')
    .where('user.email = :email', { email })
    .andWhere('user.isActive = :isActive', { isActive: true })
    .getOne();

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await userRepository.save(user);

  // Generate token
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      permissions: user.permissions,
    },
  };
}

/**
 * Register new user (beneficiary)
 */
export async function register(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{
  token: string;
  user: AuthenticatedUser;
}> {
  const userRepository = AppDataSource.getRepository(User);

  // Check if user already exists
  const existing = await userRepository.findOne({
    where: { email: params.email },
  });

  if (existing) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(params.password);

  // Create user (beneficiary role by default)
  const user = userRepository.create({
    email: params.email,
    passwordHash,
    firstName: params.firstName,
    lastName: params.lastName,
    role: 'beneficiary',
    permissions: [
      {
        resource: 'ris-application',
        actions: ['create', 'read'],
        scope: 'own',
      },
      {
        resource: 'agr-check',
        actions: ['create', 'read'],
        scope: 'own',
      },
    ],
  });

  await userRepository.save(user);

  // Generate token
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      permissions: user.permissions,
    },
  };
}
