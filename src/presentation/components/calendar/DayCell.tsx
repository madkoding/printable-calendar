import { useTranslation } from 'react-i18next'
import type { CalendarDay } from '@/domain/calendar/entities/Calendar'
import { useTheme } from '@/app/providers/ThemeProvider'
import { PALETTES } from '@/config/palettes'

interface DayCellProps {
  day: CalendarDay
  showWritingSpace: boolean
}

export function DayCell({ day, showWritingSpace }: DayCellProps) {
  const { t } = useTranslation()
  const { paletteId } = useTheme()
  const pal = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0]

  return (
    <div
      className="border p-1 flex flex-col min-h-0"
      style={{ background: day.isWeekend ? pal.weekendBg : 'transparent', borderColor: pal.cellBorder }}
    >
      <div className="text-sm font-bold leading-none print:text-base flex items-start justify-between gap-1" style={{ color: day.isWeekend ? pal.weekendDayNumber : pal.dayNumber }}>
        <span>{day.date}</span>
        {day.saint && (() => {
          const words = day.saint.split(' ')
          if (words.length <= 2) {
            return <span className="font-normal text-[6px] leading-tight text-right print:text-[7px]" style={{ color: '#9ca3af' }}>{day.saint}</span>
          }
          const mid = Math.ceil(words.length / 2)
          return (
            <div className="text-right">
              <div className="font-normal text-[6px] leading-tight print:text-[7px]" style={{ color: '#9ca3af' }}>{words.slice(0, mid).join(' ')}</div>
              <div className="font-normal text-[6px] leading-tight print:text-[7px]" style={{ color: '#9ca3af' }}>{words.slice(mid).join(' ')}</div>
            </div>
          )
        })()}
      </div>
      {day.holiday && (
        <div
          className="text-[8px] font-semibold px-0.5 py-px rounded inline-block mt-0.5 leading-tight break-words max-w-full print:text-xs"
          style={{ background: pal.holidayBg, color: pal.holidayText }}
        >
          {t(`holidays.${day.holiday.id}`)}
        </div>
      )}
      {showWritingSpace && (
        <div
          className="flex-1 min-h-0 mt-0.5"
          style={{
            backgroundImage: `repeating-linear-gradient(transparent, transparent 15px, ${pal.writingLine} 15px, ${pal.writingLine} 16px)`,
          }}
        />
      )}
    </div>
  )
}
