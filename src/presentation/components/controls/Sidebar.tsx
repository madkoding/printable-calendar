import { useTranslation } from 'react-i18next'
import { RangeSelector } from './RangeSelector'
import { CountrySelector } from './CountrySelector'
import { TemplateSelector } from './TemplateSelector'
import { PagesPerSheetSelector } from './PagesPerSheetSelector'
import { ThemeControls } from './ThemeControls'
import { FontSelector } from './FontSelector'
import { PrintButton } from './PrintButton'
import { LanguageSelector } from './LanguageSelector'
import { SantoralToggle } from './SantoralToggle'
import { NotesToggle } from './NotesToggle'
import { ImportedCalendarsSection } from './ImportedCalendarsSection'

export function Sidebar() {
  const { t } = useTranslation()
  return (
    <aside className="w-72 bg-slate-50 border-r border-gray-200 overflow-y-auto print:hidden flex flex-col text-sm">
      <div className="p-3 border-b border-gray-200">
        <h1 className="text-base font-bold text-gray-800 tracking-tight">{t('app.title')}</h1>
      </div>
      <div className="p-2.5 flex flex-col gap-2 flex-1">
        <TemplateSelector />
        <RangeSelector />
        <PagesPerSheetSelector />
        <div className="grid grid-cols-2 gap-2">
          <CountrySelector />
          <LanguageSelector />
        </div>
        <SantoralToggle />
        <NotesToggle />
        <ImportedCalendarsSection />
        <FontSelector />
        <ThemeControls />
      </div>
      <div className="p-2.5 border-t border-gray-200 sticky bottom-0 bg-slate-50">
        <PrintButton />
      </div>
    </aside>
  )
}
