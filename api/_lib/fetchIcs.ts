import dns from 'node:dns/promises'
import net from 'node:net'

const FETCH_TIMEOUT_MS = 8_000
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024

export class IcsFetchError extends Error {}

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
}

const PRIVATE_IPV4_RANGES: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]

function isPrivateIPv4(ip: string): boolean {
  const int = ipv4ToInt(ip)
  return PRIVATE_IPV4_RANGES.some(([base, bits]) => {
    const baseInt = ipv4ToInt(base)
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
    return (int & mask) === (baseInt & mask)
  })
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase()
  if (normalized === '::1' || normalized === '::') return true
  if (/^fe[89ab][0-9a-f]:/.test(normalized)) return true // fe80::/10 link-local
  if (/^f[cd][0-9a-f]{2}:/.test(normalized)) return true // fc00::/7 unique local
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateIPv4(mapped[1])
  return false
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip)
  if (net.isIPv6(ip)) return isPrivateIPv6(ip)
  return true
}

function normalizeUrl(input: string): URL {
  let raw = input.trim()
  if (raw.startsWith('webcal://')) raw = `https://${raw.slice('webcal://'.length)}`

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new IcsFetchError('Invalid URL')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new IcsFetchError('Only http(s) and webcal URLs are supported')
  }
  return url
}

async function assertPublicHost(hostname: string): Promise<void> {
  let records: { address: string }[]
  try {
    records = await dns.lookup(hostname, { all: true })
  } catch {
    throw new IcsFetchError('Could not resolve host')
  }
  if (records.length === 0 || records.some((r) => isPrivateIp(r.address))) {
    throw new IcsFetchError('Refusing to fetch from a private or internal address')
  }
}

async function readWithLimit(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return await res.text()

  const decoder = new TextDecoder()
  let result = ''
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    if (received > maxBytes) {
      await reader.cancel()
      throw new IcsFetchError('Calendar response exceeded the size limit')
    }
    result += decoder.decode(value, { stream: true })
  }
  result += decoder.decode()
  return result
}

export async function fetchIcs(rawUrl: string): Promise<string> {
  const url = normalizeUrl(rawUrl)
  await assertPublicHost(url.hostname)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    let res: Response
    try {
      res = await fetch(url, { signal: controller.signal, redirect: 'manual' })
    } catch {
      throw new IcsFetchError('Failed to reach the calendar URL')
    }

    if (res.status >= 300 && res.status < 400) {
      throw new IcsFetchError('Redirects are not followed for security reasons')
    }
    if (!res.ok) {
      throw new IcsFetchError(`Upstream responded with ${res.status}`)
    }

    return await readWithLimit(res, MAX_RESPONSE_BYTES)
  } finally {
    clearTimeout(timeout)
  }
}
