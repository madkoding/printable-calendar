import { useTranslation } from 'react-i18next'
import { useCalendar } from '@/app/providers/CalendarProvider'

export function NotesToggle() {
  const { t } = useTranslation()
  const { showNotes, setShowNotes } = useCalendar()

  return (
    <label className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t('controls.notes')}</span>
      <button
        type="button"
        role="switch"
        aria-checked={showNotes}
        onClick={() => setShowNotes(!showNotes)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${showNotes ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${showNotes ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </label>
  )
}
