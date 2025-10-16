import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getChatResponse } from '../services/gemini.js';
import { generatePropertyImageSet, getCuratedPropertyImages } from '../services/unsplash.js';

const router = express.Router();

// Mock property listings data generator
// In production, this would call real APIs like MagicBricks, 99acres, Housing.com, etc.
const generateMockListings = (filters = {}) => {
  const {
    location = '',
    minPrice = 0,
    maxPrice = 100000000,
    propertyType = '',
    bedrooms = '',
    sortBy = 'relevant'
  } = filters;

  const locations = [
    'Mumbai, Andheri West', 'Delhi, Dwarka', 'Bangalore, Whitefield',
    'Hyderabad, Gachibowli', 'Pune, Hinjewadi', 'Chennai, OMR',
    'Kolkata, Salt Lake', 'Ahmedabad, SG Highway', 'Gurgaon, Sector 54',
    'Noida, Sector 62', 'Mumbai, Powai', 'Bangalore, Koramangala',
    'Hyderabad, Miyapur', 'Pune, Kharadi', 'Chennai, Velachery'
  ];

  const propertyTypes = ['Apartment', 'Villa', 'Independent House', 'Penthouse', 'Studio'];
  
  const amenitiesList = [
    ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Power Backup'],
    ['Parking', 'Lift', 'Security', 'Water Supply', 'Garden'],
    ['Parking', 'Gym', 'Club House', 'Play Area', 'Security'],
    ['Parking', 'Swimming Pool', 'Security', 'Power Backup', 'Lift'],
    ['Parking', 'Gym', 'Security', 'Visitor Parking', 'Intercom']
  ];

  const builderNames = [
    'Prestige Group', 'DLF Limited', 'Godrej Properties', 'Lodha Group',
    'Sobha Limited', 'Brigade Group', 'Mahindra Lifespaces', 'Purva Group'
  ];

  const listings = [];
  const count = 20;

  for (let i = 0; i < count; i++) {
    const selectedLocation = location 
      ? locations.find(loc => loc.toLowerCase().includes(location.toLowerCase())) || locations[i % locations.length]
      : locations[i % locations.length];
    
    const selectedType = propertyType || propertyTypes[i % propertyTypes.length];
    const bedroomCount = bedrooms ? parseInt(bedrooms) : (i % 4) + 1;
    const area = 800 + (i * 150) + Math.floor(Math.random() * 500);
    
    let basePrice = 5000000 + (i * 1000000) + Math.floor(Math.random() * 2000000);
    
    // Adjust price based on property type
    if (selectedType === 'Villa') basePrice *= 1.5;
    if (selectedType === 'Penthouse') basePrice *= 1.8;
    if (selectedType === 'Studio') basePrice *= 0.6;
    
    // Adjust price based on bedrooms
    basePrice += bedroomCount * 1500000;
    
    const price = Math.floor(basePrice);
    
    // Apply price filter
    if (price < minPrice || price > maxPrice) continue;

    const pricePerSqFt = Math.floor(price / area);
    const daysListed = Math.floor(Math.random() * 180) + 1;
    
    listings.push({
      id: `listing-${Date.now()}-${i}`,
      title: `${bedroomCount} BHK ${selectedType} for Sale`,
      propertyType: selectedType,
      location: selectedLocation,
      price,
      area,
      bedrooms: bedroomCount,
      bathrooms: bedroomCount >= 3 ? bedroomCount - 1 : bedroomCount,
      pricePerSqFt,
      amenities: amenitiesList[i % amenitiesList.length],
      builder: builderNames[i % builderNames.length],
      ageOfProperty: Math.floor(Math.random() * 10),
      furnished: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'][i % 3],
      parking: Math.floor(bedroomCount / 2) + 1,
      floor: Math.floor(Math.random() * 15) + 1,
      totalFloors: Math.floor(Math.random() * 10) + 10,
      facing: ['North', 'South', 'East', 'West', 'North-East', 'South-West'][i % 6],
      possession: i % 3 === 0 ? 'Ready to Move' : `${Math.floor(Math.random() * 24) + 1} months`,
      description: `Spacious ${bedroomCount} BHK ${selectedType.toLowerCase()} with modern amenities in prime location. ${selectedType === 'Villa' ? 'Independent villa with garden and parking.' : 'Well-ventilated apartment with great connectivity.'}`,
      images: generatePropertyImageSet(selectedType, selectedLocation),
      contactNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      verified: Math.random() > 0.3,
      featured: Math.random() > 0.7,
      daysListed,
      views: Math.floor(Math.random() * 1000) + 50,
      source: 'AI Property Insights Market',
      listedBy: Math.random() > 0.5 ? 'Owner' : 'Agent'
    });
  }

  // Sort listings
  switch (sortBy) {
    case 'price-low':
      listings.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      listings.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      listings.sort((a, b) => a.daysListed - b.daysListed);
      break;
    case 'area':
      listings.sort((a, b) => b.area - a.area);
      break;
    default: // relevant
      listings.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
  }

  return listings;
};

