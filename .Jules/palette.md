## 2024-05-24 - Add accessible tooltips and aria-labels to favorite toggle buttons
**Learning:** Icon-only buttons for toggling states (like favorites) in Material UI applications lack context for screen reader users and sighted users who may not immediately recognize the icon's purpose.
**Action:** Always wrap icon-only buttons in Material UI `<Tooltip>` components and provide dynamic `aria-label` attributes that describe the current action (e.g., 'Remove from favorites' vs 'Add to favorites').
