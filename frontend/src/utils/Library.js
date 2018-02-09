const moment = require('moment')

exports.msToHumanReadable = function (time) {
	return moment(time).format('HH:mm:ss.SSS')
}

exports.timeToHumanReadable = function (time) {
	return moment(time).format('DD/MM/YYYY HH:mm:ss')
}

exports.timeDiffNow = (timeToDiff) => {
	return moment.utc(moment(new Date()).diff(moment(timeToDiff))).format('HH:mm:ss')
}