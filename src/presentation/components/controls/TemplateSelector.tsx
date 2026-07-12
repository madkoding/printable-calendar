import { useTranslation } from 'react-i18next'
import { useCalendar } from '@/app/providers/CalendarProvider'
import { TEMPLATES } from '@/config/templates'
import { CollapsibleSection } from './CollapsibleSection'

export function TemplateSelector() {
  const { t } = useTranslation()
  const { template, setTemplate } = useCalendar()
  const selected = TEMPLATES.find((tmpl) => tmpl.id === template)

  return (
    <CollapsibleSection title={t('controls.template')} summary={selected ? t(selected.nameKey) : undefined} defaultOpen>
      <div className="grid grid-cols-3 gap-1.5">
        {TEMPLATES.map((tmpl) => {
          const active = template === tmpl.id
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => setTemplate(tmpl.id)}
              className={`
                px-1 py-1 text-xs font-semibold rounded-md border transition-all
                ${active
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'}
              `}
            >
              {t(tmpl.nameKey)}
            </button>
          )
        })}
      </div>
    </CollapsibleSection>
  )
}
