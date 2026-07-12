export interface PaperSize {
  id: string
  nameKey: string
  width: string
  height: string
}

export const PAPER_SIZES: PaperSize[] = [
  { id: 'A4', nameKey: 'paper.a4', width: '210mm', height: '297mm' },
  { id: 'letter', nameKey: 'paper.letter', width: '215.9mm', height: '279.4mm' },
  { id: 'legal', nameKey: 'paper.legal', width: '215.9mm', height: '355.6mm' },
]

export type Orientation = 'portrait' | 'landscape'

export const DEFAULT_PAPER = 'A4'
export const DEFAULT_ORIENTATION: Orientation = 'portrait'
