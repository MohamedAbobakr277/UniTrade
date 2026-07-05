## 2024-07-05 - Dynamic Accessible Labels for State Toggles
**Learning:** Icon-only toggle buttons (like favorites) need dynamic `aria-label`s and Tooltips that change based on state (e.g., 'Add to favorites' vs 'Remove from favorites') to accurately convey their current function to screen reader and sighted users.
**Action:** Always wrap toggleable icon buttons in a Tooltip and provide a state-dependent aria-label.
