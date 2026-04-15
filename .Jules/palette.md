## 2024-04-15 - Missing ARIA Labels and Tooltips on IconButtons
**Learning:** Found an accessibility issue pattern specific to this app's components: Material UI `<IconButton>` components are frequently used without `aria-label` attributes and without being wrapped in `<Tooltip>` components, making them inaccessible to screen readers and lacking context for sighted users.
**Action:** Always wrap `<IconButton>` components in `<Tooltip>` and add descriptive `aria-label` attributes when implementing or modifying icon-only buttons.
