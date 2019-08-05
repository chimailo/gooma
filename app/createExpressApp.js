const express = require('express');
const passport = require('passport');
const expressWinston = require('express-winston');
const router = require('./routes/createRouter.js')();

require('./utils/passport');

module.exports = ({ database, logger }) =>
  express()
    .use(
      expressWinston.logger({
        winstonInstance: logger,
        msg:
          '{{res.statusCode}} {{req.method}} {{req.url}} {{res.responseTime}}ms',
        meta: false
      })
    )
    .use(express.json({ extended: false }))
    .use(passport.initialize())
    .use((req, res, next) => {
      req.base = `${req.protocol}://${req.get('host')}`;
      req.logger = logger;
      req.db = database;
      return next();
    })
    .use('/api/v1', router)
    .use(function(req, res, next) {
      var err = new Error();
      err.status = 404;
      err.message = 'Not Found';
      next(err);
    })
    .use((error, req, res, next) => {
      logger.error(error, error);
      res.status(error.status || 500).json({ error });
    });
