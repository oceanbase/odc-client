import logger from 'loglevel';
if (location.hostname.indexOf('pre-oceanbasenext') > -1 || process.env.NODE_ENV === 'development') {
  logger.setLevel(logger.levels.DEBUG);
} else {
  logger.setLevel(logger.levels.INFO);
}

export default logger;
