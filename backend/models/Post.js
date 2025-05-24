import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
  },
  img: {
    type: String,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  comments: [{
    userId:{type:mongoose.Schema.Types.ObjectId,
    ref: "User"
    } ,
    message: String,
  }]
},{timestamps: true});

const Post = mongoose.model("Post", postSchema);
export default Post;