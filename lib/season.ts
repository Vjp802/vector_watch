/**
 * Season-aware risk logic
 *
 * Vector activity varies significantly by month. This module adjusts
 * the base activity index for each pathogen based on the current month,
 * reflecting real entomological and epidemiological patterns.
 *
 * Sources:
 *   CDC seasonal tick activity: https://www.cdc.gov/ticks/avoid/index.html
 *   CDC WNV seasonal pattern:   https://www.cdc.gov/west-nile-virus/data-maps/index.html
 *   RMSF peak:                  April–September (Dermacentor tick activity)
 *   EEE peak:                   August–October (Culiseta mosquito season)
 */

// Seasonal multiplier by month (0-indexed: 0=Jan, 11=Dec)
// 1.0 = baseline, >1 = elevated, <1 = suppressed
const SEASON_MULTIPLIERS: Record<string, number[]> = {
  // Tick-borne: peak Apr–Oct, suppressed Nov–Mar
  lyme:   [0.15, 0.15, 0.30, 0.65, 0.90, 1.00, 1.00, 0.95, 0.85, 0.60, 0.25, 0.15],
  rmsf:   [0.10, 0.10, 0.25, 0.70, 1.00, 1.00, 0.95, 0.90, 0.80, 0.50, 0.15, 0.10],
  ehrl:   [0.10, 0.10, 0.20, 0.65, 0.95, 1.00, 1.00, 0.90, 0.80, 0.50, 0.15, 0.10],
  anapl:  [0.10, 0.10, 0.20, 0.65, 0.95, 1.00, 1.00, 0.90, 0.80, 0.50, 0.15, 0.10],
  // Mosquito-borne: peak Jul–Sep, near-zero Nov–Apr
  wnv:    [0.02, 0.02, 0.02, 0.05, 0.15, 0.40, 0.90, 1.00, 0.85, 0.30, 0.05, 0.02],
  dengue: [0.10, 0.10, 0.10, 0.15, 0.30, 0.60, 0.90, 1.00, 0.90, 0.60, 0.25, 0.15],
  zika:   [0.20, 0.20, 0.20, 0.25, 0.40, 0.65, 0.85, 1.00, 0.85, 0.55, 0.30, 0.20],
  // EEE peaks late summer
  eee:    [0.02, 0.02, 0.02, 0.05, 0.10, 0.25, 0.55, 1.00, 0.95, 0.40, 0.05, 0.02],
}

export interface SeasonInfo {
  month: number          // 0-indexed
  monthName: string
  multiplier: number
  phase: 'off-season' | 'early-season' | 'peak' | 'late-season'
  nextPeakMonth: string | null
  daysUntilPeak: number | null
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getPhase(multiplier: number): SeasonInfo['phase'] {
  if (multiplier < 0.2) return 'off-season'
  if (multiplier < 0.6) return 'early-season'
  if (multiplier >= 0.85) return 'peak'
  return 'late-season'
}

export function getSeasonInfo(pathogenId: string, date = new Date()): SeasonInfo {
  const month = date.getMonth()
  const multipliers = SEASON_MULTIPLIERS[pathogenId] ?? Array(12).fill(1.0)
  const multiplier = multipliers[month]

  // Find next peak month (multiplier >= 0.85)
  let nextPeakMonth: string | null = null
  let daysUntilPeak: number | null = null
  for (let i = 1; i <= 12; i++) {
    const nextMonth = (month + i) % 12
    if (multipliers[nextMonth] >= 0.85) {
      nextPeakMonth = MONTH_NAMES[nextMonth]
      // Rough days until first day of that month
      const targetDate = new Date(date.getFullYear(), nextMonth, 1)
      if (nextMonth <= month) targetDate.setFullYear(date.getFullYear() + 1)
      daysUntilPeak = Math.ceil((targetDate.getTime() - date.getTime()) / 86400000)
      break
    }
  }

  return {
    month,
    monthName: MONTH_NAMES[month],
    multiplier,
    phase: getPhase(multiplier),
    nextPeakMonth: getPhase(multiplier) === 'peak' ? null : nextPeakMonth,
    daysUntilPeak: getPhase(multiplier) === 'peak' ? null : daysUntilPeak,
  }
}

/**
 * Apply seasonal adjustment to a base activity index.
 * The index is scaled by the current month's multiplier,
 * with a floor of 5 so the map never goes completely blank.
 */
export function applySeasonalAdjustment(baseIndex: number, pathogenId: string, date = new Date()): number {
  const { multiplier } = getSeasonInfo(pathogenId, date)
  return Math.max(5, Math.min(100, Math.round(baseIndex * multiplier)))
}

/**
 * Get a seasonal summary for all pathogens at current date.
 * Returns which are in peak, which are rising, which are dormant.
 */
export function getAllSeasonStatus(date = new Date()) {
  return Object.keys(SEASON_MULTIPLIERS).map(id => ({
    id,
    ...getSeasonInfo(id, date),
  }))
}
