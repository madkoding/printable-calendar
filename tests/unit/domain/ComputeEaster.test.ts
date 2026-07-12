import { describe, it, expect } from 'vitest'
import { computeEaster } from '@/domain/calendar/usecases/ComputeEaster'

describe('ComputeEaster', () => {
  it('returns correct date for 2024 (March 31)', () => {
    const result = computeEaster(2024)
    expect(result.month).toBe(2)  // March
    expect(result.day).toBe(31)
  })

  it('returns correct date for 2025 (April 20)', () => {
    const result = computeEaster(2025)
    expect(result.month).toBe(3)  // April
    expect(result.day).toBe(20)
  })

  it('returns correct date for 2026 (April 5)', () => {
    const result = computeEaster(2026)
    expect(result.month).toBe(3)  // April
    expect(result.day).toBe(5)
  })

  it('returns correct date for 2027 (March 28)', () => {
    const result = computeEaster(2027)
    expect(result.month).toBe(2)  // March
    expect(result.day).toBe(28)
  })

  it('returns correct date for 2028 (April 16)', () => {
    const result = computeEaster(2028)
    expect(result.month).toBe(3)  // April
    expect(result.day).toBe(16)
  })

  it('returns correct date for 2029 (April 1)', () => {
    const result = computeEaster(2029)
    expect(result.month).toBe(3)  // April
    expect(result.day).toBe(1)
  })

  it('returns correct date for 2030 (April 21)', () => {
    const result = computeEaster(2030)
    expect(result.month).toBe(3)  // April
    expect(result.day).toBe(21)
  })
})
