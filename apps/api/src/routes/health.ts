/**
 * Health Check Routes
 * Provides detailed health status for monitoring and debugging
 */

import { Router } from 'express'
import appConfig from '../config.js'

const router = Router()

/**
 * Basic health check
 * Returns 200 if server is running
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: appConfig.env,
    uptime: process.uptime(),
  })
})

/**
 * Detailed health check
 * Checks all dependencies and services
 */
router.get('/health/detailed', async (req, res) => {
  const checks = {
    server: {
      status: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    },
    config: {
      status: 'ok',
      environment: appConfig.env,
      triggerConfigured: !!appConfig.trigger.secretKey,
      e2bConfigured: !!appConfig.e2b.apiKey,
      corsEnabled: appConfig.cors.enabled,
    },
    dependencies: {} as Record<string, { status: string; error?: string }>,
  }

  // Check Trigger.dev
  try {
    if (!appConfig.trigger.secretKey) {
      checks.dependencies.triggerDev = {
        status: 'error',
        error: 'TRIGGER_API_KEY not configured',
      }
    } else {
      checks.dependencies.triggerDev = {
        status: 'ok',
      }
    }
  } catch (error) {
    checks.dependencies.triggerDev = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }
  }

  // Check e2b
  try {
    if (!appConfig.e2b.apiKey) {
      checks.dependencies.e2b = {
        status: 'error',
        error: 'E2B_API_KEY not configured',
      }
    } else {
      checks.dependencies.e2b = {
        status: 'ok',
      }
    }
  } catch (error) {
    checks.dependencies.e2b = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }
  }

  // Determine overall status
  const hasErrors = Object.values(checks.dependencies).some((dep) => dep.status === 'error')
  const overallStatus = hasErrors ? 'degraded' : 'healthy'

  res.status(hasErrors ? 503 : 200).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
  })
})

/**
 * Readiness probe
 * For Kubernetes/container orchestration
 */
router.get('/health/ready', (req, res) => {
  const isReady =
    !!appConfig.trigger.secretKey &&
    !!appConfig.e2b.apiKey

  if (isReady) {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    })
  } else {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      missing: {
        triggerApiKey: !appConfig.trigger.secretKey,
        e2bApiKey: !appConfig.e2b.apiKey,
      },
    })
  }
})

/**
 * Liveness probe
 * For Kubernetes/container orchestration
 */
router.get('/health/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

/**
 * Version information
 */
router.get('/health/version', (req, res) => {
  res.json({
    version: '0.1.0',
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    environment: appConfig.env,
    timestamp: new Date().toISOString(),
  })
})

export default router

