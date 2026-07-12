import type { Holiday } from '@/domain/calendar/entities/Holiday'
import { computeEaster } from '@/domain/calendar/usecases/ComputeEaster'
import { BaseHolidayProvider } from './BaseHolidayProvider'

export class ArgentinaHolidayProvider extends BaseHolidayProvider {
  countryCode = 'AR'

  private readonly FIXED: Holiday[] = [
    { month: 0,  day: 1,  id: 'new_year' },
    { month: 4,  day: 1,  id: 'labor_day' },
    { month: 5,  day: 20, id: 'flag_day' },       // Día de la Bandera (3er lunes — simplificado)
    { month: 5,  day: 25, id: 'may_revolution' },
    { month: 7,  day: 9,  id: 'independence' },
    { month: 9,  day: 12, id: 'diversity_day' },   // 2do lunes — simplificado
    { month: 11, day: 8,  id: 'immaculate_conception' },
    { month: 11, day: 25, id: 'christmas' },
  ]

  getFixed(): Holiday[] {
    return this.FIXED
  }

  getMobile(year: number): Holiday[] {
    const easter = computeEaster(year)
    const mobile: Holiday[] = []
    mobile.push({ month: easter.month, day: easter.day - 2, id: 'good_friday' })
    mobile.push({ month: easter.month, day: easter.day - 1, id: 'holy_saturday' })
    return mobile
  }
}
