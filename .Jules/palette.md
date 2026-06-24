## 2026-06-24 - ItemCard Favorite Button Accessibility
**Learning:** Icon-only buttons (like the favorite toggle in ItemCard) are frequently missed in accessibility reviews, lacking context for screen reader users and sighted users who may not immediately recognize the icon.
**Action:** Always wrap icon-only '<IconButton>'s in a '<Tooltip>' and provide a descriptive, state-aware 'aria-label'.
