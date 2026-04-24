import type { ReactNode, Ref } from 'react'
import type { DOMElement } from './dom.js'
import type { ClickEvent } from './events/click-event.js'
import type { FocusEvent } from './events/focus-event.js'
import type { KeyboardEvent } from './events/keyboard-event.js'
import type { Styles, TextStyles } from './styles.js'

type InkNodeProps = {
  children?: ReactNode
  ref?: Ref<DOMElement | null>
}

type InkBoxProps = InkNodeProps & {
  style?: Styles
  tabIndex?: number
  autoFocus?: boolean
  stickyScroll?: boolean
  onClick?: (event: ClickEvent) => void
  onFocus?: (event: FocusEvent) => void
  onFocusCapture?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  onBlurCapture?: (event: FocusEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyDownCapture?: (event: KeyboardEvent) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

type InkTextProps = InkNodeProps & {
  style?: Styles
  textStyles?: TextStyles
}

type InkLinkProps = InkNodeProps & {
  href: string
}

type InkRawAnsiProps = {
  rawText: string
  rawWidth: number
  rawHeight: number
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ink-box': InkBoxProps
      'ink-link': InkLinkProps
      'ink-raw-ansi': InkRawAnsiProps
      'ink-text': InkTextProps
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'ink-box': InkBoxProps
      'ink-link': InkLinkProps
      'ink-raw-ansi': InkRawAnsiProps
      'ink-text': InkTextProps
    }
  }
}

export {}
