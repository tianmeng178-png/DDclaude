import { z } from 'zod/v4'
import type { Tool } from '../../Tool.js'

const inputSchema = z
  .object({
    command: z.string().optional(),
  })
  .passthrough()

export const TungstenTool: Tool<typeof inputSchema, { unavailable: true }> = {
  name: 'tungsten',
  async call() {
    return {
      data: { unavailable: true },
    }
  },
  async description() {
    return 'Unavailable in this extracted-source build.'
  },
  inputSchema,
  isConcurrencySafe() {
    return true
  },
  isEnabled() {
    return false
  },
  isReadOnly() {
    return true
  },
}

export function clearSessionsWithTungstenUsage(): void {}

export function resetInitializationState(): void {}
