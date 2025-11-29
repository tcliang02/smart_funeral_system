/**
 * Environment Validator
 * Import this in your API routes or app initialization
 * Validates environment variables on module load
 */

// This will run validation when imported
import '../lib/env';

// Re-export for convenience
export { env, validateEnv } from '../lib/env';

