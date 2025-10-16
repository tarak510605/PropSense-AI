import React, { useState } from 'react';
import { MapPin, Home, DollarSign, Maximize, Trash2, Eye, Calculator, Map, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageGallery from './ImageGallery';

const PropertyCard = ({ property, onDelete, onViewInsights, onViewNeighborhood, onViewPriceTrends, onViewMarketComparison }) => {
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if property is new (added within last 7 days)
  const isNew = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(property.createdAt) > weekAgo;
  };

  return (
    <div className="group relative card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-primary-200">
      {/* New Badge */}
      {isNew() && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg animate-pulse">
            NEW
          </span>
        </div>
      )}

      {/* Header with icon */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 flex-1 min-w-0 overflow-hidden">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <Home className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
              {property.propertyType}
            </h3>
            <div className="flex items-start text-gray-600 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-primary-500 mt-0.5" />
              <span className="line-clamp-2 break-words">{property.location}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-1 ml-2 flex-shrink-0">
          {property.aiInsights && (
            <button
              onClick={() => onViewInsights(property)}
              className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:shadow-md"
              title="View AI Insights"
            >
              <Eye className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(property._id)}
            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
            title="Delete Property"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      {property.images && property.images.length > 0 && (
        <div className="mb-4 -mx-6 -mt-2">
          <ImageGallery images={property.images} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2 mb-1">
            <Maximize className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-semibold text-blue-700">Area</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{property.area.toLocaleString()} sq ft</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <p className="text-xs font-semibold text-green-700">Price</p>
          </div>
          <p className="text-base font-bold text-gray-900">{formatPrice(property.price)}</p>
        </div>
      </div>

      {property.amenities && property.amenities.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 text-xs font-medium rounded-full border border-primary-200 hover:shadow-md transition-all"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-medium rounded-full border border-gray-300 hover:shadow-md transition-all">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {property.description && (
        <div className="mb-4 p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-amber-900 mb-2 uppercase tracking-wider flex items-center">
            <span className="mr-2">📝</span> Description
          </p>
          <p className="text-sm text-gray-700 leading-relaxed break-words">
            {property.description}
          </p>
        </div>
      )}

      {property.aiInsights && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">AI Estimated Value</span>
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(property.aiInsights.estimatedValue)}
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
          
          {showDetails && (
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Recommendation</p>
                <p className="text-sm text-gray-700">{property.aiInsights.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
        <button
          onClick={() => navigate('/mortgage-calculator', { state: { propertyPrice: property.price } })}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
        >
          <Calculator className="h-4 w-4" />
          <span>Calculate EMI</span>
        </button>
        
        {onViewNeighborhood && (
          <button
            onClick={() => onViewNeighborhood(property)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
          >
            <Map className="h-4 w-4" />
            <span>Neighborhood Insights</span>
          </button>
        )}
        
        {onViewPriceTrends && (
          <button
            onClick={() => onViewPriceTrends(property)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Price Trends</span>
          </button>
        )}
        
        {onViewMarketComparison && (
          <button
            onClick={() => onViewMarketComparison(property)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-xl hover:from-orange-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Market Comparison</span>
          </button>
        )}
      </div>

      <div className="text-xs text-gray-400 mt-4">
        Added on {formatDate(property.createdAt)}
      </div>
    </div>
  );
};

export default PropertyCard;
