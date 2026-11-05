## 2024-03-24 - Accessibility improvements for Icon Buttons
**Learning:** Icon buttons without ARIA labels or tooltips are inaccessible to screen readers and confusing for users who aren't familiar with the icons. In this app, many core interactions (like adding to favorites or toggling dark mode) rely entirely on icon buttons.
**Action:** Always wrap icon buttons in a Tooltip and provide a clear, descriptive `aria-label` attribute. This serves a dual purpose: improving accessibility for screen readers and providing visual context via the tooltip for sighted users.
