import type { CalendarGrid, CalendarDay, CalendarWeek } from '../entities/Calendar'
import type { Holiday } from '../entities/Holiday'

const DAYS_PER_WEEK = 7
const MAX_WEEKS = 6

export function buildCalendarGrid(
  year: number,
  month: number,
  monthName: string,
  holidays: Holiday[],
  weekStart: 0 | 1 | 6 = 1
): CalendarGrid {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const holidayMap = new Map<string, Holiday>()
  for (const h of holidays) {
    holidayMap.set(`${h.month}-${h.day}`, h)
  }

  let startingIndex = firstDay.getDay() - weekStart
  if (startingIndex < 0) startingIndex += DAYS_PER_WEEK

  const weeks: CalendarWeek[] = []
  let date = 1

  for (let w = 0; w < MAX_WEEKS; w++) {
    if (date > daysInMonth) break

    const days: (CalendarDay | null)[] = []

    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      if (w === 0 && d < startingIndex) {
        days.push(null)
      } else if (date > daysInMonth) {
        days.push(null)
      } else {
        const weekdayIndex = (d + weekStart) % DAYS_PER_WEEK
        const isWeekend = weekdayIndex === 0 || weekdayIndex === 6
        const holidayKey = `${month}-${date}`
        const holiday = holidayMap.get(holidayKey)

        days.push({
          date,
          isWeekend,
          isCurrentMonth: true,
          holiday: holiday ? { id: holiday.id, name: holiday.id } : undefined,
        })

        date++
      }
    }

    weeks.push({ days })
  }

  return { year, month, weeks, monthName }
}
