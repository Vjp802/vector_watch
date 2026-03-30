import { Alert, StateData, Pathogen } from '@/lib/types'

export interface IDataAdapter {
  /** Human-readable name, e.g. "CDC ArboNET" */
  name: string
  /** Fetch the latest state-level activity data */
  fetchStateData(): Promise<StateData[]>
  /** Fetch current alerts */
  fetchAlerts(): Promise<Alert[]>
  /** Fetch pathogen activity updates (optional — adapters can return []) */
  fetchPathogenUpdates(): Promise<Partial<Pathogen>[]>
}
