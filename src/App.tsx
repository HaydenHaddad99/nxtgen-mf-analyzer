import { useState, useMemo } from "react";
import type { T12Data, RentRollData, DebtQuote } from "./types";
import { runUnderwriting } from "./utils/underwriting";
import T12Form from "./components/T12Form";
import RentRollForm from "./components/RentRollForm";
import DebtQuoteForm from "./components/DebtQuoteForm";
import UnderwritingResultsPanel from "./components/UnderwritingResults";
import "./App.css";

const DEFAULT_T12: T12Data = {
  income: {
    grossPotentialRent: 0,
    otherIncome: 0,
    vacancyAndCreditLoss: 0,
  },
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

const DEFAULT_RENT_ROLL: RentRollData = { units: [] };

const DEFAULT_DEBT: DebtQuote = {
  loanAmount: 0,
  interestRate: 0.065,
  amortizationYears: 30,
  loanTermYears: 10,
  isInterestOnly: false,
  ioPeriodYears: 0,
};

export default function App() {
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [closingCostsPct, setClosingCostsPct] = useState<number>(0.02);
  const [t12, setT12] = useState<T12Data>(DEFAULT_T12);
  const [rentRoll, setRentRoll] = useState<RentRollData>(DEFAULT_RENT_ROLL);
  const [debtQuote, setDebtQuote] = useState<DebtQuote>(DEFAULT_DEBT);
  const [analyzed, setAnalyzed] = useState(false);

  function handleAnalyze() {
    setAnalyzed(true);
  }

  function handleReset() {
    setPurchasePrice(0);
    setClosingCostsPct(0.02);
    setT12(DEFAULT_T12);
    setRentRoll(DEFAULT_RENT_ROLL);
    setDebtQuote(DEFAULT_DEBT);
    setAnalyzed(false);
  }

  const liveResults = useMemo(() => {
    if (!analyzed) return null;
    return runUnderwriting({ purchasePrice, closingCostsPct, t12, rentRoll, debtQuote });
  }, [analyzed, purchasePrice, closingCostsPct, t12, rentRoll, debtQuote]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <h1 className="app-title">NxtGen MF Analyzer</h1>
            <p className="app-subtitle">Multifamily Deal Underwriter — T12 · Rent Roll · Debt Quote</p>
          </div>
          <div className="header-actions">
            <button className="btn-ghost" onClick={handleReset}>Reset</button>
            <button className="btn-primary" onClick={handleAnalyze}>
              Analyze Deal
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className={`layout ${liveResults ? "layout-split" : "layout-single"}`}>
          <div className="inputs-panel">
            <section className="card">
              <div className="form-body">
                <h3 className="subsection-title">Deal Overview</h3>
                <div className="field">
                  <label>Purchase Price</label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={purchasePrice || ""}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    placeholder="$0"
                  />
                </div>
                <div className="field">
                  <label>Closing Costs (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.25}
                    value={(closingCostsPct * 100).toFixed(2)}
                    onChange={(e) => setClosingCostsPct(Number(e.target.value) / 100)}
                    placeholder="2.00"
                  />
                </div>
              </div>
            </section>

            <T12Form value={t12} onChange={setT12} />
            <RentRollForm value={rentRoll} onChange={setRentRoll} />
            <DebtQuoteForm value={debtQuote} onChange={setDebtQuote} purchasePrice={purchasePrice} />

            <div className="analyze-bar">
              <button className="btn-primary btn-large" onClick={handleAnalyze}>
                📊 Analyze Deal
              </button>
            </div>
          </div>

          {liveResults && (
            <div className="results-wrapper">
              <UnderwritingResultsPanel results={liveResults} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

