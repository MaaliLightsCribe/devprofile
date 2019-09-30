var express = require('express');
var router = express.Router();
var auth = require('../../middleware/auth');
const authServices = require('../../services/auth');

// @route    GET api/auth
// @desc     Test route
// @access   Public
router.get('/', auth, authServices.authUser);


// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post('/', authServices.loginUser)

module.exports = router;
