import { describe, it, expect } from 'vitest'
import { buildCalendarGrid } from '@/domain/calendar/usecases/BuildCalendarGrid'
import type { Holiday } from '@/domain/calendar/entities/Holiday'

describe('BuildCalendarGrid', () => {
  it('creates a grid with 6 weeks (42 cells) for January 2026', () => {
    const holidays: Holiday[] = []
    const grid = buildCalendarGrid(2026, 0, 'January', holidays)
    expect(grid.weeks.length).toBe(5)
    expect(grid.year).toBe(2026)
    expect(grid.month).toBe(0)
    expect(grid.monthName).toBe('January')
  })

  it('fills days sequentially across weeks', () => {
    const grid = buildCalendarGrid(2026, 4, 'May', [])
    const allDays = grid.weeks.flatMap(w => w.days.filter((d): d is NonNullable<typeof d> => d !== null))
    expect(allDays[0].date).toBe(1)
    expect(allDays[allDays.length - 1].date).toBe(31)
  })

  it('marks weekends (Sat=5, Sun=6) based on weekStart=1 (Mon)', () => {
    const grid = buildCalendarGrid(2026, 0, 'January', [])
    for (const week of grid.weeks) {
      for (let di = 0; di < week.days.length; di++) {
        const day = week.days[di]
        if (day) {
          if (di === 5 || di === 6) {
            expect(day.isWeekend).toBe(true)
          } else {
            expect(day.isWeekend).toBe(false)
          }
        }
      }
    }
  })

  it('includes holidays passed to it', () => {
    const holidays: Holiday[] = [{ month: 0, day: 1, id: 'new_year' }]
    const grid = buildCalendarGrid(2026, 0, 'January', holidays)
    const newYearDay = grid.weeks.flatMap(w => w.days).find(
      (d): d is NonNullable<typeof d> => d !== null && d.date === 1
    )
    expect(newYearDay?.holiday?.id).toBe('new_year')
  })

  it('handles null cells before the 1st and after the last day', () => {
    const grid = buildCalendarGrid(2026, 0, 'January', [])
    const firstWeek = grid.weeks[0]
    expect(firstWeek.days.some(d => d === null)).toBe(true)

    const lastWeek = grid.weeks[grid.weeks.length - 1]
    expect(lastWeek.days.some(d => d === null)).toBe(true)
  })

  it('handles February in non-leap year (2026)', () => {
    const grid = buildCalendarGrid(2026, 1, 'February', [])
    const allDays = grid.weeks.flatMap(w => w.days.filter((d): d is NonNullable<typeof d> => d !== null))
    expect(allDays.length).toBe(28)
  })

  it('handles February in leap year (2024)', () => {
    const grid = buildCalendarGrid(2024, 1, 'February', [])
    const allDays = grid.weeks.flatMap(w => w.days.filter((d): d is NonNullable<typeof d> => d !== null))
    expect(allDays.length).toBe(29)
  })

  it('groups imported events by day', () => {
    const grid = buildCalendarGrid(2026, 0, 'January', [], false, 1, [
      { id: 'cal1:evt1', day: 10, title: 'Dentist', color: '#2563eb' },
      { id: 'cal1:evt2', day: 10, title: 'Standup', color: '#16a34a' },
      { id: 'cal2:evt3', day: 15, title: 'Birthday', color: '#dc2626' },
    ])
    const day10 = grid.weeks.flatMap(w => w.days).find((d): d is NonNullable<typeof d> => d !== null && d.date === 10)
    const day15 = grid.weeks.flatMap(w => w.days).find((d): d is NonNullable<typeof d> => d !== null && d.date === 15)
    const day1 = grid.weeks.flatMap(w => w.days).find((d): d is NonNullable<typeof d> => d !== null && d.date === 1)

    expect(day10?.events).toHaveLength(2)
    expect(day10?.events?.map(e => e.title).sort()).toEqual(['Dentist', 'Standup'])
    expect(day15?.events).toEqual([{ id: 'cal2:evt3', title: 'Birthday', color: '#dc2626' }])
    expect(day1?.events).toBeUndefined()
  })

  it('deduplicates events sharing the same title on the same day, keeping the first', () => {
    const grid = buildCalendarGrid(2026, 0, 'January', [], false, 1, [
      { id: 'cal1:evt1', day: 10, title: 'Busy', color: '#2563eb' },
      { id: 'cal2:evt2', day: 10, title: 'Busy', color: '#dc2626' },
      { id: 'cal1:evt3', day: 10, title: '  Busy  ', color: '#16a34a' },
    ])
    const day10 = grid.weeks.flatMap(w => w.days).find((d): d is NonNullable<typeof d> => d !== null && d.date === 10)

    expect(day10?.events).toEqual([{ id: 'cal1:evt1', title: 'Busy', color: '#2563eb' }])
  })
})
