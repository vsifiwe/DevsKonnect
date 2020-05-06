const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/posts');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');
//@route GET api/profile/me
//@desc Get current user's profile
//@access private

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user,
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no Profile for this user',
            });
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
});

//@route POST api/profile
//@desc create or update profiles
//@access private

router.post(
    '/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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
            linkedin,
        } = req.body;

        //build profile field

        const profileFields = {};
        profileFields.user = req.user;
        if (company) profileFields.company = company;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (website) profileFields.website = website;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;

        if (skills) {
            profileFields.skills = skills
                .split(',')
                .map((skill) => skill.trim());
        }
        //build social object

        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (facebook) profileFields.social.facebook = facebook;

        try {
            let profile = await Profile.findOne({ user: req.user });

            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }

            //create if no profile is found

            profile = new Profile(profileFields);

            await profile.save();

            return res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

//@route GET api/profile
//@desc Get all profiles
//@access public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', [
            'name',
            'avatar',
        ]);
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: 'Server Error' });
    }
});
//@route GET api/profile/user/:user_id
//@desc Get user's profile by ID
//@access public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id,
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(500).send({ msg: 'Profile not found' });
        }
        res.status(500).send({ message: 'Server Error' });
    }
});
//@route DELETE api/profile
//@desc Delete profile user, & posts
//@access Private

router.delete('/', auth, async (req, res) => {
    try {
        //Remove user posts

        await Post.deleteMany({ user: req.user });

        //remove profile
        await Profile.findOneAndRemove({ user: req.user });
        //remove user
        await User.findOneAndRemove({ _id: req.user });

        res.json({ msg: 'User deleted' });
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(500).send({ msg: 'Profile not found' });
        }
        res.status(500).send({ message: 'Server Error' });
    }
});

//@route PUT api/profile/experience
//@desc Add profile experience
//@access Private

router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'from date is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        };

        try {
            const profile = await Profile.findOne({ user: req.user });

            profile.experience.unshift(newExp);
            await profile.save();

            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ msg: 'server error' });
        }
    }
);

//@route DELETE api/profile/experience/:exp_id
//@desc Delete experience from profile
//@access Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user });
        // Get remove index

        const removeIndex = profile.experience
            .map((item) => item.id)
            .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'server error' });
    }
});

//@route PUT api/profile/education
//@desc Add profile education
//@access Private

router.put(
    '/education',
    [
        auth,
        [
            check('school', 'school is required').not().isEmpty(),
            check('degree', 'degree is required').not().isEmpty(),
            check('fieldofstudy', 'field of study is required').not().isEmpty(),
            check('from', 'from date is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        };

        try {
            const profile = await Profile.findOne({ user: req.user });

            profile.education.unshift(newEdu);
            await profile.save();

            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ msg: 'server error' });
        }
    }
);

//@route DELETE api/profile/education/:edu_id
//@desc Delete education from profile
//@access Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user });
        // Get remove index

        const removeIndex = profile.education
            .map((item) => item.id)
            .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'server error' });
    }
});

//@route GET api/profile/github/:username
//@desc Get user repos from github
//@access Public

router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${
                req.params.username
            }/repos?per_page=5&sort=created:asc&client_id=${config.get(
                'githubClientId'
            )}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {
                'user-agent': 'node.js',
            },
        };

        request(options, (errors, response, body) => {
            if (errors) console.error(errors);

            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'No Github profile found' });
            }

            res.json(JSON.parse(body));
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
