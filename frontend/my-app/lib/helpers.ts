/**
 * Helper functions for Next.js API routes
 * Replaces PHP helpers.php
 */

import { queryOne, queryAll } from './db';

/**
 * Sanitize user input
 */
export function sanitize(data: string): string {
  return data.trim().replace(/[<>]/g, '');
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
  return await queryOne(
    'SELECT user_id, name as username, email, role FROM users WHERE user_id = $1',
    [userId]
  );
}

/**
 * Get provider by user ID
 */
export async function getProviderByUserId(userId: number) {
  return await queryOne(
    'SELECT * FROM service_provider WHERE user_id = $1',
    [userId]
  );
}

/**
 * Generate JWT token
 */
export function generateToken(userData: {
  user_id: number;
  name: string;
  email: string;
  role: string;
}, expiry: number = 86400): string {
  const header = JSON.stringify({ typ: 'JWT', alg: 'HS256' });
  
  const payload = JSON.stringify({
    ...userData,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiry
  });
  
  const base64UrlHeader = base64UrlEncode(header);
  const base64UrlPayload = base64UrlEncode(payload);
  
  // Get JWT secret from environment (validated on startup)
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Please check your .env.local file.');
  }
  
  if (secret.length < 32) {
    console.warn('⚠️  JWT_SECRET is less than 32 characters. Consider using a stronger secret for production.');
  }
  
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(base64UrlHeader + '.' + base64UrlPayload)
    .digest('base64');
  
  const base64UrlSignature = signature
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${base64UrlHeader}.${base64UrlPayload}.${base64UrlSignature}`;
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    
    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
    
    return payload;
  } catch (error) {
    return false;
  }
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf-8');
}

/**
 * Verify authentication from request headers
 */
export function verifyAuth(headers: Headers): any {
  const authHeader = headers.get('authorization') || headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return verifyToken(token);
}

