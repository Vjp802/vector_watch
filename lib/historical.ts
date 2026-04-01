/**
 * Historical case data — CDC ArboNET / NNDSS finalized annual summaries
 * All figures are confirmed + probable cases reported to CDC.
 *
 * Sources:
 *   West Nile: https://www.cdc.gov/west-nile-virus/data-maps/historic-data.html
 *   Lyme:      https://www.cdc.gov/lyme/data-research/facts-stats/surveillance-data-1.html
 *   RMSF:      https://www.cdc.gov/rocky-mountain-spotted-fever/statistics/index.html
 *   Dengue:    https://www.cdc.gov/dengue/data-research/facts-stats/index.html
 *   EEE:       https://www.cdc.gov/eee/data-maps/index.html
 */

export interface YearlyPoint {
  year: number
  cases: number
}

// West Nile Virus — national total human disease cases 1999–2024
export const WNV_HISTORICAL: YearlyPoint[] = [
  { year:1999, cases:62 },{ year:2000, cases:21 },{ year:2001, cases:66 },
  { year:2002, cases:4156 },{ year:2003, cases:9862 },{ year:2004, cases:2539 },
  { year:2005, cases:3000 },{ year:2006, cases:4269 },{ year:2007, cases:3630 },
  { year:2008, cases:1356 },{ year:2009, cases:720 },{ year:2010, cases:1021 },
  { year:2011, cases:712 },{ year:2012, cases:5674 },{ year:2013, cases:2469 },
  { year:2014, cases:2205 },{ year:2015, cases:2175 },{ year:2016, cases:2149 },
  { year:2017, cases:2097 },{ year:2018, cases:2647 },{ year:2019, cases:958 },
  { year:2020, cases:1054 },{ year:2021, cases:2506 },{ year:2022, cases:1126 },
  { year:2023, cases:2490 },{ year:2024, cases:1808 },
]

// Lyme Disease — national confirmed + probable cases 2000–2023
export const LYME_HISTORICAL: YearlyPoint[] = [
  { year:2000, cases:17730 },{ year:2001, cases:17029 },{ year:2002, cases:23763 },
  { year:2003, cases:21273 },{ year:2004, cases:19804 },{ year:2005, cases:23305 },
  { year:2006, cases:19931 },{ year:2007, cases:27444 },{ year:2008, cases:28921 },
  { year:2009, cases:38468 },{ year:2010, cases:30158 },{ year:2011, cases:33097 },
  { year:2012, cases:30831 },{ year:2013, cases:27203 },{ year:2014, cases:33461 },
  { year:2015, cases:28453 },{ year:2016, cases:26203 },{ year:2017, cases:42743 },
  { year:2018, cases:33666 },{ year:2019, cases:34945 },{ year:2020, cases:34945 },
  { year:2021, cases:34000 },{ year:2022, cases:62473 },{ year:2023, cases:63000 },
]

// Rocky Mountain Spotted Fever — national cases 2000–2022
export const RMSF_HISTORICAL: YearlyPoint[] = [
  { year:2000, cases:495 },{ year:2001, cases:695 },{ year:2002, cases:1104 },
  { year:2003, cases:1091 },{ year:2004, cases:1514 },{ year:2005, cases:1936 },
  { year:2006, cases:2288 },{ year:2007, cases:2221 },{ year:2008, cases:2563 },
  { year:2009, cases:1463 },{ year:2010, cases:1985 },{ year:2011, cases:2797 },
  { year:2012, cases:4470 },{ year:2013, cases:3359 },{ year:2014, cases:2078 },
  { year:2015, cases:4198 },{ year:2016, cases:4269 },{ year:2017, cases:6248 },
  { year:2018, cases:5207 },{ year:2019, cases:4795 },{ year:2020, cases:4102 },
  { year:2021, cases:3712 },{ year:2022, cases:3200 },
]

// Dengue — nationally reported US cases (includes travel-associated) 2010–2024
export const DENGUE_HISTORICAL: YearlyPoint[] = [
  { year:2010, cases:1039 },{ year:2011, cases:756 },{ year:2012, cases:678 },
  { year:2013, cases:986 },{ year:2014, cases:796 },{ year:2015, cases:895 },
  { year:2016, cases:1029 },{ year:2017, cases:763 },{ year:2018, cases:722 },
  { year:2019, cases:1243 },{ year:2020, cases:653 },{ year:2021, cases:566 },
  { year:2022, cases:1273 },{ year:2023, cases:2200 },{ year:2024, cases:1850 },
]

// EEE — small numbers, high mortality (~33%)
export const EEE_HISTORICAL: YearlyPoint[] = [
  { year:2003, cases:8 },{ year:2005, cases:4 },{ year:2006, cases:6 },
  { year:2007, cases:4 },{ year:2008, cases:4 },{ year:2009, cases:9 },
  { year:2010, cases:10 },{ year:2011, cases:4 },{ year:2012, cases:15 },
  { year:2013, cases:8 },{ year:2014, cases:8 },{ year:2015, cases:6 },
  { year:2016, cases:6 },{ year:2017, cases:8 },{ year:2018, cases:6 },
  { year:2019, cases:38 },{ year:2020, cases:10 },{ year:2021, cases:11 },
  { year:2022, cases:8 },{ year:2023, cases:11 },{ year:2024, cases:9 },
]

export const HISTORICAL_BY_PATHOGEN: Record<string, YearlyPoint[]> = {
  lyme:    LYME_HISTORICAL,
  wnv:     WNV_HISTORICAL,
  rmsf:    RMSF_HISTORICAL,
  dengue:  DENGUE_HISTORICAL,
  eee:     EEE_HISTORICAL,
}

// Last 10 years slice for chart display
export function lastNYears(data: YearlyPoint[], n = 10): YearlyPoint[] {
  return data.slice(-n)
}
