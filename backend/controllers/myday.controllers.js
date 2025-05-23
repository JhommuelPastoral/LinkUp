import Myday from "../models/MyDay.js";
import cloudinary from "../config/cloud.js";
export const createMyday = async (req,res,io)=>{

  try {
    const {image} = req.body

    if(!image){
      return res.status(400).json({message: "All fields are required"});
    }
    
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "myday-images",
    })
    // Check if already uploaded
    const mydayExist = await Myday.findOne({userId: req.user._id});
    if(mydayExist){
       await Myday.updateOne({userId: req.user._id}, {image: uploadResult.secure_url});
       io.emit(`updateMyday`);
       return res.status(200).json({message: "Myday updated successfully"});
    }

    const newMyday = await Myday.create({image: uploadResult.secure_url, userId: req.user._id});
    io.emit(`updateMyday`);
    res.status(200).json({message: "Myday created successfully", newMyday});

  } catch (error) {
    console.log("createMyday error", error.message);
    res.status(500).json({message: error.message});
  }

}

export const getAllMydays = async (req,res)=>{

  try {
    const mydays = await Myday.find().sort({createdAt: -1}).populate("userId", "fullname profileImage");
    res.status(200).json({mydays});
  } catch (error) {
    console.log("getAllMydays error", error.message);
    res.status(500).json({message: error.message});
  }
}