import { useTranslation } from 'react-i18next'
import { useCalendar } from '@/app/providers/CalendarProvider'

export function SantoralToggle() {
  const { t } = useTranslation()
  const { showSantoral, setShowSantoral } = useCalendar()

  return (
    <label className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t('controls.santoral')}</span>
      <button
        type="button"
        role="switch"
        aria-checked={showSantoral}
        onClick={() => setShowSantoral(!showSantoral)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${showSantoral ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${showSantoral ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </label>
  )
}
