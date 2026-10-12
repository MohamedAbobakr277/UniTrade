## 2024-10-12 - Missing ARIA Labels on Icon Buttons
**Learning:** Found that `IconButton` elements in Material UI, such as the Dark/Light Mode toggle or Notifications button, often lack `aria-label` attributes. Additionally, providing a `Tooltip` helps users understand the action before interacting.
**Action:** Add `Tooltip` wrappers and `aria-label` attributes to icon-only buttons to improve accessibility and user experience.
