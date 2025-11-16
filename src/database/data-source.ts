/**
 * TypeORM Data Source Configuration
 * PostgreSQL connection for production scalability
 */

import { DataSource } from 'typeorm';
import 'reflect-metadata';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'paa_user',
  password: process.env.DB_PASSWORD || 'paa_password',
  database: process.env.DB_NAME || 'paa_db',
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev only
  logging: process.env.NODE_ENV !== 'production',
  entities: ['src/database/entities/**/*.ts'],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: [],
  maxQueryExecutionTime: 1000, // Log slow queries > 1s
  extra: {
    max: 20, // Connection pool max size
    min: 5,  // Connection pool min size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Close database connection gracefully
 */
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('📊 Database connection closed');
  }
}
