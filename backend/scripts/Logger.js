/**
 * Default log file name
 */
const LOG_FILE_NAME = 'red-face'

let winston = require('winston')

let logger = new (winston.Logger)({
	transports: [
		//use console logger
		new (winston.transports.Console)(),
		//use file logger
		new (winston.transports.File)({ filename: [LOG_FILE_NAME, '.log'].join('') }),
	],
})

logger.setLevels({ debug: 0, info: 1, silly: 2, warn: 3, error: 4 })

module.exports = logger