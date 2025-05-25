import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  videoUrl: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  caption: String
},{timestamps: true});

const Video = mongoose.model("Video", videoSchema);
export default Video;
 