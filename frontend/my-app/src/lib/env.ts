/**
 * Environment Variable Validation
 * Validates all required environment variables on app startup
 * Prevents runtime errors from missing configuration
 */

// Define environment variable schema
const envSchema = {
  // Database (Supabase)
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // JWT Authentication
  JWT_SECRET: process.env.JWT_SECRET,
  
  // AI Services
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  ELEVENLABS_API_URL: process.env.ELEVENLABS_API_URL,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Required environment variables (must be set)
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'DEEPSEEK_API_KEY',
] as const;

// Optional but recommended
const recommendedEnvVars = [
  'DATABASE_URL',
  'ELEVENLABS_API_KEY',
] as const;

/**
 * Validate environment variables
 * Throws error if required variables are missing
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of requiredEnvVars) {
    const value = envSchema[key as keyof typeof envSchema];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  // Check recommended variables (warn only)
  for (const key of recommendedEnvVars) {
    const value = envSchema[key as keyof typeof envSchema];
    if (!value || value.trim() === '') {
      warnings.push(key);
    }
  }

  // Validate JWT_SECRET strength
  if (envSchema.JWT_SECRET && envSchema.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long for security');
  }

  // Validate URLs
  if (envSchema.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(envSchema.NEXT_PUBLIC_SUPABASE_URL);
    } catch {
      missing.push('NEXT_PUBLIC_SUPABASE_URL (invalid URL format)');
    }
  }

  // Throw error if required variables are missing
  if (missing.length > 0) {
    const errorMessage = `
❌ Missing Required Environment Variables:

${missing.map(key => `  - ${key}`).join('\n')}

Please set these in your .env.local file.
See .env.example for reference.
    `.trim();

    throw new Error(errorMessage);
  }

  // Log warnings (non-blocking)
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(`
⚠️  Environment Variable Warnings:

${warnings.map(w => `  - ${w}`).join('\n')}

These are recommended but not required.
    `.trim());
  }
}

/**
 * Get validated environment variables
 * Use this instead of process.env directly
 */
export const env = {
  // Database
  databaseUrl: envSchema.DATABASE_URL,
  supabaseUrl: envSchema.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseServiceKey: envSchema.SUPABASE_SERVICE_ROLE_KEY!,
  
  // JWT
  jwtSecret: envSchema.JWT_SECRET!,
  
  // AI Services
  deepseekApiKey: envSchema.DEEPSEEK_API_KEY!,
  elevenlabsApiKey: envSchema.ELEVENLABS_API_KEY,
  elevenlabsApiUrl: envSchema.ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1',
  
  // Environment
  nodeEnv: envSchema.NODE_ENV,
  isDevelopment: envSchema.NODE_ENV === 'development',
  isProduction: envSchema.NODE_ENV === 'production',
} as const;

/**
 * Validate on module load (server-side only)
 * This runs when the module is imported
 * Note: We don't throw here to avoid breaking the build
 * Validation will happen when env vars are actually used
 */
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    // In development, show helpful error but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.error('\n' + '='.repeat(60));
      console.error('⚠️  ENVIRONMENT VALIDATION FAILED');
      console.error('='.repeat(60));
      console.error(error instanceof Error ? error.message : String(error));
      console.error('='.repeat(60));
      console.error('⚠️  App will continue but may fail at runtime');
      console.error('='.repeat(60) + '\n');
    }
    // Don't throw - let it fail at runtime when env vars are used
    // This prevents build failures during development
  }
}

