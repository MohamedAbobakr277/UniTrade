## 2024-05-15 - Dynamic ARIA Labels and Tooltips for Toggles
**Learning:** For toggle-like components (like "Add to favorites"), users rely on accurate state feedback. A static `aria-label` or missing tooltip fails to convey the current state or consequence of the action.
**Action:** When creating icon-only toggle buttons, always conditionally render the `aria-label` and use a `Tooltip` (e.g. `aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}`) to properly describe the dynamic interaction.
