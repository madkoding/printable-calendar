import { useTranslation } from 'react-i18next'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useCalendar } from '@/app/providers/CalendarProvider'
import { PALETTES } from '@/config/palettes'
import { PAPER_SIZES } from '@/config/paperSizes'
import { CollapsibleSection } from './CollapsibleSection'

function OrientationIcon({ orientation }: { orientation: 'portrait' | 'landscape' }) {
  if (orientation === 'portrait') {
    return (
      <svg viewBox="0 0 24 32" className="w-4 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="2" width="18" height="28" rx="2" />
        <line x1="7" y1="8" x2="17" y2="8" />
        <line x1="7" y1="13" x2="15" y2="13" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 32 24" className="w-5 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="3" width="28" height="18" rx="2" />
      <line x1="7" y1="9" x2="23" y2="9" />
      <line x1="7" y1="15" x2="17" y2="15" />
    </svg>
  )
}

function PaletteDot({ palette }: { palette: typeof PALETTES[number] }) {
  return (
    <span
      className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${palette.headerBg} 50%, ${palette.weekendBg} 50%)`,
      }}
    />
  )
}

export function ThemeControls() {
  const { t } = useTranslation()
  const { paletteId, setPalette } = useTheme()
  const { paperSize, orientation, setPaperSize, setOrientation } = useCalendar()

  const selectedPalette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0]
  const selectedPaper = PAPER_SIZES.find((p) => p.id === paperSize) ?? PAPER_SIZES[0]

  return (
    <div className="flex flex-col gap-2">
      <CollapsibleSection title={t('controls.palette')} summary={(
        <span className="flex items-center gap-1.5">
          <PaletteDot palette={selectedPalette} />
          <span className="truncate">{t(selectedPalette.nameKey)}</span>
        </span>
      )}>
        <div className="grid grid-cols-3 gap-1.5">
          {PALETTES.map((p) => {
            const active = paletteId === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id)}
                title={t(p.nameKey)}
                className={`
                  group flex items-center gap-1 px-1 py-1 rounded-md border text-[10px] font-semibold leading-tight transition-all text-left
                  ${active
                    ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-700'}
                `}
              >
                <PaletteDot palette={p} />
                <span className="truncate">{t(p.nameKey)}</span>
              </button>
            )
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t('controls.paper')} summary={t(selectedPaper.nameKey)}>
        <div className="grid grid-cols-3 gap-1.5">
          {PAPER_SIZES.map((p) => {
            const active = paperSize === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaperSize(p.id)}
                className={`
                  px-1 py-1 text-[11px] font-semibold rounded-md border transition-all
                  ${active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'}
                `}
              >
                {t(p.nameKey)}
              </button>
            )
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t('controls.orientation')} summary={(
        <span className="flex items-center gap-1.5 text-xs">
          <OrientationIcon orientation={orientation} />
          {t(`controls.orientation_${orientation}`)}
        </span>
      )}>
        <div className="grid grid-cols-2 gap-1.5">
          {(['portrait', 'landscape'] as const).map((ori) => {
            const active = orientation === ori
            return (
              <button
                key={ori}
                type="button"
                onClick={() => setOrientation(ori)}
                aria-label={t(`controls.orientation_${ori}`)}
                title={t(`controls.orientation_${ori}`)}
                className={`
                  flex items-center justify-center px-2 py-1.5 rounded-md border transition-all
                  ${active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700'}
                `}
              >
                <OrientationIcon orientation={ori} />
              </button>
            )
          })}
        </div>
      </CollapsibleSection>
    </div>
  )
}
