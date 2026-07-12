import type { Holiday, HolidayProvider } from '@/domain/calendar/entities/Holiday'

export abstract class BaseHolidayProvider implements HolidayProvider {
  abstract countryCode: string
  abstract getFixed(): Holiday[]
  abstract getMobile(year: number): Holiday[]

  getHolidays(year: number, month: number): Holiday[] {
    const fixed = this.getFixed()
    const mobile = this.getMobile(year)
    return [...fixed, ...mobile].filter(h => h.month === month)
  }
}
