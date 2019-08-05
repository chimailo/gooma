const router = require('express').Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');

// @route   PUT api/v1/:username/education/add
// @desc    Add education
// @access  Private
router.put(
  '/:username/education/add',
  [
    passport.authenticate('jwt', { session: false }),
    [
      check('school', 'The school you went to is required')
        .not()
        .isEmpty(),
      check('degree', 'Please enter the degree you obtained')
        .not()
        .isEmpty(),
      check('fieldOfStudy', 'What you studied is required')
        .not()
        .isEmpty(),
      check('from', 'The date you started the course is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await req.db.Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);
      await profile.save();

      res.json(profile);
    } catch (err) {
      req.logger.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
