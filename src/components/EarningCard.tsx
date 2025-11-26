import { EarningComponent, CalculationMethod, SystemComponent, MultiCurrencyConfig, BenefitEligibility, PartialTaxabilityConfig } from '../types';
import { X, ChevronDown, ChevronUp, Database, Check, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import ConditionalRuleBuilder from './ConditionalRuleBuilder';

interface EarningCardProps {
  earning: EarningComponent;
  index: number;
  currency: string;
  componentLibrary: SystemComponent[];
  multiCurrency?: MultiCurrencyConfig;
  onUpdate: (updates: Partial<EarningComponent>) => void;
  onRemove: () => void;
}

// Default eligibility for new components
const DEFAULT_ELIGIBILITY: BenefitEligibility = {
  pensionable: false,
  insurable: false,
  contributableSocialSecurity: false,
  countTowardsBenefits: false,
};

// Fixed bases that always appear
const fixedAppliedToOptions: { value: string; label: string }[] = [
  { value: 'gross_salary', label: 'Gross Salary (System)' },
  { value: 'basic_salary', label: 'Basic Salary (System)' },
  { value: 'taxable_income', label: 'Taxable Income (System)' },
];


export default function EarningCard({ earning, index, currency, componentLibrary, multiCurrency, onUpdate, onRemove }: EarningCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [useManualAmount, setUseManualAmount] = useState(!earning.systemComponentId);
  const [isSaved, setIsSaved] = useState(false);

  const selectedComponent = componentLibrary.find(c => c.id === earning.systemComponentId);
  const earningComponents = componentLibrary.filter(c => c.category === 'earning');
  
  // Combine fixed bases with all Earning/Other system components for "Applied To" dropdown
  const appliedToOptions = [
    ...fixedAppliedToOptions,
    ...componentLibrary
      .filter(c => c.category === 'earning' || c.category === 'other') 
      .map(c => ({ 
        value: c.id, // Store component ID for the Applied To base
        label: `${c.name} (${c.code}) - ${c.category.toUpperCase()}` 
      })),
  ];

  const calculationMethods: { value: CalculationMethod; label: string }[] = [
    { value: 'fixed_amount', label: 'Fixed Amount' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'progressive_slab', label: 'Progressive/Tiered' },
    { value: 'capped', label: 'Capped' },
    { value: 'formula', label: 'Formula-Based' },
    { value: 'table_lookup', label: 'Table Lookup' },
    { value: 'conditional', label: 'Conditional' },
  ];
  
  // Handlers for Benefit Eligibility
  const toggleEligibility = (key: keyof BenefitEligibility) => {
    const currentEligibility = earning.benefitEligibility || DEFAULT_ELIGIBILITY;
    onUpdate({
      benefitEligibility: {
        ...currentEligibility,
        [key]: !currentEligibility[key],
      },
    });
  };

  // Handler for Applied To field change
  const handleAppliedToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // Check if the selected value is a fixed option or a component ID (using the component ID as the value)
    const isFixedOption = fixedAppliedToOptions.some(opt => opt.value === value);

    if (!isFixedOption) {
      // It's a system component ID
      onUpdate({ appliedTo: undefined, appliedToSystemComponentId: value });
    } else {
      // It's a fixed option (e.g., gross_salary)
      onUpdate({ appliedTo: value, appliedToSystemComponentId: undefined });
    }
  };

  // Determine current selected value for the dropdown
  const getCurrentAppliedToValue = () => {
    if (earning.appliedToSystemComponentId) {
      return earning.appliedToSystemComponentId;
    }
    return earning.appliedTo || 'gross_salary'; // Default to gross_salary if neither is set
  }

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
              value={earning.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Earning Component Name"
              className="font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            />
            <input
              type="text"
              value={earning.code}
              onChange={(e) => onUpdate({ code: e.target.value })}
              placeholder="Code (e.g., BASE_SAL)"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
              <select
                value={earning.type}
                onChange={(e) => onUpdate({ type: e.target.value as 'cash' | 'non_cash' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="cash">Cash</option>
                <option value="non_cash">Non-Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Regularity</label>
              <select
                value={earning.regularity}
                onChange={(e) => onUpdate({ regularity: e.target.value as 'regular' | 'irregular' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="regular">Regular</option>
                <option value="irregular">Irregular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Base Type</label>
              <select
                value={earning.baseType}
                onChange={(e) => onUpdate({ baseType: e.target.value as 'base' | 'supplementary' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="base">Base/Regular</option>
                <option value="supplementary">Supplementary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Taxability</label>
              <select
                value={earning.taxabilityStatus}
                onChange={(e) => onUpdate({ taxabilityStatus: e.target.value as any, partialTaxabilityConfig: undefined })} // Clear config when changing status
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="fully_taxable">Fully Taxable</option>
                <option value="partially_taxable">Partially Taxable</option>
                <option value="non_taxable">Non-Taxable</option>
              </select>
            </div>
          </div>
          
          {/* PARTIAL TAXABILITY CONFIGURATION SECTION */}
          {earning.taxabilityStatus === 'partially_taxable' && (
            <PartialTaxExemptionConfig
                config={earning.partialTaxabilityConfig}
                onUpdate={(config) => onUpdate({ partialTaxabilityConfig: config })}
                currency={currency}
            />
          )}
          {/* END PARTIAL TAXABILITY SECTION */}
          
          {/* Benefit Eligibility Section - NEW */}
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-indigo-700" />
              <h4 className="text-sm font-semibold text-indigo-900">Benefit Eligibility</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={earning.benefitEligibility?.pensionable ?? DEFAULT_ELIGIBILITY.pensionable}
                  onChange={() => toggleEligibility('pensionable')}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                Pensionable
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={earning.benefitEligibility?.insurable ?? DEFAULT_ELIGIBILITY.insurable}
                  onChange={() => toggleEligibility('insurable')}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                Insurable
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={earning.benefitEligibility?.contributableSocialSecurity ?? DEFAULT_ELIGIBILITY.contributableSocialSecurity}
                  onChange={() => toggleEligibility('contributableSocialSecurity')}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                SS Contributable
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={earning.benefitEligibility?.countTowardsBenefits ?? DEFAULT_ELIGIBILITY.countTowardsBenefits}
                  onChange={() => toggleEligibility('countTowardsBenefits')}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                Counts for Benefits
              </label>
            </div>
          </div>
          {/* End Benefit Eligibility Section */}


          {/* Calculation Method (unchanged) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Calculation Method</label>
            <select
              value={earning.calculationMethod}
              onChange={(e) => onUpdate({ calculationMethod: e.target.value as CalculationMethod })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {calculationMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>

          {/* Multi-Currency Selection (unchanged) */}
          {multiCurrency?.enabled && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-slate-700">Payment Currency</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!earning.splitCurrency}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const secondaryCurrency = multiCurrency.currencies.find(c => c.code !== multiCurrency.baseCurrency)?.code || multiCurrency.currencies[0]?.code || '';
                        if (secondaryCurrency) {
                          onUpdate({
                            splitCurrency: {
                              primaryCurrency: multiCurrency.baseCurrency,
                              secondaryCurrency: secondaryCurrency,
                              splitPercentage: 50,
                            }
                          });
                        }
                      } else {
                        onUpdate({ splitCurrency: undefined, currency: multiCurrency.baseCurrency });
                      }
                    }}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-xs text-slate-700">Split Currency Payment</span>
                </label>
              </div>

              {earning.splitCurrency ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Primary Currency</label>
                      <select
                        value={earning.splitCurrency.primaryCurrency}
                        onChange={(e) => onUpdate({
                          splitCurrency: {
                            ...earning.splitCurrency,
                            primaryCurrency: e.target.value
                          }
                        })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                      >
                        {multiCurrency.currencies.map(c => (
                          <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Primary Amount %</label>
                      <input
                        type="number"
                        value={earning.splitCurrency.splitPercentage || 50}
                        onChange={(e) => {
                          if (earning.splitCurrency) {
                            onUpdate({
                              splitCurrency: {
                                primaryCurrency: earning.splitCurrency.primaryCurrency,
                                secondaryCurrency: earning.splitCurrency.secondaryCurrency,
                                splitPercentage: parseFloat(e.target.value) || 0
                              }
                            });
                          }
                        }}
                        min="0"
                        max="100"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Secondary Currency</label>
                    <select
                      value={earning.splitCurrency.secondaryCurrency}
                        onChange={(e) => {
                          if (earning.splitCurrency) {
                            onUpdate({
                              splitCurrency: {
                                ...earning.splitCurrency,
                                secondaryCurrency: e.target.value
                              }
                            });
                          }
                        }}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                    >
                      {multiCurrency.currencies.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {100 - (earning.splitCurrency.splitPercentage || 50)}% will be paid in {earning.splitCurrency.secondaryCurrency}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <select
                    value={earning.currency || multiCurrency.baseCurrency}
                    onChange={(e) => onUpdate({ currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {multiCurrency.currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Component Selection / Manual Amount (Fixed Amount) */}
          {earning.calculationMethod === 'fixed_amount' && (
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
                      onUpdate({ amount: undefined });
                    }
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  {useManualAmount ? 'Use System Component' : 'Use Manual Amount'}
                </button>
              </div>

              {useManualAmount ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Manual Amount</label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{currency}</span>
                    <input
                      type="number"
                      value={earning.amount || ''}
                      onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select System Component</label>
                  <select
                    value={earning.systemComponentId || ''}
                    onChange={(e) => {
                      const componentId = e.target.value || undefined;
                      const selected = componentLibrary.find(c => c.id === componentId);
                      onUpdate({ 
                        systemComponentId: componentId,
                        name: selected?.name || earning.name,
                        code: selected?.code || earning.code,
                        amount: undefined
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Select Component --</option>
                    {earningComponents.map(comp => (
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

          {/* Percentage Calculation - UPDATED Applied To field */}
          {earning.calculationMethod === 'percentage' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Percentage</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={earning.percentage || ''}
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
                  value={getCurrentAppliedToValue()}
                  onChange={handleAppliedToChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {appliedToOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {earning.calculationMethod === 'progressive_slab' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Tax Brackets</label>
              <div className="space-y-2">
                {(earning.brackets || []).map((bracket, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                    <input
                      type="number"
                      value={bracket.min}
                      onChange={(e) => {
                        const newBrackets = [...(earning.brackets || [])];
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
                        const newBrackets = [...(earning.brackets || [])];
                        newBrackets[idx].max = e.target.value ? parseFloat(e.target.value) : null;
                        onUpdate({ brackets: newBrackets });
                      }}
                      placeholder="Max (leave empty for unlimited)"
                      className="w-32 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      value={bracket.rate}
                      onChange={(e) => {
                        const newBrackets = [...(earning.brackets || [])];
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
                    const newBrackets = [...(earning.brackets || []), { min: 0, max: null, rate: 0 }];
                    onUpdate({ brackets: newBrackets });
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  + Add Bracket
                </button>
              </div>
            </div>
          )}

          {earning.calculationMethod === 'formula' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Formula</label>
              <textarea
                value={earning.formula || ''}
                onChange={(e) => onUpdate({ formula: e.target.value })}
                placeholder="e.g., MIN(actual_hra, percentage_of_salary * 0.5, rent_paid - (basic_salary * 0.1))"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                rows={2}
              />
            </div>
          )}

          {earning.calculationMethod === 'conditional' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <ConditionalRuleBuilder
                rules={earning.conditionalRules || []}
                componentLibrary={componentLibrary}
                currency={currency}
                onUpdate={(rules) => onUpdate({ conditionalRules: rules })}
              />
            </div>
          )}

          {earning.calculationMethod === 'capped' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Percentage</label>
                <input
                  type="number"
                  value={earning.percentage || ''}
                  onChange={(e) => onUpdate({ percentage: parseFloat(e.target.value) || undefined })}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Cap Type</label>
                <select
                    value={earning.cap?.type || 'annual'}
                    onChange={(e) => {
                      const capType = e.target.value as 'annual' | 'monthly' | 'percentage_of_earnings';
                      onUpdate({ cap: { ...earning.cap, type: capType } });
                    }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                  <option value="percentage_of_earnings">Percentage of Earnings</option>
                </select>
              </div>
              {earning.cap?.type !== 'percentage_of_earnings' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Cap Amount</label>
                  <input
                    type="number"
                    value={earning.cap?.amount || ''}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || undefined;
                      onUpdate({ cap: { ...earning.cap, type: earning.cap?.type || 'annual', amount } });
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// NEW SUB-COMPONENT FOR PARTIAL TAXABILITY CONFIGURATION
function PartialTaxExemptionConfig({ config, onUpdate, currency }: {
    config: PartialTaxabilityConfig | undefined;
    onUpdate: (config: PartialTaxabilityConfig) => void;
    currency: string;
}) {
  
  const currentConfig = config || { exemptionMethod: 'fixed_amount' };
  
  const updateConfig = (updates: Partial<PartialTaxabilityConfig>) => {
    onUpdate({ ...currentConfig, ...updates });
  };
  
  const exemptionMethods: { value: PartialTaxabilityConfig['exemptionMethod']; label: string }[] = [
    { value: 'fixed_amount', label: 'Fixed Amount Exempt' },
    { value: 'percentage_of_earning', label: 'Percentage of Earning Exempt' },
    { value: 'formula', label: 'Formula-Based Exemption' },
  ];
  
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-3">
        <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-700" />
            <h4 className="text-sm font-semibold text-red-900">Partially Taxable Exemption Rule</h4>
        </div>

        <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Exemption Method</label>
            <select
              value={currentConfig.exemptionMethod}
              onChange={(e) => updateConfig({ exemptionMethod: e.target.value as PartialTaxabilityConfig['exemptionMethod'] })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {exemptionMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
        </div>

        {(currentConfig.exemptionMethod === 'fixed_amount' || currentConfig.exemptionMethod === 'percentage_of_earning') && (
            <div className="grid grid-cols-2 gap-4">
                {currentConfig.exemptionMethod === 'fixed_amount' && (
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Exempt Amount</label>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">{currency}</span>
                            <input
                                type="number"
                                value={currentConfig.exemptAmount || ''}
                                onChange={(e) => updateConfig({ exemptAmount: parseFloat(e.target.value) || undefined })}
                                placeholder="0.00"
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                )}

                {currentConfig.exemptionMethod === 'percentage_of_earning' && (
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Exempt Percentage</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={currentConfig.exemptPercentage || ''}
                                onChange={(e) => updateConfig({ exemptPercentage: parseFloat(e.target.value) || undefined })}
                                placeholder="0.00"
                                step="0.01"
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-slate-500">%</span>
                        </div>
                        <p className='text-xs text-slate-600 mt-1'>Applied to this earning's total amount.</p>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Max Exemption Amount (Cap)</label>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">{currency}</span>
                        <input
                            type="number"
                            value={currentConfig.maxExemptionAmount || ''}
                            onChange={(e) => updateConfig({ maxExemptionAmount: parseFloat(e.target.value) || undefined })}
                            placeholder="0.00 (Optional)"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </div>
        )}
        
        {currentConfig.exemptionMethod === 'formula' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Exemption Formula (Calculates Exempt Amount)</label>
              <textarea
                value={currentConfig.exemptionFormula || ''}
                onChange={(e) => updateConfig({ exemptionFormula: e.target.value })}
                placeholder="e.g., MIN(actual_rent - 0.1 * basic_salary, 0.4 * basic_salary, 1500)"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                rows={2}
              />
              <p className='text-xs text-slate-600 mt-1'>This formula calculates the *amount* that will be tax-exempt.</p>
            </div>
        )}
    </div>
  );
}