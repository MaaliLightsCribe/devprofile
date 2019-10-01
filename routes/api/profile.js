const express = require('express');
const router = express.Router();
const profileServices = require('../../services/profile');
const auth = require('../../middleware/auth');

// @route    GET api/profile/me
// @desc     Get current user Profile
// @access   Public
router.get('/me', auth, profileServices.getUserProfile);

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post('/', auth, profileServices.createUpdateProfile);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', profileServices.getAllProfiles);

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', profileServices.getProfileByUserId);

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, profileServices.deleteProfile);

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put('/experience', auth, profileServices.addExperience)

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private
router.delete('/experience/:exp_id', auth, profileServices.deleteExperience);

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put('/education', auth, profileServices.addEducation)


// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private
router.delete('/education/:edu_id', auth, profileServices.deleteEducation);




module.exports = router;