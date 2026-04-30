## 2024-05-24 - Accessibility improvement for icon buttons
**Learning:** The favorite button in the ItemCard component was missing an ARIA label and a tooltip, making it inaccessible for screen readers and providing no context for users.
**Action:** Always wrap icon-only buttons with a Tooltip and provide a descriptive aria-label.
