import type { CalendarGrid, CalendarDay } from '@/domain/calendar/entities/Calendar'
import type { Palette } from '@/config/palettes'

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

const MM_TO_PX = 96 / 25.4

export interface CanvasWeekPage {
  weekNumber: number
  label: string
  days: (CalendarDay | null)[]
  dateObjs: Date[]
}

export interface CanvasYearPage {
  year: number
  grids: CalendarGrid[]
}

interface PageMetrics {
  paperW: number
  paperH: number
  margin: number
  innerW: number
  innerH: number
}

export function mmToPx(mm: number): number {
  return mm * MM_TO_PX
}

function metrics(paperW: number, paperH: number, marginMm: number): PageMetrics {
  const margin = mmToPx(marginMm)
  return { paperW, paperH, margin, innerW: paperW - margin * 2, innerH: paperH - margin * 2 }
}

function fitText(ctx: CanvasRenderingContext2D, text: string, font: string, maxWidth: number): string {
  ctx.font = font
  if (ctx.measureText(text).width <= maxWidth) return font
  const sizeMatch = font.match(/(\d+(?:\.\d+)?)px/)
  let size = sizeMatch ? Number.parseFloat(sizeMatch[1]) : 12
  while (size > 6) {
    size -= 0.5
    const shrunk = font.replace(/\d+(?:\.\d+)?px/, `${size}px`)
    ctx.font = shrunk
    if (ctx.measureText(text).width <= maxWidth) return shrunk
  }
  return font.replace(/\d+(?:\.\d+)?px/, `6px`)
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: string,
  color: string,
  align: CanvasTextAlign = 'left',
  baseline: CanvasTextBaseline = 'alphabetic'
): void {
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline
  const fitted = fitText(ctx, text, font, maxWidth)
  ctx.font = fitted
  ctx.fillText(text, x, y, maxWidth)
}

function fillRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function strokeRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, lineWidth = 1): void {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.strokeRect(x, y, w, h)
}

function drawWritingLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lineColor: string,
  spacing: number,
  style: 'solid' | 'dotted' | 'dashed' = 'solid'
): void {
  ctx.strokeStyle = lineColor
  ctx.lineWidth = 1
  if (style === 'dotted') ctx.setLineDash([2, 4])
  else if (style === 'dashed') ctx.setLineDash([6, 4])
  else ctx.setLineDash([])
  ctx.beginPath()
  let cy = y + spacing
  while (cy < y + h - 2) {
    ctx.moveTo(x + 2, cy)
    ctx.lineTo(x + w - 2, cy)
    cy += spacing
  }
  ctx.stroke()
  ctx.setLineDash([])
}

function dayName(t: (k: string) => string, index: number): string {
  return t(`weekdays.${DAY_KEYS[index]}`)
}

function dayInitial(t: (k: string) => string, index: number): string {
  return dayName(t, index).charAt(0)
}

