'use strict';

const passport = require('passport');
const router = require('express').Router();

// @route   POST /api/v1/:username/articles/:slug
// @desc    Delete post
// @access  Private
router.delete(
  '/:username/articles/:slug',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const post = await req.db.Post.findOne({
        user: req.user.id,
        slug: req.params.slug
      });

      if (!post) {
        return res.status(404).send({ msg: 'Could not find that article.' });
      }

      if (post.user.toString() !== req.user.id) {
        return res.status(401).send({ msg: 'User not authorized' });
      }

      await post.remove();
      res.json({ msg: 'Post removed' });
    } catch (err) {
      req.logger.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Could not find that article.' });
      }
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
