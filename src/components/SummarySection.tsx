import { PayrollConfiguration } from '../types';
import { Calculator, CheckCircle2 } from 'lucide-react';

interface SummarySectionProps {
  config: PayrollConfiguration;
}

export default function SummarySection({ config }: SummarySectionProps) {
  const totalEarnings = config.earnings.length;
  const totalMandatoryDeductions = config.mandatoryDeductions.length;
  const totalVoluntaryDeductions = config.voluntaryDeductions.length;
  const totalPreTaxCredits = config.preTaxCredits.length;
  const totalPostTaxCredits = config.postTaxCredits.length;
  const totalPostTaxDeductions = config.postTaxDeductions.length;
  const totalPostNetItems = config.postNetItems.length;

  const isComplete = 
    config.country !== '' &&
    totalEarnings > 0 &&
    config.tax !== null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-bold text-slate-900">Configuration Summary</h2>
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div className={`p-3 rounded-lg border-2 ${isComplete ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${isComplete ? 'text-green-600' : 'text-yellow-600'}`} />
            <span className={`text-sm font-medium ${isComplete ? 'text-green-800' : 'text-yellow-800'}`}>
              {isComplete ? 'Ready to Export' : 'Configuration Incomplete'}
            </span>
          </div>
        </div>

        {/* Country Info */}
        {config.country && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-600 mb-1">Country</div>
            <div className="font-semibold text-slate-900">{config.country}</div>
            <div className="text-xs text-slate-500 mt-1">Currency: {config.currency}</div>
          </div>
        )}

        {/* Statistics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200">
            <span className="text-sm text-slate-700 font-medium">System Components</span>
            <span className="font-semibold text-purple-700">{config.componentLibrary.length}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span className="text-sm text-slate-600">Earnings</span>
            <span className="font-semibold text-slate-900">{totalEarnings}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span className="text-sm text-slate-600">Mandatory Deductions</span>
            <span className="font-semibold text-slate-900">{totalMandatoryDeductions}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span className="text-sm text-slate-600">Voluntary Deductions</span>
            <span className="font-semibold text-slate-900">{totalVoluntaryDeductions}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span className="text-sm text-slate-600">Pre-Tax Credits</span>
            <span className="font-semibold text-slate-900">{totalPreTaxCredits}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span className="text-sm text-slate-600">Tax System</span>
            <span className="font-semibold text-slate-900">
              {config.tax ? config.tax.taxSystemType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not Configured'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span className="text-sm text-slate-600">Post-Tax Credits</span>
            <span className="font-semibold text-slate-900">{totalPostTaxCredits}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span className="text-sm text-slate-600">Post-Tax Deductions</span>
            <span className="font-semibold text-slate-900">{totalPostTaxDeductions}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
            <span className="text-sm text-slate-600">Post-Net Items</span>
            <span className="font-semibold text-slate-900">{totalPostNetItems}</span>
          </div>
        </div>

        {/* Calculation Flow */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-3">Calculation Flow</div>
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
              <span>Gross Pay (Earnings)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span>→ Mandatory Deductions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span>→ Voluntary Deductions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span>→ Pre-Tax Credits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span>→ Tax Calculation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span>→ Post-Tax Credits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span>→ Post-Tax Deductions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-semibold">Net Pay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span>→ Post-Net Adjustments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

