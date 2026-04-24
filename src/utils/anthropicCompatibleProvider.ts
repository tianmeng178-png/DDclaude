type EnvMap = Record<string, string | undefined>

export type CompatProfileKey =
  | 'anthropic-compatible'
  | 'minimax'
  | 'dashscope'
  | 'hunyuan'

export type CompatAuthStrategy = 'api-key' | 'auth-token'

type CompatProfileDefinition = {
  key: CompatProfileKey
  displayName: string
  defaultBaseUrl?: string | ((model: string | undefined) => string | undefined)
  defaultModel?: string
  defaultDescription: string
  enableEnvVars: string[]
  apiKeyEnvVars: string[]
  baseUrlEnvVars: string[]
  modelEnvVars: string[]
}

type ResolvedCompatProfile = {
  profile: CompatProfileDefinition
  providerName: string
  authStrategy: CompatAuthStrategy
  baseUrl?: string
  apiKey?: string
  mainModel?: string
  smallFastModel?: string
  sonnetModel?: string
  opusModel?: string
  haikuModel?: string
  subagentModel?: string
}

const DEFAULT_TIMEOUT_MS = '3000000'

const GENERIC_COMPAT_ENV_VARS = [
  'CLAUDE_CODE_COMPAT_BASE_URL',
  'CLAUDE_CODE_COMPAT_API_KEY',
  'CLAUDE_CODE_COMPAT_MODEL',
  'CLAUDE_CODE_COMPAT_SMALL_FAST_MODEL',
  'CLAUDE_CODE_COMPAT_SONNET_MODEL',
  'CLAUDE_CODE_COMPAT_OPUS_MODEL',
  'CLAUDE_CODE_COMPAT_HAIKU_MODEL',
  'CLAUDE_CODE_COMPAT_SUBAGENT_MODEL',
] as const

const COMPAT_PROFILES: Record<CompatProfileKey, CompatProfileDefinition> = {
  'anthropic-compatible': {
    key: 'anthropic-compatible',
    displayName: 'Anthropic-compatible provider',
    defaultDescription: 'Anthropic-compatible coding model',
    enableEnvVars: ['CLAUDE_CODE_USE_ANTHROPIC_COMPATIBLE'],
    apiKeyEnvVars: [],
    baseUrlEnvVars: [],
    modelEnvVars: [],
  },
  minimax: {
    key: 'minimax',
    displayName: 'MiniMax',
    defaultBaseUrl: 'https://api.minimaxi.com/anthropic',
    defaultModel: 'MiniMax-M2.7',
    defaultDescription: 'MiniMax Anthropic-compatible coding model',
    enableEnvVars: ['CLAUDE_CODE_USE_MINIMAX'],
    apiKeyEnvVars: ['MINIMAX_API_KEY'],
    baseUrlEnvVars: ['MINIMAX_BASE_URL'],
    modelEnvVars: ['MINIMAX_MODEL'],
  },
  dashscope: {
    key: 'dashscope',
    displayName: 'DashScope',
    defaultBaseUrl: model =>
      model
        ? `https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy?model=${encodeURIComponent(
            model,
          )}`
        : 'https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy?model=qwen3.6-plus',
    defaultModel: 'qwen3.6-plus',
    defaultDescription: 'DashScope Anthropic-compatible coding model',
    enableEnvVars: ['CLAUDE_CODE_USE_DASHSCOPE'],
    apiKeyEnvVars: ['DASHSCOPE_API_KEY'],
    baseUrlEnvVars: ['DASHSCOPE_BASE_URL'],
    modelEnvVars: ['DASHSCOPE_MODEL'],
  },
  hunyuan: {
    key: 'hunyuan',
    displayName: 'Tencent Hunyuan',
    defaultBaseUrl: 'https://api.hunyuan.cloud.tencent.com/anthropic',
    defaultModel: 'hunyuan-2.0-thinking-20251109',
    defaultDescription: 'Tencent Hunyuan Anthropic-compatible coding model',
    enableEnvVars: ['CLAUDE_CODE_USE_HUNYUAN'],
    apiKeyEnvVars: ['HUNYUAN_API_KEY'],
    baseUrlEnvVars: ['HUNYUAN_BASE_URL'],
    modelEnvVars: ['HUNYUAN_MODEL'],
  },
}

const COMPAT_PROVIDER_ALIASES: Record<string, CompatProfileKey> = {
  compatible: 'anthropic-compatible',
  custom: 'anthropic-compatible',
  'anthropic-compatible': 'anthropic-compatible',
  anthropic_compatible: 'anthropic-compatible',
  minimax: 'minimax',
  dashscope: 'dashscope',
  bailian: 'dashscope',
  aliyun: 'dashscope',
  hunyuan: 'hunyuan',
  tencent: 'hunyuan',
  'tencent-hunyuan': 'hunyuan',
  tencent_hunyuan: 'hunyuan',
}

function isTruthy(value: string | undefined): boolean {
  if (!value) {
    return false
  }

  switch (value.trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
      return true
    default:
      return false
  }
}

