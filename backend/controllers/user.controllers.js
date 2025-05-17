import User from "../models/User.js";
import FriendRequest from "../models/friendRequest.js";
import Post from '../models/Post.js';
export const getRecommendedFriends = async (req,res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);
    const recommendUser = await User.find({
      $and:[
        {_id: {$ne: currentUserId}},
        {_id: {$nin: currentUser.friends}},
        {isOnboarded: true}
      ]
    }).select('-password').limit(5);
    return res.status(200).json({recommendUser});
  } catch (error) {
    console.log("getRecommendedFriends", error.message);
  }
}

export const getFriends = async (req,res) => {
  try {
    const friends = await User.findById(req.user._id).select("friends").populate('friends', "fullname profileImage");
    res.status(200).json({friends});
  } catch (error) {
    console.log("getFriends", error.message); 
  }

} 

export const addFriend = async (req,res, io) => {
  try {
    const {id:friendId} = req.params;
    const currentUserId = req.user._id;

    // Check if the user already send a request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        {sender: currentUserId, reciptient: friendId},
        {sender: friendId, reciptient: currentUserId}
      ]
    });

    if(existingRequest) {
      return res.status(400).json({message: "Friend request already sent"});
    }

    const friendRequest = await FriendRequest.create({
      sender: currentUserId,
      reciptient: friendId,
      status: "pending"
    });
    io.emit(`outgoingFriendRequests${currentUserId}`);
    io.emit(`incomingFriendRequests${friendId}`);

    res.status(200).json({friendRequest});
  } catch (error) {
    console.error("Add friend error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

export const acceptFriendRequest = async (req,res,io) => {
  try {
    const {id:senderId} = req.params;
    const friendRequest = await FriendRequest.findOne({sender: senderId, reciptient: req.user._id, status: "pending"});
    if(!friendRequest) {
      return res.status(400).json({message: "Friend request not found"});
    }
    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(req.user._id, {$addToSet: {friends: senderId}}, {new: true});
    await User.findByIdAndUpdate(senderId, {$addToSet: {friends: req.user._id}}, {new: true});

    io.emit(`acceptedFriendRequest${senderId}`);
    io.emit(`acceptedFriendRequest${req.user._id}`);

    res.status(200).json({friendRequest});

  } catch (error) {
    console.log("acceptFriendRequest", error.message);
    res.status(500).json({message: error.message});
  }
}



export const getOnlineUsers = async (req,res) => {
  try {
    const onlineUsers = await User.find({isOnline: true}).select("fullname profileImage");
    res.status(200).json({onlineUsers});
  } catch (error) {
    console.log("getOnlineUsers", error.message);
  }
}

export const getOutgoingFriendRequests = async (req,res,io) => {
  try {
    const outgoingFriendRequests = await FriendRequest.find({sender: req.user._id, status: "pending"}).populate("reciptient", "fullname profileImage");
    res.status(200).json({outgoingFriendRequests});
  } catch (error) {
    console.log("getOutgoingFriendRequests", error.message);
  }
}

export const getIncomingFriendRequests = async (req,res) => {
  try {
    const incomingFriendRequests = await FriendRequest.find({reciptient: req.user._id, status: "pending"}).populate("sender", "fullname profileImage");
    res.status(200).json({incomingFriendRequests});
  } catch (error) {
    console.log("getIncomingFriendRequests", error.message);
  }
}

