// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/user');
const checkAuth = require('../middileware/check-user-auth');

const router = express.Router();

/**
 * /api/user
 * http://localhost:3000/api/user
 */


router.post('/registration', controller.userRegistrationDefault);
router.put('/login', controller.userLoginDefault);
router.get('/logged-in-user-data', checkAuth, controller.getLoginUserInfo);
router.post('/get-all-user-lists', controller.getUserLists);
router.get('/get-user-by-user-id/:userId', controller.getUserByUserId);
router.get('/user-list', controller.getUserList);

//fbLogin
router.post('/fb-login', controller.fbLogin);


//test...
router.post('/test', controller.test);

// Export All router..
module.exports = router;
