import { describe, it, expect } from 'vitest'
import { IcsCalendarIndex, IcsParseError, getCalendarName } from '@/data/ical/IcsCalendarIndex'

const SAMPLE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//EN
X-WR-CALNAME:Team Calendar
BEGIN:VEVENT
UID:single-event@test
DTSTART:20260115T090000Z
DTEND:20260115T100000Z
SUMMARY:Single Meeting
END:VEVENT
BEGIN:VEVENT
UID:weekly-event@test
DTSTART:20260105T140000Z
DTEND:20260105T150000Z
RRULE:FREQ=WEEKLY;COUNT=10
EXDATE:20260119T140000Z
SUMMARY:Weekly Standup
END:VEVENT
END:VCALENDAR`

describe('IcsCalendarIndex', () => {
  it('parses a single VEVENT and includes it when within range', () => {
    const index = new IcsCalendarIndex(SAMPLE_ICS)
    const events = index.getEventsInRange(new Date(2026, 0, 1), new Date(2026, 1, 1))
    const single = events.find((e) => e.uid === 'single-event@test')
    expect(single).toBeTruthy()
    expect(single?.title).toBe('Single Meeting')
  })

  it('excludes events outside the requested range', () => {
    const index = new IcsCalendarIndex(SAMPLE_ICS)
    const events = index.getEventsInRange(new Date(2026, 2, 1), new Date(2026, 3, 1))
    expect(events.find((e) => e.uid === 'single-event@test')).toBeUndefined()
  })

  it('expands a weekly RRULE within the window and honors EXDATE', () => {
    const index = new IcsCalendarIndex(SAMPLE_ICS)
    const events = index.getEventsInRange(new Date(2026, 0, 1), new Date(2026, 1, 1))
    const weekly = events.filter((e) => e.uid.startsWith('weekly-event@test'))

    // Jan 5, 12, 26 (Jan 19 excluded via EXDATE)
    expect(weekly).toHaveLength(3)
    const days = weekly.map((e) => e.date.getUTCDate()).sort((a, b) => a - b)
    expect(days).toEqual([5, 12, 26])
  })

  it('stops expanding recurrence once past the range end', () => {
    const index = new IcsCalendarIndex(SAMPLE_ICS)
    const events = index.getEventsInRange(new Date(2026, 5, 1), new Date(2026, 6, 1))
    expect(events.filter((e) => e.uid.startsWith('weekly-event@test'))).toHaveLength(0)
  })

  it('reads the calendar name from X-WR-CALNAME', () => {
    expect(getCalendarName(SAMPLE_ICS)).toBe('Team Calendar')
  })

  it('returns undefined calendar name when absent or malformed', () => {
    expect(getCalendarName('not an ics file')).toBeUndefined()
  })

  it('throws IcsParseError on malformed ICS text', () => {
    expect(() => new IcsCalendarIndex('this is not valid ics data {{{')).toThrow(IcsParseError)
  })

  it('excludes recurring events when includeRecurring is false', () => {
    const index = new IcsCalendarIndex(SAMPLE_ICS)
    const events = index.getEventsInRange(new Date(2026, 0, 1), new Date(2026, 1, 1), { includeRecurring: false })
    expect(events.find((e) => e.uid === 'single-event@test')).toBeTruthy()
    expect(events.filter((e) => e.uid.startsWith('weekly-event@test'))).toHaveLength(0)
  })

  it('includes recurring events by default', () => {
    const index = new IcsCalendarIndex(SAMPLE_ICS)
    const events = index.getEventsInRange(new Date(2026, 0, 1), new Date(2026, 1, 1))
    expect(events.filter((e) => e.uid.startsWith('weekly-event@test')).length).toBeGreaterThan(0)
  })

  it('returns distinct, trimmed, non-empty event titles', () => {
    const index = new IcsCalendarIndex(SAMPLE_ICS)
    expect(index.getDistinctTitles()).toEqual(['Single Meeting', 'Weekly Standup'])
  })
})

const EXCEPTION_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//EN
BEGIN:VEVENT
UID:standup@test
DTSTART:20260105T140000Z
RRULE:FREQ=WEEKLY;COUNT=4
SUMMARY:Weekly Standup
END:VEVENT
BEGIN:VEVENT
UID:standup@test
RECURRENCE-ID:20260112T140000Z
DTSTART:20260112T160000Z
SUMMARY:Standup (moved)
END:VEVENT
BEGIN:VEVENT
UID:plain@test
DTSTART:20260108T090000Z
SUMMARY:Plain Meeting
END:VEVENT
END:VCALENDAR`

const ORPHAN_SERIES_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//EN
BEGIN:VEVENT
UID:busy@test
RECURRENCE-ID:20260107T100000Z
DTSTART:20260107T100000Z
SUMMARY:Busy
END:VEVENT
BEGIN:VEVENT
UID:busy@test
RECURRENCE-ID:20260108T100000Z
DTSTART:20260108T100000Z
SUMMARY:Busy
END:VEVENT
BEGIN:VEVENT
UID:plain@test
DTSTART:20260108T090000Z
SUMMARY:Plain Meeting
END:VEVENT
END:VCALENDAR`

describe('IcsCalendarIndex recurrence exceptions', () => {
  it('does not duplicate an occurrence overridden via RECURRENCE-ID', () => {
    const index = new IcsCalendarIndex(EXCEPTION_ICS)
    const events = index.getEventsInRange(new Date(2026, 0, 1), new Date(2026, 1, 1))
    const standups = events.filter((e) => e.uid.startsWith('standup@test'))

    expect(standups).toHaveLength(4)
    const moved = standups.filter((e) => e.title === 'Standup (moved)')
    expect(moved).toHaveLength(1)
    expect(moved[0].date.getUTCDate()).toBe(12)
    expect(moved[0].date.getUTCHours()).toBe(16)
  })

  it('hides RECURRENCE-ID overrides along with their series when includeRecurring is false', () => {
    const index = new IcsCalendarIndex(EXCEPTION_ICS)
    const events = index.getEventsInRange(new Date(2026, 0, 1), new Date(2026, 1, 1), { includeRecurring: false })
    expect(events.map((e) => e.title)).toEqual(['Plain Meeting'])
  })

  it('treats orphan RECURRENCE-ID occurrences (series without a master) as recurring', () => {
    const index = new IcsCalendarIndex(ORPHAN_SERIES_ICS)

    const withRecurring = index.getEventsInRange(new Date(2026, 0, 1), new Date(2026, 1, 1))
    expect(withRecurring.filter((e) => e.title === 'Busy')).toHaveLength(2)

    const withoutRecurring = index.getEventsInRange(new Date(2026, 0, 1), new Date(2026, 1, 1), { includeRecurring: false })
    expect(withoutRecurring.map((e) => e.title)).toEqual(['Plain Meeting'])
  })

  it('lists orphan series titles in getDistinctTitles', () => {
    const index = new IcsCalendarIndex(ORPHAN_SERIES_ICS)
    expect(index.getDistinctTitles().sort()).toEqual(['Busy', 'Plain Meeting'])
  })
})
