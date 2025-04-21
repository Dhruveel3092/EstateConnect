import { User, Broker, Client } from "../models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Utility: Generate Access and Refresh Tokens
const generateTokens = async (_id) => {
  const user = await User.findById(_id);
  if (!user) throw new Error("User not found while generating tokens.");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

// Utility: Send Reset Password Email
const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Click the link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
  };

  await transporter.sendMail(mailOptions);
};

export const register = async (req, res, next) => {
  try {
    
    const { name, email, password, role, companyName, licenseNumber } = req.body;
    const username = name ;
 
    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required." });

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ success: false, message: "Email already exists." });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let ModelToUse = Client;
    if (role === "broker" || (companyName && licenseNumber)) {
      if (!companyName || !licenseNumber) {
        return res.status(400).json({ success: false, message: "Company Name and License Number are required for broker registration." });
      }
      ModelToUse = Broker;
    }
    
    
    let userData = { username, email, password: hashedPassword };
    if (ModelToUse === Broker) {
      userData.companyName = companyName;
      userData.licenseNumber = licenseNumber;
    }

    
    const user = await ModelToUse.create(userData);

    const { accessToken, refreshToken } = await generateTokens(user._id);

    res.cookie("accessToken", accessToken, cookieOptions())
       .cookie("refreshToken", refreshToken, cookieOptions());

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: { _id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const { accessToken, refreshToken } = await generateTokens(user._id);

    res.cookie("accessToken", accessToken, cookieOptions())
       .cookie("refreshToken", refreshToken, cookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: { _id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { tokenId } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, name, email } = ticket.getPayload();

    if (!email_verified)
      return res.status(400).json({ success: false, message: "Google authentication failed." });

    let user = await User.findOne({ email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(process.env.GOOGLE_AUTH_PASSWORD, 10);
      // For Google registration, default to Client
      user = await Client.create({
        username: name,
        email,
        password: hashedPassword, // dummy password
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    res.cookie("accessToken", accessToken, cookieOptions())
       .cookie("refreshToken", refreshToken, cookieOptions());

    res.status(200).json({
      success: true,
      message: "Google login successful.",
      user: { _id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// Controller: Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    const resetToken = user.generatePasswordResetToken();
    user.passwordResetToken = resetToken;
    await user.save();

    await sendResetEmail(email, resetToken);

    res.status(200).json({ success: true, message: "Password reset email sent." });
  } catch (error) {
    next(error);
  }
};

// Controller: Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res.status(400).json({ success: false, message: "Token and new password are required." });

    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_TOKEN_SECRET);

    const user = await User.findById(decoded._id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    if (user.passwordResetToken !== token)
      return res.status(401).json({ success: false, message: "Invalid or expired token." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Reset link expired. Please request a new password reset.",
      });
    }
    next(error);
  }
};

// Cookie settings for tokens
const cookieOptions = () => ({
  expires: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 months
  httpOnly: true,
  sameSite: "none",
  secure: true,
});