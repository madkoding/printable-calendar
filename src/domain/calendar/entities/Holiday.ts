export interface Holiday {
  month: number   // 0-indexed
  day: number     // 1-indexed
  id: string
}

export interface HolidayProvider {
  countryCode: string
  getFixed(): Holiday[]
  getMobile(year: number): Holiday[]
  getHolidays(year: number, month: number): Holiday[]
}

export interface CountryConfig {
  code: string
  nameKey: string
  provider: HolidayProvider
}
