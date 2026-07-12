import { useTranslation } from 'react-i18next'
import { useTheme } from '@/app/providers/ThemeProvider'
import { PALETTES } from '@/config/palettes'

interface Props {
  compact?: boolean
}

export function NotesSection({ compact }: Props) {
  const { t } = useTranslation()
  const { paletteId } = useTheme()
  const pal = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0]

  return (
    <div className="h-full flex flex-col border-t-2 border-gray-800 print:break-inside-avoid pt-1">
      <div className={`font-bold text-gray-800 uppercase flex-shrink-0 ${compact ? 'text-[10px] mb-0.5' : 'text-xs mb-1 print:text-base'}`}>
        {t('notes.title')}
      </div>
      <div
        className="flex-1 min-h-0"
        style={{
          backgroundImage: `repeating-linear-gradient(transparent, transparent ${compact ? '15px' : '24px'}, ${pal.writingLine} ${compact ? '15px' : '24px'}, ${pal.writingLine} ${compact ? '16px' : '25px'})`,
        }}
      />
    </div>
  )
}
