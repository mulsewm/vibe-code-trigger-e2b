'use client'

import { useState, useEffect } from 'react'

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  language: string
}

export function CodeEditor({ code, onChange, language }: CodeEditorProps) {
  return (
    <textarea
      value={code}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full font-mono text-sm p-4 border rounded bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
      placeholder="Enter your code here..."
      spellCheck={false}
    />
  )
}

