// ─── Trailing 12 Months (T12) ─────────────────────────────────────────────

export interface T12Income {
  grossPotentialRent: number;      // Scheduled gross rent if 100% occupied
  otherIncome: number;             // Laundry, parking, pet fees, etc.
  vacancyAndCreditLoss: number;    // Expressed as a positive dollar amount
}

export interface T12Expenses {
  propertyTaxes: number;
  insurance: number;
  utilities: number;
  repairsAndMaintenance: number;
  propertyManagement: number;      // Dollar amount (not %)
  payroll: number;
  generalAndAdmin: number;
  marketing: number;
  capitalReserves: number;         // Replacement reserves
  other: number;
}

export interface T12Data {
  income: T12Income;
  expenses: T12Expenses;
}

// ─── Rent Roll (RR) ────────────────────────────────────────────────────────

export interface RentRollUnit {
  id: string;
  unitType: string;                // e.g. "1BD/1BA"
  squareFeet: number;
  marketRent: number;              // Market / asking rent
  currentRent: number;            // In-place rent
  isOccupied: boolean;
}

export interface RentRollData {
  units: RentRollUnit[];
}

// ─── Debt Quote ────────────────────────────────────────────────────────────

export interface DebtQuote {
  loanAmount: number;
  interestRate: number;            // Annual, expressed as decimal (e.g. 0.065)
  amortizationYears: number;       // e.g. 30
  loanTermYears: number;           // Hold / balloon term, e.g. 10
  isInterestOnly: boolean;
  ioPeriodYears: number;           // Years of interest-only payments
}

// ─── Underwriting Inputs ───────────────────────────────────────────────────

export interface UnderwritingInputs {
  purchasePrice: number;
  closingCostsPct: number;         // As decimal, e.g. 0.02
  t12: T12Data;
  rentRoll: RentRollData;
  debtQuote: DebtQuote;
}

// ─── Underwriting Results ──────────────────────────────────────────────────

export interface T12Summary {
  grossPotentialRent: number;      // Scheduled rent at 100% occupancy (annual)
  effectiveGrossIncome: number;
  totalOperatingExpenses: number;
  netOperatingIncome: number;
  operatingExpenseRatio: number;   // OER as decimal
}

export interface RentRollSummary {
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;           // decimal
  grossPotentialRent: number;      // All units at market rent (annual)
  inPlaceRent: number;             // Occupied units at current rent (annual)
  lossToLease: number;             // Annual gap between market and in-place rents
  averageMarketRent: number;
  averageCurrentRent: number;
  averageSqFt: number;
}

export interface DebtSummary {
  annualDebtService: number;
  monthlyPayment: number;
  loanToValue: number;             // decimal
  loanPerUnit: number;
}

export interface UnderwritingResults {
  // Deal metrics
  purchasePricePerUnit: number;
  totalCapitalRequired: number;    // purchase + closing costs
  equityRequired: number;
  // Income metrics
  t12Summary: T12Summary;
  rentRollSummary: RentRollSummary;
  // Debt metrics
  debtSummary: DebtSummary;
  // Returns
  capRate: number;                 // NOI / Purchase Price (decimal)
  cashOnCash: number;              // Annual cash flow / equity invested (decimal)
  annualCashFlow: number;
  dscr: number;                    // NOI / Annual Debt Service
  grossRentMultiplier: number;     // Purchase Price / Gross Annual Rent
}
