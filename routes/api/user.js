var express = require('express');
var router = express.Router();
var userService = require('../../services/user');


/* CREATE USER */ 
router.post('/', userService.createUser);


module.exports = router;