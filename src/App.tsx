import { useState } from 'react';
import { PayrollConfiguration } from './types';
import ComponentLibrarySection from './components/ComponentLibrarySection';
import MultiCurrencyConfig from './components/MultiCurrencyConfig';
import EarningsSection from './components/EarningsSection';
import MandatoryDeductionsSection from './components/MandatoryDeductionsSection';
import VoluntaryDeductionsSection from './components/VoluntaryDeductionsSection';
import PreTaxCreditsSection from './components/PreTaxCreditsSection';
import TaxSection from './components/TaxSection';
import PostTaxCreditsSection from './components/PostTaxCreditsSection';
import PostTaxDeductionsSection from './components/PostTaxDeductionsSection';
import PostNetSection from './components/PostNetSection';
import SummarySection from './components/SummarySection';
import { Globe, Download } from 'lucide-react';
import { SystemComponent } from './types';

// Pre-defined system components based on user's examples
const DEFAULT_COMPONENTS: SystemComponent[] = [
  { id: '1', name: 'Dearness Allowance', code: 'DA', databaseField: 'da_amount', category: 'earning' },
  { id: '2', name: 'Hours', code: 'HRS', databaseField: 'hours_worked', category: 'earning' },
  { id: '3', name: 'Leave and Travel Allowance', code: 'LTA', databaseField: 'lta_amount', category: 'earning' },
  { id: '4', name: 'Children Education Allowance', code: 'CEA', databaseField: 'children_education_allowance', category: 'earning' },
  { id: '5', name: 'Children Hostel Expense Allowance', code: 'CHEA', databaseField: 'children_hostel_exp_allowance', category: 'earning' },
  { id: '6', name: 'Daily Allowance', code: 'DAILY_ALLOWANCE', databaseField: 'daily_allowance', category: 'earning' },
  { id: '7', name: 'Uniforms Allowance', code: 'UNIFORM_ALLOWANCE', databaseField: 'uniforms_allowance', category: 'earning' },
  { id: '8', name: 'Basic Salary', code: 'BASIC', databaseField: 'basic_salary', category: 'earning' },
  { id: '9', name: 'Overtime Component', code: 'OT', databaseField: 'overtime_amount', category: 'earning' },
  { id: '10', name: 'Fuel Allowance', code: 'FUEL_ALLOWANCE', databaseField: 'fuel_allowance', category: 'earning' },
  { id: '11', name: 'Gift Card', code: 'GIFTCARD', databaseField: 'giftcard_amount', category: 'earning' },
  { id: '12', name: 'Leave Encashment', code: 'LEAVE_ENCASHMENT', databaseField: 'leave_encashment', category: 'earning' },
];

function App() {
  const [config, setConfig] = useState<PayrollConfiguration>({
    country: '',
    currency: 'USD',
    componentLibrary: DEFAULT_COMPONENTS,
    earnings: [],
    mandatoryDeductions: [],
    voluntaryDeductions: [],
    preTaxCredits: [],
    tax: null,
    postTaxCredits: [],
    postTaxDeductions: [],
    postNetItems: [],
  });

  const updateConfig = (updates: Partial<PayrollConfiguration>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-config-${config.country || 'default'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Payroll Configuration Framework
                </h1>
                <p className="text-sm text-slate-600">
                  Multi-Country Payroll Configuration System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Country:</label>
                <input
                  type="text"
                  value={config.country}
                  onChange={(e) => updateConfig({ country: e.target.value })}
                  placeholder="e.g., United States"
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Currency:</label>
                <select
                  value={config.currency}
                  onChange={(e) => updateConfig({ currency: e.target.value })}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="BRL">BRL</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              <button
                onClick={exportConfig}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Config
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration Sections */}
          <div className="lg:col-span-2 space-y-6">
            <ComponentLibrarySection
              components={config.componentLibrary}
              onUpdate={(components) => updateConfig({ componentLibrary: components })}
            />

            <MultiCurrencyConfig
              config={config.multiCurrency}
              onUpdate={(multiCurrency) => updateConfig({ multiCurrency })}
            />

            <EarningsSection
              earnings={config.earnings}
              currency={config.currency}
              componentLibrary={config.componentLibrary}
              multiCurrency={config.multiCurrency}
              onUpdate={(earnings) => updateConfig({ earnings })}
            />

            <MandatoryDeductionsSection
              deductions={config.mandatoryDeductions}
              currency={config.currency}
              componentLibrary={config.componentLibrary}
              multiCurrency={config.multiCurrency}
              onUpdate={(deductions) => updateConfig({ mandatoryDeductions: deductions })}
            />

            <VoluntaryDeductionsSection
              deductions={config.voluntaryDeductions}
              currency={config.currency}
              componentLibrary={config.componentLibrary}
              multiCurrency={config.multiCurrency}
              onUpdate={(deductions) => updateConfig({ voluntaryDeductions: deductions })}
            />

            <PreTaxCreditsSection
              credits={config.preTaxCredits}
              currency={config.currency}
              onUpdate={(credits) => updateConfig({ preTaxCredits: credits })}
            />

            <TaxSection
              tax={config.tax}
              currency={config.currency}
              onUpdate={(tax) => updateConfig({ tax })}
            />

            <PostTaxCreditsSection
              credits={config.postTaxCredits}
              currency={config.currency}
              onUpdate={(credits) => updateConfig({ postTaxCredits: credits })}
            />

            <PostTaxDeductionsSection
              deductions={config.postTaxDeductions}
              currency={config.currency}
              componentLibrary={config.componentLibrary}
              onUpdate={(deductions) => updateConfig({ postTaxDeductions: deductions })}
            />

            <PostNetSection
              items={config.postNetItems}
              currency={config.currency}
              componentLibrary={config.componentLibrary}
              onUpdate={(items) => updateConfig({ postNetItems: items })}
            />
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SummarySection config={config} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

