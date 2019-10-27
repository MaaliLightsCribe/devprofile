const joi = require('@hapi/joi');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')
const User = require('../models/User');



// @desc     Register user
const createUser = async (req, res) => {
    //console.log('body: ', req.body);
    const { error } = validatePayload(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { name, email, password } = req.body;
    try {
        // See if user exists: 
        let user = await User.findOne({ email });
        if (user) return res.status(400).send('User Already Exist')
        //Get users gravatar:
        const avatar = gravatar.url(email, {
            s: '200',   //default size
            r: 'pg',    //Rating
            d: 'mm'     //default image / user icon
        });
        //create instance of user
        user = new User({
            name,
            email,
            avatar,
            password
        });
        //Encrypt password & save User:
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        //Return jsonwebtoken:
        const payload = {
            user: {
                id: user.id
            }
        }   
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

}

// Validation Method:
const validatePayload = (data) => {
    const schema = joi.object({
        name: joi.string().alphanum().min(5).max(30).required(),
        email: joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        password: joi.string().required().pattern(/^[a-zA-Z0-9]{5,30}$/)
    })
    return schema.validate({
        name: data.name,
        email: data.email,
        password: data.password
    });
}


module.exports = {
    createUser
};




   // return User.create(req.body, (err, data) => {
    //     if(err) return next(err);
    //     res.json(data);
    // })
