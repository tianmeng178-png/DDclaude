# 交互式 Provider 配置

这个版本已经支持接近 OpenClaw 的交互式配置流程，用户不需要先手动设置一堆环境变量。

## 推荐用法

在项目根目录执行：

```powershell
.\claude.cmd auth setup
```

然后按终端界面依次完成：

1. 选择 provider
2. 输入 API Key
3. 输入模型 ID
4. 保存配置
5. 直接启动 `.\claude.cmd`

## 当前支持的 Provider

- `Anthropic account`
- `Anthropic Console`
- `MiniMax`
- `DashScope`
- `Tencent Hunyuan`
- `DeepSeek`
- `Z.AI GLM`
- `OpenRouter`
- `Custom compatible gateway`

## 配置保存位置

交互式选择结果会保存到 Claude Code 的全局配置中。配置完成后，后续通常只需要执行：

```powershell
.\claude.cmd
```

不再需要每次重新导出 provider 环境变量。

## 首次启动

首次启动时，onboarding 里也会包含同一套 provider 选择流程。

如果后面想重新切换 provider，可以随时再次执行：

```powershell
.\claude.cmd auth setup
```

## 中文界面

这套交互界面已经接入第一版中文语言层，以下内容会优先显示为简体中文：

- 欢迎页
- onboarding
- `auth setup`
- 模式名
- 状态提示
- 底部帮助和快捷提示
- 相对时间和部分数字格式

语言优先级如下：

1. 环境变量 `CLAUDE_CODE_UI_LANGUAGE`
2. 全局配置里的 `uiLanguage`
3. 系统语言环境

### 临时切换为中文

```powershell
$env:CLAUDE_CODE_UI_LANGUAGE = "zh-CN"
.\claude.cmd
```

### 持久化为中文

编辑 `%USERPROFILE%\.claude.json`，加入：

```json
{
  "uiLanguage": "zh-CN"
}
```

目前仍有少量深层文案和部分命令帮助保持英文，这是当前阶段的预期表现。

## 模型选择

DeepSeek、Z.AI GLM 和 OpenRouter 会在 `auth setup` 中显示推荐模型列表。列表基于官方文档和 OpenRouter Models API 在 2026-04-25 的结果整理，同时保留 `Custom model ID` 入口，方便用户手动输入后续新增模型。

### DeepSeek

- `deepseek-v4-pro`
- `deepseek-v4-flash`
- `deepseek-chat`
- `deepseek-reasoner`

### Z.AI GLM

- `glm-5.1`
- `glm-5-turbo`
- `glm-5`
- `glm-4.7`
- `glm-4.7-flash`
- `glm-4.6`

### OpenRouter

- `anthropic/claude-sonnet-4.6`
- `anthropic/claude-opus-4.7`
- `deepseek/deepseek-v4-pro`
- `deepseek/deepseek-v4-flash`
- `z-ai/glm-5.1`
- `qwen/qwen3.6-plus`
- `moonshotai/kimi-k2.6`
- `openrouter/pareto-code`
- `openai/gpt-5.5`
- `openai/gpt-5.5-pro`

## 说明

- 兼容 provider 的配置会自动映射到内部 Anthropic-compatible 运行时。
- 如果你已经接入 MiniMax、DashScope、Hunyuan、DeepSeek、Z.AI GLM、OpenRouter 或自定义兼容网关，通常不需要自己手动再配 `ANTHROPIC_BASE_URL`。
