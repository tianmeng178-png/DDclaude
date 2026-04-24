/**
 * Miscellaneous subcommand handlers extracted from main.tsx for lazy loading.
 * setup-token, auth setup, doctor, install
 */
/* eslint-disable custom-rules/no-process-exit -- CLI subcommand handlers intentionally exit */

import { cwd } from 'process'
import React from 'react'
import {
  AuthSetupFlow,
  type AuthSetupResult,
} from '../../components/AuthSetupFlow.js'
import { WelcomeV2 } from '../../components/LogoV2/WelcomeV2.js'
import { useManagePlugins } from '../../hooks/useManagePlugins.js'
import type { Root } from '../../ink.js'
import { Box, Text } from '../../ink.js'
import { KeybindingSetup } from '../../keybindings/KeybindingProviderSetup.js'
import { logEvent } from '../../services/analytics/index.js'
import { MCPConnectionManager } from '../../services/mcp/MCPConnectionManager.js'
import { AppStateProvider } from '../../state/AppState.js'
import { onChangeAppState } from '../../state/onChangeAppState.js'
import { isAnthropicAuthEnabled } from '../../utils/auth.js'
import { saveGlobalConfig } from '../../utils/config.js'
import { gracefulShutdown } from '../../utils/gracefulShutdown.js'

export async function setupTokenHandler(root: Root): Promise<void> {
  logEvent('tengu_setup_token_command', {})

  const showAuthWarning = !isAnthropicAuthEnabled()
  const { ConsoleOAuthFlow } = await import(
    '../../components/ConsoleOAuthFlow.js'
  )

  await new Promise<void>(resolve => {
    root.render(
      <AppStateProvider onChangeAppState={onChangeAppState}>
        <KeybindingSetup>
          <Box flexDirection="column" gap={1}>
            <WelcomeV2 />
            {showAuthWarning ? (
              <Box flexDirection="column">
                <Text color="warning">
                  Warning: You already have authentication configured via
                  environment variable or API key helper.
                </Text>
                <Text color="warning">
                  The setup-token command will create a new OAuth token which
                  you can use instead.
                </Text>
              </Box>
            ) : null}
            <ConsoleOAuthFlow
              onDone={() => {
                void resolve()
              }}
              mode="setup-token"
              startingMessage="This will guide you through long-lived (1-year) auth token setup for your Claude account. Claude subscription required."
            />
          </Box>
        </KeybindingSetup>
      </AppStateProvider>,
    )
  })

  root.unmount()
  await gracefulShutdown(0)
}

export async function authSetupHandler(root: Root): Promise<void> {
  logEvent('tengu_auth_setup_command', {})

  let result: AuthSetupResult | null = null

  await new Promise<void>(resolve => {
    root.render(
      <AppStateProvider onChangeAppState={onChangeAppState}>
        <KeybindingSetup>
          <Box flexDirection="column" gap={1}>
            <WelcomeV2 />
            <AuthSetupFlow
              onDone={value => {
                result = value
                void resolve()
              }}
              onCancel={() => {
                void resolve()
              }}
              startingMessage="Choose Anthropic login or save a compatible provider. Claude Code will remember this choice, so you do not need to set environment variables manually each time."
            />
          </Box>
        </KeybindingSetup>
      </AppStateProvider>,
    )
  })

  root.unmount()

  if (result && result.kind !== 'skipped') {
    saveGlobalConfig(current => ({
      ...current,
      theme: current.theme ?? 'dark',
      hasCompletedOnboarding: true,
      lastOnboardingVersion: MACRO.VERSION,
    }))
  }

  if (result?.kind === 'compatible') {
    process.stdout.write(
      `Saved ${result.provider} provider configuration.\n`,
    )
  } else if (result?.kind === 'oauth') {
    process.stdout.write('Authentication setup complete.\n')
  } else {
    process.stdout.write('Authentication setup canceled.\n')
  }

  await gracefulShutdown(0)
}

const DoctorLazy = React.lazy(() =>
  import('../../screens/Doctor.js').then(m => ({ default: m.Doctor })),
)

function DoctorWithPlugins({
  onDone,
}: {
  onDone: () => void
}): React.ReactNode {
  useManagePlugins()

  return (
    <React.Suspense fallback={null}>
      <DoctorLazy onDone={onDone} />
    </React.Suspense>
  )
}

export async function doctorHandler(root: Root): Promise<void> {
  logEvent('tengu_doctor_command', {})

  await new Promise<void>(resolve => {
    root.render(
      <AppStateProvider>
        <KeybindingSetup>
          <MCPConnectionManager
            dynamicMcpConfig={undefined}
            isStrictMcpConfig={false}
          >
            <DoctorWithPlugins
              onDone={() => {
                void resolve()
              }}
            />
          </MCPConnectionManager>
        </KeybindingSetup>
      </AppStateProvider>,
    )
  })

  root.unmount()
  await gracefulShutdown(0)
}

export async function installHandler(
  target: string | undefined,
  options: { force?: boolean },
): Promise<void> {
  const { setup } = await import('../../setup.js')
  await setup(cwd(), 'default', false, false, undefined, false)

  const { install } = await import('../../commands/install.js')

  await new Promise<void>(resolve => {
    const args: string[] = []
    if (target) {
      args.push(target)
    }
    if (options.force) {
      args.push('--force')
    }

    void install.call(
      result => {
        void resolve()
        process.exit(result.includes('failed') ? 1 : 0)
      },
      {},
      args,
    )
  })
}
