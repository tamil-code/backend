const express = require('express')
const router  = express.Router();

const {authenTicateUser} = require('../controllers/authController')

const {fetchAllMessages} = require('../controllers/messageController')

router.route('/get-message').post(authenTicateUser,fetchAllMessages);


module.exports=router
