import { UI_LANGUAGES, type UiLanguage } from '../types/ui.js'
import { getGlobalConfig } from './config.js'
import { getSystemLocaleLanguage } from './intl.js'

type TranslationValues = Record<string, string | number>

const enUS = {
  common_api_usage_billing: 'API Usage Billing',
  common_welcome_back: 'Welcome back!',
  common_welcome_back_user: 'Welcome back, {username}!',
  common_message_from_org: 'Message from {organization}:',
  common_messages_count: '{count} messages',

  feed_recent_activity_title: 'Recent activity',
  feed_recent_activity_footer: '/resume for more',
  feed_recent_activity_empty: 'No recent activity',
  feed_whats_new_title: "What's new",
  feed_whats_new_footer: '/release-notes for more',
  feed_whats_new_empty: 'Check the Claude Code changelog for updates',
  feed_tips_title: 'Tips for getting started',
  feed_home_dir_warning:
    'Note: You launched Claude in your home directory. For the best experience, launch it in a project directory instead.',
  feed_guest_passes_title: '3 guest passes',
  feed_guest_passes_subtitle_reward:
    'Share Claude Code and earn {reward} of extra usage',
  feed_guest_passes_subtitle_default: 'Share Claude Code with friends',

  project_onboarding_workspace:
    'Ask Claude to create a new app or clone a repository',
  project_onboarding_claudemd:
    'Run /init to create a CLAUDE.md file with instructions for Claude',

  onboarding_welcome_title: 'Welcome',
  onboarding_welcome_subtitle: "We'll set up Claude Code in a few quick steps.",
  onboarding_welcome_body_1:
    'Claude Code can sign in with Anthropic directly or save an Anthropic-compatible provider such as MiniMax, DashScope, or Tencent Hunyuan.',
  onboarding_welcome_body_2:
    'This setup is saved to your Claude Code config, so you do not need to launch with manual environment variables each time.',
  onboarding_welcome_body_3:
    'You can reopen it later with claude auth setup.',
  onboarding_theme_help: 'You can change this later in settings.',
  onboarding_auth_starting_message:
    'Choose Anthropic login, a compatible provider, or skip for now. Claude Code will remember your selection in config.',
  onboarding_security_title: 'Security',
  onboarding_security_subtitle: 'One last thing before we open the workspace.',
  onboarding_security_body_1:
    'Claude Code can read files, edit files, and run commands in your project.',
  onboarding_security_body_2:
    'Only continue in repositories you trust. The workspace trust dialog appears right after onboarding.',
  onboarding_security_body_3:
    'Review the security guidance before using it on sensitive codebases.',
  onboarding_existing_auth_skipped:
    'Existing authentication was detected, so provider setup was skipped. You can still switch later with claude auth setup.',
  onboarding_finish_hint:
    'Press Enter to finish onboarding and continue to workspace trust.',
  onboarding_step_of_total: 'Step {current} of {total}',
  onboarding_final_step: 'Final step',
  onboarding_final_step_auth_configured: 'Final step - auth already configured',

  auth_setup_anthropic_account: 'Anthropic account',
  auth_setup_anthropic_account_desc:
    'Sign in with Claude subscription login.',
  auth_setup_console: 'Anthropic Console',
  auth_setup_console_desc: 'Use Anthropic Console billing and API usage.',
  auth_setup_minimax_desc:
    'Save a MiniMax API key and use the built-in compatible profile.',
  auth_setup_dashscope_desc:
    'Save a DashScope / BaiLian API key and model.',
  auth_setup_hunyuan_desc:
    'Save a Tencent Hunyuan API key and model.',
  auth_setup_custom_gateway: 'Custom compatible gateway',
  auth_setup_custom_gateway_desc:
    'Use any Anthropic-compatible base URL and model ID.',
  auth_setup_skip: 'Skip for now',
  auth_setup_skip_desc: 'Finish onboarding without saving auth yet.',
  auth_setup_type_enter_text: 'enter text',
  auth_setup_enter_continue: 'continue',
  auth_setup_go_back: 'go back',
  auth_setup_preparing_login: 'Preparing Anthropic login',
  auth_setup_gateway_name_title: 'Name this gateway',
  auth_setup_gateway_name_desc:
    'This label is only used for display inside status screens.',
  auth_setup_gateway_name_hint: 'Optional. Press Enter to keep it blank.',
  auth_setup_base_url_title: 'Gateway base URL',
  auth_setup_base_url_desc:
    'Enter the Anthropic-compatible base URL exposed by your gateway.',
  auth_setup_api_key_title: 'API key for {provider}',
  auth_setup_api_key_desc:
    'Enter the API key that should be saved for {provider}.',
  auth_setup_model_title: 'Model for {provider}',
  auth_setup_model_desc:
    'Choose the model ID that Claude Code should send to this provider.',
  auth_setup_model_hint_default:
    'Press Enter on an empty value to use the default model: {model}',
  auth_setup_auth_strategy_title: 'How should this gateway receive the key?',
  auth_setup_auth_strategy_desc:
    'Most Anthropic-compatible gateways expect a bearer token. Choose the API key mode only if your gateway documents that requirement.',
  auth_setup_auth_strategy_bearer: 'Bearer token',
  auth_setup_auth_strategy_bearer_desc:
    'Send credentials through the Authorization header.',
  auth_setup_auth_strategy_api_key: 'X-API-Key style',
  auth_setup_auth_strategy_api_key_desc:
    'Send credentials as an Anthropic API key header.',
  auth_setup_choose_title: 'Choose how Claude Code should authenticate',
  auth_setup_error_base_url_required: 'Base URL is required.',
  auth_setup_error_invalid_url: 'Please enter a valid absolute URL.',
  auth_setup_error_api_key_required: 'API key is required.',
  auth_setup_error_model_required: 'Model is required.',

  status_large_memory_file:
    'Large {path} will impact performance ({count} chars > {max})',
  status_edit_memory: '· /memory to edit',
  status_auth_conflict_subscription:
    'Auth conflict: Using {source} instead of Claude account subscription token. Either unset {source}, or run `claude /logout`.',
  status_auth_conflict_console:
    'Auth conflict: Using {source} instead of Anthropic Console key. Either unset {source}, or run `claude /logout`.',
  status_auth_conflict_both:
    'Auth conflict: Both a token ({tokenSource}) and an API key ({apiKeySource}) are set. This may lead to unexpected behavior.',
  status_auth_conflict_try_token:
    '· Trying to use {tokenSource}? {instruction}',
  status_auth_conflict_try_api_key:
    '· Trying to use {apiKeySource}? {instruction}',
  status_unset_anthropic_api_key:
    'Unset the ANTHROPIC_API_KEY environment variable, or claude /logout then say "No" to the API key approval before login.',
  status_unset_api_key_helper: 'Unset the apiKeyHelper setting.',
  status_logout: 'claude /logout',
  status_logout_claude_ai: 'claude /logout to sign out of claude.ai.',
  status_unset_env_var: 'Unset the {name} environment variable.',
  status_large_agent_descriptions:
    'Large cumulative agent descriptions will impact performance (~{count} tokens > {max})',
  status_manage_agents: '· /agents to manage',
  status_install_jetbrains_plugin:
    'Install the {ideName} plugin from the JetBrains Marketplace:',

  footer_press_again_to_exit: 'Press {key} again to exit',
  footer_pasting_text: 'Pasting text…',
  footer_waiting_duration: 'waiting {duration}',
  footer_shortcuts_hint: '? for shortcuts',

  help_bash_mode: '! for bash mode',
  help_commands: '/ for commands',
  help_file_paths: '@ for file paths',
  help_background: '& for background',
  help_side_question: '/btw for side question',
  help_double_esc: 'double tap esc to clear input',
  help_auto_accept_edits: 'to auto-accept edits',
  help_verbose_output: 'for verbose output',
  help_toggle_tasks: 'to toggle tasks',
  help_terminal: 'for terminal',
  help_undo: 'to undo',
  help_suspend: 'ctrl + z to suspend',
  help_paste_images: 'to paste images',
  help_switch_model: 'to switch model',
  help_toggle_fast_mode: 'to toggle fast mode',
  help_stash_prompt: 'to stash prompt',
  help_edit_in_editor: 'to edit in $EDITOR',
  help_customize_keybindings: '/keybindings to customize',
  help_newline_shift_enter: 'shift + Enter for newline',
  help_newline_backslash_return: '\\ + Enter for newline',
  help_newline_backslash_word: 'backslash (\\) + Enter for newline',
  logo_sandbox_warning:
    'Your bash commands will be sandboxed. Disable with /sandbox.',
} as const

