'use client'

import { useState } from 'react'
import { useSandboxStore } from './state'
import { CodeEditor } from './components/code-editor'
import { Logs } from './logs'
import { Button } from '@/components/ui/button'

export default function Page() {
  const [code, setCode] = useState('print("Hello, World!")')
  const [language, setLanguage] = useState('python')
  const [isExecuting, setIsExecuting] = useState(false)
  const { setExecutionId, upsertCommand } = useSandboxStore()

  const executeCode = async () => {
    setIsExecuting(true)
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to execute code')
      }

      const { executionId } = await response.json()
      setExecutionId(executionId)

      // Poll for status and stream logs
      const cmdId = `cmd_${Date.now()}`
      upsertCommand({
        cmdId,
        sandboxId: executionId,
        command: language,
        args: [],
        background: false,
      })

      // Stream logs
      const eventSource = new EventSource(`/api/execute/${executionId}/logs`)
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Event received:', data.type, data)
          
          // Handle different event types
          switch (data.type) {
            case 'connected':
              console.log('Connected to log stream for:', data.executionId)
              break
              
            case 'status':
              console.log('Status update:', data.status)
              // Update execution status if needed
              break
              
            case 'stdout':
            case 'stderr':
              console.log('Log data received:', data.type, 'length:', data.data?.length || 0)
              // Add log to the command
              upsertCommand({
                cmdId,
                sandboxId: executionId,
                command: language,
                args: [],
                background: false,
              })
              
              // Add the log entry
              if (data.data) {
                useSandboxStore.getState().addLog({
                  sandboxId: executionId,
                  cmdId,
                  log: {
                    stream: data.type === 'stderr' ? 'stderr' : 'stdout',
                    data: String(data.data),
                    timestamp: data.timestamp || Date.now(),
                  },
                })
              }
              break
              
            case 'exitCode':
              // Update command with exit code
              upsertCommand({
                cmdId,
                sandboxId: executionId,
                command: language,
                args: [],
                background: false,
                exitCode: data.exitCode,
              })
              break
              
            case 'done':
              console.log('Execution completed:', data.status)
              eventSource.close()
              setIsExecuting(false)
              break
              
            case 'error':
              console.error('Execution error:', data.error)
              useSandboxStore.getState().addLog({
                sandboxId: executionId,
                cmdId,
                log: {
                  stream: 'stderr',
                  data: `Error: ${data.error}`,
                  timestamp: data.timestamp || Date.now(),
                },
              })
              eventSource.close()
              setIsExecuting(false)
              break
          }
        } catch (error) {
          console.error('Error parsing event data:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error)
        eventSource.close()
        setIsExecuting(false)
      }
    } catch (error) {
      console.error('Execution error:', error)
      setIsExecuting(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-4 bg-background text-foreground">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Vibe Code</h1>
        <div className="flex gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="bash">Bash</option>
          </select>
          <Button onClick={executeCode} disabled={isExecuting}>
            {isExecuting ? 'Running...' : 'Run'}
          </Button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Code Editor</h2>
          <CodeEditor code={code} onChange={setCode} language={language} />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Output</h2>
          <Logs className="flex-1" />
        </div>
      </div>
    </div>
  )
}

