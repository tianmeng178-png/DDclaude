// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
import * as React from 'react'
import figures from 'figures'
import { relative } from 'path'
import { Box, Text } from '../ink.js'
import type { AgentDefinitionsResult } from '../tools/AgentTool/loadAgentsDir.js'
import { getAnthropicApiKeyWithSource, getApiKeyFromConfigOrMacOSKeychain, getAuthTokenSource, isClaudeAISubscriber } from './auth.js'
import { getLargeMemoryFiles, MAX_MEMORY_CHARACTER_COUNT, type MemoryFileInfo } from './claudemd.js'
import type { getGlobalConfig } from './config.js'
import { getCwd } from './cwd.js'
import { formatNumber } from './format.js'
import { toIDEDisplayName, getTerminalIdeType, isSupportedJetBrainsTerminal } from './ide.js'
import { t } from './i18n.js'
import { isJetBrainsPluginInstalledCachedSync } from './jetbrains.js'
import {
  AGENT_DESCRIPTIONS_THRESHOLD,
  getAgentDescriptionsTotalTokens,
} from './statusNoticeHelpers.js'

export type StatusNoticeType = 'warning' | 'info'

export type StatusNoticeContext = {
  config: ReturnType<typeof getGlobalConfig>
  agentDefinitions?: AgentDefinitionsResult
  memoryFiles: MemoryFileInfo[]
}

export type StatusNoticeDefinition = {
  id: string
  type: StatusNoticeType
  isActive: (context: StatusNoticeContext) => boolean
  render: (context: StatusNoticeContext) => React.ReactNode
}

const largeMemoryFilesNotice: StatusNoticeDefinition = {
  id: 'large-memory-files',
  type: 'warning',
  isActive: ctx => getLargeMemoryFiles(ctx.memoryFiles).length > 0,
  render: ctx => {
    const largeMemoryFiles = getLargeMemoryFiles(ctx.memoryFiles)
    return (
      <>
        {largeMemoryFiles.map(file => {
          const displayPath = file.path.startsWith(getCwd())
            ? relative(getCwd(), file.path)
            : file.path

          return (
            <Box key={file.path} flexDirection="row">
              <Text color="warning">{figures.warning}</Text>
              <Text color="warning">
                {t('status_large_memory_file', {
                  path: displayPath,
                  count: formatNumber(file.content.length),
                  max: formatNumber(MAX_MEMORY_CHARACTER_COUNT),
                })}
                <Text dimColor> {t('status_edit_memory')}</Text>
              </Text>
            </Box>
          )
        })}
      </>
    )
  },
}

const claudeAiSubscriberExternalTokenNotice: StatusNoticeDefinition = {
  id: 'claude-ai-external-token',
  type: 'warning',
  isActive: () => {
    const authTokenInfo = getAuthTokenSource()
    return (
      isClaudeAISubscriber() &&
      (authTokenInfo.source === 'ANTHROPIC_AUTH_TOKEN' ||
        authTokenInfo.source === 'apiKeyHelper')
    )
  },
  render: () => {
    const authTokenInfo = getAuthTokenSource()
    return (
      <Box flexDirection="row" marginTop={1}>
        <Text color="warning">{figures.warning}</Text>
        <Text color="warning">
          {t('status_auth_conflict_subscription', {
            source: authTokenInfo.source,
          })}
        </Text>
      </Box>
    )
  },
}

const apiKeyConflictNotice: StatusNoticeDefinition = {
  id: 'api-key-conflict',
  type: 'warning',
  isActive: () => {
    const { source: apiKeySource } = getAnthropicApiKeyWithSource({
      skipRetrievingKeyFromApiKeyHelper: true,
    })
    return (
      !!getApiKeyFromConfigOrMacOSKeychain() &&
      (apiKeySource === 'ANTHROPIC_API_KEY' || apiKeySource === 'apiKeyHelper')
    )
  },
  render: () => {
    const { source: apiKeySource } = getAnthropicApiKeyWithSource({
      skipRetrievingKeyFromApiKeyHelper: true,
    })
    return (
      <Box flexDirection="row" marginTop={1}>
        <Text color="warning">{figures.warning}</Text>
        <Text color="warning">
          {t('status_auth_conflict_console', { source: apiKeySource })}
        </Text>
      </Box>
    )
  },
}

