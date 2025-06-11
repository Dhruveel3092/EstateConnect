import {User}  from '../models/User.js';
import Listing from '../models/Listing.js';
import Bid from '../models/Bid.js';


const getBrokerProfile = async (req, res) => {
   // console.log(req.user);
  try {
   
    const userId = req.user._id; 

    const user = await User.findById(userId).select('-password -refreshToken -passwordResetToken -__v'); 
    //console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const updateBrokerProfile = async (req, res) => {
  try {
    // Assuming the broker is authenticated and their ID is available in req.user
    const brokerId = req.user._id;

    const {
      companyName,
      licenseNumber,
      location,
      commissionPercentage,
      contactNumber,
    } = req.body;

    // Find broker by ID and role
    const broker = await User.findOne({ _id: brokerId, role: 'Broker' });
    if (!broker) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    // Update the fields
    broker.companyName = companyName ?? broker.companyName;
    broker.licenseNumber = licenseNumber ?? broker.licenseNumber;
    broker.location = location ?? broker.location;
    broker.commissionPercentage = commissionPercentage ?? broker.commissionPercentage;
    broker.contactNumber = contactNumber ?? broker.contactNumber;

    // Save the updated broker
    const updatedBroker = await broker.save();

    res.status(200).json(updatedBroker);
  } catch (error) {
    console.error('Error updating broker profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getAllBrokerProfile = async (req, res) => {
  try {
    const brokers = await User.find({
      role: 'Broker',
      companyName: { $ne: null },
      licenseNumber: { $ne: null },
      location: { $exists: true, $ne: null, $ne: '' },
      contactNumber: { $exists: true, $ne: null, $ne: '' },
      rating: { $ne: null },
      commissionPercentage: { $ne: null },
    }).select('-password -refreshToken -passwordResetToken -__v');

    res.status(200).json({ brokers });
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBrokerListings = async (req, res) => {
  try {
    const brokerId = req.user._id;
   // console.log('Broker ID:', brokerId);
    const listings = await Listing.find({ brokerId: brokerId });

    res.status(200).json(listings);
  } catch (error) {
    console.error('Error fetching broker listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateBrokerRemarks = async (req, res) => {
  try {
    const listingId = req.params.id;
    const brokerId = req.user._id;
    const { remarks } = req.body;

    // Find the listing
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Authorization: Only assigned broker can update
    if (!listing.brokerId || listing.brokerId.toString() !== brokerId.toString()) {
      return res.status(403).json({ error: 'Unauthorized: This listing is not assigned to you' });
    }

    // Update remarks
    listing.remarks = remarks;
    await listing.save();

    res.status(200).json({ message: 'Remarks updated successfully', remarks });
  } catch (error) {
    console.error('Error in updateBrokerRemarks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getBrokerListingDetails = async (req, res) => {
  try {
    const listingId = req.params.id;

    // Fetch the listing with seller details
    const listing = await Listing.findById(listingId).populate('userRef', 'username email contactNumber');

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Authorization: Only the assigned broker can access
    if (!listing.brokerId || listing.brokerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized: This listing is not assigned to you' });
    }

    // Get highest bid and bidder
    const bids = await Bid.find({ listing: listingId })
      .sort({ amount: -1 })
      .populate('bidder', 'username email contactNumber');

    const highestBid = bids.length > 0 ? bids[0] : null;

    // Compute biddingStart and biddingEnd from date string and start time string
    const computeDateTime = (dateStr, timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date(dateStr); // this uses local time zone
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    let biddingStart = null;
    let biddingEnd = null;
    let biddingStatus = 'not started';

    if (listing.biddingDate && listing.biddingStartTime) {
      biddingStart = computeDateTime(listing.biddingDate, listing.biddingStartTime);
      biddingEnd = new Date(biddingStart.getTime() + 5 * 60 * 1000); // +5 minutes

      const now = new Date();

      if (now < biddingStart) {
        biddingStatus = 'not started';
      } else if (now >= biddingStart && now <= biddingEnd) {
        biddingStatus = 'ongoing';
      } else {
        biddingStatus = 'completed';
      }
    }

    res.status(200).json({
      listing,
      seller: listing.userRef,
      biddingStatus,
      highestBidder: highestBid?.bidder || null,
      highestBidAmount: highestBid?.amount || 0,
    });
  } catch (error) {
    console.error('Error in getBrokerListingDetails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};











export {
    getBrokerProfile,
    updateBrokerProfile,
    getAllBrokerProfile,
    getBrokerListings,
    getBrokerListingDetails,
    updateBrokerRemarks,
}