import { DeductionComponent, CalculationMethod, SystemComponent, MultiCurrencyConfig } from '../types';
import { X, ChevronDown, ChevronUp, Database, Check, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import ConditionalRuleBuilder from './ConditionalRuleBuilder';

interface DeductionCardProps {
  deduction: DeductionComponent;
  index: number;
  currency: string;
  componentLibrary: SystemComponent[];
  multiCurrency?: MultiCurrencyConfig;
  isMandatory?: boolean;
  onUpdate: (updates: Partial<DeductionComponent>) => void;
  onRemove: () => void;
}

export default function DeductionCard({ deduction, index, currency, componentLibrary, multiCurrency, isMandatory, onUpdate, onRemove }: DeductionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [useManualAmount, setUseManualAmount] = useState(!deduction.systemComponentId);
  const [isSaved, setIsSaved] = useState(false);

  const isShared = deduction.payerSplit === 'both';
  
  const selectedComponent = componentLibrary.find(c => c.id === deduction.systemComponentId);
  const deductionComponents = componentLibrary.filter(c => c.category === 'deduction');

  // Force mandatory deductions to use official currency
  useEffect(() => {
    if (isMandatory && multiCurrency?.enabled && multiCurrency.officialCurrency) {
      if (deduction.currency !== multiCurrency.officialCurrency) {
        onUpdate({ 
          currency: multiCurrency.officialCurrency,
          useOfficialCurrency: true 
        });
      }
    }
  }, [isMandatory, multiCurrency, deduction.currency, onUpdate]);

  const calculationMethods: { value: CalculationMethod; label: string }[] = [
    { value: 'fixed_amount', label: 'Fixed Amount' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'progressive_slab', label: 'Progressive/Tiered' },
    { value: 'capped', label: 'Capped' },
    { value: 'formula', label: 'Formula-Based' },
    { value: 'table_lookup', label: 'Table Lookup' },
    { value: 'conditional', label: 'Conditional' },
  ];

  const percentageAppliedToOptions = [
    { value: 'gross_salary', label: 'Gross Salary' },
    { value: 'basic_salary', label: 'Basic Salary' },
    { value: 'taxable_income', label: 'Taxable Income' },
  ];

  // Helper function to reset dual/single fields when changing payerSplit
  const handlePayerSplitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPayerSplit = e.target.value as 'employee_only' | 'employer_only' | 'both';
    let updates: Partial<DeductionComponent> = { payerSplit: newPayerSplit };
    
    // Clear unused dual/single fields upon changing split type
    if (newPayerSplit === 'both') {
      updates = { ...updates, amount: undefined, percentage: undefined, appliedTo: undefined };
    } else {
      updates = { 
        ...updates, 
        employeeAmount: undefined, employerAmount: undefined, 
        employeePercentage: undefined, employerPercentage: undefined, 
        appliedToEmployee: undefined, appliedToEmployer: undefined 
      };
    }

    onUpdate(updates);
  };
  
  return (
    <div className="border border-slate-200 rounded-lg bg-slate-50">
      <div className="flex items-center justify-between p-4 bg-white rounded-t-lg border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
            {index + 1}
          </div>
          <div>
            <input
              type="text"
              value={deduction.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Deduction Name"
              className="font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            />
            <input
              type="text"
              value={deduction.code}
              onChange={(e) => onUpdate({ code: e.target.value })}
              placeholder="Code"
              className="text-xs text-slate-500 bg-transparent border-none focus:outline-none focus:ring-0 p-0 mt-1 block"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 2000);
            }}
            className={`p-2 rounded-lg transition-all ${
              isSaved 
                ? 'bg-green-100 text-green-600' 
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
            title="Save component"
          >
            <Check className={`w-4 h-4 ${isSaved ? 'animate-pulse' : ''}`} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-100 rounded"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-50 text-red-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Classification Dimensions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tax Treatment</label>
              <select
                value={deduction.taxTreatment}
                onChange={(e) => onUpdate({ taxTreatment: e.target.value as 'pre_tax' | 'post_tax' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="pre_tax">Pre-Tax</option>
                <option value="post_tax">Post-Tax</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payer Split</label>
              <select
                value={deduction.payerSplit}
                onChange={handlePayerSplitChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="employee_only">Employee Only</option>
                <option value="employer_only">Employer Only</option>
                <option value="both">Both (Shared)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Calculation Method</label>
              <select
                value={deduction.calculationMethod}
                onChange={(e) => onUpdate({ calculationMethod: e.target.value as CalculationMethod })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {calculationMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Multi-Currency Selection for Deductions */}
          {multiCurrency?.enabled && (
            <div className={`p-3 rounded-lg border ${
              isMandatory 
                ? 'bg-yellow-50 border-yellow-300' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {isMandatory && (
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Deduction Currency
                    {isMandatory && (
                      <span className="text-yellow-700 ml-1">(Statutory - Official Currency Required)</span>
                    )}
                  </label>
                  <select
                    value={deduction.currency || (isMandatory ? multiCurrency.officialCurrency : multiCurrency.baseCurrency)}
                    onChange={(e) => {
                      if (isMandatory && e.target.value !== multiCurrency.officialCurrency) {
                        alert(`Mandatory deductions must use the official currency (${multiCurrency.officialCurrency}) for statutory compliance.`);
                        return;
                      }
                      onUpdate({ currency: e.target.value });
                    }}
                    disabled={isMandatory}
                    className={`w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isMandatory ? 'bg-yellow-100 cursor-not-allowed' : ''
                    }`}
                  >
                    {multiCurrency.currencies.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                        {c.isOfficial && ' (Official)'}
                      </option>
                    ))}
                  </select>
                  {isMandatory && (
                    <p className="text-xs text-yellow-700 mt-1">
                      Statutory deductions are automatically set to {multiCurrency.officialCurrency} for compliance.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Component Selection / Manual Amount - START */}
          {deduction.calculationMethod === 'fixed_amount' && (
            <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-slate-700">Data Source</label>
                <button
                  type="button"
                  onClick={() => {
                    setUseManualAmount(!useManualAmount);
                    if (!useManualAmount) {
                      onUpdate({ systemComponentId: undefined });
                    } else {
                      onUpdate({ amount: undefined, employeeAmount: undefined, employerAmount: undefined });
                    }
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  {useManualAmount ? 'Use System Component' : 'Use Manual Amount'}
                </button>
              </div>

              {/* Fixed Amount Input Fields */}
              {useManualAmount ? (
                isShared ? (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Employee Fixed Amount */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Employee Amount</label>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{currency}</span>
                        <input
                          type="number"
                          value={deduction.employeeAmount || ''}
                          onChange={(e) => onUpdate({ employeeAmount: parseFloat(e.target.value) || undefined })}
                          placeholder="0.00"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    {/* Employer Fixed Amount */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Employer Amount</label>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{currency}</span>
                        <input
                          type="number"
                          value={deduction.employerAmount || ''}
                          onChange={(e) => onUpdate({ employerAmount: parseFloat(e.target.value) || undefined })}
                          placeholder="0.00"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Manual Amount</label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{currency}</span>
                      <input
                        type="number"
                        value={deduction.amount || ''}
                        onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || undefined })}
                        placeholder="0.00"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                )
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select System Component</label>
                  <select
                    value={deduction.systemComponentId || ''}
                    onChange={(e) => {
                      const componentId = e.target.value || undefined;
                      const selected = componentLibrary.find(c => c.id === componentId);
                      onUpdate({ 
                        systemComponentId: componentId,
                        name: selected?.name || deduction.name,
                        code: selected?.code || deduction.code,
                        amount: undefined, // Clear manual amounts when switching to system component
                        employeeAmount: undefined,
                        employerAmount: undefined,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Select Component --</option>
                    {deductionComponents.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name} ({comp.code})</option>
                    ))}
                  </select>
                  {selectedComponent && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                      <Database className="w-3 h-3" />
                      <span>Database Field: <code className="font-mono text-primary-600">{selectedComponent.databaseField}</code></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Component Selection / Manual Amount - END */}

          {/* Percentage Input Fields - START */}
          {deduction.calculationMethod === 'percentage' && (
            isShared ? (
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-blue-50 border-blue-200">
                {/* Employee Percentage */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Employee Percentage</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      value={deduction.employeePercentage || ''}
                      onChange={(e) => onUpdate({ employeePercentage: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00"
                      step="0.01"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Employee Applied To</label>
                  <select
                    value={deduction.appliedToEmployee || 'gross_salary'}
                    onChange={(e) => onUpdate({ appliedToEmployee: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {percentageAppliedToOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Employer Percentage */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Employer Percentage</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      value={deduction.employerPercentage || ''}
                      onChange={(e) => onUpdate({ employerPercentage: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00"
                      step="0.01"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Employer Applied To</label>
                  <select
                    value={deduction.appliedToEmployer || 'gross_salary'}
                    onChange={(e) => onUpdate({ appliedToEmployer: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {percentageAppliedToOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Percentage</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={deduction.percentage || ''}
                      onChange={(e) => onUpdate({ percentage: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00"
                      step="0.01"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Applied To</label>
                  <select
                    value={deduction.appliedTo || 'gross_salary'}
                    onChange={(e) => onUpdate({ appliedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {percentageAppliedToOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )
          )}
          {/* Percentage Input Fields - END */}


          {deduction.calculationMethod === 'progressive_slab' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Brackets</label>
              <div className="space-y-2">
                {(deduction.brackets || []).map((bracket, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                    <input
                      type="number"
                      value={bracket.min}
                      onChange={(e) => {
                        const newBrackets = [...(deduction.brackets || [])];
                        newBrackets[idx].min = parseFloat(e.target.value) || 0;
                        onUpdate({ brackets: newBrackets });
                      }}
                      placeholder="Min"
                      className="w-24 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="number"
                      value={bracket.max || ''}
                      onChange={(e) => {
                        const newBrackets = [...(deduction.brackets || [])];
                        newBrackets[idx].max = e.target.value ? parseFloat(e.target.value) : null;
                        onUpdate({ brackets: newBrackets });
                      }}
                      placeholder="Max"
                      className="w-32 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      value={bracket.rate}
                      onChange={(e) => {
                        const newBrackets = [...(deduction.brackets || [])];
                        newBrackets[idx].rate = parseFloat(e.target.value) || 0;
                        onUpdate({ brackets: newBrackets });
                      }}
                      placeholder="Rate %"
                      step="0.01"
                      className="w-24 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newBrackets = [...(deduction.brackets || []), { min: 0, max: null, rate: 0 }];
                    onUpdate({ brackets: newBrackets });
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  + Add Bracket
                </button>
              </div>
            </div>
          )}

          {deduction.calculationMethod === 'capped' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Percentage</label>
                <input
                  type="number"
                  value={deduction.percentage || ''}
                  onChange={(e) => onUpdate({ percentage: parseFloat(e.target.value) || undefined })}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cap Type</label>
                <select
                  value={deduction.cap?.type || 'annual'}
                    onChange={(e) => {
                      const capType = e.target.value as 'annual' | 'monthly' | 'percentage_of_earnings';
                      onUpdate({ cap: { ...deduction.cap, type: capType, amount: deduction.cap?.amount } });
                    }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                  <option value="percentage_of_earnings">Percentage of Earnings</option>
                </select>
              </div>
              {deduction.cap?.type !== 'percentage_of_earnings' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Cap Amount</label>
                  <input
                    type="number"
                    value={deduction.cap?.amount || ''}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || undefined;
                      onUpdate({ cap: { ...deduction.cap, type: deduction.cap?.type || 'annual', amount } });
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>
          )}

          {deduction.calculationMethod === 'formula' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Formula</label>
              <textarea
                value={deduction.formula || ''}
                onChange={(e) => onUpdate({ formula: e.target.value })}
                placeholder="Enter formula expression"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                rows={2}
              />
            </div>
          )}

          {deduction.calculationMethod === 'conditional' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <ConditionalRuleBuilder
                rules={deduction.conditionalRules || []}
                componentLibrary={componentLibrary}
                currency={currency}
                onUpdate={(rules) => onUpdate({ conditionalRules: rules })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}