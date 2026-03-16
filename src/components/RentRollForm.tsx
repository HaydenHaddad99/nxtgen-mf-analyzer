import { useState } from "react";
import type { RentRollData, RentRollUnit } from "../types";

interface Props {
  value: RentRollData;
  onChange: (data: RentRollData) => void;
}

const UNIT_TYPES = ["Studio", "1BD/1BA", "1BD/1BA+Den", "2BD/1BA", "2BD/2BA", "3BD/2BA", "Other"];

function nextId() {
  return crypto.randomUUID();
}

function emptyUnit(): RentRollUnit {
  return {
    id: nextId(),
    unitType: "1BD/1BA",
    squareFeet: 0,
    marketRent: 0,
    currentRent: 0,
    isOccupied: true,
  };
}

export default function RentRollForm({ value, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  function addUnit() {
    onChange({ units: [...value.units, emptyUnit()] });
  }

  function removeUnit(id: string) {
    onChange({ units: value.units.filter((u) => u.id !== id) });
  }

  function updateUnit(id: string, patch: Partial<RentRollUnit>) {
    onChange({
      units: value.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    });
  }

  function addBulk() {
    const countStr = prompt("How many identical units to add?");
    if (!countStr) return;
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count <= 0) return;
    const newUnits: RentRollUnit[] = Array.from({ length: count }, () => emptyUnit());
    onChange({ units: [...value.units, ...newUnits] });
  }

  return (
    <section className="card">
      <button className="section-toggle" onClick={() => setCollapsed((c) => !c)}>
        <span>🏠 Rent Roll</span>
        <span className="chevron">{collapsed ? "▶" : "▼"}</span>
      </button>

      {!collapsed && (
        <div className="form-body">
          <div className="rr-toolbar">
            <button className="btn-secondary" onClick={addUnit}>+ Add Unit</button>
            <button className="btn-secondary" onClick={addBulk}>+ Bulk Add</button>
            <span className="rr-count">{value.units.length} units</span>
          </div>

          {value.units.length === 0 ? (
            <p className="empty-state">No units yet. Click "+ Add Unit" to start building your rent roll.</p>
          ) : (
            <div className="rr-table-wrapper">
              <table className="rr-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Sq Ft</th>
                    <th>Market Rent</th>
                    <th>Current Rent</th>
                    <th>Occupied</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {value.units.map((unit, i) => (
                    <tr key={unit.id}>
                      <td className="td-num">{i + 1}</td>
                      <td>
                        <select
                          value={unit.unitType}
                          onChange={(e) => updateUnit(unit.id, { unitType: e.target.value })}
                        >
                          {UNIT_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={unit.squareFeet || ""}
                          onChange={(e) => updateUnit(unit.id, { squareFeet: Number(e.target.value) })}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step={25}
                          value={unit.marketRent || ""}
                          onChange={(e) => updateUnit(unit.id, { marketRent: Number(e.target.value) })}
                          placeholder="$0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step={25}
                          value={unit.currentRent || ""}
                          onChange={(e) => updateUnit(unit.id, { currentRent: Number(e.target.value) })}
                          placeholder="$0"
                          disabled={!unit.isOccupied}
                        />
                      </td>
                      <td className="td-center">
                        <input
                          type="checkbox"
                          checked={unit.isOccupied}
                          onChange={(e) =>
                            updateUnit(unit.id, {
                              isOccupied: e.target.checked,
                              currentRent: e.target.checked ? unit.currentRent : 0,
                            })
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="btn-remove"
                          onClick={() => removeUnit(unit.id)}
                          title="Remove unit"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
