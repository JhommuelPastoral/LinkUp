import User from "../models/User.js";
import FriendRequest from "../models/friendRequest.js";

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
    }).select('-password')
    return res.status(200).json({recommendUser});
  } catch (error) {
    console.log("getRecommendedFriends", error.message);
  }
}


export const getSingleRecommendeduser = async (req,res) => {
  try {
    const page = req.query.page;
    const limit = 5;
    const skip = (page - 1) * limit;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const filter = {
      $and:[
        {_id: {$ne: currentUserId}},
        {_id: {$nin: currentUser.friends}},
        {isOnboarded: true},
      ]
    };

    const totalMatchingUsers = await User.countDocuments(filter);
    const recommendUser = await User.find(filter).select('-password').skip(skip).limit(limit);
    const hasMore = page * limit < totalMatchingUsers;
    return res.status(200).json({ hasMore, recommendUser});

  } catch (error) {
    console.log("getIncomingFriendRequests", error.message);
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

export const getPaginatedFriends = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id).select("friends").populate('friends', "fullname profileImage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalFriends = user.friends.length;
    const paginatedFriends = user.friends.slice(skip, skip + limit);

    const hasMore = skip + limit < totalFriends;

    res.status(200).json({ hasMore, friends: paginatedFriends });
  } catch (error) {
    console.log("getFriends", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


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
    const outgoingFriendRequests = await FriendRequest.find({sender: req.user._id, status: "pending"}).populate("reciptient", "fullname profileImage bio");
    res.status(200).json({outgoingFriendRequests});
  } catch (error) {
    console.log("getOutgoingFriendRequests", error.message);
  }
}


export const getIncomingFriendRequests = async (req,res) => {
  try {
    const page = req.query.page;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalIncomingFriendRequests = await FriendRequest.countDocuments({reciptient: req.user._id, status: "pending"});
    const incomingFriendRequests = await FriendRequest.find({reciptient: req.user._id,status: "pending",}).populate("sender", "fullname profileImage bio").skip(skip).limit(limit);
    const hasMore = page * limit < totalIncomingFriendRequests.length;

    res.status(200).json({hasMore, incomingFriendRequests});
  } catch (error) {
    console.log("getIncomingFriendRequests", error.message);
  }
}

export const getProfileById = async (req,res) => {
  try {
    const {id} = req.params;
    // console.log(req.params)
    const user = await User.findById(id).select("-password");
    res.status(200).json({user});
  } catch (error) {
    console.log("getProfileById", error.message);
  }
}

export const findUser = async (req,res) => {
  try {
    const fullname = req.query.fullname;
    const user = await User.find({fullname : {$regex: fullname, $options: "i"}}).select('-password');
    res.status(200).json({user});
  } catch (error) {
    console.log("findUser", error.message);
  }
}