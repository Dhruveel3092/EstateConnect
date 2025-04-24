import { User } from '../models/User.js';
import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRETE,
  secure : true,
});

const getSignature = async (req, res, next) => {
  try {
    // console.log(req.user);
    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
      timestamp,
    },process.env.CLOUDINARY_API_SECRETE);
    // console.log("Timestamp:", timestamp);
    return res.json({timestamp,signature});
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try{
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
  }catch(error){
    return res.status(500).json({ message: "Server error", error });
  }
}

export {
    getSignature,
    uploadProfileImage,
}