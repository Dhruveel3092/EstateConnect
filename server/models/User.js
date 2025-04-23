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
  location: {
    type: String,
    default: "Not specified",
  },
  rating: {
    type: Number,
    default: 0,
  },
  commissionPercentage: {
    type: Number,
    default: 5,
  },
  contactNumber: {
    type: String,
    default: "Not specified",
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