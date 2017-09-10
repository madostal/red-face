const LOG_FILE_NAME = "red-face";

var winston = require("winston");

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: [LOG_FILE_NAME, ".log"].join("") })
	]
});

logger.setLevels({ debug: 0, info: 1, silly: 2, warn: 3, error: 4, });

module.exports = logger;