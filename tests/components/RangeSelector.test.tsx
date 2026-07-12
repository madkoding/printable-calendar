import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RangeSelector } from '@/presentation/components/controls/RangeSelector'
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

describe('RangeSelector', () => {
  it('renders collapsed header with current range summary', () => {
    render(<RangeSelector />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /controls\.range/i })).toBeTruthy()
  })

  it('opens and changes from month', async () => {
    const user = userEvent.setup()
    render(<RangeSelector />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /controls\.range/i }))
    const fromSelect = screen.getByLabelText('Desde')
    await user.selectOptions(fromSelect, '3')
    expect(fromSelect).toHaveValue('3')
  })

  it('opens and changes to year', async () => {
    const user = userEvent.setup()
    render(<RangeSelector />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /controls\.range/i }))
    const toYearSelect = screen.getByLabelText('Año hasta')
    await user.selectOptions(toYearSelect, '2028')
    expect(toYearSelect).toHaveValue('2028')
  })
})
