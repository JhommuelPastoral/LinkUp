import Video from "../models/Video.js";
import cloudinary from "../config/cloud.js";
import streamifier from "streamifier";  

const uploadStream = async (buffer) => {



  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {resource_type: 'video', folder: "videos"},
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
      
    );
    streamifier.createReadStream(buffer).pipe(stream);
  })

}

export const postVideo = async (req, res) => {

  try {
    const {caption} = req.body
    if(!req.file) {
      return res.status(400).json({message: "All fields are required"});
    }

    const result = await uploadStream(req.file.buffer);
    const newVideo = await Video.create({caption, userId: req.user._id, videoUrl: result.secure_url});    
    res.status(200).json({message: "Video uploaded successfully", newVideo});

  } catch (error) {
    console.log("postVideo error", error.message);    
    res.status(500).json({message: error.message});
  }
}

export const getVideo = async (req, res) => {
  try {
    const videos = await Video.find().sort({createdAt: -1});
    res.status(200).json(videos);
  } catch (error) {
    console.log("getVideo error", error.message);    
    res.status(500).json({message: error.message});
  }
}