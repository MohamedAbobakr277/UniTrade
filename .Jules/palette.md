## 2024-05-24 - Missing ARIA labels and tooltips on icon buttons
**Learning:** Found several IconButton components across the app (`Navbar.jsx`, `ItemCard.jsx`) that are missing both `aria-label`s for screen readers and `Tooltip`s for sighted users. Since they only display icons (like the Add, Theme toggle, Notification icons), their purpose isn't inherently clear to all users.
**Action:** When creating icon-only buttons, always wrap them in a `<Tooltip title="...">` and provide an explicit `aria-label` to ensure both visual and programmatic accessibility.
