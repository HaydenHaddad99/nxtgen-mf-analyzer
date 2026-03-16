import { describe, it, expect } from "vitest";
import {
  calcT12Summary,
  calcRentRollSummary,
  calcMonthlyMortgagePayment,
  calcDebtSummary,
  runUnderwriting,
} from "../utils/underwriting";
import type {
  T12Data,
  RentRollData,
  DebtQuote,
  UnderwritingInputs,
} from "../types";

// ─── T12 Tests ─────────────────────────────────────────────────────────────

describe("calcT12Summary", () => {
  const t12: T12Data = {
    income: {
      grossPotentialRent: 600_000,
      otherIncome: 12_000,
      vacancyAndCreditLoss: 30_000,
    },
    expenses: {
      propertyTaxes: 48_000,
      insurance: 18_000,
      utilities: 24_000,
      repairsAndMaintenance: 36_000,
      propertyManagement: 29_760, // 5% of EGI
      payroll: 0,
      generalAndAdmin: 6_000,
      marketing: 2_400,
      capitalReserves: 12_000,
      other: 0,
    },
  };

  it("calculates effective gross income correctly", () => {
    const result = calcT12Summary(t12);
    // 600k + 12k - 30k = 582k
    expect(result.effectiveGrossIncome).toBe(582_000);
  });

  it("returns gross potential rent correctly", () => {
    const result = calcT12Summary(t12);
    expect(result.grossPotentialRent).toBe(600_000);
  });

  it("calculates total operating expenses correctly", () => {
    const result = calcT12Summary(t12);
    // 48k+18k+24k+36k+29.76k+0+6k+2.4k+12k+0 = 176,160
    expect(result.totalOperatingExpenses).toBe(176_160);
  });

  it("calculates NOI correctly", () => {
    const result = calcT12Summary(t12);
    // 582k - 176,160 = 405,840
    expect(result.netOperatingIncome).toBe(405_840);
  });

  it("calculates operating expense ratio correctly", () => {
    const result = calcT12Summary(t12);
    // 176,160 / 582,000 ≈ 0.3027
    expect(result.operatingExpenseRatio).toBeCloseTo(176_160 / 582_000);
  });

  it("handles zero EGI without dividing by zero", () => {
    const zeroT12: T12Data = {
      income: { grossPotentialRent: 0, otherIncome: 0, vacancyAndCreditLoss: 0 },
      expenses: {
        propertyTaxes: 0,
        insurance: 0,
        utilities: 0,
        repairsAndMaintenance: 0,
        propertyManagement: 0,
        payroll: 0,
        generalAndAdmin: 0,
        marketing: 0,
        capitalReserves: 0,
        other: 0,
      },
    };
    const result = calcT12Summary(zeroT12);
    expect(result.operatingExpenseRatio).toBe(0);
  });
});

// ─── Rent Roll Tests ───────────────────────────────────────────────────────

describe("calcRentRollSummary", () => {
  const rr: RentRollData = {
    units: [
      { id: "101", unitType: "1BD/1BA", squareFeet: 750, marketRent: 1_200, currentRent: 1_100, isOccupied: true },
      { id: "102", unitType: "1BD/1BA", squareFeet: 750, marketRent: 1_200, currentRent: 1_200, isOccupied: true },
      { id: "103", unitType: "2BD/2BA", squareFeet: 1_050, marketRent: 1_600, currentRent: 0, isOccupied: false },
      { id: "104", unitType: "2BD/2BA", squareFeet: 1_050, marketRent: 1_600, currentRent: 1_550, isOccupied: true },
    ],
  };

  it("calculates total units", () => {
    expect(calcRentRollSummary(rr).totalUnits).toBe(4);
  });

  it("calculates occupied units", () => {
    expect(calcRentRollSummary(rr).occupiedUnits).toBe(3);
  });

  it("calculates occupancy rate", () => {
    expect(calcRentRollSummary(rr).occupancyRate).toBeCloseTo(0.75);
  });

  it("calculates gross potential rent (annual)", () => {
    // (1200+1200+1600+1600) * 12 = 5600 * 12 = 67,200
    expect(calcRentRollSummary(rr).grossPotentialRent).toBe(67_200);
  });

  it("calculates in-place rent (annual)", () => {
    // occupied: (1100+1200+1550) * 12 = 3850 * 12 = 46,200
    expect(calcRentRollSummary(rr).inPlaceRent).toBe(46_200);
  });

  it("calculates loss to lease (annual)", () => {
    // occupied units: (1200-1100) + (1200-1200) + (1600-1550) = 100+0+50 = 150/mo * 12 = 1800
    expect(calcRentRollSummary(rr).lossToLease).toBe(1_800);
  });

  it("returns zeros for empty rent roll", () => {
    const empty = calcRentRollSummary({ units: [] });
    expect(empty.totalUnits).toBe(0);
    expect(empty.occupancyRate).toBe(0);
    expect(empty.grossPotentialRent).toBe(0);
  });
});

