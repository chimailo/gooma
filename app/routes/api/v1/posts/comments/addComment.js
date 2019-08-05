'use strict';

const passport = require('passport');
const router = require('express').Router();
const { check, validationResult } = require('express-validator');

// @route   POST /api/v1/:username/articles/:slug/comments
// @desc    Create comment
// @access  Private
router.post(
  '/:username/articles/:slug/comments',
  [
    passport.authenticate('jwt', { session: false }),
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { firstName, lastName, avatar } = await req.db.User.findById(
        req.user.id
      ).select('-password');
      const post = await req.db.Post.findOne({ slug: req.params.slug });

      const comment = {
        avatar,
        text: req.body.text,
        user: req.user.id,
        name: `${firstName} ${lastName}`
      };

      post.comments.unshift(comment);
      await post.save();

      res.json(post.comments);
    } catch (err) {
      req.logger.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
