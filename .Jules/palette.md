## 2024-11-20 - Adding Tooltips and ARIA Labels to Icon Buttons
**Learning:** Found several icon-only buttons across components (Navbar, AIChatbot, ItemCard) lacking descriptive tooltips and screen reader accessible `aria-label` attributes, affecting accessibility and UX discoverability.
**Action:** Always wrap icon-only buttons (like Dark/Light mode toggles, Favorites, Notifications, Send Message, etc.) with Material-UI `<Tooltip>` and assign descriptive `aria-label` attributes dynamically updating with state.
