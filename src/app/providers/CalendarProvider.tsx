import { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode } from 'react'
import { DEFAULT_COUNTRY } from '@/config/countries'
import { DEFAULT_TEMPLATE } from '@/config/templates'
import type { Orientation } from '@/config/paperSizes'
import { DEFAULT_PAPER, DEFAULT_ORIENTATION } from '@/config/paperSizes'

export type PagesPerSheet = 1 | 2 | 4
export const PAGES_PER_SHEET_OPTIONS: PagesPerSheet[] = [1, 2, 4]

export interface MonthYear {
  month: number
  year: number
}

interface CalendarContextType {
  from: MonthYear
  to: MonthYear
  country: string
  template: string
  paperSize: string
  orientation: Orientation
  pagesPerSheet: PagesPerSheet
  showSantoral: boolean
  showNotes: boolean
  monthsInRange: MonthYear[]
  setFrom: (m: MonthYear) => void
  setTo: (m: MonthYear) => void
  setCountry: (c: string) => void
  setTemplate: (t: string) => void
  setPaperSize: (p: string) => void
  setOrientation: (o: Orientation) => void
  setPagesPerSheet: (n: PagesPerSheet) => void
  setShowSantoral: (v: boolean) => void
  setShowNotes: (v: boolean) => void
}

const CalendarContext = createContext<CalendarContextType | null>(null)

export const DEFAULT_PRINT_MARGIN_MM = 10

const today = new Date()
const defaultMonth = today.getMonth()
const defaultYear = today.getFullYear()

function buildMonthsInRange(from: MonthYear, to: MonthYear): MonthYear[] {
  const months: MonthYear[] = []
  const current = { month: from.month, year: from.year }
  while (current.year < to.year || (current.year === to.year && current.month <= to.month)) {
    months.push({ ...current })
    current.month++
    if (current.month > 11) {
      current.month = 0
      current.year++
    }
  }
  return months
}

const PRINT_STYLE_ID = 'calendar-print-style'

function applyPrintStyle(paperSize: string, orientation: Orientation) {
  if (typeof document === 'undefined') return
  let el = document.getElementById(PRINT_STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = PRINT_STYLE_ID
    document.head.appendChild(el)
  }
  const size = `${paperSize.toLowerCase()} ${orientation}`
  el.textContent = `@page { size: ${size}; margin: ${DEFAULT_PRINT_MARGIN_MM}mm; }`
}

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [from, setFromState] = useState<MonthYear>({ month: defaultMonth, year: defaultYear })
  const [to, setToState] = useState<MonthYear>({ month: defaultMonth, year: defaultYear })
  const [country, setCountry] = useState(DEFAULT_COUNTRY)
  const [template, setTemplateState] = useState(DEFAULT_TEMPLATE)
  const [paperSize, setPaperSize] = useState(DEFAULT_PAPER)
  const [orientation, setOrientation] = useState<Orientation>(DEFAULT_ORIENTATION)
  const [pagesPerSheet, setPagesPerSheet] = useState<PagesPerSheet>(1)
  const [showSantoral, setShowSantoral] = useState(false)
  const [showNotes, setShowNotes] = useState(true)

  const setFrom = useCallback((m: MonthYear) => {
    setFromState((prev) => {
      if (prev.month === m.month && prev.year === m.year) return prev
      return m
    })
  }, [])

  const setTo = useCallback((m: MonthYear) => {
    setToState((prev) => {
      if (prev.month === m.month && prev.year === m.year) return prev
      return m
    })
  }, [])

  const setTemplate = useCallback((t: string) => {
    setTemplateState((prev) => {
      if (prev === t) return prev
      if (t === 'yearly') {
        setFromState({ month: 0, year: from.year })
        setToState({ month: 11, year: from.year })
      } else if (prev === 'yearly') {
        const now = new Date()
        setFromState({ month: now.getMonth(), year: now.getFullYear() })
        setToState({ month: now.getMonth(), year: now.getFullYear() })
      }
      return t
    })
  }, [from.year])

  useEffect(() => {
    if (template === 'yearly' && (from.month !== 0 || to.month !== 11 || from.year !== to.year)) {
      setFromState({ month: 0, year: from.year })
      setToState({ month: 11, year: from.year })
    }
  }, [from.month, from.year, to.month, to.year, template])

  const monthsInRange = useMemo(() => buildMonthsInRange(from, to), [from, to])

  useEffect(() => {
    applyPrintStyle(paperSize, orientation)
  }, [paperSize, orientation])

  return (
    <CalendarContext.Provider
      value={{
        from, to, country, template, paperSize, orientation, pagesPerSheet, showSantoral, showNotes, monthsInRange,
        setFrom,
        setTo,
        setCountry,
        setTemplate,
        setPaperSize,
        setOrientation,
        setPagesPerSheet,
        setShowSantoral,
        setShowNotes,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar(): CalendarContextType {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendar must be used within CalendarProvider')
  return ctx
}
