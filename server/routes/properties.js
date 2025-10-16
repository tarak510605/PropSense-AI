import express from 'express';
import { body, validationResult } from 'express-validator';
import Property from '../models/Property.js';
import { authenticateToken } from '../middleware/auth.js';
import { getAIInsights } from '../services/openai.js';

const router = express.Router();

// @route   POST /api/properties/add
// @desc    Add new property
// @access  Private
router.post('/add', authenticateToken, [
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('propertyType').notEmpty().withMessage('Property type is required'),
  body('amenities').isArray().withMessage('Amenities must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, area, price, propertyType, amenities, description, images } = req.body;

    const property = new Property({
      userId: req.user.id,
      location,
      area,
      price,
      propertyType,
      amenities,
      description,
      images: images || []
    });

    await property.save();

    res.status(201).json({
      message: 'Property added successfully',
      property
    });
  } catch (error) {
    console.error('Add property error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/properties/insight
// @desc    Get AI insights for property
// @access  Private
router.post('/insight', authenticateToken, [
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('propertyType').notEmpty().withMessage('Property type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, area, price, propertyType, amenities, propertyId } = req.body;

    // Get AI insights from OpenAI
    const insights = await getAIInsights({
      location,
      area,
      price,
      propertyType,
      amenities: amenities || []
    });

    // If propertyId is provided, update the property
    if (propertyId) {
      const property = await Property.findOne({ 
        _id: propertyId, 
        userId: req.user.id 
      });

      if (property) {
        property.aiInsights = insights;
        await property.save();
      }
    }

    res.json({
      message: 'AI insights generated successfully',
      insights
    });
  } catch (error) {
    console.error('Insight error:', error);
    res.status(500).json({ 
      message: 'Failed to generate insights', 
      error: error.message 
    });
  }
});

// @route   GET /api/properties
// @desc    Get all properties for logged-in user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ property });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/properties/chat
// @desc    Chat with AI assistant about properties
// @access  Private
router.post('/chat', authenticateToken, [
  body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, propertyContext } = req.body;

    // Import chat function
    const { getChatResponse } = await import('../services/openai.js');
    const response = await getChatResponse(message, propertyContext);

    res.json({
      message: 'Response generated successfully',
      response
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      message: 'Failed to generate response', 
      error: error.message 
    });
  }
});

export default router;
