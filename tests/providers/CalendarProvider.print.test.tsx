import { describe, it, expect, afterEach } from 'vitest'
import { act, render } from '@testing-library/react'
import { CalendarProvider, useCalendar } from '@/app/providers/CalendarProvider'
import '@/app/providers/i18n'

const PRINT_STYLE_ID = 'calendar-print-style'

function Probe() {
  const { paperSize, orientation, setPaperSize, setOrientation } = useCalendar()
  return (
    <div>
      <span data-testid="paper">{paperSize}</span>
      <span data-testid="orientation">{orientation}</span>
      <button onClick={() => setPaperSize('letter')}>set-letter</button>
      <button onClick={() => setOrientation('landscape')}>set-landscape</button>
    </div>
  )
}

afterEach(() => {
  document.getElementById(PRINT_STYLE_ID)?.remove()
})

describe('CalendarProvider @page injection', () => {
  it('injects a @page style on mount', () => {
    render(
      <CalendarProvider>
        <Probe />
      </CalendarProvider>
    )
    const el = document.getElementById(PRINT_STYLE_ID)
    expect(el).toBeTruthy()
    expect(el?.textContent).toContain('@page')
    expect(el?.textContent).toContain('size:')
    expect(el?.textContent).toContain('a4 portrait')
  })

  it('updates @page style when paper or orientation changes', () => {
    render(
      <CalendarProvider>
        <Probe />
      </CalendarProvider>
    )
    act(() => {
      document.querySelector<HTMLButtonElement>('button')?.click()
    })
    let el = document.getElementById(PRINT_STYLE_ID)
    expect(el?.textContent).toContain('letter portrait')

    act(() => {
      document.querySelectorAll<HTMLButtonElement>('button')[1]?.click()
    })
    el = document.getElementById(PRINT_STYLE_ID)
    expect(el?.textContent).toContain('letter landscape')
  })

  it('uses the configured print margin', () => {
    render(
      <CalendarProvider>
        <Probe />
      </CalendarProvider>,
    )
    const el = document.getElementById(PRINT_STYLE_ID)
    expect(el?.textContent).toContain('margin: 10mm')
  })
})
