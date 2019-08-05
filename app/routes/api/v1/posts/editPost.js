'use strict';

const passport = require('passport');
const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const { slugify } = require('../../../../utils');

// @route   PUT /api/v1/:username/articles/:slug
// @desc    Edit a post
// @access  Private
router.put(
  '/:username/articles/:slug',
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

    const { title, body, status, feat_img, slug, tags } = req.body;
    const tagsList = tags.split(',').map(tag => tag.trim());
    // const post = req.db.Post.findOne({slug:req.params.slug})

    // Build post object
    const postFields = {};
    if (title) postFields.title = title;
    if (body) postFields.body = body;
    if (status) postFields.status = status;
    if (feat_img) postFields.feat_img = feat_img;
    if (slug) postFields.slug = slug;

    try {
      let post = await req.db.Post.findOne({
        user: req.user.id,
        slug: req.params.slug
      });

      if (!post) {
        return res.status(404).send({ msg: 'Could not find that article.' });
      }

      if (post.user.toString() !== req.user.id) {
        return res.status(401).send({ msg: 'User not authorized' });
      }

      post = await req.db.Post.findOneAndUpdate(
        { slug: req.params.slug },
        { $set: postFields },
        { new: true }
      );

      const user = await req.db.Profile.findOne({ user: req.user.id });
      const userTags = user.tags.map(tag => tag.slug);

      // Check if tag exists and add it to profile.tags if it does not
      tagsList
        .filter(tag => !userTags.includes(slugify(tag)))
        .map(tag => {
          user.tags.push({ name: tag, slug: slugify(tag) });
        });

      // Get the tag ID and attach it to the post document
      post.tags = user.tags
        .filter(tag => tagsList.map(tag => slugify(tag)).includes(tag.slug))
        .map(tag => tag.id);

      await post.save();
      await user.save();

      res.json(post);
    } catch (err) {
      req.logger.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
