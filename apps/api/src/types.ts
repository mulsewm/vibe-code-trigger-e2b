/**
 * Shared Type Definitions
 */

export interface ExecutionRequest {
  code: string
  language: string
  projectContext?: {
    files?: Record<string, string>
    workingDirectory?: string
  }
  timeout?: number
}

export interface ExecutionResult {
  executionId: string
  sandboxId: string
  cmdId: string
  status: 'running' | 'completed' | 'error'
  exitCode?: number
  stdout?: string
  stderr?: string
  error?: string
}

