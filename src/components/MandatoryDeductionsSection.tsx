import { DeductionComponent, SystemComponent, MultiCurrencyConfig } from '../types';
import { Plus } from 'lucide-react';
import DeductionCard from './DeductionCard';

interface MandatoryDeductionsSectionProps {
  deductions: DeductionComponent[];
  currency: string;
  componentLibrary: SystemComponent[];
  multiCurrency?: MultiCurrencyConfig;
  onUpdate: (deductions: DeductionComponent[]) => void;
}

export default function MandatoryDeductionsSection({ deductions, currency, componentLibrary, multiCurrency, onUpdate }: MandatoryDeductionsSectionProps) {
  const addDeduction = () => {
    const newDeduction: DeductionComponent = {
      id: Date.now().toString(),
      name: '',
      code: '',
      authority: 'mandatory',
      taxTreatment: 'pre_tax',
      payerSplit: 'employee_only',
      calculationMethod: 'fixed_amount',
    };
    onUpdate([...deductions, newDeduction]);
  };

  const updateDeduction = (id: string, updates: Partial<DeductionComponent>) => {
    onUpdate(deductions.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const removeDeduction = (id: string) => {
    onUpdate(deductions.filter(d => d.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">2. Mandatory Deductions</h2>
          <p className="text-sm text-slate-600 mt-1">
            Required by law or regulation (tax, social security, etc.)
          </p>
        </div>
        <button
          onClick={addDeduction}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Deduction
        </button>
      </div>

      <div className="space-y-4">
        {deductions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No mandatory deductions configured yet.</p>
          </div>
        ) : (
          deductions.map((deduction, index) => (
            <DeductionCard
              key={deduction.id}
              deduction={deduction}
              index={index}
              currency={currency}
              componentLibrary={componentLibrary}
              multiCurrency={multiCurrency}
              isMandatory={true}
              onUpdate={(updates) => updateDeduction(deduction.id, updates)}
              onRemove={() => removeDeduction(deduction.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

