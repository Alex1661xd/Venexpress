Responsive QA checklist — Mobile first

Summary
- Goal: Improve mobile experience (80%+ mobile users).
- Changes made:
  - Added mobile hamburger sidebar + overlay in `app/dashboard/layout.tsx` (sidebar hidden on small screens).
  - Reduced default `Card` padding for small screens in `components/ui/Card.tsx` (p-4 sm:p-8).
  - Made page paddings mobile-first (p-4 sm:p-8) for several dashboard pages.
  - Converted several tables to show a friendly mobile-card list on small screens (Transactions, Clients, Beneficiaries, Debt) while keeping a table for desktop.
  - Stacked form grids on narrow screens (grid-cols-1 sm:grid-cols-2) where appropriate.

Pages touched
- app/dashboard/layout.tsx
- app/dashboard/page.tsx
- app/dashboard/transactions/page.tsx
- app/dashboard/transactions/new/page.tsx
- app/dashboard/transactions/[id]/edit/page.tsx
- app/dashboard/clients/page.tsx
- app/dashboard/beneficiaries/page.tsx
- app/dashboard/debt/page.tsx
- components/ui/Card.tsx

Quick local preview
1) Install deps and run dev server:
```bash
npm install
npm run dev
```
2) Open in a browser and test small screens:
- Use Chrome devtools (toggle device toolbar) and check widths 360–430px for phones.
- Confirm sidebar is hidden and toggles with the hamburger.
- Check tables show compact cards on small screens and table on desktop.

Manual QA checklist (minimal)
- [ ] Sidebar: visible on desktop, hidden by default on mobile; hamburger opens overlay menu and closes on backdrop click.
- [ ] Dashboard (home): header and stats display correctly on small screens (numbers readable, no horizontal scroll).
- [ ] Transactions: Table view appears on desktop; on mobile it shows stacked cards with key information and actions.
- [ ] Transactions > New/Edit forms: form stacks into single column, inputs remain usable and buttons are full-width where used.
- [ ] Clients & Beneficiaries: Table replaced with mobile card list on small screens and retains table view on desktop.
- [ ] Debt: banner reduces padding on mobile and table collapses into cards.

Notes / next steps
- Consider further accessibility: increase touch targets and provide ARIA attributes on mobile UI controls.
- Add end-to-end visual regression tests (Cypress + Percy / Playwright snapshots) if you want CI coverage.

If you'd like, I can run the dev server and open a quick guided checklist using automated screenshots (if environment permits), or continue improving other components (Navbar / header / spacing / larger touch targets).