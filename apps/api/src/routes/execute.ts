/**
 * API Routes for Code Execution
 */

import { Router } from 'express'
import { z } from 'zod'
import { tasks, runs } from '@trigger.dev/sdk/v3'
import { executeCodeTask } from '../triggers/executeCode.js'
import appConfig from '../config.js'
import type { ExecutionRequest } from '@vibe-code/types'

const router = Router()

const executionRequestSchema = z.object({
  code: z.string().min(1),
  language: z.string().min(1),
  projectContext: z
    .object({
      files: z.record(z.string()).optional(),
      workingDirectory: z.string().optional(),
    })
    .optional(),
  timeout: z.number().positive().optional(),
})

/**
 * POST /api/execute
 * Execute code via Trigger.dev workflow
 */
router.post('/execute', async (req, res) => {
  try {
    const body = executionRequestSchema.parse(req.body)
    
    // Trigger the workflow task using the task ID
    const run = await tasks.trigger<typeof executeCodeTask>('execute-code', body as ExecutionRequest)
    
    res.json({
      executionId: run.id,
      status: 'running',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      })
      return
    }

    console.error('Execution error:', error)
    res.status(500).json({
      error: 'Failed to execute code',
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * GET /api/execute/:executionId
 * Get execution status
 */
router.get('/execute/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params
    
    const run = await runs.retrieve(executionId)
    
    res.json({
      executionId: run.id,
      status: run.status === 'COMPLETED' ? 'completed' :
              run.status === 'FAILED' ? 'error' : 'running',
      output: run.output,
    })
  } catch (error) {
    console.error('Status check error:', error)
    res.status(500).json({
      error: 'Failed to get execution status',
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * GET /api/execute/:executionId/logs
 * Stream execution logs (Server-Sent Events)
 */
router.get('/execute/:executionId/logs', async (req, res) => {
  try {
    const { executionId } = req.params
    
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no') // Disable nginx buffering

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', executionId, timestamp: Date.now() })}\n\n`)

    let lastStatus: string | null = null
    let lastOutput: any = null
    let pollCount = 0
    const maxPolls = 600 // 5 minutes at 500ms intervals
    let isClosed = false

    // Send keep-alive messages every 30 seconds to prevent timeouts
    const keepAliveInterval = setInterval(() => {
      if (!isClosed) {
        try {
          res.write(`: keep-alive\n\n`)
        } catch (error) {
          // Connection might be closed, ignore
          isClosed = true
        }
      }
    }, 30000)

    // Poll for logs
    const pollInterval = setInterval(async () => {
      if (isClosed) {
        clearInterval(pollInterval)
        clearInterval(keepAliveInterval)
        return
      }

      try {
        pollCount++
        const run = await runs.retrieve(executionId)
        
        // Send status updates
        if (run.status !== lastStatus && !isClosed && !res.closed) {
          const status = run.status === 'COMPLETED' ? 'completed' : 
                        run.status === 'FAILED' ? 'error' : 'running'
          try {
            res.write(`data: ${JSON.stringify({ 
              type: 'status', 
              status,
              timestamp: Date.now() 
            })}\n\n`)
            lastStatus = run.status
            
            // Log status change for debugging
            if (appConfig.isDevelopment) {
              console.log(`Run ${executionId} status changed to: ${run.status}`)
            }
          } catch (error) {
            console.error('Error writing status update:', error)
            isClosed = true
            clearInterval(pollInterval)
            clearInterval(keepAliveInterval)
            return
          }
        }
        
        // Log output availability for debugging
        if (appConfig.isDevelopment && pollCount % 20 === 0) {
          console.log(`Poll ${pollCount}: Run ${executionId} status=${run.status}, hasOutput=${!!run.output}`)
        }

        // Send output updates
        // The task returns an ExecutionResult which becomes run.output
        // Output is only available when the task completes
        if (run.output) {
          const output = run.output as any
          const outputChanged = JSON.stringify(output) !== JSON.stringify(lastOutput)
          
          // Debug: log the output structure on first appearance
          if (appConfig.isDevelopment && !lastOutput) {
            console.log('Run output structure:', JSON.stringify(output, null, 2))
            console.log('Run status:', run.status)
          }
          
          if (outputChanged) {
            // Handle ExecutionResult structure from the task
            // Check if stdout exists and has changed
            const stdoutValue = output.stdout !== undefined ? String(output.stdout) : null
            const lastStdout = lastOutput?.stdout !== undefined ? String(lastOutput.stdout) : null
            
            if (stdoutValue !== null && stdoutValue !== lastStdout && !isClosed && !res.closed) {
              try {
                res.write(`data: ${JSON.stringify({ 
                  type: 'stdout', 
                  data: stdoutValue, 
                  timestamp: Date.now() 
                })}\n\n`)
              } catch (error) {
                console.error('Error writing stdout:', error)
                isClosed = true
                return
              }
            }
            
            // Check if stderr exists and has changed
            const stderrValue = output.stderr !== undefined ? String(output.stderr) : null
            const lastStderr = lastOutput?.stderr !== undefined ? String(lastOutput.stderr) : null
            
            if (stderrValue !== null && stderrValue !== lastStderr && !isClosed && !res.closed) {
              try {
                res.write(`data: ${JSON.stringify({ 
                  type: 'stderr', 
                  data: stderrValue, 
                  timestamp: Date.now() 
                })}\n\n`)
              } catch (error) {
                console.error('Error writing stderr:', error)
                isClosed = true
                return
              }
            }

            // Send exit code if available and changed
            if (output.exitCode !== undefined && output.exitCode !== lastOutput?.exitCode) {
              res.write(`data: ${JSON.stringify({ 
                type: 'exitCode', 
                exitCode: output.exitCode, 
                timestamp: Date.now() 
              })}\n\n`)
            }

            // Send error if available and changed
            if (output.error && String(output.error) !== String(lastOutput?.error || '')) {
              res.write(`data: ${JSON.stringify({ 
                type: 'stderr', 
                data: String(output.error), 
                timestamp: Date.now() 
              })}\n\n`)
            }

            lastOutput = output
          }
        } else if (appConfig.isDevelopment && run.status === 'COMPLETED') {
          // Debug: if task completed but no output, log it
          console.warn('Task completed but no output available:', executionId)
        }

        // Handle completion
        if (run.status === 'COMPLETED' || run.status === 'FAILED') {
          clearInterval(pollInterval)
          clearInterval(keepAliveInterval)
          isClosed = true
          
          // Debug: log everything about the completed run
          if (appConfig.isDevelopment) {
            console.log('=== Task Completed ===')
            console.log('Run ID:', executionId)
            console.log('Status:', run.status)
            console.log('Has output:', !!run.output)
            console.log('Output type:', typeof run.output)
            console.log('Full output:', JSON.stringify(run.output, null, 2))
            console.log('Last output sent:', JSON.stringify(lastOutput, null, 2))
          }
          
          // Send final output - try multiple ways to access it
          const output = run.output as any
          
          if (output) {
            // Handle ExecutionResult structure - send all output fields
            // Check stdout
            if (output.stdout !== undefined) {
              const stdoutValue = String(output.stdout)
              const lastStdout = lastOutput?.stdout !== undefined ? String(lastOutput.stdout) : null
              
              if (stdoutValue !== lastStdout && stdoutValue.length > 0) {
                if (appConfig.isDevelopment) {
                  console.log('Sending stdout:', stdoutValue.substring(0, 100))
                }
                res.write(`data: ${JSON.stringify({ type: 'stdout', data: stdoutValue, timestamp: Date.now() })}\n\n`)
              }
            }
            
            // Check stderr
            if (output.stderr !== undefined) {
              const stderrValue = String(output.stderr)
              const lastStderr = lastOutput?.stderr !== undefined ? String(lastOutput.stderr) : null
              
              if (stderrValue !== lastStderr && stderrValue.length > 0) {
                if (appConfig.isDevelopment) {
                  console.log('Sending stderr:', stderrValue.substring(0, 100))
                }
                res.write(`data: ${JSON.stringify({ type: 'stderr', data: stderrValue, timestamp: Date.now() })}\n\n`)
              }
            }
            
            // Check error field
            if (output.error) {
              const errorValue = String(output.error)
              const lastError = lastOutput?.error ? String(lastOutput.error) : null
              
              if (errorValue !== lastError) {
                if (appConfig.isDevelopment) {
                  console.log('Sending error:', errorValue.substring(0, 100))
                }
                res.write(`data: ${JSON.stringify({ type: 'stderr', data: errorValue, timestamp: Date.now() })}\n\n`)
              }
            }
            
            // Send exit code
            if (output.exitCode !== undefined) {
              if (appConfig.isDevelopment) {
                console.log('Sending exit code:', output.exitCode)
              }
              res.write(`data: ${JSON.stringify({ type: 'exitCode', exitCode: output.exitCode, timestamp: Date.now() })}\n\n`)
            }
          } else {
            console.warn('Task completed but no output object:', executionId, 'Status:', run.status)
            // Send a message that there's no output
            res.write(`data: ${JSON.stringify({ 
              type: 'stderr', 
              data: 'Task completed but no output was returned', 
              timestamp: Date.now() 
            })}\n\n`)
          }
          
          res.write(`data: ${JSON.stringify({ 
            type: 'done', 
            status: run.status === 'COMPLETED' ? 'completed' : 'error',
            timestamp: Date.now() 
          })}\n\n`)
          res.end()
        }
        
        // Timeout after max polls
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          clearInterval(keepAliveInterval)
          isClosed = true
          if (!res.closed) {
            res.write(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Polling timeout - task took too long to complete',
              timestamp: Date.now() 
            })}\n\n`)
            res.end()
          }
        }
      } catch (error) {
        if (isClosed) return
        
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('Error polling run status:', errorMessage)
        
        // Only send error and close if it's a fatal error, not a transient one
        if (errorMessage.includes('Not found') || errorMessage.includes('404')) {
          clearInterval(pollInterval)
          clearInterval(keepAliveInterval)
          if (!isClosed) {
            res.write(`data: ${JSON.stringify({ 
              type: 'error', 
              error: errorMessage,
              timestamp: Date.now() 
            })}\n\n`)
            res.end()
            isClosed = true
          }
        } else {
          // For transient errors, log but continue polling
          console.warn('Transient error, continuing to poll:', errorMessage)
        }
      }
    }, appConfig.execution.pollInterval) // Poll at configured interval

    req.on('close', () => {
      isClosed = true
      clearInterval(pollInterval)
      clearInterval(keepAliveInterval)
      if (!res.closed) {
        res.end()
      }
    })

    // Handle client disconnect
    res.on('close', () => {
      isClosed = true
      clearInterval(pollInterval)
      clearInterval(keepAliveInterval)
    })
  } catch (error) {
    console.error('Logs streaming error:', error)
    res.status(500).json({
      error: 'Failed to stream logs',
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

export default router

