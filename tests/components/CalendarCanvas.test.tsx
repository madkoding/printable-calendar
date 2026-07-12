import { describe, it, expect } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { CalendarCanvas } from '@/presentation/components/calendar/CalendarCanvas'
import { CalendarProvider, useCalendar } from '@/app/providers/CalendarProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import '@/app/providers/i18n'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CalendarProvider>{children}</CalendarProvider>
    </ThemeProvider>
  )
}

function PagesController({ children }: { children: React.ReactNode }) {
  const { setFrom, setTo, setPagesPerSheet } = useCalendar()
  return (
    <div>
      <button
        data-testid="expand-range"
        onClick={() => {
          const now = new Date()
          const startMonth = now.getMonth()
          const startYear = now.getFullYear()
          const endMonth = (startMonth + 2) % 12
          const endYear = startYear + (startMonth + 2 >= 12 ? 1 : 0)
          setFrom({ month: startMonth, year: startYear })
          setTo({ month: endMonth, year: endYear })
        }}
      >
        expand
      </button>
      <button data-testid="set-1" onClick={() => setPagesPerSheet(1)}>1</button>
      <button data-testid="set-2" onClick={() => setPagesPerSheet(2)}>2</button>
      <button data-testid="set-4" onClick={() => setPagesPerSheet(4)}>4</button>
      {children}
    </div>
  )
}

describe('CalendarCanvas', () => {
  it('renders a canvas per month by default', () => {
    const { container } = render(<CalendarCanvas />, { wrapper: Wrapper })
    const canvases = container.querySelectorAll('canvas')
    expect(canvases.length).toBeGreaterThan(0)
  })

  it('canvas elements have logical paper dimensions', () => {
    const { container } = render(<CalendarCanvas />, { wrapper: Wrapper })
    const canvas = container.querySelector('canvas') as HTMLCanvasElement
    expect(canvas).toBeTruthy()
    expect(canvas.width).toBeGreaterThan(0)
    expect(canvas.height).toBeGreaterThan(0)
  })

  it('wraps canvases in a scrollable preview container', () => {
    const { container } = render(<CalendarCanvas />, { wrapper: Wrapper })
    expect(container.querySelector('.canvas-preview')).toBeTruthy()
  })

  it('reduces the number of sheets when pagesPerSheet increases', () => {
    const { container } = render(
      <PagesController>
        <CalendarCanvas />
      </PagesController>,
      { wrapper: Wrapper },
    )

    fireEvent.click(screen.getByTestId('expand-range'))
    const sheetsWithOnePerSheet = container.querySelectorAll('.sheet').length
    expect(sheetsWithOnePerSheet).toBeGreaterThan(1)

    fireEvent.click(screen.getByTestId('set-2'))
    const sheetsWithTwo = container.querySelectorAll('.sheet').length
    expect(sheetsWithTwo).toBeLessThanOrEqual(Math.ceil(sheetsWithOnePerSheet / 2))

    fireEvent.click(screen.getByTestId('set-4'))
    const sheetsWithFour = container.querySelectorAll('.sheet').length
    expect(sheetsWithFour).toBeLessThanOrEqual(Math.ceil(sheetsWithOnePerSheet / 4))
  })
})
