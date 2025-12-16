'use client'

import { useSandboxStore } from './state'
import { ScrollArea } from '@/components/ui/scroll-area'

export function Logs(props: { className?: string }) {
  const { commands } = useSandboxStore()

  return (
    <ScrollArea className={props.className}>
      <div className="p-4 space-y-2">
        {commands.length === 0 ? (
          <p className="text-muted-foreground">No output yet. Run some code to see results.</p>
        ) : (
          commands.map((cmd) => (
            <div key={cmd.cmdId} className="space-y-1">
              <div className="text-sm font-mono text-muted-foreground">
                $ {cmd.command} {cmd.args.join(' ')}
              </div>
              {cmd.logs?.map((log, idx) => (
                <div
                  key={idx}
                  className={`text-sm font-mono ${
                    log.stream === 'stderr' ? 'text-red-500' : 'text-foreground'
                  }`}
                >
                  {log.data}
                </div>
              ))}
              {cmd.exitCode !== undefined && (
                <div className="text-xs text-muted-foreground">
                  Exit code: {cmd.exitCode}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

