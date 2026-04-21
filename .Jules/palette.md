## 2024-04-21 - Icon-Only Button Accessibility in ItemCard
**Learning:** The `ItemCard` component uses Material UI's `IconButton` for actions like "favorite", but these lack text labels, making them inaccessible to screen readers and potentially confusing without hover context.
**Action:** Always wrap `IconButton` components in a `<Tooltip>` and provide a descriptive `aria-label` to ensure both visual and programmatic accessibility.
