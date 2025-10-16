import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getChatResponse } from '../services/gemini.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Price history route is working' });
});

// Generate historical price data (mock data for demonstration)
const generateHistoricalData = (currentPrice, location, propertyType, area) => {
  const years = 10;
  const currentYear = new Date().getFullYear();
  const data = [];
  
  // Calculate base appreciation rate based on location and property type
  let baseAppreciation = 0.08; // 8% default
  
  const locationLower = location.toLowerCase();
  if (locationLower.includes('downtown') || locationLower.includes('metro')) {
    baseAppreciation = 0.12; // 12% for prime locations
  } else if (locationLower.includes('suburb')) {
    baseAppreciation = 0.07; // 7% for suburban
  } else if (locationLower.includes('rural')) {
    baseAppreciation = 0.05; // 5% for rural
  }
  
  if (propertyType.toLowerCase().includes('villa') || propertyType.toLowerCase().includes('luxury')) {
    baseAppreciation += 0.02; // Premium properties appreciate faster
  }
  
  // Generate historical data with realistic variations
  let price = currentPrice;
  for (let i = 0; i <= years; i++) {
    const year = currentYear - (years - i);
    
    // Add some randomness to make it realistic
    const variation = (Math.random() - 0.5) * 0.04; // ±2% random variation
    const yearlyRate = baseAppreciation + variation;
    
    if (i === years) {
      // Last year is current price
      price = currentPrice;
    } else {
      // Work backwards from current price
      price = currentPrice / Math.pow(1 + baseAppreciation, years - i);
      // Add variation
      price = price * (1 + variation);
    }
    
    data.push({
      year,
      price: Math.round(price),
      appreciation: i === 0 ? 0 : yearlyRate * 100
    });
  }
  
  return data;
};

// Calculate future predictions
const generatePredictions = (historicalData, years = 5) => {
  const predictions = [];
  const recentData = historicalData.slice(-5); // Last 5 years
  
  // Calculate average appreciation rate
  let totalAppreciation = 0;
  for (let i = 1; i < recentData.length; i++) {
    const rate = (recentData[i].price - recentData[i-1].price) / recentData[i-1].price;
    totalAppreciation += rate;
  }
  const avgAppreciation = totalAppreciation / (recentData.length - 1);
  
  // Generate predictions
  const lastYear = recentData[recentData.length - 1].year;
  let lastPrice = recentData[recentData.length - 1].price;
  
  for (let i = 1; i <= years; i++) {
    const year = lastYear + i;
    // Apply average appreciation with slight decay for uncertainty
    const decayFactor = 1 - (i * 0.02); // 2% decay per year
    const adjustedRate = avgAppreciation * decayFactor;
    lastPrice = lastPrice * (1 + adjustedRate);
    
    predictions.push({
      year,
      predictedPrice: Math.round(lastPrice),
      confidence: Math.max(50, 95 - (i * 8)) // Confidence decreases over time
    });
  }
  
  return predictions;
};

// Calculate market indicators
const calculateIndicators = (historicalData) => {
  const recentYears = historicalData.slice(-5);
  const lastYear = historicalData[historicalData.length - 1];
  const firstYear = historicalData[0];
  
  // Overall appreciation
  const totalAppreciation = ((lastYear.price - firstYear.price) / firstYear.price) * 100;
  const yearsSpan = lastYear.year - firstYear.year;
  const avgAnnualAppreciation = totalAppreciation / yearsSpan;
  
  // Year over year growth (last year)
  const yoyGrowth = recentYears.length >= 2 
    ? ((recentYears[recentYears.length - 1].price - recentYears[recentYears.length - 2].price) 
       / recentYears[recentYears.length - 2].price) * 100
    : 0;
  
  // Volatility (standard deviation of annual returns)
  const returns = [];
  for (let i = 1; i < historicalData.length; i++) {
    const returnRate = (historicalData[i].price - historicalData[i-1].price) / historicalData[i-1].price;
    returns.push(returnRate);
  }
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * 100;
  
  // Market phase
  let marketPhase = 'Stable';
  if (yoyGrowth > 10) marketPhase = 'Booming';
  else if (yoyGrowth > 5) marketPhase = 'Growing';
  else if (yoyGrowth < -5) marketPhase = 'Declining';
  else if (yoyGrowth < 0) marketPhase = 'Cooling';
  
  return {
    totalAppreciation: totalAppreciation.toFixed(2),
    avgAnnualAppreciation: avgAnnualAppreciation.toFixed(2),
    yoyGrowth: yoyGrowth.toFixed(2),
    volatility: volatility.toFixed(2),
    marketPhase,
    investmentGrade: volatility < 5 && avgAnnualAppreciation > 7 ? 'A' : 
                     volatility < 8 && avgAnnualAppreciation > 5 ? 'B' : 'C'
  };
};

// POST /api/price-history/analyze
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Price history request received:', req.body);
    const { location, propertyType, price, area } = req.body;
    
    if (!location || !price) {
      return res.status(400).json({
        success: false,
        message: 'Location and price are required'
      });
    }
    
    // Generate historical data
    const historicalData = generateHistoricalData(price, location, propertyType || 'Apartment', area || 1000);
    
    // Generate future predictions
    const predictions = generatePredictions(historicalData, 5);
    
    // Calculate market indicators
    const indicators = calculateIndicators(historicalData);
    
    // Generate AI analysis
    const aiPrompt = `As a real estate market analyst, analyze this property's price trends:

Property Details:
- Location: ${location}
- Type: ${propertyType}
- Current Price: ₹${price.toLocaleString('en-IN')}
- Area: ${area} sq ft

Market Data:
- Total Appreciation (10 years): ${indicators.totalAppreciation}%
- Average Annual Growth: ${indicators.avgAnnualAppreciation}%
- Year-over-Year Growth: ${indicators.yoyGrowth}%
- Market Phase: ${indicators.marketPhase}
- Volatility: ${indicators.volatility}%
- Investment Grade: ${indicators.investmentGrade}

Predicted prices:
- 1 Year: ₹${predictions[0].predictedPrice.toLocaleString('en-IN')}
- 3 Years: ₹${predictions[2].predictedPrice.toLocaleString('en-IN')}
- 5 Years: ₹${predictions[4].predictedPrice.toLocaleString('en-IN')}

Provide a comprehensive analysis (3-4 paragraphs) covering:
1. Historical performance analysis
2. Market trends and factors affecting prices
3. Future outlook and investment recommendation
4. Risks and opportunities

Keep the analysis professional and data-driven.`;

    const aiAnalysis = await getChatResponse(aiPrompt);
    
    res.json({
      success: true,
      data: {
        historicalData,
        predictions,
        indicators,
        aiAnalysis,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Price history analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze price history',
      error: error.message
    });
  }
});

export default router;
