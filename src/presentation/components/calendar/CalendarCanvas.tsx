import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendar, DEFAULT_PRINT_MARGIN_MM } from '@/app/providers/CalendarProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import { getProvider } from '@/data/holidays'
import { buildCalendarGrid } from '@/domain/calendar/usecases'
import { getHolidaysForMonth } from '@/domain/calendar/usecases/GetHolidaysForMonth'
import { PAPER_SIZES } from '@/config/paperSizes'
import { PALETTES } from '@/config/palettes'
import { FONTS } from '@/config/fonts'
import {
  mmToPx,
  drawYearSheet,
  drawMonthMultiPage,
  drawWeekMultiPage,
  buildWeekPages,
  buildYearPages,
  type CanvasWeekPage,
  type CanvasYearPage,
} from '@/presentation/canvas/calendarCanvas'
import type { CalendarGrid } from '@/domain/calendar/entities/Calendar'

const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

interface CanvasPageProps {
  width: number
  height: number
  scale: number
  draw: (ctx: CanvasRenderingContext2D) => void
}

function CanvasPage({ width, height, scale, draw }: CanvasPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)
    draw(ctx)
    ctx.restore()
  }, [width, height, draw])

  return (
    <canvas
      ref={canvasRef}
      className="canvas-page bg-white"
      style={{
        width: width * scale,
        height: height * scale,
        display: 'block',
      }}
    />
  )
}

interface SheetProps {
  paperW: number
  paperH: number
  margin: number
  scale: number
  children: React.ReactNode
}

function Sheet({ paperW, paperH, margin, scale, children }: SheetProps) {
  return (
    <div
      className="sheet"
      style={{
        width: paperW * scale,
        height: paperH * scale,
        padding: margin * scale,
        background: 'white',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 8px 30px -8px rgba(0,0,0,0.2)',
      }}
    >
      {children}
    </div>
  )
}

export function CalendarCanvas() {
  const { t } = useTranslation()
  const { monthsInRange, country, template, paperSize, orientation, pagesPerSheet, showSantoral, showNotes } = useCalendar()
  const { paletteId, fontId } = useTheme()
  const [scale, setScale] = useState(1)

  const pal = useMemo(() => {
    const base = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0]
    const font = FONTS.find((f) => f.id === fontId) ?? FONTS[0]
    return { ...base, fontFamily: font.family }
  }, [paletteId, fontId])
  const paper = useMemo(() => PAPER_SIZES.find((p) => p.id === paperSize) ?? PAPER_SIZES[0], [paperSize])

  const rawW = parseFloat(paper.width)
  const rawH = parseFloat(paper.height)
  const paperWmm = orientation === 'portrait' ? rawW : rawH
  const paperHmm = orientation === 'portrait' ? rawH : rawW
  const marginMm = DEFAULT_PRINT_MARGIN_MM
  const innerWmm = paperWmm - 2 * marginMm
  const innerHmm = paperHmm - 2 * marginMm
  const paperWPx = mmToPx(paperWmm)
  const paperHPx = mmToPx(paperHmm)
  const innerWPx = mmToPx(innerWmm)
  const innerHPx = mmToPx(innerHmm)
  const marginPx = mmToPx(marginMm)

  const provider = useMemo(() => getProvider(country), [country])

  const grids: CalendarGrid[] = useMemo(
    () =>
      monthsInRange.map(({ month, year }) => {
        const holidays = getHolidaysForMonth(provider, year, month)
        return buildCalendarGrid(year, month, t(`months.${MONTH_KEYS[month]}`), holidays, showSantoral)
      }),
    [monthsInRange, provider, t, showSantoral],
  )

  const weekPages: CanvasWeekPage[] = useMemo(
    () => (template === 'weekly' ? buildWeekPages(monthsInRange, grids, t) : []),
    [template, monthsInRange, grids, t],
  )

  const yearPages: CanvasYearPage[] = useMemo(
    () => (template === 'yearly' ? buildYearPages(monthsInRange, grids) : []),
    [template, monthsInRange, grids],
  )

  const monthSheets: CalendarGrid[][] = useMemo(
    () =>
      template === 'monthly'
        ? Array.from({ length: Math.ceil(grids.length / pagesPerSheet) }, (_, i) =>
            grids.slice(i * pagesPerSheet, i * pagesPerSheet + pagesPerSheet),
          )
        : [],
    [template, grids, pagesPerSheet],
  )

  const weekSheets: CanvasWeekPage[][] = useMemo(
    () =>
      template === 'weekly'
        ? Array.from({ length: Math.ceil(weekPages.length / pagesPerSheet) }, (_, i) =>
            weekPages.slice(i * pagesPerSheet, i * pagesPerSheet + pagesPerSheet),
          )
        : [],
    [template, weekPages, pagesPerSheet],
  )

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const availW = el.clientWidth - 32
      setScale(Math.min(1, availW / paperWPx))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [paperWPx])

  return (
    <div
      ref={containerRef}
      className="canvas-preview flex flex-col items-center gap-4 overflow-y-auto overflow-x-hidden py-6"
      style={
        {
          width: '100%',
          height: '100%',
          '--paper-w': `${paperWmm}mm`,
          '--paper-h': `${paperHmm}mm`,
          '--inner-w': `${innerWmm}mm`,
          '--inner-h': `${innerHmm}mm`,
          '--margin': `${marginMm}mm`,
        } as React.CSSProperties
      }
    >
      {template === 'monthly' &&
        monthSheets.map((sheet, idx) => (
          <Sheet
            key={`m-${idx}`}
            paperW={paperWPx}
            paperH={paperHPx}
            margin={marginPx}
            scale={scale}
          >
            <CanvasPage
              width={innerWPx}
              height={innerHPx}
              scale={scale}
              draw={(ctx) => drawMonthMultiPage(ctx, sheet, pal, t, innerWPx, innerHPx, orientation, pagesPerSheet, showNotes)}
            />
          </Sheet>
        ))}
      {template === 'weekly' &&
        weekSheets.map((sheet, idx) => (
          <Sheet
            key={`w-${idx}`}
            paperW={paperWPx}
            paperH={paperHPx}
            margin={marginPx}
            scale={scale}
          >
            <CanvasPage
              width={innerWPx}
              height={innerHPx}
              scale={scale}
              draw={(ctx) => drawWeekMultiPage(ctx, sheet, pal, t, innerWPx, innerHPx, orientation, pagesPerSheet, showNotes)}
            />
          </Sheet>
        ))}
      {template === 'yearly' &&
        yearPages.map((page) => (
          <Sheet
            key={`y-${page.year}`}
            paperW={paperWPx}
            paperH={paperHPx}
            margin={marginPx}
            scale={scale}
          >
            <CanvasPage
              width={innerWPx}
              height={innerHPx}
              scale={scale}
              draw={(ctx) => drawYearSheet(ctx, page, pal, t, innerWPx, innerHPx, 0, orientation, showNotes)}
            />
          </Sheet>
        ))}
    </div>
  )
}
