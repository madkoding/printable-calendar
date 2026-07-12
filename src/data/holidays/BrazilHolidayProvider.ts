import type { Holiday } from '@/domain/calendar/entities/Holiday'
import { computeEaster } from '@/domain/calendar/usecases/ComputeEaster'
import { BaseHolidayProvider } from './BaseHolidayProvider'

export class BrazilHolidayProvider extends BaseHolidayProvider {
  countryCode = 'BR'

  private readonly FIXED: Holiday[] = [
    { month: 0,  day: 1,  id: 'new_year' },
    { month: 3,  day: 21, id: 'tiradentes' },
    { month: 4,  day: 1,  id: 'labor_day' },
    { month: 8,  day: 7,  id: 'independence' },
    { month: 9,  day: 12, id: 'our_lady_aparecida' },
    { month: 10, day: 2,  id: 'all_souls' },
    { month: 10, day: 15, id: 'proclamation_republic' },
    { month: 10, day: 20, id: 'black_consciousness' },
    { month: 11, day: 25, id: 'christmas' },
  ]

  getFixed(): Holiday[] {
    return this.FIXED
  }

  getMobile(year: number): Holiday[] {
    const easter = computeEaster(year)
    const carnival = new Date(year, easter.month, easter.day - 47)
    const corpus = new Date(year, easter.month, easter.day + 60)
    return [
      { month: carnival.getMonth(), day: carnival.getDate(), id: 'carnival' },
      { month: easter.month, day: easter.day - 2, id: 'good_friday' },
      { month: corpus.getMonth(), day: corpus.getDate(), id: 'corpus_christi' },
    ]
  }
}
