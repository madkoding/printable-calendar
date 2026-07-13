import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportedCalendarsSection } from '@/presentation/components/controls/ImportedCalendarsSection'
import { ImportedCalendarsProvider } from '@/app/providers/ImportedCalendarsProvider'
import '@/app/providers/i18n'

const VALID_ICS = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:1\nDTSTART:20260101T000000Z\nSUMMARY:Test\nEND:VEVENT\nEND:VCALENDAR'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ImportedCalendarsProvider>{children}</ImportedCalendarsProvider>
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('ImportedCalendarsSection', () => {
  it('shows the empty state once expanded', async () => {
    const user = userEvent.setup()
    render(<ImportedCalendarsSection />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /Calendarios importados/i }))
    expect(screen.getByText(/Aún no hay calendarios importados/i)).toBeTruthy()
  })

  it('adds a calendar after uploading a valid .ics file', async () => {
    const user = userEvent.setup()
    render(<ImportedCalendarsSection />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /Calendarios importados/i }))
    await user.click(screen.getByText(/Agregar calendario/i))

    const file = new File([VALID_ICS], 'team.ics', { type: 'text/calendar' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('team.ics')).toBeTruthy()
    })
  })

  it('shows an error message when the uploaded file is invalid', async () => {
    const user = userEvent.setup()
    render(<ImportedCalendarsSection />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /Calendarios importados/i }))
    await user.click(screen.getByText(/Agregar calendario/i))

    const file = new File(['not an ics file'], 'bad.ics', { type: 'text/calendar' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/does not look like a valid iCalendar/i)).toBeTruthy()
    })
  })

  it('shows the show-recurring-events toggle only once a calendar exists', async () => {
    const user = userEvent.setup()
    render(<ImportedCalendarsSection />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /Calendarios importados/i }))
    expect(screen.queryByText(/Mostrar eventos recurrentes/i)).toBeNull()

    await user.click(screen.getByText(/Agregar calendario/i))
    const file = new File([VALID_ICS], 'team.ics', { type: 'text/calendar' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/Mostrar eventos recurrentes/i)).toBeTruthy()
    })
  })

  it('lets you hide and restore a specific event title for a calendar', async () => {
    const user = userEvent.setup()
    render(<ImportedCalendarsSection />, { wrapper: Wrapper })
    await user.click(screen.getByRole('button', { name: /Calendarios importados/i }))
    await user.click(screen.getByText(/Agregar calendario/i))

    const file = new File([VALID_ICS], 'team.ics', { type: 'text/calendar' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    await waitFor(() => screen.getByText('team.ics'))
    await user.click(screen.getByText('team.ics'))

    await waitFor(() => screen.getByText('Test'))
    const hideButton = screen.getByTitle('Ocultar este evento')
    await user.click(hideButton)

    expect(screen.getByText('Test').className).toContain('line-through')
    expect(screen.getByTitle('Volver a mostrar este evento')).toBeTruthy()

    await user.click(screen.getByTitle('Volver a mostrar este evento'))
    expect(screen.getByText('Test').className).not.toContain('line-through')
  })
})