function transformText(text: string, transform: 'uppercase' | 'capitalize' | 'none'): string {
  if (transform === 'uppercase') return text.toUpperCase()
  if (transform === 'capitalize') return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  return text
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  if (r === 0) {
    ctx.rect(x, y, w, h)
    return
  }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawDayCell(
  ctx: CanvasRenderingContext2D,
  day: CalendarDay | null,
  x: number,
  y: number,
  w: number,
  h: number,
  pal: Palette,
  t: (k: string) => string,
  opts: { numberSize?: number; holidaySize?: number; lineSpacing?: number; header?: boolean } = {}
): void {
  const header = opts.header ?? false
  const isFree = day && (day.isWeekend || day.holiday)
  const ns = opts.numberSize ?? pal.numberSize
  const hs = opts.holidaySize ?? Math.max(8, ns * 0.65)
  const ls = opts.lineSpacing ?? (pal.spacing === 'compact' ? 14 : pal.spacing === 'spacious' ? 22 : 18)

  if (pal.dayCellStyle === 'minimal') {
    if (day) {
      fillRect(ctx, x, y, w, h, isFree ? pal.weekendBg : 'white')
    }
  } else if (pal.dayCellStyle === 'bordered') {
    if (day) {
      fillRect(ctx, x, y, w, h, isFree ? pal.weekendBg : 'white')
    }
    ctx.strokeStyle = pal.cellBorder
    ctx.lineWidth = pal.cellBorderWidth
    roundRect(ctx, x + 1, y + 1, w - 2, h - 2, pal.cellRadius)
    ctx.stroke()
  } else {
    if (day) {
      fillRect(ctx, x, y, w, h, isFree ? pal.weekendBg : 'white')
    } else {
      fillRect(ctx, x, y, w, h, pal.emptyBg)
    }
    strokeRect(ctx, x, y, w, h, pal.cellBorder, pal.cellBorderWidth)
  }

  if (header) return
  if (!day) return

  const numberColor = isFree ? pal.weekendDayNumber : pal.dayNumber
  drawText(ctx, String(day.date), x + 4, y + ns + 2, w - 8, `${pal.numberWeight} ${ns}px ${pal.fontFamily}`, numberColor)

  if (day.saint) {
    const saintSize = Math.max(5, hs - 2)
    const words = day.saint.split(' ')
    const dateW = ctx.measureText(String(day.date)).width + 8
    const availW = w - dateW - 8
    if (words.length <= 2) {
      drawText(ctx, day.saint, x + w - 4, y + ns + 1, availW, `${pal.numberWeight} ${saintSize}px ${pal.fontFamily}`, '#9ca3af', 'right')
    } else {
      const mid = Math.ceil(words.length / 2)
      const line1 = words.slice(0, mid).join(' ')
      const line2 = words.slice(mid).join(' ')
      drawText(ctx, line1, x + w - 4, y + ns + 1, availW, `${pal.numberWeight} ${saintSize}px ${pal.fontFamily}`, '#9ca3af', 'right')
      drawText(ctx, line2, x + w - 4, y + ns + saintSize + 3, availW, `${pal.numberWeight} ${saintSize}px ${pal.fontFamily}`, '#9ca3af', 'right')
    }
  }

  if (day.holiday) {
    const label = t(`holidays.${day.holiday.id}`)
    const holidayY = y + ns + hs + 6
    ctx.fillStyle = pal.holidayBg
    const padding = 2
    ctx.font = `${pal.numberWeight} ${hs}px ${pal.fontFamily}`
    const textMetrics = ctx.measureText(label)
    const boxW = Math.min(w - 8, textMetrics.width + padding * 2)
    const boxH = hs + padding * 2
    roundRect(ctx, x + 4, holidayY - hs - padding, boxW, boxH, 2)
    ctx.fill()
    drawText(ctx, label, x + 4 + padding, holidayY - padding, boxW - padding * 2, `${pal.numberWeight} ${hs}px ${pal.fontFamily}`, pal.holidayText)
    if (pal.showWritingLines) {
      drawWritingLines(ctx, x + 4, holidayY + 4, w - 8, h - (holidayY - y) - 8, pal.writingLine, ls, pal.writingLineStyle)
    }
  } else if (pal.showWritingLines) {
    drawWritingLines(ctx, x + 4, y + ns + 8, w - 8, h - ns - 12, pal.writingLine, ls, pal.writingLineStyle)
  }
}

function drawMonthHeader(ctx: CanvasRenderingContext2D, grid: CalendarGrid, m: PageMetrics, pal: Palette): void {
  const title = transformText(`${grid.monthName} ${grid.year}`, pal.titleTransform)
  drawText(ctx, title, m.margin + m.innerW / 2, m.margin + 32, m.innerW, `${pal.titleWeight} ${pal.titleSize}px ${pal.fontFamily}`, '#374151', 'center')
}

function drawNotesSection(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  pal: Palette,
  t: (k: string) => string,
  compact: boolean,
  showNotes: boolean
): void {
  if (!showNotes) return
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w, y)
  ctx.stroke()

  const titleSize = compact ? 10 : 14
  const lineSpacing = compact ? 14 : 22
  drawText(ctx, t('notes.title'), x, y + titleSize + 4, w, `bold ${titleSize}px ${pal.fontFamily}`, '#1f2937')
  if (pal.showWritingLines) {
    drawWritingLines(ctx, x, y + titleSize + 12, w, h - titleSize - 14, pal.writingLine, lineSpacing, pal.writingLineStyle)
  }
}

