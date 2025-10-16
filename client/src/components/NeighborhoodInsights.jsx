import { useState, useEffect } from 'react';
import { School, Shield, TrendingUp, ShoppingBag, Bus, Leaf, MapPin, Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

const NeighborhoodInsights = ({ location, propertyType, price }) => {
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchNeighborhoodData();
  }, [location]);

  const fetchNeighborhoodData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Fetching neighborhood data for:', location);
      
      const response = await fetch('http://localhost:5000/api/neighborhood/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location, propertyType, price })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setRatings(data.ratings);
      } else {
        setError(data.message || 'Failed to load neighborhood data');
      }
    } catch (err) {
      console.error('Neighborhood data error:', err);
      setError('Error loading neighborhood insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading neighborhood insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!ratings) return null;

  // Prepare data for radar chart
  const radarData = [
    { subject: 'Schools', score: ratings.schools.rating * 10 },
    { subject: 'Safety', score: ratings.safety.score },
    { subject: 'Crime', score: ratings.crime.rating * 10 },
    { subject: 'Amenities', score: ratings.amenities.score },
    { subject: 'Transport', score: ratings.transport.score },
    { subject: 'Environment', score: ratings.environment.score }
  ];

  const getScoreColor = (score, outOf = 100) => {
    const percentage = (score / outOf) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBgColor = (score, outOf = 100) => {
    const percentage = (score / outOf) * 100;
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Neighborhood Score</h3>
            <div className="flex items-baseline">
              <span className="text-5xl font-bold">{ratings.overallScore}</span>
              <span className="text-2xl ml-2">/100</span>
            </div>
            <p className="mt-2 text-blue-100">
              {ratings.overallScore >= 80 ? 'Excellent Location' :
               ratings.overallScore >= 60 ? 'Good Location' :
               'Developing Area'}
            </p>
          </div>
          <MapPin className="h-16 w-16 opacity-50" />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Schools */}
        <div className={`rounded-lg p-4 ${getScoreColor(ratings.schools.rating, 10)}`}>
          <School className="h-6 w-6 mb-2" />
          <div className="text-2xl font-bold">{ratings.schools.rating}/10</div>
          <div className="text-sm font-medium">Schools</div>
        </div>

        {/* Crime Rating */}
        <div className={`rounded-lg p-4 ${getScoreColor(ratings.crime.rating, 10)}`}>
          <Shield className="h-6 w-6 mb-2" />
          <div className="text-2xl font-bold">{ratings.crime.rating}/10</div>
          <div className="text-sm font-medium">Safety</div>
        </div>

        {/* Amenities */}
        <div className={`rounded-lg p-4 ${getScoreColor(ratings.amenities.score)}`}>
          <ShoppingBag className="h-6 w-6 mb-2" />
          <div className="text-2xl font-bold">{ratings.amenities.score}/100</div>
          <div className="text-sm font-medium">Amenities</div>
        </div>

        {/* Transport */}
        <div className={`rounded-lg p-4 ${getScoreColor(ratings.transport.score)}`}>
          <Bus className="h-6 w-6 mb-2" />
          <div className="text-2xl font-bold">{ratings.transport.score}/100</div>
          <div className="text-sm font-medium">Transport</div>
        </div>

        {/* Environment */}
        <div className={`rounded-lg p-4 ${getScoreColor(ratings.environment.score)}`}>
          <Leaf className="h-6 w-6 mb-2" />
          <div className="text-2xl font-bold">{ratings.environment.score}/100</div>
          <div className="text-sm font-medium">Environment</div>
        </div>

        {/* Safety Score */}
        <div className={`rounded-lg p-4 ${getScoreColor(ratings.safety.score)}`}>
          <Shield className="h-6 w-6 mb-2" />
          <div className="text-2xl font-bold">{ratings.safety.score}/100</div>
          <div className="text-sm font-medium">Safety Score</div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Comprehensive Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Scores" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Information Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        {showDetails ? 'Hide Detailed Information' : 'View Detailed Information'}
      </button>

      {/* Detailed Information Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Neighborhood Insights</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Schools Detail */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <School className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold">Schools & Education</h3>
                </div>
                <p className="text-gray-600 mb-4">{ratings.schools.description}</p>
                <div className="space-y-2">
                  {ratings.schools.nearbySchools.map((school, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{school.name}</div>
                        <div className="text-sm text-gray-500">{school.distance} away</div>
                      </div>
                      <div className="text-lg font-bold text-blue-600">{school.rating}/10</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crime & Safety */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold">Crime & Safety</h3>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-green-800 text-lg">{ratings.crime.status}</div>
                  <p className="text-green-700 mt-1">{ratings.crime.description}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Safety Features:</h4>
                  {ratings.safety.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="text-xl font-semibold">Nearby Amenities</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ratings.amenities.nearby.map((amenity, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${amenity.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">{amenity.type}</div>
                          <div className="text-sm text-gray-500">{amenity.distance}</div>
                        </div>
                        {amenity.available ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transport */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <Bus className="h-6 w-6 text-orange-600 mr-3" />
                  <h3 className="text-xl font-semibold">Transport & Connectivity</h3>
                </div>
                <p className="text-gray-600 mb-4">{ratings.transport.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ratings.transport.options.map((option, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${option.available ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-800">{option.type}</div>
                          <div className="text-sm text-gray-500">{option.distance}</div>
                        </div>
                        {option.available ? (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center mb-4">
                  <Leaf className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold">Environment Quality</h3>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="font-semibold text-green-800 text-lg">{ratings.environment.quality} Environment</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ratings.environment.factors.map((factor, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">{factor.name}</div>
                      <div className="text-lg font-semibold text-gray-800">{factor.rating}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              {ratings.aiAnalysis && !ratings.aiAnalysis.includes('unavailable') && (
                <div>
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-6 w-6 text-purple-600 mr-3" />
                    <h3 className="text-xl font-semibold">AI Neighborhood Analysis</h3>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{ratings.aiAnalysis}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Preview (if not showing details) */}
      {!showDetails && ratings.aiAnalysis && !ratings.aiAnalysis.includes('unavailable') && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-800">AI Insights</h3>
          </div>
          <p className="text-gray-700 line-clamp-3">{ratings.aiAnalysis}</p>
        </div>
      )}
    </div>
  );
};

export default NeighborhoodInsights;
