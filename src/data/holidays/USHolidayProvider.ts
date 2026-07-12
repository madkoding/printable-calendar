import type { Holiday } from '@/domain/calendar/entities/Holiday'
import { BaseHolidayProvider } from './BaseHolidayProvider'

export class USHolidayProvider extends BaseHolidayProvider {
  countryCode = 'US'

  private readonly FIXED: Holiday[] = [
    { month: 0,  day: 1,  id: 'new_year' },
    { month: 0,  day: 20, id: 'mlk_day' },         // 3er lunes — simplificado
    { month: 1,  day: 17, id: 'presidents_day' },  // 3er lunes — simplificado
    { month: 4,  day: 26, id: 'memorial_day' },    // último lunes — simplificado
    { month: 6,  day: 4,  id: 'independence' },
    { month: 8,  day: 1,  id: 'labor_day' },       // 1er lunes — simplificado
    { month: 9,  day: 13, id: 'columbus_day' },    // 2do lunes — simplificado
    { month: 10, day: 11, id: 'veterans_day' },
    { month: 10, day: 27, id: 'thanksgiving' },    // 4to jueves — simplificado
    { month: 11, day: 25, id: 'christmas' },
  ]

  getFixed(): Holiday[] {
    return this.FIXED
  }

  getMobile(_year: number): Holiday[] {
    return []
  }
}
