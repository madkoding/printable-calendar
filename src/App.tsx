import { CalendarProvider } from '@/app/providers/CalendarProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { ImportedCalendarsProvider } from '@/app/providers/ImportedCalendarsProvider'
import { HomePage } from '@/presentation/pages/HomePage'

export default function App() {
  return (
    <ThemeProvider>
      <CalendarProvider>
        <ImportedCalendarsProvider>
          <HomePage />
        </ImportedCalendarsProvider>
      </CalendarProvider>
    </ThemeProvider>
  )
}
