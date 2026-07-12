import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { buildCalendarGrid } from '@/domain/calendar/usecases/BuildCalendarGrid'

const daySchema = z.object({
  date: z.number().min(1).max(31),
  isWeekend: z.boolean(),
  isCurrentMonth: z.boolean(),
  holiday: z.optional(z.object({ id: z.string(), name: z.string() })),
}).nullable()

const weekSchema = z.object({
  days: z.array(daySchema).length(7),
})

const gridSchema = z.object({
  year: z.number(),
  month: z.number().min(0).max(11),
  weeks: z.array(weekSchema),
  monthName: z.string().min(1),
})

describe('CalendarGrid contract', () => {
  it('produces valid grid for every month of 2026', () => {
    for (let month = 0; month < 12; month++) {
      const grid = buildCalendarGrid(2026, month, 'Test', [])
      const result = gridSchema.safeParse(grid)
      if (!result.success) {
        console.error(`Month ${month} failed:`, result.error.issues)
      }
      expect(result.success).toBe(true)
      expect(grid.weeks.length).toBeGreaterThanOrEqual(4)
      expect(grid.weeks.length).toBeLessThanOrEqual(6)
    }
  })
})
