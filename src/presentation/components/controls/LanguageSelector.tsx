import { useTranslation } from 'react-i18next'
import type { Locale } from '@/domain/i18n/types'
import { CollapsibleSection } from './CollapsibleSection'

const LOCALES: { value: Locale; label: string; name: string }[] = [
  { value: 'es', label: 'ES', name: 'Español' },
  { value: 'en', label: 'EN', name: 'English' },
  { value: 'pt', label: 'PT', name: 'Português' },
  { value: 'fr', label: 'FR', name: 'Français' },
  { value: 'de', label: 'DE', name: 'Deutsch' },
]

export function LanguageSelector() {
  const { t, i18n } = useTranslation()
  const current = LOCALES.find((l) => l.value === i18n.language) ?? LOCALES[0]

  return (
    <CollapsibleSection title={t('controls.language')} summary={current.label}>
      <div className="grid grid-cols-5 gap-1">
        {LOCALES.map((o) => {
          const active = i18n.language === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => i18n.changeLanguage(o.value)}
              title={o.name}
              className={`
                px-1 py-1 text-[11px] font-semibold rounded-md border transition-all
                ${active
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'}
              `}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </CollapsibleSection>
  )
}
