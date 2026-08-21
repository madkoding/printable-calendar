import { useTranslation } from 'react-i18next'
import type { CalendarDay } from '@/domain/calendar/entities/Calendar'
import { useTheme } from '@/app/providers/ThemeProvider'
import { PALETTES } from '@/config/palettes'
import { getContrastTextColor } from '@/presentation/utils/color'

const MAX_VISIBLE_BARS = 3
const BAR_HEIGHT = 16

interface DayCellProps {
  day: CalendarDay
  showWritingSpace: boolean
}

export function DayCell({ day, showWritingSpace }: DayCellProps) {
  const { t } = useTranslation()
  const { paletteId } = useTheme()
  const pal = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0]

  const bars: { key: string; text: string; bg: string; fg: string }[] = []
  if (day.holiday) {
    bars.push({ key: `holiday-${day.holiday.id}`, text: t(`holidays.${day.holiday.id}`), bg: pal.holidayBg, fg: pal.holidayText })
  }
  for (const event of day.events ?? []) {
    bars.push({ key: event.id, text: event.title, bg: event.color, fg: getContrastTextColor(event.color) })
  }

  return (
    <div
      className="border p-1 flex flex-col min-h-0"
      style={{ background: day.isWeekend ? pal.weekendBg : 'transparent', borderColor: pal.cellBorder }}
    >
      <div className="h-4 flex items-start justify-between gap-1 min-w-0 overflow-hidden">
        <span className="text-sm font-bold leading-none print:text-base" style={{ color: day.isWeekend ? pal.weekendDayNumber : pal.dayNumber }}>{day.date}</span>
        {day.saint && (
          <span className="font-normal text-[6px] leading-tight text-right line-clamp-2 min-w-0 print:text-[7px]" style={{ color: '#9ca3af' }}>{day.saint}</span>
        )}
      </div>
      <div
        className="flex-1 min-h-0 mt-0.5 relative"
        style={
          showWritingSpace
            ? { backgroundImage: `repeating-linear-gradient(transparent, transparent 15px, ${pal.writingLine} 15px, ${pal.writingLine} 16px)` }
            : undefined
        }
      >
        {bars.slice(0, MAX_VISIBLE_BARS).map((bar, i) => (
          <div
            key={bar.key}
            className="absolute left-0 right-0 flex items-center px-1 text-[7px] font-medium truncate leading-none print:text-[8px]"
            style={{ top: i * BAR_HEIGHT, height: BAR_HEIGHT - 1, background: bar.bg, color: bar.fg }}
          >
            {bar.text}
          </div>
        ))}
      </div>
    </div>
  )
}
