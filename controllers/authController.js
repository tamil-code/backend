const User = require("../models/userModal");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const userRegister = async (req, res) => {
  try {
    const { username, email, password, profileURL } = req.body;
    if (!username || !email || !password) {
      return res.json({ message: "required fields are missing! " });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "user already found ! " });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userdata = {
      username,
      email,
      password:hashedPassword,
      pic:profileURL,
    }
    
    await User.create(userdata);
    res.status(200).json({ message: "User registered successfullly !" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "email or password field is required" });
    }
    const user =await User.findOne({ email }).lean();
    if(user==null){
      return res.json({ status:false,message: "Invalid username or password" });     
    }
    const isPasswordValid = await bcrypt.compare(password,user.password);
    console.log(isPasswordValid);
    if (!user || !isPasswordValid) {
      return res.json({status:false, message: "Invalid username or password" });
    }
    const accessToken = generateToken(user._id);
    res.cookie("accesssToken", accessToken, { httpOnly: true });
    res.json({
      message: "Login successful",
      username: user.username,
      profileURL: user.pic,
      token:accessToken,
      status:true,
      id:user._id
    });
  } catch (err) {
    console.log(err);
    res.json({ message: err.message });
  }
};

const generateToken = (id) => {
  const accessToken = jwt.sign(
    { userId: id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30d" }
  );
  return accessToken;
};

const userLogout = (req, res) => {
  // // Clear HTTP-only cookies for the access token and refresh token
  // res.clearCookie("accessToken");
  req.user=null;
  res.json({ message: "Logout successful" });
};

const authenTicateUser =async (req,res,next)=>{
 
  const token =req.query.token;

  console.log(token);

// console.log(accessToken);
  if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
     
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if(decoded.userId){
          const user = await User.findById(decoded.userId).select('-password');
          req.user = user; 
      }
      

    console.log("user authenticated");
      next()
      // res.json({message:"user authenticated !"})
    } catch (error) {
     
      return res.status(403).json({ message: 'Forbidden' });
    }

}

const authenTicateUser1 =async (req,res,next)=>{
 
  const {token} = req.body;
  console.log(token); 
  console.log("authenticate user");
  
  // console.log(accessToken);
// console.log(accessToken);
  if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
     
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if(decoded.userId){
        const user = await User.findById(decoded.userId).select('-password');
        req.user = user;  
        res.status(200).json({message:"user authenticated !",user:user,token:token})
      }
      

      
    } catch (error) {
     
      return res.status(403).json({ message: 'Forbidden' });
    }

}

//fetches all availble users except the current user
const getAllUsers = async (req, res) => {
 try{
  const keyword = req.query.search
  ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
  : {};

const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select('-password');
res.send(users);
 }
 catch(err){
   res.json({message:err.message})
 }
};

module.exports = { userRegister, userLogin, userLogout,authenTicateUser,authenTicateUser1,getAllUsers};
