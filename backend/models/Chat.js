import moongoose from "mongoose";

const messageSchema = new moongoose.Schema({
  sender: {
    type: moongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receptient: {
    type: moongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: 
  [{
     id:{
      type: moongoose.Schema.Types.ObjectId
     },
     text: {
      type: String,
      default: ""
     },     
     image: {
      type: String,
      default: ""
     },
     date: {
      type: String,
      default: ""
     },  
  }]
});
const Chat = moongoose.model("Chat", messageSchema);
export default Chat;