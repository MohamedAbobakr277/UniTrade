## 2024-11-09 - Accessible Tooltips for Icon-Only Buttons
**Learning:** The `ItemCard` component contains a favorite button implemented as an icon-only `<IconButton>`. Without an `aria-label` or a `<Tooltip>`, this button lacks accessibility for screen readers and helpful context for users.
**Action:** Add `aria-label` to icon-only buttons for accessibility and wrap them in a `<Tooltip>` to provide visual feedback for all users.
