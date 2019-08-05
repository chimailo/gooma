'use strict';

const passport = require('passport');
const router = require('express').Router();

// @route   POST /:username/articles/:slug/unlike
// @desc    Like a post
// @access  Private
router.post(
  '/:username/articles/:slug/unlike',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const post = await req.db.Post.findOne({ slug: req.params.slug });

      // Check if post has already been liked
      if (
        post.likes.filter(like => like.user.toString() === req.user.id)
          .length === 0
      ) {
        return res.status(400).json({ msg: 'Post is not yet liked' });
      }

      // Get remove index
      const removeIndex = post.likes
        .map(like => like.user.toString())
        .indexOf(req.user.id);

      post.likes.splice(removeIndex, 1);

      await post.save();

      res.json(post.likes);
    } catch (err) {
      req.logger.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
