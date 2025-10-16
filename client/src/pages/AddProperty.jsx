import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertiesAPI } from '../services/api';
import { Building2, AlertCircle, CheckCircle, Loader, Upload, X, Image as ImageIcon } from 'lucide-react';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    location: '',
    area: '',
    price: '',
    propertyType: 'Apartment',
    amenities: [],
    description: '',
    images: [],
  });

  const propertyTypes = ['Apartment', 'Villa', 'House', 'Plot', 'Commercial', 'Office'];
  
  const commonAmenities = [
    'Parking',
    'Gym',
    'Swimming Pool',
    'Security',
    'Power Backup',
    'Elevator',
    'Garden',
    'Club House',
    'Play Area',
    'WiFi',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limit description to 500 characters
    if (name === 'description' && value.length > 500) {
      return;
    }
    
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imagePreviews.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Validate file size (5MB each)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError('Each image must be less than 5MB');
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImageFiles(prev => [...prev, ...files]);
    setError('');
  };

  const removeImage = (id) => {
    setImagePreviews(prev => {
      const removed = prev.find(p => p.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter(p => p.id !== id);
    });
    setImageFiles(prev => prev.filter((_, index) => imagePreviews[index]?.id !== id));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadFormData = new FormData();
    
    imageFiles.forEach(file => {
      uploadFormData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data.images;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Upload images first
      let uploadedImages = [];
      if (imageFiles.length > 0) {
        uploadedImages = await uploadImages();
      }

      // Add property with images
      const propertyResponse = await propertiesAPI.add({
        ...formData,
        area: Number(formData.area),
        price: Number(formData.price),
        images: uploadedImages,
      });

      const propertyId = propertyResponse.data.property._id;

      // Get AI insights
      await propertiesAPI.getInsight({
        ...formData,
        area: Number(formData.area),
        price: Number(formData.price),
        propertyId,
      });

      setSuccess('Property added successfully with AI insights!');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Add property error:', err);
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || err.message 
        || 'Failed to add property. Please try again.';
      setError(errorMessage);
      
      // If it's an image upload error, provide more context
      if (err.message && err.message.includes('upload')) {
        setError(`Image upload failed: ${errorMessage}. Please check your images and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Building2 className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          </div>
          <p className="text-gray-600">Enter property details to get AI-powered insights</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Mumbai, Bandra West"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                  Area (sq ft) *
                </label>
                <input
                  id="area"
                  name="area"
                  type="number"
                  required
                  min="0"
                  value={formData.area}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 1200"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 8500000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                id="propertyType"
                name="propertyType"
                required
                value={formData.propertyType}
                onChange={handleChange}
                className="input-field"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images (Optional)
                <span className="text-xs text-gray-500 ml-2">Max 5 images, 5MB each</span>
              </label>
              
              {/* Upload Button */}
              <div className="mt-2">
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 cursor-pointer transition-colors"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Choose Images
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={imagePreviews.length >= 5}
                />
                <span className="ml-3 text-sm text-gray-500">
                  {imagePreviews.length}/5 images selected
                </span>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview) => (
                    <div key={preview.id} className="relative group">
                      <img
                        src={preview.url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(preview.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add more button */}
                  {imagePreviews.length < 5 && (
                    <label
                      htmlFor="image-upload"
                      className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                    >
                      <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add More</span>
                    </label>
                  )}
                </div>
              )}

              {/* Empty State */}
              {imagePreviews.length === 0 && (
                <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">No images selected</p>
                  <p className="text-xs text-gray-500">Upload images to showcase your property</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonAmenities.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center space-x-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="input-field resize-none"
                placeholder="Describe your property... (e.g., Spacious 3BHK apartment with modern amenities, great location near metro station, schools and shopping centers. Well-maintained building with 24/7 security.)"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || uploadingImages ? (
                  <span className="flex items-center justify-center">
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    {uploadingImages ? 'Uploading Images...' : 'Adding Property & Generating Insights...'}
                  </span>
                ) : (
                  'Add Property & Get AI Insights'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={loading || uploadingImages}
                className="btn-secondary disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
