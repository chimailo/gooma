const passport = require('passport');
const router = require('express').Router();

const getToken = require('../../../../utils');

// @route   GET api/v1/auth/facebook
// @desc    Authenticate user with facebook
// @access  Public
router.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

// @route   GET api/v1/auth/facebook
// @desc    Callback after authentication
// @access  Public
router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const token = getToken({ id: req.user.id, username: req.user.username });

    res.json({ token });
  }
);

module.exports = router;
