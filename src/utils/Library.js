var moment = require('moment');
// require("moment-duration-format");

var msToHumanReadable = function (time) {
    return moment.utc(time).format('HH:mm:ss.SSS');
};

module.exports = {
    msToHumanReadable
};