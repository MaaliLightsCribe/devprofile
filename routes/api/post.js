const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const postServices = require('../../services/post');

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post('/', auth, postServices.createPost)

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get('/', auth, postServices.getAllPosts);

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
router.get('/:id', auth, postServices.getPostById);

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete('/:id', auth, postServices.deletePost);

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id', auth, postServices.likePost);

// @route    PUT api/posts/unlike/:id
// @desc     unLike a post
// @access   Private
router.put('/unlike/:id', auth, postServices.unLikePost);

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post('/comment/:id', auth, postServices.commentPost);
  
// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete('/comment/:id/:comment_id', auth, postServices.deleteComment);


module.exports = router;