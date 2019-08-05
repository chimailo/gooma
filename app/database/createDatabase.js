const glob = require('glob');
const path = require('path');
const config = require('config');
const mongoose = require('mongoose');

module.exports = ({ logger }) => {
  const url = process.env.MONGODB_URL || config.get('dbURI');

  try {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }

  const db = glob
    .sync('./schemas/**/*.js', { cwd: __dirname })
    .map(filePath => {
      return {
        schema: require(filePath),
        name: path.basename(filePath).replace(path.extname(filePath), '')
      };
    })
    .map(({ name, schema }) => mongoose.model(name, schema))
    .reduce((db, model) => {
      return {
        ...db,
        [model.modelName]: model
      };
    }, {});

  mongoose.connection
    .on('error', error => {
      throw error;
    })
    .once('open', () => logger.info(`Database connected...`));

  return db;
};
