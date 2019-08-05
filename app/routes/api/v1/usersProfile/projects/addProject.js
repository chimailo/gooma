const router = require('express').Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');

// @route   PUT api/v1/:username/projects/add
// @desc    Add projects
// @access  Private
router.put(
  '/:username/projects/add',
  [
    passport.authenticate('jwt', { session: false }),
    [
      check('name', 'The name of the project is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, isFinished, links, description } = req.body;

    const newProject = {
      name,
      isFinished,
      links: links.split(',').map(skill => skill.trim()),
      description
    };

    try {
      const profile = await req.db.Profile.findOne({ user: req.user.id });

      profile.projects.unshift(newProject);
      await profile.save();

      res.json(profile);
    } catch (err) {
      req.logger.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
