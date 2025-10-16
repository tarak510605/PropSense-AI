import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const MortgageCalculator = ({ prefilledPrice = null }) => {
  const [formData, setFormData] = useState({
    propertyPrice: prefilledPrice || 5000000,
    downPayment: prefilledPrice ? prefilledPrice * 0.2 : 1000000,
    loanAmount: prefilledPrice ? prefilledPrice * 0.8 : 4000000,
    interestRate: 8.5,
    loanTenure: 20
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    let updatedData = { ...formData, [name]: numValue };

    // Auto-calculate loan amount if property price or down payment changes
    if (name === 'propertyPrice' || name === 'downPayment') {
      updatedData.loanAmount = updatedData.propertyPrice - updatedData.downPayment;
    }

    setFormData(updatedData);
  };

  const calculateMortgage = async () => {
    setLoading(true);
    try {
      console.log('Sending mortgage calculation request:', {
        loanAmount: formData.loanAmount,
        interestRate: formData.interestRate,
        loanTenure: formData.loanTenure,
        propertyPrice: formData.propertyPrice,
        downPayment: formData.downPayment
      });

      const response = await fetch('http://localhost:5000/api/mortgage/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loanAmount: formData.loanAmount,
          interestRate: formData.interestRate,
          loanTenure: formData.loanTenure,
          propertyPrice: formData.propertyPrice,
          downPayment: formData.downPayment
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setResults(data.results);
      } else {
        console.error('Failed response:', data);
        alert(`Failed to calculate mortgage: ${JSON.stringify(data.errors || data.message || 'Unknown error')}`);
      }
    } catch (error) {
      console.error('Error calculating mortgage:', error);
      alert(`Error calculating mortgage: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = results ? [
    { name: 'Principal', value: results.principalAmount, color: '#3b82f6' },
    { name: 'Interest', value: results.totalInterest, color: '#ef4444' }
  ] : [];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800">Mortgage Calculator</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Price (₹)
            </label>
            <input
              type="number"
              name="propertyPrice"
              value={formData.propertyPrice}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Down Payment (₹)
            </label>
            <input
              type="number"
              name="downPayment"
              value={formData.downPayment}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              {((formData.downPayment / formData.propertyPrice) * 100).toFixed(1)}% of property price
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount (₹)
            </label>
            <input
              type="number"
              name="loanAmount"
              value={formData.loanAmount}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (% per annum)
            </label>
            <input
              type="number"
              step="0.1"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Tenure (Years)
            </label>
            <input
              type="number"
              name="loanTenure"
              value={formData.loanTenure}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="range"
              min="5"
              max="30"
              name="loanTenure"
              value={formData.loanTenure}
              onChange={handleInputChange}
              className="w-full mt-2"
            />
          </div>

          <button
            onClick={calculateMortgage}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
          >
            {loading ? 'Calculating...' : 'Calculate EMI'}
          </button>
        </div>

        {/* Results Section */}
        <div>
          {results ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
                <p className="text-sm opacity-90 mb-1">Monthly EMI</p>
                <p className="text-3xl font-bold">{formatCurrency(results.emi)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Principal Amount</p>
                  <p className="text-lg font-semibold text-green-700">{formatCurrency(results.principalAmount)}</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                  <p className="text-lg font-semibold text-red-700">{formatCurrency(results.totalInterest)}</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Total Amount Payable</p>
                  <p className="text-xl font-bold text-purple-700">{formatCurrency(results.totalAmount)}</p>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Payment Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Loan Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payments:</span>
                  <span className="font-semibold">{results.summary.totalPayments} months</span>
                </div>
                {results.loanToValue && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan-to-Value Ratio:</span>
                    <span className="font-semibold">{results.loanToValue}%</span>
                  </div>
                )}
                {results.downPaymentPercentage && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Down Payment:</span>
                    <span className="font-semibold">{results.downPaymentPercentage}%</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg p-8 text-center">
              <div>
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">Enter loan details and click "Calculate EMI" to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
