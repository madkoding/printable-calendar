import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useImportedCalendars } from '@/app/providers/ImportedCalendarsProvider'
import type { ImportedCalendar } from '@/domain/calendar/entities/ImportedCalendar'
import { IcsCalendarIndex } from '@/data/ical/IcsCalendarIndex'
import { CollapsibleSection } from './CollapsibleSection'
import { Button } from '../ui/Button'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.5 9a8 8 0 0114.5-3.5M19.5 15a8 8 0 01-14.5 3.5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 13a1 1 0 001 1h6a1 1 0 001-1l1-13" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function RestoreIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M4.5 9a8 8 0 1014.5-3.5" />
    </svg>
  )
}

function CalendarRow({ calendar }: { calendar: ImportedCalendar }) {
  const { t } = useTranslation()
  const { toggleCalendar, recolorCalendar, removeCalendar, refreshCalendar, hideEventTitle, unhideEventTitle } = useImportedCalendars()
  const [expanded, setExpanded] = useState(false)

  const titles = useMemo(() => {
    if (!expanded) return []
    try {
      return new IcsCalendarIndex(calendar.icsText).getDistinctTitles()
    } catch {
      return []
    }
  }, [expanded, calendar.icsText])

  return (
    <div className="border border-gray-200 rounded-md bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <input
          type="color"
          value={calendar.color}
          onChange={(e) => recolorCalendar(calendar.id, e.target.value)}
          aria-label={t('importedCalendars.color')}
          className="w-4 h-4 shrink-0 rounded-full border border-gray-200 p-0 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 flex items-center gap-1 min-w-0 text-xs text-gray-800 text-left hover:text-gray-950"
          title={calendar.name}
        >
          <span className="truncate">{calendar.name}</span>
          <ChevronIcon open={expanded} />
        </button>
        {calendar.source.type === 'url' && (
          <button
            type="button"
            onClick={() => refreshCalendar(calendar.id)}
            title={t('importedCalendars.refresh')}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <RefreshIcon />
          </button>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={calendar.enabled}
          onClick={() => toggleCalendar(calendar.id)}
          className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent transition-colors ${calendar.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform ${calendar.enabled ? 'translate-x-3' : 'translate-x-0'}`} />
        </button>
        <button
          type="button"
          onClick={() => removeCalendar(calendar.id)}
          title={t('importedCalendars.remove')}
          className="text-gray-400 hover:text-red-600 shrink-0"
        >
          <TrashIcon />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 px-2 py-1.5 flex flex-col gap-0.5 bg-gray-50">
          {titles.length === 0 && <p className="text-[11px] text-gray-400">{t('importedCalendars.no_events')}</p>}
          {titles.map((title) => {
            const hidden = calendar.hiddenTitles.includes(title)
            return (
              <div key={title} className="group flex items-center justify-between gap-2 px-1 py-0.5 rounded hover:bg-gray-100">
                <span className={`text-[11px] truncate ${hidden ? 'line-through text-gray-300' : 'text-gray-600'}`}>{title}</span>
                <button
                  type="button"
                  onClick={() => (hidden ? unhideEventTitle(calendar.id, title) : hideEventTitle(calendar.id, title))}
                  title={hidden ? t('importedCalendars.restore_event') : t('importedCalendars.hide_event')}
                  aria-label={hidden ? t('importedCalendars.restore_event') : t('importedCalendars.hide_event')}
                  className="opacity-40 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-gray-400 hover:text-red-600 shrink-0 p-0.5"
                >
                  {hidden ? <RestoreIcon /> : <CloseIcon />}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ImportedCalendarsSection() {
  const { t } = useTranslation()
  const { calendars, showRecurringEvents, setShowRecurringEvents, addFromFile, addFromUrl } = useImportedCalendars()
  const [adding, setAdding] = useState(false)
  const [mode, setMode] = useState<'file' | 'url'>('file')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setAdding(false)
    setError(null)
    setUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFile = async (file: File) => {
    setError(null)
    setBusy(true)
    try {
      await addFromFile(file)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('importedCalendars.error_generic'))
    } finally {
      setBusy(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!url.trim()) return
    setError(null)
    setBusy(true)
    try {
      await addFromUrl(url.trim())
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('importedCalendars.error_generic'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <CollapsibleSection
      title={t('importedCalendars.title')}
      summary={calendars.length > 0 ? t('importedCalendars.count', { count: calendars.length }) : undefined}
    >
      <div className="flex flex-col gap-2">
        {calendars.length === 0 && !adding && (
          <p className="text-xs text-gray-400">{t('importedCalendars.empty')}</p>
        )}

        {calendars.length > 0 && (
          <label className="flex items-center justify-between px-2 py-1.5 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t('importedCalendars.show_recurring')}</span>
            <button
              type="button"
              role="switch"
              aria-checked={showRecurringEvents}
              onClick={() => setShowRecurringEvents(!showRecurringEvents)}
              className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent transition-colors ${showRecurringEvents ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform ${showRecurringEvents ? 'translate-x-3' : 'translate-x-0'}`} />
            </button>
          </label>
        )}

        {calendars.map((calendar) => (
          <CalendarRow key={calendar.id} calendar={calendar} />
        ))}

        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 text-left px-1 py-1"
          >
            + {t('importedCalendars.add')}
          </button>
        )}

        {adding && (
          <div className="flex flex-col gap-2 border border-gray-200 rounded-md p-2 bg-gray-50">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setMode('file')}
                className={`flex-1 text-[10px] font-semibold uppercase tracking-wider py-1 rounded transition-colors ${mode === 'file' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              >
                {t('importedCalendars.mode_file')}
              </button>
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`flex-1 text-[10px] font-semibold uppercase tracking-wider py-1 rounded transition-colors ${mode === 'url' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              >
                {t('importedCalendars.mode_url')}
              </button>
            </div>

            {mode === 'file' ? (
              <input
                ref={fileInputRef}
                type="file"
                accept=".ics,text/calendar"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
                className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600"
              />
            ) : (
              <div className="flex gap-1">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('importedCalendars.url_placeholder')}
                  disabled={busy}
                  className="flex-1 min-w-0 text-xs rounded-md border border-gray-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <Button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={busy || !url.trim()}
                  className="px-2 py-1 text-xs shrink-0"
                >
                  {t('importedCalendars.add_button')}
                </Button>
              </div>
            )}

            {error && <p className="text-[11px] text-red-600">{error}</p>}

            <button type="button" onClick={resetForm} className="text-[11px] text-gray-400 hover:text-gray-600 text-left">
              {t('importedCalendars.cancel')}
            </button>
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}
