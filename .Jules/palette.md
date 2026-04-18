## 2024-04-18 - Accessibility Improvement: ItemCard
**Learning:** Icon-only buttons without labels cause accessibility issues for screen reader users and lack context for sighted users when meaning is implicit.
**Action:** Always wrap `IconButton` components with `Tooltip` and provide a descriptive `aria-label` attribute, specifically for favorite toggles across item listings.
