import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MapPin, Home, Maximize, Check, AlertCircle, BarChart3 } from 'lucide-react';

const MarketComparison = ({ location, propertyType, price, area }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSimilarProperties();
  }, [location, propertyType, price]);

  const fetchSimilarProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/listings/similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location, propertyType, price, area })
      });

      const result = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.message || 'Failed to load market comparison');
      }
    } catch (err) {
      console.error('Market comparison error:', err);
      setError('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Analyzing market...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <p className="text-red-700 font-medium">{error}</p>
        <button
          onClick={fetchSimilarProperties}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { comparison, similarListings, aiInsights, totalFound } = data;
  
  // Handle case where no data is available
  if (!comparison || !similarListings || similarListings.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
        <h3 className="text-xl font-bold text-yellow-900 mb-2">No Market Data Available</h3>
        <p className="text-yellow-700 mb-4">
          We couldn't find similar properties in this location for comparison.
        </p>
        <button
          onClick={fetchSimilarProperties}
          className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  const formatPrice = (price) => `₹${(price / 100000).toFixed(2)}L`;

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'Great Deal': return 'bg-green-100 text-green-800 border-green-300';
      case 'Fair Price': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Slightly High': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Overpriced': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Position */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Market Position
          </h3>
          <span className={`px-4 py-2 rounded-full font-bold text-lg border-2 ${getRecommendationColor(comparison.analysis.recommendation)}`}>
            {comparison.analysis.recommendation}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Your Property</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatPrice(comparison.userProperty.price)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ₹{comparison.userProperty.pricePerSqFt.toLocaleString('en-IN')}/sq ft
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Market Average</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatPrice(comparison.market.avgPrice)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ₹{comparison.market.avgPricePerSqFt.toLocaleString('en-IN')}/sq ft
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Price Difference</p>
            <div className="flex items-center gap-2">
              {comparison.analysis.isAboveMarket ? (
                <TrendingUp className="w-6 h-6 text-red-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-green-500" />
              )}
              <p className={`text-2xl font-bold ${comparison.analysis.isAboveMarket ? 'text-red-600' : 'text-green-600'}`}>
                {Math.abs(comparison.analysis.priceDifferencePercent)}%
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {comparison.analysis.isAboveMarket ? 'Above' : 'Below'} market
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Based on analysis of <span className="font-bold">{totalFound}</span> similar properties in the area
          </p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${comparison.analysis.isAboveMarket ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(Math.abs(comparison.analysis.priceDifferencePercent) * 2, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
            Market Analysis
          </h3>
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {aiInsights}
          </div>
        </div>
      )}

      {/* Similar Properties */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Similar Properties in the Market ({similarListings.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {similarListings.map((listing) => (
            <div
              key={listing.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-800">{listing.title}</h4>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{listing.location}</span>
                  </div>
                </div>
                {listing.verified && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xl font-bold text-blue-600">
                    {formatPrice(listing.price)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{listing.pricePerSqFt.toLocaleString('en-IN')}/sq ft
                  </p>
                </div>
                {listing.price < price && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                    Lower Price
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  <span>{listing.bedrooms} BHK</span>
                </div>
                <div className="flex items-center gap-1">
                  <Maximize className="w-4 h-4" />
                  <span>{listing.area} sqft</span>
                </div>
                <div className="text-xs text-gray-500">
                  {listing.daysListed} days ago
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
              </div>
            </div>
          ))}
        </div>

        {similarListings.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No similar properties found in the market
          </p>
        )}
      </div>
    </div>
  );
};

export default MarketComparison;
