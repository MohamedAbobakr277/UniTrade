## 2026-05-27 - Icon-Only Button Accessibility Pattern
**Learning:** Icon-only buttons (like Material UI's `<IconButton>`) require both an `aria-label` for screen readers and a `Tooltip` wrapper to provide visual context for sighted users without disrupting layout.
**Action:** Always wrap `<IconButton>` components with `<Tooltip>` and explicitly set `aria-label` attributes on the button element itself.
