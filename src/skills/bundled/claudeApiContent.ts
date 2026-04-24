const PLACEHOLDER =
  'This Claude API skill reference file was not included in the extracted source bundle.'

// @[MODEL LAUNCH]: Update the model IDs/names below. These are substituted into {{VAR}}
// placeholders in the .md files at runtime before the skill prompt is sent.
// After updating these constants, manually update the two files that still hardcode models:
//   - claude-api/SKILL.md (Current Models pricing table)
//   - claude-api/shared/models.md (full model catalog with legacy versions and alias mappings)
export const SKILL_MODEL_VARS = {
  OPUS_ID: 'claude-opus-4-6',
  OPUS_NAME: 'Claude Opus 4.6',
  SONNET_ID: 'claude-sonnet-4-6',
  SONNET_NAME: 'Claude Sonnet 4.6',
  HAIKU_ID: 'claude-haiku-4-5',
  HAIKU_NAME: 'Claude Haiku 4.5',
  // Previous Sonnet ID — used in "do not append date suffixes" example in SKILL.md.
  PREV_SONNET_ID: 'claude-sonnet-4-5',
} satisfies Record<string, string>

export const SKILL_PROMPT: string = PLACEHOLDER

export const SKILL_FILES: Record<string, string> = {
  'csharp/claude-api.md': PLACEHOLDER,
  'curl/examples.md': PLACEHOLDER,
  'go/claude-api.md': PLACEHOLDER,
  'java/claude-api.md': PLACEHOLDER,
  'php/claude-api.md': PLACEHOLDER,
  'python/agent-sdk/README.md': PLACEHOLDER,
  'python/agent-sdk/patterns.md': PLACEHOLDER,
  'python/claude-api/README.md': PLACEHOLDER,
  'python/claude-api/batches.md': PLACEHOLDER,
  'python/claude-api/files-api.md': PLACEHOLDER,
  'python/claude-api/streaming.md': PLACEHOLDER,
  'python/claude-api/tool-use.md': PLACEHOLDER,
  'ruby/claude-api.md': PLACEHOLDER,
  'shared/error-codes.md': PLACEHOLDER,
  'shared/live-sources.md': PLACEHOLDER,
  'shared/models.md': PLACEHOLDER,
  'shared/prompt-caching.md': PLACEHOLDER,
  'shared/tool-use-concepts.md': PLACEHOLDER,
  'typescript/agent-sdk/README.md': PLACEHOLDER,
  'typescript/agent-sdk/patterns.md': PLACEHOLDER,
  'typescript/claude-api/README.md': PLACEHOLDER,
  'typescript/claude-api/batches.md': PLACEHOLDER,
  'typescript/claude-api/files-api.md': PLACEHOLDER,
  'typescript/claude-api/streaming.md': PLACEHOLDER,
  'typescript/claude-api/tool-use.md': PLACEHOLDER,
}
