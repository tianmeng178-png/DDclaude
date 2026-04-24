# Claude Code Revival 中国大陆模型接入说明

这个仓库现在不只支持 MiniMax，而是增加了一层统一的 `Anthropic-compatible` 兼容接入层，目标是在尽量保留 Claude Code 原始 agent 架构的前提下，支持中国大陆常见的大模型网关。

当前内置的接入 profile：

- `MiniMax`
- `DashScope`
- `Tencent Hunyuan`
- 通用 `Anthropic-compatible` 自定义网关

## 推荐方式：交互式配置

从项目根目录执行：

```powershell
.\claude.cmd auth setup
```

然后在终端界面里：

1. 选择 provider
2. 输入 API key
3. 输入模型 ID
4. 保存配置
5. 直接执行 `.\claude.cmd`

这是当前最推荐的路径，比较接近 OpenClaw 的使用方式。

## 快速检查

你可以先确认启动器正常：

```powershell
.\claude.cmd --version
.\claude.cmd --help
```

也可以直接通过 Bun 调起：

```powershell
bun run claude -- --version
bun run claude -- --help
```

## 环境变量方式

如果你暂时不想走交互式配置，也可以继续用环境变量。

### 1. MiniMax

```powershell
$env:CLAUDE_CODE_USE_MINIMAX = "1"
$env:MINIMAX_API_KEY = "your-minimax-key"
$env:MINIMAX_MODEL = "MiniMax-M2.7"
.\claude.cmd
```

默认会映射到：

- `ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic`
- `ANTHROPIC_AUTH_TOKEN=<MINIMAX_API_KEY>`

### 2. DashScope

```powershell
$env:CLAUDE_CODE_USE_DASHSCOPE = "1"
$env:DASHSCOPE_API_KEY = "your-dashscope-key"
$env:DASHSCOPE_MODEL = "qwen3.6-plus"
.\claude.cmd
```

默认会映射到类似：

- `ANTHROPIC_BASE_URL=https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy?model=qwen3.6-plus`
- `ANTHROPIC_AUTH_TOKEN=<DASHSCOPE_API_KEY>`

### 3. 腾讯混元

```powershell
$env:CLAUDE_CODE_USE_HUNYUAN = "1"
$env:HUNYUAN_API_KEY = "your-hunyuan-key"
$env:HUNYUAN_MODEL = "hunyuan-2.0-thinking-20251109"
.\claude.cmd
```

默认会映射到：

- `ANTHROPIC_BASE_URL=https://api.hunyuan.cloud.tencent.com/anthropic`
- `ANTHROPIC_AUTH_TOKEN=<HUNYUAN_API_KEY>`

### 4. 通用 Anthropic-compatible 网关

```powershell
$env:CLAUDE_CODE_USE_ANTHROPIC_COMPATIBLE = "1"
$env:CLAUDE_CODE_COMPAT_PROVIDER = "anthropic-compatible"
$env:CLAUDE_CODE_COMPAT_PROVIDER_NAME = "My Gateway"
$env:CLAUDE_CODE_COMPAT_BASE_URL = "https://your-gateway.example.com/anthropic"
$env:CLAUDE_CODE_COMPAT_API_KEY = "your-key"
$env:CLAUDE_CODE_COMPAT_MODEL = "your-model-id"
.\claude.cmd
```

如果你的网关不是单模型，也可以补充这些可选变量：

- `CLAUDE_CODE_COMPAT_SONNET_MODEL`
- `CLAUDE_CODE_COMPAT_OPUS_MODEL`
- `CLAUDE_CODE_COMPAT_HAIKU_MODEL`
- `CLAUDE_CODE_COMPAT_SMALL_FAST_MODEL`
- `CLAUDE_CODE_COMPAT_SUBAGENT_MODEL`

## `settings.json` 方式

兼容层已经接入启动器和 settings 加载链路，所以不只是 shell 临时环境变量可用，`%USERPROFILE%\.claude\settings.json` 也能直接使用。

先准备：

`%USERPROFILE%\.claude.json`

```json
{
  "hasCompletedOnboarding": true
}
```

`%USERPROFILE%\.claude\settings.json`

```json
{
  "env": {
    "CLAUDE_CODE_COMPAT_PROVIDER": "dashscope",
    "CLAUDE_CODE_COMPAT_PROVIDER_NAME": "DashScope",
    "CLAUDE_CODE_COMPAT_API_KEY": "replace-with-your-key",
    "CLAUDE_CODE_COMPAT_MODEL": "qwen3.6-plus"
  }
}
```

如果想显式覆盖网关地址，也可以写成：

```json
{
  "env": {
    "CLAUDE_CODE_COMPAT_PROVIDER": "anthropic-compatible",
    "CLAUDE_CODE_COMPAT_PROVIDER_NAME": "Custom Mainland Gateway",
    "CLAUDE_CODE_COMPAT_BASE_URL": "https://your-gateway.example.com/anthropic",
    "CLAUDE_CODE_COMPAT_API_KEY": "replace-with-your-key",
    "CLAUDE_CODE_COMPAT_MODEL": "your-model-id",
    "CLAUDE_CODE_COMPAT_SUBAGENT_MODEL": "your-model-id"
  }
}
```

## 中文界面

当前版本已经接入第一版中文语言层，中文系统通常会自动优先显示中文界面。如果你想手动指定，可以用下面两种方式。

### 临时切换

```powershell
$env:CLAUDE_CODE_UI_LANGUAGE = "zh-CN"
.\claude.cmd
```

### 持久化配置

编辑 `%USERPROFILE%\.claude.json`：

```json
{
  "uiLanguage": "zh-CN"
}
```

当前已经中文化的核心区域包括：

- 首屏欢迎区
- onboarding
- `auth setup`
- 模式名
- 状态提示
- 底部帮助提示
- 相对时间和部分数字格式

## 自动映射的内部变量

只要命中兼容 profile，启动层就会自动补这些 Claude Code / Anthropic SDK 期望的变量：

- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_AUTH_TOKEN` 或 `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_SMALL_FAST_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`
- `CLAUDE_CODE_SUBAGENT_MODEL`
- `ANTHROPIC_CUSTOM_MODEL_OPTION`
- `API_TIMEOUT_MS=3000000`
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`
- `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1`

后面两个默认值的目的，是让兼容网关尽量更稳定：

- 关闭非必要流量，减少额外探测请求
- 默认关闭 first-party-only 实验 beta，降低代理网关出现 400 的概率

## 建议

- 如果你的平台只暴露一个模型，建议主模型和 `CLAUDE_CODE_COMPAT_SUBAGENT_MODEL` 设成同一个。
- 如果你的平台提供多层模型，可以分别配置 `SONNET_MODEL`、`OPUS_MODEL`、`HAIKU_MODEL`。
- 手动直接设置 `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN` 仍然可用，但新的兼容 profile 更适合作为标准入口。

## 官方参考

- [MiniMax Claude Code 接入文档](https://platform.minimax.io/docs/guides/text-ai-coding-tools)
- [阿里云百炼 Claude Code 接入文档](https://help.aliyun.com/zh/model-studio/claude-code)
- [腾讯混元 Claude Code 接入文档](https://cloud.tencent.com/document/product/1729/127293)
