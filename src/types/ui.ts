export const UI_LANGUAGES = ['en-US', 'zh-CN'] as const

export type UiLanguage = (typeof UI_LANGUAGES)[number]
