## 2024-05-20 - ItemCard Tooltip
**Learning:** Icon-only buttons like the favorite button on `ItemCard` often lack accessible context.
**Action:** Always wrap `IconButton` with `Tooltip` and provide a matching `aria-label` for screen reader accessibility, particularly when the button performs a stateful action like toggling favorites.
