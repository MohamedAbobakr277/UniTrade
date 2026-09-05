## 2024-11-20 - Ensure Tooltips and ARIA Labels on all IconButtons
**Learning:** Icon-only buttons (like Material-UI's IconButton) frequently miss descriptive titles and accessible ARIA labels across the application, degrading screen reader UX and visual clarity. Using a wrapper Tooltip component alongside aria-label improves both desktop and accessibility experiences simultaneously.
**Action:** Consistently wrap IconButtons with Tooltips and add descriptive aria-labels that align with the Tooltip titles for future icon-only actions.
