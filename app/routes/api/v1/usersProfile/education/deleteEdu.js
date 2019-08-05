const passport = require('passport');
const router = require('express').Router();

// @route   DELETE /api/users/:user_id/experience/:edu_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
  '/:username/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const profile = await req.db.Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    return res.json(profile);
  }
);

module.exports = router;
