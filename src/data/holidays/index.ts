import type { HolidayProvider } from '@/domain/calendar/entities/Holiday'
import { ChileHolidayProvider } from './ChileHolidayProvider'
import { ArgentinaHolidayProvider } from './ArgentinaHolidayProvider'
import { MexicoHolidayProvider } from './MexicoHolidayProvider'
import { USHolidayProvider } from './USHolidayProvider'
import { BrazilHolidayProvider } from './BrazilHolidayProvider'
import { NoneHolidayProvider } from './NoneHolidayProvider'

const providers: Record<string, HolidayProvider> = {}

function register(provider: HolidayProvider): void {
  providers[provider.countryCode] = provider
}

register(new ChileHolidayProvider())
register(new ArgentinaHolidayProvider())
register(new MexicoHolidayProvider())
register(new USHolidayProvider())
register(new BrazilHolidayProvider())
register(new NoneHolidayProvider())

export function getProvider(countryCode: string): HolidayProvider {
  const p = providers[countryCode]
  if (!p) throw new Error(`No provider for country: ${countryCode}`)
  return p
}

export function getAvailableCountries(): string[] {
  return Object.keys(providers)
}

export { ChileHolidayProvider, ArgentinaHolidayProvider, MexicoHolidayProvider, USHolidayProvider, BrazilHolidayProvider }
