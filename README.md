# AI Lab Timesheet Generator

Client-side Next.js app that generates randomised timesheet entries for the AI Lab
team and exports them to CSV / Excel. Everything runs in the browser — no backend.

## Team

| Person | Location | Role |
|--------|----------|------|
| Sumit | India | Backend/DevOps Engineer |
| Abhishek | India | AI Developer |
| Dhirendra | India | AI Developer |
| Rajan | India | Frontend Developer |
| Mainak | India | Product Manager & Tester |

## Products & time allocation

Three active products. Each person's time is split across them:

| Product | Description | Allocation |
|---------|-------------|-----------|
| Spark | AI Search Discovery Platform | 30% |
| Radiate | GEO Optimization Tool | 10% |
| Ember | Alpha release — tested by internal users | 60% |

Weights live in [`lib/projects.ts`](lib/projects.ts) (`allocationWeight`). A future
product will be added later and is intentionally not modelled yet.

## IP capitalisation (AASB 138)

Every task category is tagged as **CAPEX** or **OPEX**. The capitalisation rate
**varies month to month** within a policy range of **65–72% capitalised as IP /
28–35% OpEx** — each calendar month gets its own target inside that band:

- **CAPEX — Capitalised (IP):** development-phase work that creates new product
  capability. Capitalised under AASB 138.57 when the six criteria are met.
- **OPEX:** maintenance, support and production-run work, expensed as incurred
  (AASB 138.68). For Mainak, testing that *new features* function as intended is
  treated as a directly attributable development cost (AASB 138.66) and tagged CAPEX,
  while regression/production support and PM admin are OPEX.

Task categories and their tags are defined in [`lib/employees.ts`](lib/employees.ts).

### How the targets are hit

[`lib/generator.ts`](lib/generator.ts):

1. Each working day gets a random total of 7.5–14h (rounded to 0.5h).
2. The day's hours are split across products with a **largest-remainder** method so
   the parts always sum exactly to the daily total and track the 30/10/60 weights.
3. Each product chunk is divided into CAPEX/OPEX carrying the rounding residual
   forward **per month** (error feedback), so each month's CAPEX total converges on
   that month's target (a random value in 65–72%) rather than biasing on each chunk.

Result: aggregates land within ~1% of every target, and all sub-totals reconcile.
The `CapEx vs OpEx` export sheet includes an **Hours by Month and Classification**
breakdown showing the rate for each month.

## Exports

- **CSV** — flat entries incl. a `Cost Type` column.
- **Excel** — three sheets: `Timesheet`, `Product Summary` (hours per product per
  person), and `IP Capitalisation` (CAPEX/OPEX hours and % per person + total).
- **Per employee** — single-person workbook with its own capitalisation snapshot.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```
