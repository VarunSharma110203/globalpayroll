import { TaxRegime, TaxSystemType, SystemComponent, ComparisonOperator } from '../types';
import { Plus, X, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TaxSectionProps {
  taxRegimes: TaxRegime[];
  componentLibrary: SystemComponent[];
  currency?: string;
  onUpdate: (regimes: TaxRegime[]) => void;
}

export default function TaxSection({ taxRegimes = [], componentLibrary, onUpdate }: TaxSectionProps) {
  // Use safe array
  const safeTaxRegimes = Array.isArray(taxRegimes) ? taxRegimes : [];
  
  const [activeRegimeId, setActiveRegimeId] = useState<string | null>(null);

  // Effect to ensure activeRegimeId is valid
  useEffect(() => {
    if (safeTaxRegimes.length > 0 && !activeRegimeId) {
      setActiveRegimeId(safeTaxRegimes[0].id);
    } else if (safeTaxRegimes.length > 0 && activeRegimeId && !safeTaxRegimes.find(r => r.id === activeRegimeId)) {
      setActiveRegimeId(safeTaxRegimes[0].id); // Reset if active was deleted
    } else if (safeTaxRegimes.length === 0) {
      setActiveRegimeId(null);
    }
  }, [safeTaxRegimes, activeRegimeId]);

  const addRegime = () => {
    const newRegime: TaxRegime = {
      id: Date.now().toString(),
      name: `Tax Regime ${safeTaxRegimes.length + 1}`,
      priority: safeTaxRegimes.length + 1,
      conditions: [],
      logicalOperator: 'AND',
      config: {
        taxSystemType: 'progressive_marginal',
        brackets: [{ min: 0, max: null, rate: 0 }],
        calculationMethod: 'marginal',
      },
    };
    const newRegimes = [...safeTaxRegimes, newRegime];
    onUpdate(newRegimes);
    setActiveRegimeId(newRegime.id);
  };

  const removeRegime = (id: string) => {
    const newRegimes = safeTaxRegimes.filter(r => r.id !== id);
    onUpdate(newRegimes);
  };

  const updateRegime = (id: string, updates: Partial<TaxRegime>) => {
    onUpdate(safeTaxRegimes.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const activeRegime = safeTaxRegimes.find(r => r.id === activeRegimeId);

  const conditionFields = [
    { value: 'citizenship_status', label: 'Citizenship Status' },
    { value: 'employment_type', label: 'Employment Type' },
    { value: 'job_role', label: 'Job Role/Title' },
    { value: 'residency_days', label: 'Residency Days' },
    { value: 'age', label: 'Age' },
    ...componentLibrary.map(c => ({ value: c.databaseField, label: `${c.name} (${c.code})` }))
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">5. Tax Configuration</h2>
          <p className="text-sm text-slate-600 mt-1">
            Configure conditional tax regimes (e.g., Resident vs Non-Resident, Director rules)
          </p>
        </div>
        <button
          onClick={addRegime}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Tax Regime
        </button>
      </div>

      {safeTaxRegimes.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
          <p>No tax regimes configured.</p>
          <p className="text-sm mt-1">Click "Add Tax Regime" to configure income tax rules.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Regime List Sidebar */}
          <div className="w-full md:w-64 space-y-2 flex-shrink-0">
            {safeTaxRegimes.map((regime) => (
              <div
                key={regime.id}
                onClick={() => setActiveRegimeId(regime.id)}
                className={`p-3 rounded-lg cursor-pointer border transition-all ${
                  activeRegimeId === regime.id
                    ? 'bg-primary-50 border-primary-500 shadow-sm ring-1 ring-primary-500'
                    : 'bg-white border-slate-200 hover:border-primary-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className={`font-medium ${activeRegimeId === regime.id ? 'text-primary-900' : 'text-slate-700'}`}>
                      {regime.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {regime.conditions.length === 0 ? 'Default Rule' : `${regime.conditions.length} condition(s)`}
                    </div>
                  </div>
                  {activeRegimeId === regime.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this tax regime?')) removeRegime(regime.id);
                      }}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Active Regime Configuration */}
          {activeRegime && (
            <div className="flex-1 min-w-0 bg-slate-50 rounded-xl border border-slate-200 p-5">
              {/* Regime Header */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Regime Name</label>
                  <input
                    type="text"
                    value={activeRegime.name}
                    onChange={(e) => updateRegime(activeRegime.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Standard Employee Tax"
                  />
                </div>

                {/* Conditions Builder */}
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Applicability Conditions</h4>
                    <button
                      onClick={() => updateRegime(activeRegime.id, {
                        conditions: [...activeRegime.conditions, { field: '', operator: '==', value: 0 }]
                      })}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" /> Add Condition
                    </button>
                  </div>
                  
                  {activeRegime.conditions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded text-center">
                      No conditions set. This regime applies to everyone unless matched by a higher priority rule.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activeRegime.conditions.map((cond, idx) => (
                        <div key={idx} className="flex flex-wrap items-center gap-2">
                          {idx > 0 && (
                             <span className="text-xs font-bold text-slate-400 w-full md:w-auto text-center">{activeRegime.logicalOperator}</span>
                          )}
                          <select
                            value={cond.field}
                            onChange={(e) => {
                              const newConds = [...activeRegime.conditions];
                              newConds[idx].field = e.target.value;
                              updateRegime(activeRegime.id, { conditions: newConds });
                            }}
                            className="flex-1 min-w-[140px] px-2 py-1.5 border border-slate-300 rounded text-sm"
                          >
                            <option value="">Select Field...</option>
                            {conditionFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                          <select
                            value={cond.operator}
                            onChange={(e) => {
                              const newConds = [...activeRegime.conditions];
                              newConds[idx].operator = e.target.value as ComparisonOperator;
                              updateRegime(activeRegime.id, { conditions: newConds });
                            }}
                            className="w-24 px-2 py-1.5 border border-slate-300 rounded text-sm text-center"
                          >
                            <option value="==">Equal</option>
                            <option value="!=">Not Equal</option>
                            <option value=">">Greater</option>
                            <option value="<">Less</option>
                          </select>
                          <input
                            type="text"
                            value={cond.value || ''}
                            onChange={(e) => {
                              const newConds = [...activeRegime.conditions];
                              const num = parseFloat(e.target.value);
                              newConds[idx].value = isNaN(num) ? e.target.value as any : num;
                              updateRegime(activeRegime.id, { conditions: newConds });
                            }}
                            className="flex-1 min-w-[100px] px-2 py-1.5 border border-slate-300 rounded text-sm"
                            placeholder="Value"
                          />
                          <button
                            onClick={() => {
                              const newConds = activeRegime.conditions.filter((_, i) => i !== idx);
                              updateRegime(activeRegime.id, { conditions: newConds });
                            }}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tax Configuration Form (Reused Logic) */}
              <TaxConfigurationForm 
                config={activeRegime.config}
                onUpdate={(newConfig) => updateRegime(activeRegime.id, { config: newConfig })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Sub-component for the actual tax settings (brackets, rates)
function TaxConfigurationForm({ config, onUpdate }: { config: any, onUpdate: (c: any) => void }) {
  const taxSystemTypes: { value: TaxSystemType; label: string }[] = [
    { value: 'progressive_marginal', label: 'Progressive/Marginal' },
    { value: 'slab_bracket', label: 'Slab/Bracket' },
    { value: 'flat_tax', label: 'Flat Tax' },
    { value: 'graduated_scale', label: 'Graduated Scale' },
    { value: 'no_tax', label: 'No Tax / Exempt' },
  ];

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-5 shadow-sm">
      <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Calculation Rules</h4>
      
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">System Type</label>
        <select
          value={config.taxSystemType}
          onChange={(e) => onUpdate({ ...config, taxSystemType: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
        >
          {taxSystemTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {config.taxSystemType === 'flat_tax' && (
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tax Rate (%)</label>
          <input
            type="number"
            value={config.rate || ''}
            onChange={(e) => onUpdate({ ...config, rate: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            placeholder="0.00"
          />
        </div>
      )}

      {(config.taxSystemType === 'progressive_marginal' || config.taxSystemType === 'slab_bracket') && (
        <div>
           <div className="flex justify-between items-center mb-3">
            <label className="block text-xs font-medium text-slate-700">Tax Brackets</label>
            <button
               onClick={() => onUpdate({ ...config, brackets: [...(config.brackets || []), { min: 0, max: null, rate: 0 }] })}
               className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              + Add Bracket
            </button>
           </div>
           <div className="space-y-2">
             {(config.brackets || []).map((bracket: any, idx: number) => (
               <div key={idx} className="flex gap-2 items-center">
                 <div className="relative flex-1">
                    <span className="absolute left-2 top-1.5 text-xs text-slate-400">Min</span>
                    <input
                        type="number"
                        value={bracket.min}
                        onChange={(e) => {
                            const newBrackets = [...config.brackets];
                            newBrackets[idx].min = parseFloat(e.target.value);
                            onUpdate({ ...config, brackets: newBrackets });
                        }}
                        className="w-full pl-8 px-2 py-1.5 border border-slate-300 rounded text-sm"
                    />
                 </div>
                 <span className="text-slate-400 text-xs">to</span>
                 <div className="relative flex-1">
                    <span className="absolute left-2 top-1.5 text-xs text-slate-400">Max</span>
                    <input
                        type="number"
                        value={bracket.max || ''}
                        onChange={(e) => {
                            const newBrackets = [...config.brackets];
                            newBrackets[idx].max = e.target.value ? parseFloat(e.target.value) : null;
                            onUpdate({ ...config, brackets: newBrackets });
                        }}
                        className="w-full pl-9 px-2 py-1.5 border border-slate-300 rounded text-sm"
                        placeholder="∞"
                    />
                 </div>
                 <div className="relative w-20">
                    <input
                        type="number"
                        value={bracket.rate}
                        onChange={(e) => {
                            const newBrackets = [...config.brackets];
                            newBrackets[idx].rate = parseFloat(e.target.value);
                            onUpdate({ ...config, brackets: newBrackets });
                        }}
                        className="w-full pr-6 px-2 py-1.5 border border-slate-300 rounded text-sm text-right"
                    />
                    <span className="absolute right-2 top-1.5 text-xs text-slate-500">%</span>
                 </div>
                 <button
                    onClick={() => {
                      const newBrackets = config.brackets.filter((_: any, i: number) => i !== idx);
                      onUpdate({ ...config, brackets: newBrackets });
                    }}
                    className="text-slate-400 hover:text-red-600 p-1"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}