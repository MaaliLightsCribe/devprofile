const joi = require('@hapi/joi');
const Post = require('../models/Post');
const Profile = require('../models/Profile');
const User = require('../models/User');

// POST: Create a post: Private
const createPost = async (req, res) => {
    const { error } = validatePost(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        const post = await newPost.save();
        res.status(200).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
}

// GET all posts: Private
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.status(200).json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' })
    }
}

// GET post by id: Private
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(400).json({ msg: 'Post not found' });
        res.status(200).json(post);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).json({ msg: 'Server Error' })
    }
}

// Delete post: Private
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        // Check user
        if (post.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });
        await post.remove();
        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
}

// PUT: Like a post: Private 
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Check if post has already been liked:
        const alreadyLiked = post.likes.filter(like => like.user.toString() == req.user.id).length;
        if (alreadyLiked > 0) return res.status(400).json({ msg: 'Post already liked' });
        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
}

// PUT: unLike a post: Private 
const unLikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Check if post has not been liked yet:
        const alreadyLiked = post.likes.filter(like => like.user.toString() === req.user.id).length;
        if (alreadyLiked === 0) return res.status(400).json({ msg: 'Post has not been liked yet' });
        // Get remove index:
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.status(200).json(post.likes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' })
    }
}


// Comment on a post: Private
const commentPost = async (req, res) => {
    const { error } = validateComment(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };
        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: 'Server Error' })
    }
}

// Delete Comment on a post: Private
const deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Pull out comment
        const comment = post.comments.find(
            comment => comment.id === req.params.comment_id
        );
        // Make sure comment exists
        if (!comment) return res.status(404).json({ msg: 'Comment does not exist' });
        // Check user
        if (comment.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });
        // Get remove index
        const removeIndex = post.comments.map(comment => comment.id).indexOf(req.params.comment_id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err);
        res.status(400).json({ msg: 'Server Error' })
    }
}


// Validation method for post
const validatePost = (data) => {
    const schema = joi.object({
        text: joi.required()
    })
    return schema.validate({
        text: data.text
    })
}
// Validation method for comment
const validateComment = (data) => {
    const schema = joi.object({
        text: joi.required()
    })
    return schema.validate({
        text: data.text
    })
}
// Export all functions 
module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
    likePost,
    unLikePost,
    commentPost,
    deleteComment
}