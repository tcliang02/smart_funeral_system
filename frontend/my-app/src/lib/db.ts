/**
 * Database connection for Supabase (PostgreSQL)
 * Used by Next.js API routes
 */

import { Pool } from 'pg';
import { logger } from './logger';

// Create connection pool
// Supabase requires SSL for all connections
// For connection pooler, use: aws-0-[region].pooler.supabase.com:6543
// For direct connection, use: [project-ref].supabase.co:5432

// Support connection string format from Supabase dashboard
let connectionConfig: any = {};

if (process.env.DATABASE_URL) {
    // If DATABASE_URL is provided, parse it
    // Handle both postgres:// and postgresql:// protocols
    try {
        const dbUrl = process.env.DATABASE_URL.replace(/^postgres:\/\//, 'postgresql://');
        const url = new URL(dbUrl);
        connectionConfig = {
            host: url.hostname,
            port: parseInt(url.port || '5432'),
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading /
        };
        logger.info('Using DATABASE_URL connection string', {
            host: connectionConfig.host,
            port: connectionConfig.port,
            database: connectionConfig.database,
            user: connectionConfig.user,
            hasPassword: !!connectionConfig.password
        });
    } catch (parseError: any) {
        logger.error('Failed to parse DATABASE_URL', {
            error: parseError.message,
            databaseUrl: process.env.DATABASE_URL ? '***REDACTED***' : 'NOT SET'
        });
        throw new Error(`Invalid DATABASE_URL format: ${parseError.message}`);
    }
} else {
    // Use individual environment variables
    // IMPORTANT: Supabase direct connection uses db.[project-ref].supabase.co
    const defaultHost = process.env.DB_HOST || 'localhost';
    connectionConfig = {
        host: defaultHost,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'postgres',
    };
    logger.info('Using individual DB_* environment variables');
    logger.debug('Connection config', {
        host: connectionConfig.host,
        port: connectionConfig.port,
        user: connectionConfig.user,
        database: connectionConfig.database,
        hasPassword: !!connectionConfig.password
    });
}

// Validate connection config before creating pool
if (!connectionConfig.host || !connectionConfig.user || !connectionConfig.database) {
    const missing = [];
    if (!connectionConfig.host) missing.push('host');
    if (!connectionConfig.user) missing.push('user');
    if (!connectionConfig.database) missing.push('database');
    
    logger.error('Database configuration incomplete', { 
        missing,
        hasPassword: !!connectionConfig.password,
        hasDatabaseUrl: !!process.env.DATABASE_URL
    });
    
    throw new Error(
        `Database configuration incomplete. Missing: ${missing.join(', ')}. ` +
        `Please set DATABASE_URL or DB_HOST, DB_USER, DB_NAME, DB_PASSWORD environment variables.`
    );
}

const pool = new Pool({
    ...connectionConfig,
    // Supabase requires SSL for all connections (dev and production)
    ssl: {
        rejectUnauthorized: false // Supabase uses self-signed certificates
    },
    max: 10, // Reduced pool size for Supabase
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000, // Increased to 20 seconds
    // Additional connection options
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
});

// Test connection
pool.on('connect', () => {
    logger.info('Database connected');
});

pool.on('error', (err) => {
    logger.error('Database connection error', err);
});

/**
 * Execute a query and return all results
 */
export async function query(text: string, params?: any[]) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error: any) {
        // Check for DNS/connection errors
        const isConnectionError = error.code === 'ENOTFOUND' || 
                                  error.code === 'ECONNREFUSED' ||
                                  error.code === 'ETIMEDOUT' ||
                                  error.message?.includes('getaddrinfo');
        
        if (isConnectionError) {
            logger.error('Database connection failed', {
                error: error.message,
                code: error.code,
                host: connectionConfig.host,
                port: connectionConfig.port,
                suggestion: 'Check DATABASE_URL hostname and network connectivity'
            });
        } else {
            logger.error('Query error', { 
                error: error.message, 
                code: error.code,
                detail: error.detail,
                hint: error.hint,
                stack: error.stack
            });
        }
        
        // Re-throw with more context
        const dbError = new Error(
            `Database query failed: ${error.message}${error.code ? ` (${error.code})` : ''}`
        );
        (dbError as any).originalError = error;
        throw dbError;
    }
}

/**
 * Execute a query and return single row
 */
export async function queryOne(text: string, params?: any[]) {
    const res = await query(text, params);
    return res.rows[0] || null;
}

/**
 * Execute a query and return all rows
 */
export async function queryAll(text: string, params?: any[]) {
    const res = await query(text, params);
    return res.rows;
}

export default pool;
