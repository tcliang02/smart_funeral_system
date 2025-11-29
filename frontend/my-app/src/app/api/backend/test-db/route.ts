/**
 * Test database connection and check if tables exist
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
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
    } catch (err) {
      userCount = 'Table does not exist';
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tests: {
        connection: testQuery[0],
        tables: tablesQuery,
        userCount: userCount,
      },
      config: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
      }
    });

  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database test failed: ' + error.message,
        error: error.toString(),
        config: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          user: process.env.DB_USER,
          database: process.env.DB_NAME,
        }
      },
      { status: 500 }
    );
  }
}

