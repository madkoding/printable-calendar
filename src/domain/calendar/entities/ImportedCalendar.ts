export type ImportedCalendarSource = { type: 'file'; fileName: string } | { type: 'url'; url: string }

export interface ImportedCalendar {
  id: string
  name: string
  color: string
  enabled: boolean
  source: ImportedCalendarSource
  icsText: string
  importedAt: string
  hiddenTitles: string[]
}
