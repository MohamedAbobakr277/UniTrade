## 2024-05-12 - Added Tooltip and ARIA label to ItemCard favorite button
**Learning:** Icon-only buttons without Tooltip and aria-label present major accessibility hurdles for screen reader users and discoverability issues for sighted users, and fixing this ensures basic a11y compliance.
**Action:** Always wrap `<IconButton>` tags that contain only icons (e.g. `<FavoriteIcon />`) with `<Tooltip>` components and provide a descriptive `aria-label` attribute on the button itself.
