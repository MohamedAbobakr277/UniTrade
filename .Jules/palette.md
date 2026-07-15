## 2024-07-15 - Dynamic Tooltips for Icon Buttons
**Learning:** When dealing with toggleable icon-only buttons (like Favorite/Unfavorite), static aria-labels and tooltips are insufficient. They must dynamically reflect the *action* that will happen upon clicking, not just the state.
**Action:** Always wrap toggleable icon-buttons in MUI `<Tooltip>` and use ternary operators on the state (e.g. `isFavorite`) to dynamically set both the `title` and `aria-label` attributes.
