import User from "../models/User.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessAndRefreshTokens = async(_id) =>{
  try {
      const user = await User.findById(_id)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save()
      return {accessToken, refreshToken}


  } catch (error) {
      return error;
  }
}

const register = async (req, res, next) => {

    const { username, email, password } = req.body;
    const emailCheck = await User.findOne({ email });

    if(emailCheck)
        return res.status(409).json({success:false, message:"Email already exists."});
   
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      username, 
      email, 
      password:hashedPassword
    });

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    res.cookie("accessToken", accessToken,
      {
        expires: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      }
    )
      .cookie("refreshToken", refreshToken,
        {
          expires: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        }
      );

    return res.status(201).json({success:true, message:"User created successfully."});
  };

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    res.cookie("accessToken", accessToken, {
      expires: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.cookie("refreshToken", refreshToken, {
      expires: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.status(200).json({success: true, message: "Login successful." });
  } catch (error) {
    next(error);
  }
  };

  const googleLogin = async (req, res, next) => {
    try {
      const { tokenId } = req.body;
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const { email_verified, name, email } = ticket.getPayload();
      
      if (email_verified) {
        let user = await User.findOne({ email });
        if (!user) {
          const hashedPassword = await bcrypt.hash(process.env.GOOGLE_AUTH_PASSWORD, 10);
          user = await User.create({
            username: name,
            email,
            password: hashedPassword, // Dummy password
          });
        }
  
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  
        res.cookie("accessToken", accessToken,
          {
            expires: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: 'none',
            secure: true,
          }
        )
          .cookie("refreshToken", refreshToken,
            {
              expires: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
              httpOnly: true,
              sameSite: 'none',
              secure: true,
            }
          );
        return res.status(201).json({success:true, message:"Google login successful."});
      } else {
        return res.status(400).json({ success: false, message: "Google login failed." });
      }
    } catch (error) {
      next(error);
    }
  };

  const sendResetEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Ignore self-signed certificate errors (development only)
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
    };

    await transporter.sendMail(mailOptions);
};
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
   // console.log(user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const token = user.generatePasswordResetToken();
    //console.log(token);
    user.passwordResetToken = token;
    await user.save();
    await sendResetEmail(email, token);
    return res.status(200).json({ success: true, message: "Password reset email sent." });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.PASSWORD_RESET_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if(user.passwordResetToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid Link" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token has expired. Please request a new password reset link." });
    }
    next(error);
  }
};

  
export {
    register,
    login,
    googleLogin,
    forgotPassword,
    resetPassword,
};