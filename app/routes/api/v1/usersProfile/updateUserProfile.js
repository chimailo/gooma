'use strict';

const passport = require('passport');
const router = require('express').Router();
const { body, check, validationResult } = require('express-validator');

// @route   POST /api/v1/:username
// @desc    Create or update users profile
// @access  Private
router.post(
  '/:username',
  [
    passport.authenticate('jwt', { session: false }),
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
        const matched = username
          .split()
          .filter(char => invalidChars.includes(char));

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
      check('email', 'Please include a valid email').isEmail()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      username,
      firstName,
      lastName,
      email,
      company,
      website,
      location,
      status,
      skills,
      about,
      phone,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Build User object
    const userFields = {};
    userFields.username = username;
    userFields.firstName = firstName;
    userFields.lastName = lastName;
    userFields.email = email;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (about) profileFields.about = about;
    if (phone) profileFields.phone = phone;
    if (skills)
      profileFields.skills = skills.split(',').map(skill => skill.trim());

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      if (req.user.username !== req.params.username) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      await req.db.Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      await req.db.User.findOneAndUpdate(
        { _id: req.user.id },
        { $set: userFields },
        { new: true }
      );

      const profile = await req.db.Profile.findOne({
        user: req.user.id
      });

      const userQuery = await req.db.User.findById(req.user.id);

      const user = {};
      user.profile = profile;
      user.email = userQuery.email;
      user.avatar = userQuery.avatar;
      user.username = userQuery.username;
      user.lastName = userQuery.lastName;
      user.firstName = userQuery.firstName;

      res.json(user);
    } catch (err) {
      req.logger.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
