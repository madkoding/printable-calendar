import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ImportedCalendar } from '@/domain/calendar/entities/ImportedCalendar'
import { getCalendarName, IcsParseError } from '@/data/ical/IcsCalendarIndex'
import { nextCalendarColor } from '@/config/calendarColors'

interface AddCalendarOptions {
  name?: string
  color?: string
}

interface ImportedCalendarsContextType {
  calendars: ImportedCalendar[]
  showRecurringEvents: boolean
  setShowRecurringEvents: (value: boolean) => void
  addFromFile: (file: File, opts?: AddCalendarOptions) => Promise<void>
  addFromUrl: (url: string, opts?: AddCalendarOptions) => Promise<void>
  removeCalendar: (id: string) => void
  toggleCalendar: (id: string) => void
  renameCalendar: (id: string, name: string) => void
  recolorCalendar: (id: string, color: string) => void
  refreshCalendar: (id: string) => Promise<void>
  hideEventTitle: (calendarId: string, title: string) => void
  unhideEventTitle: (calendarId: string, title: string) => void
}

const ImportedCalendarsContext = createContext<ImportedCalendarsContextType | null>(null)

const STORAGE_KEY = 'pc:imported-calendars'
const SHOW_RECURRING_KEY = 'pc:show-recurring-events'

function readStoredCalendars(): ImportedCalendar[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((c) => ({ ...c, hiddenTitles: Array.isArray(c.hiddenTitles) ? c.hiddenTitles : [] }))
  } catch {
    return []
  }
}

function readShowRecurringEvents(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(SHOW_RECURRING_KEY) === 'true'
}

function validateIcsText(icsText: string): void {
  if (!icsText.includes('BEGIN:VCALENDAR')) {
    throw new IcsParseError('This file does not look like a valid iCalendar (.ics) file')
  }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read the selected file'))
    reader.readAsText(file)
  })
}

async function fetchIcsFromUrl(url: string): Promise<string> {
  let res: Response
  try {
    res = await fetch(`/api/ical-proxy?url=${encodeURIComponent(url)}`)
  } catch {
    throw new Error('Could not reach the calendar import service')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to fetch calendar (${res.status})`)
  }
  return res.text()
}

export function ImportedCalendarsProvider({ children }: { children: ReactNode }) {
  const [calendars, setCalendars] = useState<ImportedCalendar[]>(() => readStoredCalendars())
  const [showRecurringEvents, setShowRecurringEvents] = useState<boolean>(() => readShowRecurringEvents())

  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calendars))
  }, [calendars])

  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(SHOW_RECURRING_KEY, String(showRecurringEvents))
  }, [showRecurringEvents])

  const addCalendar = useCallback((icsText: string, source: ImportedCalendar['source'], opts?: AddCalendarOptions) => {
    validateIcsText(icsText)
    setCalendars((prev) => {
      const name = opts?.name ?? getCalendarName(icsText) ?? (source.type === 'file' ? source.fileName : new URL(source.url).hostname)
      const color = opts?.color ?? nextCalendarColor(prev.length)
      const next: ImportedCalendar = {
        id: crypto.randomUUID(),
        name,
        color,
        enabled: true,
        source,
        icsText,
        importedAt: new Date().toISOString(),
        hiddenTitles: [],
      }
      return [...prev, next]
    })
  }, [])

  const addFromFile = useCallback(async (file: File, opts?: AddCalendarOptions) => {
    const icsText = await readFileAsText(file)
    addCalendar(icsText, { type: 'file', fileName: file.name }, opts)
  }, [addCalendar])

  const addFromUrl = useCallback(async (url: string, opts?: AddCalendarOptions) => {
    const icsText = await fetchIcsFromUrl(url)
    addCalendar(icsText, { type: 'url', url }, opts)
  }, [addCalendar])

  const removeCalendar = useCallback((id: string) => {
    setCalendars((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const toggleCalendar = useCallback((id: string) => {
    setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)))
  }, [])

  const renameCalendar = useCallback((id: string, name: string) => {
    setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))
  }, [])

  const recolorCalendar = useCallback((id: string, color: string) => {
    setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)))
  }, [])

  const hideEventTitle = useCallback((calendarId: string, title: string) => {
    setCalendars((prev) =>
      prev.map((c) => (c.id === calendarId && !c.hiddenTitles.includes(title) ? { ...c, hiddenTitles: [...c.hiddenTitles, title] } : c)),
    )
  }, [])

  const unhideEventTitle = useCallback((calendarId: string, title: string) => {
    setCalendars((prev) =>
      prev.map((c) => (c.id === calendarId ? { ...c, hiddenTitles: c.hiddenTitles.filter((t) => t !== title) } : c)),
    )
  }, [])

  const refreshCalendar = useCallback(async (id: string) => {
    const calendar = calendars.find((c) => c.id === id)
    if (!calendar || calendar.source.type !== 'url') return
    const icsText = await fetchIcsFromUrl(calendar.source.url)
    validateIcsText(icsText)
    setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, icsText, importedAt: new Date().toISOString() } : c)))
  }, [calendars])

  const value = useMemo(
    () => ({
      calendars,
      showRecurringEvents,
      setShowRecurringEvents,
      addFromFile,
      addFromUrl,
      removeCalendar,
      toggleCalendar,
      renameCalendar,
      recolorCalendar,
      refreshCalendar,
      hideEventTitle,
      unhideEventTitle,
    }),
    [
      calendars,
      showRecurringEvents,
      addFromFile,
      addFromUrl,
      removeCalendar,
      toggleCalendar,
      renameCalendar,
      recolorCalendar,
      refreshCalendar,
      hideEventTitle,
      unhideEventTitle,
    ],
  )

  return <ImportedCalendarsContext.Provider value={value}>{children}</ImportedCalendarsContext.Provider>
}

export function useImportedCalendars(): ImportedCalendarsContextType {
  const ctx = useContext(ImportedCalendarsContext)
  if (!ctx) throw new Error('useImportedCalendars must be used within ImportedCalendarsProvider')
  return ctx
}
