## 2025-02-23 - Accessibility of Icon Buttons in Material UI
**Learning:** The `<IconButton>` component in Material UI frequently lacks an accessible name when it only contains an icon (e.g. `<AddIcon />`, `<FavoriteIcon />`). Without an `aria-label` or visible label, screen readers will announce these as "button", which is not descriptive of the action.
**Action:** Add `aria-label` to `<IconButton>` elements across components. Ensure that tooltips are also considered for sighted users if the icon is not universally understood.
