## 2025-02-18 - Tooltips and ARIA Labels for Icon Buttons
**Learning:** Icon-only buttons representing a toggleable state (like favorite/unfavorite) can fail to inform both screen reader and sighted users if they lack dynamic aria-labels and tooltips.
**Action:** When working on interactive UI, always include Tooltip for sighted users and aria-label for screen reader users, making sure they update dynamically to reflect the current state.
