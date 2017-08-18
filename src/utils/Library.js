
var sliceNumber = function (num, pos) {
    return ("0" + num).slice(-pos);
}

var mySQLDateToHumanReadable = function (mysqlDateTimeStamp) {
    var date = new Date(mysqlDateTimeStamp);

    var month = date.getMonth();
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    return hour + ":" + min + ":" + sec + " " + day + "." + month + "." + date.getFullYear();
}

var msToHumanReadable = function (time) {
    var millis = time % 1000;
    time = parseInt(time / 1000);
    var seconds = time % 60;
    time = parseInt(time / 60);
    var minutes = time % 60;
    time = parseInt(time / 60);
    var hours = time % 24;
    var out = "";
    if (hours && hours > 0) out += hours + " " + ((hours === 1) ? "hr" : "hrs") + " ";
    if (minutes && minutes > 0) out += sliceNumber(minutes, 2) + " " + ((minutes === 1) ? "min" : "mins") + " ";
    if (seconds && seconds > 0) out += sliceNumber(seconds, 2) + " " + ((seconds === 1) ? "sec" : "secs") + " ";
    if (millis && millis > 0) out += sliceNumber(millis, 3) + " " + ((millis === 1) ? "msec" : "msecs") + " ";
    return out.trim();
}

module.exports = {
    mySQLDateToHumanReadable,
    msToHumanReadable
}