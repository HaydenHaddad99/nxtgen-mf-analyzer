import type { UnderwritingResults } from "../types";
import { formatCurrency, formatPercent, formatNumber } from "../utils/underwriting";

interface Props {
  results: UnderwritingResults;
}

interface MetricRow {
  label: string;
  value: string;
  highlight?: "good" | "warn" | "bad" | "neutral";
  description?: string;
}

function trafficLight(
  value: number,
  thresholds: { good: number; warn: number },
  higherIsBetter = true
): "good" | "warn" | "bad" {
  if (higherIsBetter) {
    if (value >= thresholds.good) return "good";
    if (value >= thresholds.warn) return "warn";
    return "bad";
  } else {
    if (value <= thresholds.good) return "good";
    if (value <= thresholds.warn) return "warn";
    return "bad";
  }
}

export default function UnderwritingResultsPanel({ results }: Props) {
  const {
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
  } = results;

  const dealMetrics: MetricRow[] = [
    { label: "Price / Unit", value: formatCurrency(purchasePricePerUnit), highlight: "neutral" },
    { label: "Total Capital Required", value: formatCurrency(totalCapitalRequired), highlight: "neutral" },
    { label: "Equity Required", value: formatCurrency(equityRequired), highlight: "neutral" },
    { label: "Loan-to-Value (LTV)", value: formatPercent(debtSummary.loanToValue), highlight: "neutral" },
    { label: "Loan / Unit", value: formatCurrency(debtSummary.loanPerUnit), highlight: "neutral" },
  ];

  const t12Metrics: MetricRow[] = [
    { label: "Gross Potential Rent", value: formatCurrency(t12Summary.grossPotentialRent), highlight: "neutral" },
    { label: "Effective Gross Income", value: formatCurrency(t12Summary.effectiveGrossIncome), highlight: "neutral" },
    { label: "Total Operating Expenses", value: formatCurrency(t12Summary.totalOperatingExpenses), highlight: "neutral" },
    {
      label: "Operating Expense Ratio",
      value: formatPercent(t12Summary.operatingExpenseRatio),
      highlight: trafficLight(t12Summary.operatingExpenseRatio, { good: 0.5, warn: 0.6 }, false),
      description: "Lower is better. Typical MF range: 40–55%",
    },
    { label: "Net Operating Income (NOI)", value: formatCurrency(t12Summary.netOperatingIncome), highlight: t12Summary.netOperatingIncome > 0 ? "good" : "bad" },
  ];

  const rrMetrics: MetricRow[] = [
    { label: "Total Units", value: String(rentRollSummary.totalUnits), highlight: "neutral" },
    {
      label: "Occupancy Rate",
      value: formatPercent(rentRollSummary.occupancyRate),
      highlight: trafficLight(rentRollSummary.occupancyRate, { good: 0.93, warn: 0.88 }),
      description: "Physical occupancy",
    },
    { label: "Avg Market Rent / Unit", value: formatCurrency(rentRollSummary.averageMarketRent) + "/mo", highlight: "neutral" },
    { label: "Avg In-Place Rent / Unit", value: formatCurrency(rentRollSummary.averageCurrentRent) + "/mo", highlight: "neutral" },
    { label: "Avg Sq Ft / Unit", value: formatNumber(rentRollSummary.averageSqFt, 0) + " sf", highlight: "neutral" },
    {
      label: "Loss to Lease (Annual)",
      value: formatCurrency(rentRollSummary.lossToLease),
      highlight: rentRollSummary.lossToLease > 0 ? "warn" : "good",
      description: "Gap between market and in-place rents",
    },
  ];

  const debtMetrics: MetricRow[] = [
    { label: "Monthly Payment", value: formatCurrency(debtSummary.monthlyPayment) + "/mo", highlight: "neutral" },
    { label: "Annual Debt Service", value: formatCurrency(debtSummary.annualDebtService), highlight: "neutral" },
  ];

  const returnMetrics: MetricRow[] = [
    {
      label: "Cap Rate",
      value: formatPercent(capRate),
      highlight: trafficLight(capRate, { good: 0.055, warn: 0.045 }),
      description: "NOI ÷ Purchase Price",
    },
    {
      label: "DSCR",
      value: formatNumber(dscr),
      highlight: trafficLight(dscr, { good: 1.25, warn: 1.1 }),
      description: "NOI ÷ Annual Debt Service. Min 1.25× preferred",
    },
    {
      label: "Annual Cash Flow",
      value: formatCurrency(annualCashFlow),
      highlight: annualCashFlow >= 0 ? "good" : "bad",
    },
    {
      label: "Cash-on-Cash Return",
      value: formatPercent(cashOnCash),
      highlight: trafficLight(cashOnCash, { good: 0.08, warn: 0.05 }),
      description: "Annual cash flow ÷ Equity invested",
    },
    {
      label: "Gross Rent Multiplier (GRM)",
      value: formatNumber(grossRentMultiplier),
      highlight: trafficLight(grossRentMultiplier, { good: 12, warn: 15 }, false),
      description: "Purchase Price ÷ Gross Annual Rent. Lower is better.",
    },
  ];

  return (
    <div className="results-panel">
      <h2 className="results-title">📋 Underwriting Summary</h2>

      <ResultsSection title="Deal Metrics" rows={dealMetrics} />
      <ResultsSection title="T12 Income & Expenses" rows={t12Metrics} />
      <ResultsSection title="Rent Roll Summary" rows={rrMetrics} />
      <ResultsSection title="Debt Service" rows={debtMetrics} />
      <ResultsSection title="Returns" rows={returnMetrics} />
    </div>
  );
}

function ResultsSection({ title, rows }: { title: string; rows: MetricRow[] }) {
  return (
    <div className="results-section">
      <h3 className="results-section-title">{title}</h3>
      <dl className="metrics-grid">
        {rows.map((row) => (
          <div key={row.label} className={`metric-item metric-${row.highlight ?? "neutral"}`}>
            <dt className="metric-label">{row.label}</dt>
            <dd className="metric-value">{row.value}</dd>
            {row.description && <p className="metric-desc">{row.description}</p>}
          </div>
        ))}
      </dl>
    </div>
  );
}
