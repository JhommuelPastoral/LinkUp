import User from "../models/User.js"
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloud.js";

export const signup =  async (req, res) => {

  try {
    const {fullname, email, password} = req.body;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(!fullname || !email || !password) {
      return res.status(400).json({message: "All fields are required"});
    }
    if(password.length < 6) {
      return res.status(400).json({message: "Password must be at least 6 characters"});
    }
    if(!emailRegex.test(email)){
      return res.status(400).send({message:'Please enter a valid email'});
    }

    const userExist = await User.findOne({email});
    
    if(userExist) {
      return res.status(400).json({message: "User already exist"});
    }

    const newUser = await User.create({
      fullname,
      email,
      password,
      profileImage: "https://i.pinimg.com/736x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"
    });
    const token = jwt.sign({userId:newUser._id}, process.env.JWT_SECRET, {expiresIn: "7d"});
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.status(201).json({message: "User created successfully", newUser});    
  } catch (error) {
    console.log("Signup error", error.message);
    res.status(500).json({message: error.message});
  }
}

export const login = async (req, res) => {
  try {
    const{email, password} = req.body;
  
    if(!email || !password) {
      return res.status(400).json({message: "All fields are required"});
    }
  
    const userExist = await User.findOne({email});
    if(!userExist) {
      return res.status(400).json({message: "User does not exist"});
    }
    const isPasswordCorrect = await userExist.matchPassword(password);
    if(!isPasswordCorrect) {
      return res.status(400).json({message: "Invalid credentials"});
    }
    const token = jwt.sign({userId:userExist._id}, process.env.JWT_SECRET, {expiresIn: "7d"});
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.status(200).json({message: "User logged in successfully", userExist});
    
  } catch (error) {
    console.log("Login error", error.message);
    res.status(500).json({message: error.message});
    
  }
}

export const onboarding = async (req, res,io) => {
  try {
    const userID = req.user._id;
    let {fullname, profileImage, bio } = req.body;

    if(!fullname || !bio) {
      return res.status(400).json({message: "All fields are required"});
    }
    const uploadResult = await cloudinary.uploader.upload(profileImage, {
      folder: "profile-images",
    });

    if(!profileImage) {
      profileImage = "https://i.pinimg.com/736x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"
    }
    profileImage = uploadResult.secure_url;
    const updatedUser = await User.findByIdAndUpdate(userID, {fullname, profileImage, bio, isOnboarded: true}, {new: true});
    res.status(200).json({message: "User onboarded successfully", updatedUser});
    io.emit("recommendUser", updatedUser);
  } catch (error) {
    console.log("Onboarding error", error.message);
    res.status(500).json({message: error.message});
  }
}

export const logout = (req, res, io) => {
  io.emit("user-disconnected");
  res.cookie("token","", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 0
  })
  res.status(200).json({message: "User logged out successfully"});
}