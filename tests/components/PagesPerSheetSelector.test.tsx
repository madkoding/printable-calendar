import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePage } from '@/presentation/pages/HomePage'
import { CalendarProvider } from '@/app/providers/CalendarProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { ImportedCalendarsProvider } from '@/app/providers/ImportedCalendarsProvider'
import '@/app/providers/i18n'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CalendarProvider>
        <ImportedCalendarsProvider>{children}</ImportedCalendarsProvider>
      </CalendarProvider>
    </ThemeProvider>
  )
}

describe('PagesPerSheetSelector', () => {
  it('renders the selector for monthly template', () => {
    render(<HomePage />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Páginas por hoja/i })).toBeTruthy()
  })

  it('updates the value when changed', async () => {
    const user = userEvent.setup()
    render(<HomePage />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /Páginas por hoja/i }))
    const button = screen.getByRole('button', { name: /4 por hoja/i })
    await user.click(button)
    expect(button.className).toContain('bg-blue-600')
  })
})
