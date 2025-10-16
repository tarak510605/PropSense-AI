import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyListings from '../components/PropertyListings';
import { Building2 } from 'lucide-react';

const MarketplacePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Property Marketplace</h1>
          </div>
          <p className="text-gray-600">
            Browse available properties and find your dream home
          </p>
        </div>

        <PropertyListings />
      </div>
    </div>
  );
};

export default MarketplacePage;