export function drawMonthSheet(
  ctx: CanvasRenderingContext2D,
  grid: CalendarGrid,
  pal: Palette,
  t: (k: string) => string,
  paperW: number,
  paperH: number,
  marginMm = 10,
  showNotes = true
): void {
  const m = metrics(paperW, paperH, marginMm)
  fillRect(ctx, 0, 0, m.paperW, m.paperH, 'white')

  drawMonthHeader(ctx, grid, m, pal)

  const headerY = m.margin + 48
  const headerH = pal.headerHeight
  const weeks = grid.weeks.length
  const gridTop = headerY + headerH
  const notesHeight = Math.max(50, m.innerH * 0.15)
  const gridH = m.margin + m.innerH - gridTop - notesHeight
  const cellW = m.innerW / 7
  const cellH = gridH / weeks

  for (let i = 0; i < 7; i++) {
    if (pal.headerStyle === 'minimal') {
      strokeRect(ctx, m.margin + i * cellW, headerY, cellW, headerH, pal.cellBorder, pal.cellBorderWidth)
      drawText(ctx, transformText(dayName(t, i), pal.headerTransform), m.margin + i * cellW + cellW / 2, headerY + headerH / 2 + 5, cellW - 4, `${pal.headerWeight} 14px ${pal.fontFamily}`, pal.headerText, 'center')
    } else if (pal.headerStyle === 'outlined') {
      const bg = i >= 5 ? pal.weekendHeaderBg : pal.headerBg
      strokeRect(ctx, m.margin + i * cellW, headerY, cellW, headerH, bg, 2)
      drawText(ctx, transformText(dayName(t, i), pal.headerTransform), m.margin + i * cellW + cellW / 2, headerY + headerH / 2 + 5, cellW - 4, `${pal.headerWeight} ${pal.numberSize - 2}px ${pal.fontFamily}`, bg, 'center')
    } else {
      const bg = i >= 5 ? pal.weekendHeaderBg : pal.headerBg
      fillRect(ctx, m.margin + i * cellW, headerY, cellW, headerH, bg)
      strokeRect(ctx, m.margin + i * cellW, headerY, cellW, headerH, pal.cellBorder, pal.cellBorderWidth)
      drawText(ctx, transformText(dayName(t, i), pal.headerTransform), m.margin + i * cellW + cellW / 2, headerY + headerH / 2 + 5, cellW - 4, `${pal.headerWeight} ${pal.numberSize - 2}px ${pal.fontFamily}`, pal.headerText, 'center')
    }
  }

  for (let wi = 0; wi < weeks; wi++) {
    for (let di = 0; di < 7; di++) {
      const day = grid.weeks[wi].days[di]
      const x = m.margin + di * cellW
      const y = gridTop + wi * cellH
      drawDayCell(ctx, day, x, y, cellW, cellH, pal, t, { numberSize: pal.numberSize, holidaySize: Math.max(8, pal.numberSize * 0.65), lineSpacing: pal.spacing === 'compact' ? 14 : pal.spacing === 'spacious' ? 22 : 18 })
    }
  }

  drawNotesSection(ctx, m.margin, gridTop + gridH + 4, m.innerW, notesHeight - 4, pal, t, false, showNotes)
}

export function drawWeekSheet(
  ctx: CanvasRenderingContext2D,
  page: CanvasWeekPage,
  pal: Palette,
  t: (k: string) => string,
  paperW: number,
  paperH: number,
  marginMm = 10,
  orientation: 'portrait' | 'landscape' = 'portrait',
  showNotes = true
): void {
  const m = metrics(paperW, paperH, marginMm)
  fillRect(ctx, 0, 0, m.paperW, m.paperH, 'white')

  const title = `${t('templates.weekly')} ${page.weekNumber} · ${page.label}`
  drawText(ctx, title, m.margin + m.innerW / 2, m.margin + 24, m.innerW, `${pal.titleWeight} ${Math.min(pal.titleSize, 16)}px ${pal.fontFamily}`, '#374151', 'center')

  const contentTop = m.margin + 34
  const notesHeight = Math.max(32, m.innerH * 0.1)
  const contentH = m.margin + m.innerH - contentTop - notesHeight

  if (orientation === 'landscape') {
    drawLandscapeWeek(ctx, page, m, contentTop, contentH, pal, t)
  } else {
    drawPortraitWeek(ctx, page, m, contentTop, contentH, pal, t)
  }

  drawNotesSection(ctx, m.margin, contentTop + contentH + 4, m.innerW, notesHeight - 4, pal, t, true, showNotes)
}

