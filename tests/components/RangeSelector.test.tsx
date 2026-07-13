import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RangeSelector } from '@/presentation/components/controls/RangeSelector'
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

describe('RangeSelector', () => {
  it('renders collapsed header with current range summary', () => {
    render(<RangeSelector />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Rango/i })).toBeTruthy()
  })

  it('opens and changes the "from" month/year', async () => {
    const user = userEvent.setup()
    render(<RangeSelector />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /Rango/i }))
    const [fromInput] = screen.getAllByRole('textbox')
    await user.clear(fromInput)
    await user.type(fromInput, '04/2026{enter}')
    expect(fromInput).toHaveValue('04/2026')
  })

  it('opens and changes the "to" month/year', async () => {
    const user = userEvent.setup()
    render(<RangeSelector />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /Rango/i }))
    const [, toInput] = screen.getAllByRole('textbox')
    await user.clear(toInput)
    await user.type(toInput, '09/2028{enter}')
    expect(toInput).toHaveValue('09/2028')
  })
})
