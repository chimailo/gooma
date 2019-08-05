'use strict';

const router = require('express').Router();

// @route   POST /api/v1/:username/articles
// @desc    Get all posts by a user
// @access  Public
router.get('/:username/articles', async (req, res) => {
  try {
    const user = await req.db.User.findOne({ username: req.params.username });
    const posts = await req.db.Post.find({
      user: user.id,
      status: 'published'
    }).sort({ date: -1 });

    if (posts.length === 0) {
      return res.json({ msg: 'No articles found for this user.' });
    }

    const profile = await req.db.Profile.findOne({ user: user.id });

    const modPosts = posts.map(post => {
      post.tags = post.tags.map(tagId => profile.tags.id(tagId).name);
      return post;
    });

    res.json(modPosts);
  } catch (err) {
    req.logger.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/v1/:username/articles/:slug
// @desc    Get post by slug
// @access  Public
router.get('/:username/articles/:slug', async (req, res) => {
  try {
    const user = await req.db.User.findOne({ username: req.params.username });
    const post = await req.db.Post.findOne({
      user: user.id,
      slug: req.params.slug,
      status: 'published'
    });

    if (!post) {
      return res.status(404).send({ msg: 'Could not find that article.' });
    }

    const profile = await req.db.Profile.findOne({ user: user.id });

    post.tags = post.tags.map(tagId => profile.tags.id(tagId).name);
    res.json(post);
  } catch (err) {
    req.logger.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
