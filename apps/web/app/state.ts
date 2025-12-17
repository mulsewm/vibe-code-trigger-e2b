'use client'

import { create } from 'zustand'
import type { Command, CommandLog } from '../types'

interface SandboxStore {
  addLog: (data: { sandboxId: string; cmdId: string; log: CommandLog }) => void
  commands: Command[]
  executionId?: string
  sandboxId?: string
  setExecutionId: (id: string) => void
  setSandboxId: (id: string) => void
  setStatus: (status: 'running' | 'stopped') => void
  status?: 'running' | 'stopped'
  upsertCommand: (command: Omit<Command, 'startedAt'>) => void
}

export const useSandboxStore = create<SandboxStore>()((set) => ({
  addLog: (data) => {
    set((state) => {
      const idx = state.commands.findIndex((c) => c.cmdId === data.cmdId)
      if (idx === -1) {
        console.warn(`Command with ID ${data.cmdId} not found.`)
        return state
      }
      const updatedCmds = [...state.commands]
      updatedCmds[idx] = {
        ...updatedCmds[idx],
        logs: [...(updatedCmds[idx].logs ?? []), data.log],
      }
      return { commands: updatedCmds }
    })
  },
  commands: [],
  setExecutionId: (executionId) =>
    set(() => ({
      executionId,
      commands: [],
    })),
  setSandboxId: (sandboxId) =>
    set(() => ({
      sandboxId,
      status: 'running',
      commands: [],
    })),
  setStatus: (status) => set(() => ({ status })),
  upsertCommand: (cmd) => {
    set((state) => {
      const existingIdx = state.commands.findIndex((c) => c.cmdId === cmd.cmdId)
      const idx = existingIdx !== -1 ? existingIdx : state.commands.length
      const prev = state.commands[idx] ?? { startedAt: Date.now(), logs: [] }
      const cmds = [...state.commands]
      cmds[idx] = { ...prev, ...cmd }
      return { commands: cmds }
    })
  },
}))

