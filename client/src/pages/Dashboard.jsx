import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import ChatUI from '../components/ChatUI';
import FloatingChatButton from '../components/FloatingChatButton';
import NeighborhoodInsights from '../components/NeighborhoodInsights';
import PriceTrends from '../components/PriceTrends';
import MarketComparison from '../components/MarketComparison';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Home,
  DollarSign,
  AlertCircle,
  Loader,
  PlusCircle,
  BarChart3,
  GitCompare,
  X,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const chatRef = useRef(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showNeighborhood, setShowNeighborhood] = useState(false);
  const [selectedForNeighborhood, setSelectedForNeighborhood] = useState(null);
  const [showPriceTrends, setShowPriceTrends] = useState(false);
  const [selectedForPriceTrends, setSelectedForPriceTrends] = useState(null);
  const [showMarketComparison, setShowMarketComparison] = useState(false);
  const [selectedForMarketComparison, setSelectedForMarketComparison] = useState(null);
  const [selectedForComparison, setSelectedForComparison] = useState([]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    fetchProperties();
  }, []);

  // Additional effect to ensure page stays at top after content loads
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [loading]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getAll();
      setProperties(response.data.properties);
    } catch (err) {
      setError('Failed to load properties');
      console.error('Fetch properties error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      await propertiesAPI.delete(id);
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err) {
      alert('Failed to delete property');
      console.error('Delete error:', err);
    }
  };

  const handleViewInsights = (property) => {
    setSelectedProperty(property);
    setShowInsights(true);
  };

  const handleViewNeighborhood = (property) => {
    setSelectedForNeighborhood(property);
    setShowNeighborhood(true);
  };

  const handleViewPriceTrends = (property) => {
    setSelectedForPriceTrends(property);
    setShowPriceTrends(true);
  };

  const handleViewMarketComparison = (property) => {
    setSelectedForMarketComparison(property);
    setShowMarketComparison(true);
  };

  const togglePropertyForComparison = (propertyId) => {
    setSelectedForComparison(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        if (prev.length >= 4) {
          alert('You can compare maximum 4 properties at a time');
          return prev;
        }
        return [...prev, propertyId];
      }
    });
  };

  const handleCompare = () => {
    if (selectedForComparison.length < 2) {
      alert('Please select at least 2 properties to compare');
      return;
    }
    navigate('/compare', { state: { selectedPropertyIds: selectedForComparison } });
  };

  const clearComparison = () => {
    setSelectedForComparison([]);
  };

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Calculate statistics
  const stats = {
    totalProperties: properties.length,
    totalValue: properties.reduce((sum, p) => sum + p.price, 0),
    avgValue: properties.length > 0 ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length : 0,
    withInsights: properties.filter((p) => p.aiInsights).length,
  };

  // Prepare chart data
  const propertyTypeData = properties.reduce((acc, property) => {
    const type = property.propertyType;
    const existing = acc.find((item) => item.name === type);
    if (existing) {
      existing.count += 1;
      existing.value += property.price;
    } else {
      acc.push({ name: type, count: 1, value: property.price });
    }
    return acc;
  }, []);

  const priceComparisonData = properties
    .filter((p) => p.aiInsights)
    .map((p) => ({
      location: p.location.substring(0, 15) + '...',
      listed: p.price,
      estimated: p.aiInsights.estimatedValue,
    }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Dashboard</h1>
          <p className="text-gray-600">Manage your properties and view AI-powered insights</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Properties Card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-white bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  Total
                </span>
              </div>
              <p className="text-white text-opacity-90 text-sm font-medium mb-1">Properties</p>
              <p className="text-3xl font-bold text-white">{stats.totalProperties}</p>
            </div>
          </div>

          {/* Total Value Card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">₹</span>
                </div>
                <span className="text-xs font-semibold text-white bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  Value
                </span>
              </div>
              <p className="text-white text-opacity-90 text-sm font-medium mb-1">Total Worth</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
          </div>

          {/* Average Value Card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-white bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  Avg
                </span>
              </div>
              <p className="text-white text-opacity-90 text-sm font-medium mb-1">Average Price</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.avgValue)}
              </p>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-white bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  AI
                </span>
              </div>
              <p className="text-white text-opacity-90 text-sm font-medium mb-1">AI Analysis</p>
              <p className="text-3xl font-bold text-white">{stats.withInsights}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {properties.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Property Type Distribution */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Property Type Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name} (${count})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Value by Property Type */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Value by Property Type
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Total Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Price Comparison */}
            {priceComparisonData.length > 0 && (
              <div className="card lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Listed vs AI Estimated Value
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="listed" stroke="#3b82f6" name="Listed Price" strokeWidth={2} />
                    <Line type="monotone" dataKey="estimated" stroke="#10b981" name="AI Estimated" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Properties List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Properties</h2>
            <div className="flex items-center space-x-3">
              {selectedForComparison.length > 0 && (
                <>
                  <span className="text-sm text-gray-600">
                    {selectedForComparison.length} selected
                  </span>
                  <button
                    onClick={handleCompare}
                    className="btn-primary flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <GitCompare className="h-5 w-5" />
                    <span>Compare</span>
                  </button>
                  <button
                    onClick={clearComparison}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </>
              )}
              <button
                onClick={() => navigate('/add-property')}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Add Property</span>
              </button>
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="card text-center py-12">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first property to get AI-powered insights
              </p>
              <button
                onClick={() => navigate('/add-property')}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Add Your First Property</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property._id} className="relative">
                  {/* Comparison Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedForComparison.includes(property._id)}
                      onChange={() => togglePropertyForComparison(property._id)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                      title="Select for comparison"
                    />
                  </div>
                  <PropertyCard
                    property={property}
                    onDelete={handleDelete}
                    onViewInsights={handleViewInsights}
                    onViewNeighborhood={handleViewNeighborhood}
                    onViewPriceTrends={handleViewPriceTrends}
                    onViewMarketComparison={handleViewMarketComparison}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Chat Assistant */}
        <div ref={chatRef} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Assistant</h2>
          <ChatUI propertyContext={selectedProperty} />
        </div>

        {/* Insights Modal */}
        {showInsights && selectedProperty && selectedProperty.aiInsights && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">AI Insights</h3>
                <button
                  onClick={() => setShowInsights(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Property Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Location:</strong> {selectedProperty.location}</p>
                    <p><strong>Type:</strong> {selectedProperty.propertyType}</p>
                    <p><strong>Area:</strong> {selectedProperty.area.toLocaleString()} sq ft</p>
                    <p><strong>Listed Price:</strong> {formatCurrency(selectedProperty.price)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">AI Estimated Value</h4>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatCurrency(selectedProperty.aiInsights.estimatedValue)}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Analysis</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedProperty.aiInsights.analysis}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Recommendation</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedProperty.aiInsights.recommendation}
                  </p>
                </div>

                {selectedProperty.aiInsights.prosCons && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Pros</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {selectedProperty.aiInsights.prosCons.pros.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Cons</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {selectedProperty.aiInsights.prosCons.cons.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowInsights(false)}
                className="btn-primary w-full mt-6"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Neighborhood Insights Modal */}
        {showNeighborhood && selectedForNeighborhood && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Neighborhood Insights</h2>
                  <p className="text-gray-600 mt-1">{selectedForNeighborhood.location}</p>
                </div>
                <button
                  onClick={() => setShowNeighborhood(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <NeighborhoodInsights 
                  location={selectedForNeighborhood.location}
                  propertyType={selectedForNeighborhood.propertyType}
                  price={selectedForNeighborhood.price}
                />
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <button
                  onClick={() => setShowNeighborhood(false)}
                  className="btn-primary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Price Trends Modal */}
        {showPriceTrends && selectedForPriceTrends && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Historical Price Trends</h2>
                  <p className="text-gray-600 mt-1">{selectedForPriceTrends.location}</p>
                </div>
                <button
                  onClick={() => setShowPriceTrends(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <PriceTrends 
                  location={selectedForPriceTrends.location}
                  propertyType={selectedForPriceTrends.propertyType}
                  price={selectedForPriceTrends.price}
                  area={selectedForPriceTrends.area}
                />
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <button
                  onClick={() => setShowPriceTrends(false)}
                  className="btn-primary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Market Comparison Modal */}
        {showMarketComparison && selectedForMarketComparison && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Market Comparison</h2>
                  <p className="text-gray-600 mt-1">{selectedForMarketComparison.location}</p>
                </div>
                <button
                  onClick={() => setShowMarketComparison(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6">
                <MarketComparison 
                  location={selectedForMarketComparison.location}
                  propertyType={selectedForMarketComparison.propertyType}
                  price={selectedForMarketComparison.price}
                  area={selectedForMarketComparison.area}
                />
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <button
                  onClick={() => setShowMarketComparison(false)}
                  className="btn-primary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Chat Button */}
        <FloatingChatButton onClick={scrollToChat} />
      </div>
    </div>
  );
};

export default Dashboard;
