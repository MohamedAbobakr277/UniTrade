## 2024-05-18 - Dynamically updating `aria-label` and `Tooltip` titles on state toggles
**Learning:** For interactive toggle buttons (like favorites), a static `aria-label` is insufficient. The label must dynamically update to represent the *action* that will occur (e.g. "Add to favorites" vs "Remove from favorites") rather than merely declaring what the button is.
**Action:** Always ensure `aria-label` and `Tooltip` values dynamically mirror the component's boolean state for toggleable UI elements.
