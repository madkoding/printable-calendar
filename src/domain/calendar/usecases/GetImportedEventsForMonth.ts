import type { ImportedEventOccurrence, ImportedEventsSource } from '../entities/ImportedEvent'

export function getImportedEventsForMonth(
  source: ImportedEventsSource,
  year: number,
  month: number,
  includeRecurring = true
): ImportedEventOccurrence[] {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 1)
  return source.getEventsInRange(start, end, { includeRecurring })
}
