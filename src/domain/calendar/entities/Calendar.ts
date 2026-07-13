export interface CalendarDayEvent {
  id: string
  title: string
  color: string
}

export interface CalendarDay {
  date: number
  isWeekend: boolean
  isCurrentMonth: boolean
  holiday?: { id: string; name: string }
  saint?: string
  events?: CalendarDayEvent[]
}

export interface CalendarWeek {
  days: (CalendarDay | null)[]
}

export interface CalendarGrid {
  year: number
  month: number
  weeks: CalendarWeek[]
  monthName: string
}
