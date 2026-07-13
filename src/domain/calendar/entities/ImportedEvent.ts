export interface ImportedEventOccurrence {
  uid: string
  title: string
  date: Date
  allDay: boolean
}

export interface ImportedEventsOptions {
  includeRecurring?: boolean
}

export interface ImportedEventsSource {
  getEventsInRange(start: Date, end: Date, options?: ImportedEventsOptions): ImportedEventOccurrence[]
}
