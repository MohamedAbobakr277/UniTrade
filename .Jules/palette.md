## 2026-10-21 - Added Tooltip to ItemCard Favorite Button
**Learning:** Icon-only toggle buttons (like favorites) must dynamically update their `aria-label` and provide a visible Tooltip to be fully accessible for both screen reader users and sighted users, especially in interactive item cards.
**Action:** Add Material UI `Tooltip` components around icon buttons and dynamically update `aria-label` and `title` based on state to ensure clarity.
