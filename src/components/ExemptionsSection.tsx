import { ExemptionRule, SystemComponent, ComparisonOperator, DeductionComponent, TaxRegime } from '../types';
import { Plus, X, AlertCircle } from 'lucide-react';

interface ExemptionsSectionProps {
  exemptions: ExemptionRule[];
  componentLibrary: SystemComponent[];
  mandatoryDeductions: DeductionComponent[];
  taxRegimes: TaxRegime[];
  currency: string;
  onUpdate: (exemptions: ExemptionRule[]) => void;
}

export default function ExemptionsSection({ 
  exemptions = [], 
  componentLibrary = [], 
  mandatoryDeductions = [],
  taxRegimes = [],
  currency, 
  onUpdate 
}: ExemptionsSectionProps) {
  
  // Safety checks to ensure arrays are actually arrays
  const safeExemptions = Array.isArray(exemptions) ? exemptions : [];
  const safeMandatoryDeductions = Array.isArray(mandatoryDeductions) ? mandatoryDeductions : [];
  const safeTaxRegimes = Array.isArray(taxRegimes) ? taxRegimes : [];

  const addExemption = () => {
    const newExemption: ExemptionRule = {
      id: Date.now().toString(),
      name: '',
      conditions: [{ field: 'age', operator: '>=', value: 60 }],
      logicalOperator: 'AND',
      targetType: 'professional_tax', // Default
      exemptionType: 'fully_exempt',
    };
    onUpdate([...safeExemptions, newExemption]);
  };

  const updateExemption = (id: string, updates: Partial<ExemptionRule>) => {
    onUpdate(safeExemptions.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const removeExemption = (id: string) => {
    onUpdate(safeExemptions.filter(e => e.id !== id));
  };

  const conditionFields = [
    { value: 'age', label: 'Age' },
    { value: 'gender', label: 'Gender' },
    { value: 'disability_status', label: 'Disability Status' },
    { value: 'citizenship_status', label: 'Citizenship Status' },
    { value: 'annual_income', label: 'Annual Income' },
    ...componentLibrary.map(c => ({ value: c.databaseField, label: `${c.name} (${c.code})` }))
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">9. Exemptions & Global Rules</h2>
          <p className="text-sm text-slate-600 mt-1">
            Define overrides for specific groups (e.g., Senior citizens exempt from specific taxes or statutory deductions).
          </p>
        </div>
        <button
          onClick={addExemption}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Exemption Rule
        </button>
      </div>

      <div className="space-y-6">
        {safeExemptions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p>No exemption rules configured yet.</p>
            <p className="text-sm mt-1">Click the button above to add rules like "Senior Citizen Exemption".</p>
          </div>
        ) : (
          safeExemptions.map((exemption) => (
            <div key={exemption.id} className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
              
              {/* Header */}
              <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-200">
                <input
                  type="text"
                  value={exemption.name}
                  onChange={(e) => updateExemption(exemption.id, { name: e.target.value })}
                  placeholder="Rule Name (e.g. Senior Citizen Exemption)"
                  className="flex-1 font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 text-base placeholder-slate-400 mr-4"
                />
                <button
                   onClick={() => removeExemption(exemption.id)}
                   className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                   title="Remove Rule"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT: Conditions Logic */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    IF Condition(s) Met
                  </h4>
                  
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                    {exemption.conditions.map((cond, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="flex-1 grid grid-cols-12 gap-3">
                          {/* Field Selector */}
                          <div className="col-span-5">
                            <select
                              value={cond.field}
                              onChange={(e) => {
                                const newConds = [...exemption.conditions];
                                newConds[idx].field = e.target.value;
                                updateExemption(exemption.id, { conditions: newConds });
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Field</option>
                              {conditionFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                          </div>

                          {/* Operator */}
                          <div className="col-span-3">
                            <select
                              value={cond.operator}
                              onChange={(e) => {
                                const newConds = [...exemption.conditions];
                                newConds[idx].operator = e.target.value as ComparisonOperator;
                                updateExemption(exemption.id, { conditions: newConds });
                              }}
                              className="w-full px-2 py-2 border border-slate-300 rounded-md text-sm text-center font-mono"
                            >
                              <option value=">">&gt;</option>
                              <option value=">=">&gt;=</option>
                              <option value="<">&lt;</option>
                              <option value="<=">&lt;=</option>
                              <option value="==">=</option>
                              <option value="!=">!=</option>
                            </select>
                          </div>

                          {/* Value Input */}
                          <div className="col-span-4">
                            <input
                              type="text" 
                              value={cond.value || ''}
                              onChange={(e) => {
                                const newConds = [...exemption.conditions];
                                const num = parseFloat(e.target.value);
                                newConds[idx].value = isNaN(num) ? e.target.value as any : num;
                                updateExemption(exemption.id, { conditions: newConds });
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                              placeholder="Value"
                            />
                          </div>
                        </div>

                        {/* Remove Condition Button */}
                        <button
                          onClick={() => {
                            const newConds = exemption.conditions.filter((_, i) => i !== idx);
                            updateExemption(exemption.id, { conditions: newConds });
                          }}
                          className="mt-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => updateExemption(exemption.id, { conditions: [...exemption.conditions, { field: 'age', operator: '>=', value: 0 }] })}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-2 px-1"
                    >
                      <Plus className="w-3 h-3" /> Add Another Condition
                    </button>
                  </div>
                </div>

                {/* RIGHT: Exemption Target */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    THEN Exempt From
                  </h4>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-4">
                    {/* Target Component Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Target Component / Tax</label>
                      <select
                        value={exemption.targetType === 'specific_component' ? exemption.targetComponentId : exemption.targetType}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Check if selected value matches a generic category
                          if (['tax', 'professional_tax', 'social_security'].includes(val)) {
                            updateExemption(exemption.id, { targetType: val as any, targetComponentId: undefined });
                          } else {
                            // Otherwise it's a specific component ID
                            updateExemption(exemption.id, { targetType: 'specific_component', targetComponentId: val });
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      >
                        <option value="">-- Select Target --</option>
                        
                        <optgroup label="Tax Regimes">
                          {/* Dynamically list created Tax Regimes */}
                          {safeTaxRegimes.map(regime => (
                            <option key={regime.id} value={regime.id}>
                              Tax Regime: {regime.name}
                            </option>
                          ))}
                          <option value="tax">All Income Tax</option>
                        </optgroup>

                        <optgroup label="Statutory Deductions">
                          {/* Dynamically list created Mandatory Deductions */}
                          {safeMandatoryDeductions.map(deduction => (
                            <option key={deduction.id} value={deduction.id}>
                              {deduction.name} ({deduction.code})
                            </option>
                          ))}
                        </optgroup>

                        <optgroup label="Other Categories">
                          <option value="professional_tax">Professional Tax (Generic)</option>
                          <option value="social_security">Social Security (Generic)</option>
                        </optgroup>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Exemption Type */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Exemption Type</label>
                        <select
                          value={exemption.exemptionType}
                          onChange={(e) => updateExemption(exemption.id, { exemptionType: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                        >
                          <option value="fully_exempt">Fully Exempt (100%)</option>
                          <option value="percentage_exempt">Partial % Exempt</option>
                          <option value="amount_exempt">Fixed Amount Exempt</option>
                          <option value="cap_limit">Limit Cap To</option>
                        </select>
                      </div>

                      {/* Exemption Value (Conditional) */}
                      {exemption.exemptionType !== 'fully_exempt' && (
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            {exemption.exemptionType === 'percentage_exempt' ? 'Exempt %' : 'Value'}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={exemption.exemptionValue || ''}
                              onChange={(e) => updateExemption(exemption.id, { exemptionValue: parseFloat(e.target.value) })}
                              className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="0.00"
                            />
                            <span className="absolute right-3 top-2 text-slate-400 text-xs font-bold">
                              {exemption.exemptionType === 'percentage_exempt' ? '%' : currency}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}