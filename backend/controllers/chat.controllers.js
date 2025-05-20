import Chat  from "../models/Chat.js"
export const sendChat = async (req, res,io) => {
  try {
    const {senderId:sender,  receiverId:receptient, message, image, date} = req.body
    const chat = await Chat.findOne(
      {$or: [
          {sender: sender, receptient: receptient},
          {sender: receptient, receptient: sender}
        ]})
    const newMessage = {text:message, image, date, id:sender};
    if(chat) {
      chat.messages.push(newMessage);
      await chat.save();    
    } else {
      const newChat = await Chat.create({sender, receptient, messages: [newMessage]});
    }
    io.emit(`newMessage${receptient}`);
    res.status(200).json(chat);
    
  } catch (error) {
    console.log("sendChat error", error.message);
  }
}

export const getChat = async (req, res, io) => {
  try {
    const { userId, recepientId } = req.query;
    const chat = await Chat.findOne({
      $or: [
        {sender: userId, receptient: recepientId},
        {sender: recepientId, receptient: userId}
      ] 
    });
    
    res.status(200).json(chat);
  } catch (error) {
    console.log("getChat error", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

