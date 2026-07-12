import { describe, it, expect } from 'vitest'
import { ChileHolidayProvider } from '@/data/holidays/ChileHolidayProvider'

describe('ChileHolidayProvider', () => {
  const provider = new ChileHolidayProvider()

  it('returns countryCode CL', () => {
    expect(provider.countryCode).toBe('CL')
  })

  it('includes fixed holiday new_year on Jan 1', () => {
    const holidays = provider.getHolidays(2026, 0)
    expect(holidays.some(h => h.day === 1 && h.id === 'new_year')).toBe(true)
  })

  it('includes fixed holiday christmas on Dec 25', () => {
    const holidays = provider.getHolidays(2026, 11)
    expect(holidays.some(h => h.day === 25 && h.id === 'christmas')).toBe(true)
  })

  it('returns mobile holiday good_friday from Easter calculation', () => {
    const holidays = provider.getHolidays(2026, 3) // April
    expect(holidays.some(h => h.id === 'good_friday')).toBe(true)
    expect(holidays.some(h => h.id === 'holy_saturday')).toBe(true)
    // Easter 2026 is April 5: Good Friday = April 3, Holy Saturday = April 4
    const gf = holidays.find(h => h.id === 'good_friday')
    expect(gf?.day).toBe(3)
    const hs = holidays.find(h => h.id === 'holy_saturday')
    expect(hs?.day).toBe(4)
  })
})
