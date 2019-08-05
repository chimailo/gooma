const config = require('config');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const strategyHandler = require('./strategyHandler');

//Create a passport middleware to handle social login with google.
passport.use(
  new GoogleStrategy(
    {
      clientID: config.get('googleClientID'),
      clientSecret: config.get('googleClientSecret'),
      callbackURL: '/api/v1/auth/google/callback',
      profileFields: ['id', 'name', 'email', 'photos']
    },
    strategyHandler
  )
);

//Create a passport middleware to handle social login with facebook.
passport.use(
  new FacebookStrategy(
    {
      clientID: config.get('FBClientID'),
      clientSecret: config.get('FBClientSecret'),
      callbackURL: 'https://2cfe3545.ngrok.io/api/v1/auth/facebook/callback',
      enableProof: true,
      profileFields: ['id', 'name', 'email', 'photos']
    },
    strategyHandler
  )
);

// Extract and verify that the token sent by the user is valid
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('jwtSecret')
    },
    async (payload, done) => {
      try {
        return done(null, payload.user);
      } catch (err) {
        done(err, false, { message: 'Invalid Token' });
      }
    }
  )
);