function drawPortraitWeek(
  ctx: CanvasRenderingContext2D,
  page: CanvasWeekPage,
  m: PageMetrics,
  top: number,
  h: number,
  pal: Palette,
  t: (k: string) => string
): void {
  const gap = 4
  const cols = 2
  const rows = 4
  const cellW = (m.innerW - gap) / cols
  const cellH = (h - gap * (rows - 1)) / rows

  const layout = [
    { col: 0, row: 0, spanRows: 1 },
    { col: 0, row: 1, spanRows: 1 },
    { col: 0, row: 2, spanRows: 1 },
    { col: 0, row: 3, spanRows: 1 },
    { col: 1, row: 0, spanRows: 2 },
    { col: 1, row: 2, spanRows: 1 },
    { col: 1, row: 3, spanRows: 1 },
  ]

  for (let di = 0; di < 7; di++) {
    const day = page.days[di]
    const date = page.dateObjs[di]
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const isFree = isWeekend || Boolean(day?.holiday)
    const { col, row, spanRows } = layout[di]
    const x = m.margin + col * (cellW + gap)
    const y = top + row * (cellH + gap)
    const w = cellW
    const height = cellH * spanRows + gap * (spanRows - 1)

    fillRect(ctx, x, y, w, height, isFree ? pal.weekendBg : 'white')
    strokeRect(ctx, x, y, w, height, pal.cellBorder, pal.cellBorderWidth)

    const color = isFree ? pal.weekendDayNumber : pal.dayNumber
    const labelSize = Math.max(9, pal.numberSize - 5)
    const numSize = Math.max(12, pal.numberSize - 2)
    drawText(ctx, transformText(dayName(t, di), pal.headerTransform), x + 6, y + 14, w / 2 - 8, `${pal.headerWeight} ${labelSize}px ${pal.fontFamily}`, color)
    drawText(ctx, String(date.getDate()), x + w - 6, y + 16, w / 2 - 8, `${pal.numberWeight} ${numSize}px ${pal.fontFamily}`, color, 'right')

    if (day?.saint) {
      const saintSize = Math.max(8, numSize * 0.7)
      const dateW = ctx.measureText(String(date.getDate())).width + 4
      drawText(ctx, day.saint, x + w - 6 - dateW, y + 15, w / 2 - 8, `${pal.numberWeight} ${saintSize}px ${pal.fontFamily}`, '#9ca3af', 'right')
    }

    if (day?.holiday) {
      const label = t(`holidays.${day.holiday.id}`)
      ctx.fillStyle = pal.holidayBg
      const boxY = y + 22
      const padding = 2
      ctx.font = `${pal.numberWeight} 8px ${pal.fontFamily}`
      const boxW = Math.min(w - 12, ctx.measureText(label).width + padding * 2)
      const boxH = 10
      roundRect(ctx, x + 6, boxY, boxW, boxH, 2)
      ctx.fill()
      drawText(ctx, label, x + 6 + padding, boxY + 8, boxW - padding * 2, `${pal.numberWeight} 8px ${pal.fontFamily}`, pal.holidayText)
      if (pal.showWritingLines) {
        drawWritingLines(ctx, x + 6, boxY + 16, w - 12, height - 24, pal.writingLine, 14, pal.writingLineStyle)
      }
    } else if (pal.showWritingLines) {
      drawWritingLines(ctx, x + 6, y + 24, w - 12, height - 30, pal.writingLine, 14, pal.writingLineStyle)
    }
  }
}

function drawLandscapeWeek(
  ctx: CanvasRenderingContext2D,
  page: CanvasWeekPage,
  m: PageMetrics,
  top: number,
  h: number,
  pal: Palette,
  t: (k: string) => string
): void {
  const gap = 4
  const weights = [1, 1, 1, 1, 1, 0.6, 0.6]
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let x = m.margin

  for (let di = 0; di < 7; di++) {
    const day = page.days[di]
    const date = page.dateObjs[di]
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const isFree = isWeekend || Boolean(day?.holiday)
    const w = ((m.innerW - gap * (weights.length - 1)) * weights[di]) / totalWeight

    fillRect(ctx, x, top, w, h, isFree ? pal.weekendBg : 'white')
    strokeRect(ctx, x, top, w, h, pal.cellBorder, pal.cellBorderWidth)

    const color = isFree ? pal.weekendDayNumber : pal.dayNumber
    const labelSize = Math.max(9, pal.numberSize - 5)
    const numSize = Math.max(12, pal.numberSize - 2)
    drawText(ctx, transformText(dayName(t, di), pal.headerTransform), x + 6, top + 14, w / 2 - 8, `${pal.headerWeight} ${labelSize}px ${pal.fontFamily}`, color)
    drawText(ctx, String(date.getDate()), x + w - 6, top + 16, w / 2 - 8, `${pal.numberWeight} ${numSize}px ${pal.fontFamily}`, color, 'right')

    if (day?.saint) {
      const saintSize = Math.max(8, numSize * 0.7)
      const dateW = ctx.measureText(String(date.getDate())).width + 4
      drawText(ctx, day.saint, x + w - 6 - dateW, top + 15, w / 2 - 8, `${pal.numberWeight} ${saintSize}px ${pal.fontFamily}`, '#9ca3af', 'right')
    }

    if (day?.holiday) {
      const label = t(`holidays.${day.holiday.id}`)
      ctx.fillStyle = pal.holidayBg
      const boxY = top + 22
      const padding = 2
      ctx.font = `${pal.numberWeight} 8px ${pal.fontFamily}`
      const boxW = Math.min(w - 12, ctx.measureText(label).width + padding * 2)
      const boxH = 10
      roundRect(ctx, x + 6, boxY, boxW, boxH, 2)
      ctx.fill()
      drawText(ctx, label, x + 6 + padding, boxY + 8, boxW - padding * 2, `${pal.numberWeight} 8px ${pal.fontFamily}`, pal.holidayText)
      if (pal.showWritingLines) {
        drawWritingLines(ctx, x + 6, boxY + 16, w - 12, h - 28, pal.writingLine, 14, pal.writingLineStyle)
      }
    } else if (pal.showWritingLines) {
      drawWritingLines(ctx, x + 6, top + 24, w - 12, h - 30, pal.writingLine, 14, pal.writingLineStyle)
    }

    x += w + gap
  }
}

