var moment = require('moment');
// require("moment-duration-format");

var msToHumanReadable = function (time) {
    return moment(time).format('HH:mm:ss.SSS');
};

var timeToHumanReadable = function (time) {
    return moment(time).format('DD/MM/YYYY HH:mm:ss');
}

var timeDiffNow = function (timeToDiff) {
    return moment.utc(moment(new Date()).diff(moment(timeToDiff))).format("HH:mm:ss");    
}

module.exports = {
    msToHumanReadable,
    timeToHumanReadable,
    timeDiffNow
};