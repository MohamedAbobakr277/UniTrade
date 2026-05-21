## 2026-05-21 - Add Tooltips and ARIA Labels to Icon-Only Buttons
**Learning:** Icon-only buttons (like MUI `<IconButton>`) often lack context for sighted users and are inaccessible to screen readers. Material UI`s `<Tooltip>` component successfully injects event handlers without disrupting absolute positioning or layout, making it a safe choice.
**Action:** Always wrap `<IconButton>` components with `<Tooltip>` to provide visual context, and add descriptive `aria-label` attributes to ensure keyboard accessibility and proper screen reader announcements.
