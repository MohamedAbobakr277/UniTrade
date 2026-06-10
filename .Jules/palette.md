## 2026-06-10 - Adding Tooltips to IconButtons
**Learning:** Material-UI's `<Tooltip>` component clones its direct child to inject event handlers and refs without adding extra wrapper DOM elements by default, making it safe to wrap absolutely positioned elements (like `<IconButton>`) without disrupting their layout.
**Action:** Always wrap icon-only buttons in tooltips to improve accessibility for sighted users and ensure the `aria-label` matches the tooltip title.
