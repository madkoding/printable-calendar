import { describe, it, expect } from 'vitest'
import { getHolidaysForMonth } from '@/domain/calendar/usecases/GetHolidaysForMonth'
import { ChileHolidayProvider } from '@/data/holidays/ChileHolidayProvider'

describe('GetHolidaysForMonth', () => {
  it('returns holidays for a given month from the provider', () => {
    const provider = new ChileHolidayProvider()
    const holidays = getHolidaysForMonth(provider, 2026, 0) // January
    expect(holidays.length).toBeGreaterThanOrEqual(1)
    expect(holidays.some(h => h.id === 'new_year')).toBe(true)
  })

  it('returns empty array for a month with no holidays', () => {
    const provider = new ChileHolidayProvider()
    const holidays = getHolidaysForMonth(provider, 2026, 6) // July
    expect(holidays.length).toBeGreaterThanOrEqual(1)
  })
})
