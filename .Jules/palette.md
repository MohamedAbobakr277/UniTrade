## 2024-10-31 - Material UI IconButton Accessibility
**Learning:** Icon-only buttons used for primary interactions (like adding to favorites in cards) frequently miss `aria-label`s and visual context (Tooltips) when implemented with Material UI's `<IconButton>` if not specifically addressed.
**Action:** Always verify `<IconButton>`s are wrapped in `<Tooltip>` and include descriptive `aria-label`s, especially in dynamically rendered lists or cards where context is essential for screen reader users.
