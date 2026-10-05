## 2026-10-05 - Add tooltip to ItemCard favorite button
**Learning:** Icon-only buttons lacking `aria-label` or `Tooltip` can cause both visual confusion and accessibility hurdles, especially when dynamically toggling state.
**Action:** Always wrap icon-only buttons with a `Tooltip` and provide a semantic `aria-label` to provide context for both sighted and screen-reader users.
