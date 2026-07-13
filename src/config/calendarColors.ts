export const CALENDAR_COLORS: string[] = [
  '#2563eb', // blue
  '#16a34a', // green
  '#d97706', // amber
  '#dc2626', // red
  '#7c3aed', // violet
  '#0891b2', // cyan
  '#db2777', // pink
  '#4b5563', // slate
]

export function nextCalendarColor(usedCount: number): string {
  return CALENDAR_COLORS[usedCount % CALENDAR_COLORS.length]
}
