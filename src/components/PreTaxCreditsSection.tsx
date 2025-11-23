import { TaxCredit } from '../types';
import { Plus } from 'lucide-react';
import TaxCreditCard from './TaxCreditCard';

interface PreTaxCreditsSectionProps {
  credits: TaxCredit[];
  currency: string;
  onUpdate: (credits: TaxCredit[]) => void;
}

export default function PreTaxCreditsSection({ credits, currency, onUpdate }: PreTaxCreditsSectionProps) {
  const addCredit = () => {
    const newCredit: TaxCredit = {
      id: Date.now().toString(),
      name: '',
      code: '',
      creditType: 'pre_tax',
      creditMethod: 'income_reduction',
    };
    onUpdate([...credits, newCredit]);
  };

  const updateCredit = (id: string, updates: Partial<TaxCredit>) => {
    onUpdate(credits.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCredit = (id: string) => {
    onUpdate(credits.filter(c => c.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">4. Pre-Tax Tax Credits</h2>
          <p className="text-sm text-slate-600 mt-1">
            Credits that reduce taxable income (standard deduction, exemptions, etc.)
          </p>
        </div>
        <button
          onClick={addCredit}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Credit
        </button>
      </div>

      <div className="space-y-4">
        {credits.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No pre-tax credits configured yet.</p>
          </div>
        ) : (
          credits.map((credit, index) => (
            <TaxCreditCard
              key={credit.id}
              credit={credit}
              index={index}
              currency={currency}
              onUpdate={(updates) => updateCredit(credit.id, updates)}
              onRemove={() => removeCredit(credit.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

