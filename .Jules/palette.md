## 2026-05-22 - Missing ARIA Labels & Tooltips on IconButtons
**Learning:** The application frequently uses Material UI's `<IconButton>` components for primary actions (such as favoriting items) without providing screen reader labels (`aria-label`) or visual context for sighted users. This significantly degrades both accessibility and the overall user experience.
**Action:** Establish a reusable pattern of always wrapping icon-only buttons in a `<Tooltip>` and providing descriptive, dynamic `title` and `aria-label` attributes reflecting the current state of the button.
