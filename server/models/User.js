import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const options = { discriminatorKey: 'role', timestamps: true };

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      default: "$2b$10$M62ybY2nJLxqQM0noVK49O9/eJm/8xIdE5o3pxGHGT1niVsmhj8ay",
      minlength: 8,
    },
    profilePicture: {
      type: String,
      default: "https://res.cloudinary.com/drxcjij97/image/upload/v1707052827/zupx5ylgkrtq33lzzkma.png",
    },
    location: {
      type: String,
      default: '',
    },
    contactNumber: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
  },
  options
);


UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
      profilePicture: this.profilePicture,
      location: this.location,
      contactNumber: this.contactNumber,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

UserSchema.methods.generatePasswordResetToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.PASSWORD_RESET_TOKEN_SECRET,
    { expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRY }
  );
};


const User = mongoose.model('User', UserSchema);


const BrokerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  commissionPercentage: {
    type: Number,
    default: 5,
  },
});


const Broker = User.discriminator('Broker', BrokerSchema);

const ClientSchema = new mongoose.Schema({
    preferences: {
    type: [String],
    default: [],
  },
});


const Client = User.discriminator('Client', ClientSchema);

export { User, Broker, Client };