import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import mortgageRoutes from './routes/mortgage.js';
import compareRoutes from './routes/compare.js';
import neighborhoodRoutes from './routes/neighborhood.js';
import priceHistoryRoutes from './routes/priceHistory.js';
import listingsRoutes from './routes/listings.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/mortgage', mortgageRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/neighborhood', neighborhoodRoutes);
app.use('/api/price-history', priceHistoryRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI Property Insights API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
