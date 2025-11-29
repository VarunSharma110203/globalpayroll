import { useState } from 'react';
import { PayrollConfiguration, SystemComponent, ExemptionRule } from './types';
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
import ExemptionsSection from './components/ExemptionsSection';
import { Globe, FileText, Table } from 'lucide-react';

const DEFAULT_COMPONENTS: SystemComponent[] = [
  { id: '1', name: 'Dearness Allowance', code: 'DA', databaseField: 'da_amount', category: 'earning' },
  { id: '2', name: 'Hours', code: 'HRS', databaseField: 'hours_worked', category: 'earning' },
  { id: '3', name: 'Leave and Travel Allowance', code: 'LTA', databaseField: 'lta_amount', category: 'earning' },
  { id: '4', name: 'Children Education Allowance', code: 'CEA', databaseField: 'children_education_allowance', category: 'earning' },
  { id: '5', name: 'Basic Salary', code: 'BASIC', databaseField: 'basic_salary', category: 'earning' },
  { id: '6', name: 'Professional Tax', code: 'PT', databaseField: 'pt_deduction', category: 'tax' },
];

const convertConfigToCSV = (config: PayrollConfiguration): string => {
  const safeStr = (str: string | undefined | null) => str ? `"${str.toString().replace(/"/g, '""')}"` : '';
  
  const formatConditions = (conditions?: any[]) => 
    conditions?.map(c => `${c.field} ${c.operator} ${c.value ?? ''}`).join(' AND ') || '';

  const formatBrackets = (brackets?: any[]) => 
    brackets?.map(b => `[${b.min}-${b.max || '∞'} @ ${b.rate}%]`).join('; ') || '';

  const headers = [
    "Section", "Index", "Name", "Code", "Type/Category", 
    "Calculation Method", "Value/Formula", "Base/Applied To", 
    "Cap Type", "Cap Amount", "Brackets", 
    "Taxability", "Payer Split", "Currency", 
    "Conditional Rules", "Output Mapping"
  ];

  let csv = headers.join(',') + "\n";

  const addRow = (section: string, idx: number, comp: any, categoryOverride?: string) => {
    let val = '';
    if (comp.amount) val = `Amount: ${comp.amount}`;
    else if (comp.percentage) val = `${comp.percentage}%`;
    else if (comp.formula) val = `Formula: ${comp.formula}`;
    
    let appliedTo = comp.appliedTo || '';
    if (comp.appliedToSystemComponentId) {
      const sc = config.componentLibrary.find(c => c.id === comp.appliedToSystemComponentId);
      appliedTo = sc ? `${sc.name} (${sc.code})` : comp.appliedToSystemComponentId;
    }

    const row = [
      safeStr(section), idx + 1, safeStr(comp.name), safeStr(comp.code),
      safeStr(categoryOverride || comp.type || comp.category),
      safeStr(comp.calculationMethod), safeStr(val), safeStr(appliedTo),
      safeStr(comp.cap?.type), safeStr(comp.cap?.amount || comp.cap?.percentage),
      safeStr(formatBrackets(comp.brackets)),
      safeStr(comp.taxTreatment || comp.taxabilityStatus),
      safeStr(comp.payerSplit || 'N/A'), safeStr(comp.currency || config.currency),
      safeStr(comp.conditionalRules ? 'Yes (See Logic)' : ''),
      safeStr(comp.outputSystemComponentId)
    ];
    csv += row.join(',') + "\n";
  };

  config.earnings.forEach((e, i) => addRow('Earnings', i, e));
  config.mandatoryDeductions.forEach((d, i) => addRow('Mandatory Deductions', i, d, 'Mandatory'));
  config.voluntaryDeductions.forEach((d, i) => addRow('Voluntary Deductions', i, d, 'Voluntary'));
  
  // Tax Regimes
  config.taxRegimes.forEach((regime, i) => {
    const row = [
      'Tax Configuration', i+1, safeStr(regime.name), 'TAX', 'Regime',
      safeStr(regime.config.taxSystemType), safeStr(regime.config.rate ? `${regime.config.rate}%` : ''),
      'Taxable Income', '', '', safeStr(formatBrackets(regime.config.brackets)),
      'N/A', 'Employee', safeStr(config.currency),
      safeStr(`Conditions: ${formatConditions(regime.conditions)}`), ''
    ];
    csv += row.join(',') + "\n";
  });

  // Exemptions
  config.exemptions.forEach((ex, i) => {
    const target = ex.targetType === 'specific_component' ? `ID: ${ex.targetComponentId}` : ex.targetType;
    const row = [
      'Exemptions', i+1, safeStr(ex.name), 'EXEMPT', 'Override',
      safeStr(ex.exemptionType), safeStr(ex.exemptionValue), safeStr(target),
      '', '', '', '', '', '', safeStr(`IF ${formatConditions(ex.conditions)}`), ''
    ];
    csv += row.join(',') + "\n";
  });

  return csv;
};

function App() {
  const [config, setConfig] = useState<PayrollConfiguration>({
    country: '',
    currency: 'USD',
    componentLibrary: DEFAULT_COMPONENTS,
    earnings: [],
    mandatoryDeductions: [],
    voluntaryDeductions: [],
    preTaxCredits: [],
    taxRegimes: [],
    exemptions: [],
    postTaxCredits: [],
    postTaxDeductions: [],
    postNetItems: [],
  });

  const updateConfig = (updates: Partial<PayrollConfiguration>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-900">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Payroll Configuration</h1>
                <p className="text-sm text-slate-600">Global Rules & Multi-Country Support</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Country</label>
                <input
                  type="text"
                  value={config.country}
                  onChange={(e) => updateConfig({ country: e.target.value })}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                  placeholder="e.g. South Africa"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `payroll-${config.country || 'config'}.json`;
                    link.click();
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                >
                  <FileText className="w-4 h-4" /> JSON
                </button>
                <button 
                  onClick={() => {
                    const blob = new Blob([convertConfigToCSV(config)], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `payroll-${config.country || 'config'}.csv`;
                    link.click();
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  <Table className="w-4 h-4" /> CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              taxRegimes={config.taxRegimes}
              componentLibrary={config.componentLibrary}
              onUpdate={(regimes) => updateConfig({ taxRegimes: regimes })}
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
              multiCurrency={config.multiCurrency}
              onUpdate={(deductions) => updateConfig({ postTaxDeductions: deductions })}
            />
            <PostNetSection
              items={config.postNetItems}
              currency={config.currency}
              componentLibrary={config.componentLibrary}
              onUpdate={(items) => updateConfig({ postNetItems: items })}
            />
            
            {/* Exemptions moved to the end as requested */}
            <ExemptionsSection
              exemptions={config.exemptions}
              componentLibrary={config.componentLibrary}
              mandatoryDeductions={config.mandatoryDeductions} // Dynamic Data Source
              taxRegimes={config.taxRegimes}                   // Dynamic Data Source
              currency={config.currency}
              onUpdate={(exemptions: ExemptionRule[]) => updateConfig({ exemptions })}
            />
          </div>
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