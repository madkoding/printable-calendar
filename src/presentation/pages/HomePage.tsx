import { useCalendar } from '@/app/providers/CalendarProvider'
import { PAPER_SIZES } from '@/config/paperSizes'
import { Sidebar } from '@/presentation/components/controls/Sidebar'
import { CalendarCanvas } from '@/presentation/components/calendar/CalendarCanvas'

export function HomePage() {
  const { paperSize, orientation } = useCalendar()
  const paper = PAPER_SIZES.find((p) => p.id === paperSize) ?? PAPER_SIZES[0]
  const paperW = orientation === 'portrait' ? parseFloat(paper.width) : parseFloat(paper.height)
  const paperH = orientation === 'portrait' ? parseFloat(paper.height) : parseFloat(paper.width)

  return (
    <div className="app-root flex h-screen print:block print:h-auto">
      <Sidebar />
      <main
        className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden print:bg-white print:block print:overflow-visible print:p-0 print:m-0"
        data-paper-w={paperW}
        data-paper-h={paperH}
      >
        <CalendarCanvas />
      </main>
    </div>
  )
}
