export interface TemplateConfig {
  id: string
  nameKey: string
}

export const TEMPLATES: TemplateConfig[] = [
  { id: 'monthly', nameKey: 'templates.monthly' },
  { id: 'weekly', nameKey: 'templates.weekly' },
  { id: 'yearly', nameKey: 'templates.yearly' },
]

export const DEFAULT_TEMPLATE = 'monthly'
