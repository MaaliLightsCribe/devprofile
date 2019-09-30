const Profile = require('../models/Profile');
const User = require('../models/User');
const joi = require('@hapi/joi');

//GET: current user Profile: 
const getUserProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({ msg: 'No Profile for this user' });
        res.status(200).json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
}

//POST Create or update user profile: Private
const createUpdateProfile = async (req, res) => {
    const { error } = validatePayload(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};

    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        // Using upsert option (creates new doc if no match is found):
        let profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, upsert: true }
        );
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

// GET all profiles: public
const getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
}

// GET profile by user_id: Public 
const getProfileByUserId = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({ msg: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') return res.status(400).json({ msg: 'Profile not found' });

        res.status(500).send('Server Error');
    }
}



// Delete profile, user & posts: Private
const deleteProfile = async (req, res) => {
    try {
        // Remove user posts
        await Post.deleteMany({ user: req.user.id });
        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};



// Validation Function:
const validatePayload = (data) => {
    const schema = joi.object({
        status: joi.required(),
        skills: joi.required()
    })
    return schema.validate({
        status: data.status,
        skills: data.skills,
    });
}

// Export All Profile Sercices: 
module.exports = {
    getUserProfile,
    createUpdateProfile,
    getAllProfiles,
    getProfileByUserId,
    deleteProfile
}