function drawMiniWeek(
  ctx: CanvasRenderingContext2D,
  page: CanvasWeekPage,
  x: number,
  y: number,
  w: number,
  h: number,
  pal: Palette,
  t: (k: string) => string,
): void {
  fillRect(ctx, x, y, w, h, 'white')
  strokeRect(ctx, x, y, w, h, pal.cellBorder, pal.cellBorderWidth)

  const title = `${t('templates.weekly')} ${page.weekNumber} · ${page.label}`
  const titleH = h * 0.12
  const titleSize = Math.max(8, Math.min(13, h * 0.05))
  drawText(ctx, title, x + w / 2, y + titleH * 0.7, w - 8, `${pal.titleWeight} ${titleSize}px ${pal.fontFamily}`, '#374151', 'center')

  const contentTop = y + titleH
  const contentH = h - titleH
  const gap = 2

  const landscape = w > h
  if (landscape) {
    const dayW = (w - gap * 6) / 7
    const labelSize = Math.max(7, Math.min(10, contentH * 0.08))
    const numberSize = Math.max(8, Math.min(12, contentH * 0.1))
    const holidaySize = Math.max(6, Math.min(8, contentH * 0.06))

    for (let di = 0; di < 7; di++) {
      const day = page.days[di]
      const date = page.dateObjs[di]
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const isFree = isWeekend || Boolean(day?.holiday)
      const dx = x + di * (dayW + gap)

      fillRect(ctx, dx, contentTop, dayW, contentH, isFree ? pal.weekendBg : 'white')
      strokeRect(ctx, dx, contentTop, dayW, contentH, pal.cellBorder, pal.cellBorderWidth)

      const color = isFree ? pal.weekendDayNumber : pal.dayNumber
      drawText(ctx, dayName(t, di).charAt(0).toUpperCase(), dx + dayW / 2, contentTop + labelSize + 4, dayW - 2, `${pal.headerWeight} ${labelSize}px ${pal.fontFamily}`, color, 'center')
      drawText(ctx, String(date.getDate()), dx + dayW / 2, contentTop + labelSize + numberSize + 8, dayW - 2, `${pal.numberWeight} ${numberSize}px ${pal.fontFamily}`, color, 'center')

      if (day?.holiday) {
        const label = t(`holidays.${day.holiday.id}`)
        ctx.fillStyle = pal.holidayBg
        const boxY = contentTop + labelSize + numberSize + 14
        ctx.font = `${pal.numberWeight} ${holidaySize}px ${pal.fontFamily}`
        const boxW = Math.min(dayW - 4, ctx.measureText(label).width + 4)
        const boxH = holidaySize + 4
        roundRect(ctx, dx + 2, boxY, boxW, boxH, 1)
        ctx.fill()
        drawText(ctx, label, dx + 4, boxY + holidaySize + 1, boxW - 4, `${pal.numberWeight} ${holidaySize}px ${pal.fontFamily}`, pal.holidayText)
        if (pal.showWritingLines) {
          drawWritingLines(ctx, dx + 2, boxY + boxH + 4, dayW - 4, contentH - (boxY + boxH - contentTop) - 8, pal.writingLine, contentH * 0.12, pal.writingLineStyle)
        }
      } else if (pal.showWritingLines) {
        drawWritingLines(ctx, dx + 2, contentTop + labelSize + numberSize + 14, dayW - 4, contentH - labelSize - numberSize - 20, pal.writingLine, contentH * 0.12, pal.writingLineStyle)
      }
    }
  } else {
    const cols = 2
    const rows = 4
    const cellW = (w - gap) / cols
    const cellH = (contentH - gap * (rows - 1)) / rows

    const layout = [
      { col: 0, row: 0, spanRows: 1 },
      { col: 0, row: 1, spanRows: 1 },
      { col: 0, row: 2, spanRows: 1 },
      { col: 0, row: 3, spanRows: 1 },
      { col: 1, row: 0, spanRows: 2 },
      { col: 1, row: 2, spanRows: 1 },
      { col: 1, row: 3, spanRows: 1 },
    ]

    const labelSize = Math.max(7, Math.min(11, cellH * 0.1))
    const numberSize = Math.max(9, Math.min(14, cellH * 0.12))
    const holidaySize = Math.max(6, Math.min(9, cellH * 0.07))

    for (let di = 0; di < 7; di++) {
      const day = page.days[di]
      const date = page.dateObjs[di]
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const isFree = isWeekend || Boolean(day?.holiday)
      const { col, row, spanRows } = layout[di]
      const dx = x + col * (cellW + gap)
      const dy = contentTop + row * (cellH + gap)
      const dw = cellW
      const dh = cellH * spanRows + gap * (spanRows - 1)

      fillRect(ctx, dx, dy, dw, dh, isFree ? pal.weekendBg : 'white')
      strokeRect(ctx, dx, dy, dw, dh, pal.cellBorder, pal.cellBorderWidth)

      const color = isFree ? pal.weekendDayNumber : pal.dayNumber
      drawText(ctx, transformText(dayName(t, di), pal.headerTransform), dx + 6, dy + labelSize + 4, dw / 2 - 8, `${pal.headerWeight} ${labelSize}px ${pal.fontFamily}`, color)
      drawText(ctx, String(date.getDate()), dx + dw - 6, dy + labelSize + 6, dw / 2 - 8, `${pal.numberWeight} ${numberSize}px ${pal.fontFamily}`, color, 'right')

      if (day?.holiday) {
        const label = t(`holidays.${day.holiday.id}`)
        ctx.fillStyle = pal.holidayBg
        const boxY = dy + labelSize + numberSize + 10
        ctx.font = `${pal.numberWeight} ${holidaySize}px ${pal.fontFamily}`
        const boxW = Math.min(dw - 12, ctx.measureText(label).width + 4)
        const boxH = holidaySize + 4
        roundRect(ctx, dx + 6, boxY, boxW, boxH, 2)
        ctx.fill()
        drawText(ctx, label, dx + 8, boxY + holidaySize + 1, boxW - 4, `${pal.numberWeight} ${holidaySize}px ${pal.fontFamily}`, pal.holidayText)
        if (pal.showWritingLines) {
          drawWritingLines(ctx, dx + 6, boxY + boxH + 4, dw - 12, dh - (boxY + boxH - dy) - 10, pal.writingLine, cellH * 0.18, pal.writingLineStyle)
        }
      } else if (pal.showWritingLines) {
        drawWritingLines(ctx, dx + 6, dy + labelSize + numberSize + 12, dw - 12, dh - labelSize - numberSize - 18, pal.writingLine, cellH * 0.18, pal.writingLineStyle)
      }
    }
  }
}

