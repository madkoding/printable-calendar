import ICAL from 'ical.js'
import type { ImportedEventOccurrence, ImportedEventsOptions, ImportedEventsSource } from '@/domain/calendar/entities/ImportedEvent'

const MAX_RECURRENCE_ITERATIONS = 10_000

export class IcsParseError extends Error {}

export function getCalendarName(icsText: string): string | undefined {
  try {
    const comp = new ICAL.Component(ICAL.parse(icsText))
    const name = comp.getFirstPropertyValue('x-wr-calname')
    return typeof name === 'string' && name ? name : undefined
  } catch {
    return undefined
  }
}

export class IcsCalendarIndex implements ImportedEventsSource {
  // VEVENTs without a RECURRENCE-ID: plain single events or recurrence masters.
  private masters: ICAL.Event[]
  // RECURRENCE-ID VEVENTs whose series has no master in the file (some exporters
  // emit each occurrence of a series this way). Still part of a recurring series.
  private orphanOccurrences: ICAL.Event[]

  constructor(icsText: string) {
    let jcalData: unknown
    try {
      jcalData = ICAL.parse(icsText)
    } catch (err) {
      throw new IcsParseError(err instanceof Error ? err.message : 'Failed to parse iCalendar data')
    }
    const comp = new ICAL.Component(jcalData as never)
    const all = comp.getAllSubcomponents('vevent').map((vevent) => new ICAL.Event(vevent))

    this.masters = []
    this.orphanOccurrences = []
    const mastersByUid = new Map<string, ICAL.Event>()
    const exceptions: ICAL.Event[] = []

    for (const event of all) {
      if (event.isRecurrenceException()) {
        exceptions.push(event)
      } else {
        this.masters.push(event)
        mastersByUid.set(event.uid, event)
      }
    }

    for (const exception of exceptions) {
      const master = mastersByUid.get(exception.uid)
      if (master) {
        try {
          master.relateException(exception)
        } catch {
          // already related by ical.js during construction
        }
      } else {
        this.orphanOccurrences.push(exception)
      }
    }
  }

  getEventsInRange(start: Date, end: Date, options: ImportedEventsOptions = {}): ImportedEventOccurrence[] {
    const { includeRecurring = true } = options
    const results: ImportedEventOccurrence[] = []

    for (const event of this.masters) {
      const title = event.summary || ''
      const allDay = event.startDate.isDate

      if (event.isRecurring()) {
        if (!includeRecurring) continue
        const iterator = event.iterator()
        let iterations = 0
        let next: ICAL.Time | null
        while ((next = iterator.next()) && iterations < MAX_RECURRENCE_ITERATIONS) {
          iterations++
          if (next.toJSDate() >= end) break
          let date = next.toJSDate()
          let occurrenceTitle = title
          try {
            const details = event.getOccurrenceDetails(next)
            date = details.startDate.toJSDate()
            occurrenceTitle = details.item.summary || title
          } catch {
            // fall back to the raw recurrence time
          }
          if (date >= start && date < end) {
            results.push({ uid: `${event.uid}:${date.toISOString()}`, title: occurrenceTitle, date, allDay })
          }
        }
      } else {
        const date = event.startDate.toJSDate()
        if (date >= start && date < end) {
          results.push({ uid: event.uid, title, date, allDay })
        }
      }
    }

    if (includeRecurring) {
      for (const event of this.orphanOccurrences) {
        const date = event.startDate.toJSDate()
        if (date >= start && date < end) {
          results.push({
            uid: `${event.uid}:${date.toISOString()}`,
            title: event.summary || '',
            date,
            allDay: event.startDate.isDate,
          })
        }
      }
    }

    return results
  }

  getDistinctTitles(): string[] {
    const titles: string[] = []
    const seen = new Set<string>()
    for (const event of [...this.masters, ...this.orphanOccurrences]) {
      const title = (event.summary || '').trim()
      if (!title || seen.has(title)) continue
      seen.add(title)
      titles.push(title)
    }
    return titles
  }
}
