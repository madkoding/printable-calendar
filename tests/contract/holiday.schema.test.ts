import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { getProvider, getAvailableCountries } from '@/data/holidays'

const holidaySchema = z.object({
  month: z.number().min(0).max(11),
  day: z.number().min(1).max(31),
  id: z.string().min(1),
})

describe('HolidayProvider contract', () => {
  const codes = getAvailableCountries()

  it('every provider has required shape', () => {
    for (const code of codes) {
      const provider = getProvider(code)
      expect(typeof provider.countryCode).toBe('string')
      expect(provider.countryCode.length).toBeGreaterThanOrEqual(2)
      expect(typeof provider.getFixed).toBe('function')
      expect(typeof provider.getMobile).toBe('function')
      expect(typeof provider.getHolidays).toBe('function')
    }
  })

  it('every provider returns valid Holiday objects from getHolidays', () => {
    for (const code of codes) {
      const provider = getProvider(code)
      for (const month of [0, 5, 11]) {
        const holidays = provider.getHolidays(2026, month)
        for (const h of holidays) {
          const result = holidaySchema.safeParse(h)
          if (!result.success) {
            console.error(`${code} month ${month}: invalid holiday`, h)
          }
          expect(result.success).toBe(true)
        }
      }
    }
  })

  it('every provider returns valid Holiday objects from getFixed', () => {
    for (const code of codes) {
      const provider = getProvider(code)
      for (const h of provider.getFixed()) {
        const result = holidaySchema.safeParse(h)
        expect(result.success).toBe(true)
      }
    }
  })

  it('every provider returns valid Holiday objects from getMobile', () => {
    for (const code of codes) {
      const provider = getProvider(code)
      for (const h of provider.getMobile(2026)) {
        const result = holidaySchema.safeParse(h)
        expect(result.success).toBe(true)
      }
    }
  })
})
