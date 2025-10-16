import express from 'express';
import Property from '../models/Property.js';
import { authenticateToken } from '../middleware/auth.js';
import { getChatResponse } from '../services/gemini.js';

const router = express.Router();

// @route   POST /api/compare
// @desc    Compare multiple properties and get AI insights
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { propertyIds } = req.body;

    // Validation
    if (!propertyIds || !Array.isArray(propertyIds)) {
      return res.status(400).json({ message: 'Property IDs array is required' });
    }

    if (propertyIds.length < 2) {
      return res.status(400).json({ message: 'At least 2 properties are required for comparison' });
    }

    if (propertyIds.length > 4) {
      return res.status(400).json({ message: 'Maximum 4 properties can be compared at once' });
    }

    // Fetch properties for the authenticated user
    const properties = await Property.find({
      _id: { $in: propertyIds },
      userId: req.user.id
    });

    if (properties.length !== propertyIds.length) {
      return res.status(404).json({ message: 'Some properties not found or you do not have access' });
    }

    // Calculate comparison metrics
    const comparison = {
      properties: properties.map(prop => ({
        id: prop._id,
        propertyType: prop.propertyType,
        location: prop.location,
        price: prop.price,
        area: prop.area,
        pricePerSqFt: Math.round(prop.price / prop.area),
        amenities: prop.amenities || [],
        aiInsights: prop.aiInsights,
        createdAt: prop.createdAt
      })),
      analytics: {
        avgPrice: Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length),
        avgArea: Math.round(properties.reduce((sum, p) => sum + p.area, 0) / properties.length),
        avgPricePerSqFt: Math.round(
          properties.reduce((sum, p) => sum + (p.price / p.area), 0) / properties.length
        ),
        minPrice: Math.min(...properties.map(p => p.price)),
        maxPrice: Math.max(...properties.map(p => p.price)),
        minArea: Math.min(...properties.map(p => p.area)),
        maxArea: Math.max(...properties.map(p => p.area))
      }
    };

    // Get AI comparison insights
    try {
      const comparisonPrompt = `Compare these ${properties.length} properties and provide investment insights:

${properties.map((prop, idx) => `
Property ${idx + 1}:
- Type: ${prop.propertyType}
- Location: ${prop.location}
- Price: ₹${prop.price.toLocaleString('en-IN')}
- Area: ${prop.area} sq ft
- Price per sq ft: ₹${Math.round(prop.price / prop.area).toLocaleString('en-IN')}
- Amenities: ${prop.amenities?.join(', ') || 'None listed'}
${prop.aiInsights ? `- AI Estimated Value: ₹${prop.aiInsights.estimatedValue?.toLocaleString('en-IN')}` : ''}
`).join('\n')}

Provide a detailed comparison covering:
1. Best value for money (considering price per sq ft and amenities)
2. Best investment potential
3. Location advantages/disadvantages
4. Key differentiators between properties
5. Recommendation for different buyer profiles (first-time buyer, investor, family)

Format the response in clear sections with bullet points.`;

      const aiComparison = await getChatResponse(comparisonPrompt);
      comparison.aiComparison = aiComparison;
    } catch (aiError) {
      console.error('AI comparison error:', aiError);
      comparison.aiComparison = 'AI comparison temporarily unavailable. Please try again later.';
    }

    res.json({
      success: true,
      comparison
    });

  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ 
      message: 'Error comparing properties',
      error: error.message 
    });
  }
});

export default router;