function layoutGrid(
  pagesPerSheet: 1 | 2 | 4,
  orientation: 'portrait' | 'landscape',
): { cols: number; rows: number } {
  if (pagesPerSheet === 1) return { cols: 1, rows: 1 }
  if (pagesPerSheet === 4) return { cols: 2, rows: 2 }
  return orientation === 'landscape'
    ? { cols: 2, rows: 1 }
    : { cols: 1, rows: 2 }
}

export function drawMonthMultiPage(
  ctx: CanvasRenderingContext2D,
  grids: CalendarGrid[],
  pal: Palette,
  t: (k: string) => string,
  width: number,
  height: number,
  orientation: 'portrait' | 'landscape',
  pagesPerSheet: 1 | 2 | 4,
  showNotes = true,
): void {
  if (pagesPerSheet === 1) {
    drawMonthSheet(ctx, grids[0], pal, t, width, height, 0, showNotes)
    return
  }

  fillRect(ctx, 0, 0, width, height, 'white')

  const { cols, rows } = layoutGrid(pagesPerSheet, orientation)
  const gap = 8
  const cellW = (width - gap * (cols - 1)) / cols
  const cellH = (height - gap * (rows - 1)) / rows

  for (let i = 0; i < pagesPerSheet; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * (cellW + gap)
    const y = row * (cellH + gap)
    if (i < grids.length) {
      drawMiniMonth(ctx, grids[i], x, y, cellW, cellH, pal, t)
    }
    strokeRect(ctx, x, y, cellW, cellH, '#e5e7eb', 1)
  }
}

