/**
 * Shared types and defaults for file persistence.
 *
 * These are imported by both the scanner and orchestrator modules; keeping
 * them in a tiny leaf module avoids a circular import through print.ts.
 */

export type TurnStartTime = number

export type PersistedFile = {
  filename: string
  file_id: string
}

export type FailedPersistence = {
  filename: string
  error: string
}

export type FilesPersistedEventData = {
  files: PersistedFile[]
  failed: FailedPersistence[]
}

// Outputs are written under {cwd}/{sessionId}/outputs.
export const OUTPUTS_SUBDIR = 'outputs'

// Keep upload fan-out modest to avoid spiking memory/network usage.
export const DEFAULT_UPLOAD_CONCURRENCY = 5

// Guard against pathological output directories in a single turn.
export const FILE_COUNT_LIMIT = 1000
