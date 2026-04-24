import React, { useEffect, useMemo, useState } from 'react'
import { logEvent } from 'src/services/analytics/index.js'
import { Box, Link, Text } from '../ink.js'
import { useKeybinding } from '../keybindings/useKeybinding.js'
import {
  getAnthropicApiKeyWithSource,
  getAuthTokenSource,
} from '../utils/auth.js'
import { isAnthropicCompatibleEnvConfigured } from '../utils/anthropicCompatibleProvider.js'
import { getGlobalConfig, saveGlobalConfig } from '../utils/config.js'
import { t } from '../utils/i18n.js'
import type { ThemeSetting } from '../utils/theme.js'
import { AuthSetupFlow } from './AuthSetupFlow.js'
import { Dialog } from './design-system/Dialog.js'
import { WelcomeV2 } from './LogoV2/WelcomeV2.js'
import { ThemePicker } from './ThemePicker.js'

type Props = {
  onDone(): void
}

type Step = 'welcome' | 'theme' | 'auth' | 'security'

function hasSavedCompatibleProviderConfig(): boolean {
  const savedEnv = getGlobalConfig().env

  return !!(
    savedEnv?.CLAUDE_CODE_USE_ANTHROPIC_COMPATIBLE ||
    savedEnv?.CLAUDE_CODE_COMPAT_PROVIDER ||
    savedEnv?.CLAUDE_CODE_COMPAT_BASE_URL
  )
}

function hasExistingAuthConfiguration(): boolean {
  const { hasToken } = getAuthTokenSource()
  const { source: apiKeySource } = getAnthropicApiKeyWithSource({
    skipRetrievingKeyFromApiKeyHelper: true,
  })

  return (
    hasToken ||
    apiKeySource !== 'none' ||
    hasSavedCompatibleProviderConfig() ||
    isAnthropicCompatibleEnvConfigured()
  )
}

export function Onboarding({ onDone }: Props): React.ReactNode {
  const needsAuthStep = useMemo(() => !hasExistingAuthConfiguration(), [])
  const steps = useMemo<Step[]>(
    () => ['welcome', 'theme', ...(needsAuthStep ? ['auth' as const] : []), 'security'],
    [needsAuthStep],
  )
  const [stepIndex, setStepIndex] = useState(0)

  const step = steps[stepIndex]
  const isInfoStep = step === 'welcome' || step === 'security'

  function goNext(): void {
    if (stepIndex >= steps.length - 1) {
      onDone()
      return
    }

    setStepIndex(current => current + 1)
  }

  function goBack(): void {
    if (stepIndex === 0) {
      onDone()
      return
    }

    setStepIndex(current => current - 1)
  }

  function handleThemeSelect(theme: ThemeSetting): void {
    saveGlobalConfig(current => ({
      ...current,
      theme,
    }))
    goNext()
  }

  useKeybinding('confirm:yes', goNext, {
    context: 'Confirmation',
    isActive: isInfoStep,
  })

  useEffect(() => {
    logEvent('tengu_onboarding_provider_setup_shown', {
      auth_step_included: needsAuthStep ? 'yes' : 'no',
    })
  }, [needsAuthStep])

  let content: React.ReactNode

  if (step === 'welcome') {
    content = (
      <Dialog
        title={t('onboarding_welcome_title')}
        subtitle={t('onboarding_welcome_subtitle')}
        onCancel={onDone}
      >
        <Box flexDirection="column" gap={1}>
          <Text>{t('onboarding_welcome_body_1')}</Text>
          <Text dimColor>{t('onboarding_welcome_body_2')}</Text>
          <Text dimColor>{t('onboarding_welcome_body_3')}</Text>
        </Box>
      </Dialog>
    )
  } else if (step === 'theme') {
    content = (
      <ThemePicker
        onThemeSelect={handleThemeSelect}
        helpText={t('onboarding_theme_help')}
        skipExitHandling
        onCancel={goBack}
      />
    )
  } else if (step === 'auth') {
    content = (
      <AuthSetupFlow
        onDone={() => {
          logEvent('tengu_onboarding_provider_setup_completed', {})
          goNext()
        }}
        onCancel={goBack}
        allowSkip
        startingMessage={t('onboarding_auth_starting_message')}
      />
    )
  } else {
    content = (
      <Dialog
        title={t('onboarding_security_title')}
        subtitle={t('onboarding_security_subtitle')}
        onCancel={goBack}
      >
        <Box flexDirection="column" gap={1}>
          <Text>{t('onboarding_security_body_1')}</Text>
          <Text>{t('onboarding_security_body_2')}</Text>
          <Text>{t('onboarding_security_body_3')}</Text>
          <Link url="https://code.claude.com/docs/en/security" />
          {!needsAuthStep ? (
            <Text dimColor>{t('onboarding_existing_auth_skipped')}</Text>
          ) : null}
          <Text dimColor>{t('onboarding_finish_hint')}</Text>
        </Box>
      </Dialog>
    )
  }

  return (
    <Box flexDirection="column" gap={1}>
      <WelcomeV2 />
      {content}
      {stepIndex < steps.length - 1 ? (
        <Text dimColor>
          {t('onboarding_step_of_total', {
            current: stepIndex + 1,
            total: steps.length,
          })}
        </Text>
      ) : (
        <Text dimColor>
          {needsAuthStep
            ? t('onboarding_final_step')
            : t('onboarding_final_step_auth_configured')}
        </Text>
      )}
    </Box>
  )
}
