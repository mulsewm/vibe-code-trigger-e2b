/**
 * API Server Entry Point
 */

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import appConfig from './config.js'
import './trigger.js' // Initialize Trigger.dev configuration
import executeRouter from './routes/execute.js'
import healthRouter from './routes/health.js'

const app = express()

// Middleware
if (appConfig.cors.enabled) {
  app.use(cors({
    origin: appConfig.cors.origin,
    credentials: true,
  }))
}
app.use(express.json())

// Health check routes (no prefix for easy monitoring)
app.use(healthRouter)

// API Routes
app.use(appConfig.server.apiPrefix, executeRouter)

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: appConfig.isDevelopment ? err.message : 'An error occurred',
  })
})

// Create HTTP server
const server = createServer(app)

// Start server with port conflict handling
const startServer = async (port: number, maxAttempts = 5): Promise<void> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        server.listen(port, appConfig.server.host, () => {
          const address = server.address()
          const host = typeof address === 'string' 
            ? address 
            : address?.address === '::' 
              ? 'localhost' 
              : address?.address || 'localhost'
          const actualPort = typeof address === 'object' ? address?.port : port
          console.log(`API server running on http://${host}:${actualPort}`)
          console.log(`Environment: ${appConfig.env}`)
          console.log(`API prefix: ${appConfig.server.apiPrefix}`)
          resolve()
        })
        
        server.on('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is in use, trying port ${port + 1}...`)
            reject(new Error(`PORT_IN_USE:${port + 1}`))
          } else {
            reject(err)
          }
        })
      })
      return // Success
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('PORT_IN_USE:')) {
        const newPort = parseInt(error.message.split(':')[1], 10)
        port = newPort
        continue
      }
      throw error
    }
  }
  throw new Error(`Failed to start server after ${maxAttempts} attempts`)
}

startServer(appConfig.server.port).catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

