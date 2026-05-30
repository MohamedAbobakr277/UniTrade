## 2024-05-30 - Tooltips on Absolutely Positioned Buttons
**Learning:** Material-UI's `<Tooltip>` component clones its direct child to inject event handlers and refs without adding extra wrapper DOM elements by default. This makes it safe to wrap absolutely positioned elements (like `<IconButton>`) without disrupting their layout.
**Action:** Always wrap icon-only buttons with `<Tooltip>` components to provide visual context for sighted users, and add `aria-label`s to the buttons for screen readers, even when the buttons are absolutely positioned within a container.