export function drawWeekMultiPage(
  ctx: CanvasRenderingContext2D,
  pages: CanvasWeekPage[],
  pal: Palette,
  t: (k: string) => string,
  width: number,
  height: number,
  orientation: 'portrait' | 'landscape',
  pagesPerSheet: 1 | 2 | 4,
  showNotes = true,
): void {
  if (pagesPerSheet === 1) {
    drawWeekSheet(ctx, pages[0], pal, t, width, height, 0, orientation, showNotes)
    return
  }

  fillRect(ctx, 0, 0, width, height, 'white')

  const { cols, rows } = layoutGrid(pagesPerSheet, orientation)
  const gap = 8
  const cellW = (width - gap * (cols - 1)) / cols
  const cellH = (height - gap * (rows - 1)) / rows

  for (let i = 0; i < pagesPerSheet; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * (cellW + gap)
    const y = row * (cellH + gap)
    if (i < pages.length) {
      drawMiniWeek(ctx, pages[i], x, y, cellW, cellH, pal, t)
    }
    strokeRect(ctx, x, y, cellW, cellH, '#e5e7eb', 1)
  }
}

export function drawYearSheet(
  ctx: CanvasRenderingContext2D,
  yearPage: CanvasYearPage,
  pal: Palette,
  t: (k: string) => string,
  paperW: number,
  paperH: number,
  marginMm = 10,
  orientation: 'portrait' | 'landscape' = 'portrait',
  showNotes = true
): void {
  const m = metrics(paperW, paperH, marginMm)
  fillRect(ctx, 0, 0, m.paperW, m.paperH, 'white')

  const cols = orientation === 'landscape' ? 4 : 3
  let top = m.margin
  if (yearPage.year !== 0) {
    drawText(ctx, String(yearPage.year), m.margin + m.innerW / 2, m.margin + 24, m.innerW, `${pal.titleWeight} ${pal.titleSize - 4}px ${pal.fontFamily}`, '#374151', 'center')
    top = m.margin + 34
  }

  const notesHeight = yearPage.year !== 0 ? Math.max(40, m.innerH * 0.12) : 0
  const grids = yearPage.grids
  const rows = Math.ceil(grids.length / cols)
  const gapX = 8
  const gapY = 8
  const cellW = (m.innerW - gapX * (cols - 1)) / cols
  const cellH = (m.margin + m.innerH - top - notesHeight - gapY * (rows - 1)) / rows

  for (let i = 0; i < grids.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = m.margin + col * (cellW + gapX)
    const y = top + row * (cellH + gapY)
    drawMiniMonth(ctx, grids[i], x, y, cellW, cellH, pal, t)
  }

  if (notesHeight > 0) {
    drawNotesSection(ctx, m.margin, top + rows * cellH + gapY * (rows - 1) + 4, m.innerW, notesHeight - 4, pal, t, true, showNotes)
  }
}

export function buildWeekPages(
  monthsInRange: { month: number; year: number }[],
  grids: CalendarGrid[],
  t: (k: string) => string,
): CanvasWeekPage[] {
  if (monthsInRange.length === 0 || grids.length === 0) return []

  const first = new Date(monthsInRange[0].year, monthsInRange[0].month, 1)
  const last = new Date(
    monthsInRange[monthsInRange.length - 1].year,
    monthsInRange[monthsInRange.length - 1].month + 1,
    0,
  )

  const firstDateOfFirst = first
  const lastDateOfLast = last

  const cursor = new Date(firstDateOfFirst)
  while (cursor.getDay() !== 1) {
    cursor.setDate(cursor.getDate() - 1)
  }

  const pages: CanvasWeekPage[] = []
  let weekNumber = 1

  while (cursor <= lastDateOfLast) {
    const weekDays: CanvasWeekPage['days'] = []
    const dateObjs: Date[] = []

    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor)
      date.setDate(date.getDate() + d)
      dateObjs.push(date)

      if (date >= firstDateOfFirst && date <= lastDateOfLast) {
        const grid = grids.find((g) => g.year === date.getFullYear() && g.month === date.getMonth())
        const dayInGrid =
          grid?.weeks.flatMap((w) => w.days).find((day) => day && day.date === date.getDate()) ?? null
        weekDays.push(dayInGrid)
      } else {
        weekDays.push(null)
      }
    }

    const start = dateObjs[0]
    const end = dateObjs[6]
    const label = `${start.getDate()} ${t(`months.${MONTH_KEYS[start.getMonth()]}`).slice(0, 3)} – ${end.getDate()} ${t(`months.${MONTH_KEYS[end.getMonth()]}`).slice(0, 3)}`

    pages.push({ weekNumber: weekNumber++, label, days: weekDays, dateObjs })
    cursor.setDate(cursor.getDate() + 7)
  }

  return pages
}

