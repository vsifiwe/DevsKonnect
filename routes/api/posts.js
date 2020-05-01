const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const Post = require('../../models/posts');
const Profile = require('../../models/Profile');

//@route POST api/posts
//@desc create a post
//@access private

router.post(
    '/',
    [auth, [check('text', 'Text is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user).select('-password');

            const newPost = Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user,
            });

            const post = await newPost.save();

            res.json(post);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server Error' });
        }
    }
);

//@route GET api/posts
//@desc  Get all posts
//@access private

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

//@route GET api/posts/:id
//@desc  Get post by id
//@access private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ Message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ Message: 'Post not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

//@route DELETE api/posts/:id
//@desc  Delete post by ID
//@access private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ Message: 'Post not found' });
        }

        //check user

        if (post.user.toString() !== req.user) {
            return res.status(401).json({ Message: 'User not authorized' });
        }

        await post.remove();
        res.json({ Message: 'Post removed' });
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ Message: 'Post not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

//@route PUT api/posts/like/:id
//@desc  Like a post
//@access private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //check if post has already been liked

        if (
            post.likes.filter((like) => like.user.toString() === req.user)
                .length > 0
        ) {
            return res.status(400).json({ Message: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user });

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

//@route PUT api/posts/unlike/:id
//@desc  Like a post
//@access private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //check if post has already been liked

        if (
            post.likes.filter((like) => like.user.toString() === req.user)
                .length === 0
        ) {
            return res.status(400).json({ Message: 'Post has not been liked' });
        }

        //get remove index

        const removeIndex = post.likes
            .map((like) => like.user.toString())
            .indexOf(req.user);

        post.likes.splice(removeIndex, 1);

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

//@route POST api/posts/comment/:id
//@desc  Comment on a post
//@access private

router.post(
    '/comment/:id',
    [auth, [check('text', 'Text is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user,
            };

            post.comments.unshift(newComment);

            await post.save();

            res.json(post.comments);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server Error' });
        }
    }
);

//@route DELETE api/posts/comment/:id/:comment_id
//@desc  Delete comment
//@access private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // pull out comment

        const comment = post.comments.find(
            (comment) => comment.id === req.params.comment_id
        );

        //check if comment exists
        if (!comment) {
            return res.status(404).json({ Message: 'Comment not found' });
        }

        //check user

        if (comment.user.toString() !== req.user) {
            return res.status(401).json({ Message: 'User not authorized' });
        }

        //get remove index

        const removeIndex = post.comments
            .map((comment) => comment.user.toString())
            .indexOf(req.user);

        post.comments.splice(removeIndex, 1);

        await post.save();
        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
