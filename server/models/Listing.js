import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
  imageUrls: {
    type: [String],
    default: [],
  },
  brokerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Broker ID is required.'],
  },
  name: {
    type: String,
    required: [true, 'Property name is required.'],
  },
  description: {
    type: String,
    required: [true, 'Property description is required.'],
  },
  address: {
    type: String,
    required: [true, 'Property address is required.'],
  },
  location: {
    type: String,
    required: [true, 'Property location is required.'],
  },
  type: {
    type: String,
    enum: ['rent', 'sale'],
    default: 'rent',
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required.'],
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required.'],
  },
  startPrice: {
    type: Number,
    required: [true, 'Start price is required.'],
  },
  visitDate: {
    type: Date,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  biddingDate: {
    type: Date,
  },
  biddingStartTime: {
    type: String,
  },
  biddingEndTime: {
    type: String,
  },
  currentHighestBid: {
    type: Number,
    default: 0
  },
  parking: {
    type: Boolean,
    default: false,
  },
  furnished: {
    type: Boolean,
    default: false,
  },
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Listing', ListingSchema);