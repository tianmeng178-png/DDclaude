import type { AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS } from '../../services/analytics/index.js'
import {
  getConfiguredCompatibleProviderName,
  isAnthropicCompatibleEnvConfigured,
} from '../anthropicCompatibleProvider.js'
import { isEnvTruthy } from '../envUtils.js'

export type APIProvider =
  | 'firstParty'
  | 'compatible'
  | 'bedrock'
  | 'vertex'
  | 'foundry'

export function getAPIProvider(): APIProvider {
  return isEnvTruthy(process.env.CLAUDE_CODE_USE_BEDROCK)
    ? 'bedrock'
    : isEnvTruthy(process.env.CLAUDE_CODE_USE_VERTEX)
      ? 'vertex'
      : isEnvTruthy(process.env.CLAUDE_CODE_USE_FOUNDRY)
        ? 'foundry'
        : isAnthropicCompatibleEnvConfigured()
          ? 'compatible'
          : 'firstParty'
}

export function getAPIProviderForStatsig(): AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS {
  return getAPIProvider() as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
}

export function getCompatibleProviderName(): string | undefined {
  if (getAPIProvider() !== 'compatible') {
    return undefined
  }
  return getConfiguredCompatibleProviderName()
}

export function getAPIProviderDisplayName(): string {
  const provider = getAPIProvider()
  switch (provider) {
    case 'firstParty':
      return 'Anthropic'
    case 'compatible': {
      const compatibleName = getCompatibleProviderName()
      return compatibleName
        ? `Anthropic-compatible (${compatibleName})`
        : 'Anthropic-compatible provider'
    }
    case 'bedrock':
      return 'AWS Bedrock'
    case 'vertex':
      return 'Google Vertex AI'
    case 'foundry':
      return 'Microsoft Foundry'
  }
}

/**
 * Check if ANTHROPIC_BASE_URL is a first-party Anthropic API URL.
 * Returns true if not set (default API) or points to api.anthropic.com
 * (or api-staging.anthropic.com for ant users).
 */
export function isFirstPartyAnthropicBaseUrl(): boolean {
  const baseUrl = process.env.ANTHROPIC_BASE_URL
  if (!baseUrl) {
    return true
  }
  try {
    const host = new URL(baseUrl).host
    const allowedHosts = ['api.anthropic.com']
    if (process.env.USER_TYPE === 'ant') {
      allowedHosts.push('api-staging.anthropic.com')
    }
    return allowedHosts.includes(host)
  } catch {
    return false
  }
}

export function isDirectAnthropicProvider(): boolean {
  return getAPIProvider() === 'firstParty' && isFirstPartyAnthropicBaseUrl()
}
