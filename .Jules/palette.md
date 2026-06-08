## 2024-05-18 - Tooltips on Toggleable Icon Buttons
**Learning:** Material-UI's `Tooltip` components are perfect for wrapping absolutely positioned `IconButton`s. They correctly manage refs without adding wrapper elements that disrupt layout, and when paired with dynamic `aria-label`s, they accurately convey toggleable states (e.g., "Add/Remove from favorites") to both sighted and screen-reader users.
**Action:** Always wrap `IconButton`s in `Tooltip`s and ensure both the `title` and `aria-label` update dynamically to reflect their current toggle state.
