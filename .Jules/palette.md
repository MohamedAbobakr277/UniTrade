## 2024-04-29 - Added Tooltips to Icon-Only Buttons
**Learning:** Icon-only buttons (like Favorite, Notifications, and Sell) were missing context for sighted users via tooltips and lacked `aria-label`s for screen readers.
**Action:** Always wrap `IconButton` components with `Tooltip` and add descriptive `aria-label`s to improve accessibility and provide necessary context.
