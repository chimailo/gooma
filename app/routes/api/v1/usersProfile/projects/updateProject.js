const router = require('express').Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');

// @route   PUT /api/v1/:username/projects/:project_id
// @desc    Update projects
// @access  Private
router.put(
  '/:username/projects/:project_id',
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

    try {
      const profile = await req.db.Profile.updateOne(
        { user: req.user.id, 'projects._id': req.params.project_id },
        {
          $set: {
            'projects.$.name': name,
            'projects.$.isFinished': isFinished,
            'projects.$.links': links.split(',').map(skill => skill.trim()),
            'projects.$.description': description
          }
        },
        { new: true }
      );

      return res.json({ msg: 'Project successfully updated', profile });
    } catch (err) {
      req.logger.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
