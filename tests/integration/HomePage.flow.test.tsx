import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomePage } from '@/presentation/pages/HomePage'
import { CalendarProvider } from '@/app/providers/CalendarProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import '@/app/providers/i18n'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CalendarProvider>
        {children}
      </CalendarProvider>
    </ThemeProvider>
  )
}

describe('HomePage flow', () => {
  it('renders all controls and calendar', () => {
    render(<HomePage />, { wrapper: Wrapper })
    expect(screen.getByText('Calendario Imprimible')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Feriados/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Plantilla/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /imprimir/i })).toBeTruthy()
  })

  it('changes template to weekly', async () => {
    const user = userEvent.setup()
    render(<HomePage />, { wrapper: Wrapper })
    const weeklyButton = screen.getByRole('button', { name: /semanal/i })
    await user.click(weeklyButton)
    expect(weeklyButton.className).toContain('bg-blue-600')
  })

  it('changes country', async () => {
    const user = userEvent.setup()
    render(<HomePage />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /Feriados/i }))
    const argButton = screen.getByTitle('Argentina')
    await user.click(argButton)
    expect(argButton.className).toContain('bg-blue-600')
  })
})
