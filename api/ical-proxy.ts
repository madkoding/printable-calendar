import type { VercelRequest, VercelResponse } from './_lib/types.js'
import { fetchIcs, IcsFetchError } from './_lib/fetchIcs.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query

  if (typeof url !== 'string' || !url) {
    res.status(400).json({ error: 'Missing url parameter' })
    return
  }

  try {
    const text = await fetchIcs(url)
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).send(text)
  } catch (err) {
    const message = err instanceof IcsFetchError ? err.message : 'Failed to fetch calendar'
    res.status(400).json({ error: message })
  }
}
