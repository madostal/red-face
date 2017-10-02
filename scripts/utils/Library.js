var request = require('request');

/**
 * Return actual mysql TIMESTAMP
 *
 * @return {String} actual mysql TIMESTAMP
 */
exports.getMySQLTime = function () {
    return (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace("T", " ");
};

/**
 * Return random string in range
 *
 * default range: 5
 *
 * @return {String} text in your range
 */
exports.getRandomTextInRange = function (range = 5) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < range; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

/**
 * Check if URL exist using send request to url - can be used to validat url
 *
 */
exports.urlExists = function (url, cb) {
    request({ url: url, method: 'HEAD' }, function (err, res) {
        if (err) {
            return cb(null, false)
        };
        cb(null, /4\d\d/.test(res.statusCode) === false);
    });
}