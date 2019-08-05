'use strict';

const router = require('express').Router();
const passport = require('passport');

// @route   DELETE api.v1/:username
// @desc    Delete profile, user & posts
// @access  Private
router.delete(
  '/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // @todo  - remove users posts

      // Remove profile
      await req.db.Profile.findOneAndRemove({ user: req.user.id });
      // Remove user
      await req.db.User.findOneAndRemove({ _id: req.user.id });

      return res.json({ msg: 'User deleted' });
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
