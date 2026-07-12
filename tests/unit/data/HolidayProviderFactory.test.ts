import { describe, it, expect } from 'vitest'
import { getProvider, getAvailableCountries } from '@/data/holidays'

describe('HolidayProviderFactory', () => {
  it('returns available countries', () => {
    const codes = getAvailableCountries()
    expect(codes).toContain('CL')
    expect(codes).toContain('AR')
    expect(codes).toContain('MX')
    expect(codes).toContain('US')
    expect(codes).toContain('BR')
  })

  it('throws for unknown country', () => {
    expect(() => getProvider('XX')).toThrow('No provider for country: XX')
  })

  it('returns ChileHolidayProvider for CL', () => {
    const provider = getProvider('CL')
    expect(provider.countryCode).toBe('CL')
    expect(typeof provider.getFixed).toBe('function')
    expect(typeof provider.getMobile).toBe('function')
    expect(typeof provider.getHolidays).toBe('function')
  })

  it('all providers return valid holidays', () => {
    const codes = getAvailableCountries()
    for (const code of codes) {
      const provider = getProvider(code)
      const holidays = provider.getHolidays(2026, 0)
      for (const h of holidays) {
        expect(h.month).toBeGreaterThanOrEqual(0)
        expect(h.month).toBeLessThan(12)
        expect(h.day).toBeGreaterThanOrEqual(1)
        expect(h.day).toBeLessThanOrEqual(31)
        expect(typeof h.id).toBe('string')
        expect(h.id.length).toBeGreaterThan(0)
      }
    }
  })
})
