const passport = require('passport');
const router = require('express').Router();

// @route   DELETE /api//:username/projects/:project_id
// @desc    Delete projects from profile
// @access  Private
router.delete(
  '/:username/projects/:project_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const profile = await req.db.Profile.findOne({ user: req.user.id });

    const removeIndex = profile.projects
      .map(item => item.id)
      .indexOf(req.params.project_id);

    profile.projects.splice(removeIndex, 1);

    await profile.save();

    return res.json(profile);
  }
);

module.exports = router;
