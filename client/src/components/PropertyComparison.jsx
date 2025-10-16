import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, TrendingUp, MapPin, Maximize, DollarSign, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PropertyComparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPropertyIds = location.state?.selectedPropertyIds || [];

  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedPropertyIds.length < 2) {
      setError('Please select at least 2 properties to compare');
      setLoading(false);
      return;
    }

    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ propertyIds: selectedPropertyIds })
      });

      const data = await response.json();

      if (data.success) {
        setComparison(data.comparison);
      } else {
        setError(data.message || 'Failed to compare properties');
      }
    } catch (err) {
      console.error('Comparison error:', err);
      setError('Error loading comparison. Please try again.');
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

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Comparison Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!comparison || !comparison.properties) {
    return null;
  }

  const { properties, analytics, aiComparison } = comparison;

  // Prepare chart data
  const chartData = properties.map((prop, idx) => ({
    name: `Property ${idx + 1}`,
    Price: prop.price,
    'Price/SqFt': prop.pricePerSqFt,
    Area: prop.area
  }));

  // Find best values
  const bestPrice = properties.reduce((min, p) => p.price < min.price ? p : min, properties[0]);
  const bestArea = properties.reduce((max, p) => p.area > max.area ? p : max, properties[0]);
  const bestPricePerSqFt = properties.reduce((min, p) => p.pricePerSqFt < min.pricePerSqFt ? p : min, properties[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Property Comparison</h1>
            <p className="text-gray-600 mt-1">
              Comparing {properties.length} properties side-by-side
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium mb-1">Average Price</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(analytics.avgPrice)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium mb-1">Average Area</p>
          <p className="text-2xl font-bold text-green-900">{formatNumber(analytics.avgArea)} sq ft</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium mb-1">Avg Price/Sq Ft</p>
          <p className="text-2xl font-bold text-purple-900">{formatCurrency(analytics.avgPricePerSqFt)}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-600 font-medium mb-1">Price Range</p>
          <p className="text-lg font-bold text-orange-900">
            {formatCurrency(analytics.minPrice)} - {formatCurrency(analytics.maxPrice)}
          </p>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Visual Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatNumber(value)} />
            <Legend />
            <Bar dataKey="Price" fill="#3b82f6" />
            <Bar dataKey="Area" fill="#10b981" />
            <Bar dataKey="Price/SqFt" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Property Comparison Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Feature</th>
                {properties.map((prop, idx) => (
                  <th key={prop.id} className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Property {idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Property Type */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">Property Type</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="px-6 py-4 text-sm text-gray-900">{prop.propertyType}</td>
                ))}
              </tr>

              {/* Location */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    Location
                  </div>
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="px-6 py-4 text-sm text-gray-900">{prop.location}</td>
                ))}
              </tr>

              {/* Price */}
              <tr className="hover:bg-gray-50 bg-blue-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    Price
                  </div>
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(prop.price)}</span>
                      {prop.id === bestPrice.id && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" title="Best Price" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Area */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <Maximize className="h-4 w-4 mr-2 text-gray-400" />
                    Area
                  </div>
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{formatNumber(prop.area)} sq ft</span>
                      {prop.id === bestArea.id && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" title="Largest Area" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price per Sq Ft */}
              <tr className="hover:bg-gray-50 bg-purple-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                    Price per Sq Ft
                  </div>
                </td>
                {properties.map((prop) => (
                  <td key={prop.id} className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(prop.pricePerSqFt)}</span>
                      {prop.id === bestPricePerSqFt.id && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" title="Best Value" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Amenities */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-700">Amenities</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {prop.amenities && prop.amenities.length > 0 ? (
                        prop.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {amenity}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">None listed</span>
                      )}
                      {prop.amenities && prop.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{prop.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* AI Estimated Value */}
              {properties.some(p => p.aiInsights?.estimatedValue) && (
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">AI Estimated Value</td>
                  {properties.map((prop) => (
                    <td key={prop.id} className="px-6 py-4 text-sm text-gray-900">
                      {prop.aiInsights?.estimatedValue 
                        ? formatCurrency(prop.aiInsights.estimatedValue)
                        : '-'
                      }
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Comparison Insights */}
      {aiComparison && !aiComparison.includes('unavailable') && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">AI Comparison Insights</h2>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {aiComparison}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyComparison;
