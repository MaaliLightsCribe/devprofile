const Profile = require('../models/Profile');
const User = require('../models/User');
const Post = require('../models/Post');
const joi = require('@hapi/joi');
const config = require('config');
const request = require('request');



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

// PUT: Add profile experiance: Private

const addExperience = async (req, res) => {
    const { error } = validateExperience(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
}

// Delete experience from profile: Private 
const deleteExperience = async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
      const expIds = foundProfile.experience.map(exp => exp._id.toString());
      // if i dont add .toString() it returns this weird mongoose coreArray and the ids are somehow objects and it still deletes anyway even if you put /experience/5
      const removeIndex = expIds.indexOf(req.params.exp_id);
      if (removeIndex === -1) {
        return res.status(400).json({ msg: "Experience Not Exist against this exp_id" });
      } else {
        // theses console logs helped me figure it out
        // console.log("expIds", expIds);
        // console.log("typeof expIds", typeof expIds);
        // console.log("req.params", req.params);
        // console.log("removed", expIds.indexOf(req.params.exp_id));
        foundProfile.experience.splice(removeIndex, 1);
        await foundProfile.save();
        return res.status(200).json(foundProfile);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server error" });
    }
  };


// PUT: Add profile education: Private

const addEducation = async (req, res) => {
    const { error } = validateEducation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}

const deleteEducation = async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
      const eduIds = foundProfile.education.map(edu => edu._id.toString());
    // if i dont add .toString() it returns this weird mongoose coreArray and the ids are somehow objects and it still deletes anyway even if you put /education/5
    const removeIndex = eduIds.indexOf(req.params.edu_id);
      if (removeIndex === -1) {
        return res.status(400).json({ msg: "Education Not Exist against this edu_id" });
      } else {
        // theses console logs helped me figure it out
        // console.log("eduIds", eduIds);
        // console.log("typeof eduIds", typeof eduIds);
        // console.log("req.params", req.params);
        // console.log("removed", eduIds.indexOf(req.params.edu_id));
        foundProfile.education.splice(removeIndex, 1);
        await foundProfile.save();
        return res.status(200).json(foundProfile);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server error" });
    }
  };


// Get user repos from Github: Public
const userGitRepo = (req, res) => {
    try {
      const options = {
        uri: `https://api.github.com/users/${
          req.params.username
        }/repos?per_page=5&sort=created:asc&client_id=${config.get(
          'githubClientId'
        )}&client_secret=${config.get('githubSecret')}`,
        method: 'GET',
        headers: { 'user-agent': 'node.js' }
      };
  
      request(options, (error, response, body) => {
        if (error) console.error(error);
  
        if (response.statusCode !== 200) {
          return res.status(404).json({ msg: 'No Github profile found' });
        }
  
        res.json(JSON.parse(body));
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };


// Export All Profile Sercices: 
module.exports = {
    getUserProfile,
    createUpdateProfile,
    getAllProfiles,
    getProfileByUserId,
    deleteProfile,
    addExperience,
    deleteExperience,
    addEducation,
    deleteEducation,
    userGitRepo
}

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

const validateExperience = (data) => {
    const schema = joi.object({
        title: joi.required(),
        company: joi.required(),
        from: joi.required()
    })
    return schema.validate({
        title: data.title,
        company: data.company,
        from: data.from
    })
}

const validateEducation = (data) => {
    const schema = joi.object({
        school: joi.required(),
        degree: joi.required(),
        fieldofstudy: joi.required(),
        from: joi.required()
    })
    return schema.validate({
        school: data.school,
        degree: data.degree,
        fieldofstudy: data.fieldofstudy,
        from: data.from
    })
}

