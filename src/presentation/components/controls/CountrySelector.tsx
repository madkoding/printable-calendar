import { useTranslation } from 'react-i18next'
import { useCalendar } from '@/app/providers/CalendarProvider'
import { COUNTRIES } from '@/config/countries'
import { CollapsibleSection } from './CollapsibleSection'

export function CountrySelector() {
  const { t } = useTranslation()
  const { country, setCountry } = useCalendar()
  const selected = COUNTRIES.find((c) => c.code === country)

  return (
    <CollapsibleSection title={t('controls.country')} summary={selected ? `${selected.flag} ${t(selected.nameKey)}` : undefined}>
      <div className="grid grid-cols-3 gap-1">
        {COUNTRIES.map((c) => {
          const active = country === c.code
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => setCountry(c.code)}
              title={t(c.nameKey)}
              className={`
                flex items-center justify-center rounded-md border transition-all
                ${active ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-gray-300 hover:border-blue-400'}
            `}
            >
              <span className={`text-base ${active ? 'grayscale-0' : 'grayscale-[30%] hover:grayscale-0'}`}>{c.flag}</span>
            </button>
          )
        })}
      </div>
    </CollapsibleSection>
  )
}
