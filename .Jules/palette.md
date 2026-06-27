## 2024-05-24 - Dynamic ARIA and Tooltips for Toggle Buttons
**Learning:** Icon-only toggle buttons (like favorites) are a common pattern, but their states are often unclear to screen reader users if the `aria-label` doesn't update dynamically. Tooltips enhance clarity for sighted users but need to sync with the toggle state to avoid confusing "Add" when it's already added.
**Action:** Always wrap toggleable `<IconButton>` components in a `<Tooltip>` with a dynamic title, and ensure the `aria-label` on the button itself updates to match the current state.