const zhCN: typeof enUS = {
  common_api_usage_billing: 'API 按量计费',
  common_welcome_back: '欢迎回来！',
  common_welcome_back_user: '欢迎回来，{username}！',
  common_message_from_org: '来自 {organization} 的消息：',
  common_messages_count: '{count} 条消息',

  feed_recent_activity_title: '最近活动',
  feed_recent_activity_footer: '使用 /resume 查看更多',
  feed_recent_activity_empty: '暂无最近活动',
  feed_whats_new_title: '最新动态',
  feed_whats_new_footer: '使用 /release-notes 查看更多',
  feed_whats_new_empty: '可查看 Claude Code 更新日志获取最新内容',
  feed_tips_title: '快速开始',
  feed_home_dir_warning:
    '注意：你当前是在用户主目录中启动 Claude。为了获得更好的体验，建议在项目目录中启动。',
  feed_guest_passes_title: '3 个访客名额',
  feed_guest_passes_subtitle_reward:
    '分享 Claude Code，可额外获得 {reward} 用量额度',
  feed_guest_passes_subtitle_default: '把 Claude Code 分享给朋友',

  project_onboarding_workspace: '让 Claude 创建一个新应用，或先克隆一个仓库',
  project_onboarding_claudemd:
    '运行 /init，为 Claude 创建一份 CLAUDE.md 指令文件',

  onboarding_welcome_title: '欢迎',
  onboarding_welcome_subtitle: '我们会用几个简单步骤完成 Claude Code 初始化。',
  onboarding_welcome_body_1:
    'Claude Code 可以直接登录 Anthropic，也可以保存 MiniMax、DashScope、腾讯混元等 Anthropic-compatible 提供方配置。',
  onboarding_welcome_body_2:
    '这些设置会保存到 Claude Code 配置中，所以你不需要每次启动时都手动设置环境变量。',
  onboarding_welcome_body_3:
    '之后你也可以随时通过 claude auth setup 重新打开这个流程。',
  onboarding_theme_help: '之后你也可以在设置里修改。',
  onboarding_auth_starting_message:
    '请选择 Anthropic 登录、兼容提供方，或者暂时跳过。Claude Code 会把你的选择保存到配置中。',
  onboarding_security_title: '安全提示',
  onboarding_security_subtitle: '在打开工作区之前，还有最后一步。',
  onboarding_security_body_1:
    'Claude Code 可以读取文件、编辑文件，也可以在你的项目里执行命令。',
  onboarding_security_body_2:
    '只在你信任的仓库中继续。工作区信任确认会在 onboarding 之后立即出现。',
  onboarding_security_body_3: '在处理敏感代码库之前，请先阅读安全说明。',
  onboarding_existing_auth_skipped:
    '检测到已有认证配置，因此跳过了 provider 配置。之后你仍然可以通过 claude auth setup 切换。',
  onboarding_finish_hint: '按 Enter 完成 onboarding，并继续进入工作区信任确认。',
  onboarding_step_of_total: '第 {current} 步，共 {total} 步',
  onboarding_final_step: '最后一步',
  onboarding_final_step_auth_configured: '最后一步 - 已存在认证配置',

  auth_setup_anthropic_account: 'Anthropic 账号',
  auth_setup_anthropic_account_desc: '使用 Claude 订阅账号登录。',
  auth_setup_console: 'Anthropic Console',
  auth_setup_console_desc: '使用 Anthropic Console 的 API 按量计费。',
  auth_setup_minimax_desc:
    '保存 MiniMax API Key，并使用内置的兼容 provider 配置。',
  auth_setup_dashscope_desc: '保存 DashScope / 百炼 API Key 和模型。',
  auth_setup_hunyuan_desc: '保存腾讯混元 API Key 和模型。',
  auth_setup_custom_gateway: '自定义兼容网关',
  auth_setup_custom_gateway_desc:
    '使用任意兼容 Anthropic 协议的 base URL 和 model ID。',
  auth_setup_skip: '暂时跳过',
  auth_setup_skip_desc: '先完成 onboarding，稍后再保存认证信息。',
  auth_setup_type_enter_text: '输入内容',
  auth_setup_enter_continue: '继续',
  auth_setup_go_back: '返回',
  auth_setup_preparing_login: '正在准备 Anthropic 登录',
  auth_setup_gateway_name_title: '给这个网关起个名字',
  auth_setup_gateway_name_desc: '这个名称只用于在状态页面中显示。',
  auth_setup_gateway_name_hint: '可选，直接按 Enter 可留空。',
  auth_setup_base_url_title: '网关 Base URL',
  auth_setup_base_url_desc:
    '请输入你的网关暴露出来的 Anthropic-compatible Base URL。',
  auth_setup_api_key_title: '{provider} 的 API Key',
  auth_setup_api_key_desc: '请输入需要为 {provider} 保存的 API Key。',
  auth_setup_model_title: '为 {provider} 选择模型',
  auth_setup_model_desc: '请选择 Claude Code 发给该 provider 的模型 ID。',
  auth_setup_model_hint_default: '直接按 Enter 可使用默认模型：{model}',
  auth_setup_auth_strategy_title: '这个网关应该如何接收密钥？',
  auth_setup_auth_strategy_desc:
    '大多数 Anthropic-compatible 网关都使用 Bearer Token。只有在网关文档明确要求时，才选择 API Key 模式。',
  auth_setup_auth_strategy_bearer: 'Bearer Token',
  auth_setup_auth_strategy_bearer_desc: '通过 Authorization 请求头发送凭证。',
  auth_setup_auth_strategy_api_key: 'X-API-Key 风格',
  auth_setup_auth_strategy_api_key_desc:
    '通过 Anthropic API Key 请求头发送凭证。',
  auth_setup_choose_title: '请选择 Claude Code 的认证方式',
  auth_setup_error_base_url_required: 'Base URL 不能为空。',
  auth_setup_error_invalid_url: '请输入合法的绝对 URL。',
  auth_setup_error_api_key_required: 'API Key 不能为空。',
  auth_setup_error_model_required: '模型不能为空。',

  status_large_memory_file: '{path} 过大，可能影响性能（{count} 个字符 > {max}）',
  status_edit_memory: '· 使用 /memory 编辑',
  status_auth_conflict_subscription:
    '认证冲突：当前正在使用 {source}，而不是 Claude 账号订阅令牌。请取消设置 {source}，或运行 `claude /logout`。',
  status_auth_conflict_console:
    '认证冲突：当前正在使用 {source}，而不是 Anthropic Console Key。请取消设置 {source}，或运行 `claude /logout`。',
  status_auth_conflict_both:
    '认证冲突：同时检测到了令牌（{tokenSource}）和 API Key（{apiKeySource}）。这可能导致行为异常。',
  status_auth_conflict_try_token:
    '· 如果你想使用 {tokenSource}：{instruction}',
  status_auth_conflict_try_api_key:
    '· 如果你想使用 {apiKeySource}：{instruction}',
  status_unset_anthropic_api_key:
    '请取消设置 ANTHROPIC_API_KEY 环境变量，或运行 claude /logout，并在登录前对 API Key 授权提示选择“No”。',
  status_unset_api_key_helper: '请取消 apiKeyHelper 设置。',
  status_logout: '请运行 claude /logout。',
  status_logout_claude_ai: '请运行 claude /logout，退出 claude.ai 登录。',
  status_unset_env_var: '请取消设置 {name} 环境变量。',
  status_large_agent_descriptions:
    'Agent 描述累计过大，可能影响性能（约 {count} tokens > {max}）',
  status_manage_agents: '· 使用 /agents 管理',
  status_install_jetbrains_plugin:
    '请从 JetBrains Marketplace 安装 {ideName} 插件：',

  footer_press_again_to_exit: '再按一次 {key} 退出',
  footer_pasting_text: '正在粘贴文本…',
  footer_waiting_duration: '等待中 {duration}',
  footer_shortcuts_hint: '? 查看快捷键',

  help_bash_mode: '! 进入 Bash 模式',
  help_commands: '/ 打开命令',
  help_file_paths: '@ 引用文件路径',
  help_background: '& 放到后台执行',
  help_side_question: '/btw 提问旁支问题',
  help_double_esc: '连按两次 Esc 清空输入',
  help_auto_accept_edits: '自动接受修改',
  help_verbose_output: '查看详细输出',
  help_toggle_tasks: '切换任务列表',
  help_terminal: '打开终端面板',
  help_undo: '撤销',
  help_suspend: 'ctrl + z 挂起',
  help_paste_images: '粘贴图片',
  help_switch_model: '切换模型',
  help_toggle_fast_mode: '切换快速模式',
  help_stash_prompt: '暂存当前输入',
  help_edit_in_editor: '用 $EDITOR 编辑',
  help_customize_keybindings: '/keybindings 自定义快捷键',
  help_newline_shift_enter: 'shift + Enter 换行',
  help_newline_backslash_return: '\\ + Enter 换行',
  help_newline_backslash_word: '使用反斜杠 (\\) + Enter 换行',
  logo_sandbox_warning: '你的 Bash 命令将被沙箱限制。可通过 /sandbox 关闭。',
}

export type TranslationKey = keyof typeof enUS

function isUiLanguage(value: string | undefined): value is UiLanguage {
  return !!value && UI_LANGUAGES.includes(value as UiLanguage)
}

function interpolate(template: string, values?: TranslationValues): string {
  if (!values) {
    return template
  }

  return template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key)
      ? String(values[key])
      : `{${key}}`,
  )
}

export function getUiLanguage(): UiLanguage {
  const envLanguage = process.env.CLAUDE_CODE_UI_LANGUAGE
  if (isUiLanguage(envLanguage)) {
    return envLanguage
  }

  const configuredLanguage = getGlobalConfig().uiLanguage
  if (configuredLanguage) {
    return configuredLanguage
  }

  return getSystemLocaleLanguage() === 'zh' ? 'zh-CN' : 'en-US'
}

export function isChineseUi(): boolean {
  return getUiLanguage() === 'zh-CN'
}

export function t(key: TranslationKey, values?: TranslationValues): string {
  const dictionary = getUiLanguage() === 'zh-CN' ? zhCN : enUS
  return interpolate(dictionary[key] ?? enUS[key], values)
}
