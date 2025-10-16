# 🏡 PropSense AI

**Smart Property Decisions, Powered by AI**

A full-stack web application that provides AI-powered real estate analysis, valuations, and investment insights using Google Gemini AI.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)

## 🎯 Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Property Management**: Add, view, and manage property listings
- **AI Valuation**: Get AI-powered property valuations using OpenAI GPT API
- **Investment Insights**: Receive detailed pros/cons and investment recommendations
- **Interactive Chat**: Chat with AI assistant for real estate advice
- **Analytics Dashboard**: Visualize property data with interactive charts
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI library
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **OpenAI API** - GPT-3.5-turbo for AI insights
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
cd ~/Desktop/AI_Project
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `server/.env` with your credentials:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/property_insights?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🎮 Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📱 Application Pages

### 1. **Login/Register**
- User authentication with JWT
- Secure password hashing with bcrypt
- Form validation

### 2. **Dashboard**
- Overview of all properties
- Statistics cards (total properties, total value, avg value)
- Interactive charts:
  - Property type distribution (Pie chart)
  - Value by property type (Bar chart)
  - Listed vs AI estimated prices (Line chart)
- AI chat assistant

### 3. **Add Property**
- Property details form:
  - Location
  - Area (sq ft)
  - Price (₹)
  - Property Type (Apartment, Villa, House, Plot, Commercial, Office)
  - Amenities (checkboxes)
- Automatic AI insight generation upon submission

### 4. **Property Card**
- View property details
- AI estimated value
- View full insights (analysis, recommendation, pros/cons)
- Delete property

### 5. **AI Chat Assistant**
- Real-time chat with AI advisor
- Context-aware responses
- Property-specific insights

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Properties
- `GET /api/properties` - Get all user properties
- `GET /api/properties/:id` - Get single property
- `POST /api/properties/add` - Add new property
- `POST /api/properties/insight` - Generate AI insights
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/chat` - Chat with AI assistant

## 🧠 AI Prompt Template

The application uses the following prompt structure for property valuation:

```
You are a real estate investment advisor with expertise in property valuation.
Analyze the following property data and provide:
1. Estimated fair market value (numeric estimate)
2. Detailed analysis (2-3 paragraphs)
3. Investment recommendation (Buy/Hold/Avoid with reasoning)
4. Key pros (list 3-5 points)
5. Key cons (list 3-5 points)

Property Details:
- Location: {location}
- Area: {area} sq ft
- Listed Price: ₹{price}
- Property Type: {propertyType}
- Amenities: {amenities}
```

## 📊 Sample Data

### Test User Credentials
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Sample Property Data
```json
{
  "location": "Mumbai, Bandra West",
  "area": 1200,
  "price": 15000000,
  "propertyType": "Apartment",
  "amenities": ["Parking", "Gym", "Swimming Pool", "Security"]
}
```

## 🌐 Deployment

### Backend Deployment (Render/Railway)

1. Create account on [Render](https://render.com) or [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `NODE_ENV=production`
4. Deploy from `server` directory

### Frontend Deployment (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `client`
4. Set environment variable:
   - `VITE_API_URL=https://your-backend-url.com/api`
5. Deploy

### MongoDB Setup (MongoDB Atlas)

1. Create account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database user
4. Whitelist IP addresses (or allow from anywhere for development)
5. Get connection string and update in `.env`

## 🔐 Environment Variables

### Server
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

### Client
```env
VITE_API_URL=http://localhost:5000/api
```

## 📸 Screenshots

### Dashboard
- Property statistics cards
- Interactive charts (Pie, Bar, Line)
- Property cards with AI insights
- AI chat assistant

### Add Property
- Comprehensive property form
- Amenities selection
- Real-time validation
- AI insight generation

### AI Insights
- Estimated property value
- Detailed analysis
- Investment recommendation
- Pros and cons list

## 🧪 Testing

### Backend API Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## 🎨 Color Palette

- Primary Blue: `#3b82f6`
- Success Green: `#10b981`
- Warning Orange: `#f59e0b`
- Error Red: `#ef4444`
- Gray Scale: Tailwind's default gray palette

## 📦 Project Structure

```
AI_Project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── PropertyCard.jsx
│   │   │   ├── ChatUI.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/       # React context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AddProperty.jsx
│   │   ├── services/      # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                # Node.js backend
    ├── config/
    │   └── db.js         # MongoDB connection
    ├── models/
    │   ├── User.js       # User schema
    │   └── Property.js   # Property schema
    ├── routes/
    │   ├── auth.js       # Auth routes
    │   └── properties.js # Property routes
    ├── middleware/
    │   └── auth.js       # JWT authentication
    ├── services/
    │   └── openai.js     # OpenAI integration
    ├── server.js         # Entry point
    └── package.json
```

## 🚧 Stretch Goals (Future Enhancements)

- [ ] Google Maps API integration for location insights
- [ ] Voice assistant mode (speech-to-text)
- [ ] LangChain integration for smarter context retrieval
- [ ] Pinecone vector database for property comparisons
- [ ] Multi-property comparison tool
- [ ] Email notifications for price changes
- [ ] Property image upload and analysis
- [ ] Market trend predictions
- [ ] Mortgage calculator
- [ ] ROI calculator

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Built with ❤️ by AI Property Insights Team

## 🆘 Troubleshooting

### Common Issues

**Issue**: MongoDB connection error
- **Solution**: Check your MongoDB URI and ensure IP is whitelisted

**Issue**: OpenAI API error
- **Solution**: Verify your API key and check usage limits

**Issue**: Port already in use
- **Solution**: Change PORT in `.env` or kill the process using the port

**Issue**: CORS errors
- **Solution**: Ensure backend URL is correctly set in frontend `.env`

## 📞 Support

For support, email support@aipropertyinsights.com or open an issue on GitHub.

---

**Made with React, Node.js, MongoDB, and OpenAI GPT** 🚀
