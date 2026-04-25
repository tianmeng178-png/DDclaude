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

export type CompatibleProviderModelOption = {
  id: string
  label: string
  description?: string
}

export type CompatibleProviderPreset = {
  key: CompatibleProviderKey
  label: string
  providerName: string
  description: string
  defaultModel?: string
  defaultAuthStrategy?: CompatAuthStrategy
  modelOptions?: CompatibleProviderModelOption[]
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
  deepseek: {
    key: 'deepseek',
    label: 'DeepSeek',
    providerName: 'DeepSeek',
    description: 'Use DeepSeek via its Anthropic-compatible endpoint.',
    defaultModel: 'deepseek-v4-pro',
    defaultAuthStrategy: 'api-key',
    modelPlaceholder: 'deepseek-v4-pro',
    modelOptions: [
      {
        id: 'deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        description: 'Latest flagship coding/reasoning model.',
      },
      {
        id: 'deepseek-v4-flash',
        label: 'DeepSeek V4 Flash',
        description: 'Latest faster and lower-cost V4 model.',
      },
      {
        id: 'deepseek-chat',
        label: 'DeepSeek Chat',
        description: 'General chat alias kept for compatibility.',
      },
      {
        id: 'deepseek-reasoner',
        label: 'DeepSeek Reasoner',
        description: 'Reasoning alias kept for compatibility.',
      },
    ],
  },
  glm: {
    key: 'glm',
    label: 'Z.AI GLM',
    providerName: 'Z.AI GLM',
    description: 'Use Z.AI GLM via an Anthropic-compatible endpoint.',
    defaultModel: 'glm-5.1',
    defaultAuthStrategy: 'api-key',
    modelPlaceholder: 'glm-5.1',
    modelOptions: [
      {
        id: 'glm-5.1',
        label: 'GLM-5.1',
        description: 'Latest GLM coding-agent model.',
      },
      {
        id: 'glm-5-turbo',
        label: 'GLM-5 Turbo',
        description: 'Fast GLM-5 option.',
      },
      {
        id: 'glm-5',
        label: 'GLM-5',
        description: 'GLM-5 stable model.',
      },
      {
        id: 'glm-4.7',
        label: 'GLM-4.7',
        description: 'Previous-generation reasoning model.',
      },
      {
        id: 'glm-4.7-flash',
        label: 'GLM-4.7 Flash',
        description: 'Faster GLM-4.7 option.',
      },
      {
        id: 'glm-4.6',
        label: 'GLM-4.6',
        description: 'GLM-4.6 compatibility option.',
      },
    ],
  },
  openrouter: {
    key: 'openrouter',
    label: 'OpenRouter',
    providerName: 'OpenRouter',
    description: 'Use OpenRouter via its Anthropic-compatible endpoint.',
    defaultModel: 'anthropic/claude-sonnet-4.6',
    defaultAuthStrategy: 'auth-token',
    modelPlaceholder: 'anthropic/claude-sonnet-4.6',
    modelOptions: [
      {
        id: 'anthropic/claude-sonnet-4.6',
        label: 'Claude Sonnet 4.6',
        description: 'Recommended coding default on OpenRouter.',
      },
      {
        id: 'anthropic/claude-opus-4.7',
        label: 'Claude Opus 4.7',
        description: 'Latest Opus model on OpenRouter.',
      },
      {
        id: 'deepseek/deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        description: 'Latest DeepSeek model exposed by OpenRouter.',
      },
      {
        id: 'deepseek/deepseek-v4-flash',
        label: 'DeepSeek V4 Flash',
        description: 'Latest fast DeepSeek model exposed by OpenRouter.',
      },
      {
        id: 'z-ai/glm-5.1',
        label: 'GLM-5.1',
        description: 'Latest Z.AI GLM model exposed by OpenRouter.',
      },
      {
        id: 'qwen/qwen3.6-plus',
        label: 'Qwen3.6 Plus',
        description: 'Latest Qwen Plus model exposed by OpenRouter.',
      },
      {
        id: 'moonshotai/kimi-k2.6',
        label: 'Kimi K2.6',
        description: 'Latest Kimi model exposed by OpenRouter.',
      },
      {
        id: 'openrouter/pareto-code',
        label: 'Pareto Code Router',
        description: 'OpenRouter coding router.',
      },
      {
        id: 'openai/gpt-5.5',
        label: 'GPT-5.5',
        description: 'Latest OpenAI general model exposed by OpenRouter.',
      },
      {
        id: 'openai/gpt-5.5-pro',
        label: 'GPT-5.5 Pro',
        description: 'Latest OpenAI pro model exposed by OpenRouter.',
      },
    ],
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
  } else if (selection.authStrategy === 'auth-token') {
    env.CLAUDE_CODE_COMPAT_AUTH_STRATEGY = 'auth-token'
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