const bothAuthMethodsNotice: StatusNoticeDefinition = {
  id: 'both-auth-methods',
  type: 'warning',
  isActive: () => {
    const { source: apiKeySource } = getAnthropicApiKeyWithSource({
      skipRetrievingKeyFromApiKeyHelper: true,
    })
    const authTokenInfo = getAuthTokenSource()
    return (
      apiKeySource !== 'none' &&
      authTokenInfo.source !== 'none' &&
      !(
        apiKeySource === 'apiKeyHelper' &&
        authTokenInfo.source === 'apiKeyHelper'
      )
    )
  },
  render: () => {
    const { source: apiKeySource } = getAnthropicApiKeyWithSource({
      skipRetrievingKeyFromApiKeyHelper: true,
    })
    const authTokenInfo = getAuthTokenSource()

    const tokenInstruction =
      apiKeySource === 'ANTHROPIC_API_KEY'
        ? t('status_unset_anthropic_api_key')
        : apiKeySource === 'apiKeyHelper'
          ? t('status_unset_api_key_helper')
          : t('status_logout')

    const apiKeyInstruction =
      authTokenInfo.source === 'claude.ai'
        ? t('status_logout_claude_ai')
        : t('status_unset_env_var', { name: authTokenInfo.source })

    return (
      <Box flexDirection="column" marginTop={1}>
        <Box flexDirection="row">
          <Text color="warning">{figures.warning}</Text>
          <Text color="warning">
            {t('status_auth_conflict_both', {
              tokenSource: authTokenInfo.source,
              apiKeySource,
            })}
          </Text>
        </Box>
        <Box flexDirection="column" marginLeft={3}>
          <Text color="warning">
            {t('status_auth_conflict_try_token', {
              tokenSource:
                authTokenInfo.source === 'claude.ai'
                  ? 'claude.ai'
                  : authTokenInfo.source,
              instruction: tokenInstruction,
            })}
          </Text>
          <Text color="warning">
            {t('status_auth_conflict_try_api_key', {
              apiKeySource,
              instruction: apiKeyInstruction,
            })}
          </Text>
        </Box>
      </Box>
    )
  },
}

const largeAgentDescriptionsNotice: StatusNoticeDefinition = {
  id: 'large-agent-descriptions',
  type: 'warning',
  isActive: context => {
    const totalTokens = getAgentDescriptionsTotalTokens(context.agentDefinitions)
    return totalTokens > AGENT_DESCRIPTIONS_THRESHOLD
  },
  render: context => {
    const totalTokens = getAgentDescriptionsTotalTokens(context.agentDefinitions)
    return (
      <Box flexDirection="row">
        <Text color="warning">{figures.warning}</Text>
        <Text color="warning">
          {t('status_large_agent_descriptions', {
            count: formatNumber(totalTokens),
            max: formatNumber(AGENT_DESCRIPTIONS_THRESHOLD),
          })}
          <Text dimColor> {t('status_manage_agents')}</Text>
        </Text>
      </Box>
    )
  },
}

const jetbrainsPluginNotice: StatusNoticeDefinition = {
  id: 'jetbrains-plugin-install',
  type: 'info',
  isActive: context => {
    if (!isSupportedJetBrainsTerminal()) {
      return false
    }

    const shouldAutoInstall = context.config.autoInstallIdeExtension ?? true
    if (!shouldAutoInstall) {
      return false
    }

    const ideType = getTerminalIdeType()
    return ideType !== null && !isJetBrainsPluginInstalledCachedSync(ideType)
  },
  render: () => {
    const ideType = getTerminalIdeType()
    const ideName = toIDEDisplayName(ideType)
    return (
      <Box flexDirection="row" gap={1} marginLeft={1}>
        <Text color="ide">{figures.arrowUp}</Text>
        <Text>
          {t('status_install_jetbrains_plugin', { ideName })}{' '}
          <Text bold>https://docs.claude.com/s/claude-code-jetbrains</Text>
        </Text>
      </Box>
    )
  },
}

export const statusNoticeDefinitions: StatusNoticeDefinition[] = [
  largeMemoryFilesNotice,
  largeAgentDescriptionsNotice,
  claudeAiSubscriberExternalTokenNotice,
  apiKeyConflictNotice,
  bothAuthMethodsNotice,
  jetbrainsPluginNotice,
]

export function getActiveNotices(
  context: StatusNoticeContext,
): StatusNoticeDefinition[] {
  return statusNoticeDefinitions.filter(notice => notice.isActive(context))
}
