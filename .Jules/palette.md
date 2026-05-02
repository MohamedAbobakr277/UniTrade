## 2024-05-24 - Accessibility Pattern: Icon-Only Buttons
**Learning:** Found a recurring pattern where `IconButton` components were being used in the application without `aria-label` attributes or visible labels, limiting accessibility for screen-reader users and general usability.
**Action:** When implementing icon-only buttons (like `IconButton` from MUI), always ensure they are wrapped in a `Tooltip` component to provide visual context on hover/focus, and always include descriptive `aria-label` attributes directly on the button element for screen readers.
