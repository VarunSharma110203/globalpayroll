import { TaxCredit, Refundability } from '../types';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useState } from 'react';

interface TaxCreditCardProps {
  credit: TaxCredit;
  index: number;
  currency: string;
  onUpdate: (updates: Partial<TaxCredit>) => void;
  onRemove: () => void;
}

export default function TaxCreditCard({ credit, index, currency, onUpdate, onRemove }: TaxCreditCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

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
              value={credit.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Credit Name"
              className="font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            />
            <input
              type="text"
              value={credit.code}
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Credit Method</label>
              <select
                value={credit.creditMethod}
                onChange={(e) => onUpdate({ creditMethod: e.target.value as 'income_reduction' | 'tax_reduction' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="income_reduction">Income Reduction (Pre-Tax)</option>
                <option value="tax_reduction">Tax Reduction (Post-Tax)</option>
              </select>
            </div>

            {credit.creditType === 'post_tax' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Refundability</label>
                <select
                  value={credit.refundability || 'non_refundable'}
                  onChange={(e) => onUpdate({ refundability: e.target.value as Refundability })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="non_refundable">Non-Refundable</option>
                  <option value="refundable">Refundable</option>
                  <option value="partial">Partial Refundable</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">{currency}</span>
              <input
                type="number"
                value={credit.amount || ''}
                onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {credit.refundability === 'partial' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Refundable Percentage</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={credit.refundablePercentage || ''}
                  onChange={(e) => onUpdate({ refundablePercentage: parseFloat(e.target.value) || undefined })}
                  placeholder="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Amount Per Dependent</label>
              <input
                type="number"
                value={credit.amountPerDependent || ''}
                onChange={(e) => onUpdate({ amountPerDependent: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Max Dependents</label>
              <input
                type="number"
                value={credit.maxDependents || ''}
                onChange={(e) => onUpdate({ maxDependents: parseInt(e.target.value) || undefined })}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {credit.phaseOut && (
            <div className="p-3 bg-slate-100 rounded border border-slate-200">
              <label className="block text-xs font-medium text-slate-700 mb-2">Phase Out Range</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Start Income</label>
                  <input
                    type="number"
                    value={credit.phaseOut.startIncome}
                    onChange={(e) => onUpdate({ 
                      phaseOut: { ...credit.phaseOut!, startIncome: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">End Income</label>
                  <input
                    type="number"
                    value={credit.phaseOut.endIncome}
                    onChange={(e) => onUpdate({ 
                      phaseOut: { ...credit.phaseOut!, endIncome: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Reduction</label>
                  <select
                    value={credit.phaseOut.reduction}
                    onChange={(e) => onUpdate({ 
                      phaseOut: { ...credit.phaseOut!, reduction: e.target.value as 'linear' | 'step' }
                    })}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                  >
                    <option value="linear">Linear</option>
                    <option value="step">Step</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (credit.phaseOut) {
                onUpdate({ phaseOut: undefined });
              } else {
                onUpdate({ phaseOut: { startIncome: 0, endIncome: 0, reduction: 'linear' } });
              }
            }}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            {credit.phaseOut ? 'Remove Phase Out' : '+ Add Phase Out'}
          </button>
        </div>
      )}
    </div>
  );
}

