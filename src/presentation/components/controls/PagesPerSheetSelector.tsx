import { useTranslation } from 'react-i18next'
import { useCalendar, PAGES_PER_SHEET_OPTIONS, type PagesPerSheet } from '@/app/providers/CalendarProvider'
import { CollapsibleSection } from './CollapsibleSection'

export function PagesPerSheetSelector() {
  const { t } = useTranslation()
  const { pagesPerSheet, setPagesPerSheet, template } = useCalendar()

  if (template === 'yearly') return null

  const summary = t('controls.pages_per_sheet_value', { count: pagesPerSheet })

  return (
    <CollapsibleSection title={t('controls.pages_per_sheet')} summary={summary}>
      <div className="grid grid-cols-3 gap-1.5">
        {PAGES_PER_SHEET_OPTIONS.map((n) => {
          const active = pagesPerSheet === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => setPagesPerSheet(n as PagesPerSheet)}
              className={`
                px-1 py-1 text-xs font-semibold rounded-md border transition-all
                ${active
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'}
              `}
            >
              {t('controls.pages_per_sheet_value', { count: n })}
            </button>
          )
        })}
      </div>
    </CollapsibleSection>
  )
}
