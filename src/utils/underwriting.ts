import type {
  T12Data,
  T12Summary,
  RentRollData,
  RentRollSummary,
  DebtQuote,
  DebtSummary,
  UnderwritingInputs,
  UnderwritingResults,
} from "../types";

// ─── T12 Calculations ──────────────────────────────────────────────────────

export function calcT12Summary(t12: T12Data): T12Summary {
  const { income, expenses } = t12;

  const effectiveGrossIncome =
    income.grossPotentialRent +
    income.otherIncome -
    income.vacancyAndCreditLoss;

  const totalOperatingExpenses =
    expenses.propertyTaxes +
    expenses.insurance +
    expenses.utilities +
    expenses.repairsAndMaintenance +
    expenses.propertyManagement +
    expenses.payroll +
    expenses.generalAndAdmin +
    expenses.marketing +
    expenses.capitalReserves +
    expenses.other;

  const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;

  const operatingExpenseRatio =
    effectiveGrossIncome > 0 ? totalOperatingExpenses / effectiveGrossIncome : 0;

  return {
    grossPotentialRent: income.grossPotentialRent,
    effectiveGrossIncome,
    totalOperatingExpenses,
    netOperatingIncome,
    operatingExpenseRatio,
  };
}

// ─── Rent Roll Calculations ────────────────────────────────────────────────

export function calcRentRollSummary(rr: RentRollData): RentRollSummary {
  const { units } = rr;
  const totalUnits = units.length;

  if (totalUnits === 0) {
    return {
      totalUnits: 0,
      occupiedUnits: 0,
      occupancyRate: 0,
      grossPotentialRent: 0,
      inPlaceRent: 0,
      lossToLease: 0,
      averageMarketRent: 0,
      averageCurrentRent: 0,
      averageSqFt: 0,
    };
  }

  const occupiedUnits = units.filter((u) => u.isOccupied).length;
  const occupancyRate = totalUnits > 0 ? occupiedUnits / totalUnits : 0;

  // Monthly → Annual
  const grossPotentialRentMonthly = units.reduce((s, u) => s + u.marketRent, 0);
  const inPlaceRentMonthly = units
    .filter((u) => u.isOccupied)
    .reduce((s, u) => s + u.currentRent, 0);

  const grossPotentialRent = grossPotentialRentMonthly * 12;
  const inPlaceRent = inPlaceRentMonthly * 12;

  // Loss to lease = market rent - in-place rent (for occupied units only)
  const lossToLease =
    units
      .filter((u) => u.isOccupied)
      .reduce((s, u) => s + (u.marketRent - u.currentRent), 0) * 12;

  const averageMarketRent = grossPotentialRentMonthly / totalUnits;
  const averageCurrentRent =
    occupiedUnits > 0 ? inPlaceRentMonthly / occupiedUnits : 0;
  const averageSqFt =
    units.reduce((s, u) => s + u.squareFeet, 0) / totalUnits;

  return {
    totalUnits,
    occupiedUnits,
    occupancyRate,
    grossPotentialRent,
    inPlaceRent,
    lossToLease,
    averageMarketRent,
    averageCurrentRent,
    averageSqFt,
  };
}

// ─── Debt Calculations ─────────────────────────────────────────────────────

/**
 * Calculates the fixed monthly mortgage payment (principal + interest)
 * using the standard amortization formula.
 */
export function calcMonthlyMortgagePayment(
  loanAmount: number,
  annualRate: number,
  amortizationYears: number
): number {
  if (annualRate === 0) {
    return loanAmount / (amortizationYears * 12);
  }
  const r = annualRate / 12;
  const n = amortizationYears * 12;
  return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calcDebtSummary(
  debtQuote: DebtQuote,
  purchasePrice: number,
  totalUnits: number
): DebtSummary {
  const { loanAmount, interestRate, amortizationYears, isInterestOnly } =
    debtQuote;

  let monthlyPayment: number;
  if (isInterestOnly) {
    monthlyPayment = (loanAmount * interestRate) / 12;
  } else {
    monthlyPayment = calcMonthlyMortgagePayment(
      loanAmount,
      interestRate,
      amortizationYears
    );
  }

  const annualDebtService = monthlyPayment * 12;
  const loanToValue = purchasePrice > 0 ? loanAmount / purchasePrice : 0;
  const loanPerUnit = totalUnits > 0 ? loanAmount / totalUnits : 0;

  return {
    annualDebtService,
    monthlyPayment,
    loanToValue,
    loanPerUnit,
  };
}

// ─── Full Underwriting ─────────────────────────────────────────────────────

export function runUnderwriting(inputs: UnderwritingInputs): UnderwritingResults {
  const { purchasePrice, closingCostsPct, t12, rentRoll, debtQuote } = inputs;

  const t12Summary = calcT12Summary(t12);
  const rentRollSummary = calcRentRollSummary(rentRoll);
  const debtSummary = calcDebtSummary(
    debtQuote,
    purchasePrice,
    rentRollSummary.totalUnits
  );

  const totalUnits = rentRollSummary.totalUnits;
  const closingCosts = purchasePrice * closingCostsPct;
  const totalCapitalRequired = purchasePrice + closingCosts;
  const equityRequired = totalCapitalRequired - debtQuote.loanAmount;
  const purchasePricePerUnit = totalUnits > 0 ? purchasePrice / totalUnits : 0;

  const { netOperatingIncome } = t12Summary;
  const { annualDebtService } = debtSummary;

  const capRate = purchasePrice > 0 ? netOperatingIncome / purchasePrice : 0;
  const annualCashFlow = netOperatingIncome - annualDebtService;
  const cashOnCash = equityRequired > 0 ? annualCashFlow / equityRequired : 0;
  const dscr = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;

  // GRM uses gross potential rent from T12
  const grossAnnualRent =
    t12Summary.effectiveGrossIncome > 0
      ? t12.income.grossPotentialRent
      : rentRollSummary.grossPotentialRent;
  const grossRentMultiplier =
    grossAnnualRent > 0 ? purchasePrice / grossAnnualRent : 0;

  return {
    purchasePricePerUnit,
    totalCapitalRequired,
    equityRequired,
    t12Summary,
    rentRollSummary,
    debtSummary,
    capRate,
    cashOnCash,
    annualCashFlow,
    dscr,
    grossRentMultiplier,
  };
}

// ─── Formatting Helpers ────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}
