import { useState } from "react";
import type { T12Data } from "../types";

interface Props {
  value: T12Data;
  onChange: (data: T12Data) => void;
}

type IncomeKey = keyof T12Data["income"];
type ExpenseKey = keyof T12Data["expenses"];

const incomeFields: { key: IncomeKey; label: string; hint?: string }[] = [
  { key: "grossPotentialRent", label: "Gross Potential Rent (GPR)", hint: "Annual scheduled rent at 100% occupancy" },
  { key: "otherIncome", label: "Other Income", hint: "Laundry, parking, pet fees, etc. (annual)" },
  { key: "vacancyAndCreditLoss", label: "Vacancy & Credit Loss", hint: "Annual vacancy / bad debt (positive amount)" },
];

const expenseFields: { key: ExpenseKey; label: string }[] = [
  { key: "propertyTaxes", label: "Property Taxes" },
  { key: "insurance", label: "Insurance" },
  { key: "utilities", label: "Utilities" },
  { key: "repairsAndMaintenance", label: "Repairs & Maintenance" },
  { key: "propertyManagement", label: "Property Management" },
  { key: "payroll", label: "Payroll / On-Site Staff" },
  { key: "generalAndAdmin", label: "General & Administrative" },
  { key: "marketing", label: "Marketing & Advertising" },
  { key: "capitalReserves", label: "Capital / Replacement Reserves" },
  { key: "other", label: "Other Expenses" },
];

function parseDollar(v: string): number {
  const n = parseFloat(v.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

export default function T12Form({ value, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  function handleIncome(key: IncomeKey, raw: string) {
    onChange({ ...value, income: { ...value.income, [key]: parseDollar(raw) } });
  }

  function handleExpense(key: ExpenseKey, raw: string) {
    onChange({ ...value, expenses: { ...value.expenses, [key]: parseDollar(raw) } });
  }

  return (
    <section className="card">
      <button className="section-toggle" onClick={() => setCollapsed((c) => !c)}>
        <span>📊 T12 — Trailing 12 Months</span>
        <span className="chevron">{collapsed ? "▶" : "▼"}</span>
      </button>

      {!collapsed && (
        <div className="form-body">
          <h3 className="subsection-title">Income</h3>
          {incomeFields.map(({ key, label, hint }) => (
            <div className="field" key={key}>
              <label>{label}</label>
              {hint && <span className="hint">{hint}</span>}
              <input
                type="number"
                min={0}
                step={100}
                value={value.income[key] || ""}
                onChange={(e) => handleIncome(key, e.target.value)}
                placeholder="$0"
              />
            </div>
          ))}

          <h3 className="subsection-title">Annual Operating Expenses</h3>
          {expenseFields.map(({ key, label }) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <input
                type="number"
                min={0}
                step={100}
                value={value.expenses[key] || ""}
                onChange={(e) => handleExpense(key, e.target.value)}
                placeholder="$0"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
