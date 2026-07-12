import { CalendarProvider } from '@/app/providers/CalendarProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { HomePage } from '@/presentation/pages/HomePage'

export default function App() {
  return (
    <ThemeProvider>
      <CalendarProvider>
        <HomePage />
      </CalendarProvider>
    </ThemeProvider>
  )
}
