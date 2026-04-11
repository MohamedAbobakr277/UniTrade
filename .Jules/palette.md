## 2024-05-18 - ARIA Labels & Keyboard Events for Custom Icons
**Learning:** MUI `IconButton` components missing `aria-label` were an accessibility gap in `Navbar`, `ItemCard`, and `Footer`. Also discovered that raw SVG icons used as buttons (`ClearIcon`) lacked keyboard accessibility.
**Action:** When adding `onClick` to raw SVG icons, always add `role="button"`, `tabIndex={0}`, and `onKeyDown` (Space/Enter) for keyboard users, or wrap them in an `IconButton`.
