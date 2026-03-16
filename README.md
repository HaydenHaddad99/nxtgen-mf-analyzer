# NxtGen MF Analyzer

A **multifamily deal underwriting tool** that evaluates apartment deals using real-world inputs: Trailing 12 Months (T12), Rent Roll (RR), and debt quotes.

## Features

| Module | What it does |
|--------|-------------|
| **T12 (Trailing 12 Months)** | Calculates Effective Gross Income, Net Operating Income, and Operating Expense Ratio from actual trailing income & expense data |
| **Rent Roll** | Summarizes unit mix, physical occupancy, in-place vs. market rents, and loss to lease |
| **Debt Quote** | Models P&I or interest-only loan payments, DSCR, LTV, and annual debt service |
| **Underwriting Summary** | Outputs Cap Rate, Cash-on-Cash, DSCR, GRM, price/unit, equity required, and color-coded performance indicators |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Usage

1. **Deal Overview** – Enter the purchase price and closing cost percentage.
2. **T12** – Enter annual income (GPR, other income, vacancy) and annual operating expenses across all categories.
3. **Rent Roll** – Add units one-by-one or in bulk, specifying unit type, sq ft, market rent, current rent, and occupancy status.
4. **Debt Quote** – Enter loan amount, interest rate, amortization period, loan term, and toggle interest-only if applicable.
5. Click **Analyze Deal** – The results panel appears with color-coded metrics.

## Key Metrics Calculated

- **NOI** = EGI − Total Operating Expenses
- **Cap Rate** = NOI ÷ Purchase Price
- **DSCR** = NOI ÷ Annual Debt Service *(min 1.25× recommended)*
- **Cash-on-Cash** = Annual Cash Flow ÷ Equity Invested
- **GRM** = Purchase Price ÷ Gross Annual Rent
- **Loss to Lease** = (Market Rent − In-Place Rent) for occupied units × 12

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** for bundling
- **Vitest** for unit tests

## Project Structure

```
src/
├── types/           # TypeScript interfaces (T12, RentRoll, DebtQuote, Results)
├── utils/
│   └── underwriting.ts   # Core financial calculation engine
├── components/
│   ├── T12Form.tsx
│   ├── RentRollForm.tsx
│   ├── DebtQuoteForm.tsx
│   └── UnderwritingResults.tsx
├── tests/
│   └── underwriting.test.ts   # 23 unit tests for calculation engine
└── App.tsx          # Main application shell
```
