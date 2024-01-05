const Message = require('../models/messageModal')


const fetchAllMessages = async (req,res)=>{
    try{
        const {chatId} = req.body;
        console.log("fetching messages of ",chatId);
        if(!chatId){
            return res.send({message:"chat id is required"});
        }

        const msgdata = await Message.find({chatId:chatId});
        return res.send(msgdata);
    }
    catch(err){
        return res.json(err);
    }
}

module.exports = {
    fetchAllMessages
}