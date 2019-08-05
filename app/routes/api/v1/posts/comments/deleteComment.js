'use strict';

const passport = require('passport');
const router = require('express').Router();

// @route   DELETE /api/v1/:username/articles/:slug/comments/:comment_id
// @desc    Delete comment
// @access  Private
router.delete(
  '/:username/articles/:slug/comments/:comment_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const post = await req.db.Post.findOne({ slug: req.params.slug });

      // Pull out comment
      const comment = post.comments.find(
        comment => comment.id === req.params.comment_id
      );

      // Make sure comment exists
      if (!comment) {
        return res.status(404).json({ msg: 'Comment does not exist' });
      }
      // Check user
      if (post.user.toString() !== req.user.id) {
        return res.status(401).send({ msg: 'User not authorized' });
      }

      if (comment.user.toString() === req.user.id) {
        return res.status(401).send({ msg: 'User not authorized' });
      }

      // Get remove index
      const removeIndex = post.comments
        .map(comment => comment.user.toString())
        .indexOf(req.params.comment_id);

      post.comments.splice(removeIndex, 1);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      req.logger.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
