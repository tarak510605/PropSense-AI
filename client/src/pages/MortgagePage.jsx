import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MortgageCalculator from '../components/MortgageCalculator';

const MortgagePage = () => {
  const location = useLocation();
  const propertyPrice = location.state?.propertyPrice || null;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Home Loan Calculator</h1>
          <p className="text-gray-600">
            Calculate your monthly EMI, total interest, and plan your home loan with our smart calculator
          </p>
        </div>

        <MortgageCalculator prefilledPrice={propertyPrice} />

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">What is EMI?</h3>
                <p className="text-sm text-blue-800">
                  EMI (Equated Monthly Installment) is the fixed monthly payment you make to repay your home loan. It includes both principal and interest components.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Pro Tip</h3>
                <p className="text-sm text-green-800">
                  A higher down payment reduces your loan amount and EMI. Experts recommend a down payment of at least 20% of the property value.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-purple-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Interest Rates</h3>
                <p className="text-sm text-purple-800">
                  Home loan interest rates typically range from 8% to 10% per annum. Lower rates can save you lakhs over the loan tenure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="font-semibold text-gray-700 cursor-pointer list-none flex justify-between items-center">
                How is EMI calculated?
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                EMI is calculated using the formula: EMI = [P x R x (1+R)^N] / [(1+R)^N-1], where P is the loan amount, R is the monthly interest rate, and N is the loan tenure in months.
              </p>
            </details>

            <details className="group border-t pt-4">
              <summary className="font-semibold text-gray-700 cursor-pointer list-none flex justify-between items-center">
                What is a good loan tenure?
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                A longer tenure (20-30 years) means lower EMI but higher total interest. A shorter tenure (10-15 years) means higher EMI but less total interest. Choose based on your monthly budget and financial goals.
              </p>
            </details>

            <details className="group border-t pt-4">
              <summary className="font-semibold text-gray-700 cursor-pointer list-none flex justify-between items-center">
                Can I prepay my home loan?
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Yes, most banks allow prepayment without penalties. Prepaying reduces your outstanding principal and can significantly reduce your total interest burden.
              </p>
            </details>

            <details className="group border-t pt-4">
              <summary className="font-semibold text-gray-700 cursor-pointer list-none flex justify-between items-center">
                What is the ideal EMI-to-income ratio?
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Financial experts recommend keeping your EMI below 40% of your monthly income. This ensures you have sufficient funds for other expenses and emergencies.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgagePage;
