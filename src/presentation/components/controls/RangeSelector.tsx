import { useTranslation } from 'react-i18next'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useCalendar } from '@/app/providers/CalendarProvider'
import { CollapsibleSection } from './CollapsibleSection'

const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

function toDate(m: { month: number; year: number }) {
  return new Date(m.year, m.month, 1)
}

const pickerClass = '!w-full !text-xs !rounded-md !border !border-gray-200 !px-2 !py-1.5 !bg-white !text-gray-900 !cursor-pointer hover:!border-gray-400 !transition-colors'

export function RangeSelector() {
  const { t } = useTranslation()
  const { from, to, setFrom, setTo, template } = useCalendar()

  if (template === 'yearly') {
    return (
      <CollapsibleSection title={t('controls.year')} summary={String(from.year)}>
        <DatePicker
          selected={toDate(from)}
          onChange={(d: Date | null) => {
            if (!d) return
            setFrom({ month: d.getMonth(), year: d.getFullYear() })
            setTo({ month: d.getMonth(), year: d.getFullYear() })
          }}
          dateFormat="yyyy"
          showYearPicker
          className={pickerClass}
        />
      </CollapsibleSection>
    )
  }

  const summary = `${t(`months.${MONTH_KEYS[from.month]}`)} ${from.year} – ${t(`months.${MONTH_KEYS[to.month]}`)} ${to.year}`

  return (
    <CollapsibleSection title={t('controls.range')} summary={summary}>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-gray-400">{t('controls.from')}</label>
        <DatePicker
          selected={toDate(from)}
          onChange={(d: Date | null) => {
            if (!d) return
            setFrom({ month: d.getMonth(), year: d.getFullYear() })
          }}
          dateFormat="MM/yyyy"
          showMonthYearPicker
          className={pickerClass}
        />
        <label className="text-[10px] text-gray-400">{t('controls.to')}</label>
        <DatePicker
          selected={toDate(to)}
          onChange={(d: Date | null) => {
            if (!d) return
            setTo({ month: d.getMonth(), year: d.getFullYear() })
          }}
          dateFormat="MM/yyyy"
          showMonthYearPicker
          className={pickerClass}
        />
      </div>
    </CollapsibleSection>
  )
}
