import {
  applyAnthropicCompatibleProviderEnv,
  type CompatAuthStrategy,
  type CompatProfileKey,
} from './anthropicCompatibleProvider.js'
import { saveGlobalConfig } from './config.js'
import { isProviderManagedEnvVar } from './managedEnvConstants.js'

export type CompatibleProviderKey = CompatProfileKey

export type CompatibleProviderSelection = {
  provider: CompatibleProviderKey
  apiKey: string
  model?: string
  baseUrl?: string
  providerName?: string
  authStrategy?: CompatAuthStrategy
}

export type CompatibleProviderPreset = {
  key: CompatibleProviderKey
  label: string
  providerName: string
  description: string
  defaultModel?: string
  baseUrlPlaceholder?: string
  modelPlaceholder: string
  providerNamePlaceholder?: string
}

export const COMPATIBLE_PROVIDER_PRESETS: Record<
  CompatibleProviderKey,
  CompatibleProviderPreset
> = {
  minimax: {
    key: 'minimax',
    label: 'MiniMax',
    providerName: 'MiniMax',
    description: 'Use MiniMax via its Anthropic-compatible coding endpoint.',
    defaultModel: 'MiniMax-M2.7',
    modelPlaceholder: 'MiniMax-M2.7',
  },
  dashscope: {
    key: 'dashscope',
    label: 'DashScope',
    providerName: 'DashScope',
    description: 'Use DashScope / BaiLian via the Claude Code proxy endpoint.',
    defaultModel: 'qwen3.6-plus',
    modelPlaceholder: 'qwen3.6-plus',
  },
  hunyuan: {
    key: 'hunyuan',
    label: 'Tencent Hunyuan',
    providerName: 'Tencent Hunyuan',
    description: 'Use Tencent Hunyuan via its Anthropic-compatible endpoint.',
    defaultModel: 'hunyuan-2.0-thinking-20251109',
    modelPlaceholder: 'hunyuan-2.0-thinking-20251109',
  },
  'anthropic-compatible': {
    key: 'anthropic-compatible',
    label: 'Custom Compatible Gateway',
    providerName: 'Custom compatible gateway',
    description: 'Use any Anthropic-compatible base URL, including self-hosted gateways.',
    modelPlaceholder: 'your-model-id',
    baseUrlPlaceholder: 'https://your-gateway.example.com/anthropic',
    providerNamePlaceholder: 'My Gateway',
  },
}

function stripProviderManagedEnv(
  env: Record<string, string> | undefined,
): Record<string, string> {
  if (!env) {
    return {}
  }

  const next: Record<string, string> = {}
  for (const [key, value] of Object.entries(env)) {
    if (!isProviderManagedEnvVar(key)) {
      next[key] = value
    }
  }
  return next
}

export function getCompatibleProviderPreset(
  provider: CompatibleProviderKey,
): CompatibleProviderPreset {
  return COMPATIBLE_PROVIDER_PRESETS[provider]
}

export function clearProviderManagedEnvFromProcessEnv(): void {
  for (const key of Object.keys(process.env)) {
    if (isProviderManagedEnvVar(key)) {
      delete process.env[key]
    }
  }
}

export function buildCompatibleProviderEnv(
  selection: CompatibleProviderSelection,
): Record<string, string> {
  const preset = getCompatibleProviderPreset(selection.provider)
  const model =
    selection.model?.trim() || preset.defaultModel || ''
  const apiKey = selection.apiKey.trim()
  const baseUrl = selection.baseUrl?.trim()
  const providerName = selection.providerName?.trim()

  const env: Record<string, string> = {
    CLAUDE_CODE_USE_ANTHROPIC_COMPATIBLE: '1',
    CLAUDE_CODE_COMPAT_PROVIDER: selection.provider,
    CLAUDE_CODE_COMPAT_API_KEY: apiKey,
  }

  if (model) {
    env.CLAUDE_CODE_COMPAT_MODEL = model
    env.CLAUDE_CODE_COMPAT_SUBAGENT_MODEL = model
  }

  if (baseUrl) {
    env.CLAUDE_CODE_COMPAT_BASE_URL = baseUrl
  }

  if (selection.provider === 'anthropic-compatible') {
    if (providerName) {
      env.CLAUDE_CODE_COMPAT_PROVIDER_NAME = providerName
    }
  } else {
    env.CLAUDE_CODE_COMPAT_PROVIDER_NAME = preset.providerName
  }

  if (selection.authStrategy === 'api-key') {
    env.CLAUDE_CODE_COMPAT_AUTH_STRATEGY = 'api-key'
  }

  return env
}

export function saveCompatibleProviderSelection(
  selection: CompatibleProviderSelection,
): void {
  const providerEnv = buildCompatibleProviderEnv(selection)

  saveGlobalConfig(current => ({
    ...current,
    env: {
      ...stripProviderManagedEnv(current.env),
      ...providerEnv,
    },
  }))
}

export function clearSavedCompatibleProviderSelection(): void {
  saveGlobalConfig(current => ({
    ...current,
    env: stripProviderManagedEnv(current.env),
  }))
}

export function applyCompatibleProviderSelectionToProcessEnv(
  selection: CompatibleProviderSelection,
): void {
  clearProviderManagedEnvFromProcessEnv()
  Object.assign(process.env, buildCompatibleProviderEnv(selection))
  applyAnthropicCompatibleProviderEnv()
}
