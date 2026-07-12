import type { Holiday } from '@/domain/calendar/entities/Holiday'
import { computeEaster } from '@/domain/calendar/usecases/ComputeEaster'
import { BaseHolidayProvider } from './BaseHolidayProvider'

export class ChileHolidayProvider extends BaseHolidayProvider {
  countryCode = 'CL'

  private readonly FIXED: Holiday[] = [
    { month: 0,  day: 1,  id: 'new_year' },
    { month: 4,  day: 1,  id: 'labor_day' },
    { month: 4,  day: 21, id: 'naval_glory' },
    { month: 5,  day: 29, id: 'saints_peter_paul' },
    { month: 6,  day: 16, id: 'virgin_carmen' },
    { month: 7,  day: 15, id: 'assumption' },
    { month: 8,  day: 18, id: 'independence' },
    { month: 8,  day: 19, id: 'army_glory' },
    { month: 9,  day: 9,  id: 'encounter_worlds' },
    { month: 9,  day: 27, id: 'evangelical_churches' },
    { month: 10, day: 1,  id: 'all_saints' },
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

    const corpusMonth = new Date(year, easter.month, easter.day + 60)
    mobile.push({ month: corpusMonth.getMonth(), day: corpusMonth.getDate(), id: 'corpus_christi' })

    return mobile
  }
}
