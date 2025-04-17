import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
dotenv.config();

const UserSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            min:2,
            max:100
        },
        email:{
            type:String,
            required:true,
            max:50,
            unique:true
        },
        password:{
            type:String,
            default: "$2b$10$M62ybY2nJLxqQM0noVK49O9/eJm/8xIdE5o3pxGHGT1niVsmhj8ay",
            min:5,
        },
        refreshToken:{
            type:String,
        },
        passwordResetToken:{
            type:String,
        },
    },
    {timestamps:true}
)

UserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.generatePasswordResetToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.PASSWORD_RESET_TOKEN_SECRET,
        {
            expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User",UserSchema);
export default User; 