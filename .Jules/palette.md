## 2026-04-16 - Accessible IconButtons
**Learning:** Found a systematic lack of accessible labels and tooltips on icon-only buttons across the design system components in this app. Relying solely on icons without labels severely hurts keyboard accessibility, screen-reader navigation, and general UX by hiding feature intents.
**Action:** Always wrap IconButtons or other icon-only buttons with a Tooltip providing a descriptive title and attach an aria-label to the button itself for screen reader users.
