const bcrypt = require('bcryptjs');
const router = require('express').Router();
const { check, validationResult } = require('express-validator');

const { getToken } = require('../../../../utils');

// @route   POST api/v1/auth/login
// @desc    Log in user
// @access  Public
router.post(
  '/auth/login',
  [
    check('username_or_email', 'Enter your username or email')
      .not()
      .isEmpty(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username_or_email, password } = req.body;

    try {
      let user = await req.db.User.findOne({
        $or: [{ email: username_or_email }, { username: username_or_email }]
      });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const token = getToken({ id: user.id, username: user.username });

      return res.json({ token });
    } catch (err) {
      req.logger.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
