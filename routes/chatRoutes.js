const express = require('express')
const router  = express.Router();

const {authenTicateUser} = require('../controllers/authController')
const {accessChat,fetchAllChats,createGroupChat,renameGroupChat,addToGroupChat,removeFromGroupChat, deleteGroupChat} =require('../controllers/chatControllers')

router.route('/').post(authenTicateUser,accessChat);
router.route('/').get(authenTicateUser,fetchAllChats);

router.route('/new-group').post(authenTicateUser,createGroupChat);
router.route('/rename-group').put(authenTicateUser,renameGroupChat)
router.route('/add-group').post(authenTicateUser,addToGroupChat)
router.route('/remove-group').delete(authenTicateUser,removeFromGroupChat);
router.route('/delete-group').delete(authenTicateUser,deleteGroupChat);

module.exports=router
