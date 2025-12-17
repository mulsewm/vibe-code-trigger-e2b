/**
 * Vercel Serverless Function Entry Point
 */

import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
config()

// Import routes
import executeRouter from '../dist/routes/execute.js'
import healthRouter from '../dist/routes/health.js'

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}))
app.use(express.json())

// Health check routes
app.use(healthRouter)

// API Routes
app.use('/api', executeRouter)

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  })
})

// Export for Vercel
export default app
