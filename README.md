# DDclaude

一套面向中国大陆用户体验优化的 Claude Code Revival 实验项目。

DDclaude 的目标是在尽量保留 Claude Code agent 架构和终端交互体验的基础上，补齐中国大陆大模型网关接入、中文界面、本地 Windows 启动体验和交互式 provider 配置流程。

> 说明：这是一个非官方实验项目，不代表 Anthropic 或 Claude Code 官方实现。

## 主要特性

- 兼容 Claude Code 风格的终端 agent 工作流
- 支持交互式 provider 配置，用户可以在终端里选择模型厂商并输入 API Key
- 内置中国大陆常见模型网关接入 profile
- 支持 MiniMax、DashScope、Tencent Hunyuan、DeepSeek、Z.AI GLM、OpenRouter 和自定义 Anthropic-compatible 网关
- 支持第一版中文界面，包括欢迎页、onboarding、认证流程、模式名、状态提示和底部快捷提示
- 支持 Windows 下通过 `claude.cmd` 直接启动
- 保留 `bun run claude` 方式，方便开发调试

## 支持的模型接入

当前内置 provider：

- `Anthropic account`
- `Anthropic Console`
- `MiniMax`
- `DashScope`
- `Tencent Hunyuan`
- `DeepSeek`
- `Z.AI GLM`
- `OpenRouter`
- `Custom compatible gateway`

对中国大陆用户，推荐优先使用交互式配置：

```powershell
.\claude.cmd auth setup
```

配置完成后直接启动：

```powershell
.\claude.cmd
```

## 快速开始

### 1. 克隆项目

```powershell
git clone https://github.com/tianmeng178-png/DDclaude.git
cd DDclaude
```

### 2. 安装 Bun

如果你还没有安装 Bun，请先安装：

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

安装完成后重新打开 PowerShell，并确认：

```powershell
bun --version
```

### 3. 安装依赖

```powershell
bun install
```

### 4. 检查启动器

```powershell
.\claude.cmd --help
```

也可以直接通过 Bun 启动：

```powershell
bun run claude -- --help
```

### 5. 配置模型

```powershell
.\claude.cmd auth setup
```

在界面中选择 provider，输入 API Key 和模型 ID。

新增 provider 会显示推荐模型列表，也可以选择 `Custom model ID` 手动输入还没有收录的新模型。

当前内置推荐模型：

- DeepSeek：`deepseek-v4-pro`、`deepseek-v4-flash`、`deepseek-chat`、`deepseek-reasoner`
- Z.AI GLM：`glm-5.1`、`glm-5-turbo`、`glm-5`、`glm-4.7`、`glm-4.7-flash`、`glm-4.6`
- OpenRouter：`anthropic/claude-sonnet-4.6`、`anthropic/claude-opus-4.7`、`deepseek/deepseek-v4-pro`、`deepseek/deepseek-v4-flash`、`z-ai/glm-5.1`、`qwen/qwen3.6-plus`、`moonshotai/kimi-k2.6`、`openrouter/pareto-code`、`openai/gpt-5.5`、`openai/gpt-5.5-pro`

### 6. 验证模型链路

```powershell
.\claude.cmd -p "只回复：OK"
```

如果返回 `OK`，说明 provider 配置已经生效。

### 7. 进入交互模式

```powershell
.\claude.cmd
```

## 中文界面

DDclaude 会根据系统语言自动优先使用中文界面。你也可以手动指定：

```powershell
$env:CLAUDE_CODE_UI_LANGUAGE = "zh-CN"
.\claude.cmd
```

如果想持久化配置，可以编辑 `%USERPROFILE%\.claude.json`：

```json
{
  "uiLanguage": "zh-CN"
}
```

语言优先级：

1. `CLAUDE_CODE_UI_LANGUAGE`
2. `%USERPROFILE%\.claude.json` 中的 `uiLanguage`
3. 系统语言环境

## 常用命令

```powershell
.\claude.cmd
.\claude.cmd --help
.\claude.cmd --version
.\claude.cmd auth setup
.\claude.cmd -p "只回复：OK"
```

在交互界面里可以尝试：

```text
/status
/model
/help
/resume
/init
```

## Windows 常见问题

### `.\claude.cmd` 看起来卡住

先用非交互模式验证模型链路：

```powershell
.\claude.cmd -p "只回复：连接正常"
```

如果这里能返回内容，说明模型配置大概率没问题，通常是终端 TUI 渲染或首次启动界面残留。可以关闭当前 PowerShell，重新打开一个新终端再试。

更多排障步骤见：

- [Windows 交互模式启动排障](docs/windows-interactive-troubleshooting.md)

### 出现 `Auth conflict` 警告

这通常表示环境里同时存在 `ANTHROPIC_API_KEY` 和 `ANTHROPIC_AUTH_TOKEN`。如果你正在使用 MiniMax、DashScope 或 Hunyuan，通常可以清掉旧的 `ANTHROPIC_API_KEY`：

```powershell
Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue
[Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', $null, 'User')
```

然后重新打开 PowerShell。

## 文档

- [交互式 Provider 配置](docs/auth-setup-ui.md)
- [中国大陆模型接入说明](docs/windows-minimax-setup.md)
- [Windows 交互模式启动排障](docs/windows-interactive-troubleshooting.md)

## 开发命令

```powershell
bun run claude -- --help
bun run claude -- --version
bun run claude -- auth setup
bun run claude -- -p "只回复：OK"
```

## 项目状态

当前项目仍处于实验阶段，已经能完成基础交互、provider 配置和中国大陆模型网关接入，但仍有一些 Claude Code 原始命令处于占位或未完整还原状态。

欢迎围绕以下方向继续迭代：

- 更完整的中文界面
- 更完整的 slash command 还原
- 更稳定的 Windows TUI 体验
- 更细的 provider 能力适配
- 更清晰的安装和发布流程

## License

MIT
