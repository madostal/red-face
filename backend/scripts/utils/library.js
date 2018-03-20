const request = require('request')
const moment = require('moment')

/**
 * Return actual mysql TIMESTAMP
 *
 * @return {String} actual mysql TIMESTAMP
 */
exports.getMySQLTime = () => {
	return moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * Return random string in range
 *
 * default range: 5
 *
 * @return {String} text in your range
 */
exports.getRandomTextInRange = (range = 5) => {
	let text = ''
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	for (let i = 0; i < range; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

/**
 * Check if URL exist using send request to url - can be used to validat url
 *
 */
exports.urlExists = (url, cb) => {
	request({ url: url, method: 'HEAD' }, (err, res) => {
		if (err) {
			return cb(null, false)
		}
		cb(null, /4\d\d/.test(res.statusCode) === false)
	})
}

/**
 * Return diff time with actual time and input time
 *
 * @param {Date} timeToDiff
 */
exports.timeDiffNow = (timeToDiff) => {
	return moment.utc(moment(new Date()).diff(moment(timeToDiff))).format('HH:mm:ss')
}