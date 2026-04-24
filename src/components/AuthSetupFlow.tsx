import React, { useEffect, useMemo, useState } from 'react'
import {
  type AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
  logEvent,
} from 'src/services/analytics/index.js'
import { Box, Text } from '../ink.js'
import { useKeybinding } from '../keybindings/useKeybinding.js'
import {
  type CompatAuthStrategy,
  type CompatProfileKey,
} from '../utils/anthropicCompatibleProvider.js'
import { PreflightStep } from '../utils/preflightChecks.js'
import {
  applyCompatibleProviderSelectionToProcessEnv,
  clearProviderManagedEnvFromProcessEnv,
  clearSavedCompatibleProviderSelection,
  COMPATIBLE_PROVIDER_PRESETS,
  getCompatibleProviderPreset,
  saveCompatibleProviderSelection,
  type CompatibleProviderSelection,
} from '../utils/compatibleProviderSetup.js'
import { t } from '../utils/i18n.js'
import { ConfigurableShortcutHint } from './ConfigurableShortcutHint.js'
import { type OptionWithDescription, Select } from './CustomSelect/select.js'
import { Byline } from './design-system/Byline.js'
import { KeyboardShortcutHint } from './design-system/KeyboardShortcutHint.js'
import { ConsoleOAuthFlow } from './ConsoleOAuthFlow.js'
import TextInput from './TextInput.js'

type OAuthChoice = 'claudeai' | 'console'
type AuthSetupChoice = OAuthChoice | CompatProfileKey | 'skip'

export type AuthSetupResult =
  | { kind: 'oauth'; method: OAuthChoice }
  | { kind: 'compatible'; provider: CompatProfileKey }
  | { kind: 'skipped' }

type AuthSetupStage =
  | 'choose'
  | 'preflight'
  | 'oauth'
  | 'provider-name'
  | 'base-url'
  | 'api-key'
  | 'model'
  | 'auth-strategy'

type Props = {
  onDone: (result: AuthSetupResult) => void
  onCancel?: () => void
  allowSkip?: boolean
  startingMessage?: string
}

function isOAuthChoice(choice: AuthSetupChoice): choice is OAuthChoice {
  return choice === 'claudeai' || choice === 'console'
}

function isCompatibleChoice(choice: AuthSetupChoice): choice is CompatProfileKey {
  return (
    choice === 'minimax' ||
    choice === 'dashscope' ||
    choice === 'hunyuan' ||
    choice === 'anthropic-compatible'
  )
}

function buildChoiceOptions(
  allowSkip: boolean,
): OptionWithDescription<AuthSetupChoice>[] {
  const options: OptionWithDescription<AuthSetupChoice>[] = [
    {
      value: 'claudeai',
      label: t('auth_setup_anthropic_account'),
      description: t('auth_setup_anthropic_account_desc'),
    },
    {
      value: 'console',
      label: t('auth_setup_console'),
      description: t('auth_setup_console_desc'),
    },
    {
      value: 'minimax',
      label: 'MiniMax',
      description: t('auth_setup_minimax_desc'),
    },
    {
      value: 'dashscope',
      label: 'DashScope',
      description: t('auth_setup_dashscope_desc'),
    },
    {
      value: 'hunyuan',
      label: 'Tencent Hunyuan',
      description: t('auth_setup_hunyuan_desc'),
    },
    {
      value: 'anthropic-compatible',
      label: t('auth_setup_custom_gateway'),
      description: t('auth_setup_custom_gateway_desc'),
    },
  ]

  if (allowSkip) {
    options.push({
      value: 'skip',
      label: t('auth_setup_skip'),
      description: t('auth_setup_skip_desc'),
    })
  }

  return options
}

function InputFooter(): React.ReactNode {
  return (
    <Byline>
      <KeyboardShortcutHint
        shortcut="Type"
        action={t('auth_setup_type_enter_text')}
      />
      <KeyboardShortcutHint
        shortcut="Enter"
        action={t('auth_setup_enter_continue')}
      />
      <ConfigurableShortcutHint
        action="confirm:no"
        context="Settings"
        fallback="Esc"
        description={t('auth_setup_go_back')}
      />
    </Byline>
  )
}

type InputStepProps = {
  title: string
  description: string
  value: string
  setValue: (value: string) => void
  onSubmit: (value: string) => void
  cursorOffset: number
  setCursorOffset: (offset: number) => void
  placeholder?: string
  mask?: string
  hint?: string
  error?: string | null
}

