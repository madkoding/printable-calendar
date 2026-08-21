import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const lookupMock = vi.fn()

vi.mock('node:dns/promises', () => ({
  default: { lookup: (...args: unknown[]) => lookupMock(...args) },
}))

import { fetchIcs, IcsFetchError } from '../../../api/_lib/fetchIcs'

function fakeResponse(opts: { status?: number; chunks?: Uint8Array[] } = {}) {
  const { status = 200, chunks = [new TextEncoder().encode('BEGIN:VCALENDAR\nEND:VCALENDAR')] } = opts
  let i = 0
  return {
    status,
    ok: status >= 200 && status < 300,
    body: {
      getReader: () => ({
        read: async () => {
          if (i < chunks.length) return { done: false, value: chunks[i++] }
          return { done: true, value: undefined }
        },
        cancel: async () => {},
      }),
    },
  }
}

describe('fetchIcs', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    lookupMock.mockReset()
    lookupMock.mockResolvedValue([{ address: '93.184.216.34', family: 4 }])
    fetchMock = vi.fn().mockResolvedValue(fakeResponse())
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches a public https URL successfully', async () => {
    const text = await fetchIcs('https://example.com/calendar.ics')
    expect(text).toContain('BEGIN:VCALENDAR')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('normalizes webcal:// to https://', async () => {
    await fetchIcs('webcal://example.com/calendar.ics')
    const calledUrl = fetchMock.mock.calls[0][0] as URL
    expect(calledUrl.toString()).toBe('https://example.com/calendar.ics')
  })

  it('rejects non-http(s) schemes', async () => {
    await expect(fetchIcs('ftp://example.com/calendar.ics')).rejects.toThrow(IcsFetchError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects invalid URLs', async () => {
    await expect(fetchIcs('not a url')).rejects.toThrow(IcsFetchError)
  })

  it.each(['127.0.0.1', '10.0.0.5', '169.254.169.254', '192.168.1.1', '::1'])(
    'rejects private/internal address %s',
    async (address) => {
      lookupMock.mockResolvedValue([{ address, family: address.includes(':') ? 6 : 4 }])
      await expect(fetchIcs('https://internal.example.com/calendar.ics')).rejects.toThrow(IcsFetchError)
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  it('rejects when dns resolution fails', async () => {
    lookupMock.mockRejectedValue(new Error('ENOTFOUND'))
    await expect(fetchIcs('https://does-not-exist.example.com/calendar.ics')).rejects.toThrow(IcsFetchError)
  })

  it('rejects redirect responses instead of following them', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 302 }))
    await expect(fetchIcs('https://example.com/calendar.ics')).rejects.toThrow(IcsFetchError)
  })

  it('rejects non-ok upstream responses', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 404 }))
    await expect(fetchIcs('https://example.com/calendar.ics')).rejects.toThrow(IcsFetchError)
  })

  it('enforces a response size cap', async () => {
    const bigChunk = new Uint8Array(3 * 1024 * 1024)
    fetchMock.mockResolvedValue(fakeResponse({ chunks: [bigChunk] }))
    await expect(fetchIcs('https://example.com/calendar.ics')).rejects.toThrow(IcsFetchError)
  })
})
