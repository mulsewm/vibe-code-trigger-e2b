/**
 * Application Configuration
 * Centralized configuration management with environment variable support
 */

import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Resolve paths relative to this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env from both the repo root and the api app directory.
// This makes local setup more forgiving: either location will work.
const rootEnvPath = resolve(__dirname, '../../../.env.local')
const apiEnvPath = resolve(__dirname, '../.env.local')

// Load root .env.local first, then api/.env.local can override if present
config({ path: rootEnvPath })
config({ path: apiEnvPath })

export const appConfig = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    apiPrefix: process.env.API_PREFIX || '/api',
  },

  // Trigger.dev Configuration
  trigger: {
    secretKey: process.env.TRIGGER_SECRET_KEY || process.env.TRIGGER_API_KEY || '',
    baseURL: process.env.TRIGGER_BASE_URL || process.env.TRIGGER_API_URL || 'https://api.trigger.dev',
  },

  // e2b Configuration
  e2b: {
    apiKey: process.env.E2B_API_KEY || '',
  },

  // Execution Configuration
  execution: {
    defaultTimeout: parseInt(process.env.EXECUTION_DEFAULT_TIMEOUT || '30000', 10), // 30 seconds
    maxTimeout: parseInt(process.env.EXECUTION_MAX_TIMEOUT || '300000', 10), // 5 minutes
    pollInterval: parseInt(process.env.EXECUTION_POLL_INTERVAL || '500', 10), // 500ms
  },

  // CORS Configuration
  cors: {
    enabled: process.env.CORS_ENABLED !== 'false',
    origin: process.env.CORS_ORIGIN || '*',
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const

// Validation
if (!appConfig.trigger.secretKey) {
  throw new Error('TRIGGER_SECRET_KEY or TRIGGER_API_KEY environment variable is required')
}
// console.log('E2B_API_KEY loaded?', !!process.env.E2B_API_KEY)

export default appConfig