function readFirstDefined(env: EnvMap, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = env[key]?.trim()
    if (value) {
      return value
    }
  }
  return undefined
}

function hasAnyConfigured(env: EnvMap, keys: readonly string[]): boolean {
  return readFirstDefined(env, keys) !== undefined
}

function setEnvIfMissing(env: EnvMap, key: string, value: string | undefined): void {
  if (!value || env[key]) {
    return
  }
  env[key] = value
}

function normalizeCompatProviderKey(
  value: string | undefined,
): CompatProfileKey | undefined {
  if (!value) {
    return undefined
  }
  return COMPAT_PROVIDER_ALIASES[value.trim().toLowerCase()]
}

function isAnthropicFirstPartyBaseUrl(baseUrl: string | undefined): boolean {
  if (!baseUrl) {
    return true
  }

  try {
    const host = new URL(baseUrl).host
    return host === 'api.anthropic.com' || host === 'api-staging.anthropic.com'
  } catch {
    return false
  }
}

export function inferCompatibleProviderNameFromBaseUrl(
  baseUrl: string | undefined,
): string | undefined {
  if (!baseUrl) {
    return undefined
  }

  try {
    const host = new URL(baseUrl).host.toLowerCase()
    if (host.includes('minimaxi.com')) {
      return 'MiniMax'
    }
    if (host.includes('dashscope.aliyuncs.com')) {
      return 'DashScope'
    }
    if (
      host.includes('hunyuan.cloud.tencent.com') ||
      host.includes('hunyuan.tencentcloudapi.com')
    ) {
      return 'Tencent Hunyuan'
    }
    return host
  } catch {
    return undefined
  }
}

function getConfiguredCompatProfile(env: EnvMap): CompatProfileDefinition | undefined {
  const explicitProfile = normalizeCompatProviderKey(
    env.CLAUDE_CODE_COMPAT_PROVIDER,
  )
  if (explicitProfile) {
    return COMPAT_PROFILES[explicitProfile]
  }

  for (const profile of Object.values(COMPAT_PROFILES)) {
    if (profile.key === 'anthropic-compatible') {
      continue
    }
    if (
      profile.enableEnvVars.some(key => isTruthy(env[key])) ||
      hasAnyConfigured(env, profile.apiKeyEnvVars) ||
      hasAnyConfigured(env, profile.baseUrlEnvVars) ||
      hasAnyConfigured(env, profile.modelEnvVars)
    ) {
      return profile
    }
  }

  const genericEnabled =
    isTruthy(env.CLAUDE_CODE_USE_ANTHROPIC_COMPATIBLE) ||
    hasAnyConfigured(env, GENERIC_COMPAT_ENV_VARS) ||
    normalizeCompatProviderKey(env.CLAUDE_CODE_COMPAT_PROVIDER) !== undefined

  if (genericEnabled) {
    return COMPAT_PROFILES['anthropic-compatible']
  }

  return undefined
}

function getDefaultProviderName(
  profile: CompatProfileDefinition,
  env: EnvMap,
  baseUrl: string | undefined,
): string {
  return (
    env.CLAUDE_CODE_COMPAT_PROVIDER_NAME?.trim() ||
    inferCompatibleProviderNameFromBaseUrl(baseUrl) ||
    profile.displayName
  )
}

function getDefaultBaseUrl(
  profile: CompatProfileDefinition,
  model: string | undefined,
): string | undefined {
  return typeof profile.defaultBaseUrl === 'function'
    ? profile.defaultBaseUrl(model)
    : profile.defaultBaseUrl
}

function resolveCompatProfile(env: EnvMap = process.env): ResolvedCompatProfile | null {
  const profile = getConfiguredCompatProfile(env)
  if (!profile) {
    return null
  }

  const mainModel =
    readFirstDefined(env, ['CLAUDE_CODE_COMPAT_MODEL', ...profile.modelEnvVars]) ||
    readFirstDefined(env, ['CLAUDE_CODE_COMPAT_SONNET_MODEL']) ||
    profile.defaultModel
  const baseUrl =
    readFirstDefined(env, ['CLAUDE_CODE_COMPAT_BASE_URL', ...profile.baseUrlEnvVars]) ||
    getDefaultBaseUrl(profile, mainModel)
  const providerName = getDefaultProviderName(profile, env, baseUrl)
  const authStrategy =
    env.CLAUDE_CODE_COMPAT_AUTH_STRATEGY?.trim().toLowerCase() === 'api-key'
      ? 'api-key'
      : 'auth-token'

  const sonnetModel =
    readFirstDefined(env, ['CLAUDE_CODE_COMPAT_SONNET_MODEL']) || mainModel
  const opusModel =
    readFirstDefined(env, ['CLAUDE_CODE_COMPAT_OPUS_MODEL']) || mainModel
  const haikuModel =
    readFirstDefined(env, ['CLAUDE_CODE_COMPAT_HAIKU_MODEL']) || mainModel
  const smallFastModel =
    readFirstDefined(env, ['CLAUDE_CODE_COMPAT_SMALL_FAST_MODEL']) ||
    haikuModel ||
    mainModel
  const subagentModel =
    readFirstDefined(env, ['CLAUDE_CODE_COMPAT_SUBAGENT_MODEL']) ||
    env.CLAUDE_CODE_SUBAGENT_MODEL?.trim()

  return {
    profile,
    providerName,
    authStrategy,
    baseUrl,
    apiKey:
      readFirstDefined(env, ['CLAUDE_CODE_COMPAT_API_KEY', ...profile.apiKeyEnvVars]) ||
      undefined,
    mainModel,
    smallFastModel,
    sonnetModel,
    opusModel,
    haikuModel,
    subagentModel,
  }
}

