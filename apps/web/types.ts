/**
 * Shared Type Definitions for Web App
 */

export interface Command {
  cmdId: string
  sandboxId: string
  command: string
  args: string[]
  background?: boolean
  startedAt: number
  exitCode?: number
  logs?: CommandLog[]
}

export interface CommandLog {
  data: string
  stream: 'stdout' | 'stderr'
  timestamp: number
}

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
