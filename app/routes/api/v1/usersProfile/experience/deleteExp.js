const passport = require('passport');
const router = require('express').Router();

// @route   DELETE /api/v1/:username/experience/:exp_id
// @desc    Delete education from profile
// @access  Private
router.delete(
  '/:username/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const profile = await req.db.Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    return res.json(profile);
  }
);

module.exports = router;