function setTierMetadata(
  env: EnvMap,
  modelEnvVar: string,
  nameEnvVar: string,
  descriptionEnvVar: string,
  model: string | undefined,
  providerName: string,
  description: string,
): void {
  if (!model) {
    return
  }
  setEnvIfMissing(env, modelEnvVar, model)
  setEnvIfMissing(env, nameEnvVar, `${model} (${providerName})`)
  setEnvIfMissing(env, descriptionEnvVar, description)
}

export function applyAnthropicCompatibleProviderEnv(
  env: EnvMap = process.env,
): boolean {
  const resolved = resolveCompatProfile(env)
  if (!resolved) {
    return false
  }

  const {
    profile,
    providerName,
    authStrategy,
    baseUrl,
    apiKey,
    mainModel,
    smallFastModel,
    sonnetModel,
    opusModel,
    haikuModel,
    subagentModel,
  } = resolved

  env.CLAUDE_CODE_USE_ANTHROPIC_COMPATIBLE ??= '1'
  env.CLAUDE_CODE_COMPAT_PROVIDER ??= profile.key
  env.CLAUDE_CODE_COMPAT_PROVIDER_NAME ??= providerName

  setEnvIfMissing(env, 'ANTHROPIC_BASE_URL', baseUrl)
  setEnvIfMissing(env, 'API_TIMEOUT_MS', DEFAULT_TIMEOUT_MS)
  setEnvIfMissing(env, 'CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC', '1')
  setEnvIfMissing(env, 'CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS', '1')

  if (apiKey) {
    if (authStrategy === 'api-key') {
      setEnvIfMissing(env, 'ANTHROPIC_API_KEY', apiKey)
    } else {
      setEnvIfMissing(env, 'ANTHROPIC_AUTH_TOKEN', apiKey)
    }
  }

  setEnvIfMissing(env, 'ANTHROPIC_MODEL', mainModel)
  setEnvIfMissing(env, 'ANTHROPIC_SMALL_FAST_MODEL', smallFastModel)
  setTierMetadata(
    env,
    'ANTHROPIC_DEFAULT_SONNET_MODEL',
    'ANTHROPIC_DEFAULT_SONNET_MODEL_NAME',
    'ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION',
    sonnetModel,
    providerName,
    profile.defaultDescription,
  )
  setTierMetadata(
    env,
    'ANTHROPIC_DEFAULT_OPUS_MODEL',
    'ANTHROPIC_DEFAULT_OPUS_MODEL_NAME',
    'ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION',
    opusModel,
    providerName,
    profile.defaultDescription,
  )
  setTierMetadata(
    env,
    'ANTHROPIC_DEFAULT_HAIKU_MODEL',
    'ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME',
    'ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION',
    haikuModel,
    providerName,
    profile.defaultDescription,
  )

  if (mainModel) {
    setEnvIfMissing(env, 'ANTHROPIC_CUSTOM_MODEL_OPTION', mainModel)
    setEnvIfMissing(
      env,
      'ANTHROPIC_CUSTOM_MODEL_OPTION_NAME',
      `${mainModel} (${providerName})`,
    )
    setEnvIfMissing(
      env,
      'ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION',
      profile.defaultDescription,
    )
  }

  if (subagentModel) {
    setEnvIfMissing(env, 'CLAUDE_CODE_SUBAGENT_MODEL', subagentModel)
  } else if (
    mainModel &&
    sonnetModel === mainModel &&
    opusModel === mainModel &&
    haikuModel === mainModel
  ) {
    setEnvIfMissing(env, 'CLAUDE_CODE_SUBAGENT_MODEL', mainModel)
  }

  return true
}

export function isAnthropicCompatibleEnvConfigured(
  env: EnvMap = process.env,
): boolean {
  return (
    resolveCompatProfile(env) !== null ||
    (!!env.ANTHROPIC_BASE_URL &&
      !isAnthropicFirstPartyBaseUrl(env.ANTHROPIC_BASE_URL))
  )
}

export function getConfiguredCompatibleProviderName(
  env: EnvMap = process.env,
): string | undefined {
  const resolved = resolveCompatProfile(env)
  if (resolved) {
    return resolved.providerName
  }
  return inferCompatibleProviderNameFromBaseUrl(env.ANTHROPIC_BASE_URL)
}
