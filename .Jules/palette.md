## 2024-06-09 - Accessible Favorite Button
**Learning:** Icon-only buttons lack context for screen readers and sighted users. Wrapping them in Tooltips and adding aria-labels improves both usability and accessibility without altering the design.
**Action:** Always wrap Material-UI IconButtons in Tooltips and provide dynamic aria-labels when the button toggles state (e.g., "Add to favorites" vs "Remove from favorites").
