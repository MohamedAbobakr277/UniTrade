## 2026-09-29 - Dynamic ARIA Labels and Tooltips for Icon-Only Buttons
**Learning:** Icon-only toggle buttons (like favorites) often lack dynamic ARIA labels and tooltips, causing screen reader and general user confusion about the current state. Furthermore, duplicate CSS property keys (like `fontSize`) in Material UI `sx` blocks cause Vite production builds to abort.
**Action:** Always add conditionally rendered `aria-label` and `title` (via `Tooltip`) attributes to stateful icon-only buttons. Ensure there are no duplicate CSS property keys within `sx` objects to prevent build failures.
