## 2026-11-04 - ItemCard Tooltip UX
**Learning:** Icon-only buttons in Material UI need both an aria-label for screen readers and a Tooltip for sighted users to ensure clear intent, especially for stateful toggles like favorites.
**Action:** Always wrap stateful IconButtons in a Tooltip and provide a dynamic aria-label reflecting the next action.
