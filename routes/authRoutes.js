const express = require('express')
const router  = express.Router();


//controller 
const authController = require('../controllers/authController')

router.post('/register',authController.userRegister);
router.post('/login',authController.userLogin);
router.post('/logout',authController.userLogout);

router.post('/authenticate',authController.authenTicateUser1);

//protected route (/users) only be accessed if the user is logged in 
router.get('/users',authController.authenTicateUser,authController.getAllUsers)

module.exports=router;