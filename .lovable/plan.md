# Property Sales Worksheet & Ledger

## Build
- Replace the home-page placeholder with a practical sales desk: summary figures, a searchable/filterable worksheet, and mobile record cards.
- Keep sale records in browser local storage and load five realistic Azare-area example sales on first visit only.
- Add a grouped sale-entry dialog with required-field checks, generated sale and receipt references, and an automatically calculated balance.
- Support editing/printing individual sale slips and exporting currently visible records as CSV.
- Use the existing semantic design tokens, add focused tests for balance calculation and filtering, and set complete page-specific metadata.

## Technical details
- Keep the data model and pure worksheet calculations in a small reusable module; use local storage only from client effects and event handlers.
- Use the browser print dialog with a dedicated receipt print layout; no server or account system is required.