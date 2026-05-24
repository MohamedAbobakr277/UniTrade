## 2024-05-24 - Tooltips and ARIA Labels on Icon-Only Buttons
**Learning:** Icon-only buttons (like the favorite heart button on ItemCards) need both a visual explanation (Tooltip) and an accessibility label (aria-label) so they are understandable by both sighted users and screen reader users. The Tooltip handles hover interactions, while the aria-label ensures proper accessibility tree semantics.
**Action:** Always wrap `<IconButton>` components with a `<Tooltip>` and include an `aria-label` attribute on the `<IconButton>` itself when the button lacks visible text.
