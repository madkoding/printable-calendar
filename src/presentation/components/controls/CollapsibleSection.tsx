import { useState, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  summary?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({ title, summary, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
          {summary && <span className="text-xs text-gray-800 truncate">{summary}</span>}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}
