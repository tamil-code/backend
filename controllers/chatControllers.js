const User = require("../models/userModal");
const Chat = require("../models/chatModal");

const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      console.log("UserId  not sent with request");
      return res.sendStatus(400);
    }

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      //create a new chat entry in the db with the two users
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const fetchAllChats = async (req, res) => {
  console.log("fetching all chatas");
  try {
    var allchats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    allchats = await User.populate(allchats, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
      res.status(200).send(allchats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const createGroupChat = async (req, res) => {
  console.log(req.body);
  try {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
      }
    
      var users =req.body.users;
    
      if (users.length < 2) {
        return res
          .status(400)
          .send("More than 2 users are required to form a group chat");
      }
    
      users.push(req.user._id);

      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
      });
  
      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")     
        .populate("groupAdmin", "-password");
  
      res.status(200).json(fullGroupChat);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 
const renameGroupChat = async (req, res) => {
  console.log("group updatedd");  
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

     
    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
   
      res.json(updatedChat);
    }
  } catch (err) {
    res.json({ message:"error in updating group name" });
  }
};
const addToGroupChat = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const groupchat =await Chat.findById(chatId).lean(); 
 
  
    if(!groupchat?.groupAdmin.equals(req.user._id)){ //check if the requested user admin or not

        return res.status(403).json({message:"admin only has access to remove the users"})
    }
     const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }

  }
   catch (err) {
    res.status(err.status).json({ message: err.message });
   
  }
};
const removeFromGroupChat = async (req, res) => {
    try {
    const { chatId, userId } = req.body;
    const groupchat =await Chat.findById(chatId).lean();
    if(!groupchat.groupAdmin.equals(req.user._id)){
        return res.status(403).json({message:"admin only has access to remove the users"})
    }
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
          $pull: { users: userId },
        },
        {
          new: true,
        }
      )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    
      if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
      } else {
        res.json(removed);
      }
   
  } catch (err) {
     res.status(err.status).json({ message: err.message });
  }
};

const deleteGroupChat = async (req,res)=>{
  try{
    const {chatId} = req.body;
    const groupchat =await Chat.findById(chatId).lean();
    if(!groupchat.groupAdmin.equals(req.user._id)){
      return res.status(403).json({message:"admin only has access to remove the users"})
  }
  const deletedgroup =await Chat.findByIdAndDelete(chatId);
  console.log(deletedgroup);
  res.json(deletedgroup);
  }
  catch(err){
    res.status(err.status).json({ message: err.message });
  }
}
module.exports = {
  accessChat,
  fetchAllChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
  deleteGroupChat
};
