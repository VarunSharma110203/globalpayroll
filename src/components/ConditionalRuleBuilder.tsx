import { ConditionalRule, ComparisonOperator, SystemComponent, Condition, LogicalOperator } from '../types';
import { Plus, X } from 'lucide-react';

interface ConditionalRuleBuilderProps {
  rules: ConditionalRule[];
  componentLibrary: SystemComponent[];
  currency: string;
  onUpdate: (rules: ConditionalRule[]) => void;
}

export default function ConditionalRuleBuilder({ 
  rules, 
  componentLibrary, 
  currency, 
  onUpdate 
}: ConditionalRuleBuilderProps) {
  const addRule = (type: 'if' | 'else_if' | 'else') => {
    const newRule: ConditionalRule = {
      id: Date.now().toString(),
      conditionType: type,
      conditions: type === 'else' ? [] : [{
        field: '',
        operator: '>',
        value: 0,
      }],
      logicalOperator: 'AND',
      thenAction: {
        type: 'amount',
        amount: 0,
      },
    };
    
    if (type === 'if') {
      onUpdate([newRule, ...rules]);
    } else if (type === 'else_if') {
      const lastIfIndex = rules.findIndex(r => r.conditionType === 'if' || r.conditionType === 'else_if');
      const insertIndex = lastIfIndex >= 0 ? lastIfIndex + 1 : rules.length;
      const newRules = [...rules];
      newRules.splice(insertIndex, 0, newRule);
      onUpdate(newRules);
    } else {
      onUpdate([...rules, newRule]);
    }
  };

  const updateRule = (id: string, updates: Partial<ConditionalRule>) => {
    onUpdate(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeRule = (id: string) => {
    onUpdate(rules.filter(r => r.id !== id));
  };

  const addCondition = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      const newCondition: Condition = {
        field: '',
        operator: '>',
        value: 0,
      };
      updateRule(ruleId, {
        conditions: [...rule.conditions, newCondition]
      });
    }
  };

  const updateCondition = (ruleId: string, conditionIndex: number, updates: Partial<Condition>) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      const newConditions = [...rule.conditions];
      newConditions[conditionIndex] = { ...newConditions[conditionIndex], ...updates };
      updateRule(ruleId, { conditions: newConditions });
    }
  };

  const removeCondition = (ruleId: string, conditionIndex: number) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule && rule.conditions.length > 1) {
      const newConditions = rule.conditions.filter((_, idx) => idx !== conditionIndex);
      updateRule(ruleId, { conditions: newConditions });
    }
  };

  // Get all available fields (system components + common fields)
  const availableFields = [
    ...componentLibrary.map(c => ({ value: c.databaseField, label: `${c.name} (${c.code})` })),
    { value: 'vehicle_cc', label: 'Vehicle CC' },
    { value: 'basic_salary', label: 'Basic Salary' },
    { value: 'gross_salary', label: 'Gross Salary' },
    { value: 'age', label: 'Age' },
    { value: 'years_of_service', label: 'Years of Service' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Conditional Rules</h4>
          <p className="text-xs text-slate-600 mt-1">
            Define IF-ELSE IF-ELSE conditions with AND/OR logic (e.g., IF vehicle_cc &gt; 1600 AND vehicle_cc &lt; 1800 THEN amount X)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => addRule('if')}
            className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            + IF
          </button>
          <button
            onClick={() => addRule('else_if')}
            className="px-3 py-1.5 text-xs bg-slate-600 text-white rounded hover:bg-slate-700"
            disabled={rules.length === 0 || rules.some(r => r.conditionType === 'else')}
          >
            + ELSE IF
          </button>
          <button
            onClick={() => addRule('else')}
            className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            disabled={rules.some(r => r.conditionType === 'else')}
          >
            + ELSE
          </button>
        </div>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-300 rounded-lg">
          <p>No conditional rules defined.</p>
          <p className="text-xs mt-1">Click "+ IF" to add your first condition.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <ConditionalRuleCard
              key={rule.id}
              rule={rule}
              currency={currency}
              availableFields={availableFields}
              onUpdate={(updates) => updateRule(rule.id, updates)}
              onRemove={() => removeRule(rule.id)}
              onAddCondition={() => addCondition(rule.id)}
              onUpdateCondition={(conditionIndex, updates) => updateCondition(rule.id, conditionIndex, updates)}
              onRemoveCondition={(conditionIndex) => removeCondition(rule.id, conditionIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConditionalRuleCard({
  rule,
  currency,
  availableFields,
  onUpdate,
  onRemove,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
}: {
  rule: ConditionalRule;
  currency: string;
  availableFields: { value: string; label: string }[];
  onUpdate: (updates: Partial<ConditionalRule>) => void;
  onRemove: () => void;
  onAddCondition: () => void;
  onUpdateCondition: (index: number, updates: Partial<Condition>) => void;
  onRemoveCondition: (index: number) => void;
}) {
  return (
    <div className="border-2 border-slate-300 rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            rule.conditionType === 'if' ? 'bg-blue-100 text-blue-700' :
            rule.conditionType === 'else_if' ? 'bg-purple-100 text-purple-700' :
            'bg-green-100 text-green-700'
          }`}>
            {rule.conditionType === 'if' ? 'IF' : 
             rule.conditionType === 'else_if' ? 'ELSE IF' : 
             'ELSE'}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-red-50 text-red-600 rounded"
          title="Remove rule"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {rule.conditionType !== 'else' && (
        <div className="space-y-3">
          {rule.conditions.map((condition, condIndex) => {
            const isBetween = condition.operator === 'between';
            const isLast = condIndex === rule.conditions.length - 1;
            
            return (
              <div key={condIndex} className="space-y-2">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Field</label>
                    <select
                      value={condition.field}
                      onChange={(e) => onUpdateCondition(condIndex, { field: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">-- Select Field --</option>
                      {availableFields.map(field => (
                        <option key={field.value} value={field.value}>{field.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Operator</label>
                    <select
                      value={condition.operator}
                      onChange={(e) => {
                        const op = e.target.value as ComparisonOperator;
                        onUpdateCondition(condIndex, { 
                          operator: op,
                          minValue: op === 'between' ? condition.minValue || 0 : undefined,
                          maxValue: op === 'between' ? condition.maxValue || 0 : undefined,
                        });
                      }}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value=">">Greater Than (&gt;)</option>
                      <option value="<">Less Than (&lt;)</option>
                      <option value=">=">Greater or Equal (&gt;=)</option>
                      <option value="<=">Less or Equal (&lt;=)</option>
                      <option value="==">Equal (==)</option>
                      <option value="!=">Not Equal (!=)</option>
                      <option value="between">Between</option>
                    </select>
                  </div>

                  {isBetween ? (
                    <>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Min</label>
                        <input
                          type="number"
                          value={condition.minValue || ''}
                          onChange={(e) => onUpdateCondition(condIndex, { minValue: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="col-span-1 flex items-end pb-2">
                        <span className="text-slate-500 text-xs">and</span>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Max</label>
                        <input
                          type="number"
                          value={condition.maxValue || ''}
                          onChange={(e) => onUpdateCondition(condIndex, { maxValue: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-5">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Value</label>
                      <input
                        type="number"
                        value={condition.value || ''}
                        onChange={(e) => onUpdateCondition(condIndex, { value: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}

                  {rule.conditions.length > 1 && (
                    <div className="col-span-12 flex items-center gap-2">
                      <button
                        onClick={() => onRemoveCondition(condIndex)}
                        className="p-1 hover:bg-red-50 text-red-600 rounded text-xs"
                        title="Remove condition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {!isLast && (
                  <div className="flex items-center gap-2 my-2">
                    <select
                      value={rule.logicalOperator || 'AND'}
                      onChange={(e) => onUpdate({ logicalOperator: e.target.value as LogicalOperator })}
                      className="px-2 py-1 border border-slate-300 rounded text-xs font-semibold bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={onAddCondition}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Another Condition (AND/OR)
          </button>
        </div>
      )}

      <div className="border-t border-slate-200 pt-3 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-700">THEN:</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Action Type</label>
            <select
              value={rule.thenAction.type}
              onChange={(e) => {
                const actionType = e.target.value as 'amount' | 'percentage' | 'calculation_method';
                onUpdate({
                  thenAction: {
                    ...rule.thenAction,
                    type: actionType,
                    amount: actionType === 'amount' ? rule.thenAction.amount || 0 : undefined,
                    percentage: actionType === 'percentage' ? rule.thenAction.percentage || 0 : undefined,
                  }
                });
              }}
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="amount">Fixed Amount</option>
              <option value="percentage">Percentage</option>
              <option value="calculation_method">Calculation Method</option>
            </select>
          </div>

          {rule.thenAction.type === 'amount' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">{currency}</span>
                <input
                  type="number"
                  value={rule.thenAction.amount || ''}
                  onChange={(e) => onUpdate({
                    thenAction: {
                      ...rule.thenAction,
                      amount: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {rule.thenAction.type === 'percentage' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Percentage</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rule.thenAction.percentage || ''}
                    onChange={(e) => onUpdate({
                      thenAction: {
                        ...rule.thenAction,
                        percentage: parseFloat(e.target.value) || 0
                      }
                    })}
                    step="0.01"
                    className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-slate-500 text-xs">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Applied To</label>
                <select
                  value={rule.thenAction.appliedTo || 'gross_salary'}
                  onChange={(e) => onUpdate({
                    thenAction: {
                      ...rule.thenAction,
                      appliedTo: e.target.value
                    }
                  })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="gross_salary">Gross Salary</option>
                  <option value="basic_salary">Basic Salary</option>
                  <option value="taxable_income">Taxable Income</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-200">
        <div className="text-xs font-mono text-slate-600">
          {rule.conditionType === 'else' ? (
            <span>ELSE → {rule.thenAction.type === 'amount' ? `${currency} ${rule.thenAction.amount}` : 
                          rule.thenAction.type === 'percentage' ? `${rule.thenAction.percentage}%` : 
                          'Calculation Method'}</span>
          ) : (
            <span>
              {rule.conditionType.toUpperCase()} {' '}
              {rule.conditions.map((cond, idx) => {
                const isBetween = cond.operator === 'between';
                const conditionStr = isBetween 
                  ? `${cond.field} between ${cond.minValue} and ${cond.maxValue}`
                  : `${cond.field} ${cond.operator} ${cond.value}`;
                return (
                  <span key={idx}>
                    {conditionStr}
                    {idx < rule.conditions.length - 1 && ` ${rule.logicalOperator || 'AND'} `}
                  </span>
                );
              })}
              {' '}THEN → {
                rule.thenAction.type === 'amount' ? `${currency} ${rule.thenAction.amount}` : 
                rule.thenAction.type === 'percentage' ? `${rule.thenAction.percentage}%` : 
                'Calculation Method'
              }
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
