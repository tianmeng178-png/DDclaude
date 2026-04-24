# Windows 交互模式启动排障

如果 `.\claude.cmd` 在 Windows 上看起来像“卡住了”，通常不代表模型请求真的卡住，更常见的情况是交互式终端界面没有正确渲染。

在这个项目里，交互启动前通常会经过这些首启界面：

- onboarding
- workspace trust 确认
- provider 配置页

如果终端没有正确渲染 Ink UI，就可能表现成黑屏、空白页、残留旧页面，或者看起来像完全没有反应。

## 先判断是不是模型链路问题

先用非交互模式验证 provider 是否工作正常：

```powershell
$env:CLAUDE_CODE_USE_MINIMAX = "1"
$env:MINIMAX_API_KEY = "your-key"
$env:MINIMAX_MODEL = "MiniMax-M2.7"
.\claude.cmd -p "只回复：连接正常"
```

如果这里能正常输出，说明模型链路是通的，问题主要在交互界面启动或终端渲染，而不是 provider 配置本身。

## 常见现象

以下表现通常都属于交互界面残留或渲染异常：

- 终端一直停在某个旧页面
- `auth setup` 退出后，下一次 `.\claude.cmd` 仍然像停留在旧的输入框
- 屏幕上看到 `Type to enter text`、`Enter to continue` 之类残留提示

遇到这种情况，最简单的做法通常是：

1. 直接关闭当前 PowerShell 窗口或 tab
2. 新开一个全新的终端
3. 重新进入项目目录
4. 再执行 `.\claude.cmd`

## 手动跳过首启界面

首启状态保存在：

```text
%USERPROFILE%\.claude.json
```

如果文件已经存在，请在原有内容上合并，不要直接整份覆盖。

推荐最小配置如下：

```json
{
  "theme": "dark",
  "hasCompletedOnboarding": true,
  "projects": {
    "D:/aiagent/extracted_source": {
      "allowedTools": [],
      "mcpContextUris": [],
      "mcpServers": {},
      "enabledMcpjsonServers": [],
      "disabledMcpjsonServers": [],
      "hasTrustDialogAccepted": true,
      "projectOnboardingSeenCount": 0,
      "hasClaudeMdExternalIncludesApproved": false,
      "hasClaudeMdExternalIncludesWarningShown": false
    }
  }
}
```

注意：

- Windows 下项目路径键必须使用正斜杠
- 只有你确认该目录可信时，才设置 `hasTrustDialogAccepted: true`

之后重新执行：

```powershell
.\claude.cmd
```

## 中文界面设置

如果你希望排障时界面尽量保持中文，可以临时指定：

```powershell
$env:CLAUDE_CODE_UI_LANGUAGE = "zh-CN"
.\claude.cmd
```

也可以在 `%USERPROFILE%\.claude.json` 里加入：

```json
{
  "uiLanguage": "zh-CN"
}
```

## 调试日志

如果交互界面还是异常，可以写启动日志：

```powershell
.\claude.cmd --debug-file .\claude-debug.log
```

然后查看最后 200 行：

```powershell
Get-Content .\claude-debug.log -Tail 200
```

## 相关代码路径

- `src/interactiveHelpers.tsx`：onboarding 和 trust dialog 入口
- `src/components/AuthSetupFlow.tsx`：交互式 provider 配置
- `src/utils/config.ts`：`%USERPROFILE%\.claude.json` 和全局配置加载
