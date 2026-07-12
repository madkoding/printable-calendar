import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import es from '@/i18n/locales/es/translation.json'
import en from '@/i18n/locales/en/translation.json'
import pt from '@/i18n/locales/pt/translation.json'
import fr from '@/i18n/locales/fr/translation.json'
import de from '@/i18n/locales/de/translation.json'

const translationSchema: z.ZodType<Record<string, string | Record<string, unknown>>> = z.lazy(
  (): z.ZodType<Record<string, string | Record<string, unknown>>> =>
    z.record(
      z.string(),
      z.lazy((): z.ZodType<string | Record<string, unknown>> => z.union([z.string(), translationSchema])),
    ),
)


const locales: [string, unknown][] = [
  ['es', es],
  ['en', en],
  ['pt', pt],
  ['fr', fr],
  ['de', de],
]

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

describe('i18n contract', () => {
  it('all locales parse against schema', () => {
    for (const [, data] of locales) {
      const result = translationSchema.safeParse(data)
      expect(result.success).toBe(true)
    }
  })

  it('all locales have the same top-level keys', () => {
    const [first, ...rest] = locales
    const baseKeys = Object.keys(first[1] as Record<string, unknown>).sort()

    for (const [, data] of rest) {
      const keys = Object.keys(data as Record<string, unknown>).sort()
      expect(keys).toEqual(baseKeys)
    }
  })

  it('all locales have exactly the same flattened key set', () => {
    const baseKeys = flattenKeys(es as Record<string, unknown>).sort()

    for (const [, data] of locales.slice(1)) {
      const keys = flattenKeys(data as Record<string, unknown>).sort()
      expect(keys).toEqual(baseKeys)
    }
  })
})
