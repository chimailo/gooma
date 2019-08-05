'use strict';

const router = require('express').Router();

// @route   GET /api/v1/:username
// @desc    Get profile by user ID
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const query = await req.db.User.findOne({
      username: req.params.username
    });

    const profile = await req.db.Profile.findOne({
      user: query.id
    });

    const user = {};
    user.profile = profile;
    user.email = query.email;
    user.avatar = query.avatar;
    user.username = query.username;
    user.lastName = query.lastName;
    user.firstName = query.firstName;

    res.json(user);
  } catch (err) {
    req.logger.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
