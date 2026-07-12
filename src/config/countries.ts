export interface CountryOption {
  code: string
  nameKey: string
  flag: string
}

export const COUNTRIES: CountryOption[] = [
  { code: 'CL', nameKey: 'countries.chile', flag: '🇨🇱' },
  { code: 'AR', nameKey: 'countries.argentina', flag: '🇦🇷' },
  { code: 'MX', nameKey: 'countries.mexico', flag: '🇲🇽' },
  { code: 'US', nameKey: 'countries.united_states', flag: '🇺🇸' },
  { code: 'BR', nameKey: 'countries.brazil', flag: '🇧🇷' },
  { code: 'NONE', nameKey: 'countries.none', flag: '🚫' },
]

export const DEFAULT_COUNTRY = 'CL'
