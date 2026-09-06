## 2024-09-06 - Material-UI Tooltip Delay
**Learning:** When using Playwright to visually verify Material UI `<Tooltip>` components, an explicit wait (e.g., `page.wait_for_timeout(500)`) is required after the `.hover()` action to account for the component's built-in fade-in transition delay before capturing a screenshot.
**Action:** Always include a wait before taking a screenshot when interacting with components that rely on CSS transitions or animations like Tooltips in this codebase.