// GET /api/listings/search - Search property listings
router.get('/search', authenticateToken, async (req, res) => {
  try {
    console.log('🏠 Listings search request:', req.query);
    
    const filters = {
      location: req.query.location || '',
      minPrice: parseInt(req.query.minPrice) || 0,
      maxPrice: parseInt(req.query.maxPrice) || 100000000,
      propertyType: req.query.propertyType || '',
      bedrooms: req.query.bedrooms || '',
      sortBy: req.query.sortBy || 'relevant'
    };

    const listings = generateMockListings(filters);

    res.json({
      success: true,
      count: listings.length,
      listings,
      filters
    });

  } catch (error) {
    console.error('Listings search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property listings',
      error: error.message
    });
  }
});

// POST /api/listings/similar - Find similar properties to a saved property
router.post('/similar', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Similar properties request:', req.body);
    
    const { location, propertyType, price, area } = req.body;

    if (!location || !price) {
      return res.status(400).json({
        success: false,
        message: 'Location and price are required'
      });
    }

    // Find similar properties within ±30% price range
    const priceMargin = price * 0.3;
    const filters = {
      location: location.split(',')[0], // Use city name
      minPrice: price - priceMargin,
      maxPrice: price + priceMargin,
      propertyType: propertyType || '',
      sortBy: 'relevant'
    };

    const listings = generateMockListings(filters);
    
    // If no listings found with strict filters, get more generic results
    if (listings.length === 0) {
      console.log('⚠️ No listings found with strict filters, broadening search...');
      const broaderFilters = {
        location: location.split(',')[0],
        minPrice: 0,
        maxPrice: price * 2,
        propertyType: '',
        sortBy: 'relevant'
      };
      const broaderListings = generateMockListings(broaderFilters);
      listings.push(...broaderListings.slice(0, 10));
    }

    // Calculate comparison metrics
    const avgMarketPrice = listings.reduce((sum, l) => sum + l.price, 0) / listings.length;
    const avgPricePerSqFt = listings.reduce((sum, l) => sum + l.pricePerSqFt, 0) / listings.length;
    const userPricePerSqFt = area ? Math.floor(price / area) : 0;

    const comparison = {
      userProperty: {
        price,
        pricePerSqFt: userPricePerSqFt
      },
      market: {
        avgPrice: Math.floor(avgMarketPrice),
        avgPricePerSqFt: Math.floor(avgPricePerSqFt),
        totalListings: listings.length
      },
      analysis: {
        priceDifferencePercent: ((price - avgMarketPrice) / avgMarketPrice * 100).toFixed(2),
        isAboveMarket: price > avgMarketPrice,
        pricePerSqFtDiff: userPricePerSqFt - avgPricePerSqFt,
        recommendation: price < avgMarketPrice * 0.9 ? 'Great Deal' : 
                       price < avgMarketPrice ? 'Fair Price' :
                       price < avgMarketPrice * 1.1 ? 'Slightly High' : 'Overpriced'
      }
    };

    // Generate AI insights
    const aiPrompt = `As a real estate market analyst, analyze this property comparison:

User's Property:
- Location: ${location}
- Type: ${propertyType}
- Price: ₹${price.toLocaleString('en-IN')}
- Price per sq ft: ₹${userPricePerSqFt}

Market Data:
- Average market price: ₹${comparison.market.avgPrice.toLocaleString('en-IN')}
- Average price per sq ft: ₹${comparison.market.avgPricePerSqFt}
- Total similar listings: ${listings.length}
- Price difference: ${comparison.analysis.priceDifferencePercent}% ${comparison.analysis.isAboveMarket ? 'above' : 'below'} market
- Recommendation: ${comparison.analysis.recommendation}

Provide a brief 2-3 paragraph analysis covering:
1. How this property compares to the market
2. Whether it's a good investment
3. Market dynamics in this location

Keep it professional and data-driven.`;

    const aiInsights = await getChatResponse(aiPrompt);

    res.json({
      success: true,
      similarListings: listings.slice(0, 10), // Return top 10
      comparison,
      aiInsights,
      totalFound: listings.length
    });

  } catch (error) {
    console.error('Similar properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find similar properties',
      error: error.message
    });
  }
});

// GET /api/listings/:id - Get listing details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📋 Listing details request:', id);

    // In production, fetch from real API
    const allListings = generateMockListings({});
    const listing = allListings.find(l => l.id === id) || allListings[0];

    res.json({
      success: true,
      listing
    });

  } catch (error) {
    console.error('Listing details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing details',
      error: error.message
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Listings route is working' });
});

export default router;