export function buildYearPages(
  monthsInRange: { month: number; year: number }[],
  grids: CalendarGrid[],
): CanvasYearPage[] {
  if (monthsInRange.length <= 12) {
    return [{ year: 0, grids }]
  }
  const byYear = new Map<number, CalendarGrid[]>()
  for (const g of grids) {
    const arr = byYear.get(g.year) ?? []
    arr.push(g)
    byYear.set(g.year, arr)
  }
  return Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, yearGrids]) => ({ year, grids: yearGrids }))
}

function drawMiniMonth(
  ctx: CanvasRenderingContext2D,
  grid: CalendarGrid,
  x: number,
  y: number,
  w: number,
  h: number,
  pal: Palette,
  t: (k: string) => string,
): void {
  const titleH = h * 0.12
  const headerH = h * 0.1
  const weeks = grid.weeks.length
  const gridTop = y + titleH
  const cellW = w / 7
  const cellH = (h - titleH - headerH) / weeks

  const titleSize = Math.max(8, Math.min(16, h * 0.05))
  const headerSize = Math.max(7, Math.min(12, h * 0.04))
  const daySize = Math.max(8, Math.min(14, h * 0.045))
  const holidaySize = Math.max(6, Math.min(9, h * 0.03))

  drawText(ctx, `${grid.monthName} ${grid.year}`, x + w / 2, y + titleH * 0.7, w - 8, `${pal.titleWeight} ${titleSize}px ${pal.fontFamily}`, '#374151', 'center')

  for (let i = 0; i < 7; i++) {
    const bg = i >= 5 ? pal.weekendHeaderBg : pal.headerBg
    fillRect(ctx, x + i * cellW, gridTop, cellW, headerH, bg)
    strokeRect(ctx, x + i * cellW, gridTop, cellW, headerH, pal.cellBorder, pal.cellBorderWidth)
    drawText(ctx, dayInitial(t, i), x + i * cellW + cellW / 2, gridTop + headerH * 0.7, cellW - 4, `${pal.headerWeight} ${headerSize}px ${pal.fontFamily}`, pal.headerText, 'center')
  }

  for (let wi = 0; wi < weeks; wi++) {
    for (let di = 0; di < 7; di++) {
      const day = grid.weeks[wi].days[di]
      const cx = x + di * cellW
      const cy = gridTop + headerH + wi * cellH
      strokeRect(ctx, cx, cy, cellW, cellH, pal.cellBorder, pal.cellBorderWidth)
      if (day) {
        const isFree = day.isWeekend || day.holiday
        fillRect(ctx, cx + 1, cy + 1, cellW - 2, cellH - 2, isFree ? pal.weekendBg : 'white')
        const color = isFree ? pal.weekendDayNumber : pal.dayNumber
        drawText(ctx, String(day.date), cx + 4, cy + daySize + 4, cellW - 8, `${pal.numberWeight} ${daySize}px ${pal.fontFamily}`, color)

        if (day.saint) {
          const saintSize = Math.max(6, holidaySize)
          const dateW = ctx.measureText(String(day.date)).width + 4
          drawText(ctx, day.saint, cx + cellW - 4, cy + daySize + 3, cellW - dateW - 8, `${pal.numberWeight} ${saintSize}px ${pal.fontFamily}`, '#9ca3af', 'right')
        }

        if (day.holiday) {
          const label = t(`holidays.${day.holiday.id}`)
          const holidayY = cy + daySize + holidaySize + 6
          ctx.fillStyle = pal.holidayBg
          ctx.font = `${pal.numberWeight} ${holidaySize}px ${pal.fontFamily}`
          const boxW = Math.min(cellW - 8, ctx.measureText(label).width + 4)
          const boxH = holidaySize + 4
          roundRect(ctx, cx + 4, holidayY - holidaySize - 2, boxW, boxH, 2)
          ctx.fill()
          drawText(ctx, label, cx + 6, holidayY - 2, boxW - 4, `${pal.numberWeight} ${holidaySize}px ${pal.fontFamily}`, pal.holidayText)
          if (pal.showWritingLines) {
            drawWritingLines(ctx, cx + 4, holidayY + 4, cellW - 8, cellH - (holidayY - cy) - 10, pal.writingLine, cellH * 0.25, pal.writingLineStyle)
          }
        } else if (pal.showWritingLines) {
          drawWritingLines(ctx, cx + 4, cy + daySize + 10, cellW - 8, cellH - daySize - 16, pal.writingLine, cellH * 0.25, pal.writingLineStyle)
        }
      } else {
        fillRect(ctx, cx + 1, cy + 1, cellW - 2, cellH - 2, pal.emptyBg)
      }
    }
  }
}
