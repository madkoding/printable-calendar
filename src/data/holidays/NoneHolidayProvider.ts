import type { Holiday } from '@/domain/calendar/entities/Holiday'
import { BaseHolidayProvider } from './BaseHolidayProvider'

export class NoneHolidayProvider extends BaseHolidayProvider {
  countryCode = 'NONE'

  getFixed(): Holiday[] {
    return []
  }

  getMobile(): Holiday[] {
    return []
  }
}
