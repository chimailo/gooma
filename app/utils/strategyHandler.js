const { slugify, genRandomString } = require('../utils');
const logger = require('../../logger.js');
const db = require('../database/createDatabase')({ logger });

// Passport middleware function to handle User registration and signin
module.exports = strategyHandler = async (
  accessToken,
  refreshToken,
  { name, emails, photos },
  done
) => {
  try {
    const user = await db.User.findOne({ email: emails[0].value });

    if (user) {
      return done(null, user, { message: 'Logged in Successfully' });
    }

    let username = slugify(emails[0].value.split('@')[0]);
    const findUsername = await db.User.findOne({ username });

    if (findUsername) {
      username += genRandomString(4);
    }

    const newUser = await db.User.create({
      username,
      firstName: name.givenName,
      lastName: name.familyName,
      email: emails[0].value,
      avatar: photos[0].value,
      password: genRandomString(16)
    });

    // Create profile for the user
    profile = new db.Profile({ user: newUser.id });
    await profile.save();

    return done(null, newUser, { message: 'Signed up successfully' });
  } catch (err) {
    logger.error(err.message);
    done(err, { message: 'Oops! Something went wrong.' });
  }
};
