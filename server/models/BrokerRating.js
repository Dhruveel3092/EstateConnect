// models/BrokerRating.js

import mongoose from 'mongoose';

const brokerRatingSchema = new mongoose.Schema(
  {
    broker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // broker being rated
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // buyer or seller giving the rating
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);


brokerRatingSchema.index({ broker: 1, user: 1, property: 1 }, { unique: true });

const BrokerRating = mongoose.model('BrokerRating', brokerRatingSchema);

export default BrokerRating;
