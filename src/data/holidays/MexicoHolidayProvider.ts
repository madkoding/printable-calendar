import type { Holiday } from '@/domain/calendar/entities/Holiday'
import { BaseHolidayProvider } from './BaseHolidayProvider'

export class MexicoHolidayProvider extends BaseHolidayProvider {
  countryCode = 'MX'

  private readonly FIXED: Holiday[] = [
    { month: 0,  day: 1,  id: 'new_year' },
    { month: 1,  day: 5,  id: 'constitution_day' },  // 1er lunes — simplificado
    { month: 2,  day: 21, id: 'benito_juarez' },      // 3er lunes — simplificado
    { month: 4,  day: 1,  id: 'labor_day' },
    { month: 5,  day: 16, id: 'independence' },
    { month: 9,  day: 12, id: 'race_day' },           // 12 oct — simplificado
    { month: 10, day: 2,  id: 'all_souls' },
    { month: 10, day: 20, id: 'revolution_day' },     // 3er lunes — simplificado
    { month: 11, day: 12, id: 'guadalupe_virgin' },
    { month: 11, day: 25, id: 'christmas' },
  ]

  getFixed(): Holiday[] {
    return this.FIXED
  }

  getMobile(_year: number): Holiday[] {
    return []
  }
}
