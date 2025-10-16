import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   POST /api/mortgage/calculate
// @desc    Calculate mortgage EMI and loan details
// @access  Public (no authentication needed)
router.post('/calculate', [
  body('loanAmount').isNumeric().withMessage('Loan amount must be a number'),
  body('interestRate').isNumeric().withMessage('Interest rate must be a number'),
  body('loanTenure').isNumeric().withMessage('Loan tenure must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { loanAmount, interestRate, loanTenure, propertyPrice, downPayment } = req.body;

    // Calculate monthly interest rate
    const monthlyInterestRate = interestRate / (12 * 100);
    
    // Calculate number of months
    const numberOfMonths = loanTenure * 12;

    // Calculate EMI using formula: P * r * (1+r)^n / ((1+r)^n - 1)
    let emi = 0;
    if (monthlyInterestRate > 0) {
      const powFactor = Math.pow(1 + monthlyInterestRate, numberOfMonths);
      emi = (loanAmount * monthlyInterestRate * powFactor) / (powFactor - 1);
    } else {
      emi = loanAmount / numberOfMonths;
    }

    // Calculate total amount payable
    const totalAmount = emi * numberOfMonths;

    // Calculate total interest
    const totalInterest = totalAmount - loanAmount;

    // Calculate monthly breakdown for first year
    let remainingPrincipal = loanAmount;
    const amortizationSchedule = [];
    
    for (let month = 1; month <= Math.min(12, numberOfMonths); month++) {
      const interestPayment = remainingPrincipal * monthlyInterestRate;
      const principalPayment = emi - interestPayment;
      remainingPrincipal -= principalPayment;

      amortizationSchedule.push({
        month,
        emi: Math.round(emi),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.round(remainingPrincipal)
      });
    }

    // Calculate affordability metrics
    const loanToValue = propertyPrice ? (loanAmount / propertyPrice * 100) : null;
    const downPaymentPercentage = propertyPrice && downPayment ? (downPayment / propertyPrice * 100) : null;

    res.json({
      success: true,
      results: {
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
        principalAmount: loanAmount,
        loanToValue: loanToValue ? Math.round(loanToValue * 100) / 100 : null,
        downPaymentPercentage: downPaymentPercentage ? Math.round(downPaymentPercentage * 100) / 100 : null,
        amortizationSchedule,
        summary: {
          monthlyPayment: Math.round(emi),
          totalPayments: numberOfMonths,
          totalCost: Math.round(totalAmount),
          interestPaid: Math.round(totalInterest),
          principalPaid: loanAmount
        }
      }
    });
  } catch (error) {
    console.error('Mortgage calculation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to calculate mortgage', 
      error: error.message 
    });
  }
});

// @route   POST /api/mortgage/compare
// @desc    Compare multiple loan scenarios
// @access  Public
router.post('/compare', async (req, res) => {
  try {
    const { scenarios } = req.body;

    if (!scenarios || !Array.isArray(scenarios)) {
      return res.status(400).json({ 
        success: false,
        message: 'Scenarios array is required' 
      });
    }

    const comparisons = scenarios.map((scenario, index) => {
      const { loanAmount, interestRate, loanTenure } = scenario;
      
      const monthlyInterestRate = interestRate / (12 * 100);
      const numberOfMonths = loanTenure * 12;

      let emi = 0;
      if (monthlyInterestRate > 0) {
        const powFactor = Math.pow(1 + monthlyInterestRate, numberOfMonths);
        emi = (loanAmount * monthlyInterestRate * powFactor) / (powFactor - 1);
      } else {
        emi = loanAmount / numberOfMonths;
      }

      const totalAmount = emi * numberOfMonths;
      const totalInterest = totalAmount - loanAmount;

      return {
        scenarioId: index + 1,
        name: scenario.name || `Scenario ${index + 1}`,
        emi: Math.round(emi),
        totalInterest: Math.round(totalInterest),
        totalAmount: Math.round(totalAmount),
        interestRate: interestRate,
        tenure: loanTenure
      };
    });

    res.json({
      success: true,
      comparisons
    });
  } catch (error) {
    console.error('Mortgage comparison error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to compare mortgages', 
      error: error.message 
    });
  }
});

export default router;
