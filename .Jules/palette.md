## 2024-04-27 - Icon Accessibility Pattern
**Learning:** Icon-only buttons (like Material UI's `<IconButton>`) in this app frequently lack proper `aria-label` attributes and tooltip context, posing an accessibility barrier for screen reader users and missing helpful context for sighted users.
**Action:** Consistently wrap all icon-only buttons with `<Tooltip title="...">` and include descriptive `aria-label`s on the `<IconButton>` tags.
