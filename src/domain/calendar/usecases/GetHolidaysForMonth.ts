import type { Holiday, HolidayProvider } from '../entities/Holiday'

export function getHolidaysForMonth(
  provider: HolidayProvider,
  year: number,
  month: number
): Holiday[] {
  return provider.getHolidays(year, month)
}
