# Payroll Configuration Framework

A comprehensive, flexible frontend framework for configuring multi-country payroll systems. This tool allows you to configure earnings, deductions, taxes, and credits for any country's payroll requirements.

## Features

### 8 Configuration Sections

1. **Earnings** - Configure wages, allowances, and benefits
   - Support for cash/non-cash, regular/irregular, base/supplementary
   - Multiple calculation methods (fixed, percentage, progressive, formula-based, etc.)
   - Taxability status configuration

2. **Mandatory Deductions** - Required by law or regulation
   - Tax withholding, social security, health insurance
   - Pre-tax and post-tax routing options

3. **Voluntary Deductions** - Employee-chosen benefits
   - Retirement plans, health savings accounts, etc.
   - Flexible calculation methods

4. **Pre-Tax Tax Credits** - Credits that reduce taxable income
   - Standard deductions, exemptions, investment deductions

5. **Tax Configuration** - Income tax system
   - Progressive/Marginal tax
   - Slab/Bracket tax
   - Flat tax
   - Graduated scale
   - No tax / Exempt

6. **Post-Tax Tax Credits** - Credits that reduce final tax
   - Refundable and non-refundable credits
   - Phase-out configurations
   - Dependent-based credits

7. **Post-Tax Deductions** - Deductions after tax calculation
   - Loans, union dues, garnishments

8. **Post-Net Salary** - Final adjustments
   - Loan installments (deductions)
   - Reimbursements (additions)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:5173`

## Usage

1. **Set Country & Currency**: Enter the country name and select currency in the header
2. **Configure Earnings**: Add earning components (salary, allowances, bonuses, etc.)
3. **Add Deductions**: Configure mandatory and voluntary deductions
4. **Set Tax Credits**: Configure pre-tax and post-tax credits
5. **Configure Tax**: Set up the tax system (progressive, flat, etc.)
6. **Final Adjustments**: Add post-tax deductions and post-net items
7. **Export**: Click "Export Config" to download the configuration as JSON

## Configuration Structure

Each component supports:
- **Name & Code**: Unique identifiers
- **Calculation Methods**: Fixed amount, percentage, progressive slabs, capped, formula-based, table lookup, conditional
- **Tax Treatment**: Pre-tax vs post-tax routing
- **Flexible Routing**: Configure where deductions apply in the calculation flow

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/
│   ├── EarningsSection.tsx
│   ├── EarningCard.tsx
│   ├── MandatoryDeductionsSection.tsx
│   ├── VoluntaryDeductionsSection.tsx
│   ├── DeductionCard.tsx
│   ├── PreTaxCreditsSection.tsx
│   ├── PostTaxCreditsSection.tsx
│   ├── TaxCreditCard.tsx
│   ├── TaxSection.tsx
│   ├── PostTaxDeductionsSection.tsx
│   ├── PostNetSection.tsx
│   └── SummarySection.tsx
├── types.ts
├── App.tsx
└── main.tsx
```

## Export Format

The exported JSON configuration follows this structure:

```json
{
  "country": "United States",
  "currency": "USD",
  "earnings": [...],
  "mandatoryDeductions": [...],
  "voluntaryDeductions": [...],
  "preTaxCredits": [...],
  "tax": {...},
  "postTaxCredits": [...],
  "postTaxDeductions": [...],
  "postNetItems": [...]
}
```

## Presentation Tips

For board presentation:
1. Start with a simple example (e.g., US payroll)
2. Show how easy it is to add components
3. Demonstrate flexibility with different calculation methods
4. Show the export functionality
5. Highlight the universal framework approach

## License

This is a demonstration project for payroll configuration framework.

