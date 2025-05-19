import Post from "../models/Post.js";
import cloudinary from "../config/cloud.js";

export const post = async (req,res,io) => {
  try {
    let {userId, message, img} = req.body;
    if(!message || !img || !userId) {
      return res.status(400).json({message: "All fields are required"});
    }
    const uploadResult = await cloudinary.uploader.upload(img, {
      folder: "post-images",
    });
    
    const post = await Post.create({userId, message, img: uploadResult.secure_url});
    io.emit("newPost");
    io.emit(`newPost${userId}`);

    res.status(200).json({message: "Post created successfully", post});

  } catch (error) {
    console.log("post error", error.message);
    res.status(500).json({message: error.message});
  }
}



export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = 5; 
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();

    const posts = await Post.find({})
      .populate("userId", "fullname profileImage isOnline")
      .populate("comments.userId", "fullname profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const hasMore = page * limit < totalPosts;

    res.status(200).json({ posts, hasMore });
  } catch (error) {
    console.log("getPosts error", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getAllUserPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ userId: userId }).sort({ createdAt: -1 }).populate("userId", "fullname profileImage");
    res.status(200).json({ Allposts: posts });
  } catch (error) {
    console.log("getAllUserPosts error", error.message);
    res.status(500).json({ message: error.message });
  }
}


export const likePosts = async (req,res,io) => {

  try {
    const {id} = req.params;
    const userId = req.user._id;
    const post = await Post.findById(id);

    if(!post) {
      return res.status(400).json({message: "Post not found"});
    }
    
    const alreadyLiked = post.likes.includes(userId);
    if(alreadyLiked) {
      post.likes.pull(userId);
      
    } else {
      post.likes.addToSet(userId);
    }
    await post.save();
    io.emit(`likePost`);
    res.status(200).json({post, message: alreadyLiked ? 'Post unliked' : 'Post liked'});
  } catch (error) {
    console.log("likePosts error", error.message);
    res.status(500).json({message: error.message});
  }

}

export const AddComment = async (req,res,io) => {
  try {
    const {userId, comment, postId} = req.body;
    const post = await Post.findById(postId);
    if(!post) {
      return res.status(400).json({message: "Post not found"});
    }
    post.comments.push({userId, message: comment});
    await post.save();
    io.emit(`newComment${postId}`);
    io.emit(`newComment`);
    res.status(200).json({post, message: "Comment added successfully"});
  } catch (error) {
    console.log("AddComment error", error.message);
    res.status(500).json({message: error.message});
  }
}

export const getSpecificPosts = async (req, res) => {
  try {
    const {id:postId} = req.params
    const posts = await Post.findById(postId).populate("comments.userId", "fullname profileImage");
    res.status(200).json({ Allposts: posts });
  } catch (error) {
    console.log("getAllUserPosts error", error.message);
    res.status(500).json({ message: error.message });
  }
}