function InputStep({
  title,
  description,
  value,
  setValue,
  onSubmit,
  cursorOffset,
  setCursorOffset,
  placeholder,
  mask,
  hint,
  error,
}: InputStepProps): React.ReactNode {
  return (
    <Box flexDirection="column" gap={1} paddingLeft={1}>
      <Text bold>{title}</Text>
      <Text dimColor wrap="wrap">
        {description}
      </Text>
      <Box marginTop={1}>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={onSubmit}
          placeholder={placeholder}
          columns={72}
          cursorOffset={cursorOffset}
          onChangeCursorOffset={setCursorOffset}
          focus
          showCursor
          mask={mask}
        />
      </Box>
      {hint ? (
        <Text dimColor wrap="wrap">
          {hint}
        </Text>
      ) : null}
      {error ? <Text color="error">{error}</Text> : null}
      <InputFooter />
    </Box>
  )
}

export function AuthSetupFlow({
  onDone,
  onCancel,
  allowSkip = false,
  startingMessage,
}: Props): React.ReactNode {
  const [stage, setStage] = useState<AuthSetupStage>('choose')
  const [choice, setChoice] = useState<AuthSetupChoice | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [providerName, setProviderName] = useState('')
  const [authStrategy, setAuthStrategy] =
    useState<CompatAuthStrategy>('auth-token')
  const [cursorOffset, setCursorOffset] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const choiceOptions = useMemo(() => buildChoiceOptions(allowSkip), [allowSkip])
  const preset = choice && isCompatibleChoice(choice)
    ? getCompatibleProviderPreset(choice)
    : null

  useEffect(() => {
    if (stage === 'provider-name') {
      setCursorOffset(providerName.length)
    } else if (stage === 'base-url') {
      setCursorOffset(baseUrl.length)
    } else if (stage === 'api-key') {
      setCursorOffset(apiKey.length)
    } else if (stage === 'model') {
      setCursorOffset(model.length)
    }
  }, [stage])

  function handleCancel(): void {
    onCancel?.()
  }

  function resetCompatibleState(provider: CompatProfileKey): void {
    const nextPreset = getCompatibleProviderPreset(provider)
    setApiKey('')
    setBaseUrl('')
    setProviderName('')
    setAuthStrategy('auth-token')
    setModel(nextPreset.defaultModel ?? '')
    setError(null)
  }

  function handleChoice(selected: AuthSetupChoice): void {
    logEvent('tengu_auth_setup_choice_selected', {
      choice:
        selected as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
    })

    if (selected === 'skip') {
      onDone({ kind: 'skipped' })
      return
    }

    setChoice(selected)
    setError(null)

    if (isOAuthChoice(selected)) {
      setStage('preflight')
      return
    }

    resetCompatibleState(selected)
    setStage(
      selected === 'anthropic-compatible' ? 'provider-name' : 'api-key',
    )
  }

  function goBack(): void {
    setError(null)

    switch (stage) {
      case 'provider-name':
      case 'preflight':
        setStage('choose')
        setChoice(null)
        return
      case 'base-url':
        setStage('provider-name')
        return
      case 'api-key':
        if (choice === 'anthropic-compatible') {
          setStage('base-url')
        } else {
          setStage('choose')
          setChoice(null)
        }
        return
      case 'model':
        setStage('api-key')
        return
      case 'auth-strategy':
        setStage('model')
        return
      default:
        handleCancel()
    }
  }

  useKeybinding('confirm:no', goBack, {
    context: 'Settings',
    isActive:
      stage === 'provider-name' ||
      stage === 'base-url' ||
      stage === 'api-key' ||
      stage === 'model' ||
      stage === 'auth-strategy',
  })

  function saveCompatibleChoice(
    provider: CompatProfileKey,
    overrides?: Partial<CompatibleProviderSelection>,
  ): void {
    const selection: CompatibleProviderSelection = {
      provider,
      apiKey,
      model,
      baseUrl,
      providerName,
      authStrategy,
      ...overrides,
    }

    saveCompatibleProviderSelection(selection)
    applyCompatibleProviderSelectionToProcessEnv(selection)

    logEvent('tengu_auth_setup_provider_saved', {
      provider:
        provider as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
    })

    onDone({ kind: 'compatible', provider })
  }

  function handleProviderNameSubmit(value: string): void {
    setProviderName(value.trim())
    setError(null)
    setStage('base-url')
  }

  function handleBaseUrlSubmit(value: string): void {
    const trimmed = value.trim()
    if (!trimmed) {
      setError(t('auth_setup_error_base_url_required'))
      return
    }

    try {
      new URL(trimmed)
    } catch {
      setError(t('auth_setup_error_invalid_url'))
      return
    }

    setBaseUrl(trimmed)
    setError(null)
    setStage('api-key')
  }

  function handleApiKeySubmit(value: string): void {
    const trimmed = value.trim()
    if (!trimmed) {
      setError(t('auth_setup_error_api_key_required'))
      return
    }

    setApiKey(trimmed)
    setError(null)
    setStage('model')
  }

  function handleModelSubmit(value: string): void {
    const trimmed = value.trim() || preset?.defaultModel || ''
    if (!trimmed) {
      setError(t('auth_setup_error_model_required'))
      return
    }

    setModel(trimmed)
    setError(null)

    if (choice === 'anthropic-compatible') {
      setStage('auth-strategy')
      return
    }

    if (choice && isCompatibleChoice(choice)) {
      saveCompatibleChoice(choice, {
        model: trimmed,
        providerName: undefined,
        baseUrl: undefined,
        authStrategy: undefined,
      })
    }
  }

  if (stage === 'preflight' && choice && isOAuthChoice(choice)) {
    return (
      <Box flexDirection="column" gap={1} paddingLeft={1}>
        <Text bold>{t('auth_setup_preparing_login')}</Text>
        <PreflightStep onSuccess={() => setStage('oauth')} />
      </Box>
    )
  }

  if (stage === 'oauth' && choice && isOAuthChoice(choice)) {
    return (
      <ConsoleOAuthFlow
        onDone={() => {
          clearSavedCompatibleProviderSelection()
          clearProviderManagedEnvFromProcessEnv()
          onDone({ kind: 'oauth', method: choice })
        }}
        forceLoginMethod={choice}
      />
    )
  }

  if (stage === 'provider-name') {
    return (
      <InputStep
        title={t('auth_setup_gateway_name_title')}
        description={t('auth_setup_gateway_name_desc')}
        value={providerName}
        setValue={setProviderName}
        onSubmit={handleProviderNameSubmit}
        cursorOffset={cursorOffset}
        setCursorOffset={setCursorOffset}
        placeholder={
          COMPATIBLE_PROVIDER_PRESETS['anthropic-compatible']
            .providerNamePlaceholder
        }
        hint={t('auth_setup_gateway_name_hint')}
        error={error}
      />
    )
  }

  if (stage === 'base-url') {
    return (
      <InputStep
        title={t('auth_setup_base_url_title')}
        description={t('auth_setup_base_url_desc')}
        value={baseUrl}
        setValue={setBaseUrl}
        onSubmit={handleBaseUrlSubmit}
        cursorOffset={cursorOffset}
        setCursorOffset={setCursorOffset}
        placeholder={
          COMPATIBLE_PROVIDER_PRESETS['anthropic-compatible']
            .baseUrlPlaceholder
        }
        error={error}
      />
    )
  }

  if (stage === 'api-key' && preset) {
    return (
      <InputStep
        title={t('auth_setup_api_key_title', { provider: preset.label })}
        description={t('auth_setup_api_key_desc', { provider: preset.label })}
        value={apiKey}
        setValue={setApiKey}
        onSubmit={handleApiKeySubmit}
        cursorOffset={cursorOffset}
        setCursorOffset={setCursorOffset}
        mask="*"
        error={error}
      />
    )
  }

  if (stage === 'model' && preset) {
    const usingDefaultHint =
      preset.defaultModel && choice !== 'anthropic-compatible'
        ? t('auth_setup_model_hint_default', { model: preset.defaultModel })
        : undefined

    return (
      <InputStep
        title={t('auth_setup_model_title', { provider: preset.label })}
        description={t('auth_setup_model_desc')}
        value={model}
        setValue={setModel}
        onSubmit={handleModelSubmit}
        cursorOffset={cursorOffset}
        setCursorOffset={setCursorOffset}
        placeholder={preset.modelPlaceholder}
        hint={usingDefaultHint}
        error={error}
      />
    )
  }

  if (stage === 'auth-strategy' && choice === 'anthropic-compatible') {
    const options: OptionWithDescription<CompatAuthStrategy>[] = [
      {
        value: 'auth-token',
        label: t('auth_setup_auth_strategy_bearer'),
        description: t('auth_setup_auth_strategy_bearer_desc'),
      },
      {
        value: 'api-key',
        label: t('auth_setup_auth_strategy_api_key'),
        description: t('auth_setup_auth_strategy_api_key_desc'),
      },
    ]

    return (
      <Box flexDirection="column" gap={1} paddingLeft={1}>
        <Text bold>{t('auth_setup_auth_strategy_title')}</Text>
        <Text dimColor wrap="wrap">{t('auth_setup_auth_strategy_desc')}</Text>
        <Select
          options={options}
          defaultValue={authStrategy}
          defaultFocusValue={authStrategy}
          inlineDescriptions
          onChange={value => {
            setAuthStrategy(value)
            if (choice) {
              saveCompatibleChoice(choice, { authStrategy: value })
            }
          }}
          onCancel={goBack}
        />
      </Box>
    )
  }

  return (
    <Box flexDirection="column" gap={1} paddingLeft={1}>
      <Text bold>{t('auth_setup_choose_title')}</Text>
      {startingMessage ? (
        <Text dimColor wrap="wrap">
          {startingMessage}
        </Text>
      ) : null}
      <Select
        options={choiceOptions}
        inlineDescriptions
        onChange={handleChoice}
        onCancel={handleCancel}
      />
    </Box>
  )
}
