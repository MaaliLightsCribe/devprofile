const joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')
const User = require('../models/User')


//Test Purpose via auth middleware:
const authUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
};

//Authenticate user & get token: authUserToken
const loginUser = async (req, res) => {
    const { error } = validatePayload(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    const { email, password } = req.body;
    try {
        // See if user exists: 
        let user = await User.findOne({ email });
        if (!user) return res.status(400).send('Invalid Credentials');
        // Compare Password:
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).send('Invalid Credentials');
   
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
// Vlidation Method:
const validatePayload = (data) => {
    const schema = joi.object({
        email: joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        password: joi.required()
    })
    return schema.validate({
        email: data.email,
        password: data.password
    });
}

module.exports = {
    authUser,
    loginUser
};