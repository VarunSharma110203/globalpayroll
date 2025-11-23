import { TaxConfiguration, TaxSystemType } from '../types';
import { X } from 'lucide-react';

interface TaxSectionProps {
  tax: TaxConfiguration | null;
  currency?: string;
  onUpdate: (tax: TaxConfiguration | null) => void;
}

export default function TaxSection({ tax, onUpdate }: TaxSectionProps) {

  const taxSystemTypes: { value: TaxSystemType; label: string }[] = [
    { value: 'progressive_marginal', label: 'Progressive/Marginal' },
    { value: 'slab_bracket', label: 'Slab/Bracket' },
    { value: 'flat_tax', label: 'Flat Tax' },
    { value: 'graduated_scale', label: 'Graduated Scale' },
    { value: 'no_tax', label: 'No Tax / Exempt' },
  ];

  const initializeTax = () => {
    if (!tax) {
      onUpdate({
        taxSystemType: 'progressive_marginal',
        brackets: [{ min: 0, max: null, rate: 0 }],
        calculationMethod: 'marginal',
      });
    }
  };

  if (!tax) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">5. Tax Configuration</h2>
            <p className="text-sm text-slate-600 mt-1">
              Configure income tax system (progressive, flat, slab, etc.)
            </p>
          </div>
          <button
            onClick={initializeTax}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Configure Tax
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">5. Tax Configuration</h2>
          <p className="text-sm text-slate-600 mt-1">
            Configure income tax system (progressive, flat, slab, etc.)
          </p>
        </div>
        <button
          onClick={() => onUpdate(null)}
          className="p-2 hover:bg-red-50 text-red-600 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tax System Type</label>
          <select
            value={tax.taxSystemType}
            onChange={(e) => {
              const newType = e.target.value as TaxSystemType;
              if (newType === 'flat_tax') {
                onUpdate({ ...tax, taxSystemType: newType, rate: 20 });
              } else if (newType === 'no_tax') {
                onUpdate({ ...tax, taxSystemType: newType });
              } else {
                onUpdate({ 
                  ...tax, 
                  taxSystemType: newType,
                  brackets: tax.brackets || [{ min: 0, max: null, rate: 0 }]
                });
              }
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {taxSystemTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {tax.taxSystemType === 'flat_tax' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tax Rate</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tax.rate || ''}
                onChange={(e) => onUpdate({ ...tax, rate: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
                step="0.01"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-slate-500">%</span>
            </div>
          </div>
        )}

        {(tax.taxSystemType === 'progressive_marginal' || 
          tax.taxSystemType === 'slab_bracket' || 
          tax.taxSystemType === 'graduated_scale') && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Calculation Method</label>
              <select
                value={tax.calculationMethod || 'marginal'}
                onChange={(e) => onUpdate({ ...tax, calculationMethod: e.target.value as 'marginal' | 'slab' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="marginal">Marginal (Progressive)</option>
                <option value="slab">Slab (Entire Income)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Tax Brackets</label>
              <div className="space-y-2">
                {(tax.brackets || []).map((bracket, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200">
                    <input
                      type="number"
                      value={bracket.min}
                      onChange={(e) => {
                        const newBrackets = [...(tax.brackets || [])];
                        newBrackets[idx].min = parseFloat(e.target.value) || 0;
                        onUpdate({ ...tax, brackets: newBrackets });
                      }}
                      placeholder="Min"
                      className="w-28 px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="number"
                      value={bracket.max || ''}
                      onChange={(e) => {
                        const newBrackets = [...(tax.brackets || [])];
                        newBrackets[idx].max = e.target.value ? parseFloat(e.target.value) : null;
                        onUpdate({ ...tax, brackets: newBrackets });
                      }}
                      placeholder="Max (unlimited if empty)"
                      className="w-40 px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
                    />
                    <input
                      type="number"
                      value={bracket.rate}
                      onChange={(e) => {
                        const newBrackets = [...(tax.brackets || [])];
                        newBrackets[idx].rate = parseFloat(e.target.value) || 0;
                        onUpdate({ ...tax, brackets: newBrackets });
                      }}
                      placeholder="Rate %"
                      step="0.01"
                      className="w-28 px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
                    />
                    <span className="text-slate-500">%</span>
                    {bracket.name && (
                      <input
                        type="text"
                        value={bracket.name}
                        onChange={(e) => {
                          const newBrackets = [...(tax.brackets || [])];
                          newBrackets[idx].name = e.target.value;
                          onUpdate({ ...tax, brackets: newBrackets });
                        }}
                        placeholder="Bracket name (optional)"
                        className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newBrackets = [...(tax.brackets || []), { min: 0, max: null, rate: 0 }];
                    onUpdate({ ...tax, brackets: newBrackets });
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  + Add Bracket
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

