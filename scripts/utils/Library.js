/**
 * Return actual mysql TIMESTAMP
 * 
 * @return {String} actual mysql TIMESTAMP
 */
getMySQLTime = function () {
    return (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Return random string in range
 * 
 * default range: 5
 * 
 * @return {String} text in your range
 */
getRandomTextInRange = function (range = 5) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < range; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

module.exports =
    {
        getMySQLTime,
        getRandomTextInRange
    }