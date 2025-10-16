import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, AlertCircle, BarChart3, Calendar } from 'lucide-react';

const PriceTrends = ({ location, propertyType, price, area }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPriceHistory();
  }, [location, propertyType, price]);

  const fetchPriceHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/price-history/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location, propertyType, price, area })
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to load price history');
      }
    } catch (err) {
      console.error('Price history error:', err);
      setError('Failed to fetch price history data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Analyzing price trends...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <p className="text-red-700 font-medium">{error}</p>
        <button
          onClick={fetchPriceHistory}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { historicalData, predictions, indicators, aiAnalysis } = data;

  // Combine historical and predicted data for chart
  const combinedData = [
    ...historicalData.map(d => ({ ...d, type: 'historical' })),
    ...predictions.map(p => ({ year: p.year, price: p.predictedPrice, type: 'predicted', confidence: p.confidence }))
  ];

  // Format price for display
  const formatPrice = (value) => `₹${(value / 100000).toFixed(1)}L`;

  // Get trend icon
  const getTrendIcon = (value) => {
    return parseFloat(value) > 0 ? 
      <TrendingUp className="w-5 h-5 text-green-500" /> : 
      <TrendingDown className="w-5 h-5 text-red-500" />;
  };

  // Get grade color
  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getGradeColor(indicators.investmentGrade)}`}>
              Grade {indicators.investmentGrade}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-1">Market Phase</p>
          <p className="text-lg font-bold text-gray-800">{indicators.marketPhase}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            {getTrendIcon(indicators.yoyGrowth)}
          </div>
          <p className="text-xs text-gray-600 mb-1">YoY Growth</p>
          <p className="text-lg font-bold text-gray-800">{indicators.yoyGrowth}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Avg Annual Growth</p>
          <p className="text-lg font-bold text-gray-800">{indicators.avgAnnualAppreciation}%</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Total Appreciation</p>
          <p className="text-lg font-bold text-gray-800">{indicators.totalAppreciation}%</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Volatility</p>
          <p className="text-lg font-bold text-gray-800">{indicators.volatility}%</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Data Range</p>
          <p className="text-lg font-bold text-gray-800">10 Years</p>
        </div>
      </div>

      {/* Price Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          Historical & Predicted Price Trends
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={combinedData}>
            <defs>
              <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatPrice} />
            <Tooltip 
              formatter={(value, name) => [formatPrice(value), name === 'price' ? 'Price' : 'Predicted']}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              fill="url(#colorHistorical)"
              strokeWidth={2}
              name="Historical Price"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Note:</span> Blue area shows historical prices. 
            Future predictions are based on historical trends and market analysis.
          </p>
        </div>
      </div>

      {/* Future Predictions */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Target className="w-6 h-6 mr-2 text-green-600" />
          Price Predictions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictions.slice(0, 3).map((pred, index) => (
            <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{pred.year} ({index + 1} Year{index > 0 ? 's' : ''})</span>
                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full">
                  {pred.confidence}% confidence
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                ₹{pred.predictedPrice.toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                +{((pred.predictedPrice - price) / price * 100).toFixed(1)}% from current
              </p>
            </div>
          ))}
        </div>

        {predictions.length > 3 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions.slice(3).map((pred, index) => (
              <div key={index + 3} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{pred.year} ({index + 4} Years)</span>
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded-full">
                    {pred.confidence}% confidence
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{pred.predictedPrice.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  +{((pred.predictedPrice - price) / price * 100).toFixed(1)}% from current
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-purple-600" />
            Market Analysis & Investment Insights
          </h3>
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* View Details Button */}
      <div className="text-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          {showDetails ? 'Hide' : 'View'} Detailed Analysis
        </button>
      </div>

      {/* Detailed Data Table */}
      {showDetails && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Historical Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appreciation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historicalData.map((item, index) => {
                  const prevPrice = index > 0 ? historicalData[index - 1].price : item.price;
                  const change = ((item.price - prevPrice) / prevPrice * 100).toFixed(2);
                  return (
                    <tr key={item.year} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.appreciation.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={index === 0 ? 'text-gray-400' : parseFloat(change) > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {index === 0 ? '-' : `${change > 0 ? '+' : ''}${change}%`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceTrends;
