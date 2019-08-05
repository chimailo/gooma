'use strict';

const passport = require('passport');
const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const { slugify, genRandomString } = require('../../../../utils');

// @route   POST /api/v1/:username/articles
// @desc    Create post
// @access  Private
router.post(
  '/:username/articles',
  [
    passport.authenticate('jwt', { session: false }),
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('body', 'Text is required')
        .not()
        .isEmpty(),
      check('status', 'Status is required')
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

      const { title, body, status, feat_img, tags } = req.body;
      const tagsList = tags.split(',').map(tag => tag.trim());
      const slug = `${slugify(title)}-${genRandomString(5)}`;

      const newPost = new req.db.Post({
        title,
        slug,
        body,
        status,
        feat_img,
        avatar,
        user: req.user.id,
        author: `${firstName} ${lastName}`
      });

      const user = await req.db.Profile.findOne({ user: req.user.id });
      const userTags = user.tags.map(tag => tag.slug);

      // Add post tags to profile.tags
      tagsList
        .filter(tag => !userTags.includes(slugify(tag)))
        .map(tag => {
          user.tags.push({ name: tag, slug: slugify(tag) });
        });

      // Get the tag ID and attach it to the post document
      newPost.tags = user.tags
        .filter(tag => tagsList.map(tag => slugify(tag)).includes(tag.slug))
        .map(tag => tag.id);

      await newPost.save();
      await user.save();

      res.json(newPost);
    } catch (err) {
      req.logger.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
