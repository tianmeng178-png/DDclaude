import { applyAnthropicCompatibleProviderEnv } from '../src/utils/anthropicCompatibleProvider.js'

type MacroShape = {
  VERSION: string
  BUILD_TIME: string
  BUILD_TIMESTAMP: string
  BUILD_ID: string
  PACKAGE_NAME: string
  PACKAGE_URL: string
}

const DEFAULT_VERSION = '0.1.0-dev'

function installMacroShim(): void {
  const macro: MacroShape = {
    VERSION: process.env.CLAUDE_CODE_REVIVAL_VERSION || DEFAULT_VERSION,
    BUILD_TIME: process.env.CLAUDE_CODE_REVIVAL_BUILD_TIME || '',
    BUILD_TIMESTAMP: process.env.CLAUDE_CODE_REVIVAL_BUILD_TIMESTAMP || '',
    BUILD_ID: process.env.CLAUDE_CODE_REVIVAL_BUILD_ID || 'dev-local',
    PACKAGE_NAME: 'claude-code-revival',
    PACKAGE_URL: '',
  }

  ;(globalThis as typeof globalThis & { MACRO?: MacroShape }).MACRO ??= macro
}

installMacroShim()
applyAnthropicCompatibleProviderEnv()

process.env.CLAUDE_CODE_ENTRYPOINT ??= 'cli'

await import('../src/entrypoints/cli.tsx')
