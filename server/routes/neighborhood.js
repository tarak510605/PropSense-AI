import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getChatResponse } from '../services/gemini.js';

const router = express.Router();

// Helper function to generate location-specific facility names
const generateFacilityNames = (location, type) => {
  const locationName = location.split(',')[0].trim();
  const hash = Math.abs(locationName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  
  const schoolNames = ['Public School', 'High School', 'International School', 'Primary School', 'Academy'];
  const mallNames = ['Central Mall', 'City Center', 'Shopping Complex', 'Plaza', 'Mart'];
  const hospitalNames = ['Medical Center', 'Hospital', 'Healthcare', 'Clinic', 'Multi-specialty Hospital'];
  const gymNames = ['Fitness Center', 'Gym', 'Health Club', 'Sports Complex', 'Wellness Center'];
  
  if (type === 'school') {
    const idx = hash % schoolNames.length;
    return `${locationName} ${schoolNames[idx]}`;
  } else if (type === 'mall') {
    const idx = hash % mallNames.length;
    return `${locationName} ${mallNames[idx]}`;
  } else if (type === 'hospital') {
    const idx = hash % hospitalNames.length;
    return `${locationName} ${hospitalNames[idx]}`;
  } else if (type === 'gym') {
    const idx = hash % gymNames.length;
    return `${locationName} ${gymNames[idx]}`;
  }
  
  return locationName;
};

// Mock data for demonstration - In production, this would connect to real APIs
const getNeighborhoodData = (location) => {
  // Simulate different ratings based on location keywords and generate unique hash
  const locationLower = location.toLowerCase();
  
  // Generate a consistent hash from location string for variation
  let hash = 0;
  for (let i = 0; i < location.length; i++) {
    hash = ((hash << 5) - hash) + location.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use hash to create variation (between -2 and +2 for each metric)
  const getVariation = (seed) => {
    const val = (Math.abs(hash * seed) % 5) - 2;
    return val;
  };
  
  // Base scores with location-based variation
  let schoolRating = 7 + getVariation(1);
  let crimeRating = 6 + getVariation(2);
  let safetyScore = 70 + (getVariation(3) * 5);
  let amenitiesScore = 65 + (getVariation(4) * 5);
  let transportScore = 70 + (getVariation(5) * 5);
  let environmentScore = 75 + (getVariation(6) * 5);

  // Adjust based on location keywords for premium areas
  if (locationLower.includes('downtown') || locationLower.includes('central') || locationLower.includes('cbd')) {
    amenitiesScore = Math.min(100, amenitiesScore + 20);
    transportScore = Math.min(100, transportScore + 25);
    crimeRating = Math.max(1, crimeRating - 2);
    safetyScore = Math.max(30, safetyScore - 15);
  }
  
  if (locationLower.includes('suburb') || locationLower.includes('residential') || locationLower.includes('colony')) {
    schoolRating = Math.min(10, schoolRating + 2);
    safetyScore = Math.min(100, safetyScore + 15);
    crimeRating = Math.min(10, crimeRating + 3);
    environmentScore = Math.min(100, environmentScore + 15);
  }

  if (locationLower.includes('green') || locationLower.includes('park') || locationLower.includes('garden')) {
    environmentScore = Math.min(100, environmentScore + 20);
    safetyScore = Math.min(100, safetyScore + 15);
  }

  if (locationLower.includes('sector') || locationLower.includes('phase') || locationLower.includes('block')) {
    schoolRating = Math.min(10, schoolRating + 1);
    amenitiesScore = Math.min(100, amenitiesScore + 15);
    transportScore = Math.min(100, transportScore + 15);
  }
  
  // City-specific adjustments
  if (locationLower.includes('mumbai') || locationLower.includes('bandra') || locationLower.includes('powai')) {
    amenitiesScore = Math.min(100, amenitiesScore + 15);
    transportScore = Math.min(100, transportScore + 20);
  }
  
  if (locationLower.includes('bangalore') || locationLower.includes('bengaluru') || locationLower.includes('koramangala')) {
    schoolRating = Math.min(10, schoolRating + 1);
    amenitiesScore = Math.min(100, amenitiesScore + 10);
  }
  
  if (locationLower.includes('delhi') || locationLower.includes('gurgaon') || locationLower.includes('noida')) {
    transportScore = Math.min(100, transportScore + 15);
    crimeRating = Math.max(1, crimeRating - 1);
  }

  // Ensure values are within valid ranges
  schoolRating = Math.max(1, Math.min(10, schoolRating));
  crimeRating = Math.max(1, Math.min(10, crimeRating));
  safetyScore = Math.max(30, Math.min(100, safetyScore));
  amenitiesScore = Math.max(40, Math.min(100, amenitiesScore));
  transportScore = Math.max(40, Math.min(100, transportScore));
  environmentScore = Math.max(40, Math.min(100, environmentScore));

  return {
    schoolRating: Math.round(schoolRating),
    crimeRating: Math.round(crimeRating),
    safetyScore: Math.round(safetyScore),
    amenitiesScore: Math.round(amenitiesScore),
    transportScore: Math.round(transportScore),
    environmentScore: Math.round(environmentScore)
  };
};

// @route   POST /api/neighborhood/analyze
// @desc    Get neighborhood ratings and analysis
// @access  Private
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { location, propertyType, price } = req.body;

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    // Get neighborhood data
    const data = getNeighborhoodData(location);

    // Calculate overall score
    const overallScore = Math.round(
      (data.schoolRating * 10 + 
       data.crimeRating * 10 + 
       data.safetyScore + 
       data.amenitiesScore + 
       data.transportScore + 
       data.environmentScore) / 6
    );

    const ratings = {
      location,
      overallScore,
      schools: {
        rating: data.schoolRating,
        outOf: 10,
        description: data.schoolRating >= 8 ? 'Excellent schools in the area' : 
                     data.schoolRating >= 6 ? 'Good educational facilities' : 
                     'Average school quality',
        nearbySchools: [
          { name: generateFacilityNames(location, 'school').replace('School', 'Primary School'), distance: '0.5 km', rating: data.schoolRating },
          { name: generateFacilityNames(location, 'school').replace('School', 'High School'), distance: '1.2 km', rating: Math.max(1, data.schoolRating - 1) },
          { name: generateFacilityNames(location, 'school').replace('School', 'International School'), distance: '2.0 km', rating: Math.min(10, data.schoolRating + 1) }
        ]
      },
      crime: {
        rating: data.crimeRating,
        outOf: 10,
        status: data.crimeRating >= 8 ? 'Low Crime Area' : 
                data.crimeRating >= 6 ? 'Moderate Crime' : 
                'Higher Crime Rate',
        description: data.crimeRating >= 8 ? 'Very safe neighborhood with low crime incidents' :
                     data.crimeRating >= 6 ? 'Generally safe with occasional incidents' :
                     'Exercise normal precautions'
      },
      safety: {
        score: data.safetyScore,
        outOf: 100,
        category: data.safetyScore >= 80 ? 'Very Safe' :
                  data.safetyScore >= 60 ? 'Safe' :
                  'Moderate',
        features: [
          data.safetyScore >= 70 ? 'Well-lit streets' : 'Limited street lighting',
          data.safetyScore >= 80 ? 'Security patrols' : 'Basic security',
          data.safetyScore >= 75 ? 'CCTV coverage' : 'Limited surveillance',
          data.safetyScore >= 85 ? 'Gated community' : 'Open area'
        ]
      },
      amenities: {
        score: data.amenitiesScore,
        outOf: 100,
        nearby: [
          { type: generateFacilityNames(location, 'mall'), distance: '1.5 km', available: data.amenitiesScore >= 70 },
          { type: generateFacilityNames(location, 'hospital'), distance: '2.0 km', available: data.amenitiesScore >= 60 },
          { type: 'Supermarket', distance: '0.8 km', available: data.amenitiesScore >= 50 },
          { type: generateFacilityNames(location, 'gym'), distance: '1.0 km', available: data.amenitiesScore >= 70 },
          { type: 'Restaurant Area', distance: '0.5 km', available: data.amenitiesScore >= 65 },
          { type: `${location.split(',')[0]} Park`, distance: '1.2 km', available: data.amenitiesScore >= 75 }
        ]
      },
      transport: {
        score: data.transportScore,
        outOf: 100,
        description: data.transportScore >= 80 ? 'Excellent connectivity' :
                     data.transportScore >= 60 ? 'Good transport options' :
                     'Limited connectivity',
        options: [
          { type: 'Metro Station', distance: '1.5 km', available: data.transportScore >= 80 },
          { type: 'Bus Stop', distance: '0.3 km', available: data.transportScore >= 60 },
          { type: 'Highway Access', distance: '2.0 km', available: data.transportScore >= 70 },
          { type: 'Railway Station', distance: '5.0 km', available: data.transportScore >= 75 }
        ]
      },
      environment: {
        score: data.environmentScore,
        outOf: 100,
        quality: data.environmentScore >= 80 ? 'Excellent' :
                 data.environmentScore >= 60 ? 'Good' :
                 'Moderate',
        factors: [
          { name: 'Air Quality', rating: data.environmentScore >= 80 ? 'Good' : 'Moderate' },
          { name: 'Noise Level', rating: data.environmentScore >= 75 ? 'Low' : 'Moderate' },
          { name: 'Green Spaces', rating: data.environmentScore >= 85 ? 'Abundant' : 'Available' },
          { name: 'Water Quality', rating: data.environmentScore >= 70 ? 'Good' : 'Fair' }
        ]
      }
    };

    // Get AI analysis
    try {
      const aiPrompt = `Analyze this neighborhood for a ${propertyType} property in ${location} priced at ₹${price?.toLocaleString('en-IN') || 'N/A'}:

Ratings:
- Overall Score: ${overallScore}/100
- Schools: ${data.schoolRating}/10
- Crime Safety: ${data.crimeRating}/10
- Safety Score: ${data.safetyScore}/100
- Amenities: ${data.amenitiesScore}/100
- Transport: ${data.transportScore}/100
- Environment: ${data.environmentScore}/100

Provide a detailed neighborhood analysis covering:
1. Living experience in this area
2. Best suited for (families, young professionals, retirees, etc.)
3. Investment potential considering the neighborhood
4. Key advantages of this location
5. Things to be aware of
6. Future growth prospects

Keep the response concise and practical (3-4 paragraphs).`;

      const aiAnalysis = await getChatResponse(aiPrompt);
      ratings.aiAnalysis = aiAnalysis;
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      ratings.aiAnalysis = 'AI analysis temporarily unavailable.';
    }

    res.json({
      success: true,
      ratings
    });

  } catch (error) {
    console.error('Neighborhood analysis error:', error);
    res.status(500).json({
      message: 'Error analyzing neighborhood',
      error: error.message
    });
  }
});

export default router;
