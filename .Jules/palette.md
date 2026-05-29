## 2024-05-24 - Tooltips with Absolute Positioning
**Learning:** Material-UI's `<Tooltip>` component clones its direct child to inject event handlers and refs without adding extra wrapper DOM elements by default. This makes it safe to wrap absolutely positioned elements (like `<IconButton>`) in complex layouts without disrupting their positioning.
**Action:** Always wrap icon-only buttons with `<Tooltip>` components and provide descriptive `aria-label`s for accessibility and UX context, especially for common actions like "Add to favorites".
