import BrokerRating from '../models/BrokerRating.js';

export const getRating = async (req, res) => {
// console.log('hi');
  const { propertyId } = req.params;
  const { brokerId, userId } = req.query;

  if (!brokerId || !userId) {
    return res.status(400).json({ success: false, message: 'brokerId and userId are required in query' });
  }

  try {
    const ratingDoc = await BrokerRating.findOne({
      broker: brokerId,
      user: userId,
      property: propertyId,
    });
    //console.log(ratingDoc);
    if (!ratingDoc) {
      return res.status(200).json({ success: true, rating: 0 }); // No rating yet
    }
    //console.log(ratingDoc.rating);
    return res.status(200).json({ success: true, rating: ratingDoc.rating });
  } catch (err) {
    console.error('Error fetching rating:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch rating' });
  }
};

export const rateBroker = async (req, res) => {
  try {
    const { brokerId, userId, rating } = req.body;
    const { propertyId } = req.params;

    if (!brokerId || !userId || !rating || !propertyId) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Try to find existing rating
    const existingRating = await BrokerRating.findOne({
      broker: brokerId,
      user: userId,
      property: propertyId,
    });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      return res.status(200).json({ success: true, message: 'Rating updated successfully.' });
    }

    // Else create new rating
    const newRating = new BrokerRating({
      broker: brokerId,
      user: userId,
      property: propertyId,
      rating,
    });

    await newRating.save();
    res.status(201).json({ success: true, message: 'Rating created successfully.' });
  } catch (error) {
    console.error('Error rating broker:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};


