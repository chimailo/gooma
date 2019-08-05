const gravatar = require('gravatar');
const router = require('express').Router();
const { body, check, validationResult } = require('express-validator');

const { getToken } = require('../../../../utils');

// @route   POST api/v1/signup
// @desc    Register a user
// @access  Public
router.post(
  '/signup',
  [
    body('username').custom(username => {
      const invalidChars = [
        '~',
        '!',
        '#',
        '@',
        '%',
        '^',
        '&',
        '*',
        '(',
        ')',
        '-',
        '+',
        ';',
        ',',
        '.',
        '[',
        ']',
        '{',
        '}',
        '<',
        '>',
        '?',
        '/',
        '|',
        "'",
        '`',
        '$',
        '=',
        ':',
        '"',
        "'"
      ];
      const matched = [...username].filter(char => invalidChars.includes(char));

      if (matched.length > 0) {
        throw new Error(
          `Username cannot contain invalid characters: ${invalidChars}`
        );
      }
      return true;
    }),
    check('username', 'Username is required')
      .not()
      .isEmpty(),
    check('firstName', 'First name is required')
      .not()
      .isEmpty(),
    check('lastName', 'Last name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 8 or more characters'
    ).isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, username, email, password } = req.body;

    try {
      let user = await req.db.User.findOne({
        $or: [{ email: email }, { username: email }]
      });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      user = await req.db.User.create({
        firstName,
        lastName,
        username,
        email,
        password,
        avatar
      });

      // Create profile for the user
      profile = await new req.db.Profile({ user: user.id });
      await profile.save();

      const token = getToken({ id: user.id, username: user.username });

      return res.json({ token });
    } catch (err) {
      req.logger.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
