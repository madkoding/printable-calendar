import { createContext, useContext, useState, type ReactNode } from 'react'
import { DEFAULT_PALETTE } from '@/config/palettes'
import { DEFAULT_FONT } from '@/config/fonts'

interface ThemeContextType {
  paletteId: string
  setPalette: (p: string) => void
  fontId: string
  setFontId: (f: string) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [paletteId, setPalette] = useState(DEFAULT_PALETTE)
  const [fontId, setFontId] = useState(DEFAULT_FONT)
  return (
    <ThemeContext.Provider value={{ paletteId, setPalette, fontId, setFontId }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
