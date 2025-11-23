import type { MultiCurrencyConfig, CurrencyConfig } from '../types';
import { Plus, X, CheckCircle2, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface MultiCurrencyConfigProps {
  config: MultiCurrencyConfig | undefined;
  onUpdate: (config: MultiCurrencyConfig | undefined) => void;
}

export default function MultiCurrencyConfig({ config, onUpdate }: MultiCurrencyConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const initializeConfig = () => {
    const newConfig: MultiCurrencyConfig = {
      enabled: true,
      baseCurrency: 'USD',
      officialCurrency: 'ZIG',
      currencies: [
        { code: 'USD', name: 'US Dollar', isOfficial: false },
        { code: 'ZIG', name: 'Zimbabwe Gold', isOfficial: true },
      ],
      exchangeRates: {
        'USD_ZIG': 1.0, // Default exchange rate
        'ZIG_USD': 1.0,
      },
    };
    onUpdate(newConfig);
  };

  const addCurrency = () => {
    if (!config) return;
    const newCurrency: CurrencyConfig = {
      code: '',
      name: '',
      isOfficial: false,
    };
    onUpdate({
      ...config,
      currencies: [...config.currencies, newCurrency],
    });
  };

  const updateCurrency = (index: number, updates: Partial<CurrencyConfig>) => {
    if (!config) return;
    const newCurrencies = [...config.currencies];
    newCurrencies[index] = { ...newCurrencies[index], ...updates };
    
    // If setting as official, unset others
    if (updates.isOfficial) {
      newCurrencies.forEach((c, i) => {
        if (i !== index) c.isOfficial = false;
      });
      onUpdate({
        ...config,
        currencies: newCurrencies,
        officialCurrency: newCurrencies[index].code,
      });
    } else {
      onUpdate({
        ...config,
        currencies: newCurrencies,
      });
    }
  };

  const removeCurrency = (index: number) => {
    if (!config || config.currencies.length <= 1) return;
    const newCurrencies = config.currencies.filter((_, i) => i !== index);
    onUpdate({
      ...config,
      currencies: newCurrencies,
    });
  };

  const updateExchangeRate = (from: string, to: string, rate: number) => {
    if (!config) return;
    const key = `${from}_${to}`;
    const reverseKey = `${to}_${from}`;
    onUpdate({
      ...config,
      exchangeRates: {
        ...config.exchangeRates,
        [key]: rate,
        [reverseKey]: 1 / rate,
      },
    });
  };

  if (!config) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Multi-Currency Support</h3>
              <p className="text-sm text-slate-600">Enable dual currency payroll (e.g., USD + ZIG for Zimbabwe)</p>
            </div>
          </div>
          <button
            onClick={initializeConfig}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Enable Multi-Currency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-primary-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Multi-Currency Configuration</h3>
            <p className="text-sm text-slate-600">
              Configure currencies and exchange rates (e.g., USD, ZIG for Zimbabwe)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => onUpdate({ ...config, enabled: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-slate-700">Enabled</span>
          </label>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {config.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Base Currency</label>
              <select
                value={config.baseCurrency}
                onChange={(e) => onUpdate({ ...config, baseCurrency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {config.currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Official Currency (for Statutory Deductions)</label>
              <select
                value={config.officialCurrency}
                onChange={(e) => onUpdate({ ...config, officialCurrency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-yellow-50"
              >
                {config.currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Statutory deductions will use this currency</p>
            </div>
          </div>

          {isExpanded && (
            <>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900">Currencies</h4>
                  <button
                    onClick={addCurrency}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    <Plus className="w-3 h-3" />
                    Add Currency
                  </button>
                </div>

                <div className="space-y-2">
                  {config.currencies.map((currency, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Code</label>
                          <input
                            type="text"
                            value={currency.code}
                            onChange={(e) => updateCurrency(index, { code: e.target.value.toUpperCase() })}
                            placeholder="USD"
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={currency.name}
                            onChange={(e) => updateCurrency(index, { name: e.target.value })}
                            placeholder="US Dollar"
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currency.isOfficial}
                              onChange={(e) => updateCurrency(index, { isOfficial: e.target.checked })}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-xs text-slate-700">Official</span>
                            {currency.isOfficial && (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            )}
                          </label>
                        </div>
                      </div>
                      {config.currencies.length > 1 && (
                        <button
                          onClick={() => removeCurrency(index)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {config.currencies.length >= 2 && (
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Exchange Rates</h4>
                  <div className="space-y-2">
                    {config.currencies.map((from, fromIdx) => 
                      config.currencies.slice(fromIdx + 1).map((to) => {
                        const key = `${from.code}_${to.code}`;
                        const rate = config.exchangeRates[key] || 1.0;
                        return (
                          <div key={key} className="flex items-center gap-3 p-2 bg-slate-50 rounded border border-slate-200">
                            <span className="text-sm font-mono text-slate-700 w-20">{from.code}</span>
                            <span className="text-slate-500">→</span>
                            <span className="text-sm font-mono text-slate-700 w-20">{to.code}</span>
                            <input
                              type="number"
                              value={rate}
                              onChange={(e) => updateExchangeRate(from.code, to.code, parseFloat(e.target.value) || 1.0)}
                              step="0.0001"
                              className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                            />
                            <span className="text-xs text-slate-500 w-32">
                              1 {from.code} = {rate} {to.code}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

