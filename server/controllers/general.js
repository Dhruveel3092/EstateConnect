import { User } from '../models/User.js';
import Listing from '../models/Listing.js';
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
      parking,
      furnished,
      userRef : req.user._id,
    });

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
        path: 'brokerIds',
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

export default getSingleListing;

export {
  getSignature,
  uploadProfileImage,
  createListing,
  getAllListings,
  getSingleListing
};