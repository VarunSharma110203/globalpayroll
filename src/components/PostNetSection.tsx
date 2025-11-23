import { PostNetItem, CalculationMethod, SystemComponent } from '../types';
import { Plus, X, ChevronDown, ChevronUp, Database, Check } from 'lucide-react';
import { useState } from 'react';
import ConditionalRuleBuilder from './ConditionalRuleBuilder';

interface PostNetSectionProps {
  items: PostNetItem[];
  currency: string;
  componentLibrary: SystemComponent[];
  onUpdate: (items: PostNetItem[]) => void;
}

export default function PostNetSection({ items, currency, componentLibrary, onUpdate }: PostNetSectionProps) {
  const addItem = () => {
    const newItem: PostNetItem = {
      id: Date.now().toString(),
      name: '',
      code: '',
      type: 'deduction',
      calculationMethod: 'fixed_amount',
    };
    onUpdate([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<PostNetItem>) => {
    onUpdate(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">8. Post-Net Salary</h2>
          <p className="text-sm text-slate-600 mt-1">
            Deductions (loans) and additions (reimbursements) after net salary
          </p>
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No post-net items configured yet.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <PostNetItemCard
              key={item.id}
              item={item}
              index={index}
              currency={currency}
              componentLibrary={componentLibrary}
              onUpdate={(updates) => updateItem(item.id, updates)}
              onRemove={() => removeItem(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PostNetItemCard({ item, index: _index, currency, componentLibrary, onUpdate, onRemove }: {
  index: number;
  item: PostNetItem;
  currency: string;
  componentLibrary: SystemComponent[];
  onUpdate: (updates: Partial<PostNetItem>) => void;
  onRemove: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [useManualAmount, setUseManualAmount] = useState(!item.systemComponentId);
  const [isSaved, setIsSaved] = useState(false);

  const selectedComponent = componentLibrary.find(c => c.id === item.systemComponentId);
  const allComponents = componentLibrary;

  const calculationMethods: { value: CalculationMethod; label: string }[] = [
    { value: 'fixed_amount', label: 'Fixed Amount' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'capped', label: 'Capped' },
    { value: 'conditional', label: 'Conditional' },
  ];

  return (
    <div className="border border-slate-200 rounded-lg bg-slate-50">
      <div className="flex items-center justify-between p-4 bg-white rounded-t-lg border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
            item.type === 'deduction' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {item.type === 'deduction' ? '-' : '+'}
          </div>
          <div>
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder={item.type === 'deduction' ? 'Deduction Name (e.g., Loan)' : 'Addition Name (e.g., Reimbursement)'}
              className="font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            />
            <input
              type="text"
              value={item.code}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
              <select
                value={item.type}
                onChange={(e) => onUpdate({ type: e.target.value as 'deduction' | 'addition' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="deduction">Deduction</option>
                <option value="addition">Addition</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Calculation Method</label>
              <select
                value={item.calculationMethod}
                onChange={(e) => onUpdate({ calculationMethod: e.target.value as CalculationMethod })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {calculationMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>

          {item.calculationMethod === 'fixed_amount' && (
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
                      value={item.amount || ''}
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
                    value={item.systemComponentId || ''}
                    onChange={(e) => {
                      const componentId = e.target.value || undefined;
                      const selected = componentLibrary.find(c => c.id === componentId);
                      onUpdate({ 
                        systemComponentId: componentId,
                        name: selected?.name || item.name,
                        code: selected?.code || item.code,
                        amount: undefined
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Select Component --</option>
                    {allComponents.map(comp => (
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

          {item.calculationMethod === 'percentage' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Percentage</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.percentage || ''}
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
                  value={item.appliedTo || 'net_salary'}
                  onChange={(e) => onUpdate({ appliedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="net_salary">Net Salary</option>
                  <option value="gross_salary">Gross Salary</option>
                </select>
              </div>
            </div>
          )}

          {item.calculationMethod === 'conditional' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <ConditionalRuleBuilder
                rules={item.conditionalRules || []}
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

