/**
 * Shared types for Vibe Code application
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
  status: 'running' | 'completed' | 'error' | 'timeout'
  exitCode?: number
  stdout?: string
  stderr?: string
  error?: string
}

export interface SandboxStatus {
  sandboxId: string
  status: 'running' | 'stopped'
}

export interface FileOperation {
  path: string
  content?: string
  operation: 'read' | 'write' | 'delete' | 'list'
}

export interface SandboxFile {
  path: string
  content: string
  isDirectory: boolean
}

