const router = require('express').Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');

// @route   PUT api/v1/:username/experience/add
// @desc    Add experience
// @access  Private
router.put(
  '/:username/experience/add',
  [
    passport.authenticate('jwt', { session: false }),
    [
      check('title', 'The job title is required')
        .not()
        .isEmpty(),
      check('company', 'Please enter the name of the company')
        .not()
        .isEmpty(),
      check('from', 'Please enter the date you started at that company')
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
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = { title, company, location, from, to, current, description };

    try {
      const profile = await req.db.Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);
      await profile.save();

      return res.json(profile);
    } catch (err) {
      req.logger.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
