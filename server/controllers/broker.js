import {User}  from '../models/User.js';
import Listing from '../models/Listing.js';
import Bid from '../models/Bid.js';


const verifyListing = async (req, res) => {
  try {
   
    const listingId = req.params.id;
    
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Only the broker assigned to this listing can verify it
   // console.log(listing);
    if (listing.brokerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to verify this listing' });
    }

    if (listing.isVerified) {
      return res.status(400).json({ message: 'Listing is already verified' });
    }

    listing.isVerified = true;
    await listing.save();

    res.status(200).json({ message: 'Listing verified successfully', listing });
  } catch (error) {
    console.error('Error verifying listing:', error);
    res.status(500).json({ message: 'Server error while verifying listing' });
  }
};

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

    const listing = await Listing.findById(listingId)
      .populate('userRef', 'username email contactNumber');

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (!listing.brokerId || listing.brokerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized: This listing is not assigned to you' });
    }

    const allBids = await Bid.find({ listing: listingId })
      .sort({ amount: -1 })
      .populate('bidder', 'username email contactNumber');

    // De-duplicate: Keep only highest bid per bidder
    const bidderMap = new Map();
    for (const bid of allBids) {
      const bidderId = bid.bidder?._id?.toString();
      if (bidderId && !bidderMap.has(bidderId)) {
        bidderMap.set(bidderId, bid);
      }
    }

    const uniqueBids = Array.from(bidderMap.values());
    const uniqueBidders = uniqueBids.map(bid => ({
      _id: bid.bidder._id,
      username: bid.bidder.username,
      email: bid.bidder.email,
      contactNumber: bid.bidder.contactNumber,
      amount: bid.amount,
    }));

    const highestBid = uniqueBids.length > 0 ? uniqueBids[0] : null;

    // -------------------------
    // Parse bidding start & end
    // -------------------------

    let biddingStart = null;
    let biddingEnd = null;

    // Format 1: Separate date and "HH:mm" time string
    if (
      listing.biddingDate instanceof Date &&
      typeof listing.biddingStartTime === 'string' &&
      listing.biddingStartTime.includes(':')
    ) {
      const [h, m] = listing.biddingStartTime.split(':').map(Number);
      biddingStart = new Date(listing.biddingDate);
      biddingStart.setHours(h, m, 0, 0);
    }
    
    else if (typeof listing.biddingStartTime === 'string') {
      const d = new Date(listing.biddingStartTime);
      if (!isNaN(d)) biddingStart = d;
    }

    // Handle biddingEndTime
    if (typeof listing.biddingEndTime === 'string') {
      const d = new Date(listing.biddingEndTime);
      if (!isNaN(d)) biddingEnd = d;
    }

   
    if (biddingStart && !biddingEnd) {
      biddingEnd = new Date(biddingStart.getTime() + 5 * 60 * 1000);
    }


    const now = new Date();
    let biddingStatus = 'not started';
    if (biddingStart && biddingEnd) {
      if (now < biddingStart) biddingStatus = 'not started';
      else if (now >= biddingStart && now <= biddingEnd) biddingStatus = 'ongoing';
      else biddingStatus = 'completed';
    }

    res.status(200).json({
      listing,
      seller: listing.userRef,
      biddingStatus,
      highestBidder: highestBid?.bidder || null,
      highestBidAmount: highestBid?.amount || 0,
      allBidders: uniqueBidders,
    });

  } catch (error) {
    console.error('Error in getBrokerListingDetails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};














export {
    getBrokerProfile,
    verifyListing,
    updateBrokerProfile,
    getAllBrokerProfile,
    getBrokerListings,
    getBrokerListingDetails,
    updateBrokerRemarks,
}