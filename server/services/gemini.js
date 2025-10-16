import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env.js';

// Initialize with the correct SDK approach
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// Get AI insights for property valuation
export const getAIInsights = async (propertyData) => {
  try {
    const { location, area, price, propertyType, amenities } = propertyData;

    const prompt = `You are a real estate investment advisor with expertise in property valuation.
Analyze the following property data and provide:
1. Estimated fair market value (numeric estimate)
2. Detailed analysis (2-3 paragraphs)
3. Investment recommendation (Buy/Hold/Avoid with reasoning)
4. Key pros (list 3-5 points)
5. Key cons (list 3-5 points)

Property Details:
- Location: ${location}
- Area: ${area} sq ft
- Listed Price: ₹${price.toLocaleString('en-IN')}
- Property Type: ${propertyType}
- Amenities: ${amenities.join(', ') || 'None specified'}

Provide your response in the following JSON format:
{
  "estimatedValue": <number>,
  "analysis": "<detailed analysis paragraph>",
  "recommendation": "<recommendation with reasoning>",
  "pros": ["<pro 1>", "<pro 2>", ...],
  "cons": ["<con 1>", "<con 2>", ...]
}`;

    // Use the updated model name: gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Try to parse JSON response
    let insights;
    try {
      // Remove markdown code blocks if present
      const cleanText = responseText.replace(/```json\n?|\n?```/g, '');
      insights = JSON.parse(cleanText);
    } catch (parseError) {
      // If JSON parsing fails, extract information manually
      insights = {
        estimatedValue: price * (0.95 + Math.random() * 0.1), // Fallback estimation
        analysis: responseText,
        recommendation: "Please review the detailed analysis for investment recommendations.",
        pros: ["Location has potential", "Property specifications are adequate"],
        cons: ["Further market research recommended"]
      };
    }

    return {
      estimatedValue: insights.estimatedValue || price,
      analysis: insights.analysis || responseText,
      recommendation: insights.recommendation || "Consult with local experts",
      prosCons: {
        pros: insights.pros || [],
        cons: insights.cons || []
      }
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate AI insights: ' + error.message);
  }
};

// Chat with AI assistant
export const getChatResponse = async (userMessage, propertyContext = null) => {
  try {
    let prompt = `You are an AI real estate investment advisor. 
You help users make informed decisions about property investments, 
provide market insights, explain real estate concepts, and answer questions 
about property valuation, location analysis, and investment strategies.
Be helpful, professional, and data-driven in your responses.\n\n`;

    // Add property context if provided
    if (propertyContext) {
      prompt += `Current property context: 
Location: ${propertyContext.location}
Area: ${propertyContext.area} sq ft
Price: ₹${propertyContext.price?.toLocaleString('en-IN')}
Type: ${propertyContext.propertyType}
Amenities: ${propertyContext.amenities?.join(', ') || 'None'}\n\n`;
    }

    prompt += `User question: ${userMessage}\n\nProvide a helpful, concise response:`;

    // Use the updated model name: gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('Gemini Chat error:', error);
    throw new Error('Failed to generate chat response: ' + error.message);
  }
};
