#!/bin/bash

# AI Property Insights Assistant - Setup Script
# This script helps you set up the project quickly

echo "🏡 AI Property Insights Assistant - Setup Script"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Navigate to server directory
echo "📦 Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi
echo "✅ Server dependencies installed"
echo ""

# Check if .env exists in server
if [ ! -f .env ]; then
    echo "📝 Creating server .env file..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env and add your:"
    echo "   - MONGODB_URI (MongoDB Atlas connection string)"
    echo "   - OPENAI_API_KEY (OpenAI API key)"
    echo "   - JWT_SECRET (random secret string)"
else
    echo "✅ Server .env file exists"
fi
echo ""

# Navigate to client directory
cd ../client
echo "📦 Installing client dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi
echo "✅ Client dependencies installed"
echo ""

# Check if .env exists in client
if [ ! -f .env ]; then
    echo "📝 Creating client .env file..."
    cp .env.example .env
    echo "✅ Client .env file created"
else
    echo "✅ Client .env file exists"
fi
echo ""

cd ..

echo "================================================"
echo "🎉 Setup Complete!"
echo "================================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure your environment variables:"
echo "   - Edit server/.env with MongoDB URI and OpenAI API key"
echo ""
echo "2. Start the backend server:"
echo "   cd server && npm run dev"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd client && npm run dev"
echo ""
echo "4. Open your browser to http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Complete documentation"
echo "   - QUICKSTART.md - Quick start guide"
echo "   - API_DOCUMENTATION.md - API reference"
echo "   - DEPLOYMENT.md - Deployment guide"
echo ""
echo "Need help? Check out the documentation files!"
echo ""
