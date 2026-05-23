
## 2024-05-23 - Tooltips & ARIA Labels for Icon-Only Buttons
**Learning:** Many icon-only buttons (`IconButton`) lacked ARIA labels and tooltips, which decreases accessibility for screen readers and UX for all users (since the icon meaning isn't always obvious without text).
**Action:** When adding new icon-only buttons, consistently wrap them in Material UI's `<Tooltip>` component and add a descriptive `aria-label` to the button itself. This single pattern solves both visual context and screen-reader accessibility.
