## 2024-07-01 - ItemCard Favorite IconButton Tooltip and ARIA Label
**Learning:** Icon-only buttons used for state toggling (like favorites) need accessible labels that change according to state.
**Action:** Add dynamic `aria-label` and wrap the `IconButton` in a `Tooltip` to provide accessible tooltips to visually impaired users and screen readers, making it clear whether clicking will add or remove the favorite.