// ─── Debt Tests ────────────────────────────────────────────────────────────

describe("calcMonthlyMortgagePayment", () => {
  it("calculates correct P&I payment", () => {
    // $5M loan, 6.5%, 30yr amortization
    const pmt = calcMonthlyMortgagePayment(5_000_000, 0.065, 30);
    // Standard amortization formula ~ $31,606/mo
    expect(pmt).toBeCloseTo(31_606, -1);
  });

  it("handles zero interest rate", () => {
    // $1,200,000 @ 0%, 10yr → $10,000/mo
    const pmt = calcMonthlyMortgagePayment(1_200_000, 0, 10);
    expect(pmt).toBeCloseTo(10_000);
  });
});

describe("calcDebtSummary", () => {
  const debtQuote: DebtQuote = {
    loanAmount: 4_000_000,
    interestRate: 0.065,
    amortizationYears: 30,
    loanTermYears: 10,
    isInterestOnly: false,
    ioPeriodYears: 0,
  };

  it("calculates LTV", () => {
    const summary = calcDebtSummary(debtQuote, 5_000_000, 20);
    expect(summary.loanToValue).toBeCloseTo(0.8);
  });

  it("calculates loan per unit", () => {
    const summary = calcDebtSummary(debtQuote, 5_000_000, 20);
    expect(summary.loanPerUnit).toBe(200_000);
  });

  it("calculates interest-only payment", () => {
    const ioQuote: DebtQuote = { ...debtQuote, isInterestOnly: true };
    const summary = calcDebtSummary(ioQuote, 5_000_000, 20);
    // $4M * 6.5% / 12 = $21,666.67/mo
    expect(summary.monthlyPayment).toBeCloseTo(21_666.67, 0);
  });
});

// ─── Full Underwriting Test ─────────────────────────────────────────────────

describe("runUnderwriting", () => {
  const inputs: UnderwritingInputs = {
    purchasePrice: 5_000_000,
    closingCostsPct: 0.02,
    t12: {
      income: {
        grossPotentialRent: 600_000,
        otherIncome: 12_000,
        vacancyAndCreditLoss: 30_000,
      },
      expenses: {
        propertyTaxes: 48_000,
        insurance: 18_000,
        utilities: 24_000,
        repairsAndMaintenance: 36_000,
        propertyManagement: 29_100,
        payroll: 0,
        generalAndAdmin: 6_000,
        marketing: 2_400,
        capitalReserves: 12_000,
        other: 0,
      },
    },
    rentRoll: {
      units: Array.from({ length: 20 }, (_, i) => ({
        id: String(i + 1),
        unitType: "2BD/2BA",
        squareFeet: 950,
        marketRent: 2_500,
        currentRent: 2_400,
        isOccupied: true,
      })),
    },
    debtQuote: {
      loanAmount: 3_750_000,
      interestRate: 0.065,
      amortizationYears: 30,
      loanTermYears: 10,
      isInterestOnly: false,
      ioPeriodYears: 0,
    },
  };

  it("calculates price per unit", () => {
    const result = runUnderwriting(inputs);
    expect(result.purchasePricePerUnit).toBe(250_000);
  });

  it("calculates total capital required", () => {
    const result = runUnderwriting(inputs);
    // 5M + 2% = 5.1M
    expect(result.totalCapitalRequired).toBe(5_100_000);
  });

  it("calculates equity required", () => {
    const result = runUnderwriting(inputs);
    // 5.1M - 3.75M = 1.35M
    expect(result.equityRequired).toBe(1_350_000);
  });

  it("calculates positive cap rate", () => {
    const result = runUnderwriting(inputs);
    expect(result.capRate).toBeGreaterThan(0);
    expect(result.capRate).toBeLessThan(1);
  });

  it("calculates DSCR above zero", () => {
    const result = runUnderwriting(inputs);
    expect(result.dscr).toBeGreaterThan(0);
  });

  it("calculates GRM above zero", () => {
    const result = runUnderwriting(inputs);
    expect(result.grossRentMultiplier).toBeGreaterThan(0);
  });
});
