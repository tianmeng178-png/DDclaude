/**
 * Placeholder SDK runtime types for the extracted-source bundle.
 *
 * The original generated/runtime surface was not included in this extraction.
 * These exports keep runtime module resolution working for the CLI entrypoint
 * while still providing a minimally useful type surface for local editing.
 */

export type EffortLevel = 'low' | 'medium' | 'high' | (string & {})

export type AnyZodRawShape = Record<string, unknown>

export type InferShape<Schema> = Schema extends Record<string, unknown>
  ? { [K in keyof Schema]: unknown }
  : Record<string, unknown>

export type Options = Record<string, unknown>
export type InternalOptions = Options

export type Query = AsyncIterable<unknown>
export type InternalQuery = Query

export type SDKSessionOptions = Record<string, unknown>

export type SDKSession = {
  id?: string
}

export type ListSessionsOptions = {
  dir?: string
  limit?: number
  offset?: number
}

export type GetSessionInfoOptions = {
  dir?: string
}

export type GetSessionMessagesOptions = {
  dir?: string
  limit?: number
  offset?: number
  includeSystemMessages?: boolean
}

export type SessionMutationOptions = {
  dir?: string
}

export type ForkSessionOptions = {
  dir?: string
  upToMessageId?: string
  title?: string
}

export type ForkSessionResult = {
  sessionId: string
}

export type SessionMessage = Record<string, unknown>

export type McpSdkServerConfigWithInstance = {
  name?: string
  version?: string
  instance?: unknown
}

export type SdkMcpToolDefinition<Schema = unknown> = {
  name?: string
  description?: string
  inputSchema?: Schema
  handler?: (...args: unknown[]) => Promise<unknown>
}

export type McpServerConfigForProcessTransport = Record<string, unknown>
export type McpServerStatus = Record<string, unknown>
export type PermissionResult = Record<string, unknown>
export type RewindFilesResult = Record<string, unknown>

export type SDKSessionInfo = Record<string, unknown>
export type McpSdkServerConfig = Record<string, unknown>
export type ScopedMcpServerConfig = Record<string, unknown>
export type McpSdkServerConfigWithStatus = Record<string, unknown>

