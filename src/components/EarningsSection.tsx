import { EarningComponent, SystemComponent, MultiCurrencyConfig } from '../types';
import { Plus } from 'lucide-react';
import EarningCard from './EarningCard';

interface EarningsSectionProps {
  earnings: EarningComponent[];
  currency: string;
  componentLibrary: SystemComponent[];
  multiCurrency?: MultiCurrencyConfig;
  onUpdate: (earnings: EarningComponent[]) => void;
}

export default function EarningsSection({ earnings, currency, componentLibrary, multiCurrency, onUpdate }: EarningsSectionProps) {
  const addEarning = () => {
    const newEarning: EarningComponent = {
      id: Date.now().toString(),
      name: '',
      code: '',
      type: 'cash',
      regularity: 'regular',
      baseType: 'base',
      taxabilityStatus: 'fully_taxable',
      calculationMethod: 'fixed_amount',
    };
    onUpdate([...earnings, newEarning]);
  };

  const updateEarning = (id: string, updates: Partial<EarningComponent>) => {
    onUpdate(earnings.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const removeEarning = (id: string) => {
    onUpdate(earnings.filter(e => e.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">1. Earnings</h2>
          <p className="text-sm text-slate-600 mt-1">
            Configure wages, allowances, and benefits
          </p>
        </div>
        <button
          onClick={addEarning}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Earning Component
        </button>
      </div>

      <div className="space-y-4">
        {earnings.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No earning components configured yet.</p>
            <p className="text-sm mt-2">Click "Add Earning Component" to get started.</p>
          </div>
        ) : (
          earnings.map((earning, index) => (
            <EarningCard
              key={earning.id}
              earning={earning}
              index={index}
              currency={currency}
              componentLibrary={componentLibrary}
              multiCurrency={multiCurrency}
              onUpdate={(updates) => updateEarning(earning.id, updates)}
              onRemove={() => removeEarning(earning.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

