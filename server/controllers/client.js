import {User}  from '../models/User.js'; 
import Bid from '../models/Bid.js';
import Listing from '../models/Listing.js';



const getClientProfile = async (req, res) => {
   // console.log(req.user);
  try {
   
    const userId = req.user._id; 

    const user = await User.findById(userId).select('-password'); 
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

const updateClientProfile = async (req, res) => {
  try {
    // Assuming the broker is authenticated and their ID is available in req.user
    const clientId = req.user._id;

    const {
      location,
      contactNumber,
    } = req.body;

    // Find broker by ID and role
    const client = await User.findOne({ _id: clientId, role: 'Client' });
    if (!client) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    client.location = location ?? client.location;
    client.contactNumber = contactNumber ?? client.contactNumber;

    // Save the updated broker
    const updatedClient = await client.save();

    res.status(200).json(updatedClient);
  } catch (error) {
    console.error('Error updating broker profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




const computeBiddingEndTime = (biddingDate, biddingStartTime) => {
  const dateString = new Date(biddingDate).toISOString().split('T')[0];
  const startDateTime = new Date(`${dateString}T${biddingStartTime}`);
  return new Date(startDateTime.getTime() + 5 * 60 * 1000); // 5 minutes later
};

const getMyDeals = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Get the highest bid per listing
    const topBids = await Bid.aggregate([
      { $sort: { amount: -1, createdAt: 1 } },
      {
        $group: {
          _id: '$listing',
          topBid: { $first: '$$ROOT' }
        }
      }
    ]);

    const now = new Date();

    // Step 2: Bought listings (user is the top bidder)
    const userWonListings = topBids.filter(b => b.topBid.bidder.toString() === userId.toString());
    const boughtListingIds = userWonListings.map(b => b._id);

    const boughtListings = await Listing.find({ _id: { $in: boughtListingIds } })
      .populate('userRef', 'username email')
      .lean();

    const boughtWithSeller = boughtListings
      .filter(listing => {
        if (!listing.biddingDate || !listing.biddingStartTime) return false;
        const endTime = computeBiddingEndTime(listing.biddingDate, listing.biddingStartTime);
        return now > endTime;
      })
      .map(listing => {
        const bidInfo = userWonListings.find(b => b._id.toString() === listing._id.toString());
        return {
          ...listing,
          seller: listing.userRef,
          winningBidAmount: bidInfo?.topBid.amount
        };
      });

    // Step 3: Sold listings (user is the seller, someone else is the top bidder)
    const soldListingIds = topBids
      .filter(b => b.topBid.bidder.toString() !== userId.toString())
      .map(b => b._id);

    const soldListings = await Listing.find({
      _id: { $in: soldListingIds },
      userRef: userId
    }).lean();

    const soldWithBuyer = await Promise.all(
      soldListings
        .filter(listing => {
          if (!listing.biddingDate || !listing.biddingStartTime) return false;
          const endTime = computeBiddingEndTime(listing.biddingDate, listing.biddingStartTime);
          return now > endTime;
        })
        .map(async (listing) => {
          const topBid = topBids.find(b => b._id.toString() === listing._id.toString());
          const buyer = await User.findById(topBid?.topBid?.bidder).select('username email');
          return {
            ...listing,
            buyer,
            winningBidAmount: topBid?.topBid?.amount
          };
        })
    );

    res.status(200).json({
      success: true,
      bought: boughtWithSeller,
      sold: soldWithBuyer,
      hasBought: boughtWithSeller.length > 0
    });
  } catch (err) {
    console.error('Error in getMyDeals:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching deals.'
    });
  }
};


export {
    getClientProfile,
    updateClientProfile,
    getMyDeals
}