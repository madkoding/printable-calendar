import { useTranslation } from 'react-i18next'
import { useTheme } from '@/app/providers/ThemeProvider'
import { FONTS } from '@/config/fonts'
import { CollapsibleSection } from './CollapsibleSection'

export function FontSelector() {
  const { t } = useTranslation()
  const { fontId, setFontId } = useTheme()
  const selected = FONTS.find((f) => f.id === fontId) ?? FONTS[0]

  return (
    <CollapsibleSection title={t('controls.font')} summary={t(selected.nameKey)}>
      <div className="grid grid-cols-2 gap-1.5">
        {FONTS.map((f) => {
          const active = fontId === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFontId(f.id)}
              className={`
                px-1 py-1 text-[11px] font-semibold rounded-md border transition-all
                ${active
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'}
              `}
              style={{ fontFamily: f.family }}
            >
              {t(f.nameKey)}
            </button>
          )
        })}
      </div>
    </CollapsibleSection>
  )
}
