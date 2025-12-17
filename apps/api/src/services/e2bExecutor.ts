/**
 * e2b Sandbox Executor Service
 * Handles code execution in isolated e2b sandboxes
 */

import { Sandbox, CommandExitError } from '@e2b/sdk'
import appConfig from '../config.js'
import type { ExecutionRequest, ExecutionResult } from '@vibe-code/types'

export class E2BExecutor {
  private apiKey: string
  private defaultTimeout: number

  constructor(apiKey?: string) {
    this.apiKey = apiKey || appConfig.e2b.apiKey
    this.defaultTimeout = appConfig.execution.defaultTimeout
    
    if (!this.apiKey) {
      throw new Error('E2B_API_KEY is required')
    }
  }

  /**
   * Execute code in an e2b sandbox
   */
  async executeCode(request: ExecutionRequest): Promise<ExecutionResult> {
    const sandbox = await Sandbox.create('base', {
      apiKey: this.apiKey,
    })

    try {
      // Clamp timeout to max allowed
      const requestedTimeout = request.timeout || this.defaultTimeout
      const timeout = Math.min(requestedTimeout, appConfig.execution.maxTimeout)
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const cmdId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Prepare code with language-specific execution
      const codeToExecute = this.prepareCode(request.code, request.language)

      // Set up timeout
      const timeoutPromise = new Promise<ExecutionResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Execution timeout'))
        }, timeout)
      })

      // Execute code
      const executionPromise = (async (): Promise<ExecutionResult> => {
        try {
          // Write files if provided
          if (request.projectContext?.files) {
            for (const [path, content] of Object.entries(request.projectContext.files)) {
              await sandbox.files.write(path, content)
            }
          }

          // Change working directory if specified
          let command = codeToExecute
          if (request.projectContext?.workingDirectory) {
            command = `cd ${request.projectContext.workingDirectory} && ${codeToExecute}`
          }

          // Execute command using the v2 SDK Commands API
          const resultPromise = sandbox.commands.run(command, {
            timeoutMs: timeout,
          })

          // Apply our own timeout guard on top, just in case
          const result = await Promise.race([
            resultPromise,
            new Promise<import('@e2b/sdk').CommandResult>((_, reject) => {
              setTimeout(() => reject(new Error('Execution timeout')), timeout)
            }),
          ])

          return {
            executionId,
            sandboxId: sandbox.sandboxId,
            cmdId,
            status: result.exitCode === 0 ? 'completed' : 'error',
            exitCode: result.exitCode,
            stdout: result.stdout || '',
            stderr: result.stderr || '',
            error: result.exitCode !== 0 ? (result.error || result.stderr) : undefined,
          }
        } catch (error) {
          // Handle CommandExitError - the SDK throws this when a command exits with non-zero code
          // but it still contains stdout/stderr that we want to show to the user
          if (error instanceof CommandExitError) {
            return {
              executionId,
              sandboxId: sandbox.sandboxId,
              cmdId,
              status: 'error',
              exitCode: error.exitCode,
              stdout: error.stdout || '',
              stderr: error.stderr || '',
              error: error.error || error.stderr || `Command exited with code ${error.exitCode}`,
            }
          }
          
          // For other errors, return a generic error response
          return {
            executionId,
            sandboxId: sandbox.sandboxId,
            cmdId,
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
            stderr: error instanceof Error ? error.stack : String(error),
          }
        }
      })()

      const result = await Promise.race([executionPromise, timeoutPromise])
      return result
    } catch (error) {
      throw new Error(
        `Failed to execute code in e2b sandbox: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      // Be defensive about SDK versions: some expose close(), others kill().
      try {
        const anySandbox = sandbox as any
        if (typeof anySandbox.close === 'function') {
          await anySandbox.close()
        } else if (typeof anySandbox.kill === 'function') {
          await anySandbox.kill()
        }
      } catch {
        // Ignore cleanup errors – they shouldn't fail the overall execution.
      }
    }
  }

  /**
   * Stream code execution logs in real-time
   */
  async *streamExecution(
    request: ExecutionRequest
  ): AsyncGenerator<{ type: 'stdout' | 'stderr'; data: string; timestamp: number }> {
    const sandbox = await Sandbox.create('base', {
      apiKey: this.apiKey,
    })

    try {
      const codeToExecute = this.prepareCode(request.code, request.language)

      // Write files if provided
      if (request.projectContext?.files) {
        for (const [path, content] of Object.entries(request.projectContext.files)) {
          await sandbox.files.write(path, content)
        }
      }

      // Execute and stream results
      const process = await sandbox.process.start({
        cmd: ['bash', '-c', codeToExecute],
      })

      // Stream stdout
      for await (const chunk of process.stdout) {
        yield {
          type: 'stdout',
          data: chunk,
          timestamp: Date.now(),
        }
      }

      // Stream stderr
      for await (const chunk of process.stderr) {
        yield {
          type: 'stderr',
          data: chunk,
          timestamp: Date.now(),
        }
      }
    } finally {
      await sandbox.close()
    }
  }

  /**
   * Prepare code for execution based on language
   * Uses base64 encoding to safely handle multiline code with special characters
   */
  private prepareCode(code: string, language: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    
    // Encode code to base64 to safely handle newlines, quotes, and special characters
    const base64Code = Buffer.from(code).toString('base64')
    
    switch (language.toLowerCase()) {
      case 'python':
        const pyFile = `/tmp/code_${timestamp}_${random}.py`
        return `echo '${base64Code}' | base64 -d > ${pyFile} && python3 ${pyFile}; exitcode=$?; rm -f ${pyFile}; exit $exitcode`
      case 'javascript':
      case 'js':
        const jsFile = `/tmp/code_${timestamp}_${random}.js`
        return `echo '${base64Code}' | base64 -d > ${jsFile} && node ${jsFile}; exitcode=$?; rm -f ${jsFile}; exit $exitcode`
      case 'typescript':
      case 'ts':
        const tsFile = `/tmp/code_${timestamp}_${random}.ts`
        return `echo '${base64Code}' | base64 -d > ${tsFile} && npx tsx ${tsFile}; exitcode=$?; rm -f ${tsFile}; exit $exitcode`
      case 'bash':
      case 'shell':
        return code
      default:
        return code
    }
  }
}