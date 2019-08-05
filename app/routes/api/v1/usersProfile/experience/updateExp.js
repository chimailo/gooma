const router = require('express').Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');

// @route   PUT /api/v1/:username/experience/:exp_id
// @desc    Update experience
// @access  Private
router.put(
  '/:username/experience/:exp_id',
  [
    passport.authenticate('jwt', { session: false }),
    [
      check('title', 'The job title is required')
        .not()
        .isEmpty(),
      check('company', 'Please enter the name of the company')
        .not()
        .isEmpty(),
      check(
        'from',
        'Please enter the date you started at that company is required'
      )
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

    try {
      const profile = await req.db.Profile.updateOne(
        { user: req.user.id, 'experience._id': req.params.exp_id },
        {
          $set: {
            'experience.$.title': title,
            'experience.$.company': company,
            'experience.$.location': location,
            'experience.$.from': from,
            'experience.$.to': to,
            'experience.$.current': current,
            'experience.$.description': description
          }
        },
        { new: true }
      );

      return res.json({ msg: 'Experience successfully updated', profile });
    } catch (err) {
      req.logger.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
