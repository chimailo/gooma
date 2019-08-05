const passport = require('passport');
const router = require('express').Router();

const { getToken } = require('../../../../utils');

// @route   GET api/v1/auth/google
// @desc    Authenticate user with google
// @access  Public
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// @route   GET api/v1/auth/google
// @desc    Callback after authentication
// @access  Public
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = getToken({ id: req.user.id, username: req.user.username });

    res.json({ token });
  }
);

module.exports = router;
