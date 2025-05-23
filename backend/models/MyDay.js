import mongoose from "mongoose";

const MydaySchema = new mongoose.Schema({
  image: String,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 1000 * 60 * 60 * 24), 
    expires: 0 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});



const MyDay = mongoose.model('Myday', MydaySchema);
export default MyDay;
