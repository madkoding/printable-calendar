import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { act, render } from '@testing-library/react'
import { ImportedCalendarsProvider, useImportedCalendars } from '@/app/providers/ImportedCalendarsProvider'

const STORAGE_KEY = 'pc:imported-calendars'
const SHOW_RECURRING_KEY = 'pc:show-recurring-events'

const VALID_ICS = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:1\nDTSTART:20260101T000000Z\nSUMMARY:Test\nEND:VEVENT\nEND:VCALENDAR'

let ctx: ReturnType<typeof useImportedCalendars> | null = null

function Probe() {
  ctx = useImportedCalendars()
  return null
}

function renderProvider() {
  return render(
    <ImportedCalendarsProvider>
      <Probe />
    </ImportedCalendarsProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  ctx = null
})

afterEach(() => {
  localStorage.clear()
})

describe('ImportedCalendarsProvider', () => {
  it('starts empty when localStorage has nothing', () => {
    renderProvider()
    expect(ctx?.calendars).toEqual([])
  })

  it('adds a calendar from a valid file and persists it to localStorage', async () => {
    renderProvider()
    const file = new File([VALID_ICS], 'team.ics', { type: 'text/calendar' })

    await act(async () => {
      await ctx?.addFromFile(file)
    })

    expect(ctx?.calendars).toHaveLength(1)
    expect(ctx?.calendars[0].source).toEqual({ type: 'file', fileName: 'team.ics' })
    expect(ctx?.calendars[0].enabled).toBe(true)

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].icsText).toBe(VALID_ICS)
  })

  it('rejects a file that is not a valid iCalendar', async () => {
    renderProvider()
    const file = new File(['not an ics file'], 'bad.ics', { type: 'text/calendar' })

    await expect(
      act(async () => {
        await ctx?.addFromFile(file)
      }),
    ).rejects.toThrow()

    expect(ctx?.calendars).toEqual([])
  })

  it('toggles a calendar on and off', async () => {
    renderProvider()
    const file = new File([VALID_ICS], 'team.ics', { type: 'text/calendar' })
    await act(async () => {
      await ctx?.addFromFile(file)
    })
    const id = ctx?.calendars[0].id as string

    act(() => {
      ctx?.toggleCalendar(id)
    })
    expect(ctx?.calendars[0].enabled).toBe(false)

    act(() => {
      ctx?.toggleCalendar(id)
    })
    expect(ctx?.calendars[0].enabled).toBe(true)
  })

  it('removes a calendar', async () => {
    renderProvider()
    const file = new File([VALID_ICS], 'team.ics', { type: 'text/calendar' })
    await act(async () => {
      await ctx?.addFromFile(file)
    })
    const id = ctx?.calendars[0].id as string

    act(() => {
      ctx?.removeCalendar(id)
    })
    expect(ctx?.calendars).toEqual([])
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([])
  })

  it('rehydrates calendars already in localStorage on mount', () => {
    const existing = [
      {
        id: 'abc',
        name: 'Existing',
        color: '#2563eb',
        enabled: true,
        source: { type: 'file', fileName: 'existing.ics' },
        icsText: VALID_ICS,
        importedAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

    renderProvider()

    expect(ctx?.calendars).toHaveLength(1)
    expect(ctx?.calendars[0].name).toBe('Existing')
  })

  it('defaults hiddenTitles to an empty array for calendars stored before that field existed', () => {
    const existing = [
      {
        id: 'abc',
        name: 'Existing',
        color: '#2563eb',
        enabled: true,
        source: { type: 'file', fileName: 'existing.ics' },
        icsText: VALID_ICS,
        importedAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

    renderProvider()

    expect(ctx?.calendars[0].hiddenTitles).toEqual([])
  })

  it('defaults showRecurringEvents to false and persists changes', () => {
    renderProvider()
    expect(ctx?.showRecurringEvents).toBe(false)

    act(() => {
      ctx?.setShowRecurringEvents(true)
    })
    expect(ctx?.showRecurringEvents).toBe(true)
    expect(localStorage.getItem(SHOW_RECURRING_KEY)).toBe('true')
  })

  it('hides and restores an event title for a specific calendar', async () => {
    renderProvider()
    const file = new File([VALID_ICS], 'team.ics', { type: 'text/calendar' })
    await act(async () => {
      await ctx?.addFromFile(file)
    })
    const id = ctx?.calendars[0].id as string
    expect(ctx?.calendars[0].hiddenTitles).toEqual([])

    act(() => {
      ctx?.hideEventTitle(id, 'Test')
    })
    expect(ctx?.calendars[0].hiddenTitles).toEqual(['Test'])

    act(() => {
      ctx?.hideEventTitle(id, 'Test')
    })
    expect(ctx?.calendars[0].hiddenTitles).toEqual(['Test'])

    act(() => {
      ctx?.unhideEventTitle(id, 'Test')
    })
    expect(ctx?.calendars[0].hiddenTitles).toEqual([])
  })
})
