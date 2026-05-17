
## 2024-05-17 - Tooltip wrappers on absolute positioned elements
**Learning:** In Material-UI, the `<Tooltip>` component clones its direct child and injects event handlers and refs without adding an extra wrapper DOM element. This makes it perfect to wrap absolutely positioned elements like an `<IconButton>` without disrupting their layout inside complex components (e.g., inside an image card where `position: absolute` is used).
**Action:** Use `<Tooltip>` directly around the target icon-only buttons (`<IconButton>`) when an `aria-label` is needed, providing both visual context for sighted users and accessibility for screen reader users, without worrying about CSS positioning side-effects.
