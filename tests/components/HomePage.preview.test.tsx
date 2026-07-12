import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HomePage } from '@/presentation/pages/HomePage'
import { CalendarProvider } from '@/app/providers/CalendarProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import '@/app/providers/i18n'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CalendarProvider>{children}</CalendarProvider>
    </ThemeProvider>
  )
}

describe('HomePage canvas preview', () => {
  it('renders the canvas preview container', () => {
    const { container } = render(<HomePage />, { wrapper: Wrapper })
    expect(container.querySelector('.canvas-preview')).toBeTruthy()
  })

  it('renders at least one canvas element', () => {
    const { container } = render(<HomePage />, { wrapper: Wrapper })
    expect(container.querySelectorAll('canvas').length).toBeGreaterThan(0)
  })

  it('renders sheet wrappers around canvases', () => {
    const { container } = render(<HomePage />, { wrapper: Wrapper })
    expect(container.querySelectorAll('.sheet').length).toBeGreaterThan(0)
  })
})
