/**
 * Trigger.dev SDK client utilities
 */

import { TriggerClient } from '@trigger.dev/sdk'
import type { ExecutionRequest, ExecutionResult } from '@vibe-code/types'

export class VibeCodeClient {
  private client: TriggerClient

  constructor(apiKey: string, apiUrl?: string) {
    this.client = new TriggerClient({
      apiKey,
      apiUrl: apiUrl || 'https://api.trigger.dev',
    })
  }

  async executeCode(request: ExecutionRequest): Promise<{ executionId: string }> {
    const run = await this.client.sendEvent({
      name: 'execute.code',
      payload: request,
    })

    return {
      executionId: run.id,
    }
  }

  async getExecutionStatus(executionId: string): Promise<ExecutionResult> {
    const run = await this.client.runs.retrieve(executionId)
    
    return {
      executionId: run.id,
      sandboxId: run.output?.sandboxId || '',
      cmdId: run.output?.cmdId || '',
      status: run.status === 'COMPLETED' ? 'completed' : 
              run.status === 'FAILED' ? 'error' : 'running',
      exitCode: run.output?.exitCode,
      stdout: run.output?.stdout,
      stderr: run.output?.stderr,
      error: run.output?.error,
    }
  }
}

