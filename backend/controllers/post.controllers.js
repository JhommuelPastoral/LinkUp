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
    io.emit("newPost", post);
    res.status(200).json({message: "Post created successfully", post});

  } catch (error) {
    console.log("post error", error.message);
    res.status(500).json({message: error.message});
  }
}

export const getPosts = async (req,res) => {
  try {
    const posts = await Post.find({}).populate("userId", "fullname profileImage isOnline").sort({createdAt: -1});
    res.status(200).json({posts});
  } catch (error) {
    console.log("getPosts error", error.message);
    res.status(500).json({message: error.message});
  }
}

// export const getPosts = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1; // Default to page 1
//     const limit = parseInt(req.query.limit) || 10; // Default to 10 posts per page
//     const skip = (page - 1) * limit;

//     // Get total count to determine if there's a next page
//     const totalPosts = await Post.countDocuments();

//     const posts = await Post.find({})
//       .populate("userId", "fullname profileImage isOnline")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const hasMore = page * limit < totalPosts;

//     res.status(200).json({ posts, hasMore });
//   } catch (error) {
//     console.log("getPosts error", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };


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

