export type CalculationMethod = 
  | 'fixed_amount' 
  | 'percentage' 
  | 'progressive_slab' 
  | 'capped' 
  | 'formula' 
  | 'table_lookup' 
  | 'conditional';

export type TaxSystemType = 
  | 'progressive_marginal' 
  | 'slab_bracket' 
  | 'flat_tax' 
  | 'graduated_scale' 
  | 'no_tax';

export type CreditType = 'pre_tax' | 'post_tax';
export type CreditMethod = 'income_reduction' | 'tax_reduction';
export type Refundability = 'non_refundable' | 'refundable' | 'partial';

export type EarningType = 'cash' | 'non_cash';
export type Regularity = 'regular' | 'irregular';
export type BaseType = 'base' | 'supplementary';
export type TaxabilityStatus = 'fully_taxable' | 'partially_taxable' | 'non_taxable';

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  name?: string;
}

export interface Cap {
  type: 'annual' | 'monthly' | 'percentage_of_earnings';
  amount?: number;
  percentage?: number;
  capType?: string;
  appliedTo?: string;
}

export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'between';
export type LogicalOperator = 'AND' | 'OR';

export interface Condition {
  field: string;
  operator: ComparisonOperator;
  value?: number;
  minValue?: number; // For "between" operator
  maxValue?: number; // For "between" operator
}

export interface ConditionalRule {
  id: string;
  conditionType: 'if' | 'else_if' | 'else';
  conditions: Condition[]; // Support multiple conditions with AND/OR
  logicalOperator?: LogicalOperator; // AND or OR between conditions (default: AND)
  thenAction: {
    type: 'amount' | 'percentage' | 'calculation_method';
    amount?: number;
    percentage?: number;
    calculationMethod?: CalculationMethod;
    appliedTo?: string;
  };
}

export interface ConditionalRules {
  rules: ConditionalRule[];
}

export interface SystemComponent {
  id: string;
  name: string;
  code: string;
  databaseField: string; // Field name in employee database (e.g., "basic_salary", "da_amount")
  category: 'earning' | 'deduction' | 'credit' | 'tax' | 'other';
  description?: string;
}

export interface EarningComponent {
  id: string;
  name: string;
  code: string;
  type: EarningType;
  regularity: Regularity;
  baseType: BaseType;
  taxabilityStatus: TaxabilityStatus;
  calculationMethod: CalculationMethod;
  systemComponentId?: string; // Reference to system component (e.g., "BASIC", "DA", "HRS")
  amount?: number; // Manual amount (if not using system component)
  percentage?: number;
  appliedTo?: string;
  formula?: string;
  variables?: string[];
  conditions?: string[];
  cap?: Cap;
  brackets?: TaxBracket[];
  conditionalRules?: ConditionalRule[]; // For conditional calculation method
  currency?: string; // Currency for this earning (if multi-currency enabled)
  splitCurrency?: { // For split currency payments
    primaryCurrency: string;
    primaryAmount?: number;
    secondaryCurrency?: string;
    secondaryAmount?: number;
    splitPercentage?: number; // Percentage in primary currency
  };
}

export interface DeductionComponent {
  id: string;
  name: string;
  code: string;
  authority: 'mandatory' | 'voluntary';
  taxTreatment: 'pre_tax' | 'post_tax';
  payerSplit: 'employee_only' | 'employer_only' | 'both';
  calculationMethod: CalculationMethod;
  systemComponentId?: string; // Reference to system component
  amount?: number; // Manual amount (if not using system component)
  percentage?: number;
  appliedTo?: string;
  formula?: string;
  variables?: string[];
  conditions?: string[];
  cap?: Cap;
  brackets?: TaxBracket[];
  conditionalRules?: ConditionalRule[]; // For conditional calculation method
  currency?: string; // Currency for this deduction (mandatory deductions use official currency)
  useOfficialCurrency?: boolean; // Force use of official currency (for statutory deductions)
}

export interface TaxCredit {
  id: string;
  name: string;
  code: string;
  creditType: CreditType;
  creditMethod: CreditMethod;
  amount?: number;
  percentage?: number;
  refundability?: Refundability;
  refundablePercentage?: number;
  phaseOut?: {
    startIncome: number;
    endIncome: number;
    reduction: 'linear' | 'step';
  };
  amountPerDependent?: number;
  maxDependents?: number;
  includeSpouse?: boolean;
}

export interface TaxConfiguration {
  taxSystemType: TaxSystemType;
  rate?: number;
  brackets?: TaxBracket[];
  appliedTo?: string;
  calculationMethod?: 'marginal' | 'slab';
}

export interface PostNetItem {
  id: string;
  name: string;
  code: string;
  type: 'deduction' | 'addition';
  calculationMethod: CalculationMethod;
  systemComponentId?: string; // Reference to system component
  amount?: number; // Manual amount (if not using system component)
  percentage?: number;
  appliedTo?: string;
  conditionalRules?: ConditionalRule[]; // For conditional calculation method
}

export interface CurrencyConfig {
  code: string;
  name: string;
  isOfficial: boolean; // Official currency for statutory deductions
  exchangeRate?: number; // Exchange rate to base currency (if applicable)
}

export interface MultiCurrencyConfig {
  enabled: boolean;
  baseCurrency: string; // Primary currency for calculations
  officialCurrency: string; // Currency for statutory deductions
  currencies: CurrencyConfig[];
  exchangeRates: Record<string, number>; // Exchange rates between currencies
}

export interface PayrollConfiguration {
  country: string;
  currency: string; // Legacy single currency (for backward compatibility)
  multiCurrency?: MultiCurrencyConfig; // Multi-currency configuration
  componentLibrary: SystemComponent[]; // System-defined components (DA, HRS, BASIC, etc.)
  earnings: EarningComponent[];
  mandatoryDeductions: DeductionComponent[];
  voluntaryDeductions: DeductionComponent[];
  preTaxCredits: TaxCredit[];
  tax: TaxConfiguration | null;
  postTaxCredits: TaxCredit[];
  postTaxDeductions: DeductionComponent[];
  postNetItems: PostNetItem[];
}

