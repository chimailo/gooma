const logger = (module.exports = require('winston'));

logger.add(
  new logger.transports.File({
    name: 'debug-file',
    filename: 'gooma.log',
    level: 'error',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    exitOnError: true,
    json: true,
    maxsize: 104857600,
    maxFiles: 5
  })
);

logger.add(
  new logger.transports.Console({
    name: 'debug-console',
    level: 'info',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    exitOnError: true
  })
);
