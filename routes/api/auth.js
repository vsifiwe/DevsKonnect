const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

//@route GET api/auth
//@desc test route
//@access public

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

//@route POST api/users
//@desc Register user
//@access public

router.post(
    '/',
    [
        check('email', 'Include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    errors: [{ message: 'Invalid credentials' }],
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            console.log(user.password);

            if (!isMatch) {
                return res.status(400).json({
                    errors: [{ message: 'Invalid credentials' }],
                });
            }

            const payload = {
                user: user.id,
            };
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (error, token) => {
                    if (error) throw error;
                    res.json({ token });
                }
            );
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;
