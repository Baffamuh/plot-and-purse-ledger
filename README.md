# Plot And Purse Ledger

# PROPERTY SALES WORKSHEET & TRANSACTION LEDGER SYSTEM

Build a fast, mobile-friendly, production-ready Sales Worksheet and Transaction Tracker for recording, managing, and auditing all land and property sales.

## 1. PURPOSE & CORE WORKFLOW
A digital worksheet and ledger designed for back-office staff and field agents to record every completed or ongoing property sale, search through sales records instantly, export data to Excel/CSV, and print official sales slips/receipts.

## 2. DATA FIELDS REQUIRED PER SALE RECORD
Each sale entry must capture:
- BUYER DETAILS:
  * Full Name of Buyer
  * Buyer Phone Number & WhatsApp
  * Buyer Address & State/LGA
  * Next of Kin / Alternate Contact (optional)

- AGENT DETAILS:
  * Agent Full Name
  * Agent Phone Number
  * Agent Code / ID (e.g. AGT-001)
  * Agent Commission / Fee (₦ or % - optional)

- PROPERTY SPECIFICATIONS:
  * Property Reference Code (e.g. RHM-S-RL-001 or G10-S-RL-001)
  * Property Title / Description
  * Property Category: Residential Land, Commercial Land, House (Completed / Semi-completed / Incomplete), Shop, Farm
  * Exact Address / Location / Zone (e.g. Azare Central, Fatara, Chara-Chara)
  * Plot / House / Unit Number (e.g. Plot 14, Block B)
  * Plot Dimensions / Size (e.g. 50ft × 100ft / 464.5 m²)
  * General Property Information & Notes (boundaries, beacons, special terms)

- FINANCIAL & TRANSACTION DETAILS:
  * Sale Date
  * Total Agreed Price in Nigerian Naira (₦)
  * Amount Paid to Date (₦)
  * Outstanding Balance (₦, auto-calculated)
  * Payment Status: Fully Paid (Green), Installment / Easy Buy (Blue), Deposit (Yellow)
  * Payment Method: Bank Transfer, Bank Draft, Cash, POS
  * Payment Reference / Teller Number
  * Receipt / Sale Slip Number (auto-generated e.g. SLS-2026-0001)

## 3. KEY SCREENS & FEATURES

### A. Dashboard & Metrics (Top Summary Bar)
- Total Sales Revenue (₦)
- Total Properties / Plots Sold
- Total Outstanding / Pending Payments (₦)
- Top Performing Selling Agents (units and value)
- Monthly & Weekly sales breakdown cards

### B. Interactive Master Worksheet (Spreadsheet View)
- Responsive Excel-like data grid with sticky header and horizontal scroll on smaller screens.
- Mobile Card View toggle for phone screens so agents can review records easily on the field.
- Live Real-Time Search: search across buyer name, buyer phone, agent name, agent phone, property ref, or plot number.
- Multi-Filter Bar: filter by Property Type, Payment Status, Agent, Zone/Location, and Date Range.
- Quick Stats summary underneath showing sum of visible filtered rows.

### C. "Record New Sale" Modal / Form
- Clean, stepped or grouped form (Buyer Info -> Agent Info -> Property Info -> Financials).
- Auto-computes balance when agreed price and amount paid are entered.
- Reference number generator and receipt number generator.
- Validation: requires Buyer Name, Agent Phone, Property Type, and Sale Price.

### D. Export & Printing
- "Export to Excel / CSV" button: downloads the current filtered worksheet with one click.
- "Print Sale Record / Receipt": generates a clean, branded A4-ready printable transaction slip showing company header, buyer info, property info, payment breakdown, and signature lines for Buyer, Agent, and Company Director.

### E. Storage
- Use a browser-local store (localStorage) pre-seeded with 5 realistic sample transactions across Azare so the app looks complete and testable immediately upon loading.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://plot-and-purse-ledger.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/13700419-2064-4de9-81b0-88623befef0b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
