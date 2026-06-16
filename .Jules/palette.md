## 2026-06-16 - Dynamic ARIA and Tooltips for Toggleable States
**Learning:** When an icon-only button represents a toggleable state, static ARIA labels and missing tooltips degrade both accessibility and visual UX.
**Action:** Always wrap toggleable icon buttons (like favorites) in a `<Tooltip>` and use dynamically updating `aria-label` and `title` attributes to reflect the current state (e.g., 'Add to favorites' vs 'Remove from favorites').
