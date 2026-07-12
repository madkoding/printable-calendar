export interface FontOption {
  id: string
  nameKey: string
  family: string
}

export const FONTS: FontOption[] = [
  { id: 'sans', nameKey: 'fonts.sans', family: 'sans-serif' },
  { id: 'serif', nameKey: 'fonts.serif', family: 'serif' },
  { id: 'mono', nameKey: 'fonts.mono', family: 'monospace' },
  { id: 'arial', nameKey: 'fonts.arial', family: 'Arial, sans-serif' },
  { id: 'georgia', nameKey: 'fonts.georgia', family: 'Georgia, serif' },
  { id: 'times', nameKey: 'fonts.times', family: '"Times New Roman", serif' },
  { id: 'courier', nameKey: 'fonts.courier', family: '"Courier New", monospace' },
  { id: 'verdana', nameKey: 'fonts.verdana', family: 'Verdana, sans-serif' },
  { id: 'trebuchet', nameKey: 'fonts.trebuchet', family: '"Trebuchet MS", sans-serif' },
  { id: 'comic', nameKey: 'fonts.comic', family: '"Comic Sans MS", cursive' },
]

export const DEFAULT_FONT = 'sans'
