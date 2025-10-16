import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  area: {
    type: Number,
    required: [true, 'Area is required'],
    min: 0
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['Apartment', 'Villa', 'House', 'Plot', 'Commercial', 'Office']
  },
  amenities: {
    type: [String],
    default: []
  },
  images: {
    type: [{
      url: String,
      publicId: String
    }],
    default: []
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  aiInsights: {
    estimatedValue: Number,
    analysis: String,
    recommendation: String,
    prosCons: {
      pros: [String],
      cons: [String]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Property', propertySchema);
