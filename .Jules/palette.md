## 2024-05-18 - Tooltips for Absolute IconButtons
**Learning:** Material UI `<Tooltip>` components clone their child to attach event handlers. They work flawlessly even when wrapping `<IconButton>` elements with absolute positioning, preventing the need for complex wrapper `<div>`s that might break the layout.
**Action:** Confidently wrap absolute-positioned icon-only buttons with `<Tooltip>` directly to fulfill both visual context and screen-reader accessibility requirements via `aria-label`.
