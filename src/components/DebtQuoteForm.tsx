import { useState } from "react";
import type { DebtQuote } from "../types";

interface Props {
  value: DebtQuote;
  onChange: (data: DebtQuote) => void;
  purchasePrice: number;
}

export default function DebtQuoteForm({ value, onChange, purchasePrice }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  function update(patch: Partial<DebtQuote>) {
    onChange({ ...value, ...patch });
  }

  const ltv = purchasePrice > 0 ? ((value.loanAmount / purchasePrice) * 100).toFixed(1) : "—";

  return (
    <section className="card">
      <button className="section-toggle" onClick={() => setCollapsed((c) => !c)}>
        <span>🏦 Debt Quote</span>
        <span className="chevron">{collapsed ? "▶" : "▼"}</span>
      </button>

      {!collapsed && (
        <div className="form-body">
          <div className="field">
            <label>Loan Amount</label>
            <span className="hint">LTV: {ltv}{purchasePrice > 0 ? "%" : ""}</span>
            <input
              type="number"
              min={0}
              step={50000}
              value={value.loanAmount || ""}
              onChange={(e) => update({ loanAmount: Number(e.target.value) })}
              placeholder="$0"
            />
          </div>

          <div className="field">
            <label>Interest Rate (%)</label>
            <input
              type="number"
              min={0}
              max={30}
              step={0.125}
              value={(value.interestRate * 100).toFixed(3)}
              onChange={(e) => update({ interestRate: Number(e.target.value) / 100 })}
              placeholder="6.500"
            />
          </div>

          <div className="field">
            <label>Amortization (years)</label>
            <input
              type="number"
              min={1}
              max={40}
              step={1}
              value={value.amortizationYears || ""}
              onChange={(e) => update({ amortizationYears: Number(e.target.value) })}
              placeholder="30"
            />
          </div>

          <div className="field">
            <label>Loan Term (years)</label>
            <input
              type="number"
              min={1}
              max={40}
              step={1}
              value={value.loanTermYears || ""}
              onChange={(e) => update({ loanTermYears: Number(e.target.value) })}
              placeholder="10"
            />
          </div>

          <div className="field field-row">
            <label>Interest-Only Period</label>
            <input
              type="checkbox"
              checked={value.isInterestOnly}
              onChange={(e) => update({ isInterestOnly: e.target.checked })}
            />
          </div>

          {value.isInterestOnly && (
            <div className="field">
              <label>I/O Period (years)</label>
              <input
                type="number"
                min={0}
                max={value.loanTermYears}
                step={1}
                value={value.ioPeriodYears || ""}
                onChange={(e) => update({ ioPeriodYears: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
