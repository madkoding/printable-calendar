import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrintButton } from '@/presentation/components/controls/PrintButton'
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

describe('PrintButton', () => {
  it('renders print button', () => {
    render(<PrintButton />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Imprimir/i })).toBeTruthy()
  })

  it('calls window.print on click', () => {
    const printMock = vi.fn()
    const originalPrint = window.print
    window.print = printMock

    render(<PrintButton />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /imprimir/i }))
    expect(printMock).toHaveBeenCalledTimes(1)

    window.print = originalPrint
  })

  it('does not inject a temporary @page style on click', () => {
    const originalPrint = window.print
    window.print = vi.fn()
    const before = document.head.querySelectorAll('style').length

    render(<PrintButton />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /imprimir/i }))

    const after = document.head.querySelectorAll('style').length
    expect(after).toBe(before)

    window.print = originalPrint
  })
})
