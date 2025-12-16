/**
 * Trigger.dev Workflow for Code Execution
 */

import { task } from '@trigger.dev/sdk/v3'
import { E2BExecutor } from '../services/e2bExecutor.js'
import appConfig from '../config.js'
import type { ExecutionRequest, ExecutionResult } from '@vibe-code/types'

export const executeCodeTask = task({
  id: 'execute-code',
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: ExecutionRequest, { ctx }) => {
    // Fail gracefully and return a structured result if the API key is missing,
    // instead of throwing and producing a confusing "no output" message.
    if (!appConfig.e2b.apiKey) {
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return {
        executionId,
        sandboxId: '',
        cmdId: '',
        status: 'error' as const,
        error: 'E2B_API_KEY environment variable is not set.',
      } satisfies ExecutionResult
    }

    const executor = new E2BExecutor()
    
    try {
      const result = await executor.executeCode(payload)
      return result
    } catch (error) {
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return {
        executionId,
        sandboxId: '',
        cmdId: '',
        status: 'error' as const,
        error: error instanceof Error ? error.message : String(error),
      } satisfies ExecutionResult
    }
  },
})

