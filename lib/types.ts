import { z } from 'zod'

// ── Pathogen ──────────────────────────────────────────────────────────────
export const PathogenSchema = z.object({
  id:       z.string(),
  name:     z.string(),
  color:    z.string(),
  risk:     z.enum(['H', 'M', 'L']),
  act:      z.number().min(0).max(100),
  vector:   z.string(),
  host:     z.string(),
  inc:      z.string(),
  season:   z.string(),
  cases:    z.number(),
  states:   z.string(),
  trend:    z.array(z.number()),
  sources:  z.array(z.string()),
})
export type Pathogen = z.infer<typeof PathogenSchema>

// ── State data ────────────────────────────────────────────────────────────
export const StateDataSchema = z.object({
  name:         z.string(),
  activityIndex: z.number().min(0).max(100),
  riskLevel:    z.enum(['Low', 'Low-mod', 'Moderate', 'High', 'Critical']),
  topPathogen:  z.string(),
  source:       z.string(),
  lastUpdated:  z.string(),
})
export type StateData = z.infer<typeof StateDataSchema>

// ── Alert ─────────────────────────────────────────────────────────────────
export const AlertSchema = z.object({
  id:       z.string(),
  level:    z.enum(['critical', 'warning', 'info']),
  title:    z.string(),
  body:     z.string(),
  time:     z.string(),
  source:   z.string(),
  region:   z.string(),
})
export type Alert = z.infer<typeof AlertSchema>

// ── Data source ───────────────────────────────────────────────────────────
export const DataSourceSchema = z.object({
  id:          z.string(),
  name:        z.string(),
  color:       z.string(),
  status:      z.enum(['online', 'offline', 'degraded']),
  description: z.string(),
  updated:     z.string(),
  records:     z.string(),
  coverage:    z.string(),
  latency:     z.string(),
  datasets:    z.array(z.string()),
  url:         z.string().optional(),
})
export type DataSource = z.infer<typeof DataSourceSchema>

// ── API responses ─────────────────────────────────────────────────────────
export const VectorDataResponseSchema = z.object({
  pathogens:  z.array(PathogenSchema),
  states:     z.array(StateDataSchema),
  alerts:     z.array(AlertSchema),
  sources:    z.array(DataSourceSchema),
  fetchedAt:  z.string(),
  cacheHit:   z.boolean(),
})
export type VectorDataResponse = z.infer<typeof VectorDataResponseSchema>

export const InsightResponseSchema = z.object({
  insight:    z.string(),
  sources:    z.array(z.string()),
  generatedAt: z.string(),
})
export type InsightResponse = z.infer<typeof InsightResponseSchema>
