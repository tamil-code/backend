const express = require('express')
const app = express();
const mongoose = require('mongoose')
require('dotenv').config();
const cors = require('cors')
const cookieParser = require('cookie-parser');

const connectDB = require('./configs/ConnectDB')
const originConfigs = require('./configs/OriginConfigs')

const authRouters = require('./routes/authRoutes')
const chatRouters = require('./routes/chatRoutes');
const messageRouters = require('./routes/MessageRoutes');

const messageModal = require('./models/messageModal');



//connecting to mongodb
connectDB();



//cors 
app.use(cors({
    origin: process.env.CLIENT_ENDPOINT
}));

//parse the incoming req into json
app.use(express.json());

app.use(cookieParser())

app.use(authRouters);
app.use(chatRouters);
app.use(messageRouters);

app.use('/',(req,res)=>{
    res.send("server running")
})

const server = app.listen(process.env.PORT,()=>{
    console.log(`server running successfully on port ${process.env.PORT}`);
}) 


const io = require('socket.io')(server,{
    cors:{
        origin:process.env.CLIENT_ENDPOINT
    }
}) 

io.on('connection',(socket)=>{
    console.log("connected to socket io");

    socket.on('join-room',(room)=>{
        console.log("user joined to the chat: "+room);
        socket.join(room);
    })
    socket.on("send-message",async (data)=>{
        console.log("message sended");
        io.to(data.chatId).emit("receive-message",data);
        await messageModal.create(data);
    })  
      socket.on("group-message",async (data)=>{
        console.log("grp message sended");
        io.to(data.chatId).emit("receive-message",data);
        await messageModal.create(data);

    })

    socket.on("start-typing",(room,senderId)=>{
        console.log("client starts typing...");
        io.to(room).emit("start-typing",senderId)
    })
     socket.on("end-typing",(room,senderId)=>{
        console.log("client ends typing...");
        io.to(room).emit("end-typing",senderId)
    })
    

})  

// mongoose.connection.once('open',()=>{
    

// })