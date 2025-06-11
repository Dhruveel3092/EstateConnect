import { User } from '../models/User.js';
import Listing from '../models/Listing.js';
import Bid from '../models/Bid.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRETE,
  secure: true,
});

const getSignature = async (req, res, next) => {
  try {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({ timestamp }, process.env.CLOUDINARY_API_SECRETE);
    return res.json({ timestamp, signature });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    const { profilePicture } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.profilePicture = profilePicture;
    await user.save();

    const accessToken = user.generateAccessToken();
    res.cookie("accessToken", accessToken, {
      expires: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.status(200).json({ success: true, message: "Profile image uploaded successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

const createListing = async (req, res, next) => {
  try {
    const {
      imageUrls,
      brokerId,
      name,
      description,
      address,
      location,
      type,
      bedrooms,
      bathrooms,
      startPrice,
      visitingDate,
      startTime,
      endTime,
      biddingDate,
      biddingStartTime,
      parking,
      furnished,
    } = req.body;
    //console.log('Creating listing with data:', req.body);
    // Validate required fields
    if (!name || !description || !address || !startPrice) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    
    if (!imageUrls || imageUrls.length < 1) {
      return res.status(400).json({ success: false, message: 'At least one image is required.' });
    }
    //console.log(visitDate);
     const visitDate = visitingDate ? new Date(visitingDate) : null; // Convert to Date object if provided
    // Create new listing document
    const listing = new Listing({
      imageUrls,
      brokerId,
      name,
      description,
      address,
      location,
      type,
      bedrooms,
      bathrooms,
      startPrice,
      visitDate,
      startTime,
      endTime,
      biddingDate,
      biddingStartTime,
      parking,
      furnished,
      userRef : req.user._id,
    });

    const computeBiddingEndTime = (biddingDate, biddingStartTime) => {
  // Get the ISO date string (YYYY-MM-DD) from biddingDate
      const dateString = new Date(biddingDate).toISOString().split('T')[0];
      // Combine with the biddingStartTime to create a new Date object
      const startDateTime = new Date(`${dateString}T${biddingStartTime}`);
      // Add 5 minutes (5 * 60 * 1000 ms)
      return new Date(startDateTime.getTime() + 5 * 60 * 10000);
    };

    // For example, when initializing a listing or a bid:
    listing.biddingEndTime = computeBiddingEndTime(listing.biddingDate, listing.biddingStartTime);

    const savedListing = await listing.save();
   // console.log('Listing created:', savedListing);

    return res.status(201).json({
      success: true,
      _id: savedListing._id,
      message: 'Listing created successfully.',
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating listing.' });
  }
};


 const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 }); // Most recent first
    //console.log('Fetched listings:', listings.length);
    res.status(200).json({ success: true, listings });
  } catch (error) {
    console.error('Error fetching listings:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



const getSingleListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate({
        path: 'brokerId',
        select: 'username email contactNumber  role', // include relevant broker fields
      });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(200).json({ listing });
  } catch (err) {
    console.error('Error fetching listing:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createBid = async (req, res) => {
  try {
    const { listingId, amount } = req.body;
  const user = req.user;
  const io = req.app.get('io');

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    let now = new Date();
    let endTime = new Date(listing.biddingEndTime);
    console.log('Current time:', now);
    console.log('Bidding end time:', endTime);
    if (endTime && now > endTime) {
      return res.status(400).json({
        message: 'Bidding time has ended.',
        status: 'info'
      });
    }
    
    if(amount < listing.startPrice) {
      return res.status(400).json({ message: 'Your bid must be higher than or equal to the starting price.', status: 'info' });
    }

    if (listing.currentHighestBid && amount <= listing.currentHighestBid) {
      return res.status(400).json({ message: 'Your bid must be higher than the current highest bid.', status: 'info' });
    }


    const newBid = await Bid.create({
      listing: listingId,
      amount,
      bidder: user._id,
    });

    await newBid.populate('bidder', 'username'); // populate username for front-end

    now = new Date();
    const fiveMinutes = 5 * 60 * 10000;
    listing.biddingEndTime = new Date(now.getTime() + fiveMinutes);
    await listing.save();

    // Emit to all users in that listing room
    io.to(listingId).emit('newBid', {
      user: newBid.bidder.username,
      amount: newBid.amount,
      userId: newBid.bidder._id,
      biddingEndTime: listing.biddingEndTime,
    });

    return res.status(201).json({ message: 'Bid placed successfully', status: 'success', bid: newBid });
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ message: 'Server error' });
  }
  } catch (error) {
    console.error('Error in createBid:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBids = async (req, res) => {
  try {
    console.log('Fetching bids for listing ID:', req.params.id);
    const bids = await Bid.find({ listing: req.params.id })
      .populate('bidder', 'username').sort({ createdAt: -1 }); // Populate bidder details
    console.log('Fetched bids:', bids.length);
    console.log('Bids:', bids);
    res.status(200).json({ bids });
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getSignature,
  uploadProfileImage,
  createListing,
  getAllListings,
  getSingleListing,
  getBids,
  createBid
};