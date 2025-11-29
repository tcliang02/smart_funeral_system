/**
 * Test database connection and check if tables exist
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Parse DATABASE_URL to show connection details (without password)
    let connectionInfo: any = {};
    if (process.env.DATABASE_URL) {
      try {
        const dbUrl = process.env.DATABASE_URL.replace(/^postgres:\/\//, 'postgresql://');
        const url = new URL(dbUrl);
        connectionInfo = {
          host: url.hostname,
          port: url.port || '5432',
          user: url.username,
          database: url.pathname.slice(1),
          hasPassword: !!url.password,
          protocol: url.protocol
        };
      } catch (e) {
        connectionInfo = { error: 'Failed to parse DATABASE_URL' };
      }
    } else {
      connectionInfo = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        hasPassword: !!process.env.DB_PASSWORD
      };
    }

    // Test 1: Simple connection test
    const testQuery = await queryAll('SELECT NOW() as current_time');
    
    // Test 2: Check if users table exists
    const tablesQuery = await queryAll(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    // Test 3: Try to count users (if table exists)
    let userCount = null;
    try {
      const countQuery = await queryAll('SELECT COUNT(*) as count FROM users');
      userCount = countQuery[0]?.count || 0;
    } catch (err: any) {
      userCount = `Error: ${err.message}`;
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tests: {
        connection: testQuery[0],
        tables: tablesQuery,
        userCount: userCount,
      },
      connectionInfo: connectionInfo,
      environment: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDbHost: !!process.env.DB_HOST,
        nodeEnv: process.env.NODE_ENV
      }
    });

  } catch (error: any) {
    // Parse DATABASE_URL to show connection details (without password)
    let connectionInfo: any = {};
    if (process.env.DATABASE_URL) {
      try {
        const dbUrl = process.env.DATABASE_URL.replace(/^postgres:\/\//, 'postgresql://');
        const url = new URL(dbUrl);
        connectionInfo = {
          host: url.hostname,
          port: url.port || '5432',
          user: url.username,
          database: url.pathname.slice(1),
          hasPassword: !!url.password,
          protocol: url.protocol
        };
      } catch (e) {
        connectionInfo = { error: 'Failed to parse DATABASE_URL' };
      }
    } else {
      connectionInfo = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        hasPassword: !!process.env.DB_PASSWORD
      };
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Database test failed: ' + error.message,
        error: {
          message: error.message,
          code: error.code,
          name: error.name,
          detail: error.detail
        },
        connectionInfo: connectionInfo,
        environment: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasDbHost: !!process.env.DB_HOST,
          nodeEnv: process.env.NODE_ENV
        },
        suggestion: error.code === 'ENOTFOUND' 
          ? 'DNS resolution failed. Check if the hostname in DATABASE_URL is correct.'
          : error.code === 'ECONNREFUSED'
          ? 'Connection refused. Check if the database is running and accessible.'
          : 'Check your DATABASE_URL or DB_* environment variables.'
      },
      { status: 500 }
    );
  }
}

